# AGENTS.md — On-Set Creative Assistant

> Dokumen ini ditujukan untuk AI agents yang bekerja pada codebase ini.
> Baca seluruh dokumen ini sebelum membuat perubahan apapun.

---

## 🎯 Tujuan Proyek

**On-Set Creative Assistant** adalah internal web app mobile-first untuk tim produksi video (Director, Videografer, Talent). Menggantikan kertas kerja fisik / Google Docs saat pengambilan gambar di lapangan.

**Live URL**: https://onset-creative-assistant.vercel.app  
**Stack**: Vite + React, Vanilla CSS, Framer Motion, React Router DOM  
**Storage**: localStorage (Fase 1) → Google Sheets (Fase 2) → Firebase (Fase 3)

---

## 📁 Struktur Folder

```
onset-creative-assistant/
├── index.html                          ← Entry HTML, mobile viewport meta
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                        ← ReactDOM root, BrowserRouter wrapper
    ├── App.jsx                         ← Route definitions (/ dan /production/:projectId)
    ├── index.css                       ← SELURUH design system (CSS variables, utilities)
    │
    ├── data/
    │   └── sampleData.js               ← Sample data Project W & Grillme + STATUS_CONFIG
    │
    ├── utils/
    │   └── uuid.js                     ← Simple UUID v4 generator (tanpa library)
    │
    ├── hooks/
    │   ├── useLocalStorage.js          ← localStorage wrapper, prefix: onset_
    │   ├── useProjects.js              ← CRUD proyek, uses useLocalStorage
    │   └── useShots.js                 ← CRUD shots + progress calc, uses useProjects
    │
    ├── pages/
    │   ├── HomePage.jsx + .css         ← Daftar semua proyek (active & archived)
    │   └── ProductionPage.jsx + .css   ← Halaman produksi utama, orchestrates semua komponen
    │
    └── components/
        ├── ProjectManager/
        │   └── ProjectForm.jsx         ← Modal form buat/edit proyek
        │
        ├── ShotBoard/
        │   ├── ShotCard.jsx + .css     ← Kartu shot (expand/collapse, status, log, dialog)
        │   ├── StatusBadge.jsx         ← Badge status PENDING/TAKE_DONE/REVISI
        │   ├── QuickLog.jsx + .css     ← Input catatan lapangan per shot
        │   └── ShotForm.jsx + .css     ← Modal form tambah/edit shot
        │
        ├── Navigation/
        │   ├── ModeToggle.jsx + .css   ← Pill toggle: Tech ↔ Talent mode
        │   └── FilterBar.jsx + .css    ← Filter per scene dan per status
        │
        ├── ProgressBar/
        │   └── ProductionProgress.jsx + .css  ← Progress bar produksi dengan stats
        │
        ├── TalentView/
        │   └── ScriptView.jsx + .css   ← Tampilan naskah bersih untuk Talent
        │
        └── ImageViewer/
            └── ImageViewer.jsx + .css  ← Fullscreen overlay untuk foto referensi
```

---

## 🧩 Arsitektur Data

### Alur Data
```
localStorage (onset_projects)
    ↓
useLocalStorage hook
    ↓
useProjects hook (CRUD project)
    ↓
useShots hook (CRUD shots + progress)
    ↓
Components (read/write via hooks)
```

### Schema Project
```js
{
  id: "uuid-string",
  name: "Project W — Americano",
  client: "Project W",
  createdAt: "2026-07-07",         // ISO date string YYYY-MM-DD
  deadline: "2026-07-10",
  status: "active",                // "active" | "archived"
  targetAudience: "string",
  concept: "string",
  styleGuide: {
    notes: "string",
    images: [],                    // array URL string (Fase 2)
    links: []                      // array URL string
  },
  shots: [Shot]
}
```

### Schema Shot
```js
{
  id: "uuid-string",
  scene: 1,                        // number (urutan scene)
  sceneLabel: "Scene 1",           // label yang tampil di UI
  shotType: "Close Up",
  angle: "Eye Level",
  equipment: ["Gimbal", "Lighting A"],
  briefAction: "string",
  dialog: "string",                // bisa mengandung <TAG> untuk instruksi talent
  referenceImages: [],             // array URL
  referenceLinks: [],              // array URL
  status: "PENDING",               // "PENDING" | "TAKE_DONE" | "REVISI"
  notes: "string",                 // catatan lapangan
  updatedAt: null                  // ISO datetime string atau null
}
```

### Dialog Tag System
Tag dalam format `<NAMA TAG>` di field `dialog` akan di-parse oleh `ShotCard` dan `ScriptView` menjadi badge berwarna:
- `<EKSPRESI ...>`, `<AKSI ...>` → Merah (talent-action)
- `<NADA ...>`, `<CEPAT>`, `<LAMBAT>`, `<ANTUSIAS>` → Kuning (talent-tone)
- `<SENYUM ...>`, `<HANGAT>`, `<TAWA>` → Hijau (talent-positive)

---

## 🎨 Design System (index.css)

**Semua styling menggunakan CSS Variables dari `:root` di `index.css`.**

Jangan hardcode warna apapun di komponen. Selalu gunakan variable:

| Variable | Nilai | Kegunaan |
|---|---|---|
| `--bg-base` | `#080810` | Background utama |
| `--bg-card` | `#14142A` | Card/surface |
| `--accent-primary` | `#6C63FF` | Warna aksen utama |
| `--accent-secondary` | `#A78BFA` | Aksen sekunder |
| `--status-done` | `#00E676` | Status TAKE_DONE |
| `--status-revisi` | `#FF5252` | Status REVISI |
| `--status-pending` | `#78909C` | Status PENDING |
| `--text-primary` | `#E8E8F4` | Teks utama |
| `--text-secondary` | `#8888AA` | Teks sekunder |
| `--text-muted` | `#55556A` | Teks redup |
| `--border-card` | `rgba(255,255,255,0.08)` | Border card |
| `--border-active` | `rgba(108,99,255,0.5)` | Border fokus/aktif |

---

## ⚙️ Aturan Wajib untuk AI Agents

### ✅ HARUS dilakukan:
1. **Mobile-first always** — desain untuk 375px, baru scale up
2. **Dark mode permanen** — tidak ada toggle light mode, jangan tambahkan
3. **Gunakan CSS variables** — jangan hardcode warna
4. **Gunakan hooks yang ada** — `useProjects` dan `useShots` untuk semua operasi data
5. **localStorage key prefix `onset_`** — jangan buat key baru tanpa prefix ini
6. **Animasi via Framer Motion** — jangan pakai CSS animation untuk transisi komponen besar
7. **Update PRD.md** di folder Desktop jika mengubah fitur atau struktur data

### ❌ JANGAN lakukan:
1. Jangan install TailwindCSS atau CSS framework lain
2. Jangan hapus atau ubah CSS variables di `:root`
3. Jangan buat state management global (Redux, Zustand, dll) — hooks sudah cukup
4. Jangan ubah struktur data Shot atau Project tanpa update schema di dokumen ini
5. Jangan tambahkan autentikasi — ini internal tool tanpa login
6. Jangan pakai `any` di TypeScript (jika project dimigrasi ke TS)
7. Jangan ubah nama `localStorage` keys yang sudah ada

---

## 🛣️ Routing

| Route | Komponen | Deskripsi |
|---|---|---|
| `/` | `HomePage` | Daftar semua proyek |
| `/production/:projectId` | `ProductionPage` | Halaman produksi per proyek |
| `*` | Redirect ke `/` | Fallback |

---

## 🔄 State Management

State dikelola sepenuhnya via React hooks + localStorage. Tidak ada global state.

```
ProductionPage (state utama)
├── mode: 'tech' | 'talent'
├── activeScene: number | null
├── activeStatus: 'ALL' | 'PENDING' | 'TAKE_DONE' | 'REVISI'
├── showShotForm: boolean
├── showEditProject: boolean
└── showProjectInfo: boolean

useShots(projectId) → shots, progress stats, CRUD functions
useProjects() → projects, CRUD functions
```

---

## 🔜 Histori & Fase Pengembangan Berikutnya

### ✅ Fase 1 (Selesai) — UI/UX & Core Fixes
- **Referensi Visual & UX**: Indikator referensi (🔗/📷/🎬) di kartu collapsed, tap-to-zoom dengan `framer-motion`, dan perbaikan CSS clipping bug (`expandOverflow`).
- **Smart Image Fallback**: Menangani hotlink protection (Pinterest/IG) dengan merubah image yang `onError` menjadi tombol eksternal.
- **Google Drive In-App Viewer**: Link Google Drive dikonversi menjadi `<iframe>` modal overlay secara otomatis agar kru tidak terlempar keluar dari web.
- **Fitur Hapus**: Hapus shot dengan konfirmasi 2-tap (aman dari misclick).
- **Stability**: Penambahan `vercel.json` untuk SPA routing fallback dan `ErrorBoundary` React untuk mencegah black screen jika terjadi JS crash.

### Fase 2 — Google Sheets Integration
- Buat `src/services/sheetsAPI.js` — proxy ke backend Node.js
- Backend: `server/index.js` (Node.js + Express + Google APIs)
- Jangan ubah hooks yang ada — tambahkan layer sync di atasnya
- Env vars yang dibutuhkan: `GOOGLE_SERVICE_ACCOUNT_KEY`, `SPREADSHEET_ID`

### Fase 3 — Firebase Real-time Sync
- Buat `src/services/realtimeSync.js`
- Firebase package: `firebase`
- Auto-scroll talent mengikuti shot aktif Director
- Env vars: `VITE_FIREBASE_*`

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run dev server (localhost:5173)
npm run dev

# Build untuk production
npm run build

# Deploy ke Vercel
npx vercel --prod

# Preview build lokal
npm run preview
```

---

## 📦 Dependencies

```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "framer-motion": "^11",
  "lucide-react": "^0.400+"
}
```

---

## 🐛 Known Issues (Fase 1)

1. **Upload foto referensi** belum tersedia — field `referenceImages` kosong, harus input URL manual
2. **Data tidak sync antar device** — localStorage per browser (akan fix di Fase 3)
3. **Drag & drop reorder shot** belum ada (akan tambah di Fase 2)
4. **No offline cache** — meski data di localStorage, assets (JS/CSS) butuh internet jika belum di-cache browser

---

*Last updated: Agustus 2026 | Fase 1 Complete*
