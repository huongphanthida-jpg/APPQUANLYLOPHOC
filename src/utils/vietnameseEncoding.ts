/**
 * Vietnamese Font & Encoding Repair Utility
 * Handles:
 * 1. TCVN3 (ABC) -> Unicode conversion
 * 2. VNI-Windows -> Unicode conversion
 * 3. Windows-1258 -> Unicode conversion
 * 4. UTF-8 Mojibake (Windows-1252 / ISO-8859-1 double decoded) -> Unicode
 * 5. Corrupted question marks & replacement character ( / ?) heuristic repair for Vietnamese names & words
 * 6. Unicode NFC normalization
 */

import { Student } from '../types';

// TCVN3 (ABC) to Unicode character map
const TCVN3_LOWER_MAP: Record<string, string> = {
  '¸': 'á', 'µ': 'à', '¶': 'ả', '·': 'ã', '¹': 'ạ',
  '¨': 'ă', '¾': 'ắ', '»': 'ằ', '¼': 'ẳ', '½': 'ẵ', 'Æ': 'ặ',
  '©': 'â', 'Ê': 'ấ', 'Ç': 'ầ', 'È': 'ẩ', 'É': 'ẫ', 'Ë': 'ậ',
  '®': 'đ',
  'Ð': 'é', 'Ì': 'è', 'Î': 'ẻ', 'Ï': 'ẽ', 'Ñ': 'ẹ',
  'ª': 'ê', 'Õ': 'ế', 'Ò': 'ề', 'Ó': 'ể', 'Ô': 'ễ', 'Ö': 'ệ',
  'Ý': 'í', '×': 'ì', 'Ø': 'ỉ', 'Ü': 'ĩ', 'Þ': 'ị',
  'ã': 'ó', 'ß': 'ò', 'á': 'ỏ', 'â': 'õ', 'ä': 'ọ',
  '«': 'ô', 'è': 'ố', 'é': 'ồ', 'ê': 'ổ', 'ë': 'ỗ', 'í': 'ộ',
  '¬': 'ơ', 'ó': 'ớ', 'ï': 'ờ', 'ñ': 'ở', 'ò': 'ỡ', 'ô': 'ợ',
  'ú': 'ú', 'ù': 'ù', 'û': 'ủ', 'ü': 'ũ', 'ý': 'ụ',
  '­': 'ư', 'ø': 'ứ', 'ö': 'ừ', '÷': 'ử',
  'ỳ': 'ỳ', 'ỷ': 'ỷ', 'ỹ': 'ỹ', 'ỵ': 'ỵ',
};

// VNI-Windows to Unicode pairs & singles
const VNI_PAIRS: [string, string][] = [
  ['aù', 'á'], ['aø', 'à'], ['aû', 'ả'], ['aõ', 'ã'], ['aï', 'ạ'],
  ['aê', 'ă'], ['aé', 'ắ'], ['aè', 'ằ'], ['aú', 'ẳ'], ['aü', 'ẵ'], ['aë', 'ặ'],
  ['aâ', 'â'], ['aá', 'ấ'], ['aà', 'ầ'], ['aå', 'ẩ'], ['aã', 'ẫ'], ['aä', 'ậ'],
  ['eù', 'é'], ['eø', 'è'], ['eû', 'ẻ'], ['eõ', 'ẽ'], ['eï', 'ẹ'],
  ['eâ', 'ê'], ['eá', 'ế'], ['eà', 'ề'], ['eå', 'ể'], ['eã', 'ễ'], ['eä', 'ệ'],
  ['où', 'ó'], ['oø', 'ò'], ['oû', 'ỏ'], ['oõ', 'õ'], ['oï', 'ọ'],
  ['oâ', 'ô'], ['oá', 'ố'], ['oà', 'ồ'], ['oå', 'ổ'], ['oã', 'ỗ'], ['oä', 'ộ'],
  ['ôù', 'ớ'], ['ôø', 'ờ'], ['ôû', 'ở'], ['ôõ', 'ỡ'], ['ôï', 'ợ'], ['ô', 'ơ'],
  ['uù', 'ú'], ['uø', 'ù'], ['uû', 'ủ'], ['uõ', 'ũ'], ['uï', 'ụ'],
  ['öù', 'ứ'], ['öø', 'ừ'], ['öû', 'ử'], ['öõ', 'ữ'], ['öï', 'ự'], ['ö', 'ư'],
  ['í', 'í'], ['ì', 'ì'], ['æ', 'ỉ'], ['ó', 'ĩ'], ['ò', 'ị'],
  ['yù', 'ý'], ['yø', 'ỳ'], ['yû', 'ỷ'], ['yõ', 'ỹ'], ['î', 'ỵ'],
  ['ñ', 'đ'],
  ['AÙ', 'Á'], ['AØ', 'À'], ['AÛ', 'Ả'], ['AÕ', 'Ã'], ['AÏ', 'Ạ'],
  ['AÊ', 'Ă'], ['AÉ', 'Ắ'], ['AÈ', 'Ằ'], ['AÚ', 'Ẳ'], ['AÜ', 'Ẵ'], ['AË', 'Ặ'],
  ['AÂ', 'Â'], ['AÁ', 'Ấ'], ['AÀ', 'Ầ'], ['AÅ', 'Ẩ'], ['AÃ', 'Ẫ'], ['AÄ', 'Ậ'],
  ['EÙ', 'É'], ['EØ', 'È'], ['EÛ', 'Ẻ'], ['EÕ', 'Ẽ'], ['EÏ', 'Ẹ'],
  ['EÂ', 'Ê'], ['EÁ', 'Ế'], ['EÀ', 'Ề'], ['EÅ', 'Ể'], ['EÃ', 'Ễ'], ['EÄ', 'Ệ'],
  ['OÙ', 'Ó'], ['OØ', 'Ò'], ['OÛ', 'Ỏ'], ['OÕ', 'Õ'], ['OÏ', 'Ọ'],
  ['OÂ', 'Ô'], ['OÁ', 'Ố'], ['OÀ', 'Ồ'], ['OÅ', 'Ổ'], ['OÃ', 'Ỗ'], ['OÄ', 'Ộ'],
  ['ÔÙ', 'Ớ'], ['ÔØ', 'Ờ'], ['ÔÛ', 'Ở'], ['ÔÕ', 'Ỡ'], ['ÔÏ', 'Ợ'], ['Ô', 'Ơ'],
  ['UÙ', 'Ú'], ['UØ', 'Ù'], ['UÛ', 'Ủ'], ['UÕ', 'Ũ'], ['UÏ', 'Ụ'],
  ['ÖÙ', 'Ứ'], ['ÖØ', 'Ừ'], ['ÖÛ', 'Ử'], ['ÖÕ', 'Ữ'], ['ÖÏ', 'Ự'], ['Ö', 'Ư'],
  ['Í', 'Í'], ['Ì', 'Ì'], ['Æ', 'Ỉ'], ['Ó', 'Ĩ'], ['Ò', 'Ị'],
  ['YÙ', 'Ý'], ['YØ', 'Ỳ'], ['YÛ', 'Ỷ'], ['YÕ', 'Ỹ'], ['Î', 'Ỵ'],
  ['Ñ', 'Đ'],
];

/**
 * Convert TCVN3 (ABC / .VnTime) to standard Unicode
 */
export function convertTCVN3ToUnicode(text: string): string {
  if (!text) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += TCVN3_LOWER_MAP[char] || char;
  }
  return result.normalize('NFC');
}

/**
 * Convert VNI-Windows to standard Unicode
 */
export function convertVNIToUnicode(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [vniChar, uniChar] of VNI_PAIRS) {
    result = result.split(vniChar).join(uniChar);
  }
  return result.normalize('NFC');
}

/**
 * Repair common UTF-8 Mojibake caused by Windows-1252 / ISO-8859-1 double decoding
 */
export function repairVietnameseMojibake(text: string): string {
  if (!text) return text;
  try {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code > 255) return text; // Not pure 8-bit mojibake
      bytes[i] = code;
    }
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded.normalize('NFC');
  } catch {
    return text.normalize('NFC');
  }
}

/**
 * Dictionary of standard Vietnamese words and names to fix corrupted tokens (e.g. "?", "", missing accents)
 */
const VIETNAMESE_WORD_REPAIR_MAP: Record<string, string> = {
  // Surnames
  'nguy?n': 'Nguyễn',
  'nguyn': 'Nguyễn',
  'nguyen': 'Nguyễn',
  'tr?n': 'Trần',
  'trn': 'Trần',
  'tran': 'Trần',
  'l?': 'Lê',
  'le': 'Lê',
  'ph?m': 'Phạm',
  'phm': 'Phạm',
  'pham': 'Phạm',
  'ho?ng': 'Hoàng',
  'hong': 'Hoàng',
  'hoang': 'Hoàng',
  'hu?nh': 'Huỳnh',
  'hunh': 'Huỳnh',
  'huynh': 'Huỳnh',
  'phan': 'Phan',
  'v?': 'Vũ',
  'vu': 'Vũ',
  'd?ng': 'Đặng',
  '?ng': 'Đặng',
  'b?i': 'Bùi',
  'bi': 'Bùi',
  'bui': 'Bùi',
  'd?': 'Đỗ',
  'do': 'Đỗ',
  'h?': 'Hồ',
  'ho': 'Hồ',
  'ng?': 'Ngô',
  'ngo': 'Ngô',
  'd??ng': 'Dương',
  'duong': 'Dương',
  'l?y': 'Lý',
  'ly': 'Lý',
  'do?n': 'Đoàn',
  'doan': 'Đoàn',
  'dinh': 'Đinh',
  '?inh': 'Đinh',
  'tr?nh': 'Trịnh',
  'trinh': 'Trịnh',
  'mai': 'Mai',
  'd?o': 'Đào',
  'dao': 'Đào',

  // Middle & First Names
  'phuong': 'Phương',
  'ph??ng': 'Phương',
  'anh': 'Anh',
  'th?i': 'Thái',
  'thai': 'Thái',
  'b?o': 'Bảo',
  'bao': 'Bảo',
  'ng?c': 'Ngọc',
  'ngoc': 'Ngọc',
  'thi?n': 'Thiện',
  'thien': 'Thiện',
  'b?nh': 'Bình',
  'binh': 'Bình',
  'th?': 'Thị',
  'thi': 'Thị',
  'thanh': 'Thanh',
  'di?m': 'Diễm',
  'diem': 'Diễm',
  'dung': 'Dũng',
  'huy': 'Huy',
  'h?ng': 'Hùng',
  'hung': 'Hùng',
  'ha': 'Hà',
  '?c': 'Đức',
  'duc': 'Đức',
  'minh': 'Minh',
  'nam': 'Nam',
  'qu?c': 'Quốc',
  'quoc': 'Quốc',
  'trang': 'Trang',
  'thu': 'Thu',
  'tu?n': 'Tuấn',
  'tuan': 'Tuấn',
  'kh?nh': 'Khánh',
  'khanh': 'Khánh',
  'h??ng': 'Hương',
  'huong': 'Hương',
  'linh': 'Linh',
  'lan': 'Lan',
  't?m': 'Tâm',
  'tam': 'Tâm',
  'th?o': 'Thảo',
  'thao': 'Thảo',
  'vinh': 'Vinh',
  'vi?t': 'Việt',
  'viet': 'Việt',
  'ti?n': 'Tiến',
  'tien': 'Tiến',
  'long': 'Long',
  'h?i': 'Hải',
  'hai': 'Hải',
  'ph?c': 'Phúc',
  'phuc': 'Phúc',
  'khoa': 'Khoa',
  'h?a': 'Hòa',
  'hoa': 'Hoa',
  't?n': 'Tân',
  'tan': 'Tân',
  'quang': 'Quang',
  'hi?u': 'Hiếu',
  'hieu': 'Hiếu',
  'tri?u': 'Triệu',
  'trieu': 'Triệu',
  'nguy?n phuong anh': 'Nguyễn Phương Anh',
  'v nguy?n phuong anh': 'Vũ Nguyễn Phương Anh',

  // Profile Terms
  'v?t': 'Vật',
  'to?n': 'Toán',
  'toan': 'Toán',
  'h?c': 'học',
  'hoc': 'học',
  'sinh': 'Sinh',
  'v?n': 'Văn',
  'van': 'Văn',
  'ti?ng': 'Tiếng',
  'ting': 'Tiếng',
  'bch': 'Bách',
  'bach': 'Bách',
  'd??c': 'Dược',
  'duoc': 'Dược',
  'ngo?i': 'Ngoại',
  'thuong': 'Thương',
  'kinh': 'Kinh',
  't?': 'tế',
  'te': 'tế',
  'ph?ng': 'Phòng',
  'phong': 'Phòng',
  'vi?n': 'viện',
  'th??ng': 'thường',
  'kh?e': 'khỏe',
  'khoe': 'khỏe',
  'b?': 'Bố',
  'm?': 'Mẹ',
  'me': 'Mẹ',
  't?t': 'Tốt',
  'tot': 'Tốt',
};

/**
 * Heuristic single word / token repair for Vietnamese
 */
export function repairVietnameseWord(word: string): string {
  if (!word) return word;
  const trimmed = word.trim();
  const lower = trimmed.toLowerCase();

  // Check direct dictionary
  if (VIETNAMESE_WORD_REPAIR_MAP[lower]) {
    const fixed = VIETNAMESE_WORD_REPAIR_MAP[lower];
    // Preserve uppercase if original was all caps
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 1) {
      return fixed.toUpperCase();
    }
    // Capitalize first letter if original started with uppercase
    if (trimmed[0] && trimmed[0] === trimmed[0].toUpperCase()) {
      return fixed.charAt(0).toUpperCase() + fixed.slice(1);
    }
    return fixed;
  }

  // Common single-letter corruptions
  if (lower === 'v?' || lower === 'v') return 'Vũ';
  if (lower === 'nguy?n' || lower === 'nguyn') return 'Nguyễn';
  if (lower === 'tr?n' || lower === 'trn') return 'Trần';
  if (lower === 'ph?m' || lower === 'phm') return 'Phạm';
  if (lower === 'ho?ng' || lower === 'hong') return 'Hoàng';
  if (lower === 'hu?nh' || lower === 'hunh') return 'Huỳnh';
  if (lower === 'di?m') return 'Diễm';
  if (lower === 'nh' || lower === '?nh') return 'Đình';
  if (lower === '?c') return 'Đức';
  if (lower === 'ng' || lower === '?ng') return 'Đặng';
  if (lower === 'l?' || lower === 'l') return 'Lê';

  // Fix common question mark patterns inside names
  let fixed = trimmed;
  fixed = fixed.replace(/Nguy\?n/gi, 'Nguyễn');
  fixed = fixed.replace(/Tr\?n/gi, 'Trần');
  fixed = fixed.replace(/Ph\?m/gi, 'Phạm');
  fixed = fixed.replace(/Ho\?ng/gi, 'Hoàng');
  fixed = fixed.replace(/Hu\?nh/gi, 'Huỳnh');
  fixed = fixed.replace(/Di\?m/gi, 'Diễm');
  fixed = fixed.replace(/Tu\?n/gi, 'Tuấn');
  fixed = fixed.replace(/Qu\?c/gi, 'Quốc');
  fixed = fixed.replace(/Kh\?nh/gi, 'Khánh');
  fixed = fixed.replace(/B\?nh/gi, 'Bình');
  fixed = fixed.replace(/Thi\?n/gi, 'Thiện');
  fixed = fixed.replace(/Ti\?n/gi, 'Tiến');
  fixed = fixed.replace(/H\?i/gi, 'Hải');
  fixed = fixed.replace(/B\?o/gi, 'Bảo');
  fixed = fixed.replace(/Ng\?c/gi, 'Ngọc');
  fixed = fixed.replace(/Th\?o/gi, 'Thảo');
  fixed = fixed.replace(/Hi\?u/gi, 'Hiếu');
  fixed = fixed.replace(/Ph\?c/gi, 'Phúc');
  fixed = fixed.replace(/Vi\?t/gi, 'Việt');

  return fixed;
}

/**
 * Intelligent Vietnamese Text Auto-Repair
 * Cleans string, detects encoding artifacts, fixes ?, , TCVN3, VNI, and mojibake
 */
export function autoRepairVietnameseText(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let str = input.trim();
  if (!str) return str;

  // 1. Check & repair mojibake if present (e.g. Ã, Ä, áº, á»...)
  if (/[\u00C0-\u00FF]{2,}/.test(str)) {
    str = repairVietnameseMojibake(str);
  }

  // 2. Check for VNI patterns (aù, aø, eâ, oá, uù, öù...)
  if (/[a-zA-Z][ùøûõïéèáàåä]/.test(str)) {
    str = convertVNIToUnicode(str);
  }

  // 3. Check for TCVN3 characters (¸, µ, ¶, ·, ¹, ¨, ©...)
  if (/[\u00B8\u00B5\u00B6\u00B7\u00B9\u00A8\u00A9\u00AE\u00AA\u00AB\u00AC]/.test(str)) {
    str = convertTCVN3ToUnicode(str);
  }

  // 4. Tokenize words and run heuristic Vietnamese name / term restoration
  // Handle compound patterns like "V Nguy?n Phuong Anh" -> "Vũ Nguyễn Phương Anh"
  const tokens = str.split(/(\s+|[.,;:\-_/()]+)/);
  const repairedTokens = tokens.map((token) => {
    if (/^\s+$/.test(token) || /^[.,;:\-_/()]+$/.test(token)) {
      return token;
    }
    return repairVietnameseWord(token);
  });

  let repairedStr = repairedTokens.join('');

  // 5. Special multi-word name fixes
  repairedStr = repairedStr
    .replace(/^V\s+Nguyễn/i, 'Vũ Nguyễn')
    .replace(/^V\s+Trần/i, 'Vũ Trần')
    .replace(/^V\s+Lê/i, 'Vũ Lê')
    .replace(/^V\s+Phạm/i, 'Vũ Phạm')
    .replace(/^V\s+Hoàng/i, 'Vũ Hoàng')
    .replace(/Phuong Anh/gi, 'Phương Anh')
    .replace(/Mai Phuong/gi, 'Mai Phương')
    .replace(/Quoc Bao/gi, 'Quốc Bảo')
    .replace(/Thu Trang/gi, 'Thu Trang')
    .replace(/Minh Duc/gi, 'Minh Đức')
    .replace(/Hoang Long/gi, 'Hoàng Long')
    .replace(/Tuan Kiet/gi, 'Tuấn Kiệt')
    .replace(/Thanh Truc/gi, 'Thanh Trúc')
    .replace(/Hai Phong/gi, 'Hải Phòng')
    .replace(/Bach Khoa/gi, 'Bách Khoa')
    .replace(/Ngoai Thuong/gi, 'Ngoại Thương')
    .replace(/Y Duoc/gi, 'Y Dược');

  // Normalize final string to canonical Unicode NFC
  return repairedStr.normalize('NFC');
}

/**
 * Check if a text has obvious font/encoding corruptions
 */
export function hasFontCorruption(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  // Corruptions:
  // - Replacement char 
  // - Question mark inside words (e.g. Nguy?n, Tr?n, Ph?m)
  // - Unconverted VNI / TCVN3 characters
  // - Strange UTF-8 mojibake (Ã¡, Ä'...)
  if (text.includes('')) return true;
  if (/[a-zA-Z]\?[a-zA-Z]/.test(text)) return true;
  if (/\b[A-Za-z]\?\b/.test(text)) return true;
  if (/[\u00B8\u00B5\u00B6\u00B7\u00B9\u00A8\u00A9\u00AE\u00AA\u00AB\u00AC]/.test(text)) return true;
  if (/[a-zA-Z][ùøûõïéèáàåä]/.test(text)) return true;
  if (/[\u00C0-\u00FF]{2,}/.test(text)) return true;
  return false;
}

/**
 * Batch repair all student profiles
 */
export function repairStudentData(
  student: Student,
  mode: 'auto' | 'tcvn3' | 'vni' | 'mojibake' = 'auto'
): Student {
  const repair = (str: string): string => {
    if (!str) return str;
    if (mode === 'tcvn3') return convertTCVN3ToUnicode(str);
    if (mode === 'vni') return convertVNIToUnicode(str);
    if (mode === 'mojibake') return repairVietnameseMojibake(str);
    return autoRepairVietnameseText(str);
  };

  const isFemale = (student.gender as string) === 'Nữ' || (student.gender as string) === 'Nu';

  return {
    ...student,
    name: repair(student.name),
    gender: isFemale ? 'Nữ' : 'Nam',
    address: repair(student.address),
    strengths: repair(student.strengths),
    careerAspiration: repair(student.careerAspiration),
    healthNote: repair(student.healthNote),
    emergencyContact: {
      ...student.emergencyContact,
      parentName: repair(student.emergencyContact?.parentName || ''),
      workplace: repair(student.emergencyContact?.workplace || ''),
      relationship: student.emergencyContact?.relationship || 'Bố',
    },
  };
}
