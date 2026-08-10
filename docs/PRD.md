# PRD — On-Set Creative Assistant
**Product Requirements Document**  
Versi: 2.0 | Dibuat: Agustus 2026 | Diperbarui: Agustus 2026  
Owner: Wahyu & Tim Creative

---

## 1. Latar Belakang & Masalah

Tim creative (Director, Videografer, Talent) saat ini menggunakan dokumen fisik / Google Docs saat produksi video di lapangan. Masalah yang muncul:
- Sulit memantau shot mana yang sudah diambil secara real-time
- Talent harus mencari naskah di antara banyak informasi teknis
- Catatan lapangan (notes) tidak tersimpan dengan rapi dan sering hilang
- Kertas rentan kotor/rusak di lapangan
- Data tidak sinkron antar device — setiap anggota tim punya data berbeda di browsernya

---

## 2. Solusi

**On-Set Creative Assistant** — aplikasi web internal mobile-first yang menggantikan dokumen fisik dengan antarmuka interaktif, tersinkronisasi secara real-time ke seluruh perangkat tim. Diakses melalui browser di HP masing-masing anggota tim tanpa perlu login.

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
| **Fase 1** | localStorage (browser) | ✅ Selesai |
| **Fase 2** | Supabase PostgreSQL + Real-time WebSocket | ✅ Selesai — AKTIF |
| **Fase 3** | Google Sheets Import / PDF Export | 🔜 Rencana |

**Alasan pilih Supabase untuk Fase 2:**
- Real-time WebSocket native tanpa konfigurasi tambahan
- Database PostgreSQL yang bisa di-query langsung dari browser (via anon key)
- Tidak perlu backend server tambahan — lebih sederhana dari Backend Proxy
- Gratis untuk skala internal tool tim kecil (free tier cukup)
- Region Singapore tersedia untuk latensi rendah

### 4.2 Real-time Sync Multi-Device

- Menggunakan **Supabase Channels** (WebSocket `postgres_changes`)
- Setiap perubahan status shot (TAKE_DONE, REVISI) otomatis broadcast ke semua perangkat yang membuka proyek yang sama
- Tanpa perlu refresh halaman
- Latensi < 500ms dalam kondisi jaringan normal

### 4.3 Input Data

- ✅ Manual input via form di web app (buat proyek & shot langsung dari app)
- 🔜 Import dari Google Sheets yang sudah ada (Fase 3)

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

Setiap klien bisa memiliki lebih dari satu proyek/video. Tim mengerjakan proyek **satu per satu secara berurutan**. App mendukung penyimpanan banyak proyek sekaligus dengan kemampuan switch antar proyek.

**Workflow tim:**
1. Manajer klien menyerahkan brief / lembar kertas kerja
2. Tim creative input data ke app
3. Di lokasi syuting, tim buka app di HP → tracking progress real-time, sinkron ke semua HP
4. Setelah selesai → proyek diarsipkan

---

## 6. Prinsip Desain

- **Mobile-First**: Dioptimalkan untuk layar HP (375px — 428px)
- **Dark Mode Default**: Hemat baterai + nyaman di area pencahayaan ekstrem
- **Zero Login**: Langsung buka di browser, tidak perlu autentikasi
- **Cloud-First**: Data tersimpan di Supabase cloud, dapat diakses dari perangkat manapun
- **Speed**: Operasi utama (ubah status shot) harus bisa dilakukan dalam 1–2 tap
- **Tidak perlu install**: Cukup akses via browser, tidak perlu di-install ke homescreen

---

## 7. Fitur & Modul

### 7.1 Modul Manajemen Proyek

**Halaman awal untuk memilih atau membuat proyek baru.**

**Fitur:**
- Daftar semua proyek aktif dengan progress bar mini
- Buat proyek baru via form (tersimpan ke Supabase)
- Edit detail proyek
- Arsipkan proyek selesai
- Hapus proyek (dengan konfirmasi 2-tap)
- Loading state saat mengambil data dari database

**Data per Proyek:**
- Nama proyek & klien
- Tanggal & deadline
- Target audience
- Konsep/ide konten
- Panduan gaya (catatan + link referensi)

---

### 7.2 Modul Mode Videografer & Director (Tech View)

**Tampilan utama di lapangan untuk Director dan Videografer.**

#### Progress Bar Produksi (sticky di atas)
- Tampilkan: `X dari Y Shot Selesai — Z%`
- Gradient bar animasi (merah → kuning → hijau sesuai progress)
- Tampilkan ringkasan: PENDING / DONE / REVISI count

#### Filter & Navigasi
- Filter by Scene (pill tabs: All, S1, S2, S3...)
- Filter by Status (PENDING / DONE / REVISI / Semua)
- Kombinasi filter dibolehkan

#### Scene Grouping & Shot Card
- **Multi-Shot per Scene**: Shot dikelompokkan secara otomatis berdasarkan nomor Scene (`SceneGroup`).
- Terdapat fungsi reorder (geser atas/bawah) antar-shot di dalam Scene maupun beda Scene.
- Penomoran shot berurutan secara otomatis berdasarkan urutan posisi visual (#1, #2, dst).

| Field | Detail |
|---|---|
| Scene & Shot ID | Nomor scene grup + urutan shot (#1, #2) |
| Status Badge | 🟡 PENDING / ✅ TAKE DONE / 🔄 REVISI |
| Shot Type & Angle | Close Up, Wide, Top Down, dll |
| Equipment | Chips/tag per alat |
| Brief Action | Deskripsi singkat gerakan |
| Dialog/Naskah | Teks talent dengan badge instruksi |
| Foto Referensi | Tap to zoom fullscreen. Mendukung smart-fallback (menjadi tombol link eksternal) jika hotlink diblokir. Mendukung In-App Iframe Preview khusus untuk link share Google Drive. |
| Link Referensi | Quick link ke TikTok/Reels/dokumen |
| Hapus Shot | Tombol trash dengan konfirmasi 2-tap untuk menghapus shot. |
| Quick Log | Catatan lapangan per shot |

#### Tombol Status
- **Take Done** — ubah status → TAKE DONE (hijau neon), sinkron real-time ke semua device
- **Revisi** — tandai perlu diulang (merah), sinkron real-time ke semua device
- Tap ulang untuk undo ke PENDING

#### Quick Log / Catatan Lapangan
- Input teks singkat per shot, tersimpan otomatis ke Supabase
- Contoh: *"Take 3 paling optimal"*, *"Lighting berlebih"*
- Terlihat sebagai catatan kuning di shot card

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
- Google Drive link → iframe modal in-app (tidak meninggalkan halaman)

---

### 7.5 Modul Tambah / Edit Shot

- Form lengkap per shot (scene, shot type, angle, equipment, dialog, dll)
- Tambah dari halaman produksi
- Tersimpan langsung ke Supabase & sinkron ke semua device

---

## 8. Struktur Data

### Proyek (Project) — Tabel Supabase `projects`
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
  }
}
```

### Shot — Tabel Supabase `shots`
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "scene": 1,
  "shotNumber": 1,
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
  "updatedAt": "2026-08-05T10:00:00Z"
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
| Database | Supabase PostgreSQL |
| Real-time | Supabase Channels (WebSocket `postgres_changes`) |
| Deploy | Vercel |

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
│   ├── services/                  ← [BARU] Database layer
│   │   ├── supabaseClient.js
│   │   ├── projectsService.js
│   │   └── shotsService.js
│   ├── hooks/
│   │   ├── useLocalStorage.js     ← [LEGACY, tidak dipakai]
│   │   ├── useProjects.js         ← Supabase async
│   │   └── useShots.js            ← Supabase async + realtime
│   ├── pages/
│   │   ├── HomePage.jsx           ← Daftar semua proyek
│   │   └── ProductionPage.jsx     ← Halaman produksi utama
│   └── components/
│       ├── ErrorBoundary/
│       │   └── ErrorBoundary.jsx
│       ├── ProjectManager/
│       │   └── ProjectForm.jsx
│       ├── ShotBoard/
│       │   ├── ShotCard.jsx
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

### ✅ Fase 1 — Core App & UI/UX (Selesai)
| Item | Status |
|---|---|
| Global CSS design system | ✅ Selesai |
| Sample data Project W & Grillme | ✅ Selesai |
| HomePage — daftar proyek | ✅ Selesai |
| ProjectForm — buat/edit proyek | ✅ Selesai |
| ShotCard (expand/collapse, status, log) | ✅ Selesai |
| QuickLog — catatan lapangan | ✅ Selesai |
| ImageViewer — fullscreen foto | ✅ Selesai |
| ModeToggle — Tech ↔ Talent | ✅ Selesai |
| FilterBar — filter scene & status | ✅ Selesai |
| ProductionProgress — progress bar | ✅ Selesai |
| TalentView / ScriptView | ✅ Selesai |
| ShotForm — tambah/edit shot | ✅ Selesai |
| ProductionPage — halaman utama produksi | ✅ Selesai |
| Error Boundary & Vercel SPA routing | ✅ Selesai |
| Smart image fallback & Drive iframe | ✅ Selesai |
| Delete shot (konfirmasi 2-tap) | ✅ Selesai |

### ✅ Fase 2 — Supabase Real-time (Selesai)
| Item | Status |
|---|---|
| Setup Supabase project & tabel | ✅ Selesai |
| Services layer (projectsService, shotsService) | ✅ Selesai |
| Refactor `useProjects` ke Supabase async | ✅ Selesai |
| Refactor `useShots` ke Supabase + realtime subscription | ✅ Selesai |
| Loading states di HomePage & ProductionPage | ✅ Selesai |
| Tombol injeksi data sampel | ✅ Selesai |
| Deploy ke Vercel dengan env vars Supabase | ✅ Selesai |

### 🔜 Fase 3 — Extended Features (Rencana)
- Google Sheets Import (import shot list dari template ke Supabase)
- Ekspor PDF Call Sheet (Sudah diimplementasikan sebagian)
- Ekspor DOCX (Sudah diimplementasikan)
- **Magic Auto-Fill**: Impor seluruh informasi Kertas Kerja via Copy-Paste
- Dashboard analitik multi-proyek

---

## 11. UX Decisions

| Keputusan | Alasan |
|---|---|
| Dark mode default, tidak bisa dimatikan | Kondisi lapangan: luar ruangan / studio dengan pencahayaan khusus |
| Tombol Take Done besar | Kecepatan 1-tap di lapangan tanpa perlu zoom |
| No login | Internal tool, tim sudah saling percaya |
| Supabase (bukan Firebase) | Real-time native, gratis untuk skala tim kecil, region Singapore |
| Tabel shots & projects terpisah | Normalisasi database untuk performa query yang lebih baik |
| Optimistic UI updates | Pengalaman terasa instan meski menunggu konfirmasi server |
| Mode toggle di header | Switching cepat antar Director dan Talent |
| Badge ekspresi berwarna | Talent perlu mengenali instruksi dari jarak baca |
| Arsipkan bukan hapus | Riwayat kerja perlu disimpan untuk referensi |
| Konfirmasi hapus 2-tap | Hindari hapus data tidak sengaja di lapangan |

---

## 12. Aturan Pengembangan (untuk AI / Developer)

1. **Mobile-first always** — semua komponen didesain untuk layar 375px terlebih dahulu
2. **Dark mode permanen** — tidak ada light mode toggle
3. **Jangan ubah struktur data** tanpa update PRD ini
4. **Selalu lewat Services Layer** — panggil Supabase via `projectsService` atau `shotsService`
5. **Komponen harus reusable** — ShotCard tidak boleh ada logika spesifik per proyek
6. **Animasi ringan** — gunakan framer-motion, hindari animasi berat di HP lama
7. **Jangan simpan credentials di kode sumber** — selalu baca dari `import.meta.env`
8. **Fase terpisah** — jangan buat dependensi antar fase yang belum dibangun

---

## 13. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | Agustus 2026 | Dokumen awal dibuat |
| 1.1 | Agustus 2026 | Keputusan final dikonfirmasi: localStorage Fase 1, Backend Proxy Fase 2, Firebase Fase 3. Multi-proyek. No login. |
| 2.0 | Agustus 2026 | **Fase 2 Selesai**: Migrasi ke Supabase PostgreSQL + Real-time WebSocket. Rencana Fase 2 (Google Sheets) digantikan oleh Supabase yang lebih sederhana dan lebih powerful. Semua item Fase 2 baru ditandai selesai. |
| 2.1 | Agustus 2026 | **Fitur Baru**: Implementasi arsitektur Multi-Shot per Scene. UI dikelompokkan menggunakan `SceneGroup`. Penambahan field `shotNumber` di Supabase. Perbaikan fitur reorder dan penomoran otomatis. |
| 2.2 | Agustus 2026 | **Fitur Baru**: Implementasi **Magic Auto-Fill** untuk import Kertas Kerja keseluruhan via Copy-Paste teks. Ekspor dokumen ke Word/DOCX. |
| 2.3 | Agustus 2026 | **Fitur Baru**: **Inline Shot Editing** untuk mengedit teks dan referensi langsung dari badan kartu shot (Click-to-Edit, Auto-save). Peningkatan algoritma regex pada Magic Auto-Fill. |
| 2.4 | Agustus 2026 | **UI Enhancements**: Memindahkan kolom Dialog dan SFX agar selalu tampil (persistent) di luar card. Menambahkan UI Referensi Universal di atas Shot List. Mematikan fitur sub-split scene otomatis saat impor agar pengguna memiliki kendali manual penuh terhadap Shot. Menambahkan kolom `sfx` ke Supabase. Penambahan field khusus **Link Screenplay** pada detail proyek. |
