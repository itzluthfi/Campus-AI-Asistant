
import { MockDatabase, Student, Lecturer, Course, Grade, TuitionPayment, Admin, AdmissionInfo, Employee, Salary, Attendance, Facility, Scholarship, Organization } from '../types';

const MAJORS = ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Elektro', 'Manajemen Bisnis'];
const FIRST_NAMES = ['Budi', 'Siti', 'Rizky', 'Dewi', 'Andi', 'Rina', 'Bayu', 'Putri', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko', 'Mega', 'Sari', 'Tono'];
const LAST_NAMES = ['Santoso', 'Aminah', 'Pratama', 'Lestari', 'Kusuma', 'Wahyuni', 'Saputra', 'Wijaya', 'Nugroho', 'Hidayat', 'Utami', 'Siregar', 'Subagyo', 'Winata', 'Halim'];
const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar', 'Yogyakarta', 'Semarang', 'Denpasar', 'Palembang', 'Malang', 'Bekasi', 'Depok', 'Bogor', 'Tangerang', 'Solo'];

const COURSE_NAMES = [
  'Pemrograman Web', 'Basis Data', 'Kecerdasan Buatan', 'Algoritma', 'Struktur Data', 
  'Jaringan Komputer', 'Sistem Operasi', 'Matematika Diskrit', 'Statistika', 'Etika Profesi',
  'Pengembangan Mobile', 'Cloud Computing', 'Keamanan Siber', 'Internet of Things', 
  'Manajemen Proyek', 'Kewirausahaan', 'Data Mining', 'Machine Learning'
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
  const scholarships: Scholarship[] = [];
  const organizations: Organization[] = [];

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
  for (let i = 1; i <= 20; i++) {
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

  // 3. Generate Employees
  const employeeRoles = ['Staff Keuangan', 'Staff Admin Prodi', 'Teknisi Lab', 'Satpam', 'Petugas Perpustakaan', 'Office Boy'];
  for (let i = 1; i <= 15; i++) {
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

    ['Januari', 'Februari', 'Maret'].forEach((month, idx) => {
      const basic = getRandomInt(3000000, 6000000);
      const allow = getRandomInt(500000, 2000000);
      salaries.push({
        id: `SAL${i}-${idx}`,
        employee_nik: nik,
        month: `${month} 2024`,
        basic_salary: basic,
        allowance: allow,
        deduction: 150000, 
        total: basic + allow - 150000,
        status: 'DIBAYARKAN'
      });
    });
  }

  // 4. Generate Facilities
  facilities.push(
    { id: 'F1', code: 'G-A', name: 'Gedung A (Rektorat)', type: 'GEDUNG', location_desc: 'Gerbang Utama, Selatan Masjid', capacity: 500 },
    { id: 'F2', code: 'G-B', name: 'Gedung B (Fakultas Teknik)', type: 'GEDUNG', location_desc: 'Sebelah Perpustakaan', capacity: 1000 },
    { id: 'F3', code: 'LAB-KOM', name: 'Lab Komputer Dasar', type: 'LAB', location_desc: 'Gedung B Lantai 3', capacity: 40 },
    { id: 'F4', code: 'PERPUS', name: 'Perpustakaan Pusat', type: 'FASILITAS UMUM', location_desc: 'Tengah Kampus', capacity: 200 },
    { id: 'F5', code: 'KANTIN', name: 'Kantin Robotik', type: 'FASILITAS UMUM', location_desc: 'Belakang Gedung B', capacity: 150 },
    { id: 'F6', code: 'AUDIT', name: 'Auditorium Utama', type: 'RUANG KELAS', location_desc: 'Gedung A Lantai 1', capacity: 300 },
    { id: 'F7', code: 'SC', name: 'Student Center', type: 'FASILITAS UMUM', location_desc: 'Sebelah Kantin', capacity: 200 },
    { id: 'F8', code: 'KLINIK', name: 'Klinik Kampus', type: 'FASILITAS UMUM', location_desc: 'Gedung A Lantai Dasar', capacity: 10 }
  );

  // 5. Generate Scholarships
  scholarships.push(
    { id: 'SCH1', name: 'Beasiswa Unggulan', provider: 'Kemdikbud', amount: 5000000, min_gpa: 3.5, status: 'OPEN', quota: 50 },
    { id: 'SCH2', name: 'Beasiswa Djarum Plus', provider: 'Djarum Foundation', amount: 3000000, min_gpa: 3.25, status: 'CLOSED', quota: 20 },
    { id: 'SCH3', name: 'Beasiswa Alumni', provider: 'Yayasan Alumni UTMD', amount: 2000000, min_gpa: 3.0, status: 'OPEN', quota: 100 },
    { id: 'SCH4', name: 'Beasiswa Kurang Mampu', provider: 'Kampus', amount: 4000000, min_gpa: 2.75, status: 'OPEN', quota: 200 }
  );

  // 6. Generate Organizations
  organizations.push(
    { id: 'ORG1', name: 'BEM Universitas', category: 'Akademik', chairman: 'Budi Santoso', description: 'Badan Eksekutif Mahasiswa Tingkat Universitas' },
    { id: 'ORG2', name: 'UKM Robotik', category: 'Akademik', chairman: 'Rizky Pratama', description: 'Komunitas pecinta robotika dan AI' },
    { id: 'ORG3', name: 'UKM Futsal', category: 'Olahraga', chairman: 'Dimas Anggara', description: 'Tim Futsal kebanggaan kampus' },
    { id: 'ORG4', name: 'Paduan Suara', category: 'Seni', chairman: 'Siti Aminah', description: 'Kelompok paduan suara mahasiswa' },
    { id: 'ORG5', name: 'Mapala (Pecinta Alam)', category: 'Sosial', chairman: 'Bayu Skak', description: 'Kegiatan outdoor dan pelestarian alam' }
  );

  // 7. Generate Courses
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

  // 8. Generate Students (Expanded to 300)
  for (let i = 1; i <= 300; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const nim = `2024${i.toString().padStart(3, '0')}`;
    const semester = getRandomInt(1, 8);
    const major = getRandomElement(MAJORS);
    
    // Logic: IPK related to semester slightly random
    const gpa = parseFloat((Math.random() * (4.0 - 2.0) + 2.0).toFixed(2));

    students.push({
      id: `S${i}`,
      nim: nim,
      name: `${firstName} ${lastName}`,
      password: '123',
      major: major,
      semester: semester,
      gpa: gpa,
      email: `${firstName.toLowerCase()}.${nim}@student.univ.ac.id`,
      origin: getRandomElement(CITIES)
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
      const status = isCurrentSemester ? getRandomElement(['LUNAS', 'BELUM LUNAS', 'MENUNGGU KONFIRMASI']) : 'LUNAS';
      // UKT varies by Major (logic simulasi)
      let ukt = 4000000;
      if (major.includes('Teknik')) ukt = 5000000;
      if (major.includes('Sistem')) ukt = 4500000;

      tuition_payments.push({
        id: `T${tuition_payments.length + 1}`,
        student_nim: nim,
        semester: s,
        amount: ukt,
        status: status,
        due_date: new Date(2024, (s * 6) % 12, 10).toISOString().split('T')[0],
        paid_date: status === 'LUNAS' ? new Date(2024, (s * 6) % 12, 5).toISOString().split('T')[0] : undefined
      });
    }
  }

  return { students, lecturers, admins, employees, courses, grades, tuition_payments, admissions, salaries, attendance, facilities, scholarships, organizations };
};
