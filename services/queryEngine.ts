
import { MockDatabase, UserSession } from "../types";

// ============================================================================
// OPSI 1: MOCK ENGINE (CLIENT SIDE - SAAT INI DIPAKAI)
// Menerjemahkan SQL Query menjadi filter Javascript Array.
// ============================================================================
export const executeMockSQL = (query: string, db: MockDatabase, user: UserSession | null): any[] => {
  const normalizedQuery = query.trim().replace(/;/g, '');
  const lowerQuery = normalizedQuery.toLowerCase();
  let tableName = '';
  
  // Deteksi tabel
  if (lowerQuery.includes('students')) tableName = 'students';
  else if (lowerQuery.includes('lecturers')) tableName = 'lecturers';
  else if (lowerQuery.includes('employees')) tableName = 'employees';
  else if (lowerQuery.includes('courses')) tableName = 'courses';
  else if (lowerQuery.includes('grades')) tableName = 'grades';
  else if (lowerQuery.includes('tuition_payments')) tableName = 'tuition_payments';
  else if (lowerQuery.includes('admissions')) tableName = 'admissions';
  else if (lowerQuery.includes('salaries')) tableName = 'salaries';
  else if (lowerQuery.includes('attendance')) tableName = 'attendance';
  else if (lowerQuery.includes('facilities')) tableName = 'facilities';
  else if (lowerQuery.includes('scholarships')) tableName = 'scholarships';
  else if (lowerQuery.includes('organizations')) tableName = 'organizations';
  else return [{ error: `Tabel tidak ditemukan dalam query: ${query}` }];

  // --- SECURITY LAYER (MOCK FIREWALL) ---
  // Mencegah Guest mengambil data sensitif meskipun AI "tertipu" untuk melakukan query.
  
  const PUBLIC_TABLES = ['courses', 'facilities', 'admissions', 'scholarships', 'organizations'];
  const SENSITIVE_TABLES = ['employees', 'salaries', 'students', 'grades', 'tuition_payments', 'lecturers', 'attendance'];

  const role = user ? user.role : 'guest';

  if (role === 'guest') {
    if (SENSITIVE_TABLES.includes(tableName)) {
      return [{ 
        error: `ACCESS_DENIED: User Guest tidak memiliki izin akses ke tabel '${tableName}'. Silakan Login.` 
      }];
    }
  }

  // Khusus Student tidak boleh akses data Gaji/Pegawai
  if (role === 'student') {
    if (['employees', 'salaries', 'attendance'].includes(tableName)) {
      return [{ 
        error: `ACCESS_DENIED: Mahasiswa tidak memiliki izin akses ke data Kepegawaian.` 
      }];
    }
  }

  // --- END SECURITY LAYER ---

  const tableData = (db as any)[tableName] as any[];
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
          // Handling numeric comparison for GPA or Amount
          if (cond.includes('>')) {
             const [col, valRaw] = cond.split('>');
             const cleanCol = col.trim();
             const cleanVal = parseFloat(valRaw.trim());
             return Number(item[cleanCol]) > cleanVal;
          }
          if (cond.includes('<')) {
             const [col, valRaw] = cond.split('<');
             const cleanCol = col.trim();
             const cleanVal = parseFloat(valRaw.trim());
             return Number(item[cleanCol]) < cleanVal;
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
           _system_note: `DATA TRUNCATED: Ditemukan ${filteredData.length} baris data. Sistem hanya mengambil ${SAFETY_LIMIT} data teratas.` 
         },
         ...filteredData.slice(0, SAFETY_LIMIT)
       ];
    }

    return filteredData;

  } catch (e) {
    return [{ error: "Gagal memproses filter WHERE. SQL Error." }];
  }
};
