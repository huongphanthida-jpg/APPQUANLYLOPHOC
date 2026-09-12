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
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Sliders,
  Settings2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ClassInfo } from '../types';
import {
  extractStructuredSheet,
  getRowValue,
  normalizeHeaderKey,
  removeVietnameseAccents,
} from '../utils/excelParser';
import { autoRepairVietnameseText } from '../utils/googleSheetSync';

export interface SubjectScoreDetail {
  tx1?: number;
  tx2?: number;
  gk?: number;
  ck?: number;
  avg: number;
}

export interface ParsedGradeRow {
  studentCode: string;
  studentName: string;
  group?: number;
  matchedStudentId?: string;
  math: SubjectScoreDetail;
  literature: SubjectScoreDetail;
  gdcd: SubjectScoreDetail;
  history: SubjectScoreDetail;
  geography: SubjectScoreDetail;
  english: SubjectScoreDetail;
  physics: SubjectScoreDetail;
  chemistry: SubjectScoreDetail;
  biology: SubjectScoreDetail;
  gdqpan?: SubjectScoreDetail;
  informatics?: SubjectScoreDetail;
  gpa: number;
  status: 'valid' | 'matched_by_name' | 'not_found' | 'warning';
  warningMessage?: string;
}

interface ImportGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onImportGrades: (
    updatedStudents: Student[],
    periodName: string,
    updateCurrentGrades: boolean
  ) => void;
  classInfo?: ClassInfo;
  existingPeriods: string[];
}

export const SUBJECT_CONFIG = [
  { key: 'math' as const, label: 'Toán Học', aliases: ['toán', 'toan', 'math', 'toán học', 'toan hoc', 'toán (đtb)', 'toán đtb'], color: 'text-blue-700' },
  { key: 'literature' as const, label: 'Ngữ Văn', aliases: ['ngữ văn', 'ngu van', 'văn', 'van', 'literature', 'văn (đtb)', 'ngữ văn (đtb)', 'văn đtb'], color: 'text-purple-700' },
  { key: 'gdcd' as const, label: 'GDCD / GDKT&PL', aliases: ['gdcd', 'gdkt&pl', 'gdkt pl', 'giáo dục công dân', 'giao duc cong dan', 'gdcd (đtb)', 'gdcd/gdkt&pl (đtb)', 'gdcd / gdkt&pl (đtb)', 'gdcd đtb'], color: 'text-yellow-700' },
  { key: 'history' as const, label: 'Lịch Sử', aliases: ['lịch sử', 'lich su', 'sử', 'su', 'history', 'sử (đtb)', 'lịch sử (đtb)', 'sử đtb'], color: 'text-orange-700' },
  { key: 'geography' as const, label: 'Địa Lý', aliases: ['địa lý', 'dia ly', 'địa lí', 'dia li', 'địa', 'dia', 'geography', 'địa (đtb)', 'địa lý (đtb)', 'địa đtb'], color: 'text-indigo-700' },
  { key: 'english' as const, label: 'Tiếng Anh', aliases: ['tiếng anh', 'tieng anh', 'anh', 'english', 'anh (đtb)', 'tiếng anh (đtb)', 'anh đtb'], color: 'text-pink-700' },
  { key: 'physics' as const, label: 'Vật Lý', aliases: ['vật lý', 'vat ly', 'vật lí', 'vat li', 'lý', 'ly', 'physics', 'lý (đtb)', 'vật lý (đtb)', 'lý đtb'], color: 'text-emerald-700' },
  { key: 'chemistry' as const, label: 'Hóa Học', aliases: ['hóa học', 'hoa hoc', 'hóa', 'hoa', 'chemistry', 'hóa (đtb)', 'hóa học (đtb)', 'hóa đtb'], color: 'text-amber-700' },
  { key: 'biology' as const, label: 'Sinh Học', aliases: ['sinh học', 'sinh hoc', 'sinh', 'biology', 'sinh (đtb)', 'sinh học (đtb)', 'sinh đtb'], color: 'text-teal-700' },
  { key: 'gdqpan' as const, label: 'GDQPAN', aliases: ['gdqpan', 'gdqp', 'qpan', 'quốc phòng', 'quoc phong', 'giáo dục quốc phòng', 'giao duc quoc phong', 'gdqpan (đtb)', 'gdqpan đtb', 'gdqp (đtb)', 'gdqp đtb'], color: 'text-red-700' },
];

export const ImportGradesModal: React.FC<ImportGradesModalProps> = ({
  isOpen,
  onClose,
  students,
  onImportGrades,
  classInfo,
  existingPeriods,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawBuffer, setRawBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedEncoding, setSelectedEncoding] = useState<'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni'>('auto');
  const [parsedRows, setParsedRows] = useState<ParsedGradeRow[]>([]);
  const [targetPeriod, setTargetPeriod] = useState<string>('Giữa HK2');
  const [customPeriodName, setCustomPeriodName] = useState<string>('');
  const [isCustomPeriod, setIsCustomPeriod] = useState<boolean>(false);
  const [updateCurrentGrades, setUpdateCurrentGrades] = useState<boolean>(true);
  const [addNewStudents, setAddNewStudents] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'warning'>('all');

  // Interactive Subject Column Adjustment / Mapping state
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [subjectMappings, setSubjectMappings] = useState<Record<string, string>>({});
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [rawExtractedRows, setRawExtractedRows] = useState<Record<string, any>[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentClassName = classInfo?.className || 'Lớp 12A1';
  const safeClassName = currentClassName.replace(/[^a-zA-Z0-9]/g, '_');

  const standardPeriods = [
    'Tháng 9',
    'Giữa HK1',
    'Cuối HK1',
    'Giữa HK2',
    'Thi Thử TN THPT (Đợt 1)',
    'Thi Thử TN THPT (Đợt 2)',
    'Khảo Sát Chất Lượng Khối A',
  ];

  const allAvailablePeriods = Array.from(new Set([...standardPeriods, ...existingPeriods]));
  const effectivePeriod = isCustomPeriod ? (customPeriodName.trim() || 'Đợt Đánh Giá Mới') : targetPeriod;

  // Helper to parse numbers safely
  const parseScore = (val: any, fallback: number = 8.0): number => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.').trim());
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(10, Number(num.toFixed(1))));
  };

  // Helper to calculate subject avg
  const calcSubjAvg = (tx1: number, tx2: number, gk: number, ck: number): number => {
    return Number(((tx1 + tx2 + gk * 2 + ck * 3) / 7).toFixed(1));
  };

  // Download Sample Excel File (.xlsx & .csv) for 9 subjects (TBM only)
  const handleDownloadExcelTemplate = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const defaultDemoRows = [
      { code: 'HS001', name: 'Nguyễn Văn A', group: 1, grades: { math: { avg: 9.0 }, literature: { avg: 8.5 }, gdcd: { avg: 9.0 }, history: { avg: 8.5 }, geography: { avg: 8.0 }, english: { avg: 9.5 }, physics: { avg: 8.8 }, chemistry: { avg: 9.2 }, biology: { avg: 8.0 }, gpa: 8.7 } },
      { code: 'HS002', name: 'Trần Thị B', group: 1, grades: { math: { avg: 9.5 }, literature: { avg: 9.0 }, gdcd: { avg: 9.0 }, history: { avg: 9.0 }, geography: { avg: 9.2 }, english: { avg: 9.5 }, physics: { avg: 9.2 }, chemistry: { avg: 9.0 }, biology: { avg: 9.0 }, gpa: 9.2 } },
    ];

    const dataRows = students.length > 0 ? students : defaultDemoRows;

    const templateData = dataRows.map((s: any) => ({
      'Mã HS': s.code,
      'Họ và Tên': s.name,
      'Tổ': s.group,
      'Toán (ĐTB)': s.grades.math?.avg ?? 8.5,
      'Văn (ĐTB)': s.grades.literature?.avg ?? 8.0,
      'GDCD (ĐTB)': s.grades.gdcd?.avg ?? 8.5,
      'Sử (ĐTB)': s.grades.history?.avg ?? 8.0,
      'Địa (ĐTB)': s.grades.geography?.avg ?? 8.2,
      'Anh (ĐTB)': s.grades.english?.avg ?? 8.6,
      'Lý (ĐTB)': s.grades.physics?.avg ?? 8.5,
      'Hóa (ĐTB)': s.grades.chemistry?.avg ?? 8.5,
      'Sinh (ĐTB)': s.grades.biology?.avg ?? 8.2,
      'Ghi Chú': 'Mẫu cập nhật điểm trung bình môn (TBM) 9 môn học',
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(templateData);
      ws['!cols'] = [
        { wch: 15 },
        { wch: 24 },
        { wch: 6 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem_TBM');
      XLSX.writeFile(wb, `Mau_Bang_Diem_TBM_${safeClassName}_${effectivePeriod.replace(/\s+/g, '_')}.xlsx`);
    } else {
      const ws = XLSX.utils.json_to_sheet(templateData);
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mau_Bang_Diem_TBM_${safeClassName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Helper to parse rows with dynamic column mappings
  const parseRowsWithMapping = (
    extractedRows: Record<string, any>[],
    mappings: Record<string, string>
  ): ParsedGradeRow[] => {
    const parsed: ParsedGradeRow[] = [];

    extractedRows.forEach((row, rIdx) => {
      // Extract student identity with broad aliases
      const rawCode = getRowValue(row, [
        'mã hs', 'mã học sinh', 'ma hs', 'mshs', 'sbd', 'số báo danh', 'code', 'id', 'student code', 'stt',
      ]);
      const rawName = getRowValue(row, [
        'họ và tên', 'họ tên', 'tên học sinh', 'tên', 'ho va ten', 'ho ten', 'ten', 'full name', 'fullname', 'học sinh',
      ]);

      const codeVal = rawCode !== undefined && rawCode !== null ? String(rawCode).trim() : '';
      const nameVal = rawName !== undefined && rawName !== null ? autoRepairVietnameseText(String(rawName).trim()) : '';

      const rawGroup = getRowValue(row, ['tổ', 'to', 'nhóm', 'group']);
      const groupVal = rawGroup ? parseInt(String(rawGroup).replace(/[^0-9]/g, ''), 10) : undefined;

      // Try match existing student
      let matchedStudent: Student | undefined = undefined;
      let status: 'valid' | 'matched_by_name' | 'not_found' | 'warning' = 'valid';
      let warningMessage: string | undefined = undefined;

      if (codeVal) {
        matchedStudent = students.find((s) => s.code.toLowerCase().trim() === codeVal.toLowerCase());
      }

      if (!matchedStudent && nameVal) {
        matchedStudent = students.find((s) => s.name.toLowerCase().trim() === nameVal.toLowerCase());
        if (matchedStudent) {
          status = 'matched_by_name';
          warningMessage = `Khớp qua Tên: ${matchedStudent.name} (${matchedStudent.code})`;
        }
      }

      if (!matchedStudent && (!codeVal || codeVal === String(rIdx + 1)) && rIdx < students.length) {
        matchedStudent = students.find((_, sIdx) => sIdx === rIdx);
        if (matchedStudent) {
          status = 'matched_by_name';
          warningMessage = `Khớp theo vị trí STT ${rIdx + 1}: ${matchedStudent.name}`;
        }
      }

      if (!matchedStudent) {
        status = 'not_found';
        warningMessage = 'Học sinh chưa có trong danh sách hiện tại của lớp';
      }

      // Helper to build score detail for any subject
      const parseSubjectScore = (
        subjKey: string,
        standardAliases: { tx1: string[]; tx2: string[]; gk: string[]; ck: string[]; avg: string[] },
        fallbackValues: { tx1: number; tx2: number; gk: number; ck: number; avg: number }
      ): SubjectScoreDetail => {
        const customCol = mappings[subjKey];
        
        const tx1Aliases = customCol ? [`${customCol} tx1`, customCol] : standardAliases.tx1;
        const tx2Aliases = customCol ? [`${customCol} tx2`] : standardAliases.tx2;
        const gkAliases  = customCol ? [`${customCol} gk`]  : standardAliases.gk;
        const ckAliases  = customCol ? [`${customCol} ck`]  : standardAliases.ck;
        const avgAliases = customCol ? [customCol, `${customCol} đtb`, `${customCol} tb`] : standardAliases.avg;

        const rawTx1 = getRowValue(row, tx1Aliases);
        const rawTx2 = getRowValue(row, tx2Aliases);
        const rawGk  = getRowValue(row, gkAliases);
        const rawCk  = getRowValue(row, ckAliases);
        const rawAvg = getRowValue(row, avgAliases);

        const tx1 = rawTx1 !== undefined ? parseScore(rawTx1, fallbackValues.tx1) : fallbackValues.tx1;
        const tx2 = rawTx2 !== undefined ? parseScore(rawTx2, fallbackValues.tx2) : fallbackValues.tx2;
        const gk  = rawGk  !== undefined ? parseScore(rawGk,  fallbackValues.gk)  : fallbackValues.gk;
        const ck  = rawCk  !== undefined ? parseScore(rawCk,  fallbackValues.ck)  : fallbackValues.ck;
        const avg = rawAvg !== undefined && rawAvg !== '' ? parseScore(rawAvg, calcSubjAvg(tx1, tx2, gk, ck)) : calcSubjAvg(tx1, tx2, gk, ck);

        return { tx1, tx2, gk, ck, avg };
      };

      // 1. Math
      const math = parseSubjectScore(
        'math',
        {
          tx1: ['toán tx1', 'toan tx1', 'toán đgtx1', 'toán 15p', 'toan 15p', 'math tx1'],
          tx2: ['toán tx2', 'toan tx2', 'toán đgtx2', 'toán 45p', 'toan 45p', 'math tx2'],
          gk: ['toán gk', 'toan gk', 'toán giữa kỳ', 'toán đggk', 'toan giua ky', 'math gk'],
          ck: ['toán ck', 'toan ck', 'toán cuối kỳ', 'toán đgck', 'toan cuoi ky', 'math ck'],
          avg: ['toán (đtb)', 'toán đtb', 'toan dtb', 'toán tb', 'toán', 'toan', 'điểm toán', 'diem toan', 'math'],
        },
        {
          tx1: matchedStudent?.grades.math.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.math.tx2 ?? 8.5,
          gk: matchedStudent?.grades.math.gk ?? 8.5,
          ck: matchedStudent?.grades.math.ck ?? 8.5,
          avg: matchedStudent?.grades.math.avg ?? 8.5,
        }
      );

      // 2. Literature
      const literature = parseSubjectScore(
        'literature',
        {
          tx1: ['văn tx1', 'ngữ văn tx1', 'literature tx1'],
          tx2: ['văn tx2', 'ngữ văn tx2', 'literature tx2'],
          gk: ['văn gk', 'ngữ văn gk', 'literature gk'],
          ck: ['văn ck', 'ngữ văn ck', 'literature ck'],
          avg: ['văn (đtb)', 'ngữ văn (đtb)', 'văn đtb', 'văn tb', 'ngữ văn', 'ngu van', 'văn', 'van', 'literature'],
        },
        {
          tx1: matchedStudent?.grades.literature.tx1 ?? 8.0,
          tx2: matchedStudent?.grades.literature.tx2 ?? 8.0,
          gk: matchedStudent?.grades.literature.gk ?? 8.0,
          ck: matchedStudent?.grades.literature.ck ?? 8.0,
          avg: matchedStudent?.grades.literature.avg ?? 8.0,
        }
      );

      // 3. GDCD / GDKT&PL
      const gdcd = parseSubjectScore(
        'gdcd',
        {
          tx1: ['gdcd tx1', 'gdkt&pl tx1'],
          tx2: ['gdcd tx2', 'gdkt&pl tx2'],
          gk: ['gdcd gk', 'gdkt&pl gk'],
          ck: ['gdcd ck', 'gdkt&pl ck'],
          avg: ['gdcd (đtb)', 'gdcd/gdkt&pl (đtb)', 'gdcd / gdkt&pl (đtb)', 'gdcd đtb', 'gdcd tb', 'gdcd', 'gdkt&pl', 'gdkt pl', 'giáo dục công dân'],
        },
        {
          tx1: matchedStudent?.grades.gdcd?.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.gdcd?.tx2 ?? 8.5,
          gk: matchedStudent?.grades.gdcd?.gk ?? 8.5,
          ck: matchedStudent?.grades.gdcd?.ck ?? 8.5,
          avg: matchedStudent?.grades.gdcd?.avg ?? 8.5,
        }
      );

      // 4. History
      const history = parseSubjectScore(
        'history',
        {
          tx1: ['sử tx1', 'lịch sử tx1', 'history tx1'],
          tx2: ['sử tx2', 'lịch sử tx2', 'history tx2'],
          gk: ['sử gk', 'lịch sử gk', 'history gk'],
          ck: ['sử ck', 'lịch sử ck', 'history ck'],
          avg: ['sử (đtb)', 'lịch sử (đtb)', 'sử đtb', 'sử tb', 'lịch sử', 'lich su', 'sử', 'su', 'history'],
        },
        {
          tx1: matchedStudent?.grades.history?.tx1 ?? 8.0,
          tx2: matchedStudent?.grades.history?.tx2 ?? 8.0,
          gk: matchedStudent?.grades.history?.gk ?? 8.0,
          ck: matchedStudent?.grades.history?.ck ?? 8.0,
          avg: matchedStudent?.grades.history?.avg ?? 8.0,
        }
      );

      // 5. Geography
      const geography = parseSubjectScore(
        'geography',
        {
          tx1: ['địa tx1', 'địa lý tx1', 'geography tx1'],
          tx2: ['địa tx2', 'địa lý tx2', 'geography tx2'],
          gk: ['địa gk', 'địa lý gk', 'geography gk'],
          ck: ['địa ck', 'địa lý ck', 'geography ck'],
          avg: ['địa (đtb)', 'địa lý (đtb)', 'địa đtb', 'địa tb', 'địa lý', 'dia ly', 'địa lí', 'dia li', 'địa', 'dia', 'geography'],
        },
        {
          tx1: matchedStudent?.grades.geography?.tx1 ?? 8.2,
          tx2: matchedStudent?.grades.geography?.tx2 ?? 8.2,
          gk: matchedStudent?.grades.geography?.gk ?? 8.2,
          ck: matchedStudent?.grades.geography?.ck ?? 8.2,
          avg: matchedStudent?.grades.geography?.avg ?? 8.2,
        }
      );

      // 6. English
      const english = parseSubjectScore(
        'english',
        {
          tx1: ['anh tx1', 'tiếng anh tx1', 'english tx1'],
          tx2: ['anh tx2', 'tiếng anh tx2', 'english tx2'],
          gk: ['anh gk', 'tiếng anh gk', 'english gk'],
          ck: ['anh ck', 'tiếng anh ck', 'english ck'],
          avg: ['anh (đtb)', 'tiếng anh (đtb)', 'anh đtb', 'anh tb', 'tiếng anh', 'tieng anh', 'anh', 'english'],
        },
        {
          tx1: matchedStudent?.grades.english.tx1 ?? 8.6,
          tx2: matchedStudent?.grades.english.tx2 ?? 8.6,
          gk: matchedStudent?.grades.english.gk ?? 8.6,
          ck: matchedStudent?.grades.english.ck ?? 8.6,
          avg: matchedStudent?.grades.english.avg ?? 8.6,
        }
      );

      // 7. Physics
      const physics = parseSubjectScore(
        'physics',
        {
          tx1: ['lý tx1', 'ly tx1', 'vật lý tx1', 'vật lí tx1', 'physics tx1'],
          tx2: ['lý tx2', 'ly tx2', 'vật lý tx2', 'vật lí tx2', 'physics tx2'],
          gk: ['lý gk', 'ly gk', 'vật lý gk', 'vật lý giữa kỳ', 'vật lí gk', 'physics gk'],
          ck: ['lý ck', 'ly ck', 'vật lý ck', 'vật lý cuối kỳ', 'vật lí ck', 'physics ck'],
          avg: ['lý (đtb)', 'vật lý (đtb)', 'lý đtb', 'ly dtb', 'lý tb', 'vật lý', 'vật lí', 'ly', 'điểm lý', 'physics'],
        },
        {
          tx1: matchedStudent?.grades.physics.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.physics.tx2 ?? 8.5,
          gk: matchedStudent?.grades.physics.gk ?? 8.5,
          ck: matchedStudent?.grades.physics.ck ?? 8.5,
          avg: matchedStudent?.grades.physics.avg ?? 8.5,
        }
      );

      // 8. Chemistry
      const chemistry = parseSubjectScore(
        'chemistry',
        {
          tx1: ['hóa tx1', 'hoa tx1', 'hóa học tx1', 'chemistry tx1'],
          tx2: ['hóa tx2', 'hoa tx2', 'hóa học tx2', 'chemistry tx2'],
          gk: ['hóa gk', 'hoa gk', 'hóa học gk', 'hóa học giữa kỳ', 'chemistry gk'],
          ck: ['hóa ck', 'hoa ck', 'hóa học ck', 'hóa học cuối kỳ', 'chemistry ck'],
          avg: ['hóa (đtb)', 'hóa học (đtb)', 'hóa đtb', 'hoa dtb', 'hóa tb', 'hóa học', 'hoa hoc', 'hóa', 'hoa', 'điểm hóa', 'chemistry'],
        },
        {
          tx1: matchedStudent?.grades.chemistry.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.chemistry.tx2 ?? 8.5,
          gk: matchedStudent?.grades.chemistry.gk ?? 8.5,
          ck: matchedStudent?.grades.chemistry.ck ?? 8.5,
          avg: matchedStudent?.grades.chemistry.avg ?? 8.5,
        }
      );

      // 9. Biology
      const biology = parseSubjectScore(
        'biology',
        {
          tx1: ['sinh tx1', 'sinh học tx1', 'biology tx1'],
          tx2: ['sinh tx2', 'sinh học tx2', 'biology tx2'],
          gk: ['sinh gk', 'sinh học gk', 'biology gk'],
          ck: ['sinh ck', 'sinh học ck', 'biology ck'],
          avg: ['sinh (đtb)', 'sinh học (đtb)', 'sinh đtb', 'sinh tb', 'sinh học', 'sinh hoc', 'sinh', 'biology'],
        },
        {
          tx1: matchedStudent?.grades.biology.tx1 ?? 8.2,
          tx2: matchedStudent?.grades.biology.tx2 ?? 8.2,
          gk: matchedStudent?.grades.biology.gk ?? 8.2,
          ck: matchedStudent?.grades.biology.ck ?? 8.2,
          avg: matchedStudent?.grades.biology.avg ?? 8.2,
        }
      );

      // 10. GDQPAN (Giáo dục Quốc phòng và An ninh)
      const gdqpan = parseSubjectScore(
        'gdqpan',
        {
          tx1: ['gdqpan tx1', 'gdqp tx1', 'quốc phòng tx1'],
          tx2: ['gdqpan tx2', 'gdqp tx2', 'quốc phòng tx2'],
          gk: ['gdqpan gk', 'gdqp gk', 'quốc phòng gk'],
          ck: ['gdqpan ck', 'gdqp ck', 'quốc phòng ck'],
          avg: ['gdqpan (đtb)', 'gdqp (đtb)', 'gdqpan đtb', 'gdqp đtb', 'gdqpan', 'gdqp', 'qpan', 'quốc phòng', 'quoc phong', 'giáo dục quốc phòng'],
        },
        {
          tx1: matchedStudent?.grades.gdqpan?.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.gdqpan?.tx2 ?? 8.5,
          gk: matchedStudent?.grades.gdqpan?.gk ?? 8.5,
          ck: matchedStudent?.grades.gdqpan?.ck ?? 8.5,
          avg: matchedStudent?.grades.gdqpan?.avg ?? 8.5,
        }
      );

      // 11. Informatics (Optional)
      const informatics = parseSubjectScore(
        'informatics',
        {
          tx1: ['tin tx1', 'tin học tx1', 'informatics tx1'],
          tx2: ['tin tx2', 'tin học tx2', 'informatics tx2'],
          gk: ['tin gk', 'tin học gk', 'informatics gk'],
          ck: ['tin ck', 'tin học ck', 'informatics ck'],
          avg: ['tin (đtb)', 'tin đtb', 'tin tb', 'tin học', 'tin hoc', 'tin', 'informatics'],
        },
        {
          tx1: matchedStudent?.grades.informatics?.tx1 ?? 8.5,
          tx2: matchedStudent?.grades.informatics?.tx2 ?? 8.5,
          gk: matchedStudent?.grades.informatics?.gk ?? 8.5,
          ck: matchedStudent?.grades.informatics?.ck ?? 8.5,
          avg: matchedStudent?.grades.informatics?.avg ?? 8.5,
        }
      );

      // Calculate GPA across all 9 standard subjects
      const rawGpa = getRowValue(row, ['đtb 9 môn', 'đtb khối a', 'đtb', 'điểm tb', 'gpa', 'dtb', 'điểm trung bình']);
      const allAvgs = [
        math.avg,
        literature.avg,
        gdcd.avg,
        history.avg,
        geography.avg,
        english.avg,
        physics.avg,
        chemistry.avg,
        biology.avg,
      ];
      const calculatedGpa =
        rawGpa !== undefined && rawGpa !== ''
          ? parseScore(rawGpa, Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2)))
          : Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2));

      const finalCode = codeVal || matchedStudent?.code || `HS-${(rIdx + 1).toString().padStart(2, '0')}`;
      const finalName = nameVal || matchedStudent?.name || `Học sinh ${rIdx + 1}`;

      parsed.push({
        studentCode: finalCode,
        studentName: finalName,
        group: groupVal || matchedStudent?.group || 1,
        matchedStudentId: matchedStudent?.id,
        math,
        literature,
        gdcd,
        history,
        geography,
        english,
        physics,
        chemistry,
        biology,
        gdqpan,
        informatics,
        gpa: calculatedGpa,
        status,
        warningMessage,
      });
    });

    return parsed;
  };

  // Process and extract grades from buffer
  const parseBufferData = (
    buffer: ArrayBuffer,
    nameOfFile: string,
    encoding: 'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni'
  ) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const isJson = nameOfFile.endsWith('.json');
      let extractedRows: Record<string, any>[] = [];

      if (isJson) {
        const text = new TextDecoder('utf-8').decode(buffer);
        const parsed = JSON.parse(text);
        extractedRows = Array.isArray(parsed) ? parsed : parsed.students || parsed.rows || [];
      } else {
        const codepage = encoding === 'win1258' ? 1258 : encoding === 'tcvn3' ? 1258 : undefined;
        const workbook = XLSX.read(new Uint8Array(buffer), {
          type: 'array',
          codepage,
          raw: false,
        });

        const extracted = extractStructuredSheet(workbook, encoding);
        extractedRows = extracted.rows;
      }

      if (!extractedRows || extractedRows.length === 0) {
        throw new Error('Tệp không chứa dòng dữ liệu nào.');
      }

      setRawExtractedRows(extractedRows);

      // Auto-detect columns in the file
      const firstRowKeys = Object.keys(extractedRows[0] || {});
      setDetectedColumns(firstRowKeys);

      // Auto-detect default subject mapping
      const autoMappings: Record<string, string> = {};
      SUBJECT_CONFIG.forEach((subj) => {
        const matchedCol = firstRowKeys.find((col) => {
          const colNorm = removeVietnameseAccents(normalizeHeaderKey(col));
          return subj.aliases.some((alias) => colNorm.includes(removeVietnameseAccents(alias)));
        });
        if (matchedCol) {
          autoMappings[subj.key] = matchedCol;
        }
      });
      setSubjectMappings(autoMappings);

      const parsed = parseRowsWithMapping(extractedRows, autoMappings);

      if (parsed.length === 0) {
        throw new Error('Không tìm thấy bản ghi điểm số nào từ tệp. Vui lòng kiểm tra lại cấu trúc bảng tính.');
      }

      setParsedRows(parsed);
      setStep('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Lỗi đọc tệp Excel/CSV. Vui lòng kiểm tra lại cấu trúc bảng tính.');
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for manual subject column re-mapping
  const handleMappingChange = (subjKey: string, colName: string) => {
    const updatedMappings = { ...subjectMappings, [subjKey]: colName };
    setSubjectMappings(updatedMappings);

    if (rawExtractedRows.length > 0) {
      const reParsed = parseRowsWithMapping(rawExtractedRows, updatedMappings);
      setParsedRows(reParsed);
    }
  };

  // Process File when selected
  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      setRawBuffer(buffer);
      parseBufferData(buffer, selectedFile.name, selectedEncoding);
    };
    reader.onerror = () => {
      setErrorMessage('Không thể đọc nội dung tệp tin từ thiết bị.');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processSelectedFile(droppedFile);
    }
  };

  const handleEncodingChange = (newEnc: 'auto' | 'utf8' | 'win1258' | 'tcvn3' | 'vni') => {
    setSelectedEncoding(newEnc);
    if (rawBuffer && fileName) {
      parseBufferData(rawBuffer, fileName, newEnc);
    }
  };

  // Submit and Save Grades to Students List
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const matchedMap = new Map<string, ParsedGradeRow>();
    parsedRows.forEach((r) => {
      if (r.matchedStudentId) {
        matchedMap.set(r.matchedStudentId, r);
      } else {
        const found = students.find(
          (s) =>
            s.code.toLowerCase().trim() === r.studentCode.toLowerCase().trim() ||
            s.name.toLowerCase().trim() === r.studentName.toLowerCase().trim()
        );
        if (found) {
          matchedMap.set(found.id, r);
        }
      }
    });

    const updatedStudentsList: Student[] = students.map((stu) => {
      const rowData = matchedMap.get(stu.id);
      if (!rowData) return stu;

      // Update current grades if enabled
      const newGrades = updateCurrentGrades
        ? {
            math: { ...stu.grades.math, ...rowData.math },
            literature: { ...stu.grades.literature, ...rowData.literature },
            gdcd: { ...(stu.grades.gdcd || {}), ...rowData.gdcd },
            history: { ...(stu.grades.history || {}), ...rowData.history },
            geography: { ...(stu.grades.geography || {}), ...rowData.geography },
            english: { ...stu.grades.english, ...rowData.english },
            physics: { ...stu.grades.physics, ...rowData.physics },
            chemistry: { ...stu.grades.chemistry, ...rowData.chemistry },
            biology: { ...stu.grades.biology, ...rowData.biology },
            gdqpan: rowData.gdqpan ? { ...(stu.grades.gdqpan || {}), ...rowData.gdqpan } : stu.grades.gdqpan,
            informatics: rowData.informatics ? { ...(stu.grades.informatics || {}), ...rowData.informatics } : stu.grades.informatics,
            gpa: rowData.gpa,
          }
        : stu.grades;

      // Update or Append progressHistory for the target period
      const existingHistory = [...(stu.progressHistory || [])];
      const periodIdx = existingHistory.findIndex((p) => p.period === effectivePeriod);

      const periodSnapshot: any = {
        period: effectivePeriod,
        math: rowData.math.avg,
        literature: rowData.literature.avg,
        gdcd: rowData.gdcd.avg,
        history: rowData.history.avg,
        geography: rowData.geography.avg,
        english: rowData.english.avg,
        physics: rowData.physics.avg,
        chemistry: rowData.chemistry.avg,
        biology: rowData.biology.avg,
        gpa: rowData.gpa,
      };
      if (rowData.gdqpan?.avg) {
        periodSnapshot.gdqpan = rowData.gdqpan.avg;
      }
      if (rowData.informatics?.avg) {
        periodSnapshot.informatics = rowData.informatics.avg;
      }

      if (periodIdx >= 0) {
        existingHistory[periodIdx] = periodSnapshot;
      } else {
        existingHistory.push(periodSnapshot);
      }

      return {
        ...stu,
        grades: newGrades,
        progressHistory: existingHistory,
      };
    });

    // If add new students is checked and there are unmatched rows
    if (addNewStudents) {
      parsedRows.forEach((r, idx) => {
        if (!r.matchedStudentId && !matchedMap.has(r.studentCode)) {
          const newStudent: Student = {
            id: `hs-import-${Date.now()}-${idx}`,
            code: r.studentCode,
            name: r.studentName,
            gender: 'Nam',
            dob: '2008-01-01',
            group: (r.group && r.group >= 1 && r.group <= 4 ? r.group : 1) as 1 | 2 | 3 | 4,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            phone: '',
            email: '',
            address: '',
            strengths: '',
            careerAspiration: '',
            healthNote: '',
            emergencyContact: {
              parentName: '',
              relationship: 'Bố',
              phone: '',
              workplace: '',
            },
            grades: {
              math: r.math,
              literature: r.literature,
              gdcd: r.gdcd,
              history: r.history,
              geography: r.geography,
              english: r.english,
              physics: r.physics,
              chemistry: r.chemistry,
              biology: r.biology,
              gdqpan: r.gdqpan,
              informatics: r.informatics,
              gpa: r.gpa,
            },
            progressHistory: [
              {
                period: effectivePeriod,
                math: r.math.avg,
                literature: r.literature.avg,
                gdcd: r.gdcd.avg,
                history: r.history.avg,
                geography: r.geography.avg,
                english: r.english.avg,
                physics: r.physics.avg,
                chemistry: r.chemistry.avg,
                biology: r.biology.avg,
                gdqpan: r.gdqpan?.avg,
                informatics: r.informatics?.avg,
                gpa: r.gpa,
              },
            ],
            conductScore: 95,
            conductRating: 'Tốt',
            violationsCount: 0,
            commendationsCount: 0,
            absenceCount: 0,
            violations: [],
            commendations: ['Cập nhật điểm từ Excel'],
          };
          updatedStudentsList.push(newStudent);
        }
      });
    }

    onImportGrades(updatedStudentsList, effectivePeriod, updateCurrentGrades);
    setStep('success');
  };

  const filteredRows = parsedRows.filter((r) => {
    if (previewFilter === 'valid') return r.status === 'valid' || r.status === 'matched_by_name';
    if (previewFilter === 'warning') return r.status === 'not_found' || r.status === 'warning';
    return true;
  });

  const matchedCount = parsedRows.filter((r) => r.status === 'valid' || r.status === 'matched_by_name').length;
  const avgParsedGpa = parsedRows.length
    ? (parsedRows.reduce((acc, r) => acc + r.gpa, 0) / parsedRows.length).toFixed(2)
    : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#003366] to-[#002244] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Import Sổ Điểm Các Môn Excel (9 Môn)
                </span>
                <span className="text-xs text-slate-300">Hỗ trợ .xlsx, .xls, .csv, .json</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Cập Nhật Điểm Số & Tự Điều Chỉnh Môn Học Đã Tải Lên
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* STEP 1: Upload & Period Configuration */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Period Selector Box */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <h4 className="text-sm font-bold text-[#003366]">
                      1. Chọn Đợt Đánh Giá / Kỳ Thi Cần Cập Nhật
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    Ghi nhận vào tiến trình biểu đồ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Đợt Đánh Giá Áp Dụng:
                    </label>
                    <select
                      value={isCustomPeriod ? 'custom' : targetPeriod}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomPeriod(true);
                        } else {
                          setIsCustomPeriod(false);
                          setTargetPeriod(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#003366] focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {allAvailablePeriods.map((p) => (
                        <option key={p} value={p}>
                          📌 {p}
                        </option>
                      ))}
                      <option value="custom">➕ Tạo Đợt Đánh Giá Mới...</option>
                    </select>
                  </div>

                  {isCustomPeriod && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-slate-700 block">
                        Tên Đợt Đánh Giá Mới:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Khảo Sát 9 Môn Tháng 3, Thi Thử Lần 2..."
                        value={customPeriodName}
                        onChange={(e) => setCustomPeriodName(e.target.value)}
                        className="w-full bg-white border border-blue-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={updateCurrentGrades}
                      onChange={(e) => setUpdateCurrentGrades(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">
                      Đồng bộ làm Sổ Điểm Hiện Tại của lớp
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addNewStudents}
                      onChange={(e) => setAddNewStudents(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Thêm học sinh mới nếu file có học sinh chưa tồn tại</span>
                  </label>
                </div>
              </div>

              {/* Template Download Option */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    Chưa có tệp bảng điểm theo mẫu chuẩn (9 môn)?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tải mẫu Excel (.xlsx) đã điền sẵn danh sách {students.length} học sinh lớp {currentClassName} với đầy đủ 9 môn học để nhập điểm nhanh chóng.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadExcelTemplate('xlsx')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Mẫu Excel 9 Môn (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadExcelTemplate('csv')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. Chọn Tệp Excel / CSV Bảng Điểm Từ Máy Tính:
                  </label>
                  {/* Encoding Selector */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Bảng mã tiếng Việt:</span>
                    <select
                      value={selectedEncoding}
                      onChange={(e) => handleEncodingChange(e.target.value as any)}
                      className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="auto">✨ Tự Động Sửa Lỗi Font</option>
                      <option value="utf8">Unicode UTF-8</option>
                      <option value="tcvn3">TCVN3 (.VnTime)</option>
                      <option value="vni">VNI-Windows</option>
                      <option value="win1258">Windows-1258</option>
                    </select>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-blue-600 bg-blue-100/70 scale-[1.01]'
                      : fileName
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    {isProcessing ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {isProcessing
                        ? 'Đang phân tích cấu trúc dữ liệu bảng điểm...'
                        : fileName
                        ? fileName
                        : 'Nhấp để chọn tệp hoặc kéo thả file Excel vào đây'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Định dạng hỗ trợ: .xlsx, .xls, .csv, .json (Tự động nhận diện & ghép đúng 9 môn học)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, .json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Lỗi xử lý tệp</p>
                    <p className="mt-0.5">{errorMessage}</p>
                    <p className="mt-1 text-[11px] text-red-600">
                      Mẹo: Tải về "Mẫu Excel 9 Môn (.xlsx)" ở trên, điền điểm và tải lên lại để đảm bảo dữ liệu được nhận diện chính xác nhất.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Preview & Dynamic Subject Mapping */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-bold uppercase">Đợt Cập Nhật</p>
                  <p className="text-sm font-black text-[#003366] truncate mt-0.5">
                    {effectivePeriod}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tổng Số Dòng</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {parsedRows.length} học sinh
                  </p>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Khớp Dữ Liệu</p>
                  <p className="text-base font-black text-emerald-800 mt-0.5">
                    {matchedCount} / {parsedRows.length} HS
                  </p>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-bold uppercase">ĐTB 9 Môn Dự Kiến</p>
                  <p className="text-base font-black text-amber-800 mt-0.5">
                    {avgParsedGpa} / 10
                  </p>
                </div>
              </div>

              {/* TỰ ĐIỀU CHỈNH MÔN HỌC (Subject Column Alignment Box) */}
              <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowMappingConfig(!showMappingConfig)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-xs">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Tự Điều Chỉnh Môn Học Đúng Với File Tải Lên
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                          {detectedColumns.length} cột tự nhận diện
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Nhấp để kiểm tra hoặc chọn lại cột tương ứng cho từng môn học nếu file của bạn dùng tên cột tùy chỉnh.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMappingConfig(!showMappingConfig);
                    }}
                    className="text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>{showMappingConfig ? 'Thu gọn điều chỉnh' : 'Tự điều chỉnh môn'}</span>
                  </button>
                </div>

                {showMappingConfig && (
                  <div className="pt-3 border-t border-amber-200/60 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2">
                      {SUBJECT_CONFIG.map((subj) => {
                        const currentCol = subjectMappings[subj.key] || '';
                        return (
                          <div key={subj.key} className="bg-white p-2 rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
                            <label className={`text-[11px] font-bold block truncate ${subj.color}`}>
                              {subj.label}:
                            </label>
                            <select
                              value={currentCol}
                              onChange={(e) => handleMappingChange(subj.key, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer truncate"
                            >
                              <option value="">✨ Tự động tìm</option>
                              {detectedColumns.map((col) => (
                                <option key={col} value={col}>
                                  {col}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>💡 Điểm ĐTB tự động cập nhật ngay khi bạn thay đổi môn học tương ứng.</span>
                      <button
                        type="button"
                        onClick={() => {
                          const autoMappings: Record<string, string> = {};
                          SUBJECT_CONFIG.forEach((subj) => {
                            const matchedCol = detectedColumns.find((col) => {
                              const colNorm = removeVietnameseAccents(normalizeHeaderKey(col));
                              return subj.aliases.some((alias) => colNorm.includes(removeVietnameseAccents(alias)));
                            });
                            if (matchedCol) autoMappings[subj.key] = matchedCol;
                          });
                          setSubjectMappings(autoMappings);
                          if (rawExtractedRows.length > 0) {
                            setParsedRows(parseRowsWithMapping(rawExtractedRows, autoMappings));
                          }
                        }}
                        className="text-amber-800 font-bold hover:underline cursor-pointer"
                      >
                        🔄 Khôi phục mặc định
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Tabs & Encoding Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setPreviewFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      previewFilter === 'all'
                        ? 'bg-[#003366] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tất Cả ({parsedRows.length})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      previewFilter === 'valid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Hợp Lệ ({matchedCount})
                  </button>
                  {parsedRows.length - matchedCount > 0 && (
                    <button
                      onClick={() => setPreviewFilter('warning')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        previewFilter === 'warning'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      Cảnh Báo ({parsedRows.length - matchedCount})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Bảng mã:</span>
                    <select
                      value={selectedEncoding}
                      onChange={(e) => handleEncodingChange(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="auto">Tự động sửa lỗi</option>
                      <option value="utf8">Unicode</option>
                      <option value="tcvn3">TCVN3 (.VnTime)</option>
                      <option value="vni">VNI-Windows</option>
                      <option value="win1258">Windows-1258</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('upload');
                      setFile(null);
                      setFileName('');
                      setRawBuffer(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                  >
                    Chọn Tệp Khác
                  </button>
                </div>
              </div>

              {/* Preview Table for all 9 Subjects */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-2 text-center text-blue-700">Toán</th>
                      <th className="py-2.5 px-2 text-center text-purple-700">Văn</th>
                      <th className="py-2.5 px-2 text-center text-yellow-700">GDCD</th>
                      <th className="py-2.5 px-2 text-center text-orange-700">Sử</th>
                      <th className="py-2.5 px-2 text-center text-indigo-700">Địa</th>
                      <th className="py-2.5 px-2 text-center text-pink-700">Anh</th>
                      <th className="py-2.5 px-2 text-center text-emerald-700">Lý</th>
                      <th className="py-2.5 px-2 text-center text-amber-700">Hóa</th>
                      <th className="py-2.5 px-2 text-center text-teal-700">Sinh</th>
                      <th className="py-2.5 px-3 text-center text-[#003366] font-extrabold bg-blue-50/80">
                        ĐTB 9 Môn
                      </th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {r.studentCode}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {r.studentName}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-blue-700">
                          {r.math.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-purple-700">
                          {r.literature.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-yellow-700">
                          {r.gdcd.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-orange-700">
                          {r.history.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-indigo-700">
                          {r.geography.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-pink-700">
                          {r.english.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-emerald-700">
                          {r.physics.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-amber-700">
                          {r.chemistry.avg}
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-teal-700">
                          {r.biology.avg}
                        </td>
                        <td className="py-2 px-3 text-center font-black text-[#003366] bg-blue-50/50">
                          {r.gpa}
                        </td>
                        <td className="py-2 px-3">
                          {r.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Khớp mã
                            </span>
                          ) : r.status === 'matched_by_name' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Khớp tên
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              Chưa khớp lớp
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Cập Nhật Bảng Điểm 9 Môn Thành Công!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Đã đồng bộ dữ liệu điểm 9 môn học của <strong>{matchedCount} học sinh</strong> vào đợt{' '}
                  <strong>"{effectivePeriod}"</strong>. Biểu đồ cột và thống kê thi đua học tập đã được làm mới tức thì.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Chọn Tệp Excel Ngay</span>
                </button>
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                type="button"
                id="btn-confirm-import-grades"
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Lưu & Thống Kê Biểu Đồ</span>
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Hoàn Tất & Xem Bảng Điểm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
