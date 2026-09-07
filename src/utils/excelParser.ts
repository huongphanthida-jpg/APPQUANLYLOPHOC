import * as XLSX from 'xlsx';
import {
  autoRepairVietnameseText,
  convertTCVN3ToUnicode,
  convertVNIToUnicode,
  repairVietnameseMojibake,
} from './vietnameseEncoding';

export interface ExtractedTableData {
  headers: string[];
  rows: Record<string, any>[];
  raw2D: any[][];
  headerRowIndex: number;
  sheetName: string;
}

/**
 * Normalize a header string for easy matching
 */
export function normalizeHeaderKey(key: string): string {
  if (!key) return '';
  return String(key)
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[:._]/g, ' ')
    .trim();
}

/**
 * Remove Vietnamese accents for loose matching
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Score a row to determine if it is a table header row
 */
function scoreRowAsHeader(row: any[]): number {
  if (!Array.isArray(row) || row.length === 0) return -10;

  const rowTexts = row
    .filter((c) => c !== undefined && c !== null && String(c).trim().length > 0)
    .map((c) => normalizeHeaderKey(String(c)));

  if (rowTexts.length < 2) return -5;

  let score = 0;
  const combined = rowTexts.join(' | ');
  const combinedNoAccent = removeVietnameseAccents(combined);

  // Strong header markers
  const strongKeywords = [
    'ma hs', 'mã hs', 'mshs', 'ma hoc sinh', 'mã học sinh', 'sbd', 'so bao danh', 'số báo danh', 'code', 'student code',
    'ho va ten', 'họ và tên', 'ho ten', 'họ tên', 'ten hoc sinh', 'tên học sinh', 'full name', 'fullname',
    'ho dem', 'họ đệm', 'ho va ten dem', 'họ và tên đệm', 'ho va chu lot', 'họ và chữ lót',
    'gioi tinh', 'giới tính', 'phai', 'phái', 'gender', 'sex',
    'ngay sinh', 'ngày sinh', 'dob', 'birthday',
    'diem toan', 'điểm toán', 'toan tx1', 'toán tx1', 'toan gk', 'toán gk', 'toan ck', 'toán ck', 'toan dtb', 'toán đtb',
    'vat ly', 'vật lý', 'vat li', 'vật lí', 'hoa hoc', 'hóa học', 'ngu van', 'ngữ văn', 'tieng anh', 'tiếng anh',
    'dtb', 'đtb', 'gpa', 'diem tb', 'điểm tb', 'hanh kiem', 'hạnh kiểm', 'ren luyen', 'rèn luyện',
    'sdt', 'sđt', 'dia chi', 'địa chỉ', 'so truong', 'sở trường', 'nguyen vong', 'nguyện vọng',
  ];

  for (const kw of strongKeywords) {
    if (combined.includes(kw) || combinedNoAccent.includes(removeVietnameseAccents(kw))) {
      score += 4;
    }
  }

  // Common header single words
  const commonWords = ['stt', 'to', 'tổ', 'lop', 'lớp', 'toan', 'toán', 'ly', 'lý', 'hoa', 'hóa', 'sinh', 'van', 'văn', 'anh', 'ten', 'tên'];
  for (const cw of commonWords) {
    if (rowTexts.some((t) => t === cw || t.startsWith(cw + ' ') || t.endsWith(' ' + cw))) {
      score += 2;
    }
  }

  // Deduct points if row looks like an institution title banner or single merged cell
  if (rowTexts.length <= 2 && (combined.includes('truong') || combined.includes('so giao duc') || combined.includes('thpt') || combined.includes('bang diem'))) {
    score -= 8;
  }

  // Deduct points if most cells are purely numeric (looks like data row, not header)
  let numericCount = 0;
  for (const c of row) {
    if (typeof c === 'number' || (typeof c === 'string' && c.trim() && !isNaN(Number(c.replace(',', '.'))))) {
      numericCount++;
    }
  }
  if (numericCount > row.length * 0.4) {
    score -= 10;
  }

  return score;
}

/**
 * Automatically clean and parse an Excel sheet into structured objects,
 * overcoming title banners, merged headers, split name columns, and old encodings.
 */
export function extractStructuredSheet(
  workbook: XLSX.WorkBook,
  encodingMode: 'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni' | 'mojibake' = 'auto'
): ExtractedTableData {
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Tệp Excel không chứa bảng tính (Sheet) nào.');
  }

  // Pick the best sheet with the most data
  let targetSheetName = workbook.SheetNames[0];
  let maxCells = 0;

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    if (sheet && sheet['!ref']) {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const cellCount = (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
      if (cellCount > maxCells) {
        maxCells = cellCount;
        targetSheetName = sName;
      }
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const raw2D: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!raw2D || raw2D.length === 0) {
    throw new Error('Bảng tính trống hoặc không có dòng dữ liệu.');
  }

  // Find the header row (scan up to row 30)
  let bestHeaderIndex = -1;
  let highestScore = -999;

  const maxScanRows = Math.min(raw2D.length, 30);
  for (let r = 0; r < maxScanRows; r++) {
    const score = scoreRowAsHeader(raw2D[r]);
    if (score > highestScore) {
      highestScore = score;
      bestHeaderIndex = r;
    }
  }

  // If score is still too low or not found, fallback to 0 or first non-empty row
  if (bestHeaderIndex === -1 || highestScore < 1) {
    for (let r = 0; r < maxScanRows; r++) {
      if (raw2D[r] && raw2D[r].some((c) => String(c).trim().length > 0)) {
        bestHeaderIndex = r;
        break;
      }
    }
    if (bestHeaderIndex === -1) bestHeaderIndex = 0;
  }

  // Build combined headers (handling possible subheader on the next line)
  const headerRow1 = raw2D[bestHeaderIndex] || [];
  const headerRow2 = raw2D[bestHeaderIndex + 1] || [];

  // Check if headerRow2 is a sub-header (e.g. TX1, TX2, GK, CK, Điểm, etc.)
  let hasSubHeader = false;
  if (raw2D.length > bestHeaderIndex + 2) {
    const subTexts = headerRow2.map((c: any) => normalizeHeaderKey(String(c)));
    const subMarkers = ['tx1', 'tx2', 'gk', 'ck', 'tb', 'dtb', '15p', '1 tiet', 'hoc ky', 'hk'];
    if (subTexts.some((st) => subMarkers.some((m) => st.includes(m)))) {
      hasSubHeader = true;
    }
  }

  const colCount = Math.max(
    headerRow1.length,
    headerRow2.length,
    ...raw2D.slice(bestHeaderIndex).map((r) => (r ? r.length : 0))
  );

  const finalHeaders: string[] = [];
  let lastMainHeader = '';

  for (let c = 0; c < colCount; c++) {
    let mainH = String(headerRow1[c] || '').trim();
    if (mainH) {
      lastMainHeader = mainH;
    } else if (hasSubHeader && lastMainHeader) {
      // Propagation for merged top header cells
      mainH = lastMainHeader;
    }

    let subH = hasSubHeader ? String(headerRow2[c] || '').trim() : '';

    let combined = '';
    if (mainH && subH && mainH.toLowerCase() !== subH.toLowerCase()) {
      combined = `${mainH} ${subH}`.trim();
    } else if (mainH) {
      combined = mainH;
    } else if (subH) {
      combined = subH;
    } else {
      combined = `Col_${c + 1}`;
    }

    finalHeaders.push(combined);
  }

  const startDataRow = bestHeaderIndex + (hasSubHeader ? 2 : 1);
  const dataRows = raw2D.slice(startDataRow);

  // Look for separated name columns: "Họ đệm" (col A) and "Tên" (col B)
  let hoDemColIdx = -1;
  let tenColIdx = -1;
  let fullNameColIdx = -1;

  finalHeaders.forEach((h, idx) => {
    const norm = normalizeHeaderKey(h);
    const noAcc = removeVietnameseAccents(norm);
    if (noAcc.includes('ho dem') || noAcc.includes('ho va ten dem') || noAcc.includes('ho va chu lot') || noAcc === 'ho') {
      hoDemColIdx = idx;
    } else if (noAcc === 'ten' || noAcc === 'ten hs' || noAcc === 'ten hoc sinh') {
      tenColIdx = idx;
    } else if (noAcc.includes('ho va ten') || noAcc.includes('ho ten') || noAcc === 'fullname' || noAcc === 'full name') {
      fullNameColIdx = idx;
    }
  });

  // Convert raw rows to objects with text encoding conversion
  const rows: Record<string, any>[] = [];

  const cleanVal = (val: any): any => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') {
      let s = val.trim();
      if (!s) return '';
      if (encodingMode === 'tcvn3') s = convertTCVN3ToUnicode(s);
      else if (encodingMode === 'vni') s = convertVNIToUnicode(s);
      else if (encodingMode === 'mojibake') s = repairVietnameseMojibake(s);
      else s = autoRepairVietnameseText(s);
      return s;
    }
    return val;
  };

  dataRows.forEach((rawRow, rowIdx) => {
    if (!rawRow || rawRow.length === 0) return;

    // Check if entire row is blank
    const nonBlank = rawRow.some((cell) => cell !== undefined && cell !== null && String(cell).trim().length > 0);
    if (!nonBlank) return;

    const rowObj: Record<string, any> = {};
    for (let c = 0; c < colCount; c++) {
      const headerKey = finalHeaders[c] || `Col_${c + 1}`;
      rowObj[headerKey] = cleanVal(rawRow[c]);
    }

    // Auto-combine "Họ đệm" + "Tên" if separate
    if (fullNameColIdx === -1 && hoDemColIdx !== -1 && tenColIdx !== -1) {
      const hoDem = String(rawRow[hoDemColIdx] || '').trim();
      const ten = String(rawRow[tenColIdx] || '').trim();
      if (hoDem || ten) {
        const combinedName = cleanVal(`${hoDem} ${ten}`.trim());
        rowObj['Họ và Tên'] = combinedName;
        rowObj['Họ Tên'] = combinedName;
      }
    }

    // Preserve raw index
    rowObj.__rowIndex = startDataRow + rowIdx;
    rows.push(rowObj);
  });

  return {
    headers: finalHeaders,
    rows,
    raw2D,
    headerRowIndex: bestHeaderIndex,
    sheetName: targetSheetName,
  };
}

/**
 * Helper to retrieve a value from a row using multiple possible column aliases
 */
export function getRowValue(row: Record<string, any>, possibleKeys: string[]): any {
  if (!row) return undefined;
  const rowKeys = Object.keys(row);

  for (const key of possibleKeys) {
    const lowerKey = normalizeHeaderKey(key);
    const noAccKey = removeVietnameseAccents(lowerKey);

    // Exact or normalized match
    const foundKey = rowKeys.find((k) => {
      const kNorm = normalizeHeaderKey(k);
      const kNoAcc = removeVietnameseAccents(kNorm);
      return kNorm === lowerKey || kNoAcc === noAccKey;
    });

    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return row[foundKey];
    }
  }

  // Partial match fallback (e.g. header contains "Toán GK")
  for (const key of possibleKeys) {
    const lowerKey = normalizeHeaderKey(key);
    const foundKey = rowKeys.find((k) => {
      const kNorm = normalizeHeaderKey(k);
      return kNorm.includes(lowerKey) || lowerKey.includes(kNorm);
    });

    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return row[foundKey];
    }
  }

  return undefined;
}
