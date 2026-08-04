# On-Set Creative Assistant

![Version](https://img.shields.io/badge/version-1.1-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Mobile_First-purple.svg)

Aplikasi web internal (Mobile-First) yang dirancang khusus untuk tim produksi video (Director, Videografer, dan Talent) untuk menggantikan dokumen fisik/kertas kerja di lokasi syuting.

**Live URL**: [https://onset-creative-assistant.vercel.app](https://onset-creative-assistant.vercel.app)

---

## 🎯 Masalah yang Diselesaikan

Di lapangan, tim creative seringkali kerepotan mengatur kertas kerja fisik (atau Google Docs yang tidak praktis di HP) yang berisi referensi, *shot list*, dan brief. Masalah yang sering terjadi:
- Talent bingung membaca naskah karena tercampur instruksi teknis kamera.
- Director kesulitan memantau progress keseluruhan *shot* yang sudah/belum diambil.
- Kertas rentan kotor, hilang, atau urutannya berantakan.

**Solusi:** Aplikasi web ini memberikan antarmuka interaktif yang disesuaikan untuk peran masing-masing: **Tech View** untuk videografer/director (detail alat, sudut pandang kamera, status take) dan **Talent View** untuk naskah yang sangat bersih dan mudah dibaca dari jarak jauh.

---

## ✨ Fitur Utama

- **🎬 Multi-Project Management**: Kelola berbagai project (seperti Grillme, Project W, dll) dalam satu aplikasi.
- **🔄 Tech & Talent Mode Toggle**:
  - **Tech View**: Menampilkan detail lengkap (scene, equipment, angle, shot type, referensi, quick log, status).
  - **Talent View**: Mode naskah bersih, font besar, menyembunyikan detail teknis, dilengkapi dengan badge instruksi warna-warni (misal: `<EKSPRESI KAGET>`, `<NADA BICARA CEPAT>`).
- **📊 Real-time Progress Tracking**: Progress bar visual yang menghitung persentase shot yang *Done*, *Pending*, atau butuh *Revisi*.
- **🌗 Dark Mode Premium**: UI didesain gelap secara default untuk visibilitas optimal di kondisi studio maupun *outdoor*, serta menghemat baterai HP.
- **📱 Mobile-First Design**: Didesain khusus untuk layar *smartphone* (375px+).
- **📝 Quick Log**: Fitur catatan lapangan super cepat per shot (berguna untuk *post-production*).
- **🚀 Zero Login**: Tidak perlu autentikasi. Sangat cepat diakses oleh tim.

---

## 🛠️ Tech Stack (Fase 1)

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (CSS Variables untuk Design System)
- **Data Storage**: LocalStorage API browser (prefix `onset_`)

---

## 🚀 Cara Menjalankan secara Lokal

1. **Clone repository ini** (jika ada di Git):
   ```bash
   git clone <repo-url>
   cd onset-creative-assistant
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. Buka browser di **[http://localhost:5173/](http://localhost:5173/)**.

---

## 🤖 Untuk AI Agents / LLMs

Jika Anda adalah AI Agent yang ditugaskan untuk membaca, memodifikasi, atau mengembangkan basis kode ini, silakan baca **[AGENTS.md](./AGENTS.md)**.
File `AGENTS.md` berisi detail lengkap mengenai arsitektur, struktur data, CSS variables, dan aturan wajib pengembangan (apa yang boleh dan tidak boleh dilakukan).

---

## 🛣️ Roadmap Fase Pengembangan

### ✅ Fase 1 (Current)
- Aplikasi inti selesai dibangun (Mobile-first, Dark mode).
- Penyimpanan via LocalStorage.
- Mode Tech ↔ Talent.
- Filter, progress bar, edit form.

### 🔜 Fase 2
- **Integrasi Google Sheets**: Menyimpan dan memuat data langsung ke/dari Google Sheets menggunakan backend proxy Node.js (untuk keperluan pelaporan ke tim manajemen klien).

### 🔜 Fase 3
- **Firebase Realtime Sync**: Sinkronisasi instan antar *device* di lokasi syuting. Layar Talent dapat otomatis bergulir mengikuti scene yang sedang dibuka oleh Director.

---

## 📝 Catatan Tambahan

Aplikasi ini merupakan **Internal Tool** dan dirancang untuk alur kerja yang sangat spesifik. Segala keputusan UI/UX (ukuran tombol besar, navigasi 1-tap) dibuat agar tim produksi bisa bergerak cepat tanpa membuang waktu menatap layar *smartphone* saat berada di set.
