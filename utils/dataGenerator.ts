import { MockDatabase, Student, Lecturer, Course, Grade, TuitionPayment, Admin, AdmissionInfo, Employee, Salary, Attendance, Facility } from '../types';

const MAJORS = ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Elektro', 'Manajemen Bisnis'];
const FIRST_NAMES = ['Budi', 'Siti', 'Rizky', 'Dewi', 'Andi', 'Rina', 'Bayu', 'Putri', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hendra', 'Indah'];
const LAST_NAMES = ['Santoso', 'Aminah', 'Pratama', 'Lestari', 'Kusuma', 'Wahyuni', 'Saputra', 'Wijaya', 'Nugroho', 'Hidayat', 'Utami', 'Siregar'];
const COURSE_NAMES = [
  'Pemrograman Web', 'Basis Data', 'Kecerdasan Buatan', 'Algoritma', 'Struktur Data', 
  'Jaringan Komputer', 'Sistem Operasi', 'Matematika Diskrit', 'Statistika', 'Etika Profesi',
  'Pengembangan Mobile', 'Cloud Computing', 'Keamanan Siber', 'Internet of Things'
];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockDatabase = (): MockDatabase => {
  const students: Student[] = [];
  const lecturers: Lecturer[] = [];
  const courses: Course[] = [];
  const grades: Grade[] = [];
  const tuition_payments: TuitionPayment[] = [];
  const admins: Admin[] = [];
  const admissions: AdmissionInfo[] = [];
  const employees: Employee[] = [];
  const salaries: Salary[] = [];
  const attendance: Attendance[] = [];
  const facilities: Facility[] = [];

  // 0. Generate Admins
  admins.push({
    id: 'A1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Pusat'
  });

  // 1. Generate Admissions
  admissions.push(
    {
      id: 'PMB1',
      batch_name: 'Gelombang 1 - Jalur Prestasi',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      description: 'Penerimaan mahasiswa baru jalur rapor.',
      requirements: 'Rapor Semester 1-5, Sertifikat Juara',
      status: 'CLOSED'
    },
    {
      id: 'PMB2',
      batch_name: 'Gelombang 2 - Jalur Reguler',
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      description: 'Penerimaan mahasiswa baru jalur tes tulis.',
      requirements: 'Ijazah, Biaya Pendaftaran',
      status: 'OPEN'
    }
  );

  // 2. Generate Lecturers
  for (let i = 1; i <= 15; i++) {
    const name = `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}, M.Kom`;
    lecturers.push({
      id: `L${i}`,
      nip: `1980${getRandomInt(1000, 9999)}`,
      name: name,
      password: 'dosen', 
      department: getRandomElement(MAJORS),
      email: name.toLowerCase().replace(/[^a-z]/g, '') + '@univ.ac.id'
    });
  }

  // 3. Generate Employees (Pegawai Non-Dosen)
  const employeeRoles = ['Staff Keuangan', 'Staff Admin Prodi', 'Teknisi Lab', 'Satpam', 'Petugas Perpustakaan'];
  for (let i = 1; i <= 10; i++) {
    const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
    const nik = `PEG${i.toString().padStart(3, '0')}`;
    employees.push({
      id: `E${i}`,
      nik: nik,
      name: name,
      password: '123',
      position: getRandomElement(employeeRoles),
      email: `${name.split(' ')[0].toLowerCase()}@staff.univ.ac.id`
    });

    // Generate Salary for this employee (Jan - March)
    ['Januari', 'Februari', 'Maret'].forEach((month, idx) => {
      const basic = getRandomInt(3000000, 5000000);
      const allow = getRandomInt(500000, 1500000);
      salaries.push({
        id: `SAL${i}-${idx}`,
        employee_nik: nik,
        month: `${month} 2024`,
        basic_salary: basic,
        allowance: allow,
        deduction: 100000, // BPJS dll
        total: basic + allow - 100000,
        status: 'DIBAYARKAN'
      });
    });

    // Generate Attendance (Last 5 days)
    for (let d = 1; d <= 5; d++) {
      attendance.push({
        id: `ATT${i}-${d}`,
        employee_nik: nik,
        date: `2024-03-0${d}`,
        check_in: `07:${getRandomInt(45, 59)}`,
        check_out: `17:${getRandomInt(0, 30)}`,
        status: 'HADIR'
      });
    }
  }

  // 4. Generate Facilities
  facilities.push(
    { id: 'F1', code: 'G-A', name: 'Gedung A (Rektorat)', type: 'GEDUNG', location_desc: 'Gerbang Utama, Selatan Masjid', capacity: 500 },
    { id: 'F2', code: 'G-B', name: 'Gedung B (Fakultas Teknik)', type: 'GEDUNG', location_desc: 'Sebelah Perpustakaan', capacity: 1000 },
    { id: 'F3', code: 'LAB-KOM', name: 'Lab Komputer Dasar', type: 'LAB', location_desc: 'Gedung B Lantai 3', capacity: 40 },
    { id: 'F4', code: 'PERPUS', name: 'Perpustakaan Pusat', type: 'FASILITAS UMUM', location_desc: 'Tengah Kampus', capacity: 200 },
    { id: 'F5', code: 'KANTIN', name: 'Kantin Robotik', type: 'FASILITAS UMUM', location_desc: 'Belakang Gedung B', capacity: 150 },
    { id: 'F6', code: 'AUDIT', name: 'Auditorium Utama', type: 'RUANG KELAS', location_desc: 'Gedung A Lantai 1', capacity: 300 }
  );

  // 5. Generate Courses
  COURSE_NAMES.forEach((cName, index) => {
    const lecturer = getRandomElement(lecturers);
    const room = getRandomElement(facilities.filter(f => f.type === 'RUANG KELAS' || f.type === 'LAB'));
    courses.push({
      id: `C${index + 1}`,
      code: `TI${100 + index}`,
      name: cName,
      lecturer_nip: lecturer.nip,
      day: getRandomElement(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
      time: `${getRandomInt(7, 16)}:00`,
      room: room ? `${room.code} - ${room.location_desc}` : 'R.101',
      sks: getRandomElement([2, 3, 4])
    });
  });

  // 6. Generate Students
  for (let i = 1; i <= 100; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const nim = `2024${i.toString().padStart(3, '0')}`;
    const semester = getRandomInt(1, 8);
    
    students.push({
      id: `S${i}`,
      nim: nim,
      name: `${firstName} ${lastName}`,
      password: '123',
      major: getRandomElement(MAJORS),
      semester: semester,
      gpa: parseFloat((Math.random() * (4.0 - 2.5) + 2.5).toFixed(2)),
      email: `${firstName.toLowerCase()}.${nim}@student.univ.ac.id`
    });

    // Grades
    const takenCourses = courses.sort(() => 0.5 - Math.random()).slice(0, 5);
    takenCourses.forEach(course => {
      grades.push({
        id: `G${grades.length + 1}`,
        student_nim: nim,
        course_code: course.code,
        grade: getRandomElement(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E']),
        semester: getRandomInt(1, semester)
      });
    });

    // Tuition
    for (let s = 1; s <= semester; s++) {
      const isCurrentSemester = s === semester;
      const status = isCurrentSemester ? getRandomElement(['LUNAS', 'BELUM LUNAS']) : 'LUNAS';
      tuition_payments.push({
        id: `T${tuition_payments.length + 1}`,
        student_nim: nim,
        semester: s,
        amount: 5000000,
        status: status,
        due_date: new Date(2024, (s * 6) % 12, 10).toISOString().split('T')[0],
        paid_date: status === 'LUNAS' ? new Date(2024, (s * 6) % 12, 5).toISOString().split('T')[0] : undefined
      });
    }
  }

  return { students, lecturers, admins, employees, courses, grades, tuition_payments, admissions, salaries, attendance, facilities };
};