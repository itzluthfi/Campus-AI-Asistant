import { MockDatabase, UserSession, Attendance } from "../types";

// ============================================================================
// OPSI 1: MOCK ENGINE (READ OPERATIONS)
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
  const PUBLIC_TABLES = ['courses', 'facilities', 'admissions', 'scholarships', 'organizations'];
  const SENSITIVE_TABLES = ['employees', 'salaries', 'students', 'grades', 'tuition_payments', 'lecturers', 'attendance'];

  const role = user ? user.role : 'guest';

  // Validasi Role
  if (role === 'guest' && SENSITIVE_TABLES.includes(tableName)) {
    return [{ error: `ACCESS_DENIED: User Guest tidak memiliki izin akses ke tabel '${tableName}'. Silakan Login.` }];
  }
  if (role === 'student' && ['employees', 'salaries', 'attendance'].includes(tableName)) {
    return [{ error: `ACCESS_DENIED: Mahasiswa tidak memiliki izin akses ke data Kepegawaian.` }];
  }
  // --- END SECURITY LAYER ---

  const tableData = (db as any)[tableName] as any[];
  const SAFETY_LIMIT = 100; 

  try {
    let wherePart = "";
    if (lowerQuery.includes('where')) {
       wherePart = lowerQuery.split('where')[1].trim();
       if (wherePart.includes('limit')) wherePart = wherePart.split('limit')[0].trim();
       if (wherePart.includes('order by')) wherePart = wherePart.split('order by')[0].trim();
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
          if (cond.includes('>')) {
             const [col, valRaw] = cond.split('>');
             const cleanCol = col.trim();
             return Number(item[cleanCol]) > parseFloat(valRaw.trim());
          }
          if (cond.includes('<')) {
             const [col, valRaw] = cond.split('<');
             const cleanCol = col.trim();
             return Number(item[cleanCol]) < parseFloat(valRaw.trim());
          }
          return true;
        });
      });
    }

    if (lowerQuery.includes('count(*)')) {
      return [{ total_rows: filteredData.length, _info: "Ini adalah hasil hitung (count)." }];
    }

    if (filteredData.length > SAFETY_LIMIT) {
       return [
         { _system_note: `DATA TRUNCATED: Ditemukan ${filteredData.length} baris data. Sistem hanya mengambil ${SAFETY_LIMIT} data teratas.` },
         ...filteredData.slice(0, SAFETY_LIMIT)
       ];
    }

    return filteredData;

  } catch (e) {
    return [{ error: "Gagal memproses filter WHERE. SQL Error." }];
  }
};


// ============================================================================
// OPSI 2: MOCK TRANSACTION ENGINE (WRITE OPERATIONS)
// Fitur Baru: Menangani INSERT/UPDATE Sederhana
// ============================================================================
export const executeMockTransaction = (
  action: 'CLOCK_IN' | 'CLOCK_OUT' | 'UPDATE_PROFILE', 
  params: any, 
  db: MockDatabase, 
  user: UserSession | null
): { status: 'SUCCESS' | 'ERROR', message: string, data?: any } => {
  
  if (!user) {
    return { status: 'ERROR', message: 'Anda harus login untuk melakukan aksi ini.' };
  }

  // --- 1. HANDLING ABSENSI (CLOCK_IN / CLOCK_OUT) ---
  if (action === 'CLOCK_IN' || action === 'CLOCK_OUT') {
    // Corrected check: UserSession cannot have 'guest' role, and !user handles unauthenticated case.
    if (user.role === 'student') {
      return { status: 'ERROR', message: 'Hanya Pegawai/Dosen yang dapat melakukan absensi.' };
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); // HH:MM

    // Cek apakah sudah absen hari ini
    const existingRecord = db.attendance.find(a => a.employee_nik === user.identifier && a.date === todayStr);

    if (action === 'CLOCK_IN') {
      if (existingRecord) {
        return { status: 'ERROR', message: `Anda sudah absen masuk hari ini pada jam ${existingRecord.check_in}.` };
      }
      
      // Simpan Data (INSERT)
      const newRecord: Attendance = {
        id: `ATT-${Date.now()}`,
        employee_nik: user.identifier,
        date: todayStr,
        check_in: nowTime,
        check_out: '-', // Belum pulang
        status: 'HADIR'
      };
      
      // Mutasi DB (In-Memory)
      db.attendance.push(newRecord);
      
      return { 
        status: 'SUCCESS', 
        message: `Berhasil Absen Masuk! \nNIK: ${user.identifier} \nWaktu: ${nowTime} \nTanggal: ${todayStr}`,
        data: newRecord
      };
    }

    if (action === 'CLOCK_OUT') {
      if (!existingRecord) {
        return { status: 'ERROR', message: 'Anda belum absen masuk hari ini. Silakan absen masuk terlebih dahulu.' };
      }
      if (existingRecord.check_out !== '-') {
        return { status: 'ERROR', message: `Anda sudah absen pulang hari ini pada jam ${existingRecord.check_out}.` };
      }

      // Update Data
      existingRecord.check_out = nowTime;

      return {
        status: 'SUCCESS',
        message: `Berhasil Absen Pulang. \nSampai jumpa besok, ${user.name}!`,
        data: existingRecord
      };
    }
  }

  return { status: 'ERROR', message: 'Aksi tidak dikenal.' };
};