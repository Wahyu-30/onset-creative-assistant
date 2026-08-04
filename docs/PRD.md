# PRD — On-Set Creative Assistant
**Product Requirements Document**  
Versi: 1.1 | Dibuat: Agustus 2026 | Diperbarui: Agustus 2026  
Owner: Wahyu & Tim Creative

---

## 1. Latar Belakang & Masalah

Tim creative (Director, Videografer, Talent) saat ini menggunakan dokumen fisik / Google Docs saat produksi video di lapangan. Masalah yang muncul:
- Sulit memantau shot mana yang sudah diambil secara real-time
- Talent harus mencari naskah di antara banyak informasi teknis
- Catatan lapangan (notes) tidak tersimpan dengan rapi dan sering hilang
- Kertas rentan kotor/rusak di lapangan

---

## 2. Solusi

**On-Set Creative Assistant** — aplikasi web internal mobile-first yang menggantikan dokumen fisik dengan antarmuka interaktif. Diakses melalui browser di HP masing-masing anggota tim.

---

## 3. Pengguna (Users)

| Role | Kebutuhan Utama |
|---|---|
| **Director** | Melihat semua shot, memantau progress keseluruhan, memandu videografer |
| **Videografer** | Detail teknis kamera, equipment, brief action per shot, ubah status shot |
| **Talent** | Naskah bersih tanpa distraksi teknis, font besar, mudah dibaca dari jarak 0.5–1m |

---

## 4. Keputusan Final Teknis

> Semua keputusan di bawah sudah dikonfirmasi bersama owner.

### 4.1 Penyimpanan Data

| Fase | Teknologi | Status |
|---|---|---|
| **Fase 1** | localStorage (browser) | ✅ Dibangun sekarang |
| **Fase 2** | Google Sheets via Backend Proxy (Node.js + Service Account) | 🔜 Berikutnya |
| **Fase 3** | Firebase Realtime Database | 🔜 Opsional |

**Alasan pilih Backend Proxy untuk Fase 2:**
- Tim tidak perlu login Google Account → UX lebih simpel
- Satu service account untuk seluruh tim
- API key tersimpan aman di server, tidak terekspos ke browser

### 4.2 Real-time Sync Multi-Device (Fase 3)

- Menggunakan **Firebase Realtime Database**
- Auto-scroll layar Talent mengikuti shot aktif Director
- Indikator online presence tim

### 4.3 Input Data

- ✅ Manual input via form di web app (buat proyek & shot langsung dari app)
- ✅ Import dari Google Sheets yang sudah ada (Fase 2)

### 4.4 Autentikasi

- **Tidak ada login** — internal tool, langsung buka di browser
- Tidak perlu install sebagai PWA, cukup buka via browser

### 4.5 Framework Frontend

- **Vite + React** — untuk kemudahan development dan maintenance jangka panjang

---

## 5. Konteks Multi-Proyek

Tim creative menaungi beberapa klien secara bersamaan, antara lain:
- **Grillme** (berbagai outlet)
- **Project W**
- **Om Jack**
- Dan klien-klien baru ke depannya

Setiap klien bisa memiliki lebih dari satu proyek/video. Tim mengerjakan proyek **satu per satu secara berurutan** (misal: selesaikan Grillme dulu, baru Project W). App mendukung penyimpanan banyak proyek sekaligus dengan kemampuan switch antar proyek.

**Workflow tim:**
1. Manajer klien menyerahkan brief / lembar kertas kerja
2. Tim creative input data ke app
3. Di lokasi syuting, tim buka app di HP → tracking progress real-time
4. Setelah selesai → proyek diarsipkan

---

## 6. Prinsip Desain

- **Mobile-First**: Dioptimalkan untuk layar HP (375px — 428px)
- **Dark Mode Default**: Hemat baterai + nyaman di area pencahayaan ekstrem
- **Zero Login**: Langsung buka di browser, tidak perlu autentikasi
- **Offline Ready**: Data tersimpan di browser (localStorage), tetap bisa dipakai walau sinyal lemah
- **Speed**: Operasi utama (ubah status shot) harus bisa dilakukan dalam 1–2 tap
- **Tidak perlu install**: Cukup akses via browser, tidak perlu di-install ke homescreen

---

## 7. Fitur & Modul

### 7.1 Modul Manajemen Proyek

**Halaman awal untuk memilih atau membuat proyek baru.**

**Fitur:**
- Daftar semua proyek aktif dengan progress bar mini
- Buat proyek baru via form
- Edit detail proyek
- Arsipkan proyek selesai
- Hapus proyek (dengan konfirmasi 2-tap)
- Import dari Google Sheets (Fase 2)

**Data per Proyek:**
- Nama proyek & klien
- Tanggal & deadline
- Target audience
- Konsep/ide konten
- Panduan gaya (catatan + link referensi)
- Daftar shot

---

### 7.2 Modul Mode Videografer & Director (Tech View)

**Tampilan utama di lapangan untuk Director dan Videografer.**

#### Progress Bar Produksi (sticky di atas)
- Tampilkan: `X dari Y Shot Selesai — Z%`
- Gradient bar animasi (merah → kuning → hijau sesuai progress)
- Tampilkan ringkasan: PENDING / DONE / REVISI count

#### Filter & Navigasi
- Filter by Scene (pill tabs: Scene 1, 2, 3...)
- Filter by Status (PENDING / DONE / REVISI / Semua)
- Kombinasi filter dibolehkan

#### Shot Card (per shot)

| Field | Detail |
|---|---|
| Scene & Shot ID | Nomor scene + label |
| Status Badge | 🟡 PENDING / ✅ TAKE DONE / 🔄 REVISI |
| Shot Type & Angle | Close Up, Wide, Top Down, dll |
| Equipment | Chips/tag per alat |
| Brief Action | Deskripsi singkat gerakan |
| Dialog/Naskah | Teks talent dengan badge instruksi |
| Foto Referensi | Tap to zoom fullscreen. Mendukung smart-fallback (menjadi tombol link eksternal) jika hotlink diblokir (misal Pinterest/IG). Mendukung In-App Iframe Preview khusus untuk link share Google Drive. |
| Link Referensi | Quick link ke TikTok/Reels/dokumen |
| Hapus Shot | Tombol trash dengan konfirmasi 2-tap untuk menghapus shot. |
| Quick Log | Catatan lapangan per shot |

#### Tombol Status
- **Take Done** — ubah status → TAKE DONE (hijau neon)
- **Revisi** — tandai perlu diulang (merah)
- Tap ulang untuk undo ke PENDING

#### Quick Log / Catatan Lapangan
- Input teks singkat per shot, tersimpan otomatis
- Contoh: *"Take 3 paling optimal"*, *"Lighting berlebih"*
- Terlihat sebagai catatan kuning di shot card
- Berguna sebagai referensi untuk editor saat post-production

---

### 7.3 Modul Mode Talent (Script View)

**Tampilan bersih khusus Talent membaca naskah.**

#### Mode Toggle
- Tombol pill di header: 🎬 Tech ↔ 📝 Talent
- Transisi animasi smooth, status tersimpan per session

#### Clean Script UI
- Sembunyikan: equipment, angle kamera, jenis shot, catatan teknis
- Tampilkan: nomor scene, brief singkat, naskah/dialog lengkap
- Tampilkan instruksi aksi/ekspresi dengan badge berwarna:

| Tag | Warna | Contoh |
|---|---|---|
| `<EKSPRESI KAGET>` | 🔴 Merah | Ekspresi mendadak |
| `<NADA BICARA CEPAT>` | 🟡 Kuning | Instruksi suara |
| `<SENYUM HANGAT>` | 🟢 Hijau | Ekspresi positif |
| `<ANTUSIAS>` | 🟡 Kuning | Energi tinggi |
| `<EKSPRESI JAHIL>` | 🔴 Merah | Ekspresi nakal |

#### Tipografi Talent
- Font size: 18–22px, line height: 1.8
- Optimal dibaca dari jarak 0.5–1m

---

### 7.4 Modul Image Viewer

- Tap foto referensi → fullscreen overlay
- Animasi spring masuk/keluar
- Tap di luar gambar untuk tutup

---

### 7.5 Modul Tambah / Edit Shot

- Form lengkap per shot (scene, shot type, angle, equipment, dialog, dll)
- Tambah dari halaman produksi
- Reorder shot (drag & drop — Fase 2)

---

## 8. Struktur Data

### Proyek (Project)
```json
{
  "id": "uuid",
  "name": "Grillme — Secret Promo",
  "client": "Grillme Gajahmada",
  "createdAt": "2026-06-04",
  "deadline": "2026-06-05",
  "status": "active",
  "targetAudience": "...",
  "concept": "...",
  "styleGuide": {
    "notes": "untuk referensi angle ajaa",
    "images": [],
    "links": ["https://..."]
  },
  "shots": [...]
}
```

### Shot
```json
{
  "id": "uuid",
  "scene": 1,
  "sceneLabel": "Scene 1",
  "shotType": "Close Up",
  "angle": "Eye Level",
  "equipment": ["Gimbal", "Lighting A"],
  "briefAction": "Talent masuk ke bar",
  "dialog": "come make your coffee with us!",
  "referenceImages": [],
  "referenceLinks": ["https://..."],
  "status": "PENDING",
  "notes": "Take 3 paling optimal",
  "updatedAt": "2026-08-04T10:00:00Z"
}
```

### Status Enum
| Value | Label | Warna |
|---|---|---|
| `PENDING` | PENDING | Abu-abu |
| `TAKE_DONE` | TAKE DONE | Hijau neon |
| `REVISI` | REVISI | Merah |

---

## 9. Arsitektur Teknis

### Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vite + React |
| Routing | React Router DOM |
| Animasi | Framer Motion |
| Icons | Lucide React |
| Styling | Vanilla CSS (dark mode, glassmorphism) |
| Storage Fase 1 | localStorage (prefix: `onset_`) |
| Storage Fase 2 | Google Sheets API v4 via Node.js proxy |
| Real-time Fase 3 | Firebase Realtime Database |

### Struktur Folder

```
onset-creative-assistant/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css                  ← Global design system
│   ├── data/
│   │   └── sampleData.js
│   ├── utils/
│   │   └── uuid.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   ├── useProjects.js
│   │   └── useShots.js
│   ├── pages/
│   │   ├── HomePage.jsx           ← Daftar semua proyek
│   │   └── ProductionPage.jsx     ← Halaman produksi utama
│   └── components/
│       ├── ProjectManager/
│       │   └── ProjectForm.jsx
│       ├── ShotBoard/
│       │   ├── ShotCard.jsx
│       │   ├── ShotCard.css
│       │   ├── StatusBadge.jsx
│       │   ├── QuickLog.jsx
│       │   └── ShotForm.jsx
│       ├── Navigation/
│       │   ├── ModeToggle.jsx
│       │   └── FilterBar.jsx
│       ├── ProgressBar/
│       │   └── ProductionProgress.jsx
│       ├── TalentView/
│       │   └── ScriptView.jsx
│       └── ImageViewer/
│           └── ImageViewer.jsx
```

---

## 10. Fase Pengembangan

### ✅ Fase 1 — Core App (SEKARANG)
| Item | Status |
|---|---|
| Global CSS design system | ✅ Selesai |
| Data layer (localStorage hooks) | ✅ Selesai |
| Sample data Project W & Grillme | ✅ Selesai |
| HomePage — daftar proyek | ✅ Selesai |
| ProjectForm — buat/edit proyek | ✅ Selesai |
| StatusBadge | ✅ Selesai |
| ShotCard (expand/collapse, status, log) | ✅ Selesai |
| QuickLog — catatan lapangan | ✅ Selesai |
| ImageViewer — fullscreen foto | ✅ Selesai |
| ModeToggle — Tech ↔ Talent | ✅ Selesai |
| ModeToggle CSS | 🔄 In Progress |
| FilterBar — filter scene & status | 🔄 In Progress |
| ProductionProgress — progress bar | 🔄 In Progress |
| TalentView / ScriptView | 🔄 In Progress |
| ShotForm — tambah shot baru | 🔄 In Progress |
| ProductionPage — halaman utama produksi | 🔄 In Progress |

### 🔜 Fase 2 — Google Sheets Integration
- Backend Node.js proxy server
- Service account Google
- Import & sync shot list ke/dari Sheets
- Update status & notes otomatis ke Sheets

### 🔜 Fase 3 — Real-time Multi-Device
- Firebase Realtime Database setup
- Auto-scroll Talent mengikuti shot aktif Director
- Presence indicator (siapa online)

---

## 11. UX Decisions

| Keputusan | Alasan |
|---|---|
| Dark mode default, tidak bisa dimatikan | Kondisi lapangan: luar ruangan / studio dengan pencahayaan khusus |
| Tombol Take Done besar | Kecepatan 1-tap di lapangan tanpa perlu zoom |
| No login | Internal tool, tim sudah saling percaya |
| localStorage dulu | Tidak bergantung internet, langsung pakai hari ini |
| Mode toggle di header | Switching cepat antar Director dan Talent |
| Badge ekspresi berwarna | Talent perlu mengenali instruksi dari jarak baca |
| Arsipkan bukan hapus | Riwayat kerja perlu disimpan untuk referensi |
| Konfirmasi hapus 2-tap | Hindari hapus data tidak sengaja di lapangan |

---

## 12. Aturan Pengembangan (untuk AI / Developer)

1. **Mobile-first always** — semua komponen didesain untuk layar 375px terlebih dahulu
2. **Dark mode permanen** — tidak ada light mode toggle
3. **Jangan ubah struktur data** tanpa update PRD ini
4. **localStorage key prefix** — gunakan `onset_` untuk semua key
5. **Komponen harus reusable** — ShotCard tidak boleh ada logika spesifik per proyek
6. **Animasi ringan** — gunakan framer-motion, hindari animasi berat di HP lama
7. **Offline-first** — app berjalan tanpa internet (kecuali fitur Fase 2/3)
8. **Fase terpisah** — kode Fase 1 tidak boleh bergantung Fase 2/3
9. **Semua file project** — disimpan di folder Desktop: `HAI ON SET CREATIVE ASSISTANT/onset-creative-assistant/`

---

## 13. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | Agustus 2026 | Dokumen awal dibuat |
| 1.1 | Agustus 2026 | Keputusan final dikonfirmasi: localStorage Fase 1, Backend Proxy Fase 2, Firebase Fase 3. Multi-proyek (Grillme, Project W, Om Jack). No login, no PWA install. Fase pengembangan dilengkapi. Aturan developer ditambahkan. |
