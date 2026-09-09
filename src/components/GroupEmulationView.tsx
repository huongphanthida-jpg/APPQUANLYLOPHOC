import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Users,
  CheckSquare,
  TrendingUp,
  Plus,
  Calendar,
  Filter,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Clock,
  AlertTriangle,
  Flame,
  ChevronRight,
  BarChart3,
  Star,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  X,
  UserCheck,
  Edit3,
} from 'lucide-react';
import {
  Student,
  UserRole,
  GroupEmulationLog,
  DisciplineEntry,
  DutySchedule,
  OnlineExamAttempt,
  RandomPickRecord,
  ClassInfo,
  TeacherInfo,
  HomeroomBookData,
} from '../types';

export const getStudentGroupNumber = (groupVal: any): 1 | 2 | 3 | 4 => {
  if (typeof groupVal === 'number' && groupVal >= 1 && groupVal <= 4) {
    return groupVal as 1 | 2 | 3 | 4;
  }
  if (groupVal) {
    const parsed = parseInt(String(groupVal).replace(/[^0-9]/g, ''), 10);
    if (parsed >= 1 && parsed <= 4) return parsed as 1 | 2 | 3 | 4;
  }
  return 1;
};

interface GroupEmulationViewProps {
  students: Student[];
  role: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  emulationLogs: GroupEmulationLog[];
  onAddEmulationLog: (log: GroupEmulationLog) => void;
  onDeleteEmulationLog?: (id: string) => void;
  disciplineLogs?: DisciplineEntry[];
  dutySchedule?: DutySchedule[];
  examAttempts?: OnlineExamAttempt[];
  randomPicks?: RandomPickRecord[];
  onUpdateStudents?: (students: Student[]) => void;
  homeroomBookData?: HomeroomBookData;
}

export const GroupEmulationView: React.FC<GroupEmulationViewProps> = ({
  students = [],
  role,
  classInfo,
  teacherInfo,
  emulationLogs = [],
  onAddEmulationLog,
  onDeleteEmulationLog,
  disciplineLogs = [],
  dutySchedule = [],
  examAttempts = [],
  randomPicks = [],
  onUpdateStudents,
  homeroomBookData,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>('Tháng 9');
  const [selectedGroupModal, setSelectedGroupModal] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Custom Group Leaders Override State
  const [customLeaders, setCustomLeaders] = useState<Record<number, string>>({});

  // New Log Form State
  const [targetGroup, setTargetGroup] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<GroupEmulationLog['category']>('special_bonus');
  const [logTitle, setLogTitle] = useState<string>('');
  const [logPoints, setLogPoints] = useState<number>(10);
  const [logDesc, setLogDesc] = useState<string>('');

  // Default Leaders fallback map
  const defaultLeadersMap: Record<number, string> = {
    1: 'Nguyễn Hoàng Long',
    2: 'Phạm Đức Anh',
    3: 'Đỗ Hải Đăng',
    4: 'Bùi Minh Triết',
  };

  // Dynamic Group Leader resolution
  const getGroupLeaderInfo = (groupNum: number, groupStudents: Student[]) => {
    // Check manual custom leader override
    if (customLeaders[groupNum]) {
      return {
        name: customLeaders[groupNum],
        title: `Tổ Trưởng Tổ ${groupNum}`,
      };
    }

    // Check homeroomBookData committee
    if (homeroomBookData?.committee) {
      const commItem = homeroomBookData.committee.find((c) => {
        const r = (c.roleName || '').toLowerCase();
        return r.includes('tổ trưởng') && r.includes(`${groupNum}`);
      });
      if (commItem && commItem.studentName && commItem.studentName !== 'Chưa gán') {
        return {
          name: commItem.studentName,
          title: `Tổ Trưởng Tổ ${groupNum}`,
        };
      }
    }

    // Check if default leader name is in group
    const defaultName = defaultLeadersMap[groupNum];
    const foundInGroup = groupStudents.find((s) => s.name === defaultName);
    if (foundInGroup) {
      return {
        name: foundInGroup.name,
        title: `Tổ Trưởng Tổ ${groupNum}`,
        avatar: foundInGroup.avatar,
      };
    }

    // Fallback to first student of group
    if (groupStudents.length > 0) {
      return {
        name: groupStudents[0].name,
        title: `Tổ Trưởng Tổ ${groupNum}`,
        avatar: groupStudents[0].avatar,
      };
    }

    // Default fallback
    return {
      name: defaultName || 'Chưa phân công',
      title: `Tổ Trưởng Tổ ${groupNum}`,
    };
  };

  // Group Color Palettes
  const groupThemes: Record<number, { bg: string; border: string; badge: string; text: string; headerGradient: string }> = {
    1: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-600 text-white',
      text: 'text-blue-700 dark:text-blue-300',
      headerGradient: 'from-blue-600 to-indigo-600',
    },
    2: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-600 text-white',
      text: 'text-emerald-700 dark:text-emerald-300',
      headerGradient: 'from-emerald-600 to-teal-600',
    },
    3: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-600 text-white',
      text: 'text-amber-700 dark:text-amber-300',
      headerGradient: 'from-amber-600 to-orange-600',
    },
    4: {
      bg: 'bg-purple-50/70 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-700 dark:text-purple-300',
      headerGradient: 'from-purple-600 to-pink-600',
    },
  };

  // Compute comprehensive stats for each of the 4 groups
  const groupSummaries = useMemo(() => {
    return ([1, 2, 3, 4] as const).map((groupNum) => {
      const groupStudents = students.filter((s) => getStudentGroupNumber(s.group) === groupNum);
      const studentIds = new Set(groupStudents.map((s) => s.id));

      // 1. Base Score
      const baseScore = 100;

      // 2. Academic Score
      const avgGpa = groupStudents.length > 0
        ? groupStudents.reduce((acc, s) => acc + (s.grades?.gpa || 8.0), 0) / groupStudents.length
        : 8.0;
      const academicGpaBonus = Math.round((avgGpa - 7.5) * 10); // e.g. 9.0 GPA -> +15 pts

      // Online exams completed
      const groupAttempts = examAttempts.filter((a) => studentIds.has(a.studentId) && a.status === 'completed');
      const examBonus = groupAttempts.reduce((sum, a) => sum + (a.score >= 8 ? 3 : 1), 0);

      // Random Oral Picks bonus
      const groupPicks = randomPicks.filter((p) => studentIds.has(p.studentId));
      const oralBonus = groupPicks.reduce((sum, p) => sum + (p.emulationPointsAwarded || 0), 0);

      const totalAcademic = academicGpaBonus + examBonus + oralBonus;

      // 3. Discipline Score
      const groupDiscipline = disciplineLogs.filter(
        (d) => studentIds.has(d.studentId) || getStudentGroupNumber(d.group) === groupNum
      );
      const violations = groupDiscipline.filter((d) => d.type === 'violation' || d.type === 'penalty');
      const commendations = groupDiscipline.filter((d) => d.type === 'commendation' || d.type === 'bonus');
      const totalDiscipline = commendations.length * 5 - violations.length * 5;

      // 4. Attendance Score
      const totalAbsences = groupStudents.reduce((acc, s) => acc + (s.absenceCount || 0), 0);
      const totalAttendance = 15 - totalAbsences * 5; // Start with +15 for full attendance

      // 5. Duty Score
      const groupDuties = dutySchedule.filter(
        (d) => getStudentGroupNumber(d.assignedGroup || (d as any).group) === groupNum
      );
      const completedDuties = groupDuties.filter((d) => d.status === 'completed' || (d.status as any) === 'Đã hoàn thành');
      const totalDuty = completedDuties.length * 5;

      // 6. Direct Emulation Logs Points
      const groupLogs = emulationLogs.filter((l) => getStudentGroupNumber(l.group) === groupNum);
      const totalDirectLogs = groupLogs.reduce((sum, l) => sum + l.points, 0);

      // Total Week Emulation Score
      const finalScore = baseScore + totalAcademic + totalDiscipline + totalAttendance + totalDuty + totalDirectLogs;

      const leader = getGroupLeaderInfo(groupNum, groupStudents);

      return {
        group: groupNum,
        leader,
        studentCount: groupStudents.length,
        avgGpa: avgGpa.toFixed(2),
        baseScore,
        totalAcademic,
        totalDiscipline,
        totalAttendance,
        totalDuty,
        totalDirectLogs,
        finalScore,
        violationsCount: violations.length,
        commendationsCount: commendations.length,
        examAttemptsCount: groupAttempts.length,
        oralPicksCount: groupPicks.length,
        members: groupStudents,
        logs: groupLogs,
      };
    });
  }, [students, disciplineLogs, dutySchedule, examAttempts, randomPicks, emulationLogs, customLeaders, homeroomBookData]);

  // Sort groups by final score descending
  const rankedGroups = useMemo(() => {
    return [...groupSummaries].sort((a, b) => b.finalScore - a.finalScore);
  }, [groupSummaries]);

  // Handle changing student group
  const handleChangeStudentGroup = (studentId: string, newGroup: 1 | 2 | 3 | 4) => {
    if (!onUpdateStudents) return;
    const updated = students.map((s) => (s.id === studentId ? { ...s, group: newGroup } : s));
    onUpdateStudents(updated);
  };

  // Handle Add Emulation Log
  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;

    const newLog: GroupEmulationLog = {
      id: `em-${Date.now()}`,
      group: targetGroup,
      week: selectedWeek,
      month: selectedMonth,
      category: category,
      title: logTitle.trim(),
      points: logPoints,
      description: logDesc.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: teacherInfo?.name || 'GVCN',
    };

    onAddEmulationLog(newLog);
    setLogTitle('');
    setLogDesc('');
    setIsAddModalOpen(false);
  };

  const rankBadges = [
    { rank: 1, title: 'Hạng Nhất - Cờ Đỏ Xuất Sắc', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-400' },
    { rank: 2, title: 'Hạng Nhì - Cờ Xanh Tiên Tiến', icon: Medal, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-400' },
    { rank: 3, title: 'Hạng Ba - Cờ Đồng Thi Đua', icon: Award, color: 'text-amber-700', bg: 'bg-amber-700/10 border-amber-600' },
    { rank: 4, title: 'Hạng Tư - Cần Bứt Phá', icon: Star, color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
              <Trophy className="w-6 h-6 text-amber-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-amber-100">
                  Bảng Xếp Hạng Thi Đua Khối {classInfo?.className?.match(/(10|11|12)/)?.[0] || '12'}
                </span>
                <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {classInfo?.className || 'Lớp 12A1'} ({students.length} Học Sinh)
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Tổng Hợp & Xếp Hạng Thi Đua Theo 4 Tổ
              </h2>
              <p className="text-xs text-amber-100/90 max-w-2xl mt-0.5">
                Tự động đồng bộ và tính toán kết quả thi đua khi thay đổi danh sách học sinh hoặc phân chia lại 4 tổ!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {(role === 'gvcn' || role === 'csl') && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-orange-800 font-bold text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Điểm Thưởng / Phạt</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="In báo cáo thi đua tuần"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Selector & Period Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Calendar className="w-4 h-4 text-orange-500" />
            Kỳ Đánh Giá:
          </span>
          {[1, 2, 3, 4].map((wk) => (
            <button
              key={wk}
              type="button"
              onClick={() => setSelectedWeek(wk)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedWeek === wk
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Tuần {wk} ({selectedMonth})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Tháng:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="Tháng 9">Tháng 9/2026</option>
            <option value="Tháng 10">Tháng 10/2026</option>
            <option value="Tháng 11">Tháng 11/2026</option>
            <option value="Tháng 12">Tháng 12/2026</option>
          </select>
        </div>
      </div>

      {/* TOP 4 LEADERBOARD PODIUM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {rankedGroups.map((groupData, idx) => {
          const rankInfo = rankBadges[idx];
          const RankIcon = rankInfo.icon;

          return (
            <div
              key={groupData.group}
              className={`rounded-2xl border-2 p-4 transition-all hover:shadow-lg flex flex-col justify-between space-y-4 ${
                idx === 0
                  ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:from-amber-950/30 dark:to-slate-900 shadow-md ring-2 ring-amber-400/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                {/* Header with Rank & Group Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                      idx === 0 ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        TỔ {groupData.group}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500">{groupData.studentCount} Học Sinh</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${rankInfo.bg} ${rankInfo.color}`}>
                    <RankIcon className="w-3.5 h-3.5" />
                    <span>{idx === 0 ? 'DẪN ĐẦU' : `HẠNG ${idx + 1}`}</span>
                  </div>
                </div>

                {/* Big Score Number */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tổng Điểm Tuần:</span>
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
                    {groupData.finalScore} <span className="text-xs text-slate-500 font-sans">điểm</span>
                  </span>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      Học Tập (GPA {groupData.avgGpa}):
                    </span>
                    <span className="font-bold text-blue-600">+{groupData.totalAcademic}đ</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Nề Nếp & Khen Phạt:
                    </span>
                    <span className={`font-bold ${groupData.totalDiscipline >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {groupData.totalDiscipline >= 0 ? `+${groupData.totalDiscipline}` : groupData.totalDiscipline}đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      Chuyên Cần & Điểm Danh:
                    </span>
                    <span className="font-bold text-purple-600">+{groupData.totalAttendance}đ</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                      Trực Nhật & Nhiệm Vụ:
                    </span>
                    <span className="font-bold text-amber-600">+{groupData.totalDuty}đ</span>
                  </div>

                  {groupData.totalDirectLogs !== 0 && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                        Điểm Thưởng Phong Trào:
                      </span>
                      <span className={`font-bold ${groupData.totalDirectLogs > 0 ? 'text-pink-600' : 'text-red-500'}`}>
                        {groupData.totalDirectLogs > 0 ? `+${groupData.totalDirectLogs}` : groupData.totalDirectLogs}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Group Leader & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-slate-400 block">Tổ Trưởng:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {groupData.leader.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGroupModal(groupData.group)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Chi Tiết</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Visual Score Comparison Chart + Emulation Logs Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Comparison Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Ma Trận Điểm Thi Đua Từng Tiêu Chí Giữa 4 Tổ
              </h3>
              <span className="text-xs text-slate-500">Thang điểm cơ sở 100đ</span>
            </div>

            {/* Visual Bars Table */}
            <div className="space-y-4 pt-2">
              {groupSummaries.map((g) => (
                <div key={g.group} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-black flex items-center justify-center text-xs">
                        T{g.group}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Tổ {g.group} - {g.leader.name} ({g.studentCount} HS)
                      </span>
                    </div>
                    <span className="font-black text-orange-600 dark:text-orange-400 font-mono text-sm">
                      {g.finalScore} đ
                    </span>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    {/* Base 100 */}
                    <div style={{ width: '45%' }} className="bg-slate-400 dark:bg-slate-600" title="Điểm gốc: 100đ" />
                    {/* Academic */}
                    <div style={{ width: `${Math.max(g.totalAcademic * 1.5, 4)}%` }} className="bg-blue-500" title={`Học tập: +${g.totalAcademic}đ`} />
                    {/* Discipline */}
                    <div style={{ width: `${Math.max(g.totalDiscipline * 1.5, 3)}%` }} className="bg-emerald-500" title={`Kỷ luật: +${g.totalDiscipline}đ`} />
                    {/* Attendance */}
                    <div style={{ width: `${Math.max(g.totalAttendance * 1.5, 3)}%` }} className="bg-purple-500" title={`Chuyên cần: +${g.totalAttendance}đ`} />
                    {/* Duty */}
                    <div style={{ width: `${Math.max(g.totalDuty * 1.5, 3)}%` }} className="bg-amber-500" title={`Trực nhật: +${g.totalDuty}đ`} />
                    {/* Bonus */}
                    {g.totalDirectLogs > 0 && (
                      <div style={{ width: `${Math.max(g.totalDirectLogs * 1.5, 3)}%` }} className="bg-pink-500" title={`Thưởng phong trào: +${g.totalDirectLogs}đ`} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Điểm Gốc (100đ)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Học Tập
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nề Nếp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Chuyên Cần
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Trực Nhật
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Điểm Thưởng Khác
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Emulation Logs & Special Records (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Nhật Ký Khen Thưởng & Trừ Điểm Tổ ({emulationLogs.length})
              </h3>
              {(role === 'gvcn' || role === 'csl') && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Ghi Nhận
                </button>
              )}
            </div>

            {emulationLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Chưa có điểm thưởng / phạt trực tiếp nào được ghi nhận trong tuần này.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {emulationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                          Tổ {getStudentGroupNumber(log.group)}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                          log.points >= 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {log.points >= 0 ? `+${log.points}` : log.points} đ
                        </span>
                        {onDeleteEmulationLog && role === 'gvcn' && (
                          <button
                            onClick={() => onDeleteEmulationLog(log.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="Xóa bản ghi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {log.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {log.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                      <span>Người chấm: {log.recordedBy}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL FOR SPECIFIC GROUP */}
      {selectedGroupModal !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className={`p-5 bg-gradient-to-r ${groupThemes[selectedGroupModal].headerGradient} text-white flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    Danh Sách Thành Viên & Điểm Thi Đua Tổ {selectedGroupModal}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/90 mt-0.5">
                    <span>Tổ Trưởng:</span>
                    <select
                      value={groupSummaries.find((g) => g.group === selectedGroupModal)?.leader.name || ''}
                      onChange={(e) => {
                        setCustomLeaders((prev) => ({
                          ...prev,
                          [selectedGroupModal]: e.target.value,
                        }));
                      }}
                      className="bg-black/30 text-white font-bold px-2 py-0.5 rounded-lg border border-white/30 text-xs"
                    >
                      {students
                        .filter((s) => getStudentGroupNumber(s.group) === selectedGroupModal)
                        .map((s) => (
                          <option key={s.id} value={s.name} className="text-slate-900">
                            {s.name}
                          </option>
                        ))}
                      {students.filter((s) => getStudentGroupNumber(s.group) === selectedGroupModal).length === 0 && (
                        <option value="Chưa phân công" className="text-slate-900">
                          Chưa phân công
                        </option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedGroupModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Member Table */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Họ và Tên</th>
                      <th className="p-3">Mã HS</th>
                      <th className="p-3 text-center">Tổ Hiện Tại</th>
                      <th className="p-3 text-center">GPA</th>
                      <th className="p-3 text-center">Hạnh Kiểm</th>
                      <th className="p-3 text-center">Nề Nếp / Vi Phạm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students
                      .filter((s) => getStudentGroupNumber(s.group) === selectedGroupModal)
                      .map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                            <img
                              src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                              alt={student.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <span>{student.name}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{student.code}</td>
                          <td className="p-3 text-center">
                            {role === 'gvcn' || role === 'csl' ? (
                              <select
                                value={getStudentGroupNumber(student.group)}
                                onChange={(e) =>
                                  handleChangeStudentGroup(
                                    student.id,
                                    Number(e.target.value) as 1 | 2 | 3 | 4
                                  )
                                }
                                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                              >
                                <option value={1}>Tổ 1</option>
                                <option value={2}>Tổ 2</option>
                                <option value={3}>Tổ 3</option>
                                <option value={4}>Tổ 4</option>
                              </select>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                                Tổ {getStudentGroupNumber(student.group)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-600">
                            {student.grades?.gpa || 8.5}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                              {student.conductRating || 'Tốt'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-emerald-600">+{student.commendationsCount || 0}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-bold text-red-500">-{student.violationsCount || 0}</span>
                          </td>
                        </tr>
                      ))}

                    {students.filter((s) => getStudentGroupNumber(s.group) === selectedGroupModal).length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                          Chưa có học sinh nào được phân công vào Tổ {selectedGroupModal}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGroupModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMULATION LOG MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-black">Ghi Nhận Điểm Thi Đua Tổ</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tổ Áp Dụng:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([1, 2, 3, 4] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGroup(g)}
                      className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        targetGroup === g
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tổ {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chuyên Mục Thi Đua:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="academic">Học tập (Giải bài, thi thử, phát biểu)</option>
                  <option value="discipline">Nề nếp & Tác phong</option>
                  <option value="attendance">Chuyên cần & Đúng giờ</option>
                  <option value="duty">Trực nhật lớp & Vệ sinh</option>
                  <option value="special_bonus">Khen thưởng phong trào / Văn thể mỹ (+ Điểm)</option>
                  <option value="special_penalty">Vi phạm kỷ luật đột xuất (- Điểm)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Điểm Thưởng / Phạt:
                </label>
                <input
                  type="text"
                  required
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  placeholder="Ví dụ: Đạt giải Nhất báo tường 20/11..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số Điểm (+ / -):
                </label>
                <select
                  value={logPoints}
                  onChange={(e) => setLogPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-orange-600"
                >
                  <option value={20}>+20 Điểm (Giải Nhất Trường / Đột Phá)</option>
                  <option value={15}>+15 Điểm (Xuất Sắc Toàn Diện)</option>
                  <option value={10}>+10 Điểm (Khen Thưởng)</option>
                  <option value={5}>+5 Điểm (Tích Cực)</option>
                  <option value={-5}>-5 Điểm (Nhắc Nhở / Đi Muộn)</option>
                  <option value={-10}>-10 Điểm (Vi Phạm Nề Nếp Lớp)</option>
                  <option value={-20}>-20 Điểm (Vi Phạm Nghiêm Trọng)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú / Diễn Giải Chi Tiết (Tùy chọn):
                </label>
                <textarea
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  rows={2}
                  placeholder="Mô tả sự việc, thành viên đại diện..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black shadow-md cursor-pointer"
                >
                  Lưu Bản Ghi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
