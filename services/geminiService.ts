
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { MockDatabase, UserSession, ChartData, GeneratedFile } from "../types";
import { SYSTEM_INSTRUCTION_TEMPLATE } from "../constants";
import { executeMockSQL, executeMockTransaction } from "./queryEngine";

const sqlToolDeclaration: FunctionDeclaration = {
  name: "execute_sql_query",
  description: "Menjalankan query SQL SELECT. Gunakan untuk mengambil data (Read-Only).",
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

const manageDataToolDeclaration: FunctionDeclaration = {
  name: "manage_data",
  description: "Melakukan operasi perubahan data (INSERT/UPDATE) seperti Absensi atau Update Profil.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { 
        type: Type.STRING, 
        enum: ["CLOCK_IN", "CLOCK_OUT", "UPDATE_PROFILE"],
        description: "Jenis aksi yang dilakukan." 
      },
      parameters: {
        type: Type.OBJECT,
        description: "Parameter tambahan jika diperlukan (misal data baru)",
        properties: {
           notes: { type: Type.STRING }
        }
      }
    },
    required: ["action"],
  },
};

const chartToolDeclaration: FunctionDeclaration = {
  name: "render_chart",
  description: "Menampilkan grafik visual atau diagram.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["bar", "pie", "flowchart"] },
      labels: { type: Type.ARRAY, items: { type: Type.STRING } },
      values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      steps: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "type"],
  },
};

const fileToolDeclaration: FunctionDeclaration = {
  name: "create_file",
  description: "Membuat file unduhan (PDF, Excel/CSV, Word, Laporan).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filename: { type: Type.STRING },
      content: { type: Type.STRING, description: "Isi file. Jika PDF, berikan JSON stringified." },
      mimeType: { 
        type: Type.STRING, 
        enum: ["text/csv", "text/plain", "text/markdown", "application/json", "application/pdf", "application/msword"] 
      }
    },
    required: ["filename", "content", "mimeType"],
  },
};

export const generateAIResponse = async (
  prompt: string,
  databaseContext: MockDatabase,
  chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  user: UserSession | null,
  fileData?: { data: string; mimeType: string }, 
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
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: personalizedInstruction,
        temperature: 0.2, 
        tools: [{ functionDeclarations: [sqlToolDeclaration, manageDataToolDeclaration, chartToolDeclaration, fileToolDeclaration] }], 
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
        // --- HANDLER: READ DATA (SQL) ---
        if (call.name === 'execute_sql_query') {
          const sqlQuery = (call.args as any).query;
          addLog(`🔍 Executing SELECT: ${sqlQuery}`);
          
          const sqlResult = executeMockSQL(sqlQuery, databaseContext, user);
          
          if (sqlResult[0]?.error && sqlResult[0].error.includes("ACCESS_DENIED")) {
             addLog(`⛔ BLOCKED: ${sqlResult[0].error}`);
          } else {
             addLog(`✅ Result: Found ${sqlResult.length} rows`);
          }

          functionResponses.push({
            functionResponse: {
              name: 'execute_sql_query',
              id: call.id,
              response: { result: sqlResult }
            }
          });
        } 
        // --- HANDLER: WRITE DATA (TRANSACTION) ---
        else if (call.name === 'manage_data') {
           const action = (call.args as any).action;
           const params = (call.args as any).parameters;
           addLog(`📝 Executing Transaction: ${action}`);

           const transactionResult = executeMockTransaction(action, params, databaseContext, user);
           
           if (transactionResult.status === 'SUCCESS') {
             addLog(`✅ Success: ${transactionResult.message.split('\n')[0]}`);
           } else {
             addLog(`❌ Failed: ${transactionResult.message}`);
           }

           functionResponses.push({
            functionResponse: {
              name: 'manage_data',
              id: call.id,
              response: { result: transactionResult }
            }
          });
        }
        // --- HANDLER: VISUALIZATION ---
        else if (call.name === 'render_chart') {
          addLog("📊 Rendering Chart...");
          const args = call.args as any;
          
          finalChartData = {
            title: args.title,
            type: args.type,
            labels: args.labels || [],
            values: args.values || [],
            steps: args.steps || args.labels 
          };
          
          functionResponses.push({
            functionResponse: {
              name: 'render_chart',
              id: call.id,
              response: { status: "Chart rendered." }
            }
          });
        }
        // --- HANDLER: FILE CREATION ---
        else if (call.name === 'create_file') {
          addLog("💾 Creating File...");
          finalFileData = call.args as unknown as GeneratedFile;
          
          functionResponses.push({
            functionResponse: {
              name: 'create_file',
              id: call.id,
              response: { status: "File created." }
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