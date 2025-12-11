# Campus AI Nexus (Thesis Prototype "L")

**Sistem Asisten Kampus Cerdas berbasis Web yang memanfaatkan Google Gemini API untuk simulasi kecerdasan buatan dalam lingkungan akademik.**

Aplikasi ini dirancang sebagai **Multimodal AI Assistant** yang mampu menangani teks, suara, gambar, dan analisis data terstruktur. Berbeda dengan Chatbot biasa, sistem ini memiliki **"Kesadaran Konteks" (Context Awareness)** terhadap siapa yang sedang login dan menerapkan **Row-Level Security (RLS)** pada layer aplikasi.

![Status](https://img.shields.io/badge/Status-Prototype-orange) ![Tech](https://img.shields.io/badge/Tech-React_Typescript_Gemini-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Fitur Unggulan

### 1. 🧠 Multi-Role Authentication
Bot berperilaku berbeda sesuai siapa yang login:
- **Mahasiswa**: Cek Nilai, SPP, Jadwal Pribadi.
- **Dosen**: Cek Jadwal Mengajar, Daftar Kelas Binaan.
- **Pegawai (HR)**: Cek Gaji Bulanan Sendiri, Absensi.
- **Admin**: Akses Global & Analisis Statistik.

### 2. 📊 Data Visualization (Generative UI)
Bot tidak hanya membalas teks. Jika user meminta data statistik (misal: "Grafik rata-rata IPK per jurusan"), bot akan:
1. Melakukan query ke database simulasi.
2. Menganalisis data.
3. Me-render komponen **Chart/Grafik** (Bar, Pie, Flowchart) interaktif langsung di chat.

### 3. 👁️ Vision & OCR (Document Reading)
User dapat mengunggah foto dokumen (KRS, Jadwal, Brosur), dan AI akan:
- Membaca teks dalam gambar.
- Mencocokkan dengan konteks database kampus.
- Menjawab pertanyaan berdasarkan isi gambar tersebut.

### 4. 🎙️ Voice Command (Speech-to-Text)
Mendukung input suara bahasa Indonesia menggunakan Web Speech API. Tekan tombol mikrofon dan bicaralah, AI akan mendengarkan dan merespon.

### 5. 🔌 Public API / SDK (AI as a Service)
Proyek ini mengekspos global object `window.CampusSDK` yang memungkinkan aplikasi web lain (simulasi ekosistem kampus) untuk menggunakan kecerdasan bot ini.
- **`askAI(prompt)`**: Aplikasi lain bisa kirim pertanyaan ("Analisis gaji pegawai bulan ini"), dan SDK akan mengembalikan jawaban analisis + grafik.
- **`query(sql)`**: Akses raw data untuk kebutuhan reporting eksternal.

### 6. 📄 Document Generation
User dapat meminta laporan fisik:
- *"Download slip gaji saya bulan ini dalam PDF"*
- *"Buatkan rekap nilai mahasiswa dalam Excel"*

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Core**: React 18, TypeScript, Vite.
- **AI Engine**: Google Gemini 2.5 Flash (via Google GenAI SDK).
- **Visualization**: Custom SVG Charts.
- **Document Gen**: jsPDF & jspdf-autotable.
- **Data Simulation**: In-Memory Mock Database (dapat dimigrasi ke SQL).

---

## ⚙️ Instalasi & Menjalankan Project

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup API Key**
   Buat file `.env` di root folder dan isi dengan API Key Google Gemini Anda:
   ```env
   API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Jalankan Aplikasi**
   ```bash
   npm start
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🔐 Akun Demo (Credentials)

Untuk memudahkan pengujian saat sidang/demo, gunakan akun berikut (Bisa dilihat juga di menu **Akun Test** di aplikasi):

| Role | Username / ID | Password | Fitur Test |
|------|--------------|----------|------------|
| **Mahasiswa** | `2024001` | `123` | Cek IPK, SPP, Jadwal |
| **Dosen** | `19801001` | `dosen` | Cek Jadwal Ajar |
| **Pegawai** | `PEG001` | `123` | Cek Slip Gaji & Absen |
| **Admin** | `admin` | `admin123` | Analisis Statistik Global |

---

## 🔌 Panduan Koneksi ke Database Asli (Real DB Integration)

Saat ini aplikasi berjalan menggunakan **Mock Data**. Untuk skripsi, Anda harus menghubungkannya ke Database MySQL/PostgreSQL menggunakan backend (Laravel/Express).

### Langkah 1: Persiapan Database
Jalankan script SQL yang ada di dalam file `utils/dataGenerator.ts` untuk membuat tabel `students`, `employees`, `salaries`, dll.

### Langkah 2: Siapkan Backend API
Buat endpoint di Backend Anda (misal Laravel) untuk menerima query SQL:
```php
// Route: POST /api/v1/ai-query
public function execute(Request $request) {
    // Validasi Security & Execute SQL
    $results = DB::select($request->input('query'));
    return response()->json($results);
}
```

### Langkah 3: Update Frontend
Ubah file `services/queryEngine.ts` untuk melakukan `fetch` ke API Backend Anda alih-alih menggunakan data dummy.

---

## 📚 Dokumentasi SDK (Integrasi Eksternal)

Anda bisa mencoba fitur interoperabilitas ini melalui **Console Browser** (F12) saat aplikasi berjalan.

**Contoh 1: Menggunakan Kecerdasan AI (Logic + Data)**
```javascript
const response = await window.CampusSDK.askAI(
  "Tampilkan grafik jumlah mahasiswa per jurusan", 
  "skripsi-secret-key-2024"
);
console.log(response.answer); // Teks analisis
console.log(response.chart);  // Data visualisasi
```

**Contoh 2: Mengambil Data Mentah (SQL)**
```javascript
const data = window.CampusSDK.query(
  "SELECT * FROM students WHERE gpa > 3.8",
  "skripsi-secret-key-2024"
);
console.table(data.data);
```

---

**Dibuat oleh @sirL untuk keperluan Skripsi/Tugas Akhir.**
