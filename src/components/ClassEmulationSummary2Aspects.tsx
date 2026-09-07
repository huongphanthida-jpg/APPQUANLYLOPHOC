import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  Award,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  Plus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  ChevronRight,
  UserCheck,
  Star,
  Flame,
  ArrowUpDown,
  FileText,
  BadgeAlert,
  SlidersHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, UserRole, DisciplineEntry, LeaveRequest, ClassInfo, TeacherInfo } from '../types';

interface ClassEmulationSummary2AspectsProps {
  students: Student[];
  disciplineLogs?: DisciplineEntry[];
  leaveRequests?: LeaveRequest[];
  role?: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onOpenAddDiscipline?: (studentId?: string) => void;
  onSelectStudent?: (student: Student) => void;
}

// 10 Months of Vietnamese School Year (Tháng 9 -> Tháng 6)
export const ACADEMIC_MONTHS = [
  { key: 'all', label: 'Cả Năm Học (10 Tháng)', semester: 'all' },
  { key: 'm9', label: 'Tháng 9', monthNum: 9, semester: 'hk1' },
  { key: 'm10', label: 'Tháng 10', monthNum: 10, semester: 'hk1' },
  { key: 'm11', label: 'Tháng 11', monthNum: 11, semester: 'hk1' },
  { key: 'm12', label: 'Tháng 12', monthNum: 12, semester: 'hk1' },
  { key: 'm1', label: 'Tháng 1', monthNum: 1, semester: 'hk1' },
  { key: 'm2', label: 'Tháng 2', monthNum: 2, semester: 'hk2' },
  { key: 'm3', label: 'Tháng 3', monthNum: 3, semester: 'hk2' },
  { key: 'm4', label: 'Tháng 4', monthNum: 4, semester: 'hk2' },
  { key: 'm5', label: 'Tháng 5', monthNum: 5, semester: 'hk2' },
  { key: 'm6', label: 'Tháng 6', monthNum: 6, semester: 'hk2' },
] as const;

export const ClassEmulationSummary2Aspects: React.FC<ClassEmulationSummary2AspectsProps> = ({
  students = [],
  disciplineLogs = [],
  leaveRequests = [],
  role,
  classInfo,
  teacherInfo,
  onOpenAddDiscipline,
  onSelectStudent,
}) => {
  // Time mode: 'all' | 'by_week' | 'by_month'
  const [timePeriodMode, setTimePeriodMode] = useState<'all' | 'by_week' | 'by_month'>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(1); // Tuần 1 -> Tuần 35
  const [selectedMonth, setSelectedMonth] = useState<string>('m9'); // m9, m10, m11, m12, m1, m2, m3, m4, m5, m6
  const [selectedSemester, setSelectedSemester] = useState<'all' | 'hk1' | 'hk2'>('all');

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<'all' | 'excellent' | 'good' | 'fair' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'overall_desc' | 'overall_asc' | 'attendance_desc' | 'conduct_desc' | 'name_asc' | 'code_asc'>('overall_desc');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Helper to determine which week a date/item belongs to
  const getWeekFromDate = (dateStr?: string): number => {
    if (!dateStr) return 1;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 1;
    // Map school year 2026-2027 starting late August
    const startOfYear = new Date('2026-08-24');
    const diffMs = date.getTime() - startOfYear.getTime();
    if (diffMs < 0) return 1;
    const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, Math.min(35, week));
  };

  // Helper to determine which school month a date belongs to (9, 10, 11, 12, 1, 2, 3, 4, 5, 6)
  const getMonthKeyFromDate = (dateStr?: string): string => {
    if (!dateStr) return 'm9';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'm9';
    const m = date.getMonth() + 1;
    return `m${m}`;
  };

  // Calculate detailed 2-aspect emulation data for each student based on active time filter (Tuần / Tháng / Cả Năm)
  const studentEmulationData = useMemo(() => {
    return students.map((student) => {
      // 1. Chuyên cần (Attendance) theo thời gian
      const studentLeaves = leaveRequests.filter((l) => {
        if (l.studentId !== student.id || l.status !== 'approved') return false;
        if (timePeriodMode === 'by_week') {
          const lWeek = getWeekFromDate(l.startDate || l.createdAt);
          return lWeek === selectedWeek;
        }
        if (timePeriodMode === 'by_month') {
          const lMonth = getMonthKeyFromDate(l.startDate || l.createdAt);
          return lMonth === selectedMonth;
        }
        if (selectedSemester === 'hk1') {
          const m = getMonthKeyFromDate(l.startDate || l.createdAt);
          return ['m9', 'm10', 'm11', 'm12', 'm1'].includes(m);
        }
        if (selectedSemester === 'hk2') {
          const m = getMonthKeyFromDate(l.startDate || l.createdAt);
          return ['m2', 'm3', 'm4', 'm5', 'm6'].includes(m);
        }
        return true;
      });

      // Lấy số buổi vắng có phép
      let excusedAbsences = studentLeaves.length;
      if (timePeriodMode === 'all' && excusedAbsences === 0 && student.absenceCount) {
        excusedAbsences = student.absenceCount;
      }
      
      // Vi phạm chuyên cần từ disciplineLogs (loại Chuyên cần) lọc theo thời gian
      const attendanceViolations = disciplineLogs.filter((d) => {
        if (d.studentId !== student.id || d.category !== 'Chuyên cần' || d.type !== 'penalty') return false;
        if (timePeriodMode === 'by_week') {
          return (d.week || getWeekFromDate(d.timestamp)) === selectedWeek;
        }
        if (timePeriodMode === 'by_month') {
          return getMonthKeyFromDate(d.timestamp) === selectedMonth;
        }
        return true;
      });

      const unexcusedAbsences = attendanceViolations.filter((v) =>
        v.reason.toLowerCase().includes('không phép') || v.reason.toLowerCase().includes('trốn')
      ).length;
      const lateArrivals = attendanceViolations.filter((v) =>
        v.reason.toLowerCase().includes('muộn') || v.reason.toLowerCase().includes('trễ')
      ).length;

      // Điểm chuyên cần (Thang 100: Trừ 2đ/nghỉ có phép, 5đ/nghỉ không phép, 2đ/đi muộn)
      const rawAttendanceScore = 100 - (excusedAbsences * 2 + unexcusedAbsences * 5 + lateArrivals * 2);
      const attendanceScore = Math.max(0, Math.min(100, rawAttendanceScore));
      const attendanceRate = Number(((attendanceScore / 100) * 100).toFixed(1));

      let attendanceRating: 'Xuất Sắc' | 'Tốt' | 'Khá' | 'Cần Lưu Ý' = 'Xuất Sắc';
      if (attendanceScore < 75 || unexcusedAbsences > 1) attendanceRating = 'Cần Lưu Ý';
      else if (attendanceScore < 90 || excusedAbsences > 2 || lateArrivals > 2) attendanceRating = 'Khá';
      else if (attendanceScore < 98 || excusedAbsences > 0 || lateArrivals > 0) attendanceRating = 'Tốt';

      // 2. Nề nếp & Kỷ luật (Conduct & Discipline) theo thời gian
      const studentDiscLogs = disciplineLogs.filter((d) => {
        if (d.studentId !== student.id) return false;
        if (timePeriodMode === 'by_week') {
          return (d.week || getWeekFromDate(d.timestamp)) === selectedWeek;
        }
        if (timePeriodMode === 'by_month') {
          return getMonthKeyFromDate(d.timestamp) === selectedMonth;
        }
        return true;
      });

      const bonusLogs = studentDiscLogs.filter((d) => d.type === 'bonus');
      const penaltyLogs = studentDiscLogs.filter((d) => d.type === 'penalty' && d.category !== 'Chuyên cần');
      
      const totalBonusPoints = bonusLogs.reduce((sum, l) => sum + Math.abs(l.points), 0);
      const totalPenaltyPoints = penaltyLogs.reduce((sum, l) => sum + Math.abs(l.points), 0);

      // Điểm nề nếp thực tế tính theo mốc thời gian
      let conductScore = 100;
      if (timePeriodMode === 'all') {
        conductScore = student.conductScore ?? (100 + totalBonusPoints - totalPenaltyPoints);
      } else {
        // Điểm nề nếp kỳ/tuần/tháng: 100 gốc + thưởng - phạt
        conductScore = Math.max(50, Math.min(100, 100 + totalBonusPoints - totalPenaltyPoints));
      }
      
      const conductRating = conductScore >= 90 ? 'Tốt' : conductScore >= 80 ? 'Khá' : conductScore >= 65 ? 'Trung bình' : 'Yếu';

      // 3. Tổng hợp 2 mặt thi đua (Trọng số 40% Chuyên cần, 60% Nề nếp)
      const overallEmulationScore = Number(((attendanceScore * 0.4) + (conductScore * 0.6)).toFixed(1));
      
      let emulationTitle = 'Tiêu Biểu Xuất Sắc';
      let emulationBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      if (overallEmulationScore >= 95 && attendanceRating === 'Xuất Sắc' && conductScore >= 95) {
        emulationTitle = 'Gương Mẫu Tiêu Biểu';
        emulationBadgeColor = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-xs';
      } else if (overallEmulationScore >= 90) {
        emulationTitle = 'Tiên Tiến Toàn Diện';
        emulationBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (overallEmulationScore >= 80) {
        emulationTitle = 'Đạt Chuẩn Nề Nếp';
        emulationBadgeColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      } else {
        emulationTitle = 'Cần Chấn Chỉnh';
        emulationBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      }

      return {
        student,
        // Chuyên cần
        excusedAbsences,
        unexcusedAbsences,
        lateArrivals,
        attendanceScore,
        attendanceRate,
        attendanceRating,
        // Nề nếp
        conductScore,
        conductRating,
        bonusCount: bonusLogs.length + (timePeriodMode === 'all' ? (student.commendationsCount || 0) : 0),
        penaltyCount: penaltyLogs.length + (timePeriodMode === 'all' ? (student.violationsCount || 0) : 0),
        totalBonusPoints,
        totalPenaltyPoints,
        bonusLogs,
        penaltyLogs,
        // Tổng hợp
        overallEmulationScore,
        emulationTitle,
        emulationBadgeColor,
      };
    });
  }, [students, disciplineLogs, leaveRequests, timePeriodMode, selectedWeek, selectedMonth, selectedSemester]);

  // Filtered & Sorted student emulation list
  const filteredStudents = useMemo(() => {
    let result = studentEmulationData.filter((item) => {
      // Group filter
      if (selectedGroupFilter !== 'all' && item.student.group.toString() !== selectedGroupFilter) {
        return false;
      }
      // Rating filter
      if (selectedRatingFilter === 'excellent' && !item.emulationTitle.includes('Tiêu Biểu') && !item.emulationTitle.includes('Gương Mẫu')) {
        return false;
      }
      if (selectedRatingFilter === 'good' && item.emulationTitle !== 'Tiên Tiến Toàn Diện') {
        return false;
      }
      if (selectedRatingFilter === 'fair' && item.emulationTitle !== 'Đạt Chuẩn Nề Nếp') {
        return false;
      }
      if (selectedRatingFilter === 'warning' && item.emulationTitle !== 'Cần Chấn Chỉnh') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.student.name.toLowerCase().includes(q);
        const matchCode = item.student.code.toLowerCase().includes(q);
        return matchName || matchCode;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'overall_desc') return b.overallEmulationScore - a.overallEmulationScore;
      if (sortBy === 'overall_asc') return a.overallEmulationScore - b.overallEmulationScore;
      if (sortBy === 'attendance_desc') return b.attendanceScore - a.attendanceScore;
      if (sortBy === 'conduct_desc') return b.conductScore - a.conductScore;
      if (sortBy === 'name_asc') return a.student.name.localeCompare(b.student.name, 'vi');
      if (sortBy === 'code_asc') return a.student.code.localeCompare(b.student.code);
      return 0;
    });

    return result;
  }, [studentEmulationData, selectedGroupFilter, selectedRatingFilter, searchQuery, sortBy]);

  // High-level Class Metrics
  const classMetrics = useMemo(() => {
    const total = studentEmulationData.length || 1;
    const avgAttendanceScore = Number((studentEmulationData.reduce((acc, s) => acc + s.attendanceScore, 0) / total).toFixed(1));
    const avgConductScore = Number((studentEmulationData.reduce((acc, s) => acc + s.conductScore, 0) / total).toFixed(1));
    const avgOverallScore = Number((studentEmulationData.reduce((acc, s) => acc + s.overallEmulationScore, 0) / total).toFixed(1));

    const excellentCount = studentEmulationData.filter((s) => s.emulationTitle.includes('Tiêu Biểu') || s.emulationTitle.includes('Gương Mẫu')).length;
    const goodCount = studentEmulationData.filter((s) => s.emulationTitle === 'Tiên Tiến Toàn Diện').length;
    const warningCount = studentEmulationData.filter((s) => s.emulationTitle === 'Cần Chấn Chỉnh' || s.conductScore < 80 || s.attendanceScore < 85).length;
    const totalAbsences = studentEmulationData.reduce((acc, s) => acc + s.excusedAbsences + s.unexcusedAbsences, 0);

    return {
      avgAttendanceScore,
      avgConductScore,
      avgOverallScore,
      excellentCount,
      goodCount,
      warningCount,
      totalAbsences,
      excellentRate: Number(((excellentCount / total) * 100).toFixed(1)),
      goodOrHigherRate: Number((((excellentCount + goodCount) / total) * 100).toFixed(1)),
    };
  }, [studentEmulationData]);

  // Group Statistics for Matrix & Chart
  const groupStats = useMemo(() => {
    return [1, 2, 3, 4].map((g) => {
      const gStudents = studentEmulationData.filter((s) => s.student.group === g);
      const count = gStudents.length || 1;
      const avgAttendance = Number((gStudents.reduce((acc, s) => acc + s.attendanceScore, 0) / count).toFixed(1));
      const avgConduct = Number((gStudents.reduce((acc, s) => acc + s.conductScore, 0) / count).toFixed(1));
      const avgOverall = Number((gStudents.reduce((acc, s) => acc + s.overallEmulationScore, 0) / count).toFixed(1));
      const totalBonuses = gStudents.reduce((acc, s) => acc + s.bonusCount, 0);
      const totalPenalties = gStudents.reduce((acc, s) => acc + s.penaltyCount, 0);
      const totalAbsences = gStudents.reduce((acc, s) => acc + s.excusedAbsences + s.unexcusedAbsences, 0);

      return {
        group: g,
        groupName: `Tổ ${g}`,
        memberCount: gStudents.length,
        avgAttendance,
        avgConduct,
        avgOverall,
        totalBonuses,
        totalPenalties,
        totalAbsences,
      };
    });
  }, [studentEmulationData]);

  // Pie Chart Data for Rating Distribution
  const pieDistributionData = useMemo(() => {
    const counts = {
      'Gương Mẫu / Xuất Sắc': studentEmulationData.filter((s) => s.emulationTitle.includes('Tiêu Biểu') || s.emulationTitle.includes('Gương Mẫu')).length,
      'Tiên Tiến Toàn Diện': studentEmulationData.filter((s) => s.emulationTitle === 'Tiên Tiến Toàn Diện').length,
      'Đạt Chuẩn Nề Nếp': studentEmulationData.filter((s) => s.emulationTitle === 'Đạt Chuẩn Nề Nếp').length,
      'Cần Chấn Chỉnh': studentEmulationData.filter((s) => s.emulationTitle === 'Cần Chấn Chỉnh').length,
    };

    return [
      { name: 'Gương Mẫu / Xuất Sắc', value: counts['Gương Mẫu / Xuất Sắc'], color: '#f59e0b' },
      { name: 'Tiên Tiến Toàn Diện', value: counts['Tiên Tiến Toàn Diện'], color: '#10b981' },
      { name: 'Đạt Chuẩn Nề Nếp', value: counts['Đạt Chuẩn Nề Nếp'], color: '#3b82f6' },
      { name: 'Cần Chấn Chỉnh', value: counts['Cần Chấn Chỉnh'], color: '#ef4444' },
    ];
  }, [studentEmulationData]);

  // Export to Excel handler
  const handleExportExcel = () => {
    const exportRows = filteredStudents.map((item, idx) => ({
      'STT': idx + 1,
      'Mã Học Sinh': item.student.code,
      'Họ và Tên': item.student.name,
      'Tổ': `Tổ ${item.student.group}`,
      'Nghỉ Có Phép (buổi)': item.excusedAbsences,
      'Nghỉ Không Phép (buổi)': item.unexcusedAbsences,
      'Đi Muộn (lần)': item.lateArrivals,
      'Điểm Chuyên Cần (/100)': item.attendanceScore,
      'Xếp Loại Chuyên Cần': item.attendanceRating,
      'Số Lượt Khen Thưởng': item.bonusCount,
      'Số Lượt Vi Phạm': item.penaltyCount,
      'Điểm Rèn Luyện Nề Nếp (/100)': item.conductScore,
      'Xếp Loại Nề Nếp': item.conductRating,
      'Điểm Thi Đua Tổng Hợp (/100)': item.overallEmulationScore,
      'Danh Hiệu Thi Đua': item.emulationTitle,
      'Ghi Chú': item.student.healthNote || item.student.careerAspiration || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 15 }, // Ma HS
      { wch: 22 }, // Ho ten
      { wch: 8 },  // To
      { wch: 18 }, // Nghi co phep
      { wch: 20 }, // Nghi khong phep
      { wch: 14 }, // Di muon
      { wch: 22 }, // Diem chuyen can
      { wch: 20 }, // Xep loai chuyen can
      { wch: 18 }, // Luot khen
      { wch: 16 }, // Luot phat
      { wch: 25 }, // Diem ren luyen
      { wch: 18 }, // Xep loai ne nep
      { wch: 25 }, // Diem tong hop
      { wch: 24 }, // Danh hieu
      { wch: 30 }, // Ghi chu
    ];

    const periodLabel = timePeriodMode === 'all'
      ? 'Ca_Nam_10_Thang'
      : timePeriodMode === 'by_month'
      ? `Thang_${selectedMonth}`
      : `Tuan_${selectedWeek}`;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thi_Dua_2_Mat');
    const fileName = `Bang_Tong_Hop_Thi_Dua_2_Mat_${classInfo?.className?.replace(/\s+/g, '_') || '12A1'}_${periodLabel}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-[#003366] to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Title & Badges on 1 Row */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight truncate">
                  Bảng Tổng Hợp Điểm Thi Đua 2 Mặt (Chuyên Cần & Nề Nếp)
                </h2>
                <span className="text-xs bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black shrink-0 shadow-2xs">
                  {classInfo?.className || 'Lớp 11D5'} • {students.length} Học Sinh
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-blue-100 border border-white/20 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-300 mr-1 inline" />
                  Đánh Giá Toàn Diện
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                Theo dõi và đánh giá chi tiết thi đua 2 trụ cột: <strong>Chuyên cần</strong> (điểm danh, vắng) và <strong>Nề nếp kỷ luật</strong> (khen thưởng, trừ điểm, nội quy).
              </p>
            </div>
          </div>

          {/* Action Buttons on 1 Horizontal Row */}
          <div className="flex items-center gap-2 shrink-0 self-start xl:self-center">
            {(role === 'gvcn' || role === 'bgh') && onOpenAddDiscipline && (
              <button
                type="button"
                id="btn-add-discipline-emulation"
                onClick={() => onOpenAddDiscipline()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Ghi Nhận Khen / Phạt</span>
              </button>
            )}

            <button
              type="button"
              id="btn-export-excel-2aspects"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Tải bảng tổng hợp thi đua 2 mặt ra file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              id="btn-print-report-2aspects"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="In phiếu tổng hợp thi đua lớp"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chuyên cần trung bình */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mặt 1: Chuyên Cần Lớp
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
                {classMetrics.avgAttendanceScore}
              </span>
              <span className="text-xs text-slate-400">/ 100 điểm</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Tổng lượt nghỉ học kỳ: <strong>{classMetrics.totalAbsences} buổi</strong></span>
            </p>
          </div>
          <div className="w-full bg-purple-100 dark:bg-purple-950/50 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${classMetrics.avgAttendanceScore}%` }} />
          </div>
        </div>

        {/* Card 2: Nề nếp rèn luyện */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mặt 2: Nề Nếp & Kỷ Luật
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {classMetrics.avgConductScore}
              </span>
              <span className="text-xs text-slate-400">/ 100 điểm</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Tỷ lệ Nề nếp Tốt: <strong>{classMetrics.goodOrHigherRate}%</strong></span>
            </p>
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-950/50 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${classMetrics.avgConductScore}%` }} />
          </div>
        </div>

        {/* Card 3: Điểm Thi Đua Tổng Hợp 2 Mặt */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:from-amber-950/30 dark:to-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              Thi Đua Tổng Hợp (2 Mặt)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {classMetrics.avgOverallScore}
              </span>
              <span className="text-xs text-slate-400">/ 100 điểm</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-400" />
              <span>Xếp loại chung: <strong>Lớp Xuất Sắc Khối 12</strong></span>
            </p>
          </div>
          <div className="w-full bg-amber-100 dark:bg-amber-950/50 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${classMetrics.avgOverallScore}%` }} />
          </div>
        </div>

        {/* Card 4: Tuyên dương & Chú ý */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tuyên Dương / Cảnh Báo
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Tiêu Biểu</p>
              <p className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-mono mt-0.5">
                {classMetrics.excellentCount}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
              <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase">Cần Nhắc</p>
              <p className="text-xl font-black text-rose-800 dark:text-rose-200 font-mono mt-0.5">
                {classMetrics.warningCount}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {classMetrics.warningCount === 0 ? 'Toàn bộ 100% học sinh chấp hành tốt' : 'Cần đôn đốc nhắc nhở các em chưa đạt'}
          </p>
        </div>
      </div>

      {/* 2.5. Time Period Selector: Theo Tuần / Theo Tháng (10 Tháng) / Cả Năm */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>Khung Thời Gian Thi Đua 2 Mặt</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  {timePeriodMode === 'all'
                    ? 'Toàn Năm Học (10 Tháng)'
                    : timePeriodMode === 'by_month'
                    ? `Tổng Hợp ${ACADEMIC_MONTHS.find(m => m.key === selectedMonth)?.label || 'Theo Tháng'}`
                    : `Tổng Hợp Tuần ${selectedWeek}`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lựa chọn xem tổng hợp lũy kế cả năm, chi tiết theo từng tuần (Tuần 1-35) hoặc theo 10 tháng năm học.
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setTimePeriodMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timePeriodMode === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Cả Năm (10 Tháng)
            </button>
            <button
              type="button"
              onClick={() => setTimePeriodMode('by_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timePeriodMode === 'by_month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Theo Tháng (10 Tháng)
            </button>
            <button
              type="button"
              onClick={() => setTimePeriodMode('by_week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timePeriodMode === 'by_week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Theo Tuần (1 - 35)
            </button>
          </div>
        </div>

        {/* Dynamic Period Controls */}
        {timePeriodMode === 'by_month' && (
          <div className="pt-2 border-t border-blue-200/60 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Chọn 1 trong 10 tháng năm học:
            </span>
            {ACADEMIC_MONTHS.filter(m => m.key !== 'all').map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMonth === m.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100/60 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {m.label} {m.semester === 'hk1' ? '(HK1)' : '(HK2)'}
              </button>
            ))}
          </div>
        )}

        {timePeriodMode === 'by_week' && (
          <div className="pt-2 border-t border-blue-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Chọn tuần đánh giá:
            </span>
            <div className="flex items-center gap-1">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-black rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-slate-700 text-blue-900 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} {w <= 18 ? '• Học Kỳ 1' : '• Học Kỳ 2'}
                  </option>
                ))}
              </select>

              {/* Quick Jump for major weeks */}
              <div className="hidden sm:flex items-center gap-1 ml-2">
                {[1, 5, 10, 15, 18, 20, 25, 30, 35].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeek(w)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      selectedWeek === w
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    T{w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {timePeriodMode === 'all' && (
          <div className="pt-2 border-t border-blue-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tổng hợp điểm lũy kế trọn vẹn <strong>10 tháng</strong> (từ Tháng 9 đến hết Tháng 6) gồm cả HK1 và HK2.
            </span>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="font-semibold text-slate-500">Lọc theo học kỳ:</span>
              <button
                type="button"
                onClick={() => setSelectedSemester('all')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] cursor-pointer ${
                  selectedSemester === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                }`}
              >
                Cả 2 HK
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester('hk1')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] cursor-pointer ${
                  selectedSemester === 'hk1' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                }`}
              >
                Học Kỳ 1 (T9-T1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester('hk2')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] cursor-pointer ${
                  selectedSemester === 'hk2' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                }`}
              >
                Học Kỳ 2 (T2-T6)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search + Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              Bảng Tổng Hợp Điểm Thi Đua 2 Mặt Toàn Lớp
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {filteredStudents.length}/{students.length} Học Sinh
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-search-student-emulation"
              placeholder="Tìm theo tên, mã học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Lọc theo Tổ:
            </span>
            <div className="flex items-center gap-1">
              {(['all', '1', '2', '3', '4'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroupFilter(g)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    selectedGroupFilter === g
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {g === 'all' ? 'Tất Cả Tổ' : `Tổ ${g}`}
                </button>
              ))}
            </div>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <span className="text-slate-500 font-semibold">Xếp loại:</span>
            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả xếp loại</option>
              <option value="excellent">Gương mẫu / Tiêu biểu</option>
              <option value="good">Tiên tiến toàn diện</option>
              <option value="fair">Đạt chuẩn nề nếp</option>
              <option value="warning">Cần chấn chỉnh</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 self-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="overall_desc">Điểm Tổng Hợp (Cao → Thấp)</option>
              <option value="overall_asc">Điểm Tổng Hợp (Thấp → Cao)</option>
              <option value="attendance_desc">Điểm Chuyên Cần cao nhất</option>
              <option value="conduct_desc">Điểm Nề Nếp cao nhất</option>
              <option value="name_asc">Tên học sinh (A → Z)</option>
              <option value="code_asc">Mã số học sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Full Interactive Table of All Students */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-3.5 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Học Sinh</th>
                  <th className="py-3 px-3 text-center">Tổ</th>
                  {/* Aspect 1: Chuyên cần */}
                  <th className="py-3 px-3 text-center bg-purple-50/70 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 border-l border-purple-100 dark:border-purple-900/40">
                    Vắng (P / KP)
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/70 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300">
                    Đi Muộn
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/70 dark:bg-purple-950/20 font-black text-purple-900 dark:text-purple-300">
                    Điểm Chuyên Cần
                  </th>
                  {/* Aspect 2: Nề nếp */}
                  <th className="py-3 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border-l border-emerald-100 dark:border-emerald-900/40">
                    Khen / Phạt
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/20 font-black text-emerald-900 dark:text-emerald-300">
                    Điểm Nề Nếp
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    Xếp Loại Nề Nếp
                  </th>
                  {/* Aspect Combined */}
                  <th className="py-3 px-4 text-center font-black text-[#003366] dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 border-l border-blue-200 dark:border-blue-900">
                    Tổng Điểm 2 Mặt
                  </th>
                  <th className="py-3 px-4 text-center">Danh Hiệu Thi Đua</th>
                  <th className="py-3 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-400 italic">
                      Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item, idx) => {
                    const isTop = item.overallEmulationScore >= 95;
                    const isWarning = item.overallEmulationScore < 80 || item.conductScore < 80;

                    return (
                      <tr
                        key={item.student.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          isTop ? 'bg-amber-50/20 dark:bg-amber-950/10' : isWarning ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        {/* STT */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Học sinh info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.student.avatar}
                              alt={item.student.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {item.student.name}
                                </span>
                                {isTop && (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.student.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tổ */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                            Tổ {item.student.group}
                          </span>
                        </td>

                        {/* Vắng P / KP */}
                        <td className="py-3 px-3 text-center bg-purple-50/30 dark:bg-purple-950/10 border-l border-purple-100/60 dark:border-purple-900/20">
                          <div className="flex items-center justify-center gap-1 font-mono text-xs">
                            <span className={item.excusedAbsences > 0 ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                              {item.excusedAbsences}P
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className={item.unexcusedAbsences > 0 ? 'text-red-600 font-black' : 'text-slate-400'}>
                              {item.unexcusedAbsences}KP
                            </span>
                          </div>
                        </td>

                        {/* Đi muộn */}
                        <td className="py-3 px-3 text-center bg-purple-50/30 dark:bg-purple-950/10">
                          <span className={`font-mono text-xs ${item.lateArrivals > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                            {item.lateArrivals} lần
                          </span>
                        </td>

                        {/* Điểm Chuyên cần */}
                        <td className="py-3 px-3 text-center bg-purple-50/30 dark:bg-purple-950/10">
                          <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                            item.attendanceScore >= 95
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : item.attendanceScore >= 85
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.attendanceScore}đ
                          </span>
                        </td>

                        {/* Khen / Phạt */}
                        <td className="py-3 px-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10 border-l border-emerald-100/60 dark:border-emerald-900/20">
                          <div className="flex items-center justify-center gap-1 font-mono text-xs">
                            <span className={item.bonusCount > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                              +{item.bonusCount}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className={item.penaltyCount > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                              -{item.penaltyCount}
                            </span>
                          </div>
                        </td>

                        {/* Điểm Nề nếp */}
                        <td className="py-3 px-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                          <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                            item.conductScore >= 95
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.conductScore >= 85
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.conductScore}đ
                          </span>
                        </td>

                        {/* Xếp loại Nề nếp */}
                        <td className="py-3 px-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.conductRating === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.conductRating === 'Khá'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.conductRating}
                          </span>
                        </td>

                        {/* Điểm Tổng Hợp 2 Mặt */}
                        <td className="py-3 px-4 text-center bg-blue-50/50 dark:bg-blue-950/30 border-l border-blue-200 dark:border-blue-900">
                          <span className="text-sm font-black text-[#003366] dark:text-blue-300 font-mono">
                            {item.overallEmulationScore}
                          </span>
                        </td>

                        {/* Danh Hiệu */}
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block whitespace-nowrap ${item.emulationBadgeColor}`}>
                            {item.emulationTitle}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentDetail(item.student)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-all cursor-pointer"
                            title="Xem chi tiết hồ sơ thi đua 2 mặt"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Guide */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <strong>Chuyên cần (40%)</strong>: 100đ gốc - vắng có phép (-2đ), không phép (-5đ), muộn (-2đ).
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong>Nề nếp (60%)</strong>: 100đ gốc + điểm thưởng tác phong/Đoàn thể - vi phạm nội quy.
              </span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Tổng số học sinh hiển thị: {filteredStudents.length} / {students.length}
            </span>
          </div>
        </div>

      {/* 5. Student Detail Modal for 2-Aspect Emulation Profile */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStudentDetail.avatar}
                  alt={selectedStudentDetail.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30"
                />
                <div>
                  <h3 className="text-base font-black text-white">{selectedStudentDetail.name}</h3>
                  <p className="text-xs text-blue-200 font-mono">
                    {selectedStudentDetail.code} • Tổ {selectedStudentDetail.group}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const item = studentEmulationData.find((s) => s.student.id === selectedStudentDetail.id);
              if (!item) return null;

              return (
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                  {/* Big score overview */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                      <p className="text-[10px] text-purple-700 font-bold uppercase">Chuyên Cần</p>
                      <p className="text-xl font-black text-purple-800 dark:text-purple-300 font-mono mt-0.5">
                        {item.attendanceScore}đ
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Nề Nếp</p>
                      <p className="text-xl font-black text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                        {item.conductScore}đ
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                      <p className="text-[10px] text-amber-700 font-bold uppercase">Tổng Hợp 2 Mặt</p>
                      <p className="text-xl font-black text-amber-800 dark:text-amber-300 font-mono mt-0.5">
                        {item.overallEmulationScore}đ
                      </p>
                    </div>
                  </div>

                  {/* Attendance Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Chi Tiết Chuyên Cần & Nghỉ Học
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>Nghỉ có phép: <strong>{item.excusedAbsences} buổi</strong></div>
                      <div>Nghỉ không phép: <strong className={item.unexcusedAbsences > 0 ? 'text-red-500' : ''}>{item.unexcusedAbsences} buổi</strong></div>
                      <div>Đi muộn: <strong>{item.lateArrivals} lần</strong></div>
                    </div>
                  </div>

                  {/* Discipline Logs Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Lịch Sử Khen Thưởng & Vi Phạm
                    </h4>
                    {item.bonusLogs.length === 0 && item.penaltyLogs.length === 0 ? (
                      <p className="text-slate-400 italic">Chưa có bản ghi khen thưởng / trừ điểm nào khác.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {item.bonusLogs.map((l) => (
                          <div key={l.id} className="p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                            <span>{l.reason}</span>
                            <span className="font-bold font-mono">+{l.points}đ</span>
                          </div>
                        ))}
                        {item.penaltyLogs.map((l) => (
                          <div key={l.id} className="p-2 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 flex items-center justify-between">
                            <span>{l.reason}</span>
                            <span className="font-bold font-mono">{l.points}đ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions inside modal */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {onOpenAddDiscipline && (role === 'gvcn' || role === 'bgh') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentDetail(null);
                          onOpenAddDiscipline(selectedStudentDetail.id);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Ghi Nhận Khen / Phạt
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedStudentDetail(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
