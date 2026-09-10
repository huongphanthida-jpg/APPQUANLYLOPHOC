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
import { ClassEmulationSummary2Aspects } from './ClassEmulationSummary2Aspects';

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

  // Subject definition for all subjects with grades
  const subjectsList = [
    { key: 'math', name: 'Toán Học', short: 'Toán', color: '#2563eb', icon: '📐' },
    { key: 'physics', name: 'Vật Lý', short: 'Lý', color: '#059669', icon: '⚡' },
    { key: 'chemistry', name: 'Hóa Học', short: 'Hóa', color: '#d97706', icon: '🧪' },
    { key: 'biology', name: 'Sinh Học', short: 'Sinh', color: '#10b981', icon: '🌿' },
    { key: 'literature', name: 'Ngữ Văn', short: 'Văn', color: '#8b5cf6', icon: '📖' },
    { key: 'english', name: 'Tiếng Anh', short: 'Anh', color: '#ec4899', icon: '🌐' },
  ] as const;

  // Compute Class Averages for All Subjects
  const calcClassSubjectAvg = (subjKey: typeof subjectsList[number]['key'], field: 'tx1' | 'tx2' | 'gk' | 'ck' | 'avg') => {
    if (!students.length) return 0;
    const total = students.reduce((acc, s) => acc + (s.grades[subjKey]?.[field] || 0), 0);
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

  // Quick download template handler
  const handleQuickDownloadExcelTemplate = () => {
    const templateData = students.map((s) => ({
      'Mã HS': s.code,
      'Họ và Tên': s.name,
      'Tổ': s.group,
      'Toán TX1': s.grades.math.tx1,
      'Toán TX2': s.grades.math.tx2,
      'Toán GK': s.grades.math.gk,
      'Toán CK': s.grades.math.ck,
      'Toán ĐTB': s.grades.math.avg,
      'Lý TX1': s.grades.physics.tx1,
      'Lý TX2': s.grades.physics.tx2,
      'Lý GK': s.grades.physics.gk,
      'Lý CK': s.grades.physics.ck,
      'Lý ĐTB': s.grades.physics.avg,
      'Hóa TX1': s.grades.chemistry.tx1,
      'Hóa TX2': s.grades.chemistry.tx2,
      'Hóa GK': s.grades.chemistry.gk,
      'Hóa CK': s.grades.chemistry.ck,
      'Hóa ĐTB': s.grades.chemistry.avg,
      'Sinh ĐTB': s.grades.biology.avg,
      'Văn ĐTB': s.grades.literature.avg,
      'Anh ĐTB': s.grades.english.avg,
      'ĐTB Khối A': s.grades.gpa,
      'Ghi Chú': 'Mẫu cập nhật điểm số lớp 12A1',
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 15 }, { wch: 22 }, { wch: 6 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 25 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem_Lop');
    XLSX.writeFile(wb, `Mau_Bang_Diem_Lop_12A1.xlsx`);
  };

  // 1. Data for "all_subjects" Bar Chart Mode (Shows all subjects on X-axis)
  const allSubjectsBarData = [
    ...subjectsList.map((subj) => {
      if (selectedStudentForChart === 'all') {
        const tx1 = calcClassSubjectAvg(subj.key, 'tx1');
        const tx2 = calcClassSubjectAvg(subj.key, 'tx2');
        const gk = calcClassSubjectAvg(subj.key, 'gk');
        const ck = calcClassSubjectAvg(subj.key, 'ck');
        const avg = calcClassSubjectAvg(subj.key, 'avg');
        const maxScore = Math.max(...students.map((s) => s.grades[subj.key]?.avg || 0));
        const minScore = Math.min(...students.map((s) => s.grades[subj.key]?.avg || 0));

        return {
          subject: `${subj.icon} ${subj.name}`,
          shortName: subj.short,
          'Thường Xuyên 1 (TX1)': tx1,
          'Thường Xuyên 2 (TX2)': tx2,
          'Giữa Kỳ (GK)': gk,
          'Cuối Kỳ (CK)': ck,
          'Điểm Trung Bình (ĐTB)': avg,
          'Điểm Cao Nhất': maxScore,
          'Điểm Thấp Nhất': minScore,
        };
      } else {
        const student = students.find((s) => s.id === selectedStudentForChart);
        const subjGrade = student?.grades[subj.key];
        const classAvg = calcClassSubjectAvg(subj.key, 'avg');

        return {
          subject: `${subj.icon} ${subj.name}`,
          shortName: subj.short,
          'Thường Xuyên 1 (TX1)': subjGrade?.tx1 || 0,
          'Thường Xuyên 2 (TX2)': subjGrade?.tx2 || 0,
          'Giữa Kỳ (GK)': subjGrade?.gk || 0,
          'Cuối Kỳ (CK)': subjGrade?.ck || 0,
          'Điểm Trung Bình (ĐTB)': subjGrade?.avg || 0,
          'Điểm TB Cả Lớp': classAvg,
        };
      }
    }),
    // Add Overall GPA Summary Bar
    (() => {
      if (selectedStudentForChart === 'all') {
        const totalGpa = students.reduce((acc, s) => acc + (s.grades.gpa || 0), 0);
        const avgGpa = Number((totalGpa / (students.length || 1)).toFixed(2));
        const maxGpa = Math.max(...students.map((s) => s.grades.gpa || 0));
        const minGpa = Math.min(...students.map((s) => s.grades.gpa || 0));
        return {
          subject: '🏆 ĐTB Chung / Khối',
          shortName: 'ĐTB Chung',
          'Thường Xuyên 1 (TX1)': avgGpa,
          'Thường Xuyên 2 (TX2)': avgGpa,
          'Giữa Kỳ (GK)': avgGpa,
          'Cuối Kỳ (CK)': avgGpa,
          'Điểm Trung Bình (ĐTB)': avgGpa,
          'Điểm Cao Nhất': maxGpa,
          'Điểm Thấp Nhất': minGpa,
        };
      } else {
        const student = students.find((s) => s.id === selectedStudentForChart);
        const totalGpa = students.reduce((acc, s) => acc + (s.grades.gpa || 0), 0);
        const avgGpa = Number((totalGpa / (students.length || 1)).toFixed(2));
        const stuGpa = student?.grades.gpa || 0;
        return {
          subject: '🏆 ĐTB Chung / Khối',
          shortName: 'ĐTB Chung',
          'Thường Xuyên 1 (TX1)': stuGpa,
          'Thường Xuyên 2 (TX2)': stuGpa,
          'Giữa Kỳ (GK)': stuGpa,
          'Cuối Kỳ (CK)': stuGpa,
          'Điểm Trung Bình (ĐTB)': stuGpa,
          'Điểm TB Cả Lớp': avgGpa,
        };
      }
    })(),
  ];

  // 2. Data for "group_emulation" Bar Chart Mode (Shows 4 Groups on X-axis with all subjects)
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

    return {
      groupName: `Tổ ${grpNum} (${grpStudents.length} HS)`,
      'Toán Học': calcGrpSubjAvg('math'),
      'Vật Lý': calcGrpSubjAvg('physics'),
      'Hóa Học': calcGrpSubjAvg('chemistry'),
      'Sinh Học': calcGrpSubjAvg('biology'),
      'Ngữ Văn': calcGrpSubjAvg('literature'),
      'Tiếng Anh': calcGrpSubjAvg('english'),
      'ĐTB Toàn Tổ': grpGpa,
    };
  });

  // 3. Data for "periods_progress" Bar Chart Mode (Shows Periods on X-axis with all subjects)
  const periodsProgressBarData = periods.map((period, index) => {
    if (selectedStudentForChart === 'all') {
      let mathTot = 0, physTot = 0, chemTot = 0, bioTot = 0, litTot = 0, engTot = 0, count = 0;
      students.forEach((s) => {
        const hist = s.progressHistory?.find((p) => p.period === period);
        if (hist) {
          mathTot += hist.math || 0;
          physTot += hist.physics || 0;
          chemTot += hist.chemistry || 0;
          bioTot += hist.biology !== undefined ? hist.biology : (s.grades.biology.avg - (periods.length - 1 - index) * 0.12);
          litTot += hist.literature !== undefined ? hist.literature : (s.grades.literature.avg - (periods.length - 1 - index) * 0.1);
          engTot += hist.english !== undefined ? hist.english : (s.grades.english.avg - (periods.length - 1 - index) * 0.15);
          count++;
        }
      });
      const validCount = count || 1;
      const mathAvg = Number((mathTot / validCount).toFixed(2));
      const physAvg = Number((physTot / validCount).toFixed(2));
      const chemAvg = Number((chemTot / validCount).toFixed(2));
      const bioAvg = Number((bioTot / validCount).toFixed(2));
      const litAvg = Number((litTot / validCount).toFixed(2));
      const engAvg = Number((engTot / validCount).toFixed(2));
      const gpaAvg = Number(((mathAvg + physAvg + chemAvg) / 3).toFixed(2));

      return {
        period,
        'Toán Học': mathAvg,
        'Vật Lý': physAvg,
        'Hóa Học': chemAvg,
        'Sinh Học': bioAvg,
        'Ngữ Văn': litAvg,
        'Tiếng Anh': engAvg,
        'ĐTB Khối': gpaAvg,
      };
    } else {
      const student = students.find((s) => s.id === selectedStudentForChart);
      const hist = student?.progressHistory?.find((p) => p.period === period);
      const mVal = hist?.math !== undefined ? hist.math : (student?.grades.math.avg || 0);
      const pVal = hist?.physics !== undefined ? hist.physics : (student?.grades.physics.avg || 0);
      const cVal = hist?.chemistry !== undefined ? hist.chemistry : (student?.grades.chemistry.avg || 0);
      const bVal = hist?.biology !== undefined ? hist.biology : Number(((student?.grades.biology.avg || 8.0) - (periods.length - 1 - index) * 0.12).toFixed(2));
      const lVal = hist?.literature !== undefined ? hist.literature : Number(((student?.grades.literature.avg || 7.8) - (periods.length - 1 - index) * 0.1).toFixed(2));
      const eVal = hist?.english !== undefined ? hist.english : Number(((student?.grades.english.avg || 8.5) - (periods.length - 1 - index) * 0.15).toFixed(2));
      const gVal = Number(((mVal + pVal + cVal) / 3).toFixed(2));

      return {
        period,
        'Toán Học': mVal,
        'Vật Lý': pVal,
        'Hóa Học': cVal,
        'Sinh Học': bVal,
        'Ngữ Văn': lVal,
        'Tiếng Anh': eVal,
        'ĐTB Khối': gVal,
      };
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
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {activeMainTab === 'two_aspects_emulation'
                  ? 'Bảng Điểm TBM & Thi Đua 2 Mặt'
                  : 'Bảng Điểm TBM & Học Tập Các Môn'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 shrink-0">
                {classInfo?.className || 'Lớp 11D5'} • {students.length} Học Sinh
              </span>
              <span className="hidden xl:inline-block text-xs text-slate-400 font-medium">
                • Niên khóa 2026 - 2027
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {activeMainTab === 'two_aspects_emulation'
                ? 'Đánh giá toàn diện 2 trụ cột: Chuyên cần (điểm danh, vắng) & Nề nếp kỷ luật (khen thưởng, nội quy)'
                : 'Biểu đồ trực quan và sổ điểm tất cả các môn học cập nhật từ tệp Excel (.xlsx, .csv)'}
            </p>
          </div>
        </div>

        {/* Right: Sleek Segmented Tab Switcher (1 Horizontal Row) & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              id="tab-btn-two-aspects-emulation"
              onClick={() => setActiveMainTab('two_aspects_emulation')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'two_aspects_emulation'
                  ? 'bg-gradient-to-r from-blue-700 to-[#003366] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeMainTab === 'two_aspects_emulation' ? 'text-amber-300' : 'text-blue-600'}`} />
              <span>Thi Đua 2 Mặt (Chuyên Cần & Nề Nếp)</span>
            </button>

            <button
              type="button"
              id="tab-btn-academic-grades"
              onClick={() => setActiveMainTab('academic_grades')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'academic_grades'
                  ? 'bg-gradient-to-r from-blue-700 to-[#003366] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeMainTab === 'academic_grades' ? 'text-amber-300' : 'text-blue-600'}`} />
              <span>Sổ Điểm Các Môn (Excel)</span>
            </button>
          </div>

          {activeMainTab === 'academic_grades' && (
            <div className="flex items-center gap-2">
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
          )}
        </div>
      </div>

      {/* View Mode 1: 2-Aspect Emulation Summary (Chuyên cần & Nề nếp) */}
      {activeMainTab === 'two_aspects_emulation' && (
        <ClassEmulationSummary2Aspects
          students={students}
          disciplineLogs={disciplineLogs}
          leaveRequests={leaveRequests}
          role={role}
          classInfo={classInfo}
          teacherInfo={teacherInfo}
          onOpenAddDiscipline={onOpenAddDiscipline}
          onSelectStudent={onSelectStudent}
        />
      )}

      {/* View Mode 2: Academic Grades & Progress */}
      {activeMainTab === 'academic_grades' && (
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

        {/* 1. Bar Chart Render for All Subjects (TX1, TX2, GK, CK, ĐTB) */}
        {chartViewMode === 'all_subjects' && (
          <div className="space-y-2">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allSubjectsBarData} margin={{ top: 20, right: 25, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="subject"
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} ticks={[0, 2, 4, 6, 8, 10]} />
                  <Tooltip
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

                  <Bar dataKey="Thường Xuyên 1 (TX1)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="Thường Xuyên 2 (TX2)" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="Giữa Kỳ (GK)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="Cuối Kỳ (CK)" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="Điểm Trung Bình (ĐTB)" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={26} />
                  {selectedStudentForChart !== 'all' && (
                    <Bar dataKey="Điểm TB Cả Lớp" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Note & Color Legend Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5">
              <span className="font-semibold text-slate-700">
                📊 Ghi chú: Thang điểm 10. Môn Toán, Lý, Hóa, Sinh, Văn, Anh đều được đánh giá đầy đủ các hệ số.
              </span>
              <span className="text-blue-800 font-bold">
                Cột màu xanh đậm thể hiện Điểm Trung Bình (ĐTB) tổng kết môn.
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

                  <Bar dataKey="Toán Học" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Vật Lý" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Hóa Học" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Sinh Học" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Ngữ Văn" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Tiếng Anh" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="ĐTB Toàn Tổ" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5">
              <span>🏆 Bảng xếp hạng thi đua học tập giữa các tổ trong lớp học kỳ 2</span>
              <span className="font-bold text-[#003366]">ĐTB Khối A & Khối Toàn Diện</span>
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

                  <Bar dataKey="Toán Học" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Vật Lý" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Hóa Học" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Sinh Học" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Ngữ Văn" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Tiếng Anh" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={18} />
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
        {/* Radar Chart: 6-Subject Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Biểu Đồ Radar Cân Bằng 6 Môn Học
            </h4>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              D3 & Recharts Visual
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                { subject: 'Toán', A: calcClassSubjectAvg('math', 'avg') },
                { subject: 'Vật Lý', A: calcClassSubjectAvg('physics', 'avg') },
                { subject: 'Hóa Học', A: calcClassSubjectAvg('chemistry', 'avg') },
                { subject: 'Sinh Học', A: calcClassSubjectAvg('biology', 'avg') },
                { subject: 'Ngữ Văn', A: calcClassSubjectAvg('literature', 'avg') },
                { subject: 'Tiếng Anh', A: calcClassSubjectAvg('english', 'avg') },
              ]}>
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
              <option value="all">Tất cả các môn (Toán, Lý, Hóa, Sinh, Văn, Anh)</option>
              <option value="math">Chỉ môn Toán Học</option>
              <option value="physics">Chỉ môn Vật Lý</option>
              <option value="chemistry">Chỉ môn Hóa Học</option>
              <option value="biology">Chỉ môn Sinh Học</option>
              <option value="literature">Chỉ môn Ngữ Văn</option>
              <option value="english">Chỉ môn Tiếng Anh</option>
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
                <th className="py-3 px-3 text-center text-blue-900">Toán (ĐTB)</th>
                <th className="py-3 px-3 text-center text-emerald-900">Lý (ĐTB)</th>
                <th className="py-3 px-3 text-center text-amber-900">Hóa (ĐTB)</th>
                <th className="py-3 px-3 text-center text-teal-900">Sinh (ĐTB)</th>
                <th className="py-3 px-3 text-center text-purple-900">Văn (ĐTB)</th>
                <th className="py-3 px-3 text-center text-pink-900">Anh (ĐTB)</th>
                <th className="py-3 px-4 text-center font-extrabold text-[#003366] bg-blue-50/70">ĐTB Chung</th>
                <th className="py-3 px-4">Xếp Loại Thi Đua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const isWeak = student.grades.gpa < 7.5;
                const isExcellent = student.grades.gpa >= 9.0;
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

                    {/* Toán */}
                    <td className="py-3 px-3 text-center font-semibold text-blue-800">
                      {editingCell?.studentId === student.id && editingCell?.subject === 'math' ? (
                        <input
                          type="number"
                          step="0.1"
                          autoFocus
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => handleSaveEdit(student.id, 'math', 'avg')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(student.id, 'math', 'avg');
                          }}
                          className="w-14 px-1 py-0.5 text-center bg-white border border-blue-400 rounded shadow-inner"
                        />
                      ) : (
                        <span
                          onDoubleClick={() =>
                            handleStartEdit(student.id, 'math', 'avg', student.grades.math.avg)
                          }
                          className={`cursor-pointer px-2 py-0.5 rounded transition-all ${
                            student.grades.math.avg >= 9.0
                              ? 'bg-blue-100 text-blue-900 font-bold'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          {student.grades.math.avg}
                        </span>
                      )}
                    </td>

                    {/* Lý */}
                    <td className="py-3 px-3 text-center font-semibold text-emerald-800">
                      {editingCell?.studentId === student.id && editingCell?.subject === 'physics' ? (
                        <input
                          type="number"
                          step="0.1"
                          autoFocus
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => handleSaveEdit(student.id, 'physics', 'avg')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(student.id, 'physics', 'avg');
                          }}
                          className="w-14 px-1 py-0.5 text-center bg-white border border-emerald-400 rounded shadow-inner"
                        />
                      ) : (
                        <span
                          onDoubleClick={() =>
                            handleStartEdit(student.id, 'physics', 'avg', student.grades.physics.avg)
                          }
                          className={`cursor-pointer px-2 py-0.5 rounded transition-all ${
                            student.grades.physics.avg >= 9.0
                              ? 'bg-emerald-100 text-emerald-900 font-bold'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          {student.grades.physics.avg}
                        </span>
                      )}
                    </td>

                    {/* Hóa */}
                    <td className="py-3 px-3 text-center font-semibold text-amber-800">
                      {editingCell?.studentId === student.id && editingCell?.subject === 'chemistry' ? (
                        <input
                          type="number"
                          step="0.1"
                          autoFocus
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => handleSaveEdit(student.id, 'chemistry', 'avg')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(student.id, 'chemistry', 'avg');
                          }}
                          className="w-14 px-1 py-0.5 text-center bg-white border border-amber-400 rounded shadow-inner"
                        />
                      ) : (
                        <span
                          onDoubleClick={() =>
                            handleStartEdit(student.id, 'chemistry', 'avg', student.grades.chemistry.avg)
                          }
                          className={`cursor-pointer px-2 py-0.5 rounded transition-all ${
                            student.grades.chemistry.avg >= 9.0
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          {student.grades.chemistry.avg}
                        </span>
                      )}
                    </td>

                    {/* Sinh */}
                    <td className="py-3 px-3 text-center text-teal-800 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          student.grades.biology.avg >= 9.0 ? 'bg-teal-100 text-teal-900 font-bold' : ''
                        }`}
                      >
                        {student.grades.biology.avg}
                      </span>
                    </td>

                    {/* Văn */}
                    <td className="py-3 px-3 text-center text-purple-800 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          student.grades.literature.avg >= 8.5 ? 'bg-purple-100 text-purple-900 font-bold' : ''
                        }`}
                      >
                        {student.grades.literature.avg}
                      </span>
                    </td>

                    {/* Anh */}
                    <td className="py-3 px-3 text-center text-pink-800 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          student.grades.english.avg >= 9.0 ? 'bg-pink-100 text-pink-900 font-bold' : ''
                        }`}
                      >
                        {student.grades.english.avg}
                      </span>
                    </td>

                    {/* GPA Chung */}
                    <td className="py-3 px-4 text-center bg-blue-50/40">
                      <span className="text-sm font-extrabold text-[#003366]">
                        {student.grades.gpa}
                      </span>
                    </td>

                    {/* Rating Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isExcellent
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isWeak
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {isExcellent ? 'Học sinh Xuất Sắc' : isWeak ? 'Cần Phụ Đạo' : 'Học sinh Khá Giỏi'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
