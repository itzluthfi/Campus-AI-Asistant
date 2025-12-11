import React, { useState } from 'react';
import { MockDatabase, UserSession } from '../types';

interface DatabaseViewProps {
  data: MockDatabase;
  user: UserSession | null;
}

const TableCard: React.FC<{ 
  title: string; 
  locked?: boolean; 
  info?: string;
  children: React.ReactNode 
}> = ({ title, locked, info, children }) => (
  <div className={`bg-white rounded-lg shadow-md border overflow-hidden mb-8 ${locked ? 'border-red-200' : 'border-gray-200'}`}>
    <div className={`px-4 py-3 border-b flex justify-between items-center ${locked ? 'bg-red-50' : 'bg-slate-800'}`}>
      <div className="flex flex-col">
        <h3 className={`font-semibold text-sm uppercase tracking-wider flex items-center gap-2 ${locked ? 'text-red-700' : 'text-white'}`}>
          {locked && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          )}
          Tabel: {title}
        </h3>
        {!locked && info && <span className="text-[10px] text-gray-300 font-normal mt-1">{info}</span>}
      </div>
      {locked && <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-1 rounded">ACCESS DENIED</span>}
    </div>
    
    <div className="overflow-x-auto max-h-[300px] relative">
      {locked ? (
        <div className="p-8 text-center flex flex-col items-center justify-center bg-gray-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Anda tidak memiliki izin untuk melihat data ini.</p>
          <p className="text-gray-400 text-xs">Role saat ini: Guest / Unauthorized</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const APIDocs: React.FC<{ role: string }> = ({ role }) => (
  <div className="space-y-8 pb-10">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-2">AI Asisten Kampus Public API (SDK)</h2>
      <p className="opacity-90 text-sm leading-relaxed">
        Dokumentasi teknis untuk integrasi pihak ketiga. Sistem ini menerapkan <strong>Strict Role-Based Access Control (RBAC)</strong>. 
        Data yang dikembalikan oleh API akan otomatis difilter berdasarkan Token/Key pengguna.
      </p>
    </div>

    {/* Section 1: Security Context */}
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
      <h3 className="text-lg font-bold text-gray-800 mb-2">🛡️ Security & Privacy Context</h3>
      <p className="text-sm text-gray-600 mb-4">
        Hak akses data saat ini disesuaikan dengan sesi Anda: <strong>{role.toUpperCase()}</strong>.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-bold mb-1 text-gray-700">Data Visibility (Read)</h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-600">
            {role === 'admin' && <li className="text-green-600 font-bold">ALL DATA (Full Access)</li>}
            {role === 'guest' && <li className="text-red-500">Hanya Public Data (Course, Info)</li>}
            {(role === 'employee' || role === 'lecturer') && (
              <>
                <li>Public Data (All)</li>
                <li>Employee Directory (Limited View)</li>
                <li className="text-blue-600 font-semibold">Personal Data Only (Salary, Attendance)</li>
              </>
            )}
            {role === 'student' && (
              <>
                <li>Public Data (All)</li>
                <li className="text-blue-600 font-semibold">Personal Data Only (Grades, Tuition)</li>
              </>
            )}
          </ul>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-bold mb-1 text-gray-700">Action Capabilities (Write)</h4>
           <ul className="list-disc pl-4 space-y-1 text-gray-600">
            {role === 'admin' && <li>Manage Users, Edit Data</li>}
            {(role === 'employee' || role === 'lecturer') && <li>Clock In/Out (Absensi), Update Profile</li>}
            {role === 'student' && <li>Update Profile</li>}
            {role === 'guest' && <li className="text-gray-400 italic">Read Only</li>}
          </ul>
        </div>
      </div>
    </div>

    {/* Section 2: Endpoints */}
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">📚 Available Methods</h3>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
         <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
            <code className="font-bold text-blue-700">askAI(prompt, apiKey)</code>
            <span className="text-[10px] uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded">Intelligence</span>
         </div>
         <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Menggunakan Natural Language Processing (Gemini) untuk menganalisis data kampus.
              Respon otomatis menghormati privasi user.
            </p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded text-xs font-mono overflow-x-auto">
               <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> window.CampusSDK.askAI(<br/>
               &nbsp;&nbsp;<span className="text-green-400">"Tampilkan gaji saya bulan ini"</span>,<br/>
               &nbsp;&nbsp;<span className="text-yellow-400">"skripsi-secret-key"</span><br/>
               );
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
         <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
            <code className="font-bold text-blue-700">query(sql, apiKey)</code>
            <span className="text-[10px] uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Raw Data</span>
         </div>
         <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Menjalankan query SQL SELECT langsung ke database virtual.
              <br/><span className="text-red-500 font-semibold text-xs">Note: Jika login sebagai Staff, query 'SELECT * FROM salaries' hanya akan mengembalikan data gaji Anda sendiri.</span>
            </p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded text-xs font-mono overflow-x-auto">
               <span className="text-purple-400">const</span> data = window.CampusSDK.query(<br/>
               &nbsp;&nbsp;<span className="text-green-400">"SELECT * FROM attendance LIMIT 5"</span>,<br/>
               &nbsp;&nbsp;<span className="text-yellow-400">"skripsi-secret-key"</span><br/>
               );
            </div>
         </div>
      </div>
    </div>
  </div>
);

const DatabaseView: React.FC<DatabaseViewProps> = ({ data, user }) => {
  const [viewMode, setViewMode] = useState<'tables' | 'api'>('tables');
  const role = user ? user.role : 'guest';
  const userId = user ? user.identifier : null;

  // --- ROW LEVEL SECURITY LOGIC ---
  
  // 1. Logic for EMPLOYEES Table (Directory)
  // Everyone authorized can see the list, BUT only Admin sees Passwords/Private info.
  const canViewEmployeesTable = role !== 'guest' && role !== 'student';
  const employeesData = data.employees; // We filter columns in the render part (Masking)

  // 2. Logic for SALARIES Table
  const canViewSalariesTable = role === 'admin' || role === 'employee';
  const salariesData = role === 'admin' 
    ? data.salaries // Admin sees all
    : data.salaries.filter(s => s.employee_nik === userId); // Emp sees OWN only

  // 3. Logic for ATTENDANCE Table
  const canViewAttendanceTable = role === 'admin' || role === 'employee' || role === 'lecturer';
  const attendanceData = role === 'admin'
    ? data.attendance
    : data.attendance.filter(a => a.employee_nik === userId); // Own only

  // 4. Logic for STUDENTS Table
  // Admin/Lecturer/Employee can see student list. Student sees nothing (use chat for own data).
  const canViewStudentsTable = role === 'admin' || role === 'lecturer' || role === 'employee';
  const studentsData = data.students; // List is generally public for staff

  // 5. Logic for GRADES Table
  const canViewGradesTable = role === 'admin' || role === 'lecturer';
  const gradesData = data.grades; // Lecturer needs to see all grades (simplified)

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="flex space-x-4 mb-6 sticky top-0 bg-gray-50 z-10 py-2 border-b">
        <button 
          onClick={() => setViewMode('tables')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'tables' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
        >
          Database Viewer (Live)
        </button>
        <button 
          onClick={() => setViewMode('api')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'api' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
        >
          Developer API Docs
        </button>
      </div>

      {viewMode === 'api' ? (
        <APIDocs role={role} />
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h2 className="text-xl font-bold text-gray-800">Live Database Schema</h2>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan data real-time dari memori aplikasi. 
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-500">Active Filter:</span>
              <span className={`px-2 py-1 rounded font-bold ${role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {role === 'admin' ? 'NO FILTER (GOD MODE)' : `OWN DATA ONLY (${userId})`}
              </span>
            </div>
          </div>

          {/* TABLE: COURSES (PUBLIC) */}
          <TableCard title="courses (Mata Kuliah)" locked={false} info="Public Access">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Kode</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jadwal</th>
                  <th className="px-4 py-2 text-left">Ruang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.courses.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{c.code}</td>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.day}, {c.time}</td>
                    <td className="px-4 py-2">{c.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          {/* TABLE: EMPLOYEES (DIRECTORY - Masked for non-admin) */}
          <TableCard title="employees (Direktori Pegawai)" locked={!canViewEmployeesTable} info={role === 'admin' ? "Full Access" : "Privacy Masking Active"}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIK</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jabatan</th>
                  <th className="px-4 py-2 text-left">Password / Secret</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeesData.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono font-bold text-blue-600">{e.nik}</td>
                    <td className="px-4 py-2">{e.name}</td>
                    <td className="px-4 py-2">{e.position}</td>
                    <td className="px-4 py-2 font-mono text-gray-400">
                      {role === 'admin' || e.nik === userId ? (
                        <span className="text-red-500">{e.password}</span>
                      ) : (
                        '••••••••'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

           {/* TABLE: ATTENDANCE (STRICT ROW FILTER) */}
           <TableCard 
             title="attendance (Absensi)" 
             locked={!canViewAttendanceTable} 
             info={role === 'admin' ? `All Records (${attendanceData.length})` : `My Records (${attendanceData.length})`}
            >
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIK</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Masuk</th>
                  <th className="px-4 py-2 text-left">Pulang</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.length > 0 ? attendanceData.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{a.employee_nik}</td>
                    <td className="px-4 py-2">{a.date}</td>
                    <td className="px-4 py-2 text-green-600">{a.check_in}</td>
                    <td className="px-4 py-2 text-orange-600">{a.check_out}</td>
                    <td className="px-4 py-2 font-bold">{a.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic bg-gray-50">
                      Tidak ada data absensi yang dapat ditampilkan untuk akun Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          {/* TABLE: SALARIES (STRICT ROW FILTER) */}
          <TableCard 
            title="salaries (Gaji)" 
            locked={!canViewSalariesTable}
            info={role === 'admin' ? `All Records` : `My Records Only`}
          >
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIK Pegawai</th>
                  <th className="px-4 py-2 text-left">Bulan</th>
                  <th className="px-4 py-2 text-left">Total Terima</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salariesData.length > 0 ? salariesData.slice(0, role === 'admin' ? 10 : 100).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{s.employee_nik}</td>
                    <td className="px-4 py-2">{s.month}</td>
                    <td className="px-4 py-2 font-bold text-green-600">Rp {s.total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{s.status}</span>
                    </td>
                  </tr>
                )) : (
                   <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic bg-gray-50">
                      Tidak ada data gaji. (Pastikan Anda login sebagai Pegawai Tetap)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          {/* TABLE: STUDENTS (DIRECTORY) */}
          <TableCard title="students (Data Mahasiswa)" locked={!canViewStudentsTable} info="Academic Staff View">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIM</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jurusan</th>
                  <th className="px-4 py-2 text-left">IPK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentsData.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{s.nim}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.major}</td>
                    <td className="px-4 py-2 font-bold text-blue-600">{s.gpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          {/* TABLE: GRADES (ACADEMIC) */}
          <TableCard title="grades (Nilai Mahasiswa)" locked={!canViewGradesTable} info="Lecturer View">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIM</th>
                  <th className="px-4 py-2 text-left">Kode MTK</th>
                  <th className="px-4 py-2 text-left">Nilai</th>
                  <th className="px-4 py-2 text-left">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gradesData.slice(0, 10).map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{g.student_nim}</td>
                    <td className="px-4 py-2 font-mono">{g.course_code}</td>
                    <td className="px-4 py-2 font-bold">{g.grade}</td>
                    <td className="px-4 py-2">{g.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

           {/* TABLE: SCHOLARSHIPS (PUBLIC) */}
           <TableCard title="scholarships (Beasiswa)" locked={false} info="Public Info">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Penyedia</th>
                  <th className="px-4 py-2 text-left">Min. IPK</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2">{s.provider}</td>
                    <td className="px-4 py-2">{s.min_gpa}</td>
                    <td className="px-4 py-2">
                       <span className={`px-2 py-1 rounded text-xs ${s.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {s.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;