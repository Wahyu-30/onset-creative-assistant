import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Smart Parser untuk Teks Bebas (Bukan Tabel)
export const parseUnstructuredText = (text) => {
  // Mencari "Scene 1", "1. Scene 1:", "Scene 1 - Hook", dsb.
  const regex = /(?:^|\n)(?:\d+\.\s*)?Scene\s*(\d+)(.*?)(?=(?:^|\n)(?:\d+\.\s*)?Scene\s*\d+|$)/gis;
  const shotsMap = new Map();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const sceneNumber = parseInt(match[1], 10);
    let content = match[2].trim();
    
    // Hilangkan karakter pemisah di awal (seperti ": ", "- ", dll)
    content = content.replace(/^[:\-]\s*/, '');

    if (shotsMap.has(sceneNumber)) {
      // Jika scene ini sudah ada sebelumnya (misalnya bagian Action di atas, bagian Text/Dialog di bawah)
      const existing = shotsMap.get(sceneNumber);
      // Asumsikan bagian kedua ini adalah dialog tambahan atau text
      existing.dialog = (existing.dialog + '\n' + content).trim();
    } else {
      let dialog = '';
      let briefAction = content;
      
      // Tebak dialog dari tanda kutip
      const quoteMatch = content.match(/"([^"]+)"/);
      if (quoteMatch) {
        dialog = quoteMatch[1].trim();
        briefAction = content.replace(quoteMatch[0], '').trim();
      }

      shotsMap.set(sceneNumber, {
        scene: sceneNumber,
        sceneLabel: `Scene ${sceneNumber}`,
        shotType: '',
        angle: '',
        dialog: dialog,
        briefAction: briefAction,
        equipment: []
      });
    }
  }

  return Array.from(shotsMap.values());
};

// Smart Parser untuk Kertas Kerja Keseluruhan
export const parseProjectText = (text) => {
  const result = {
    name: '',
    client: '',
    deadline: '',
    targetAudience: '',
    concept: '',
    styleGuideNotes: '',
    styleGuideLinks: [],
    formatSpec: '',
    shots: []
  };

  if (!text) return result;

  // Helper untuk mengekstrak teks di antara dua section header
  const extractSection = (regexStart, regexEnd) => {
    const match = text.match(regexStart);
    if (!match) return '';
    const startIdx = match.index + match[0].length;
    const endMatch = text.substring(startIdx).match(regexEnd);
    if (endMatch) {
      return text.substring(startIdx, startIdx + endMatch.index).trim();
    }
    return text.substring(startIdx).trim();
  };

  // Ekstrak baris per baris untuk data pendek
  const klienMatch = text.match(/Klien\s*:\s*(.+)/i);
  const namaMatch = text.match(/Nama\s*:\s*(.+)/i);
  result.client = klienMatch ? klienMatch[1].trim() : (namaMatch ? namaMatch[1].trim() : 'Proyek Baru');
  result.name = namaMatch ? namaMatch[1].trim() : (klienMatch ? klienMatch[1].trim() : 'Proyek Baru');
  
  const deadlineMatch = text.match(/Deadline\s*:\s*(.+)/i);
  if (deadlineMatch) result.deadline = deadlineMatch[1].trim();

  // Ekstrak section panjang (Tujuan, Konsep, Panduan Gaya, Spesifikasi)
  const sectionEndRegex = /(?:Konsep\/Ide\/Detail Konten:|Panduan Gaya:|Referensi:|Spesifikasi Ukuran\/Format:|Riwayat Kerja:|Alur & Naskah Video:)/i;
  
  result.targetAudience = extractSection(/Tujuan\s*\/?\s*Target Audience:\s*/i, sectionEndRegex);
  result.concept = extractSection(/Konsep\/Ide\/Detail Konten:\s*/i, sectionEndRegex);
  result.styleGuideNotes = extractSection(/Panduan Gaya:\s*/i, sectionEndRegex);
  result.formatSpec = extractSection(/Spesifikasi Ukuran\/Format:\s*/i, sectionEndRegex);

  // Ekstrak Links
  const refText = extractSection(/Referensi:\s*/i, sectionEndRegex);
  if (refText) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = refText.match(urlRegex);
    if (urls) result.styleGuideLinks = urls;
  }

  // Ekstrak shots (jika ada) menggunakan parser lama
  result.shots = parseUnstructuredText(text);

  return result;
};

// Utility untuk mendeteksi kolom berdasarkan header (Fuzzy Match)
export const parseShotTable = (rows) => {
  if (!rows || rows.length === 0) return [];

  // Asumsi baris pertama adalah header
  const headers = rows[0].map(h => String(h).toLowerCase().trim());
  
  // Mencari index kolom berdasarkan kata kunci
  const getColIndex = (keywords) => {
    return headers.findIndex(h => keywords.some(kw => h.includes(kw)));
  };

  const colMap = {
    sceneLabel: getColIndex(['scene', 'no', 'scn']),
    shotType: getColIndex(['shot', 'jenis', 'type', 'ukuran']),
    angle: getColIndex(['angle', 'sudut']),
    dialog: getColIndex(['dialog', 'naskah', 'audio', 'suara', 'vo']),
    briefAction: getColIndex(['action', 'visual', 'video', 'brief', 'deskripsi', 'keterangan']),
    equipment: getColIndex(['alat', 'equip', 'kamera', 'lensa', 'gear'])
  };

  const parsedShots = [];
  
  // Mulai iterasi dari baris kedua (index 1) karena baris 0 adalah header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Abaikan baris kosong
    if (row.every(cell => !cell || String(cell).trim() === '')) continue;

    // Jika tabel tidak punya header yang jelas (semua -1), fallback ke urutan default
    const hasHeaders = Object.values(colMap).some(idx => idx !== -1);
    
    let sceneLabel = '';
    let shotType = '';
    let angle = '';
    let dialog = '';
    let briefAction = '';
    let equipment = [];

    if (hasHeaders) {
      sceneLabel = colMap.sceneLabel !== -1 ? String(row[colMap.sceneLabel] || '') : `Scene ${i}`;
      shotType = colMap.shotType !== -1 ? String(row[colMap.shotType] || '') : '';
      angle = colMap.angle !== -1 ? String(row[colMap.angle] || '') : '';
      dialog = colMap.dialog !== -1 ? String(row[colMap.dialog] || '') : '';
      briefAction = colMap.briefAction !== -1 ? String(row[colMap.briefAction] || '') : '';
      
      const equipStr = colMap.equipment !== -1 ? String(row[colMap.equipment] || '') : '';
      equipment = equipStr ? equipStr.split(',').map(e => e.trim()) : [];
    } else {
      // Fallback urutan: Scene | Shot | Angle | Dialog | Action
      sceneLabel = String(row[0] || `Scene ${i}`);
      shotType = String(row[1] || '');
      angle = String(row[2] || '');
      dialog = String(row[3] || '');
      briefAction = String(row[4] || '');
    }

    const sceneMatch = sceneLabel.match(/\d+/);
    const sceneNumber = sceneMatch ? parseInt(sceneMatch[0], 10) : i;

    parsedShots.push({
      scene: sceneNumber,
      sceneLabel: sceneLabel.trim(),
      shotType: shotType.trim(),
      angle: angle.trim(),
      dialog: dialog.trim(),
      briefAction: briefAction.trim(),
      equipment
    });
  }

  return parsedShots;
};

// Ekstrak baris tabel dari DOCX menggunakan mammoth
export const parseDocxTable = async (fileBuffer) => {
  try {
    // Convert docx ke raw HTML
    const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
    const htmlStr = result.value;

    // Parse HTML string untuk mencari tag <table>
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    const tables = doc.querySelectorAll('table');
    
    if (tables.length === 0) throw new Error("Tidak ada tabel yang ditemukan di dokumen DOCX ini.");
    
    // Ambil tabel pertama (biasanya Kertas Kerja)
    const table = tables[0];
    const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
      return Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim());
    });

    // Cek apakah ini tabel shot list (minimal 3 kolom) atau tabel layout Kertas Kerja (cuma 2 kolom)
    const maxCols = Math.max(...rows.map(r => r.length));
    if (maxCols <= 2) {
      // Ini format unstructured (Key-Value), gunakan Smart Parser pada teks aslinya
      const textResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      const unstructuredShots = parseUnstructuredText(textResult.value);
      if (unstructuredShots.length > 0) return unstructuredShots;
    }

    return parseShotTable(rows);
  } catch (err) {
    console.error("Docx parse error:", err);
    throw err;
  }
};

// Ekstrak baris tabel dari Excel/CSV
export const parseExcelTable = async (fileBuffer) => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert ke array 2D
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rows.length === 0) throw new Error("Excel/CSV kosong.");

    return parseShotTable(rows);
  } catch (err) {
    console.error("Excel parse error:", err);
    throw err;
  }
};

// Parser untuk Tab-Separated Values (Copy-Paste dari Docs/Excel)
export const parseTSVTable = (tsvString) => {
  const rows = tsvString.split('\n')
    .filter(row => row.trim() !== '')
    .map(row => row.split('\t').map(c => c.trim()));
    
  const maxCols = Math.max(...rows.map(r => r.length));
  if (maxCols <= 2) {
    // Kalau yang di-paste cuma 1 atau 2 kolom, kemungkinan besar itu teks bebas
    const unstructuredShots = parseUnstructuredText(tsvString);
    if (unstructuredShots.length > 0) return unstructuredShots;
  }
    
  return parseShotTable(rows);
};
