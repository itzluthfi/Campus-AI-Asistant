# Campus AI Nexus (Thesis Prototype)

Aplikasi Asisten Kampus Cerdas berbasis Web yang memanfaatkan **Google Gemini API** untuk simulasi kecerdasan buatan dalam lingkungan akademik. Aplikasi ini dirancang sebagai **Multimodal AI Assistant** yang mampu menangani teks, suara, gambar, dan analisis data terstruktur.

## 🚀 Fitur Unggulan

### 1. 🧠 Multi-Role Authentication
Bot berperilaku berbeda sesuai siapa yang login:
- **Mahasiswa**: Cek Nilai, SPP, Jadwal.
- **Dosen**: Cek Jadwal Mengajar, Daftar Kelas.
- **Pegawai (HR)**: Cek Gaji Bulanan, Absensi.
- **Admin**: Akses Global & Analisis Statistik.

### 2. 📊 Data Visualization (Generative UI)
Bot tidak hanya membalas teks. Jika user meminta data statistik (misal: "Grafik rata-rata IPK per jurusan"), bot akan:
1. Melakukan query ke database.
2. Menganalisis data.
3. Me-render komponen **Chart/Grafik** interaktif langsung di chat.

### 3. 👁️ Vision & OCR (Document Reading)
User dapat mengunggah foto dokumen (KRS, Jadwal, Brosur), dan AI akan:
- Membaca teks dalam gambar.
- Mencocokkan dengan konteks database kampus.
- Menjawab pertanyaan berdasarkan isi gambar tersebut.

### 4. 🎙️ Voice Command (Speech-to-Text)
Mendukung input suara bahasa Indonesia. Tekan tombol mikrofon dan bicaralah, AI akan mendengarkan dan merespon.

### 5. 🔌 Public API / SDK (AI as a Service)
Proyek ini mengekspos global object `window.CampusSDK` yang memungkinkan aplikasi web lain (simulasi) untuk menggunakan kecerdasan bot ini.
- **`askAI(prompt)`**: Aplikasi lain bisa kirim pertanyaan ("Analisis gaji pegawai bulan ini"), dan SDK akan mengembalikan jawaban analisis + grafik.
- **`query(sql)`**: Akses raw data untuk kebutuhan reporting eksternal.

### 6. 💾 Session Persistence
Menggunakan LocalStorage agar login user tidak hilang saat halaman di-refresh (Fitur "Remember Me").

---

## 🛠️ Cara Menjalankan

1. **Install Dependencies** (Support Node.js & Bun)
   ```bash
   npm install
   # atau
   bun install
   ```

2. **Setup API Key**
   Buat file `.env` dan isi:
   ```env
   API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Start Application**
   ```bash
   npm start
   # atau
   bun start
   ```

---

## 🔐 Akun Demo (Credentials)

Untuk memudahkan pengujian saat sidang/demo, gunakan akun berikut (Bisa dilihat juga di menu **Data & API Docs** di aplikasi):

| Role | Username | Password | Fitur Test |
|------|----------|----------|------------|
| **Mahasiswa** | `2024001` | `123` | Cek IPK, SPP, Jadwal |
| **Dosen** | `19801001` (Lihat tabel) | `dosen` | Cek Jadwal Ajar |
| **Pegawai** | `PEG001` | `123` | Cek Slip Gaji & Absen |
| **Admin** | `admin` | `admin123` | Analisis Statistik Global |

---

## 📚 Dokumentasi SDK (Integrasi Eksternal)

Anda bisa mencoba fitur ini melalui **Console Browser** (Inspect Element -> Console) saat aplikasi berjalan.

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
console.log(data);
```
