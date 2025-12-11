# Campus AI Assistant (Prototype)

Aplikasi Chatbot Kampus cerdas yang menggunakan **Google Gemini API** untuk mensimulasikan asisten akademik. Aplikasi ini memiliki sistem login via chat, simulasi database akademik (SQL-like), dan kemampuan multi-step reasoning.

## 🚀 Cara Menjalankan Project

1. **Clone Repository**
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. **Install Dependencies**
   Pastikan Node.js sudah terinstall, lalu jalankan:
   ```bash
   npm install
   ```

3. **Setup Environment Variable**
   - Buat file bernama `.env` di root folder.
   - Masukkan API Key Google Gemini Anda (Dapatkan di [aistudio.google.com](https://aistudio.google.com/)):
     ```env
     API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

4. **Jalankan Aplikasi**
   ```bash
   npm start
   ```
   Auka browser di `http://localhost:1234` (atau port yang muncul di terminal).

---

## 🤖 Fitur & Kemampuan Bot

### 1. Mode Tamu (Guest Mode)
Sebelum login, bot bertindak sebagai resepsionis umum.
- **Bisa:** Menjawab sapaan, jokes, puisi, dan pertanyaan umum (misal: "Siapa saja dosen di jurusan TI?", "Ada mata kuliah apa hari senin?").
- **Tidak Bisa:** Mengakses data nilai, keuangan, atau data pribadi lainnya.

### 2. Login via Chat
User tidak perlu mengisi form web. Cukup ketik perintah di chat.
- Ketik: `login`
- Bot akan meminta **NIM/NIP**.
- Bot akan meminta **Password**.
- *Note: Password diproses di client-side dan tidak dikirim ke AI demi keamanan.*

### 3. Akses Data Personal (Mahasiswa/Dosen)
Setelah login, bot mengenali siapa Anda.
- **Mahasiswa:**
  - "Berapa IPK saya?"
  - "Tampilkan nilai semester 1."
  - "Apakah SPP saya semester ini sudah lunas?"
- **Dosen:**
  - "Saya mengajar mata kuliah apa saja?"
  - "Di ruang mana saya mengajar hari Senin?"

### 4. Smart Filtering & Multi-Turn
- Jika hasil data terlalu banyak (misal > 10 baris), bot **tidak akan memuntahkan semua data**. Bot akan bertanya balik: *"Data terlalu banyak, semester berapa yang Anda cari?"*.
- Bot bisa melakukan **chaining** (misal: User tanya "Nilai dan Tagihan", bot akan mengambil data nilai dulu, lalu data tagihan, baru menjawab).

---

## 🔑 Akun Demo (Untuk Pengujian)

Karena ini menggunakan *Mock Database* (simulasi), gunakan akun berikut untuk mencoba fitur login:

| Role | Username (NIM/NIP) | Password | Keterangan |
|------|-------------------|----------|------------|
| **Mahasiswa** | `2024001` | `123` | Data lengkap (Nilai & SPP) |
| **Mahasiswa** | `2024002` | `123` | Coba cek SPP (mungkin belum lunas) |
| **Dosen** | *(Cek di Tab Database)* | `dosen` | Lihat NIP di menu 'Data Dashboard' |

*Tips: Anda bisa melihat semua data mentah di menu "Data Dashboard" di sebelah kiri aplikasi.*
