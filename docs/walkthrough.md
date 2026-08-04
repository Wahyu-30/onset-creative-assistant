# ✅ Walkthrough — On-Set Creative Assistant (Fase 1)

**Status**: Build sukses · 0 errors · Server running

---

## 🚀 Cara Menjalankan

```bash
cd "/Users/wahyuahmadcahyadi/Desktop/HAI ON SET CREATIVE ASSISTANT/onset-creative-assistant"
npm run dev
```

Buka browser di: **http://localhost:5173/**

> Untuk diakses dari HP di jaringan WiFi yang sama: **http://192.168.1.99:5173/**

---

## 📁 Lokasi Project

```
Desktop/
└── HAI ON SET CREATIVE ASSISTANT/
    ├── PRD.md                          ← Dokumen requirements lengkap
    └── onset-creative-assistant/       ← Source code web app
        ├── src/
        │   ├── index.css               ← Design system global
        │   ├── App.jsx                 ← Router
        │   ├── data/sampleData.js      ← Data Project W & Grillme
        │   ├── hooks/                  ← useLocalStorage, useProjects, useShots
        │   ├── pages/
        │   │   ├── HomePage.jsx        ← Halaman daftar proyek
        │   │   └── ProductionPage.jsx  ← Halaman produksi utama
        │   └── components/
        │       ├── ProjectManager/     ← Form buat/edit proyek
        │       ├── ShotBoard/          ← ShotCard, ShotForm, QuickLog, StatusBadge
        │       ├── Navigation/         ← ModeToggle, FilterBar
        │       ├── ProgressBar/        ← ProductionProgress
        │       ├── TalentView/         ← ScriptView
        │       └── ImageViewer/        ← Fullscreen viewer
        └── package.json
```

---

## ✨ Fitur yang Sudah Dibangun

### 🏠 Home Page — Daftar Proyek
- List semua proyek aktif dengan progress bar mini
- Data sample sudah tersedia: **Project W** & **Grillme**
- Tombol **+** untuk buat proyek baru
- Swipe action: arsipkan atau hapus proyek (konfirmasi 2-tap)
- Section arsip yang bisa di-expand

### 📋 Form Proyek Baru
- Input: Nama proyek, Klien, Deadline
- Target Audience, Konsep/Ide Konten
- Panduan Gaya + Link Referensi (bisa tambah banyak)

### 🎬 Halaman Produksi (Tech View)
- **Header** sticky dengan nama proyek + tombol edit & tambah shot
- **Info Panel** (tap nama proyek) — lihat target audience, konsep, panduan gaya
- **Progress Bar** — `X dari Y Shot Selesai — Z%` dengan warna dinamis
- **Filter Bar** — filter cepat per scene (S1, S2...) dan per status
- **Shot Cards** — expand/collapse per shot dengan:
  - Scene number + shot type + angle
  - Status badge (⏳ PENDING / ✅ TAKE DONE / 🔄 REVISI)
  - Equipment chips (Gimbal, Lighting A, dll)
  - Dialog/naskah dengan badge instruksi berwarna (`<EKSPRESI KAGET>`)
  - Foto referensi (tap to fullscreen)
  - Quick link referensi eksternal
  - Catatan lapangan (kuning)
- **Tombol Take Done** — 1-tap ubah status ke DONE ✅
- **Tombol Revisi** — tandai shot perlu diulang 🔄
- **Quick Log** — input catatan cepat per shot
- **Tambah Shot** — form lengkap dengan pilihan shot type, angle, equipment chips

### 📝 Talent View (Mode Toggle)
- Toggle pill animasi: **🎬 Tech ↔ 📝 Talent**
- Tampilan bersih — semua info teknis disembunyikan
- Naskah/dialog dengan **font besar (20px, line-height 1.8)**
- Badge instruksi berwarna:
  - 🔴 Merah — ekspresi/aksi (`<EKSPRESI KAGET>`, `<EKSPRESI JAHIL>`)
  - 🟡 Kuning — nada bicara (`<NADA BICARA CEPAT>`, `<ANTUSIAS>`)
  - 🟢 Hijau — ekspresi positif (`<SENYUM HANGAT>`)
- Filter scene tetap tersedia di mode talent

### 🖼️ Image Viewer
- Tap foto referensi → fullscreen overlay
- Animasi spring masuk/keluar
- Tap di luar untuk tutup

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#080810` (deep dark) |
| Card | `#14142A` |
| Accent | `#6C63FF` (electric purple) |
| Done | `#00E676` (neon green) |
| Revisi | `#FF5252` (red) |
| Font | Inter + JetBrains Mono |
| Animasi | Framer Motion |

---

## 💾 Data Storage (Fase 1)

Semua data tersimpan di **localStorage** browser dengan prefix `onset_`:
- `onset_projects` — array semua proyek + shots

Data **tidak hilang** saat browser ditutup. Data hilang hanya jika:
- Clear browser cache/storage
- Buka di browser/device berbeda (Fase 3 akan fix ini)

---

## 🔜 Fase Berikutnya

| Fase | Fitur |
|---|---|
| **Fase 2** | Integrasi Google Sheets (Backend Node.js proxy) |
| **Fase 3** | Real-time sync multi-device via Firebase |

---

## 🐛 Known Issues & Catatan

- Data tersimpan per browser — belum sync antar device (Fase 3)
- Upload foto referensi belum tersedia — URL foto bisa dimasukkan manual (Fase 2)
- Drag & drop reorder shot belum ada (Fase 2)

---

*Dibangun: 4 Agustus 2026 | Fase 1 Complete ✅*
