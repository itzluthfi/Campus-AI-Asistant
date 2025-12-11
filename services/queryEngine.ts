import { MockDatabase } from "../types";

export const executeMockSQL = (query: string, db: MockDatabase): any[] => {
  // console.log("Executing SQL:", query);
  
  const normalizedQuery = query.trim().replace(/;/g, '');
  const lowerQuery = normalizedQuery.toLowerCase();
  let tableName = '';
  
  // Deteksi tabel
  if (lowerQuery.includes('students')) tableName = 'students';
  else if (lowerQuery.includes('lecturers')) tableName = 'lecturers';
  else if (lowerQuery.includes('courses')) tableName = 'courses';
  else if (lowerQuery.includes('grades')) tableName = 'grades';
  else if (lowerQuery.includes('tuition_payments')) tableName = 'tuition_payments';
  else if (lowerQuery.includes('admissions')) tableName = 'admissions';
  else return [{ error: `Tabel tidak ditemukan dalam query: ${query}` }];

  const tableData = (db as any)[tableName] as any[];
  
  // UPDATE: Limit dinaikkan menjadi 100 sesuai permintaan
  const SAFETY_LIMIT = 100; 

  try {
    // Parsing WHERE clause sederhana
    let wherePart = "";
    if (lowerQuery.includes('where')) {
       wherePart = lowerQuery.split('where')[1].trim();
       if (wherePart.includes('limit')) {
         wherePart = wherePart.split('limit')[0].trim();
       }
    }
    
    let filteredData = tableData;

    if (wherePart) {
      const conditions = wherePart.split(' and ');
      filteredData = tableData.filter(item => {
        return conditions.every(cond => {
          if (cond.includes('like')) {
            const [col, valRaw] = cond.split('like');
            const cleanCol = col.trim();
            const cleanVal = valRaw.trim().replace(/['"%]/g, '');
            return String(item[cleanCol]).toLowerCase().includes(cleanVal.toLowerCase());
          }
          if (cond.includes('=')) {
            const [col, valRaw] = cond.split('=');
            const cleanCol = col.trim();
            const cleanVal = valRaw.trim().replace(/['"]/g, '');
            return String(item[cleanCol]).toLowerCase() === cleanVal.toLowerCase();
          }
          return true;
        });
      });
    }

    // --- FITUR AGGREGATION (COUNT) ---
    if (lowerQuery.includes('count(*)')) {
      return [{ 
        total_rows: filteredData.length,
        _info: "Ini adalah hasil hitung (count). Jangan tampilkan array, cukup sebutkan angkanya."
      }];
    }

    // LOGIKA TRUNCATION
    if (filteredData.length > SAFETY_LIMIT) {
       return [
         { 
           _system_note: `DATA TRUNCATED: Ditemukan ${filteredData.length} baris data. Sistem hanya mengambil ${SAFETY_LIMIT} data teratas. Beri tahu user bahwa data mungkin terpotong.` 
         },
         ...filteredData.slice(0, SAFETY_LIMIT)
       ];
    }

    return filteredData;

  } catch (e) {
    return [{ error: "Gagal memproses filter WHERE. SQL Error." }];
  }
};