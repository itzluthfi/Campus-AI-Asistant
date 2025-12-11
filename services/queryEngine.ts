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

  // --- END SECURITY LAYER 1 ---

  const tableData = (db as any)[tableName] as any[];
  const SAFETY_LIMIT = 100; 

  // --- SECURITY LAYER 2: ROW LEVEL SECURITY (RLS) ---
  
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

    // --- ENRICHMENT LAYER (VIRTUAL JOINS) ---
    // Agar report PDF memiliki Nama, bukan cuma ID/NIK.
    
    queryResult = queryResult.map((row: any) => {
       const enriched = { ...row };
       
       // Join Salaries -> Employee Name
       if (tableName === 'salaries') {
         const emp = db.employees.find(e => e.nik === row.employee_nik);
         if (emp) {
            enriched['nama_pegawai'] = emp.name;
            enriched['jabatan'] = emp.position;
         }
       }
       
       // Join Attendance -> Employee Name
       if (tableName === 'attendance') {
         const emp = db.employees.find(e => e.nik === row.employee_nik);
         if (emp) enriched['nama_pegawai'] = emp.name;
       }

       // Join Grades -> Course Name & Student Name (For Admin/Lecturer)
       if (tableName === 'grades') {
          const course = db.courses.find(c => c.code === row.course_code);
          if (course) enriched['mata_kuliah'] = course.name;
          
          if (role !== 'student') {
             const std = db.students.find(s => s.nim === row.student_nim);
             if (std) enriched['nama_mahasiswa'] = std.name;
          }
       }

       return enriched;
    });

    // --- SECURITY LAYER 3: COLUMN MASKING (PRIVACY) ---
    const finalData = queryResult.map((row: any) => {
      const safeRow = { ...row };

      if (role !== 'admin') {
        if (safeRow.password) safeRow.password = '********';
        
        // Masking Data Pribadi Lain jika melihat direktori orang lain
        if (tableName === 'students' && safeRow.nim !== userId) {
           // Masking sensitive details
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
    if (user.role === 'student') {
      return { status: 'ERROR', message: 'Hanya Pegawai/Dosen yang dapat melakukan absensi.' };
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); // HH:MM

    const existingRecord = db.attendance.find(a => a.employee_nik === user.identifier && a.date === todayStr);

    if (action === 'CLOCK_IN') {
      if (existingRecord) {
        return { status: 'ERROR', message: `Anda sudah absen masuk hari ini pada jam ${existingRecord.check_in}.` };
      }
      
      const newRecord: Attendance = {
        id: `ATT-${Date.now()}`,
        employee_nik: user.identifier,
        date: todayStr,
        check_in: nowTime,
        check_out: '-', 
        status: 'HADIR'
      };
      
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