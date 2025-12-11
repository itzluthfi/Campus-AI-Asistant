import { MockDatabase } from '../types';
import { executeMockSQL } from './queryEngine';
import { generateAIResponse } from './geminiService';

// Ini mensimulasikan "Public API" yang bisa dikonsumsi project lain
// Project lain cukup menyisipkan script app ini, lalu memanggil window.CampusSDK
// Ini poin plus untuk Skripsi: "Interoperabilitas Sistem"

declare global {
  interface Window {
    CampusSDK: any;
  }
}

export const initializePublicSDK = (db: MockDatabase) => {
  window.CampusSDK = {
    _db: db, // Internal ref (for debug)
    
    // 1. LOW LEVEL API: Query SQL Bebas
    query: (sqlQuery: string, apiKey: string) => {
      // Simulasi API Key Check
      if (apiKey !== 'skripsi-secret-key-2024') {
        return { status: 401, error: 'Unauthorized: Invalid API Key' };
      }
      return {
        status: 200,
        data: executeMockSQL(sqlQuery, db),
        timestamp: new Date().toISOString()
      };
    },

    // 2. HIGH LEVEL API: AI Intelegence (AI as a Service)
    // Fitur ini memungkinkan aplikasi lain menggunakan "Otak" asisten ini
    askAI: async (prompt: string, apiKey: string, userContext?: any) => {
      if (apiKey !== 'skripsi-secret-key-2024') {
        return { status: 401, error: 'Unauthorized: Invalid API Key' };
      }

      console.log("[SDK] External App is asking AI:", prompt);

      try {
        // Simulasi context user dari aplikasi luar
        const mockUser = userContext || { 
          name: "External User", 
          role: "student", 
          identifier: "GUEST-SDK" 
        };

        // Panggil service Gemini yang sama dengan chat app
        const response = await generateAIResponse(
          prompt,
          db,
          [], // No history for single request
          mockUser,
          undefined, // No image support via SDK text-only yet
          (log) => console.log(`[SDK Internal Log]: ${log}`) // Log ke console browser
        );

        return {
          status: 200,
          answer: response.text,
          chart: response.chart || null,
          thinking_logs: response.logs,
          timestamp: new Date().toISOString()
        };

      } catch (error: any) {
        return { status: 500, error: error.message };
      }
    },

    // 3. REST-like wrapper helpers
    getStudentByNIM: (nim: string) => {
      const student = db.students.find(s => s.nim === nim);
      return student 
        ? { status: 200, data: { name: student.name, major: student.major, gpa: student.gpa } }
        : { status: 404, error: 'Student not found' };
    },

    getPublicInfo: () => {
      return {
        status: 200,
        campus: "Universitas Teknologi Masa Depan",
        admissions: db.admissions.filter(a => a.status === 'OPEN')
      };
    },

    // Dokumentasi on-the-fly
    help: () => {
      console.log(`
        📘 CAMPUS PUBLIC SDK DOCUMENTATION
        ==================================
        
        1. Query SQL (Raw Data):
           window.CampusSDK.query("SELECT * FROM courses", "skripsi-secret-key-2024")
           
        2. Ask AI (Reasoning & Analysis):
           await window.CampusSDK.askAI("Berapa rata-rata IPK mahasiswa?", "skripsi-secret-key-2024")
           
        3. Helper Functions:
           window.CampusSDK.getStudentByNIM("2024001")
      `);
      return "Check console for documentation";
    }
  };

  console.log("%c[SDK] Campus Public API Initialized. Type window.CampusSDK.help()", "color: #00ff00; font-weight: bold;");
};