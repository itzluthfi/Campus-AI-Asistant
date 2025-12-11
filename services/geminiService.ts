
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { MockDatabase, UserSession, ChartData, GeneratedFile } from "../types";
import { SYSTEM_INSTRUCTION_TEMPLATE } from "../constants";
import { executeMockSQL } from "./queryEngine";

const sqlToolDeclaration: FunctionDeclaration = {
  name: "execute_sql_query",
  description: "Menjalankan query SQL SELECT. Gunakan untuk mengambil data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Query SQL standard.",
      },
    },
    required: ["query"],
  },
};

const chartToolDeclaration: FunctionDeclaration = {
  name: "render_chart",
  description: "Menampilkan grafik visual atau diagram. Gunakan ini untuk pertanyaan statistik atau alur proses.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Judul Grafik" },
      type: { type: Type.STRING, enum: ["bar", "pie", "flowchart"], description: "Jenis visualisasi. Gunakan 'flowchart' untuk diagram alur/langkah." },
      labels: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Label untuk sumbu X (Kategori) atau Langkah Diagram"
      },
      values: { 
        type: Type.ARRAY, 
        items: { type: Type.NUMBER },
        description: "Nilai data untuk sumbu Y (Angka). Kosongkan jika type='flowchart'."
      },
      steps: {
         type: Type.ARRAY,
         items: { type: Type.STRING },
         description: "Deskripsi detail untuk flowchart. Gunakan ini jika type='flowchart'."
      }
    },
    required: ["title", "type"],
  },
};

const fileToolDeclaration: FunctionDeclaration = {
  name: "create_file",
  description: "Membuat file unduhan (Excel/CSV/Laporan) untuk user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filename: { type: Type.STRING, description: "Nama file beserta ekstensinya (contoh: data_mahasiswa.csv)" },
      content: { type: Type.STRING, description: "Isi file. Jika CSV, pastikan format comma-separated valuenya benar." },
      mimeType: { type: Type.STRING, enum: ["text/csv", "text/plain", "text/markdown", "application/json"], description: "Tipe MIME file." }
    },
    required: ["filename", "content", "mimeType"],
  },
};

export const generateAIResponse = async (
  prompt: string,
  databaseContext: MockDatabase,
  chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  user: UserSession | null,
  fileData?: { data: string; mimeType: string }, // Updated to generic file
  onLogUpdate?: (log: string) => void
): Promise<{ text: string; chart?: ChartData; file?: GeneratedFile; logs: string[] }> => {
  const logs: string[] = [];
  const addLog = (msg: string) => {
    console.log(`[AI] ${msg}`);
    logs.push(msg);
    if (onLogUpdate) onLogUpdate(msg);
  };

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return { text: "Error: API Key tidak ditemukan.", logs };

    const ai = new GoogleGenAI({ apiKey });

    // Context Setup
    const userName = user ? user.name : "Tamu";
    const userRole = user ? user.role.toUpperCase() : "GUEST";
    const userId = user ? user.identifier : "N/A";

    let personalizedInstruction = SYSTEM_INSTRUCTION_TEMPLATE
      .replace(/{CURRENT_USER_NAME}/g, userName)
      .replace(/{CURRENT_USER_ROLE}/g, userRole)
      .replace(/{CURRENT_USER_ID}/g, userId);
    
    personalizedInstruction += `\n[WAKTU SAAT INI]\n${new Date().toLocaleString('id-ID')}\n`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash', // Supports PDF and Multimodal
      config: {
        systemInstruction: personalizedInstruction,
        temperature: 0.2, 
        tools: [{ functionDeclarations: [sqlToolDeclaration, chartToolDeclaration, fileToolDeclaration] }], 
      },
      history: chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }))
    });

    // Message Payload
    let messagePayload: any[] = [{ text: prompt }];
    
    if (fileData) {
      addLog(`Menganalisis file: ${fileData.mimeType}...`);
      const base64Clean = fileData.data.split(",")[1];
      messagePayload.push({ 
        inlineData: { 
          mimeType: fileData.mimeType, 
          data: base64Clean 
        } 
      });
      // Jika prompt kosong saat upload file, beri prompt default
      if (!prompt.trim()) {
        messagePayload[0].text = "Analisis file ini dan buat rangkuman singkat.";
      }
    } else {
      addLog("Memproses input teks...");
    }

    // Step 1: Initial Request
    let response = await chat.sendMessage({ message: messagePayload });
    let finalChartData: ChartData | undefined = undefined;
    let finalFileData: GeneratedFile | undefined = undefined;

    // Multi-step Loop
    let maxSteps = 5;
    while (response.functionCalls && response.functionCalls.length > 0 && maxSteps > 0) {
      maxSteps--;
      const functionResponses = [];

      for (const call of response.functionCalls) {
        if (call.name === 'execute_sql_query') {
          const sqlQuery = (call.args as any).query;
          addLog(`Mengeksekusi Query Database: ${sqlQuery}`);
          
          // PASSING USER KE ENGINE UNTUK VALIDASI
          const sqlResult = executeMockSQL(sqlQuery, databaseContext, user);
          
          // Jika access denied, log errornya
          if (sqlResult[0]?.error && sqlResult[0].error.includes("ACCESS_DENIED")) {
             addLog(`⛔ BLOCKED: ${sqlResult[0].error}`);
          } else {
             addLog(`Hasil Query: ${JSON.stringify(sqlResult).substring(0, 50)}...`);
          }

          functionResponses.push({
            functionResponse: {
              name: 'execute_sql_query',
              id: call.id,
              response: { result: sqlResult }
            }
          });
        } 
        else if (call.name === 'render_chart') {
          addLog("Membuat Visualisasi Grafik/Diagram...");
          const args = call.args as any;
          
          // Normalisasi data chart
          finalChartData = {
            title: args.title,
            type: args.type,
            labels: args.labels || [],
            values: args.values || [],
            steps: args.steps || args.labels // Fallback for flowchart
          };
          
          functionResponses.push({
            functionResponse: {
              name: 'render_chart',
              id: call.id,
              response: { status: "Chart/Diagram rendered successfully on frontend." }
            }
          });
        }
        else if (call.name === 'create_file') {
          // CEK ROLE JUGA UNTUK CREATE FILE
          if (!user && (call.args as any).filename.includes("karyawan")) {
             // Basic heuristic block for creating sensitive files
             // Tapi logic utamanya sudah di block di execute_sql_query. 
             // Kalau SQL nya gagal, dia ga akan punya data buat create file.
          }

          addLog("Membuat File Unduhan...");
          finalFileData = call.args as unknown as GeneratedFile;
          
          functionResponses.push({
            functionResponse: {
              name: 'create_file',
              id: call.id,
              response: { status: "File created successfully." }
            }
          });
        }
      }

      if (functionResponses.length > 0) {
        response = await chat.sendMessage({ message: functionResponses });
      }
    }

    addLog("Menyusun jawaban akhir...");
    return {
      text: response.text || "Berikut hasilnya.",
      chart: finalChartData,
      file: finalFileData,
      logs: logs
    };

  } catch (error: any) {
    addLog(`Error Sistem: ${error.message}`);
    console.error("Gemini Error:", error);
    return { text: `Maaf, terjadi kesalahan: ${error.message}`, logs };
  }
};
