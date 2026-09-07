import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  FileText,
  UserPlus,
  FileCheck,
  Info,
  Type,
  Wand2,
  Sliders,
  Globe,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ClassInfo } from '../types';
import {
  autoRepairVietnameseText,
  convertTCVN3ToUnicode,
  convertVNIToUnicode,
} from '../utils/vietnameseEncoding';
import {
  extractStructuredSheet,
  getRowValue,
} from '../utils/excelParser';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedStudents: Student[], mode: 'merge' | 'replace') => void;
  currentCount: number;
  classInfo?: ClassInfo;
  existingStudents?: Student[];
  onOpenGoogleSheetModal?: () => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount,
  classInfo,
  existingStudents = [],
  onOpenGoogleSheetModal,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawFileBuffer, setRawFileBuffer] = useState<ArrayBuffer | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [selectedEncoding, setSelectedEncoding] = useState<'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni'>('auto');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentClassName = classInfo?.className || 'Lớp 12A1';
  const safeClassName = currentClassName.replace(/[^a-zA-Z0-9]/g, '_');

  // Convert Excel serial date or general date to DD/MM/YYYY string
  const formatExcelDate = (val: any): string => {
    if (!val) return '01/01/2008';
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(val).trim();
    if (str.includes('-') && str.length === 10) {
      const parts = str.split('-');
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return str;
  };

  // Clean and encode string according to selected encoding mode
  const cleanStr = (val: any, encodingMode = selectedEncoding): string => {
    if (val === undefined || val === null) return '';
    const raw = String(val).trim();
    if (!raw) return '';

    if (encodingMode === 'tcvn3') {
      return convertTCVN3ToUnicode(raw);
    }
    if (encodingMode === 'vni') {
      return convertVNIToUnicode(raw);
    }
    // 'auto', 'utf8', 'win1258' all benefit from smart heuristic repair & NFC normalization
    return autoRepairVietnameseText(raw);
  };

  // Generate and download standard Excel template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const sampleRows = [
      {
        'Mã HS': 'TNH-01',
        'Họ và Tên': 'Nguyễn Hoàng Nam',
        'Giới tính': 'Nam',
        'Ngày sinh': '15/03/2008',
        'Tổ': 1,
        'SĐT': '0912345678',
        'Email': 'nam.nh@tnh.edu.vn',
        'Địa chỉ': 'Số 12 Lạch Tray, Ngô Quyền, Hải Phòng',
        'Sở trường năng khiếu': 'Lập trình Web & Giải toán nhanh',
        'Định hướng nghề nghiệp': 'ĐH Bách Khoa Hà Nội (CNTT)',
        'Ghi chú sức khỏe': 'Bình thường, mắt cận 1.5 độ',
        'Họ tên phụ huynh': 'Nguyễn Văn Hùng',
        'Quan hệ': 'Bố',
        'SĐT phụ huynh': '0912888999',
        'Nơi công tác phụ huynh': 'Công ty Điện lực Hải Phòng',
        'ĐTB Khối A': 9.2,
        'Hạnh kiểm': 'Tốt',
      },
      {
        'Mã HS': 'TNH-02',
        'Họ và Tên': 'Trần Thị Mai Anh',
        'Giới tính': 'Nữ',
        'Ngày sinh': '22/07/2008',
        'Tổ': 1,
        'SĐT': '0987654321',
        'Email': 'maianh.tt@tnh.edu.vn',
        'Địa chỉ': 'Số 45 Lê Lợi, Lê Chân, Hải Phòng',
        'Sở trường năng khiếu': 'Hùng biện tiếng Anh & Thuyết trình',
        'Định hướng nghề nghiệp': 'ĐH Ngoại Thương Hà Nội (Kinh tế đối ngoại)',
        'Ghi chú sức khỏe': 'Sức khỏe tốt',
        'Họ tên phụ huynh': 'Trần Văn Minh',
        'Quan hệ': 'Bố',
        'SĐT phụ huynh': '0987111222',
        'Nơi công tác phụ huynh': 'Bệnh viện Hữu nghị Việt Tiệp',
        'ĐTB Khối A': 8.9,
        'Hạnh kiểm': 'Tốt',
      },
      {
        'Mã HS': 'TNH-03',
        'Họ và Tên': 'Lê Quốc Bảo',
        'Giới tính': 'Nam',
        'Ngày sinh': '10/11/2008',
        'Tổ': 2,
        'SĐT': '0934567890',
        'Email': 'bao.lq@tnh.edu.vn',
        'Địa chỉ': 'Số 88 Cầu Đất, Ngô Quyền, Hải Phòng',
        'Sở trường năng khiếu': 'Robotics & Vật lý ứng dụng',
        'Định hướng nghề nghiệp': 'ĐH Bách Khoa (Kỹ thuật Điều khiển & Tự động hóa)',
        'Ghi chú sức khỏe': 'Bình thường',
        'Họ tên phụ huynh': 'Lê Đình Dũng',
        'Quan hệ': 'Bố',
        'SĐT phụ huynh': '0934999888',
        'Nơi công tác phụ huynh': 'Cảng Hải Phòng',
        'ĐTB Khối A': 9.0,
        'Hạnh kiểm': 'Tốt',
      },
      {
        'Mã HS': 'TNH-04',
        'Họ và Tên': 'Phạm Thu Trang',
        'Giới tính': 'Nữ',
        'Ngày sinh': '05/09/2008',
        'Tổ': 2,
        'SĐT': '0945678901',
        'Email': 'trang.pt@tnh.edu.vn',
        'Địa chỉ': 'Số 102 Hoàng Văn Thụ, Hồng Bàng, Hải Phòng',
        'Sở trường năng khiếu': 'Hóa học thực nghiệm & Vẽ tranh',
        'Định hướng nghề nghiệp': 'ĐH Y Dược Hải Phòng (Bác sĩ Đa khoa)',
        'Ghi chú sức khỏe': 'Bình thường',
        'Họ tên phụ huynh': 'Phạm Quang Huy',
        'Quan hệ': 'Bố',
        'SĐT phụ huynh': '0945111333',
        'Nơi công tác phụ huynh': 'Sở Y Tế Hải Phòng',
        'ĐTB Khối A': 9.1,
        'Hạnh kiểm': 'Tốt',
      },
      {
        'Mã HS': 'TNH-05',
        'Họ và Tên': 'Vũ Minh Đức',
        'Giới tính': 'Nam',
        'Ngày sinh': '18/04/2008',
        'Tổ': 3,
        'SĐT': '0922334455',
        'Email': 'duc.vm@tnh.edu.vn',
        'Địa chỉ': 'Số 76 Tô Hiệu, Lê Chân, Hải Phòng',
        'Sở trường năng khiếu': 'Bóng rổ & Toán logic',
        'Định hướng nghề nghiệp': 'ĐH Quốc Gia Hà Nội (Khoa học Máy tính)',
        'Ghi chú sức khỏe': 'Thể lực tốt',
        'Họ tên phụ huynh': 'Vũ Mạnh Hà',
        'Quan hệ': 'Bố',
        'SĐT phụ huynh': '0922888777',
        'Nơi công tác phụ huynh': 'Tập đoàn Bưu chính Viễn thông',
        'ĐTB Khối A': 8.7,
        'Hạnh kiểm': 'Tốt',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 8 },
      { wch: 14 }, { wch: 24 }, { wch: 36 }, { wch: 32 }, { wch: 36 },
      { wch: 24 }, { wch: 22 }, { wch: 12 }, { wch: 16 }, { wch: 30 },
      { wch: 14 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Danh_Sach_${safeClassName}`);
    XLSX.writeFile(wb, `Mau_Danh_Sach_Hoc_Sinh_${safeClassName}.xlsx`);
  };

  // Generate and download CSV template (.csv)
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel
      'Mã HS,Họ và Tên,Giới tính,Ngày sinh,Tổ,SĐT,Email,Địa chỉ,Sở trường năng khiếu,Định hướng nghề nghiệp,Ghi chú sức khỏe,Họ tên phụ huynh,Quan hệ,SĐT phụ huynh,Nơi công tác phụ huynh,ĐTB Khối A,Hạnh kiểm\n' +
      'TNH-01,Nguyễn Hoàng Nam,Nam,15/03/2008,1,0912345678,nam.nh@tnh.edu.vn,Số 12 Lạch Tray Ngô Quyền Hải Phòng,Lập trình Web & Giải toán nhanh,ĐH Bách Khoa Hà Nội (CNTT),Bình thường mắt cận 1.5 độ,Nguyễn Văn Hùng,Bố,0912888999,Công ty Điện lực HP,9.2,Tốt\n' +
      'TNH-02,Trần Thị Mai Anh,Nữ,22/07/2008,1,0987654321,maianh.tt@tnh.edu.vn,Số 45 Lê Lợi Lê Chân Hải Phòng,Hùng biện tiếng Anh & Thuyết trình,ĐH Ngoại Thương Hà Nội,Sức khỏe tốt,Trần Văn Minh,Bố,0987111222,Bệnh viện Hữu nghị Tiệp,8.9,Tốt\n' +
      'TNH-03,Lê Quốc Bảo,Nam,10/11/2008,2,0934567890,bao.lq@tnh.edu.vn,Số 88 Cầu Đất Ngô Quyền Hải Phòng,Robotics & Vật lý ứng dụng,ĐH Bách Khoa (Kỹ thuật Điều khiển),Bình thường,Lê Đình Dũng,Bố,0934999888,Cảng Hải Phòng,9.0,Tốt';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mau_Danh_Sach_Hoc_Sinh_${safeClassName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to extract value from row object regardless of exact key variation
  const getVal = (row: any, keys: string[]): any => {
    return getRowValue(row, keys);
  };

  // Transform raw row into a clean Student object
  const transformRowToStudent = (row: any, index: number, encodingMode = selectedEncoding): Student | null => {
    const rawCode = getVal(row, ['mã hs', 'mã học sinh', 'ma hs', 'code', 'id', 'mshs', 'stt']);
    const rawName = getVal(row, ['họ và tên', 'họ tên', 'tên', 'tên học sinh', 'name', 'full name', 'fullname']);

    if (!rawName && !rawCode) return null;

    const name = rawName ? cleanStr(rawName, encodingMode) : `Học sinh ${index + 1}`;
    const code = rawCode ? String(rawCode).trim() : `TNH-${(index + 1).toString().padStart(2, '0')}`;

    // Gender
    const rawGender = getVal(row, ['giới tính', 'gioi tinh', 'phái', 'gender', 'sex']);
    const isFemale = rawGender && (String(rawGender).toLowerCase().includes('nữ') || String(rawGender).toLowerCase().includes('nu') || String(rawGender).toLowerCase() === 'f');
    const gender = isFemale ? 'Nữ' : 'Nam';

    // Birthday
    const rawDob = getVal(row, ['ngày sinh', 'ngay sinh', 'dob', 'birthday', 'birth date']);
    const dob = formatExcelDate(rawDob);

    // Group (Tổ)
    const rawGroup = getVal(row, ['tổ', 'to', 'group', 'tổ thi đua']);
    let group: 1 | 2 | 3 | 4 = 1;
    if (rawGroup) {
      const parsedG = parseInt(String(rawGroup).replace(/[^0-9]/g, ''), 10);
      if (parsedG >= 1 && parsedG <= 4) group = parsedG as any;
    }

    // Contact
    const rawPhone = getVal(row, ['sđt', 'sdt', 'số điện thoại', 'điện thoại', 'phone', 'tel', 'sđt học sinh']);
    const phone = rawPhone ? String(rawPhone).trim() : '0912000000';

    const rawEmail = getVal(row, ['email', 'thư điện tử', 'mail']);
    const email = rawEmail ? String(rawEmail).trim() : `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}@tnh.edu.vn`;

    const rawAddress = getVal(row, ['địa chỉ', 'dia chi', 'address', 'nơi ở', 'hộ khẩu']);
    const address = rawAddress ? cleanStr(rawAddress, encodingMode) : 'Hải Phòng';

    // Profiles & Strengths
    const rawStrengths = getVal(row, ['sở trường năng khiếu', 'sở trường', 'năng khiếu', 'strengths', 'so truong', 'nang khieu']);
    const strengths = rawStrengths ? cleanStr(rawStrengths, encodingMode) : 'Toán học & Khoa học Tự nhiên';

    const rawCareer = getVal(row, ['định hướng nghề nghiệp', 'định hướng', 'nguyện vọng', 'mục tiêu đại học', 'career', 'aspiration']);
    const careerAspiration = rawCareer ? cleanStr(rawCareer, encodingMode) : 'ĐH Bách Khoa / Kinh Tế';

    const rawHealth = getVal(row, ['ghi chú sức khỏe', 'sức khỏe', 'suc khoe', 'health note', 'health']);
    const healthNote = rawHealth ? cleanStr(rawHealth, encodingMode) : 'Sức khỏe tốt, không có tiền sử bệnh lý';

    // Parent / Emergency
    const rawParentName = getVal(row, ['họ tên phụ huynh', 'phụ huynh', 'tên phụ huynh', 'người giám hộ', 'parent name', 'parent']);
    const parentName = rawParentName ? cleanStr(rawParentName, encodingMode) : `Phụ huynh của ${name}`;

    const rawRel = getVal(row, ['quan hệ', 'mối quan hệ', 'relationship', 'quan he']);
    let relationship: 'Bố' | 'Mẹ' | 'Người giám hộ' = 'Bố';
    if (rawRel) {
      const relStr = String(rawRel).toLowerCase();
      if (relStr.includes('mẹ') || relStr.includes('me')) relationship = 'Mẹ';
      else if (relStr.includes('giám hộ')) relationship = 'Người giám hộ';
    }

    const rawParentPhone = getVal(row, ['sđt phụ huynh', 'sđt ph', 'số điện thoại phụ huynh', 'parent phone', 'sdt ph']);
    const parentPhone = rawParentPhone ? String(rawParentPhone).trim() : '0912888999';

    const rawWorkplace = getVal(row, ['nơi công tác phụ huynh', 'nơi công tác', 'nơi làm việc', 'workplace', 'co quan']);
    const workplace = rawWorkplace ? cleanStr(rawWorkplace, encodingMode) : 'Hải Phòng';

    // Academic & Conduct
    const rawGpa = getVal(row, ['đtb khối a', 'đtb', 'điểm tb', 'gpa', 'dtb', 'điểm trung bình']);
    const gpa = rawGpa ? Number(parseFloat(String(rawGpa)).toFixed(2)) : 8.5;

    const rawConduct = getVal(row, ['hạnh kiểm', 'rèn luyện', 'conduct', 'hanh kiem']);
    let conductRating: 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' = 'Tốt';
    if (rawConduct) {
      const cStr = String(rawConduct).toLowerCase();
      if (cStr.includes('khá') || cStr.includes('kha')) conductRating = 'Khá';
      else if (cStr.includes('trung bình') || cStr.includes('tb')) conductRating = 'Trung bình';
      else if (cStr.includes('yếu') || cStr.includes('yeu')) conductRating = 'Yếu';
    }

    // Default Avatar matching gender
    const defaultAvatar = gender === 'Nữ'
      ? `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80`
      : `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80`;

    const id = code.toLowerCase().replace(/[^a-z0-9]/g, '-') || `std-${Date.now()}-${index}`;

    // Subject grades
    const mathVal = getVal(row, ['toán', 'toan', 'math']) ? parseFloat(String(getVal(row, ['toán', 'toan', 'math']))) : gpa;
    const physVal = getVal(row, ['lý', 'vật lý', 'ly', 'physics']) ? parseFloat(String(getVal(row, ['lý', 'vật lý', 'ly', 'physics']))) : gpa;
    const chemVal = getVal(row, ['hóa', 'hóa học', 'hoa', 'chemistry']) ? parseFloat(String(getVal(row, ['hóa', 'hóa học', 'hoa', 'chemistry']))) : gpa;
    const bioVal = getVal(row, ['sinh', 'sinh học', 'biology']) ? parseFloat(String(getVal(row, ['sinh', 'sinh học', 'biology']))) : 8.5;
    const litVal = getVal(row, ['văn', 'ngữ văn', 'literature']) ? parseFloat(String(getVal(row, ['văn', 'ngữ văn', 'literature']))) : 8.0;
    const engVal = getVal(row, ['anh', 'tiếng anh', 'english']) ? parseFloat(String(getVal(row, ['anh', 'tiếng anh', 'english']))) : 8.5;

    return {
      id,
      code,
      name,
      gender,
      dob,
      group,
      avatar: defaultAvatar,
      phone,
      email,
      address,
      strengths,
      careerAspiration,
      healthNote,
      emergencyContact: {
        parentName,
        relationship,
        phone: parentPhone,
        workplace,
      },
      grades: {
        math: { tx1: mathVal, tx2: mathVal, gk: mathVal, ck: mathVal, avg: mathVal },
        physics: { tx1: physVal, tx2: physVal, gk: physVal, ck: physVal, avg: physVal },
        chemistry: { tx1: chemVal, tx2: chemVal, gk: chemVal, ck: chemVal, avg: chemVal },
        biology: { tx1: bioVal, tx2: bioVal, gk: bioVal, ck: bioVal, avg: bioVal },
        literature: { tx1: litVal, tx2: litVal, gk: litVal, ck: litVal, avg: litVal },
        english: { tx1: engVal, tx2: engVal, gk: engVal, ck: engVal, avg: engVal },
        gpa: Number(((mathVal + physVal + chemVal) / 3).toFixed(2)),
      },
      progressHistory: [
        { period: 'Tháng 9', math: Math.max(0, mathVal - 0.5), physics: Math.max(0, physVal - 0.4), chemistry: Math.max(0, chemVal - 0.6) },
        { period: 'Giữa HK1', math: Math.max(0, mathVal - 0.2), physics: Math.max(0, physVal - 0.1), chemistry: Math.max(0, chemVal - 0.3) },
        { period: 'Cuối HK1', math: mathVal, physics: physVal, chemistry: chemVal },
        { period: 'Giữa HK2', math: Math.min(10, mathVal + 0.2), physics: Math.min(10, physVal + 0.2), chemistry: Math.min(10, chemVal + 0.2) },
        { period: 'Thi Thử TN', math: Math.min(10, mathVal + 0.3), physics: Math.min(10, physVal + 0.3), chemistry: Math.min(10, chemVal + 0.3) },
      ],
      conductScore: conductRating === 'Tốt' ? 100 : 85,
      conductRating,
      violationsCount: 0,
      commendationsCount: 1,
      absenceCount: 0,
      violations: [],
      commendations: ['Gia nhập tập thể lớp 12A1'],
    };
  };

  // Re-process current file buffer with specific encoding
  const parseBufferData = (buffer: ArrayBuffer, nameOfFile: string, encodingMode: 'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni') => {
    try {
      const isJson = nameOfFile.endsWith('.json');
      if (isJson) {
        const text = new TextDecoder('utf-8').decode(buffer);
        const parsed = JSON.parse(text);
        const rawList = Array.isArray(parsed) ? parsed : parsed.students || [];
        const validStudents: Student[] = rawList
          .map((item: any, idx: number) => transformRowToStudent(item, idx, encodingMode))
          .filter((s: any): s is Student => s !== null);

        if (validStudents.length === 0) {
          throw new Error('Không nhận diện được học sinh hợp lệ nào từ tệp JSON.');
        }
        setParsedStudents(validStudents);
      } else {
        // Excel (.xlsx, .xls) or CSV
        const codepage = encodingMode === 'win1258' ? 1258 : encodingMode === 'tcvn3' ? 1258 : undefined;
        const workbook = XLSX.read(new Uint8Array(buffer), {
          type: 'array',
          codepage,
          raw: false,
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Tệp Excel không chứa bảng tính (Sheet) nào.');
        }

        const { rows: rawRows } = extractStructuredSheet(workbook, encodingMode);

        if (!rawRows || rawRows.length === 0) {
          throw new Error('Bảng tính trống hoặc không tìm thấy dòng dữ liệu học sinh nào.');
        }

        const validStudents: Student[] = rawRows
          .map((row, idx) => transformRowToStudent(row, idx, encodingMode))
          .filter((s): s is Student => s !== null);

        if (validStudents.length === 0) {
          throw new Error(
            'Không thể nhận diện danh sách học sinh. Vui lòng kiểm tra dòng tiêu đề có cột "Họ và Tên" hoặc "Mã HS".'
          );
        }

        setParsedStudents(validStudents);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi đọc tệp tin. Vui lòng kiểm tra lại bảng mã tiếng Việt.');
      setParsedStudents([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process selected file
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      setRawFileBuffer(buffer);
      parseBufferData(buffer, selectedFile.name, selectedEncoding);
    };
    reader.onerror = () => {
      setErrorMessage('Lỗi hệ thống khi mở tệp tin.');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleEncodingChange = (newEncoding: 'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni') => {
    setSelectedEncoding(newEncoding);
    if (rawFileBuffer && fileName) {
      setIsProcessing(true);
      setTimeout(() => {
        parseBufferData(rawFileBuffer, fileName, newEncoding);
      }, 50);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCommitImport = () => {
    if (parsedStudents.length === 0) {
      setErrorMessage('Vui lòng chọn tệp danh sách hợp lệ trước khi đồng bộ.');
      return;
    }

    onImport(parsedStudents, importMode);
    onClose();
  };

  const existingCodeSet = new Set(existingStudents.map((s) => s.code.toLowerCase()));
  const updateCount = parsedStudents.filter((s) => existingCodeSet.has(s.code.toLowerCase())).length;
  const newCount = parsedStudents.length - updateCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#003366] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Tải Danh Sách Học Sinh Từ File Excel / CSV
              </h2>
              <p className="text-xs text-slate-300">
                Tự động nhận diện bảng mã tiếng Việt (Unicode, TCVN3, VNI, Windows-1258) và chuẩn hóa tên học sinh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Google Sheets Sync Quick Banner */}
          {onOpenGoogleSheetModal && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-[#003366] text-white flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-emerald-300 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-black">Kết Nối Data Base Google Sheet Trực Tuyến</h4>
                  <p className="text-[10px] text-emerald-100">Tải danh sách học sinh realtime từ liên kết Google Sheets không cần tải tệp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleSheetModal();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Mở Google Sheet Sync
              </button>
            </div>
          )}

          {/* Template Download Prompt */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#003366] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Mẫu Tệp Excel Chuẩn Cho {currentClassName}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Tệp mẫu định dạng sẵn đầy đủ các cột: Mã HS, Họ tên, Giới tính, Ngày sinh, Tổ, SĐT, Địa chỉ, Sở trường, Phụ huynh...
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Tải tệp Excel chuẩn (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Mẫu Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                title="Tải tệp CSV (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Vietnamese Font & Encoding Selector */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-600" />
                Bảng Mã Tiếng Việt / Font Chữ Nguồn:
              </label>
              <span className="text-[10px] text-amber-800 font-medium">
                (Tự động khắc phục lỗi ?, , mất dấu tiếng Việt)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleEncodingChange('auto')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                  selectedEncoding === 'auto'
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wand2 className={`w-3.5 h-3.5 ${selectedEncoding === 'auto' ? 'text-amber-300' : 'text-amber-600'}`} />
                <span>Tự Động Sửa Lỗi</span>
              </button>

              <button
                type="button"
                onClick={() => handleEncodingChange('utf8')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                  selectedEncoding === 'utf8'
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Unicode UTF-8</span>
              </button>

              <button
                type="button"
                onClick={() => handleEncodingChange('tcvn3')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                  selectedEncoding === 'tcvn3'
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>TCVN3 (.VnTime)</span>
              </button>

              <button
                type="button"
                onClick={() => handleEncodingChange('vni')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                  selectedEncoding === 'vni'
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>VNI (VNI-Times)</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-[#003366] bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#003366] flex items-center justify-center mb-2 shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {fileName ? fileName : 'Kéo thả hoặc bấm vào đây để chọn tệp Excel / CSV'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Hỗ trợ định dạng <strong>.xlsx, .xls, .csv, .json</strong> (Tự động phục hồi dấu & chuẩn hóa họ tên)
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lỗi đọc dữ liệu:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Đã nhận diện thành công: {parsedStudents.length} học sinh (chuẩn hóa font chữ tiếng Việt)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {importMode === 'merge' && (
                    <>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        Cập nhật: {updateCount} HS
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Thêm mới: {newCount} HS
                      </span>
                    </>
                  )}
                  <span className="text-slate-500">
                    (Hiện có {currentCount} HS trong lớp)
                  </span>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-2 text-center">Giới tính</th>
                      <th className="py-2.5 px-2 text-center">Tổ</th>
                      <th className="py-2.5 px-2.5">SĐT</th>
                      <th className="py-2.5 px-2.5">Phụ huynh</th>
                      <th className="py-2.5 px-2 text-center">ĐTB</th>
                      <th className="py-2.5 px-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedStudents.map((s, idx) => {
                      const isExisting = existingCodeSet.has(s.code.toLowerCase());
                      return (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-mono text-[#003366] font-bold">{s.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {s.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {s.dob} • {s.strengths.slice(0, 28)}...
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600">{s.gender}</td>
                          <td className="py-2 px-2 text-center font-bold text-slate-700">Tổ {s.group}</td>
                          <td className="py-2 px-2.5 text-slate-600 font-mono">{s.phone}</td>
                          <td className="py-2 px-2.5 text-slate-600">
                            {s.emergencyContact?.parentName || '—'}
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {s.emergencyContact?.phone || ''}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-emerald-700">
                            {s.grades?.gpa || '—'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isExisting ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Cập nhật
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Mới
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sync Mode Selection */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Phương thức đồng bộ vào hệ thống {currentClassName}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'merge'
                        ? 'bg-blue-50 border-[#003366] text-[#003366]'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-[#003366]"
                    />
                    <div>
                      <span className="text-xs font-bold block">Đồng bộ & Bổ sung (Khuyên dùng)</span>
                      <span className="text-[10px] text-slate-500">
                        Cập nhật học sinh trùng mã, thêm mới học sinh chưa có trong danh sách
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-rose-50 border-rose-600 text-rose-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <span className="text-xs font-bold block">Thay thế toàn bộ danh sách</span>
                      <span className="text-[10px] text-slate-500">
                        Xoá danh sách cũ và thiết lập hoàn toàn theo tệp Excel vừa tải lên
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            disabled={parsedStudents.length === 0 || isProcessing}
            onClick={handleCommitImport}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>
              {isProcessing
                ? 'Đang xử lý...'
                : `Xác Nhận Tải Lên ${parsedStudents.length > 0 ? `(${parsedStudents.length} Học Sinh)` : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
