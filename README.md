# On-Set Creative Assistant

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Mobile_First-purple.svg)
![Database](https://img.shields.io/badge/database-Supabase-3FCF8E.svg)
![Realtime](https://img.shields.io/badge/realtime-WebSocket-orange.svg)

Aplikasi web internal (Mobile-First) yang dirancang khusus untuk tim produksi video (Director, Videografer, dan Talent) untuk menggantikan dokumen fisik/kertas kerja di lokasi syuting.

**Live URL**: [https://onset-creative-assistant.vercel.app](https://onset-creative-assistant.vercel.app)

---

## 🎯 Masalah yang Diselesaikan

Di lapangan, tim creative seringkali kerepotan mengatur kertas kerja fisik (atau Google Docs yang tidak praktis di HP) yang berisi referensi, *shot list*, dan brief. Masalah yang sering terjadi:
- Talent bingung membaca naskah karena tercampur instruksi teknis kamera.
- Director kesulitan memantau progress keseluruhan *shot* yang sudah/belum diambil.
- Kertas rentan kotor, hilang, atau urutannya berantakan.
- Data tidak sinkron antar device — hanya tersimpan di satu browser.

**Solusi:** Aplikasi web ini memberikan antarmuka interaktif yang disesuaikan untuk peran masing-masing: **Tech View** untuk videografer/director (detail alat, sudut pandang kamera, status take) dan **Talent View** untuk naskah yang sangat bersih dan mudah dibaca dari jarak jauh. Semua data disinkronisasi secara **real-time** ke seluruh perangkat tim via Supabase.

---

## ✨ Fitur Utama

- **🎬 Multi-Project Management**: Kelola berbagai project (seperti Grillme, Project W, dll) dalam satu aplikasi.
- **⚡ Real-time Multi-Device Sync**: Perubahan status shot (TAKE_DONE, REVISI) otomatis sinkron ke semua HP/Laptop tim dalam hitungan milidetik via Supabase WebSocket.
- **📂 Multi-Shot Scene Grouping**: UI rapi yang mengelompokkan beberapa *shot list* ke dalam satu Scene Folder (misal Scene 1 memiliki Wide Shot, Close Up, Panning, dll).
- **🔄 Tech & Talent Mode Toggle**:
  - **Tech View**: Menampilkan detail lengkap (scene, equipment, angle, shot type, referensi, quick log, status).
  - **Talent View**: Mode naskah bersih, font besar, menyembunyikan detail teknis, dilengkapi dengan badge instruksi warna-warni (misal: `<EKSPRESI KAGET>`, `<NADA BICARA CEPAT>`).
- **📊 Progress Tracking**: Progress bar visual yang menghitung persentase shot yang *Done*, *Pending*, atau butuh *Revisi*.
- **🌗 Dark Mode Premium**: UI didesain gelap secara default untuk visibilitas optimal di kondisi studio maupun *outdoor*, serta menghemat baterai HP.
- **📱 Mobile-First Design**: Didesain khusus untuk layar *smartphone* (375px+).
- **📝 Quick Log**: Fitur catatan lapangan super cepat per shot (berguna untuk *post-production*).
- **🚀 Zero Login**: Tidak perlu autentikasi. Sangat cepat diakses oleh seluruh tim.
- **☁️ Cloud Database**: Data tersimpan di Supabase PostgreSQL, tidak hilang meski browser di-clear.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Styling** | Vanilla CSS (CSS Variables untuk Design System) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + Real-time WebSocket) |
| **Deploy** | [Vercel](https://vercel.com/) |

---

## 🚀 Cara Menjalankan secara Lokal

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/Wahyu-30/onset-creative-assistant.git
   cd onset-creative-assistant
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Buat file `.env.local`** di root project dan isi dengan:
   ```env
   VITE_SUPABASE_URL=https://rirkpkkbizsvastturjg.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_4PjfAc3Xz5osFApqU9mHGg_mxyTXqOb
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

5. Buka browser di **[http://localhost:5173/](http://localhost:5173/)**.

> **Catatan**: Saat database Supabase masih kosong (pertama kali), akan muncul tombol **"Isi Data Sample"** di halaman utama untuk mengisi data contoh secara otomatis.

---

## 🤖 Untuk AI Agents / LLMs

Jika Anda adalah AI Agent yang ditugaskan untuk membaca, memodifikasi, atau mengembangkan basis kode ini, silakan baca **[AGENTS.md](./AGENTS.md)**.
File `AGENTS.md` berisi detail lengkap mengenai arsitektur, struktur data, CSS variables, dan aturan wajib pengembangan (apa yang boleh dan tidak boleh dilakukan).

---

## 🛣️ Roadmap Fase Pengembangan

### ✅ Fase 1 (Selesai) — UI/UX Stabilization
- Aplikasi inti selesai dibangun (Mobile-first, Dark mode).
- Mode Tech ↔ Talent, Filter, Progress Bar, Edit Form.
- Error Boundary & SPA routing fallback.
- Smart image fallback & Google Drive in-app iframe preview.

### ✅ Fase 2 (Selesai) — Supabase Real-time Database
- Migrasi dari `localStorage` ke Supabase PostgreSQL cloud.
- Real-time WebSocket sync antar semua perangkat (HP, Laptop, Tablet).
- Tabel `projects` dan `shots` terpisah untuk performa optimal.
- Optimistic UI updates untuk pengalaman pengguna yang mulus.
- Injeksi data sampel satu-klik via tombol "Isi Data Sample".

### ✅ Fase 3 (Selesai) — Media, Ekspor, & Import Cepat
- **Integrasi Supabase Storage**: Upload foto/video referensi langsung (auto-compress ~200KB).
- **Ekspor PDF Kertas Kerja**: Cetak format Kertas Kerja produksi (Info Project + Shot List) sebagai PDF.
- **Magic Auto-Fill**: Import seluruh naskah dan informasi detail Kertas Kerja secara langsung via *Copy-Paste* teks, dilengkapi AI/Regex pintar untuk ekstraksi data otomatis (mendukung format bullet points dan multi-shot).
- **Inline Shot Editing**: Mengedit dialog, brief action, dan referensi langsung dari Shot Card (click-to-edit) tanpa membuka form terpisah, tersimpan otomatis (auto-save) ke database.
- **Dashboard Analitik (Basic)**: Pantau progress dan statistik seluruh proyek di halaman utama.

### 🔜 Fase Lanjutan (Sedang Berjalan)
- **Ekspor Word (.doc)**: (Sudah tersedia untuk kertas kerja).
- **Integrasi Kalender**: Pengingat jadwal *shoot* secara otomatis.
---

## 📝 Catatan Tambahan

Aplikasi ini merupakan **Internal Tool** dan dirancang untuk alur kerja yang sangat spesifik. Segala keputusan UI/UX (ukuran tombol besar, navigasi 1-tap) dibuat agar tim produksi bisa bergerak cepat tanpa membuang waktu menatap layar *smartphone* saat berada di set.
