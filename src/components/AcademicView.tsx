import React, { useState } from 'react';
import {
  GraduationCap,
  BarChart3,
  Award,
  Filter,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  Users,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Layers,
  BookOpen,
  Download,
  UploadCloud,
  Calendar,
  History,
  Clock,
  Star,
  Edit2,
  Plus,
  RotateCcw,
  Check,
  Settings2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Student, UserRole, ClassInfo, TeacherInfo, DisciplineEntry, LeaveRequest } from '../types';
import { ImportGradesModal } from './ImportGradesModal';

interface AcademicViewProps {
  students: Student[];
  onUpdateStudentGrade: (studentId: string, subject: string, field: string, value: number) => void;
  onImportGrades?: (updatedStudents: Student[], periodName: string, updateCurrentGrades: boolean) => void;
  role: UserRole;
  onOpenAiAdvisor: () => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  disciplineLogs?: DisciplineEntry[];
  leaveRequests?: LeaveRequest[];
  onOpenAddDiscipline?: (studentId?: string) => void;
  onSelectStudent?: (student: Student) => void;
}

type MainAcademicTab = 'two_aspects_emulation' | 'academic_grades';
type ChartViewMode = 'all_subjects' | 'group_emulation' | 'periods_progress';

export const AcademicView: React.FC<AcademicViewProps> = ({
  students,
  onUpdateStudentGrade,
  onImportGrades,
  role,
  onOpenAiAdvisor,
  classInfo,
  teacherInfo,
  disciplineLogs = [],
  leaveRequests = [],
  onOpenAddDiscipline,
  onSelectStudent,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainAcademicTab>('two_aspects_emulation');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('all_subjects');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<'all' | 'math' | 'physics' | 'chemistry' | 'biology' | 'literature' | 'english'>('all');
  const [selectedStudentForChart, setSelectedStudentForChart] = useState<string>('all');
  const [editingCell, setEditingCell] = useState<{ studentId: string; subject: string; field: string } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPeriodFocus, setSelectedPeriodFocus] = useState<string>('all');

  // Custom Subject Columns Configuration State (Full 9 Môn: KHTN + KHXH)
  const DEFAULT_SUBJECT_COLS = [
    { key: 'math', short: 'Toán', fullName: 'Toán Học', textColor: 'text-blue-900' },
    { key: 'literature', short: 'Văn', fullName: 'Ngữ Văn', textColor: 'text-purple-900' },
    { key: 'gdcd', short: 'GDCD', fullName: 'GDCD / GDKT&PL', textColor: 'text-yellow-900' },
    { key: 'history', short: 'Sử', fullName: 'Lịch Sử', textColor: 'text-orange-900' },
    { key: 'geography', short: 'Địa', fullName: 'Địa Lý', textColor: 'text-indigo-900' },
    { key: 'english', short: 'Anh', fullName: 'Tiếng Anh', textColor: 'text-pink-900' },
    { key: 'physics', short: 'Lý', fullName: 'Vật Lý', textColor: 'text-emerald-900' },
    { key: 'chemistry', short: 'Hóa', fullName: 'Hóa Học', textColor: 'text-amber-900' },
    { key: 'biology', short: 'Sinh', fullName: 'Sinh Học', textColor: 'text-teal-900' },
  ];

  const PRESET_SUBJECT_OPTIONS = [
    { key: 'math', short: 'Toán', fullName: 'Toán Học', category: 'KHTN' },
    { key: 'physics', short: 'Lý', fullName: 'Vật Lý', category: 'KHTN' },
    { key: 'chemistry', short: 'Hóa', fullName: 'Hóa Học', category: 'KHTN' },
    { key: 'biology', short: 'Sinh', fullName: 'Sinh Học', category: 'KHTN' },
    { key: 'literature', short: 'Văn', fullName: 'Ngữ Văn', category: 'KHXH' },
    { key: 'history', short: 'Sử', fullName: 'Lịch Sử', category: 'KHXH' },
    { key: 'geography', short: 'Địa', fullName: 'Địa Lý', category: 'KHXH' },
    { key: 'gdcd', short: 'GDCD', fullName: 'GDCD & PL', category: 'KHXH' },
    { key: 'gdqpan', short: 'GDQPAN', fullName: 'Giáo Dục Quốc Phòng An Ninh', category: 'Ngoại Ngữ & Khác' },
    { key: 'english', short: 'Anh', fullName: 'Tiếng Anh', category: 'Ngoại Ngữ & Khác' },
    { key: 'informatics', short: 'Tin', fullName: 'Tin Học', category: 'Ngoại Ngữ & Khác' },
    { key: 'technology', short: 'Công Nghệ', fullName: 'Công Nghệ', category: 'Ngoại Ngữ & Khác' },
  ];

  const [activeSubjectCols, setActiveSubjectCols] = useState(() => {
    const saved = localStorage.getItem('tbm_active_subject_columns_9_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 9) {
          const keys = parsed.map((c: any) => c.key);
          const validKeys = ['math', 'literature', 'gdcd', 'history', 'geography', 'english', 'physics', 'chemistry', 'biology'];
          const uniqueKeys = new Set(keys);
          if (uniqueKeys.size === 9 && validKeys.every((k) => uniqueKeys.has(k))) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_SUBJECT_COLS;
  });

  React.useEffect(() => {
    localStorage.removeItem('tbm_active_subject_columns');
    localStorage.removeItem('tbm_active_subject_columns_9');
    localStorage.removeItem('tbm_active_subject_columns_9_v2');
    localStorage.removeItem('tbm_active_subject_columns_9_v3');
  }, []);

  // Calculate Emulation Rating based on Exact User Rules:
  // 1. Học sinh Xuất Sắc: >= 6 môn TBM >= 9.0 và KHÔNG có môn nào < 6.5
  // 2. Học sinh Giỏi: >= 6 môn TBM >= 8.0 và KHÔNG có môn nào < 6.5
  // 3. Cần Phụ Đạo: Có bất kỳ môn nào TBM < 5.0
  // 4. Để trống: Các trường hợp còn lại (Tất cả các môn >= 5.0 nhưng chưa đủ 6 môn >= 8.0)
  const getEmulationRating = (student: Student) => {
    const subjectKeys = activeSubjectCols && activeSubjectCols.length > 0
      ? activeSubjectCols.map((c) => c.key)
      : [
          'math',
          'literature',
          'gdcd',
          'history',
          'geography',
          'english',
          'physics',
          'chemistry',
          'biology',
        ];

    const scores: number[] = subjectKeys.map((key) => {
      const g = (student.grades as any)?.[key];
      if (g === undefined || g === null) return 8.0;
      const rawVal = typeof g === 'number' ? g : g?.avg ?? 8.0;
      return typeof rawVal === 'number' && !isNaN(rawVal) && rawVal <= 10 ? Number(rawVal.toFixed(1)) : 8.0;
    });

    // Rule 3: Nếu có môn < 5.0 -> Cần Phụ Đạo
    const hasLessThan5 = scores.some((s) => s < 5.0);
    if (hasLessThan5) {
      return {
        label: 'Cần Phụ Đạo',
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-2xs',
      };
    }

    // Condition: Không có môn nào < 6.5
    const hasLessThan6_5 = scores.some((s) => s < 6.5);

    // Rule 1: >= 6 môn >= 9.0 và không môn nào < 6.5 -> Học sinh Xuất Sắc
    const countGte9 = scores.filter((s) => s >= 9.0).length;
    if (countGte9 >= 6 && !hasLessThan6_5) {
      return {
        label: 'Học sinh Xuất Sắc',
        badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black shadow-2xs',
      };
    }

    // Rule 2: >= 6 môn >= 8.0 và không môn nào < 6.5 -> Học sinh Giỏi
    const countGte8 = scores.filter((s) => s >= 8.0).length;
    if (countGte8 >= 6 && !hasLessThan6_5) {
      return {
        label: 'Học sinh Giỏi',
        badgeClass: 'bg-blue-100 text-blue-900 border border-blue-300 font-black shadow-2xs',
      };
    }

    // Rule 4: Để trống đối với các trường hợp còn lại
    return {
      label: '',
      badgeClass: '',
    };
  };

  const [editingColIdx, setEditingColIdx] = useState<number | null>(null);
  const [editColKey, setEditColKey] = useState<string>('math');
  const [editColShort, setEditColShort] = useState<string>('Toán');
  const [editColFullName, setEditColFullName] = useState<string>('Toán Học');
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState<boolean>(false);

  const handleOpenEditSubjectCol = (idx: number) => {
    const col = activeSubjectCols[idx];
    setEditingColIdx(idx);
    setEditColKey(col.key);
    setEditColShort(col.short);
    setEditColFullName(col.fullName);
    setIsEditSubjectModalOpen(true);
  };

  const handleSaveSubjectCol = () => {
    if (editingColIdx === null) return;
    const updated = [...activeSubjectCols];
    updated[editingColIdx] = {
      ...updated[editingColIdx],
      key: editColKey,
      short: editColShort.trim() || 'Môn mới',
      fullName: editColFullName.trim() || 'Môn Học',
    };
    setActiveSubjectCols(updated);
    localStorage.setItem('tbm_active_subject_columns_9_v4', JSON.stringify(updated));
    setIsEditSubjectModalOpen(false);
  };

  const handlePresetSelect = (presetKey: string) => {
    const found = PRESET_SUBJECT_OPTIONS.find((p) => p.key === presetKey);
    if (found) {
      setEditColKey(found.key);
      setEditColShort(found.short);
      setEditColFullName(found.fullName);
    }
  };

  const handleResetDefaultSubjectCols = () => {
    setActiveSubjectCols(DEFAULT_SUBJECT_COLS);
    localStorage.removeItem('tbm_active_subject_columns_9_v4');
    localStorage.removeItem('tbm_active_subject_columns_9');
    localStorage.removeItem('tbm_active_subject_columns');
    setIsEditSubjectModalOpen(false);
  };

  const COLOR_PALETTE = ['#2563eb', '#059669', '#d97706', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#6366f1', '#14b8a6'];
  const ICON_MAP: Record<string, string> = {
    math: '📐',
    physics: '⚡',
    chemistry: '🧪',
    biology: '🌿',
    literature: '📖',
    history: '📜',
    geography: '🗺️',
    gdcd: '⚖️',
    gdqpan: '🪖',
    english: '🌐',
    informatics: '💻',
    technology: '⚙️',
  };

  // Subject definition for all subjects dynamically synchronized with activeSubjectCols
  const subjectsList = activeSubjectCols.map((col, idx) => ({
    key: col.key,
    name: col.fullName || col.short,
    short: col.short,
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    icon: ICON_MAP[col.key] || '📚',
  }));

  // Compute Class Averages for All Subjects dynamically
  const calcClassSubjectAvg = (subjKey: string, field: 'tx1' | 'tx2' | 'gk' | 'ck' | 'avg' = 'avg') => {
    if (!students || !students.length) return 0;
    const total = students.reduce((acc, s) => {
      const g = (s.grades as any)?.[subjKey];
      if (g === undefined || g === null) return acc + 8.0;
      let val = 8.0;
      if (typeof g === 'number') {
        val = g <= 10 && g >= 0 ? g : 8.0;
      } else if (typeof g === 'object' && g !== null) {
        const fieldVal = g[field] ?? g.avg ?? 8.0;
        if (typeof fieldVal === 'number' && !isNaN(fieldVal) && fieldVal <= 10 && fieldVal >= 0) {
          val = fieldVal;
        }
      }
      return acc + val;
    }, 0);
    return Number((total / students.length).toFixed(2));
  };

  // Dynamic collection of evaluation periods across all students
  const dynamicPeriods = Array.from(
    new Set(
      students.flatMap((s) => s.progressHistory?.map((p) => p.period) || [])
    )
  );
  const periods = dynamicPeriods.length > 0
    ? dynamicPeriods
    : ['Tháng 9', 'Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Thi Thử TN'];

  // Quick download template handler (TBM scores only for all 9 subjects)
  const handleQuickDownloadExcelTemplate = () => {
    const templateData = students.map((s) => {
      const row: Record<string, any> = {
        'Mã HS': s.code,
        'Họ và Tên': s.name,
        'Tổ': s.group,
      };

      activeSubjectCols.forEach((col) => {
        const rawObj = (s.grades as any)[col.key];
        let subjGrade = 8.0;
        if (rawObj !== undefined && rawObj !== null) {
          if (typeof rawObj === 'number') {
            subjGrade = rawObj <= 10 && rawObj >= 0 ? Number(rawObj.toFixed(1)) : 8.0;
          } else if (typeof rawObj === 'object' && rawObj !== null) {
            const val = rawObj.avg;
            if (typeof val === 'number' && !isNaN(val) && val <= 10 && val >= 0) {
              subjGrade = Number(val.toFixed(1));
            }
          }
        }
        row[`${col.short} (ĐTB)`] = subjGrade;
      });

      row['Ghi Chú'] = `Bảng điểm TBM 9 môn lớp ${classInfo?.className || '12A1'}`;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 15 }, { wch: 24 }, { wch: 6 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem_TBM');
    XLSX.writeFile(wb, `Mau_Bang_Diem_TBM_Lop_${(classInfo?.className || '12A1').replace(/\s+/g, '_')}.xlsx`);
  };

  // 1. Data for "all_subjects" Bar Chart Mode (Shows TBM scores only for all subjects)
  const allSubjectsBarData = subjectsList.map((subj) => {
    if (selectedStudentForChart === 'all') {
      const avg = calcClassSubjectAvg(subj.key, 'avg');
      return {
        subject: `${subj.icon} ${subj.name}`,
        shortName: subj.short,
        'Điểm Trung Bình (ĐTB)': avg,
        color: subj.color,
      };
    } else {
      const student = students.find((s) => s.id === selectedStudentForChart);
      const rawObj = (student?.grades as any)?.[subj.key];
      let stuAvg = 8.0;
      if (rawObj !== undefined && rawObj !== null) {
        if (typeof rawObj === 'number') {
          stuAvg = rawObj <= 10 && rawObj >= 0 ? Number(rawObj.toFixed(1)) : 8.0;
        } else if (typeof rawObj === 'object' && rawObj !== null) {
          const val = rawObj.avg;
          if (typeof val === 'number' && !isNaN(val) && val <= 10 && val >= 0) {
            stuAvg = Number(val.toFixed(1));
          }
        }
      }
      const classAvg = calcClassSubjectAvg(subj.key, 'avg');

      return {
        subject: `${subj.icon} ${subj.name}`,
        shortName: subj.short,
        'Điểm Trung Bình (ĐTB)': stuAvg,
        'Điểm TB Cả Lớp': classAvg,
        color: subj.color,
      };
    }
  });

  // 2. Data for "group_emulation" Bar Chart Mode (Shows 4 Groups on X-axis with active subjects)
  const groupEmulationBarData = [1, 2, 3, 4].map((grpNum) => {
    const grpStudents = students.filter((s) => {
      const gVal = typeof s.group === 'number' ? s.group : parseInt(String(s.group || 1).replace(/[^0-9]/g, ''), 10);
      return (isNaN(gVal) ? 1 : gVal) === grpNum;
    });
    const grpCount = grpStudents.length || 1;

    const calcGrpSubjAvg = (subjKey: typeof subjectsList[number]['key']) => {
      const sum = grpStudents.reduce((acc, s) => acc + (s.grades[subjKey]?.avg || 0), 0);
      return Number((sum / grpCount).toFixed(2));
    };

    const grpGpaSum = grpStudents.reduce((acc, s) => acc + (s.grades.gpa || 0), 0);
    const grpGpa = Number((grpGpaSum / grpCount).toFixed(2));

    const item: Record<string, number | string> = {
      groupName: `Tổ ${grpNum} (${grpStudents.length} HS)`,
    };
    subjectsList.forEach((subj) => {
      item[subj.name] = calcGrpSubjAvg(subj.key);
    });
    item['ĐTB Toàn Tổ'] = grpGpa;

    return item;
  });

  // 3. Data for "periods_progress" Bar Chart Mode (Shows Periods on X-axis with active subjects)
  const periodsProgressBarData = periods.map((period, index) => {
    if (selectedStudentForChart === 'all') {
      const item: Record<string, number | string> = { period };
      let sumSubjAvg = 0;

      subjectsList.forEach((subj) => {
        let tot = 0;
        let count = 0;
        students.forEach((s) => {
          const hist = s.progressHistory?.find((p) => p.period === period);
          const subjGrade = (s.grades as any)[subj.key]?.avg || 0;
          if (hist) {
            const histVal = (hist as any)[subj.key];
            tot += histVal !== undefined ? histVal : Math.max(0, subjGrade - (periods.length - 1 - index) * 0.1);
            count++;
          }
        });
        const validCount = count || 1;
        const avg = Number((tot / validCount).toFixed(2));
        item[subj.name] = avg;
        sumSubjAvg += avg;
      });

      item['ĐTB Khối'] = Number((sumSubjAvg / (subjectsList.length || 1)).toFixed(2));
      return item;
    } else {
      const student = students.find((s) => s.id === selectedStudentForChart);
      const item: Record<string, number | string> = { period };
      let sumSubjVal = 0;

      subjectsList.forEach((subj) => {
        const hist = student?.progressHistory?.find((p) => p.period === period);
        const subjGrade = (student?.grades as any)?.[subj.key]?.avg || 0;
        const histVal = hist ? (hist as any)[subj.key] : undefined;
        const val = histVal !== undefined ? histVal : Number(Math.max(0, subjGrade - (periods.length - 1 - index) * 0.1).toFixed(2));
        item[subj.name] = val;
        sumSubjVal += val;
      });

      item['ĐTB Khối'] = Number((sumSubjVal / (subjectsList.length || 1)).toFixed(2));
      return item;
    }
  });

  const handleStartEdit = (studentId: string, subject: string, field: string, currentVal: number) => {
    if (role !== 'gvcn' && role !== 'gvbm') return;
    setEditingCell({ studentId, subject, field });
    setCellValue(currentVal.toString());
  };

  const handleSaveEdit = (studentId: string, subject: string, field: string) => {
    const num = parseFloat(cellValue);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      onUpdateStudentGrade(studentId, subject, field, Number(num.toFixed(1)));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    }
    setEditingCell(null);
  };

  // Class Overview Stats
  const classAvgGpa = (students.reduce((acc, s) => acc + s.grades.gpa, 0) / (students.length || 1)).toFixed(2);
  const highestSubj = [...subjectsList].map((s) => ({
    name: s.name,
    avg: calcClassSubjectAvg(s.key, 'avg'),
  })).sort((a, b) => b.avg - a.avg)[0];

  const selectedStudentObj = students.find((s) => s.id === selectedStudentForChart);

  return (
    <div id="academic-view" className="space-y-6 pb-12">
      {/* 1. Unified Top Navigation & Header Bar (1 Horizontal Line) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Main Title & Class Badge on 1 Row */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-[#003366] text-white flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                Bảng Điểm TBM & Học Tập Các Môn
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 shrink-0">
                {classInfo?.className || 'Lớp 11D5'} • {students.length} Học Sinh
              </span>
              <span className="hidden xl:inline-block text-xs text-slate-400 font-medium">
                • Niên khóa 2026 - 2027
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Biểu đồ trực quan và sổ điểm tất cả các môn học cập nhật từ tệp Excel (.xlsx, .csv)
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
          <button
            id="btn-quick-download-excel-template"
            type="button"
            onClick={handleQuickDownloadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Tải tệp mẫu Excel điền sẵn danh sách học sinh"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Mẫu Excel</span>
          </button>

          <button
            id="btn-open-import-grades-modal"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>Tải Bảng Điểm</span>
          </button>

          <button
            id="btn-academic-ai-analysis"
            type="button"
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">AI Phân Tích</span>
          </button>
        </div>
      </div>

      {/* Academic Grades & Progress Content */}
      <div className="space-y-6">
          {/* Excel Import & Management Quick Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-[#003366] to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Bảng Điểm Học Tập Các Môn
                  </span>
                  <span className="text-xs text-blue-200">Sổ điểm điện tử {students.length} học sinh</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Quản Lý Điểm Số & Cập Nhật Nhanh Từ Tệp Excel (.xlsx / .csv)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tải lên tệp bảng điểm từ máy tính để tự động đồng bộ điểm thường xuyên (TX1, TX2), giữa kỳ (GK), cuối kỳ (CK) và điểm trung bình (ĐTB).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-banner-download-template"
                onClick={handleQuickDownloadExcelTemplate}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                title="Tải tệp mẫu Excel điền sẵn danh sách học sinh"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Tải Mẫu Excel</span>
              </button>

              <button
                type="button"
                id="btn-banner-upload-excel"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-4 h-4 text-slate-950" />
                <span>Tải Lên Bảng Điểm Excel</span>
              </button>
            </div>
          </div>
      {(() => {
        const highestSubj = subjectsList.reduce((prev, current) => {
          return calcClassSubjectAvg(current.key, 'avg') > calcClassSubjectAvg(prev.key, 'avg') ? current : prev;
        }, subjectsList[0] || { key: 'math', name: 'Toán Học', short: 'Toán', color: '#2563eb', icon: '📐' });

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {subjectsList.map((subj) => {
              const avgScore = calcClassSubjectAvg(subj.key, 'avg');
              const isTop = subj.name === highestSubj?.name;
              return (
                <div
                  key={subj.key}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{subj.icon}</span>
                    {isTop && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                        TOP 1
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{subj.name}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-[#003366]">{avgScore}</span>
                    <span className="text-[10px] text-slate-400">/ 10</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {avgScore >= 8.5 ? 'Xuất sắc' : avgScore >= 7.5 ? 'Khá giỏi' : 'Cần bồi dưỡng'}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* BGH Benchmark Card */}
      {role === 'bgh' && (
        <div className="bg-gradient-to-br from-amber-50 to-blue-50/60 rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Đối Sánh Chất Lượng {classInfo?.className || '12A1'} Với Chuẩn Toàn Khối THPT Trần Nguyên Hãn
                </h3>
                <p className="text-[11px] text-slate-600">
                  Dữ liệu kiểm định chất lượng định kỳ Học kỳ 2 (Khảo sát đợt 2/2026)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Vị trí 1/12 Lớp Toàn Khối
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Môn Toán</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-blue-700">{calcClassSubjectAvg('math', 'avg')}</span>
                <span className="text-[10px] text-emerald-600 font-bold">(+0.77 vs Khối)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Khối 12 TB: 8.15</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Môn Vật Lý</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-emerald-700">{calcClassSubjectAvg('physics', 'avg')}</span>
                <span className="text-[10px] text-emerald-600 font-bold">(+0.67 vs Khối)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Khối 12 TB: 7.98</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Môn Hóa Học</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-purple-700">{calcClassSubjectAvg('chemistry', 'avg')}</span>
                <span className="text-[10px] text-emerald-600 font-bold">(+0.68 vs Khối)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Khối 12 TB: 7.80</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Dự Báo Đậu ĐH Top 1</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-amber-700">95.2%</span>
                <span className="text-[10px] text-emerald-600 font-bold">Xuất sắc</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Mục tiêu: ĐHQG, Bách Khoa</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar Chart Container for All Subjects with Grades */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#003366]">
                  Biểu Đồ Cột (Bar Chart) Điểm Số Tất Cả Các Môn Học
                </h3>
                <p className="text-xs text-slate-500">
                  {chartViewMode === 'all_subjects'
                    ? selectedStudentForChart === 'all'
                      ? 'Tổng hợp điểm Thường xuyên (TX1, TX2), Giữa kỳ (GK), Cuối kỳ (CK) và Điểm Trung Bình (ĐTB) của toàn bộ các môn'
                      : `Chi tiết các cột điểm tất cả môn của học sinh: ${selectedStudentObj?.name} (${selectedStudentObj?.code})`
                    : chartViewMode === 'group_emulation'
                    ? 'So sánh tương quan điểm số giữa 4 Tổ thi đua trong lớp cho tất cả các môn'
                    : 'Theo dõi sự tiến bộ điểm số các môn qua các đợt thi & đánh giá'}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Student Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                id="btn-chart-mode-all-subjects"
                onClick={() => setChartViewMode('all_subjects')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartViewMode === 'all_subjects'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả Các Môn
              </button>
              <button
                type="button"
                id="btn-chart-mode-group-emulation"
                onClick={() => setChartViewMode('group_emulation')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartViewMode === 'group_emulation'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thi Đua 4 Tổ
              </button>
              <button
                type="button"
                id="btn-chart-mode-periods-progress"
                onClick={() => setChartViewMode('periods_progress')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartViewMode === 'periods_progress'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Theo Đợt Đánh Giá
              </button>
            </div>

            {/* Student Selector (Only for all_subjects and periods_progress) */}
            {chartViewMode !== 'group_emulation' && (
              <div className="flex items-center gap-1.5">
                <select
                  id="select-chart-student"
                  value={selectedStudentForChart}
                  onChange={(e) => setSelectedStudentForChart(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#003366] focus:outline-none cursor-pointer"
                >
                  <option value="all">Toàn bộ Lớp (Điểm TB)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - Tổ {s.group})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 1. Bar Chart Render for All Subjects (TBM Only) */}
        {chartViewMode === 'all_subjects' && (
          <div className="space-y-2">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allSubjectsBarData} margin={{ top: 20, right: 25, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} ticks={[0, 2, 4, 6, 8, 10]} />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} điểm`,
                      `${props?.payload?.subject || name}`,
                    ]}
                    contentStyle={{
                      backgroundColor: '#002855',
                      borderColor: '#001c3d',
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '10px 14px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }}
                    iconType="circle"
                  />
                  <ReferenceLine y={8.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Chuẩn Giỏi (8.0)', fill: '#059669', fontSize: 10 }} />
                  <ReferenceLine y={5.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Chuẩn Đạt (5.0)', fill: '#d97706', fontSize: 10 }} />

                  <Bar dataKey="Điểm Trung Bình (ĐTB)" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {allSubjectsBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#003366'} />
                    ))}
                  </Bar>
                  {selectedStudentForChart !== 'all' && (
                    <Bar dataKey="Điểm TB Cả Lớp" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Note & Color Legend Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5">
              <span className="font-semibold text-slate-700">
                📊 Biểu đồ so sánh Điểm Trung Bình Môn (TBM) được đồng bộ trực tiếp từ Sổ điểm chi tiết các môn.
              </span>
              <span className="text-blue-800 font-bold">
                Thang điểm từ 0.0 đến 10.0
              </span>
            </div>
          </div>
        )}

        {/* 2. Bar Chart Render for Group Emulation (4 Groups on X-axis) */}
        {chartViewMode === 'group_emulation' && (
          <div className="space-y-2">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupEmulationBarData} margin={{ top: 20, right: 25, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="groupName" stroke="#334155" fontSize={12} tickLine={false} />
                  <YAxis domain={[6, 10]} stroke="#64748b" fontSize={12} ticks={[6, 7, 8, 9, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#002855',
                      borderColor: '#001c3d',
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '10px 14px',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} iconType="circle" />

                  {subjectsList.map((subj) => (
                    <Bar key={subj.key} dataKey={subj.name} fill={subj.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                  ))}
                  <Bar dataKey="ĐTB Toàn Tổ" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5">
              <span>🏆 Bảng xếp hạng thi đua học tập giữa các tổ trong lớp học kỳ 2</span>
              <span className="font-bold text-[#003366]">ĐTB Các Môn & Khối Toàn Diện</span>
            </div>
          </div>
        )}

        {/* 3. Bar Chart Render for Periods Progress (Periods on X-axis) */}
        {chartViewMode === 'periods_progress' && (
          <div className="space-y-3">
            {/* Period Statistics Summary Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/60 p-3.5 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold shadow-2xs">
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#003366]">
                    Thống Kê Tiến Độ Điểm Số Qua {periods.length} Đợt Đánh Giá
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Dữ liệu được cập nhật tự động khi tải bảng điểm Excel theo từng đợt
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Các đợt:</span>
                {periods.map((p, pIdx) => (
                  <span
                    key={p}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      pIdx === periods.length - 1
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {p} {pIdx === periods.length - 1 && '⭐ (Mới nhất)'}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodsProgressBarData} margin={{ top: 20, right: 25, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="period" stroke="#334155" fontSize={12} tickLine={false} />
                  <YAxis domain={[6, 10]} stroke="#64748b" fontSize={12} ticks={[6, 7, 8, 9, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#002855',
                      borderColor: '#001c3d',
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '10px 14px',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} iconType="circle" />

                  {subjectsList.map((subj) => (
                    <Bar key={subj.key} dataKey={subj.name} fill={subj.color} radius={[4, 4, 0, 0]} maxBarSize={18} />
                  ))}
                  <Bar dataKey="ĐTB Khối" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5">
              <span>📈 Tiến độ điểm số qua {periods.length} đợt đánh giá trong năm học</span>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Tải lên điểm đợt mới từ Excel
              </button>
            </div>
          </div>
        )}

      {/* Radar Chart & University Entrance Score Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Radar Chart: Subject Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Biểu Đồ Radar Cân Bằng Các Môn Học ({subjectsList.length} Môn)
            </h4>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              D3 & Recharts Visual
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectsList.map((s) => ({
                subject: s.short,
                A: calcClassSubjectAvg(s.key, 'avg'),
              }))}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#334155" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#94a3b8" fontSize={10} />
                <Radar name="ĐTB Cả Lớp" dataKey="A" stroke="#003366" fill="#003366" fillOpacity={0.35} />
                <Tooltip contentStyle={{ backgroundColor: '#002855', color: '#ffffff', borderRadius: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center italic">
            Trực quan hóa hình nhện thể hiện độ bao phủ năng lực môn Tự nhiên & Xã hội
          </p>
        </div>

        {/* University Entrance Score Predictor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Dự Báo Điểm Thi & Nguyện Vọng Đại Học 2027
            </h4>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Khối Thi THPT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Khối A00 (Toán-Lý-Hóa)</span>
                <span className="text-blue-700">Top 1</span>
              </div>
              <p className="text-xl font-black text-blue-800 mt-1">
                {(calcClassSubjectAvg('math', 'avg') + calcClassSubjectAvg('physics', 'avg') + calcClassSubjectAvg('chemistry', 'avg')).toFixed(2)}
                <span className="text-xs text-slate-500 font-normal"> / 30đ</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">ĐH Bách Khoa, ĐHQG (≥ 26.5đ)</p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>Khối A01 (Toán-Lý-Anh)</span>
                <span className="text-indigo-700">Cao</span>
              </div>
              <p className="text-xl font-black text-indigo-800 mt-1">
                {(calcClassSubjectAvg('math', 'avg') + calcClassSubjectAvg('physics', 'avg') + calcClassSubjectAvg('english', 'avg')).toFixed(2)}
                <span className="text-xs text-slate-500 font-normal"> / 30đ</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">ĐH Ngoại Thương, ĐH KTXD (≥ 26.0đ)</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Khối B00 (Toán-Hóa-Sinh)</span>
                <span className="text-emerald-700">Tốt</span>
              </div>
              <p className="text-xl font-black text-emerald-800 mt-1">
                {(calcClassSubjectAvg('math', 'avg') + calcClassSubjectAvg('chemistry', 'avg') + calcClassSubjectAvg('biology', 'avg')).toFixed(2)}
                <span className="text-xs text-slate-500 font-normal"> / 30đ</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">ĐH Y Dược Hải Phòng, Y Hà Nội (≥ 27.0đ)</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span>Khối D01 (Toán-Văn-Anh)</span>
                <span className="text-purple-700">Ổn định</span>
              </div>
              <p className="text-xl font-black text-purple-800 mt-1">
                {(calcClassSubjectAvg('math', 'avg') + calcClassSubjectAvg('literature', 'avg') + calcClassSubjectAvg('english', 'avg')).toFixed(2)}
                <span className="text-xs text-slate-500 font-normal"> / 30đ</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">ĐH Hà Nội, Sư Phạm, Thương Mại (≥ 25.5đ)</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* 3. Risk Early Warning Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-5 text-white border border-rose-500/40 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">
                Hệ Thống Cảnh Báo Sớm Học Lực Sút Giảm (Risk Early Warning)
              </h4>
              <p className="text-xs text-rose-200">
                Tự động phân tích & phát hiện học sinh cần bổ sung phụ đạo hoặc kết nối cùng Phụ huynh
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-600 text-white px-3 py-1 rounded-full animate-bounce shrink-0">
            {students.filter((s) => s.grades.gpa < 7.5 || s.conductScore < 88).length} HS Cần Lưu Ý
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {students
            .filter((s) => s.grades.gpa < 7.5 || s.conductScore < 90)
            .slice(0, 3)
            .map((s) => (
              <div key={s.id} className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-300 font-extrabold">{s.name} ({s.code})</span>
                  <span className="text-rose-300 font-black bg-rose-950/60 px-2 py-0.5 rounded">ĐTB: {s.grades.gpa}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Tổ {s.group} • Thi đua: {s.conductScore}/100 • Yếu tố: {s.grades.gpa < 7.0 ? 'Điểm Tự Nhiên cần cải thiện' : 'Nề nếp nề nếp'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenAiAdvisor}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40 text-[11px] transition-colors text-center cursor-pointer"
                  >
                    🤖 AI Lộ Trình 30 Ngày
                  </button>
                  {onSelectStudent && (
                    <button
                      type="button"
                      onClick={() => onSelectStudent(s)}
                      className="py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 text-[11px] transition-colors cursor-pointer"
                    >
                      Hồ Sơ
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#003366]" />
              Sổ Điểm Điện Tử Chi Tiết Tất Cả Các Môn
            </h3>
            <p className="text-xs text-slate-500">
              {role === 'gvcn' || role === 'gvbm'
                ? 'GVCN & GV Bộ Môn có thể nhấp đúp vào ô điểm môn bất kỳ để chỉnh sửa trực tiếp hoặc tải file Excel lên'
                : 'Chế độ xem bảng điểm tổng hợp tất cả các môn học có điểm (Chỉ đọc)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(role === 'gvcn' || role === 'gvbm') && (
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-700" />
                <span>Import Excel</span>
              </button>
            )}

            <span className="text-xs font-semibold text-slate-500">Lọc môn:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value as any)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#003366] focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các môn ({subjectsList.map((s) => s.short).join(', ')})</option>
              {subjectsList.map((subj) => (
                <option key={subj.key} value={subj.key}>
                  Chỉ môn {subj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-3 text-center">Tổ</th>
                {(() => {
                  const displayedCols = selectedSubjectFilter === 'all'
                    ? activeSubjectCols
                    : activeSubjectCols.filter((c) => c.key === selectedSubjectFilter);
                  return displayedCols.map((col, idx) => (
                    <th key={col.key || idx} className="py-3 px-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1 group/subj">
                        <span className="font-bold text-slate-800">{col.short} (ĐTB)</span>
                        {(role === 'gvcn' || role === 'gvbm') && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditSubjectCol(activeSubjectCols.findIndex((c) => c.key === col.key))}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-all cursor-pointer opacity-70 group-hover/subj:opacity-100"
                            title={`Nhấp để sửa/điều chỉnh môn ${col.short}`}
                          >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                          </button>
                        )}
                      </div>
                    </th>
                  ));
                })()}
                <th className="py-3 px-4">Xếp Loại Thi Đua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const rating = getEmulationRating(student);
                const isWeak = rating.label === 'Cần Phụ Đạo';
                const isExcellent = rating.label === 'Học sinh Xuất Sắc';
                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isWeak ? 'bg-amber-50/30' : isExcellent ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{student.code}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-400">{student.careerAspiration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        Tổ {student.group}
                      </span>
                    </td>

                    {/* Dynamic Subject Grade Cells Filtered by Selection */}
                    {(() => {
                      const displayedCols = selectedSubjectFilter === 'all'
                        ? activeSubjectCols
                        : activeSubjectCols.filter((c) => c.key === selectedSubjectFilter);
                      return displayedCols.map((col, idx) => {
                        const rawObj = (student.grades as any)[col.key];
                        let subjGrade = 8.0;
                        if (rawObj !== undefined && rawObj !== null) {
                          if (typeof rawObj === 'number') {
                            subjGrade = rawObj <= 10 && rawObj >= 0 ? Number(rawObj.toFixed(1)) : 8.0;
                          } else if (typeof rawObj === 'object' && rawObj !== null) {
                            const avgVal = rawObj.avg;
                            if (typeof avgVal === 'number' && !isNaN(avgVal) && avgVal <= 10 && avgVal >= 0) {
                              subjGrade = Number(avgVal.toFixed(1));
                            }
                          }
                        }
                        const isEditingThis = editingCell?.studentId === student.id && editingCell?.subject === col.key;

                        return (
                          <td key={col.key || idx} className="py-3 px-3 text-center font-semibold text-slate-800">
                            {isEditingThis ? (
                              <input
                                type="number"
                                step="0.1"
                                autoFocus
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onBlur={() => handleSaveEdit(student.id, col.key, 'avg')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(student.id, col.key, 'avg');
                                }}
                                className="w-14 px-1 py-0.5 text-center bg-white border border-blue-400 rounded shadow-inner"
                              />
                            ) : (
                              <span
                                onDoubleClick={() => handleStartEdit(student.id, col.key, 'avg', subjGrade)}
                                className={`cursor-pointer px-2 py-0.5 rounded transition-all ${
                                  subjGrade >= 9.0 ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100'
                                }`}
                                title="Nhấp đúp để chỉnh sửa điểm môn này"
                              >
                                {subjGrade}
                              </span>
                            )}
                          </td>
                        );
                      });
                    })()}

                    {/* Rating Badge */}
                    <td className="py-3 px-4">
                      {(() => {
                        const rating = getEmulationRating(student);
                        if (!rating.label) return null;
                        return (
                          <span className={`text-[10px] px-2.5 py-1 rounded-full ${rating.badgeClass}`}>
                            {rating.label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Edit Subject Column Modal */}
      {isEditSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Điều Chỉnh Môn Học Cột {editingColIdx !== null ? editingColIdx + 1 : ''}
                  </h3>
                  <p className="text-xs text-slate-500">Đổi môn học hiển thị cho cột bảng điểm TBM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSubjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Preset Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn môn học từ danh mục có sẵn:
                </label>
                <select
                  value={editColKey}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <optgroup label="Khối Tự Nhiên (KHTN)">
                    <option value="math">📐 Toán Học (Toán)</option>
                    <option value="physics">⚡ Vật Lý (Lý)</option>
                    <option value="chemistry">🧪 Hóa Học (Hóa)</option>
                    <option value="biology">🌿 Sinh Học (Sinh)</option>
                  </optgroup>
                  <optgroup label="Khối Xã Hội (KHXH)">
                    <option value="literature">📖 Ngữ Văn (Văn)</option>
                    <option value="history">📜 Lịch Sử (Sử)</option>
                    <option value="geography">🗺️ Địa Lý (Địa)</option>
                    <option value="gdcd">⚖️ GDCD / GDKT&PL (GDCD)</option>
                  </optgroup>
                  <optgroup label="Ngoại Ngữ & Môn Khác">
                    <option value="english">🌐 Tiếng Anh (Anh)</option>
                    <option value="gdqpan">🪖 GDQPAN (Giáo Dục Quốc Phòng An Ninh)</option>
                    <option value="informatics">💻 Tin Học (Tin)</option>
                    <option value="technology">⚙️ Công Nghệ (Công nghệ)</option>
                  </optgroup>
                </select>
              </div>

              {/* Custom Display Labels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên môn viết tắt (hiển thị tiêu đề):
                  </label>
                  <input
                    type="text"
                    value={editColShort}
                    onChange={(e) => setEditColShort(e.target.value)}
                    placeholder="VD: Toán, Sử, Địa..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên môn đầy đủ:
                  </label>
                  <input
                    type="text"
                    value={editColFullName}
                    onChange={(e) => setEditColFullName(e.target.value)}
                    placeholder="VD: Toán Học, Lịch Sử..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={handleResetDefaultSubjectCols}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubjectCol}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Grades from Excel Modal */}
      {isImportModalOpen && (
        <ImportGradesModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          students={students}
          classInfo={classInfo}
          existingPeriods={periods}
          onImportGrades={(updatedStudentsList, periodName, updateCurrentGrades) => {
            if (onImportGrades) {
              onImportGrades(updatedStudentsList, periodName, updateCurrentGrades);
            }
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 3000);
          }}
        />
      )}
    </div>
  );
};
