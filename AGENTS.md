# AGENTS.md — On-Set Creative Assistant

> Dokumen ini ditujukan untuk AI agents yang bekerja pada codebase ini.
> Baca seluruh dokumen ini sebelum membuat perubahan apapun.

---

## 🎯 Tujuan Proyek

**On-Set Creative Assistant** adalah internal web app mobile-first untuk tim produksi video (Director, Videografer, Talent). Menggantikan kertas kerja fisik / Google Docs saat pengambilan gambar di lapangan.

**Live URL**: https://onset-creative-assistant.vercel.app  
**Stack**: Vite + React, Vanilla CSS, Framer Motion, React Router DOM, Supabase  
**Storage**: ~~localStorage (Fase 1)~~ → **Supabase PostgreSQL + Real-time WebSocket (Fase 2 — AKTIF)**

---

## 📁 Struktur Folder

```
onset-creative-assistant/
├── index.html                          ← Entry HTML, mobile viewport meta
├── package.json
├── vite.config.js
├── vercel.json                         ← SPA routing fallback config
├── .env.local                          ← Supabase credentials (JANGAN commit ke Git)
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
    ├── services/                       ← [BARU - Fase 2] Layer komunikasi database
    │   ├── supabaseClient.js           ← Inisialisasi Supabase client (baca dari .env)
    │   ├── projectsService.js          ← CRUD untuk tabel `projects` di Supabase
    │   └── shotsService.js             ← CRUD untuk tabel `shots` di Supabase
    │
    ├── hooks/
    │   ├── useLocalStorage.js          ← [TIDAK LAGI DIPAKAI] Legacy localStorage wrapper
    │   ├── useProjects.js              ← CRUD proyek via Supabase (async)
    │   └── useShots.js                 ← CRUD shots + real-time subscription + progress calc
    │
    ├── pages/
    │   ├── HomePage.jsx + .css         ← Daftar semua proyek (active & archived)
    │   └── ProductionPage.jsx + .css   ← Halaman produksi utama, orchestrates semua komponen
    │
    └── components/
        ├── ErrorBoundary/
        │   └── ErrorBoundary.jsx       ← React Error Boundary (mencegah black screen crash)
        │
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

## 🗄️ Arsitektur Database (Fase 2)

### Skema Tabel Supabase

#### Tabel `projects`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | TEXT | Nama proyek |
| `client` | TEXT | Nama klien |
| `createdAt` | TEXT | Format YYYY-MM-DD |
| `deadline` | TEXT | Format YYYY-MM-DD |
| `status` | TEXT | `active` atau `archived` |
| `targetAudience` | TEXT | Target penonton |
| `concept` | TEXT | Konsep konten |
| `styleGuide` | JSONB | `{notes, images[], links[]}` |

#### Tabel `shots`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `project_id` | UUID FK | References `projects(id)` ON DELETE CASCADE |
| `scene` | INTEGER | Nomor scene |
| `sceneLabel` | TEXT | Label tampilan `"Scene 1"` |
| `shotType` | TEXT | `Close Up`, `Wide`, dll |
| `angle` | TEXT | `Eye Level`, `Top Down`, dll |
| `equipment` | TEXT[] | Array nama alat |
| `briefAction` | TEXT | Deskripsi aksi |
| `dialog` | TEXT | Naskah (bisa mengandung `<TAG>`) |
| `referenceImages` | TEXT[] | Array URL gambar |
| `referenceLinks` | TEXT[] | Array URL eksternal |
| `status` | TEXT | `PENDING`, `TAKE_DONE`, `REVISI` |
| `notes` | TEXT | Catatan lapangan |
| `updatedAt` | TIMESTAMPTZ | Auto-updated |

> **PENTING**: Semua nama kolom yang CamelCase (e.g. `createdAt`, `sceneLabel`) harus ditulis dengan tanda kutip ganda di SQL (`"createdAt"`) karena PostgreSQL case-sensitive dalam mode quoted identifier.

### Alur Data (Fase 2)
```
Supabase PostgreSQL (Cloud)
    ↑↓ REST API / WebSocket
Services Layer (projectsService.js, shotsService.js)
    ↑↓ async calls
Hooks (useProjects.js, useShots.js)
    ↑↓ state + realtime subscription
Components / Pages
```

### Real-time Pattern
`useShots.js` berlangganan (subscribe) ke channel Supabase:
```js
supabase.channel(`public:shots:project_id=eq.${projectId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'shots', filter: `project_id=eq.${projectId}` }, handler)
  .subscribe()
```
Ini memastikan perubahan `INSERT`, `UPDATE`, `DELETE` pada shots dibroadcast ke semua klien yang sedang membuka proyek yang sama.

---

## 🧩 Schema Data (untuk referensi komponen)

### Schema Project (state di React)
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
    images: [],                    // array URL string
    links: []                      // array URL string
  }
  // Catatan: field `shots` TIDAK ada di dalam object project
  // Shots diambil terpisah via useShots(projectId)
}
```

### Schema Shot (state di React)
```js
{
  id: "uuid-string",
  project_id: "uuid-string",       // FK ke projects
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
  updatedAt: "2026-08-05T..."      // ISO datetime string
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
5. **Animasi via Framer Motion** — jangan pakai CSS animation untuk transisi komponen besar
6. **Update AGENTS.md & PRD.md** jika mengubah fitur atau struktur data
7. **Operasi database via Services** — jangan panggil Supabase client langsung dari komponen/hook, selalu lewat `projectsService` atau `shotsService`
8. **Optimistic UI** — update state lokal dulu sebelum menunggu konfirmasi dari Supabase untuk pengalaman yang mulus

### ❌ JANGAN lakukan:
1. Jangan install TailwindCSS atau CSS framework lain
2. Jangan hapus atau ubah CSS variables di `:root`
3. Jangan buat state management global (Redux, Zustand, dll) — hooks sudah cukup
4. Jangan ubah struktur data Shot atau Project tanpa update schema di dokumen ini
5. Jangan tambahkan autentikasi — ini internal tool tanpa login
6. Jangan pakai `useLocalStorage` untuk data baru — sudah digantikan Supabase
7. Jangan panggil Supabase client langsung dari komponen — selalu lewat services layer
8. Jangan hardcode credentials Supabase di kode sumber — selalu baca dari `import.meta.env`

---

## 🛣️ Routing

| Route | Komponen | Deskripsi |
|---|---|---|
| `/` | `HomePage` | Daftar semua proyek |
| `/production/:projectId` | `ProductionPage` | Halaman produksi per proyek |
| `*` | Redirect ke `/` | Fallback |

---

## 🔄 State Management

State dikelola sepenuhnya via React hooks + Supabase. Tidak ada global state.

```
ProductionPage (state utama)
├── mode: 'tech' | 'talent'
├── activeScene: number | null
├── activeStatus: 'ALL' | 'PENDING' | 'TAKE_DONE' | 'REVISI'
├── showShotForm: boolean
├── showEditProject: boolean
└── showProjectInfo: boolean

useShots(projectId) → shots[], progress stats, CRUD functions, loading, error
  └── Supabase real-time subscription (WebSocket)
useProjects() → projects[], CRUD functions, loading, error
  └── Supabase REST API
```

---

## 🔜 Histori & Fase Pengembangan

### ✅ Fase 1 (Selesai) — UI/UX & Core Fixes
- **Referensi Visual & UX**: Indikator referensi (🔗/📷/🎬) di kartu collapsed, tap-to-zoom dengan `framer-motion`.
- **Smart Image Fallback**: Menangani hotlink protection (Pinterest/IG) dengan merubah image yang `onError` menjadi tombol eksternal.
- **Google Drive In-App Viewer**: Link Google Drive dikonversi menjadi `<iframe>` modal overlay secara otomatis agar kru tidak terlempar keluar dari web.
- **Fitur Hapus**: Hapus shot dengan konfirmasi 2-tap (aman dari misclick).
- **Stability**: Penambahan `vercel.json` untuk SPA routing fallback dan `ErrorBoundary` React untuk mencegah black screen jika terjadi JS crash.

### ✅ Fase 2 (Selesai) — Supabase Real-time Sync
- **Migrasi Database**: Data dipindahkan dari `localStorage` ke Supabase PostgreSQL.
- **Tabel Terpisah**: `projects` dan `shots` di-normalize ke tabel terpisah untuk query yang lebih efisien.
- **Services Layer**: Dibuat `src/services/` untuk memisahkan logika database dari UI.
- **Real-time WebSocket**: `useShots` subscribe ke Supabase Channel sehingga semua perangkat sinkron instan.
- **Optimistic Updates**: UI diperbarui seketika tanpa menunggu konfirmasi server.
- **Loading States**: `HomePage` dan `ProductionPage` menampilkan loading state saat fetch awal.
- **Sample Data Injector**: Tombol "Isi Data Sample" untuk mengisi database kosong sekali klik.

### 🔜 Fase 3 (Rencana)
- **Google Sheets Import**: Import shot list dari template Excel/Sheets ke Supabase
- **Ekspor PDF**: Generate Call Sheet / Shot List sebagai PDF
- **Dashboard**: Ringkasan progress semua proyek dalam satu layar

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run dev server (localhost:5173)
npm run dev

# Build untuk production
npm run build

# Deploy ke Vercel (sudah auto-deploy via Git push)
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
  "lucide-react": "^0.400+",
  "@supabase/supabase-js": "^2"
}
```

---

## 🌐 Environment Variables

| Variabel | Keterangan |
|---|---|
| `VITE_SUPABASE_URL` | URL Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Anon/Public key Supabase (aman diekspos ke browser) |

File `.env.local` untuk development lokal, dan harus didaftarkan di **Vercel → Settings → Environment Variables** untuk production.

---

## 🐛 Known Issues

1. **Upload foto referensi** belum tersedia — field `referenceImages` masih input URL manual
2. **Jumlah shot di halaman utama** selalu 0/0 — karena shots diambil terpisah (by project_id) dan tidak di-embed di dalam object project untuk performa
3. **Drag & drop reorder shot** belum ada (rencana Fase 3)

---

*Last updated: Agustus 2026 | Fase 1 ✅ | Fase 2 ✅ (Supabase Real-time)*
