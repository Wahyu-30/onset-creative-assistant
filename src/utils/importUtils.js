import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Helper untuk mengubah tanggal "7 Juli 2026" menjadi "2026-07-07"
const parseIndonesianDate = (dateStr) => {
  if (!dateStr) return '';
  const months = {
    'januari': '01', 'jan': '01',
    'februari': '02', 'feb': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agu': '08', 'agus': '08',
    'september': '09', 'sep': '09',
    'oktober': '10', 'okt': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12'
  };
  const parts = dateStr.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
  if (parts.length >= 3) {
    let day = parts[0];
    if (day.length === 1) day = '0' + day;
    let month = months[parts[1]] || '01';
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  return '';
};

export const parseUnstructuredText = (text) => {
  let cleanText = text.replace(/Scene\s*:/g, 'Scene 1:');
  const regex = /(?:^|\n)(?:\d+\.\s*)?Scene\s*(\d+)\s*[:\-]?\s*(.*?)(?=(?:^|\n)(?:\d+\.\s*)?Scene\s*\d+|$|Panduan Gaya|Referensi)/gis;
  
  // Map untuk menyimpan data per scene sementara
  const scenesMap = new Map();
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    const sceneNumber = parseInt(match[1], 10);
    let content = match[2].trim().replace(/^[:\-]\s*/, '');

    if (scenesMap.has(sceneNumber)) {
      const existing = scenesMap.get(sceneNumber);
      existing.rawContent = (existing.rawContent + '\n' + content).trim();
    } else {
      scenesMap.set(sceneNumber, {
        scene: sceneNumber,
        sceneLabel: `Scene ${sceneNumber}`,
        rawContent: content
      });
    }
  }

  if (scenesMap.size === 0) {
    const alurMatch = text.match(/Alur\s*(?:&|dan)?\s*Naskah\s*Video\s*:\s*([\s\S]*?)(?:Arahan Editing:|Referensi|Spesifikasi|$)/i);
    if (alurMatch) {
      const alurText = alurMatch[1];
      const bulletRegex = /(?:^|\n)[●\-\*]\s*([^:]+):\s*(.*)/g;
      let bMatch;
      let bIndex = 1;
      
      while ((bMatch = bulletRegex.exec(alurText)) !== null) {
        const title = bMatch[1].trim();
        const content = bMatch[2].trim();
        
        let dialog = '';
        let action = content;
        
        const qMatch = content.match(/["“]([^"”]+)["”]/);
        if (qMatch) {
          dialog = qMatch[1].trim();
          action = content.replace(qMatch[0], '').trim();
        }

        action = action.replace(/Dialog\s*:\s*/gi, '').trim();
        
        scenesMap.set(bIndex, {
          scene: bIndex,
          sceneLabel: title,
          dialog: dialog,
          briefAction: action
        });
        bIndex++;
      }
    }
  }

  const allShots = [];
  
  // Helper function to extract dialog from a specific shot text
  const extractDialogFromShot = (text) => {
    let dialog = '';
    let action = text;
    
    // Check if there is an explicit "Dialog:" marker
    const dialogMarkerMatch = text.match(/Dialog\s*:\s*([\s\S]*)$/i);
    if (dialogMarkerMatch) {
      dialog = dialogMarkerMatch[1].trim();
      action = text.replace(dialogMarkerMatch[0], '').trim();
    } else {
      // Fallback to first quote extraction if no explicit marker
      const quoteMatch = text.match(/["“]([^"”]+)["”]/);
      if (quoteMatch) {
        dialog = quoteMatch[1].trim();
        action = text.replace(quoteMatch[0], '').trim();
      }
    }
    return { dialog, action };
  };

  for (const [sceneNumber, sceneData] of scenesMap.entries()) {
    const actionText = sceneData.rawContent || sceneData.briefAction; // Use rawContent if available
    const { dialog, action } = extractDialogFromShot(actionText);

    allShots.push({
      scene: sceneNumber,
      sceneLabel: sceneData.sceneLabel,
      shotType: '',
      angle: '',
      dialog: dialog || sceneData.dialog || '',
      briefAction: action || sceneData.briefAction || '',
      equipment: []
    });
  }

  return allShots;
};

// Smart Parser untuk Kertas Kerja Keseluruhan
export const parseProjectText = (text) => {
  const result = {
    name: '',
    client: '',
    deadline: '',
    shootDate: '',
    targetAudience: '',
    concept: '',
    styleGuideNotes: '',
    styleGuideLinks: [],
    formatSpec: '',
    shots: []
  };

  if (!text) return result;

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

  const klienMatch = text.match(/(?:Klien|Brand)\s*:\s*(.+)/i);
  let namaMatch = text.match(/Nama\s*:\s*(.+)/i);
  
  // Jika "Nama:" kosong dan malah menangkap baris "Tanggal" di bawahnya
  if (namaMatch && (namaMatch[1].trim() === '' || namaMatch[1].toLowerCase().includes('tanggal'))) {
    namaMatch = null;
  }
  const headlineMatch = text.match(/Headline\s*:\s*(.+)/i);

  // Penentuan Nama Proyek
  if (headlineMatch && headlineMatch[1].trim()) {
    result.name = headlineMatch[1].trim();
  } else if (namaMatch && namaMatch[1].trim()) {
    result.name = namaMatch[1].trim();
  } else if (klienMatch && klienMatch[1].trim()) {
    result.name = klienMatch[1].trim();
  } else {
    result.name = 'Proyek Baru';
  }

  // Penentuan Nama Klien (Fuzzy matching brand)
  const textLower = text.toLowerCase();
  if (textLower.includes('grillme') || textLower.includes('grill me')) {
    result.client = 'Grillme';
  } else if (textLower.includes('om jack')) {
    result.client = 'Om Jack';
  } else if (textLower.includes('project w')) {
    result.client = 'Project W';
  } else if (klienMatch && klienMatch[1].trim()) {
    result.client = klienMatch[1].trim();
  } else if (result.name !== 'Proyek Baru') {
    result.client = result.name;
  } else {
    result.client = 'Klien Baru';
  }
  
  const deadlineMatch = text.match(/Deadline\s*:\s*(.+)/i);
  if (deadlineMatch) result.deadline = parseIndonesianDate(deadlineMatch[1].trim());

  const shootDateMatch = text.match(/Tanggal\s*(?:Shooting)?\s*:\s*(.+)/i);
  if (shootDateMatch) result.shootDate = parseIndonesianDate(shootDateMatch[1].trim());

  // Ekstrak section panjang, perhatikan kata 'Text:' sebagai pemisah juga
  const sectionEndRegex = /(?:^|\n)(?:Konsep(?:\s*\/\s*Ide)?(?:\s*\/\s*Detail Konten)?\s*:|Panduan Gaya:|Referensi:|Spesifikasi Ukuran\/Format:|Riwayat Kerja:|Alur\s*(?:&|dan)?\s*Naskah\s*Video:|Text:|Video reels\s*\d*:\d*:|Scene\s*\d+)/i;
  
  result.targetAudience = extractSection(/Tujuan\s*\/?\s*Target Audience:\s*/i, sectionEndRegex);
  result.concept = extractSection(/(?:^|\n)Konsep(?:\s*\/\s*Ide)?(?:\s*\/\s*Detail Konten)?\s*:\s*/i, sectionEndRegex);
  result.styleGuideNotes = extractSection(/Panduan Gaya:\s*/i, sectionEndRegex);
  result.formatSpec = extractSection(/Spesifikasi Ukuran\/Format:\s*/i, sectionEndRegex);

  const refText = extractSection(/Referensi:\s*/i, /(?:Spesifikasi Ukuran\/Format:|Riwayat Kerja:|$)/i);
  if (refText) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = refText.match(urlRegex);
    if (urls) {
      // Bersihkan url dari tanda kurung tutup jika menempel
      result.styleGuideLinks = urls.map(u => u.replace(/\)$/, ''));
    }
  }

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
