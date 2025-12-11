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
          Ini adalah data simulasi (Mock DB). 
          Gunakan ID/NIK di bawah untuk login.
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

      <TableCard title="salaries (Gaji Pegawai)">
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

      <TableCard title="facilities (Gedung & Ruangan)">
         <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Kode</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Lokasi</th>
              <th className="px-4 py-2 text-left">Tipe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.facilities.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{f.code}</td>
                <td className="px-4 py-2 font-medium">{f.name}</td>
                <td className="px-4 py-2">{f.location_desc}</td>
                <td className="px-4 py-2 text-xs">{f.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* Existing Tables */}
      <TableCard title="students (Akun Mahasiswa)">
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

    </div>
  );
};

export default DatabaseView;