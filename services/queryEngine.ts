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

  // --- SECURITY LAYER 1: TABLE LEVEL ACCESS CONTROL ---
  const PUBLIC_TABLES = ['courses', 'facilities', 'admissions', 'scholarships', 'organizations'];
  const SENSITIVE_TABLES = ['employees', 'salaries', 'students', 'grades', 'tuition_payments', 'lecturers', 'attendance'];

  const role = user ? user.role : 'guest';
  const userId = user ? user.identifier : null;

  // 1. Guest Restrictions
  if (role === 'guest' && SENSITIVE_TABLES.includes(tableName)) {
    return [{ error: `ACCESS_DENIED: User Guest tidak memiliki izin akses ke tabel '${tableName}'. Silakan Login.` }];
  }

  // 2. Student Restrictions
  if (role === 'student' && ['employees', 'salaries', 'attendance'].includes(tableName)) {
    return [{ error: `ACCESS_DENIED: Mahasiswa tidak memiliki izin akses ke data Kepegawaian (HR).` }];
  }

  // 3. Employee Restrictions (Cannot see student financial data/grades directly usually, unless academic staff, but kept simple here)
  // (Optional: Add specific restrictions for employees viewing student data if needed)

  // --- END SECURITY LAYER 1 ---

  const tableData = (db as any)[tableName] as any[];
  const SAFETY_LIMIT = 100; 

  // --- SECURITY LAYER 2: ROW LEVEL SECURITY (RLS) ---
  // Filter data SEBELUM query diproses (WHERE clause user).
  // Ini memastikan user tidak bisa "mengakali" WHERE clause untuk melihat data orang lain.
  
  let rlsFilteredData = tableData;

  if (role !== 'admin') {
    // A. Aturan untuk Mahasiswa
    if (role === 'student') {
      if (tableName === 'grades') {
        // Mahasiswa HANYA boleh melihat nilai miliknya sendiri
        rlsFilteredData = tableData.filter(row => row.student_nim === userId);
      }
      if (tableName === 'tuition_payments') {
        // Mahasiswa HANYA boleh melihat SPP miliknya sendiri
        rlsFilteredData = tableData.filter(row => row.student_nim === userId);
      }
      // Note: Tabel 'students' dibiarkan terbuka sebagai direktori teman, tapi password akan dimask.
    }

    // B. Aturan untuk Pegawai & Dosen
    if (role === 'employee' || role === 'lecturer') {
      if (tableName === 'salaries') {
        // Pegawai HANYA boleh melihat gaji miliknya sendiri
        rlsFilteredData = tableData.filter(row => row.employee_nik === userId);
      }
      if (tableName === 'attendance') {
        // Pegawai HANYA boleh melihat absensi miliknya sendiri
        rlsFilteredData = tableData.filter(row => row.employee_nik === userId);
      }
    }
  }
  // --- END SECURITY LAYER 2 ---

  try {
    let wherePart = "";
    if (lowerQuery.includes('where')) {
       wherePart = lowerQuery.split('where')[1].trim();
       if (wherePart.includes('limit')) wherePart = wherePart.split('limit')[0].trim();
       if (wherePart.includes('order by')) wherePart = wherePart.split('order by')[0].trim();
    }
    
    // Gunakan data yang SUDAH difilter oleh RLS
    let queryResult = rlsFilteredData;

    if (wherePart) {
      const conditions = wherePart.split(' and ');
      queryResult = rlsFilteredData.filter(item => {
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
      return [{ total_rows: queryResult.length, _info: "Ini adalah hasil hitung (count) setelah filter keamanan." }];
    }

    // --- SECURITY LAYER 3: COLUMN MASKING (PRIVACY) ---
    // Menyensor kolom sensitif sebelum data dikembalikan ke user
    
    const finalData = queryResult.map((row: any) => {
      // Clone object agar tidak mengubah database asli (pass by reference issue)
      const safeRow = { ...row };

      if (role !== 'admin') {
        // 1. Masking Password (SELALU)
        if (safeRow.password) safeRow.password = '********';

        // 2. Masking Gaji di tabel Employees (Jika ada field gaji di profile, meski di sini dipisah ke tabel salaries)
        // Di tabel salaries sudah di-handle oleh RLS (hanya milik sendiri), jadi aman.

        // 3. Masking Data Pribadi Lain jika melihat direktori orang lain
        if (tableName === 'students' && safeRow.nim !== userId) {
           // Misal: menyembunyikan alamat lengkap atau no hp jika ada
        }
      }
      return safeRow;
    });
    // --- END SECURITY LAYER 3 ---

    if (finalData.length > SAFETY_LIMIT) {
       return [
         { _system_note: `DATA TRUNCATED: Ditemukan ${finalData.length} baris data. Sistem hanya mengambil ${SAFETY_LIMIT} data teratas.` },
         ...finalData.slice(0, SAFETY_LIMIT)
       ];
    }

    return finalData;

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