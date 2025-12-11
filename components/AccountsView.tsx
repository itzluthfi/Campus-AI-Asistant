import React from 'react';
import { MockDatabase } from '../types';

interface AccountsViewProps {
  data: MockDatabase;
}

const AccountCard: React.FC<{ 
  title: string; 
  color: string; 
  icon: React.ReactNode;
  users: { user: string; pass: string; desc?: string }[] 
}> = ({ title, color, icon, users }) => (
  <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-5 hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg text-white ${color.replace('border-', 'bg-').replace('500', '600')}`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    <div className="space-y-3">
      {users.map((u, idx) => (
        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100 text-sm">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-semibold text-gray-500">{u.desc || 'User 1'}</span>
             <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">Default</span>
          </div>
          <div className="grid grid-cols-[40px_1fr] gap-1">
            <span className="text-gray-400 font-mono text-xs">ID :</span>
            <code className="font-mono font-bold text-gray-800 select-all">{u.user}</code>
            <span className="text-gray-400 font-mono text-xs">PW :</span>
            <code className="font-mono text-red-500 select-all">{u.pass}</code>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AccountsView: React.FC<AccountsViewProps> = ({ data }) => {
  // Get samples
  const student = data.students[0];
  const lecturer = data.lecturers[0];
  const employee = data.employees[0]; // Staff Keuangan usually
  const admin = data.admins[0];

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akun Pengujian (Test Credentials)</h1>
        <p className="text-gray-600">
          Gunakan akun-akun di bawah ini untuk mensimulasikan berbagai Role saat Demo Aplikasi.
          Klik teks ID/Password untuk copy-paste.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* MAHASISWA */}
        <AccountCard 
          title="Mahasiswa" 
          color="border-green-500"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          }
          users={[
            { user: student?.nim || '2024001', pass: student?.password || '123', desc: 'Mahasiswa Aktif' }
          ]}
        />

        {/* DOSEN */}
        <AccountCard 
          title="Dosen" 
          color="border-blue-500"
          icon={
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
          users={[
            { user: lecturer?.nip || '19801001', pass: lecturer?.password || 'dosen', desc: 'Dosen Wali' }
          ]}
        />

        {/* PEGAWAI */}
        <AccountCard 
          title="Pegawai / Staff" 
          color="border-orange-500"
          icon={
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          }
          users={[
            { user: employee?.nik || 'PEG001', pass: employee?.password || '123', desc: 'Staff Keuangan' }
          ]}
        />

        {/* ADMIN */}
        <AccountCard 
          title="Super Admin" 
          color="border-red-600"
          icon={
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          users={[
            { user: admin?.username || 'admin', pass: admin?.password || 'admin123', desc: 'God Mode' }
          ]}
        />
      </div>

      <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">💡 Tips Pengujian Skripsi</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li><strong>Role Mahasiswa:</strong> Fokus pada fitur akademik (Lihat Nilai, SPP, Jadwal).</li>
          <li><strong>Role Pegawai:</strong> Fokus pada fitur operasional (Cek Gaji, Absensi In/Out).</li>
          <li><strong>Role Dosen:</strong> Fokus pada jadwal mengajar.</li>
          <li><strong>Role Admin:</strong> Gunakan untuk melihat seluruh data dan analisis agregat (Contoh: "Berapa total gaji yang harus dibayar bulan ini?").</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountsView;