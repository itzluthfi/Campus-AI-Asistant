import React from 'react';
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

const DatabaseView: React.FC<DatabaseViewProps> = ({ data }) => {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <h2 className="text-xl font-bold text-gray-800">Database Viewer (Debugging)</h2>
        <p className="text-sm text-gray-600 mt-1">
          Ini adalah data "mentah" yang bisa diakses AI. 
          Gunakan akun di bawah untuk testing login.
        </p>
      </div>

      <TableCard title="admins (Akun Administrator)">
         <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left text-red-600">Password</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.admins.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono font-bold">{a.username}</td>
                <td className="px-4 py-2 font-mono text-red-500">{a.password}</td>
                <td className="px-4 py-2 text-blue-600">Administrator</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="admissions (Info PMB)">
         <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Jalur</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Syarat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.admissions.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{ad.batch_name}</td>
                <td className="px-4 py-2">{ad.start_date} s/d {ad.end_date}</td>
                <td className="px-4 py-2">
                   <span className={`px-2 py-1 rounded-full text-xs ${ad.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {ad.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs truncate max-w-xs" title={ad.requirements}>{ad.requirements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="students (Akun Mahasiswa - Top 50)">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">NIM</th>
              <th className="px-4 py-2 text-left text-red-600">Password</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Jurusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.students.slice(0, 50).map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{s.nim}</td>
                <td className="px-4 py-2 font-mono text-red-500">{s.password}</td>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.major}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="courses (Mata Kuliah)">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Kode</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Hari/Jam</th>
              <th className="px-4 py-2 text-left">Ruang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.courses.map((c) => (
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

    </div>
  );
};

export default DatabaseView;