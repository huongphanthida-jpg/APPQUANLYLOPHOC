import React, { useState, useMemo } from 'react';
import {
  Award,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Landmark,
  BookmarkCheck,
  ShieldCheck,
  ClipboardCheck,
  Trash2,
  PieChart
} from 'lucide-react';
import { DisciplineEntry, ClassJournalEntry, Student, UserRole, LeaveRequest, ClassInfo, TeacherInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ClassEmulationSummary2Aspects } from './ClassEmulationSummary2Aspects';

interface DisciplineViewProps {
  students: Student[];
  disciplineLogs: DisciplineEntry[];
  journal: ClassJournalEntry[];
  onOpenAddDiscipline: (studentId?: string) => void;
  onAddJournalEntry: (entry: Omit<ClassJournalEntry, 'id'>) => void;
  onDeleteDisciplineLog?: (id: string) => void;
  onDeleteJournalEntry?: (id: string) => void;
  role: UserRole;
  leaveRequests?: LeaveRequest[];
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onSelectStudent?: (student: Student) => void;
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  students = [],
  disciplineLogs = [],
  journal = [],
  onOpenAddDiscipline,
  onAddJournalEntry,
  onDeleteDisciplineLog,
  onDeleteJournalEntry,
  role,
  leaveRequests = [],
  classInfo,
  teacherInfo,
  onSelectStudent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'realtime_discipline' | 'two_aspects_emulation'>('realtime_discipline');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bonus' | 'penalty'>('all');
  const [bghSigned, setBghSigned] = useState(true);
  const [bghDirectiveText, setBghDirectiveText] = useState('Ban Giám Hiệu ghi nhận: Nề nếp chuyên cần của lớp tốt. Đề nghị GVCN tiếp tục động viên học sinh giữ vững kỷ luật trong giai đoạn thi đua nước rút.');
  const [showDirectiveEdit, setShowDirectiveEdit] = useState(false);
  const [bghToast, setBghToast] = useState<string | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSignWeeklyJournal = () => {
    setBghSigned(true);
    setBghToast('Ban Giám Hiệu đã phê duyệt nề nếp thi đua tuần thứ 24 thành công!');
    setTimeout(() => setBghToast(null), 4000);
  };

  const filteredLogs = (disciplineLogs || []).filter((log) => {
    if (!log) return false;
    if (selectedFilter === 'all') return true;
    return log.type === selectedFilter;
  });

  // Read synced base score from localStorage (defaults to 0đ if base score is set to 0)
  const attBase = localStorage.getItem('emulation_attendance_base_score') !== null
    ? Math.max(0, Number(localStorage.getItem('emulation_attendance_base_score')))
    : 0;
  const condBase = localStorage.getItem('emulation_conduct_base_score') !== null
    ? Math.max(0, Number(localStorage.getItem('emulation_conduct_base_score')))
    : 0;
  const baseScore = Math.round(attBase * 0.4 + condBase * 0.6);

  // Calculate Group statistics (Synchronized with Base Score configuration)
  const groupStats = [1, 2, 3, 4].map((g) => {
    const groupStudents = (students || []).filter((s) => s && s.group === g);
    const studentIds = new Set(groupStudents.map((s) => s.id));

    const groupLogs = (disciplineLogs || []).filter(
      (l) => l && (l.group === g || (l.studentId && studentIds.has(l.studentId)))
    );

    const bonusLogs = groupLogs.filter((l) => l.type === 'bonus' || l.type === 'commendation');
    const penaltyLogs = groupLogs.filter((l) => l.type === 'penalty' || l.type === 'violation');

    const bonusCount = bonusLogs.length;
    const penaltyCount = penaltyLogs.length;

    const bonusPoints = bonusLogs.reduce((sum, l) => sum + Math.abs(l.points || 0), 0);
    const penaltyPoints = penaltyLogs.reduce((sum, l) => sum + Math.abs(l.points || 0), 0);

    const score = baseScore + bonusPoints - penaltyPoints;

    return { group: g, score, bonus: bonusCount, penalty: penaltyCount, count: groupStudents.length };
  }).sort((a, b) => b.score - a.score);

  // 1. Load effective students list (prop or localStorage fallback)
  const effectiveStudents = useMemo(() => {
    if (students && students.length > 0) return students;
    try {
      const saved = localStorage.getItem('app_students_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, [students]);

  // 2. Customizations from localStorage
  const customizations: Record<string, 'elite' | 'development' | 'support' | 'foundation'> = useMemo(() => {
    try {
      const saved = localStorage.getItem('app_student_group_customizations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // 3. Classification Helper according to 6 core subject grades
  const classifyStudent = (student: Student): 'elite' | 'development' | 'support' | 'foundation' => {
    if (student?.id && customizations[student.id]) {
      return customizations[student.id];
    }
    const g = student?.grades || {};
    const grades = [
      g.math?.avg ?? 8.5,
      g.physics?.avg ?? 8.5,
      g.chemistry?.avg ?? 8.5,
      g.biology?.avg ?? 8.5,
      g.english?.avg ?? 8.5,
      g.literature?.avg ?? 8.5,
    ];
    const belowFiveCount = grades.filter((v) => v < 5.0).length;
    if (belowFiveCount > 1) return 'support';
    const allGte9 = grades.every((v) => v >= 9.0);
    const noneLt65 = grades.every((v) => v >= 6.5);
    if (allGte9 && noneLt65) return 'elite';
    const allGte8 = grades.every((v) => v >= 8.0);
    if (allGte8 && noneLt65) return 'development';
    return 'foundation';
  };

  // 4. Calculate counts and percentages for 4 academic groups
  const academicGroupCounts = useMemo(() => {
    const counts = {
      elite: 0,
      development: 0,
      support: 0,
      foundation: 0,
    };
    (effectiveStudents || []).forEach((s) => {
      const groupKey = classifyStudent(s);
      counts[groupKey] = (counts[groupKey] || 0) + 1;
    });
    const total = effectiveStudents.length || 1;
    return {
      elite: {
        count: counts.elite,
        percent: ((counts.elite / total) * 100).toFixed(1),
      },
      development: {
        count: counts.development,
        percent: ((counts.development / total) * 100).toFixed(1),
      },
      support: {
        count: counts.support,
        percent: ((counts.support / total) * 100).toFixed(1),
      },
      foundation: {
        count: counts.foundation,
        percent: ((counts.foundation / total) * 100).toFixed(1),
      },
      totalStudents: effectiveStudents.length,
    };
  }, [effectiveStudents, customizations]);

  // 5. Compute SVG Donut Chart slice lengths & offsets
  const donutSlices = useMemo(() => {
    const total = academicGroupCounts.totalStudents || 1;
    const C = 2 * Math.PI * 55; // 345.575
    let cumulativeOffset = 0;
    const items = [
      { key: 'elite', count: academicGroupCounts.elite.count, color: '#F59E0B' },
      { key: 'development', count: academicGroupCounts.development.count, color: '#3B82F6' },
      { key: 'support', count: academicGroupCounts.support.count, color: '#EF4444' },
      { key: 'foundation', count: academicGroupCounts.foundation.count, color: '#10B981' },
    ];

    return items.map((item) => {
      const ratio = item.count / total;
      const strokeLength = ratio * C;
      const gapLength = C - strokeLength;
      const offset = cumulativeOffset;
      cumulativeOffset += strokeLength;
      return {
        ...item,
        strokeLength,
        gapLength,
        offset,
      };
    });
  }, [academicGroupCounts]);

  return (
    <div id="discipline-view" className="space-y-6 pb-12">
      {/* Header with Sub-tab Switcher */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              NỀ NẾP & THI ĐUA
            </span>
            <span className="text-xs text-slate-400">Hệ thống tính điểm thời gian thực (Real-time)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#003366] mt-1">
            Theo Dõi Nề Nếp & Điểm Thi Đua
          </h2>
          <p className="text-xs text-slate-500">
            Đánh giá chuyên cần, theo dõi nề nếp và cộng/trừ điểm rèn luyện 4 Tổ
          </p>
        </div>

        {/* Tab Switcher: Real-time vs Thi Đua 2 Mặt */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('realtime_discipline')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'realtime_discipline'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-orange-600'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Nề Nếp Thời Gian Thực</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('two_aspects_emulation')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'two_aspects_emulation'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-orange-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Thi Đua 2 Mặt (Chuyên Cần & Nề Nếp)</span>
            </button>
          </div>

          {(role === 'gvcn' || role === 'csl') && activeSubTab === 'realtime_discipline' && (
            <button
              id="btn-open-add-discipline"
              onClick={() => onOpenAddDiscipline()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cộng / Trừ Điểm Thi Đua</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'two_aspects_emulation' ? (
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
      ) : (
        <>

      {/* BGH Toast Notification */}
      {bghToast && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{bghToast}</span>
        </div>
      )}

      {/* BGH Directive Box / Form */}
      {(role === 'bgh' || showDirectiveEdit) && (
        <div className="bg-gradient-to-br from-amber-50/90 via-slate-50 to-blue-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Ý Kiến Thanh Tra & Chỉ Đạo Của Ban Giám Hiệu Về Nề Nếp Lớp Học
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
              Ký duyệt bởi: TS. Lê Thị Mai - P.Hiệu Trưởng
            </span>
          </div>

          {showDirectiveEdit ? (
            <div className="space-y-2">
              <textarea
                value={bghDirectiveText}
                onChange={(e) => setBghDirectiveText(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Nhập nhận xét thanh tra & chỉ đạo chuyên môn..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDirectiveEdit(false)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                >
                  Lưu Chỉ Đạo Sư Phạm
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{bghDirectiveText}"
              </p>
              {role === 'bgh' && (
                <button
                  onClick={() => setShowDirectiveEdit(true)}
                  className="text-[11px] font-bold text-blue-700 hover:underline shrink-0"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4 Groups Thi Đua Leaderboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {groupStats.map((item, idx) => (
          <div
            key={item.group}
            className={`p-4 rounded-2xl border ${
              idx === 0
                ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">TỔ {item.group}</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  idx === 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Hạng {idx + 1}
              </span>
            </div>
            <h4 className="text-2xl font-black text-[#003366] mt-1">
              {item.score} <span className="text-xs font-normal text-slate-400">điểm TB</span>
            </h4>
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">+{item.bonus} tuyên dương</span>
              <span className="text-red-600 font-semibold">-{item.penalty} vi phạm</span>
            </div>
          </div>
        ))}
      </div>

      {/* 1. Real-time Discipline & Commendation Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              1. NHẬT KÝ THEO DÕI THI ĐUA, KHEN THƯỞNG & KỶ LUẬT (THỜI GIAN THỰC)
            </h3>
            <p className="text-xs text-slate-500">
              Minh bạch mọi quyết định tuyên dương và vi phạm kỷ luật của học sinh
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'all' ? 'bg-[#003366] text-white' : 'bg-white border text-slate-600'
              }`}
            >
              Tất cả ({disciplineLogs.length})
            </button>
            <button
              onClick={() => setSelectedFilter('bonus')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'bonus' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              + Thưởng ({disciplineLogs.filter((l) => l.type === 'bonus').length})
            </button>
            <button
              onClick={() => setSelectedFilter('penalty')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'penalty' ? 'bg-red-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              - Vi phạm ({disciplineLogs.filter((l) => l.type === 'penalty').length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                    log.type === 'bonus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.points > 0 ? `+${log.points}` : log.points}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{log.studentName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Tổ {log.group}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#003366]">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">{log.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ghi nhận bởi: {log.recordedBy} • Thời gian: {log.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    log.type === 'bonus'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {log.type === 'bonus' ? 'Tuyên Dương' : 'Vi Phạm'}
                </span>

                {role === 'gvcn' && onDeleteDisciplineLog && (
                  <button
                    type="button"
                    id={`btn-delete-discipline-${log.id}`}
                    onClick={() => {
                      setConfirmModalState({
                        isOpen: true,
                        title: 'Xoá Bản Ghi Thi Đua',
                        message: `Bạn có chắc muốn xoá bản ghi thi đua (${log.type === 'bonus' ? 'Tuyên dương' : 'Vi phạm'}) của học sinh "${log.studentName}"?`,
                        onConfirm: () => onDeleteDisciplineLog(log.id),
                      });
                    }}
                    title="Xoá bản ghi thi đua"
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. BIỂU ĐỒ HỌC LỰC CỦA LỚP (PHÂN BỐ 4 NHÓM HỌC SINH) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              2. BIỂU ĐỒ HỌC LỰC CỦA LỚP (TỶ LỆ PHÂN NHÓM HỌC TẬP)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tự động phân loại dựa trên điểm số 6 môn học & tùy chỉnh phân nhóm (Sĩ số: {academicGroupCounts.totalStudents} học sinh)
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 self-start sm:self-auto">
            Biểu Đồ Tròn Donut Chart
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut SVG Chart Box (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="100" cy="100" r="55" stroke="#E2E8F0" strokeWidth="24" fill="none" />

                {/* Donut Slices */}
                {donutSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="100"
                    cy="100"
                    r="55"
                    stroke={slice.color}
                    strokeWidth="24"
                    fill="none"
                    strokeDasharray={`${slice.strokeLength} ${slice.gapLength}`}
                    strokeDashoffset={-slice.offset}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-[#003366] leading-none">
                  {academicGroupCounts.totalStudents}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  HỌC SINH
                </span>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 mt-3 text-center">
              Phân bố tỷ lệ học lực 4 nhóm học tập của lớp
            </p>
          </div>

          {/* 4 Legend Cards Box (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nhóm 1 - Ưu Tú */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-1.5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span className="text-base">🌟</span> Nhóm Ưu Tú
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black">
                  {academicGroupCounts.elite.percent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-amber-950">
                  {academicGroupCounts.elite.count} <span className="text-xs font-bold text-amber-800">em</span>
                </span>
                <span className="text-[11px] font-bold text-amber-800">
                  Chiếm {academicGroupCounts.elite.percent}% sĩ số
                </span>
              </div>
              <p className="text-[10px] text-amber-700/90 font-medium">
                Cả 6 môn ≥ 9.0 và không môn nào &lt; 6.5
              </p>
            </div>

            {/* Nhóm 2 - Phát Triển */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/90 space-y-1.5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <span className="text-base">🚀</span> Nhóm Phát Triển
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-black">
                  {academicGroupCounts.development.percent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-blue-950">
                  {academicGroupCounts.development.count} <span className="text-xs font-bold text-blue-800">em</span>
                </span>
                <span className="text-[11px] font-bold text-blue-800">
                  Chiếm {academicGroupCounts.development.percent}% sĩ số
                </span>
              </div>
              <p className="text-[10px] text-blue-700/90 font-medium">
                Cả 6 môn ≥ 8.0 và không môn nào &lt; 6.5
              </p>
            </div>

            {/* Nhóm 3 - Cần Được Hỗ Trợ */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/90 space-y-1.5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <span className="text-base">⚠️</span> Nhóm Cần Hỗ Trợ
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black">
                  {academicGroupCounts.support.percent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-rose-950">
                  {academicGroupCounts.support.count} <span className="text-xs font-bold text-rose-800">em</span>
                </span>
                <span className="text-[11px] font-bold text-rose-800">
                  Chiếm {academicGroupCounts.support.percent}% sĩ số
                </span>
              </div>
              <p className="text-[10px] text-rose-700/90 font-medium">
                Hơn 1 môn bị dưới 5.0 điểm
              </p>
            </div>

            {/* Nhóm 4 - Nền Tảng */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/90 space-y-1.5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span className="text-base">🌿</span> Nhóm Nền Tảng
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black">
                  {academicGroupCounts.foundation.percent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-emerald-950">
                  {academicGroupCounts.foundation.count} <span className="text-xs font-bold text-emerald-800">em</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  Chiếm {academicGroupCounts.foundation.percent}% sĩ số
                </span>
              </div>
              <p className="text-[10px] text-emerald-700/90 font-medium">
                Học sinh hoàn thành tốt nhiệm vụ học tập còn lại
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalState && (
        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() => setConfirmModalState(null)}
          onConfirm={confirmModalState.onConfirm}
          title={confirmModalState.title}
          message={confirmModalState.message}
        />
      )}
        </>
      )}
    </div>
  );
};
