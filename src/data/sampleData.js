// Sample data based on actual Kertas Kerja documents
// Project W — Americano Coffee Video

export const SAMPLE_PROJECTS = [
  {
    id: 'project-w-001',
    name: 'Project W — Americano',
    client: 'Project W',
    createdAt: '2026-07-07',
    deadline: '2026-07-10',
    status: 'active',
    targetAudience: '1. Product familiarity\n2. USP biji kopi yang kita gunakan di americano',
    concept: 'Catatan: pake beans classic saat take video, tapi information card nya menggunakan lollipop candy\n\nVideo reels 9:16 — Alur pembuatan americano dari biji kopi hingga disajikan.',
    styleGuide: {
      notes: 'untuk referensi angle ajaa',
      images: [],
      links: []
    },
    shots: [
      {
        id: 'S01',
        scene: 1,
        sceneLabel: 'Scene 1',
        shotType: 'Wide Shot',
        angle: 'Eye Level',
        equipment: ['Gimbal'],
        briefAction: 'Talent masuk ke bar dengan natural dan santai',
        dialog: 'come make your coffee with us!',
        referenceImages: [],
        referenceLinks: [],
        status: 'TAKE_DONE',
        notes: 'Take 2 paling natural, lighting oke',
        updatedAt: '2026-07-07T10:00:00Z'
      },
      {
        id: 'S02',
        scene: 2,
        sceneLabel: 'Scene 2',
        shotType: 'Half Body',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Lighting A'],
        briefAction: 'Talent menimbang biji kopi dengan timbangan digital',
        dialog: "today, we're using Lollipop Candy",
        referenceImages: [],
        referenceLinks: [],
        status: 'TAKE_DONE',
        notes: '',
        updatedAt: '2026-07-07T10:05:00Z'
      },
      {
        id: 'S03',
        scene: 3,
        sceneLabel: 'Scene 3',
        shotType: 'Close Up',
        angle: 'Top Down',
        equipment: ['Lighting A', 'Tripod'],
        briefAction: 'Close up angka di layar timbangan kopi, tampilkan berat yang tepat',
        dialog: "it's one of our favorite beans right now",
        referenceImages: [],
        referenceLinks: [],
        status: 'REVISI',
        notes: 'Lighting terlalu keras, shadow tidak bagus. Perlu diffuser.',
        updatedAt: '2026-07-07T10:10:00Z'
      },
      {
        id: 'S04',
        scene: 4,
        sceneLabel: 'Scene 4',
        shotType: 'Medium Shot',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Lighting A'],
        briefAction: 'Talent open grinder dan masukkan biji kopi ke dalam grinder dengan gerakan natural',
        dialog: 'a hint of sweet and guava flavour',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S05',
        scene: 5,
        sceneLabel: 'Scene 5',
        shotType: 'Extreme Close Up',
        angle: 'Top Down / Flatlay',
        equipment: ['Lighting A', 'Tripod', 'Macro Lens'],
        briefAction: 'Zoom in ke bubuk kopi yang sedang di-grind, tangkap tekstur dan warna bubuk',
        dialog: 'and we grind it fresh',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S06',
        scene: 6,
        sceneLabel: 'Scene 6',
        shotType: 'Close Up',
        angle: 'Eye Level / Slight Low Angle',
        equipment: ['Lighting A', 'Gimbal'],
        briefAction: 'Talent memasukkan bubuk kopi ke portafilter dengan gerakan mantap',
        dialog: 'goes into the portafilter',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S07',
        scene: 7,
        sceneLabel: 'Scene 7',
        shotType: 'Close Up',
        angle: 'Side Angle',
        equipment: ['Lighting A', 'Tripod'],
        briefAction: 'Close up tangan mendistribusi dan tamping kopi dengan presisi',
        dialog: 'a quick tamp...',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S08',
        scene: 8,
        sceneLabel: 'Scene 8',
        shotType: 'Close Up',
        angle: 'Top Down / Slight Angle',
        equipment: ['Lighting A', 'Tripod'],
        briefAction: 'Talent setting rasio ekstraksi kopi di mesin espresso. Hanya shoot tangan dan kopi, wajah tidak perlu terlihat.',
        dialog: "and we're ready to pull the shot",
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S09',
        scene: 9,
        sceneLabel: 'Scene 9',
        shotType: 'Extreme Close Up',
        angle: 'Eye Level / Slight Low',
        equipment: ['Lighting A', 'Tripod', 'Macro Lens'],
        briefAction: 'Close up espresso mengalir dari mesin ke shot glass. Tangkap crema yang terbentuk.',
        dialog: "this is the part we never skip watching",
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S10',
        scene: 10,
        sceneLabel: 'Scene 10',
        shotType: 'Medium / Wide',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Lighting A'],
        briefAction: 'Talent menuangkan espresso ke dalam gelas berisi air dengan gerakan elegan',
        dialog: 'a little art for your latte',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      },
      {
        id: 'S11',
        scene: 11,
        sceneLabel: 'Scene 11',
        shotType: 'Flatlay / Product Shot',
        angle: 'Top Down',
        equipment: ['Lighting A', 'Lighting B', 'Tripod'],
        briefAction: 'Espresso diletakkan di meja dengan information card Lollipop Candy. Styling props harus rapi dan estetik.',
        dialog: "now, enjoy your day with Lollypop Candy Latte!",
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: null
      }
    ]
  },
  {
    id: 'grillme-001',
    name: 'Grillme — Secret Promo',
    client: 'Grillme Gajahmada',
    createdAt: '2026-06-04',
    deadline: '2026-06-05',
    status: 'active',
    targetAudience: 'Mengumumkan pemenang undian tiket Stand Up Indo untuk pelanggan Grillme Gajahmada. Target: followers Instagram. Tujuan: efek FOMO agar audiens dine-in lebih sering.',
    concept: 'Tema: "Secret Promo & Host Kocak"\nLokasi: Outlet Grillme Gajahmada\nTalent: Crew staf outlet Gajahmada (pilih yang paling luwes dan ekspresif)\nProperti: Fishbowl berisi kumpulan struk, clip-on mic',
    styleGuide: {
      notes: '',
      images: [],
      links: []
    },
    shots: [
      {
        id: 'S01',
        scene: 1,
        sceneLabel: 'Hook',
        shotType: 'Medium Close Up',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Mic Wireless (Clip-on)'],
        briefAction: 'Talent tersenyum ke arah kamera sambil menepuk-nepuk fishbowl',
        dialog: '<SENYUM HANGAT> Siapa nih yang kemarin makan di Grillme Gajahmada terus kaget tiba-tiba disuruh masukin struk ke sini? Yap! Kemarin kita abis ngadain Secret Promo dadakan buat bagi-bagi tiket Stand Up Comedy khusus buat kalian yang dine-in langsung di outlet Gajahmada! Makanya, sering-sering makan di Grillme, hahahaha!',
        referenceImages: [],
        referenceLinks: [],
        status: 'TAKE_DONE',
        notes: 'Ekspresi bagus di take 3',
        updatedAt: '2026-06-04T13:15:00Z'
      },
      {
        id: 'S02',
        scene: 2,
        sceneLabel: 'The Draw',
        shotType: 'Medium Shot',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Mic Wireless (Clip-on)'],
        briefAction: 'Talent mengaduk-aduk fishbowl dengan antusias lalu menarik satu struk',
        dialog: '<ANTUSIAS> Sekarang waktunya kita undi! Mari kita aduk-aduk... rezeki siapa nih siang ini? Yak, dapat satu!',
        referenceImages: [],
        referenceLinks: [],
        status: 'TAKE_DONE',
        notes: '',
        updatedAt: '2026-06-04T13:30:00Z'
      },
      {
        id: 'S03',
        scene: 3,
        sceneLabel: 'The Punchline',
        shotType: 'Medium Close Up',
        angle: 'Eye Level',
        equipment: ['Gimbal', 'Mic Wireless (Clip-on)'],
        briefAction: 'Talent membuka struk, menatap tajam ke kamera dengan ekspresi jahil. Pastikan jari menutupi area nomor WA konsumen.',
        dialog: '<EKSPRESI JAHIL> Selamat buat Kak [Sebut Nama Pemenang]! Tim Grillme bakal langsung ngehubungin Kakak. Ingat ya Kak, ditunggu responsnya 1x24 jam. Kalau nggak dijawab... mohon maaf nih, tiketnya mending buat saya aja yang nonton! Huahahaha!',
        referenceImages: [],
        referenceLinks: [],
        status: 'REVISI',
        notes: 'Blur nomor HP di post production. Ekspresi perlu lebih kocak.',
        updatedAt: '2026-06-04T13:45:00Z'
      }
    ]
  }
]

export const STATUS_CONFIG = {
  PENDING: {
    label: 'PENDING',
    color: 'var(--status-pending)',
    bg: 'var(--status-pending-bg)',
    border: 'var(--status-pending-border)',
    emoji: '⏳'
  },
  TAKE_DONE: {
    label: 'TAKE DONE',
    color: 'var(--status-done)',
    bg: 'var(--status-done-bg)',
    border: 'var(--status-done-border)',
    emoji: '✅'
  },
  REVISI: {
    label: 'REVISI',
    color: 'var(--status-revisi)',
    bg: 'var(--status-revisi-bg)',
    border: 'var(--status-revisi-border)',
    emoji: '🔄'
  }
}
