import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { MockDatabase, UserSession, ChartData } from "../types";
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
  description: "Menampilkan grafik visual (Bar Chart) ke user. Gunakan ini untuk pertanyaan statistik.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Judul Grafik" },
      type: { type: Type.STRING, enum: ["bar", "pie"], description: "Jenis grafik" },
      labels: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Label untuk sumbu X (Kategori)"
      },
      values: { 
        type: Type.ARRAY, 
        items: { type: Type.NUMBER },
        description: "Nilai data untuk sumbu Y (Angka)"
      }
    },
    required: ["title", "labels", "values", "type"],
  },
};

export const generateAIResponse = async (
  prompt: string,
  databaseContext: MockDatabase,
  chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  user: UserSession | null,
  imageBase64?: string,
  onLogUpdate?: (log: string) => void // Callback untuk update UI logs
): Promise<{ text: string; chart?: ChartData; logs: string[] }> => {
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
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: personalizedInstruction,
        temperature: 0.2, // Lebih rendah agar lebih presisi baca data/gambar
        tools: [{ functionDeclarations: [sqlToolDeclaration, chartToolDeclaration] }], 
      },
      history: chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }))
    });

    // Message Payload
    let messagePayload: any = { text: prompt };
    if (imageBase64) {
      addLog("Menganalisis gambar (OCR & Vision)...");
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const data = imageBase64.split(",")[1];
      messagePayload = [
        { text: prompt || "Analisis gambar ini dan ekstrak informasinya." },
        { inlineData: { mimeType, data } }
      ];
    } else {
      addLog("Memproses input teks...");
    }

    // Step 1: Initial Request
    let response = await chat.sendMessage({ message: messagePayload });
    let finalChartData: ChartData | undefined = undefined;

    // Multi-step Loop
    let maxSteps = 5;
    while (response.functionCalls && response.functionCalls.length > 0 && maxSteps > 0) {
      maxSteps--;
      const functionResponses = [];

      for (const call of response.functionCalls) {
        if (call.name === 'execute_sql_query') {
          const sqlQuery = (call.args as any).query;
          addLog(`Mengeksekusi Query Database: ${sqlQuery}`);
          
          const sqlResult = executeMockSQL(sqlQuery, databaseContext);
          addLog(`Hasil Query: ${JSON.stringify(sqlResult).substring(0, 50)}...`);

          functionResponses.push({
            functionResponse: {
              name: 'execute_sql_query',
              id: call.id,
              response: { result: sqlResult }
            }
          });
        } 
        else if (call.name === 'render_chart') {
          addLog("Membuat Visualisasi Grafik...");
          finalChartData = call.args as unknown as ChartData;
          
          // Return success to AI so it can wrap up the text
          functionResponses.push({
            functionResponse: {
              name: 'render_chart',
              id: call.id,
              response: { status: "Chart rendered successfully on frontend." }
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
      text: response.text || "Tidak ada respon teks.",
      chart: finalChartData,
      logs: logs
    };

  } catch (error: any) {
    addLog(`Error Sistem: ${error.message}`);
    console.error("Gemini Error:", error);
    return { text: `Maaf, terjadi kesalahan: ${error.message}`, logs };
  }
};