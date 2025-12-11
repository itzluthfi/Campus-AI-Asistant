
export interface Student {
  id: string;
  nim: string;
  name: string;
  password: string; // Simulasi auth
  major: string;
  semester: number;
  gpa: number;
  email: string;
  origin: string; // Kota Asal (New for Analysis)
}

export interface Lecturer {
  id: string;
  nip: string;
  name: string;
  password: string;
  department: string; // Prodi
  email: string;
}

export interface Employee {
  id: string;
  nik: string; // Nomor Induk Karyawan
  name: string;
  password: string;
  position: string; // Jabatan (e.g., Staff Keuangan, Satpam, Admin Prodi)
  email: string;
}

export interface Admin {
  id: string;
  username: string;
  name: string;
  password: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer_nip: string; // Foreign key ke Lecturer
  day: string;
  time: string;
  room: string;
  sks: number;
}

export interface Grade {
  id: string;
  student_nim: string;
  course_code: string;
  grade: string;
  semester: number;
}

export interface TuitionPayment {
  id: string;
  student_nim: string;
  semester: number;
  amount: number;
  status: 'LUNAS' | 'BELUM LUNAS' | 'MENUNGGU KONFIRMASI';
  due_date: string; // Tanggal jatuh tempo
  paid_date?: string; // Tanggal bayar
}

export interface AdmissionInfo {
  id: string;
  batch_name: string;
  start_date: string;
  end_date: string;
  description: string;
  requirements: string;
  status: 'OPEN' | 'CLOSED' | 'COMING SOON';
}

// --- NEW MODULES ---

export interface Salary {
  id: string;
  employee_nik: string;
  month: string; // e.g., "Januari 2024"
  basic_salary: number;
  allowance: number; // Tunjangan
  deduction: number; // Potongan
  total: number;
  status: 'DIBAYARKAN' | 'PROSES';
}

export interface Attendance {
  id: string;
  employee_nik: string;
  date: string;
  check_in: string; // "07:55"
  check_out: string; // "17:05"
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  type: 'GEDUNG' | 'RUANG KELAS' | 'LAB' | 'FASILITAS UMUM';
  location_desc: string; // e.g., "Lantai 2 Gedung A"
  capacity: number;
}

// --- NEW ENHANCEMENTS (SKRIPSI COMPLEXITY) ---

export interface Scholarship {
  id: string;
  name: string;
  provider: string; // e.g., "Kemdikbud", "Djarum", "Yayasan Alumni"
  amount: number; // Per semester
  min_gpa: number;
  status: 'OPEN' | 'CLOSED';
  quota: number;
}

export interface Organization {
  id: string;
  name: string; // e.g., "BEM", "UKM Robotik"
  category: 'Akademik' | 'Olahraga' | 'Seni' | 'Sosial';
  chairman: string;
  description: string;
}

export interface MockDatabase {
  students: Student[];
  lecturers: Lecturer[];
  admins: Admin[];
  employees: Employee[]; // New
  courses: Course[];
  grades: Grade[];
  tuition_payments: TuitionPayment[];
  admissions: AdmissionInfo[];
  salaries: Salary[]; // New
  attendance: Attendance[]; // New
  facilities: Facility[]; // New
  scholarships: Scholarship[]; // New
  organizations: Organization[]; // New
}

export interface ChartData {
  type: 'bar' | 'pie' | 'flowchart'; // Added flowchart
  title: string;
  labels: string[];
  values: number[]; // For Bar/Pie
  steps?: string[]; // For Flowchart/Diagram
}

export interface GeneratedFile {
  filename: string;
  content: string; // Base64 or raw string
  mimeType: 'text/csv' | 'text/plain' | 'text/markdown' | 'application/json';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  image?: string; // Base64 string untuk gambar
  chartData?: ChartData; // Jika bot ingin menampilkan grafik
  generatedFile?: GeneratedFile; // Jika bot membuat file
  debugLogs?: string[]; // Untuk "Explainable AI" (menunjukkan proses berpikir)
}

export interface UserSession {
  id: string;
  role: 'student' | 'lecturer' | 'admin' | 'employee';
  name: string;
  identifier: string; // NIM, NIP, Username, or NIK
}
