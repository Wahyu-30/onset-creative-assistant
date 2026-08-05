import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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

    parsedShots.push({
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
    
  return parseShotTable(rows);
};
