export interface Student {
  id: string;
  nim: string;
  name: string;
  password: string; // Simulasi auth
  major: string;
  semester: number;
  gpa: number;
  email: string;
}

export interface Lecturer {
  id: string;
  nip: string;
  name: string;
  password: string;
  department: string; // Prodi
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

export interface MockDatabase {
  students: Student[];
  lecturers: Lecturer[];
  admins: Admin[];
  courses: Course[];
  grades: Grade[];
  tuition_payments: TuitionPayment[];
  admissions: AdmissionInfo[];
}

export interface ChartData {
  type: 'bar' | 'pie';
  title: string;
  labels: string[];
  values: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  image?: string; // Base64 string untuk gambar
  chartData?: ChartData; // Jika bot ingin menampilkan grafik
  debugLogs?: string[]; // Untuk "Explainable AI" (menunjukkan proses berpikir)
}

export interface UserSession {
  id: string;
  role: 'student' | 'lecturer' | 'admin';
  name: string;
  identifier: string; // NIM, NIP, atau Username
}