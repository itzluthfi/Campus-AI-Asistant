import React, { useState } from 'react';
import { MockDatabase } from '../types';

interface DatabaseViewProps {
  data: MockDatabase;
}

const TableCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
    <div className="bg-slate-800 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
        Tabel: {title}
      </h3>
    </div>
    <div className="overflow-x-auto max-h-[300px]">
      {children}
    </div>
  </div>
);

const APIDocs: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-2">AI Asisten Kampus Public API (SDK)</h2>
      <p className="opacity-90">
        Dokumentasi untuk developer eksternal. Sistem ini mendukung **Headless AI Integration**, di mana logika kecerdasan bot ini dapat dipanggil oleh aplikasi lain (Web Fakultas, Mobile App, dll).
      </p>
    </div>

    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔑 Cara Integrasi & API Key</h3>
      <p className="mb-4 text-sm text-gray-600">
        Gunakan global object <code>window.CampusSDK</code> di console browser atau script eksternal.
        <br/>
        <strong>Test API Key:</strong> <code className="bg-gray-100 px-2 py-1 rounded">skripsi-secret-key-2024</code>
      </p>
    </div>

    {/* New Feature: AI Endpoint */}
    <div className="bg-white p-6 rounded-lg shadow border border-blue-200 ring-1 ring-blue-100">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-blue-800 mb-2">✨ Endpoint: Ask AI (Intelligence as a Service)</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">BARU</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Mengirim prompt teks natural language dan mendapatkan balasan analisis dari AI + Data Chart (jika ada). 
        Aplikasi eksternal tidak perlu pusing memikirkan SQL.
      </p>
      
      <div className="bg-gray-900 rounded-md p-4 overflow-x-auto text-white">
        <code className="text-xs font-mono">
          <span className="text-gray-500">// Contoh: Integrasi di Web Fakultas Teknik</span><br/>
          const response = await window.CampusSDK.askAI(<br/>
          &nbsp;&nbsp;<span className="text-yellow-300">"Tampilkan grafik rata-rata IPK per jurusan"</span>,<br/>
          &nbsp;&nbsp;<span className="text-green-300">"skripsi-secret-key-2024"</span><br/>
          );<br/><br/>
          console.log(response.answer); <span className="text-gray-500">// "Berdasarkan data..."</span><br/>
          console.log(response.chart); <span className="text-gray-500">{'// { type: \'bar\', values: [...] }'}</span>
        </code>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Endpoint: Raw SQL Query</h3>
      <p className="mb-4 text-sm text-gray-600">Untuk developer yang ingin mengambil data mentah.</p>
      
      <div className="bg-gray-900 rounded-md p-4 overflow-x-auto text-white">
        <code className="text-xs font-mono">
          const result = window.CampusSDK.query(<br/>
          &nbsp;&nbsp;"SELECT name, gpa FROM students WHERE gpa &gt; 3.5", <br/>
          &nbsp;&nbsp;"skripsi-secret-key-2024"<br/>
          );
        </code>
      </div>
    </div>
  </div>
);

const DatabaseView: React.FC<DatabaseViewProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'tables' | 'api'>('tables');

  // Helper untuk mendapatkan sample user tiap role
  const sampleStudent = data.students[0];
  const sampleLecturer = data.lecturers[0];
  const sampleEmployee = data.employees[0];
  const sampleAdmin = data.admins[0];

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setViewMode('tables')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'tables' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Database & Accounts
        </button>
        <button 
          onClick={() => setViewMode('api')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'api' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Developer API Docs
        </button>
      </div>

      {viewMode === 'api' ? (
        <APIDocs />
      ) : (
        <>
          {/* CREDENTIAL CHEAT SHEET - PENTING UNTUK DEMO SKRIPSI */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-sm">
                <h4 className="font-bold text-green-800 text-xs uppercase mb-1">Akun Mahasiswa</h4>
                <div className="text-sm">
                  <p><span className="font-semibold">User:</span> {sampleStudent?.nim || 'N/A'}</p>
                  <p><span className="font-semibold">Pass:</span> {sampleStudent?.password || 'N/A'}</p>
                </div>
             </div>
             <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                <h4 className="font-bold text-blue-800 text-xs uppercase mb-1">Akun Dosen</h4>
                <div className="text-sm">
                  <p><span className="font-semibold">User:</span> {sampleLecturer?.nip || 'N/A'}</p>
                  <p><span className="font-semibold">Pass:</span> {sampleLecturer?.password || 'N/A'}</p>
                </div>
             </div>
             <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded shadow-sm">
                <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">Akun Pegawai</h4>
                <div className="text-sm">
                  <p><span className="font-semibold">User:</span> {sampleEmployee?.nik || 'N/A'}</p>
                  <p><span className="font-semibold">Pass:</span> {sampleEmployee?.password || 'N/A'}</p>
                </div>
             </div>
             <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-sm">
                <h4 className="font-bold text-red-800 text-xs uppercase mb-1">Akun Admin (God Mode)</h4>
                <div className="text-sm">
                  <p><span className="font-semibold">User:</span> {sampleAdmin?.username || 'N/A'}</p>
                  <p><span className="font-semibold">Pass:</span> {sampleAdmin?.password || 'N/A'}</p>
                </div>
             </div>
          </div>

          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <h2 className="text-xl font-bold text-gray-800">Database Viewer</h2>
            <p className="text-sm text-gray-600 mt-1">
              Data real-time. Gunakan kredensial di atas untuk login di tab Chat.
            </p>
          </div>

          <TableCard title="employees (Pegawai & Staff)">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIK</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jabatan</th>
                  <th className="px-4 py-2 text-left">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.employees.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono font-bold text-blue-600">{e.nik}</td>
                    <td className="px-4 py-2">{e.name}</td>
                    <td className="px-4 py-2">{e.position}</td>
                    <td className="px-4 py-2 text-red-500 font-mono">{e.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="salaries (Gaji Pegawai) - Sample">
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
                {data.salaries.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{s.employee_nik}</td>
                    <td className="px-4 py-2">{s.month}</td>
                    <td className="px-4 py-2 font-bold text-green-600">Rp {s.total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-xs">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="students (Sample 5 Data)">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">NIM</th>
                  <th className="px-4 py-2 text-left text-red-600">Password</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.students.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{s.nim}</td>
                    <td className="px-4 py-2 font-mono text-red-500">{s.password}</td>
                    <td className="px-4 py-2">{s.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </>
      )}
    </div>
  );
};

export default DatabaseView;