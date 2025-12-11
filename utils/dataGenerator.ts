import { MockDatabase, Student, Lecturer, Course, Grade, TuitionPayment, Admin, AdmissionInfo } from '../types';

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

  // 0. Generate Admins
  admins.push({
    id: 'A1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Pusat'
  });

  // 1. Generate Admissions (Info PMB)
  admissions.push(
    {
      id: 'PMB1',
      batch_name: 'Gelombang 1 - Jalur Prestasi',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      description: 'Penerimaan mahasiswa baru jalur rapor dan prestasi non-akademik.',
      requirements: 'Rapor Semester 1-5, Sertifikat Juara (Opsional), Surat Rekomendasi Sekolah',
      status: 'CLOSED'
    },
    {
      id: 'PMB2',
      batch_name: 'Gelombang 2 - Jalur Reguler',
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      description: 'Penerimaan mahasiswa baru jalur tes tulis komputer (CBT).',
      requirements: 'Ijazah/SKL, Pas Foto, Biaya Pendaftaran Rp 300.000',
      status: 'OPEN'
    },
    {
      id: 'PMB3',
      batch_name: 'Gelombang 3 - Jalur Mandiri',
      start_date: '2024-07-01',
      end_date: '2024-08-15',
      description: 'Penerimaan terakhir untuk kuota tersisa.',
      requirements: 'Ijazah/SKL, Pas Foto, Wawancara',
      status: 'COMING SOON'
    }
  );

  // 2. Generate Lecturers (15 Dosen)
  for (let i = 1; i <= 15; i++) {
    const name = `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}, M.Kom`;
    lecturers.push({
      id: `L${i}`,
      nip: `1980${getRandomInt(1000, 9999)}`,
      name: name,
      password: 'dosen', // Default pass
      department: getRandomElement(MAJORS),
      email: name.toLowerCase().replace(/[^a-z]/g, '') + '@univ.ac.id'
    });
  }

  // 3. Generate Courses (20 Matkul)
  COURSE_NAMES.forEach((cName, index) => {
    const lecturer = getRandomElement(lecturers);
    courses.push({
      id: `C${index + 1}`,
      code: `TI${100 + index}`,
      name: cName,
      lecturer_nip: lecturer.nip,
      day: getRandomElement(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
      time: `${getRandomInt(7, 16)}:00`,
      room: `R.${getRandomInt(101, 405)}`,
      sks: getRandomElement([2, 3, 4])
    });
  });

  // 4. Generate Students (100 Mahasiswa)
  for (let i = 1; i <= 100; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const nim = `2024${i.toString().padStart(3, '0')}`; // 2024001, 2024002...
    const semester = getRandomInt(1, 8);
    
    const student: Student = {
      id: `S${i}`,
      nim: nim,
      name: `${firstName} ${lastName}`,
      password: '123', // Default pass
      major: getRandomElement(MAJORS),
      semester: semester,
      gpa: parseFloat((Math.random() * (4.0 - 2.5) + 2.5).toFixed(2)),
      email: `${firstName.toLowerCase()}.${nim}@student.univ.ac.id`
    };
    students.push(student);

    // 5. Generate Grades for each student
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

    // 6. Generate Tuition Payments
    for (let s = 1; s <= semester; s++) {
      const isCurrentSemester = s === semester;
      const status = isCurrentSemester ? getRandomElement(['LUNAS', 'BELUM LUNAS', 'MENUNGGU KONFIRMASI']) : 'LUNAS';
      
      tuition_payments.push({
        id: `T${tuition_payments.length + 1}`,
        student_nim: nim,
        semester: s,
        amount: 5000000, // 5 Juta per semester
        status: status,
        due_date: new Date(2024, (s * 6) % 12, 10).toISOString().split('T')[0],
        paid_date: status === 'LUNAS' ? new Date(2024, (s * 6) % 12, 5).toISOString().split('T')[0] : undefined
      });
    }
  }

  return { students, lecturers, admins, courses, grades, tuition_payments, admissions };
};