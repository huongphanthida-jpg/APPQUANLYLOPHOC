import React, { useState, useRef } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  FileText,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  Landmark,
  ShieldCheck,
  CheckSquare,
  ClipboardCheck,
  BookmarkCheck,
  Edit2,
  School,
  Phone,
  Mail,
  Quote,
  BookOpen,
  MapPin,
  Camera,
  Pencil
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Student,
  LeaveRequest,
  ClassJournalEntry,
  DisciplineEntry,
  DutySchedule,
  TaskItem,
  UserRole,
  NavigationTab,
  ClassInfo,
  TeacherInfo,
  BghInfo,
} from '../types';
import { INITIAL_BGH_INFO } from '../data/mockData';

interface OverviewViewProps {
  students?: Student[];
  leaveRequests?: LeaveRequest[];
  journal?: ClassJournalEntry[];
  disciplineLogs?: DisciplineEntry[];
  dutySchedule?: DutySchedule[];
  tasks?: TaskItem[];
  role?: UserRole;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddDiscipline?: () => void;
  onOpenAiAdvisor?: () => void;
  onSelectStudent?: (student: Student) => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  bghInfo?: BghInfo;
  onEditClass?: () => void;
  onEditTeacher?: () => void;
  onEditBgh?: () => void;
  onUpdateClassAvatar?: (avatarUrl: string) => void;
  onUpdateTeacherAvatar?: (avatarUrl: string) => void;
  onUpdateBghAvatar?: (avatarUrl: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  students = [],
  leaveRequests = [],
  journal = [],
  disciplineLogs = [],
  dutySchedule = [],
  tasks = [],
  role = 'gvcn',
  onNavigate,
  onOpenAddDiscipline,
  onOpenAiAdvisor,
  onSelectStudent,
  classInfo,
  teacherInfo,
  bghInfo,
  onEditClass,
  onEditTeacher,
  onEditBgh,
  onUpdateClassAvatar,
  onUpdateTeacherAvatar,
  onUpdateBghAvatar,
}) => {
  const [bghApprovedWeek, setBghApprovedWeek] = useState(true);
  const [bghToast, setBghToast] = useState<string | null>(null);
  const classAvatarInputRef = useRef<HTMLInputElement>(null);
  const teacherAvatarInputRef = useRef<HTMLInputElement>(null);
  const bghAvatarInputRef = useRef<HTMLInputElement>(null);

  const defaultClass: ClassInfo = {
    className: 'LỚP 12A1 (KHTN)',
    schoolName: 'THPT TRẦN NGUYÊN HÃN',
    academicYear: 'Niên khóa 2023 - 2026',
    avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300',
    roomName: 'Phòng 302 - Tầng 3 Nhà A',
    slogan: 'Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT 2026',
    specialization: 'Chuyên ban Khoa học Tự nhiên (Toán - Lý - Hóa - Sinh)',
  };

  const defaultTeacher: TeacherInfo = {
    name: 'Thầy Nguyễn Văn An',
    title: 'Thạc sĩ Toán học - GVCN Lớp 12A1',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    phone: '0912.345.678',
    email: 'nguyenvanan.gv@tnh.edu.vn',
    subject: 'Toán Học',
    officeHours: 'Thứ 2 - Thứ 6 (16:30 - 17:45)',
    bio: 'Giáo viên Giỏi cấp Thành phố, 12 năm kinh nghiệm luyện thi THPT Quốc gia môn Toán.',
  };

  const currentClass = classInfo || defaultClass;
  const currentTeacher = teacherInfo || defaultTeacher;
  const currentBgh = bghInfo || INITIAL_BGH_INFO;

  const handleBghAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (onUpdateBghAvatar) {
          onUpdateBghAvatar(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClassAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (onUpdateClassAvatar) {
          onUpdateClassAvatar(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTeacherAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (onUpdateTeacherAvatar) {
          onUpdateTeacherAvatar(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBghSignWeekly = () => {
    setBghApprovedWeek(true);
    setBghToast(`Ban Giám Hiệu đã phê duyệt và ký số điện tử xác nhận tuần học thứ 24 của ${currentClass.className}!`);
    setTimeout(() => setBghToast(null), 4500);
  };
  // Aggregate Class Metrics
  const totalStudents = students.length || 1;
  const avgGpa = (
    students.reduce((acc, s) => acc + (s.grades?.gpa || 0), 0) / totalStudents
  ).toFixed(2);
  const avgConduct = Math.round(
    students.reduce((acc, s) => acc + (s.conductScore || 100), 0) / totalStudents
  );
  const pendingLeaves = (leaveRequests || []).filter((lr) => lr.status === 'pending');

  // Progression Line Data (Aggregated from all students)
  const periods = ['Tháng 9', 'Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Thi Thử TN'];
  const progressData = periods.map((period) => {
    let mathTotal = 0;
    let physTotal = 0;
    let chemTotal = 0;
    let count = 0;

    (students || []).forEach((s) => {
      const match = s.progressHistory?.find((p) => p.period === period);
      if (match) {
        mathTotal += match.math || 0;
        physTotal += match.physics || 0;
        chemTotal += match.chemistry || 0;
        count++;
      }
    });

    return {
      period,
      'Toán học': count ? Number((mathTotal / count).toFixed(2)) : 0,
      'Vật lý': count ? Number((physTotal / count).toFixed(2)) : 0,
      'Hóa học': count ? Number((chemTotal / count).toFixed(2)) : 0,
    };
  });

  // Group Leaderboard Scores
  const groupScores = [1, 2, 3, 4].map((groupNum) => {
    const groupStudents = (students || []).filter((s) => s.group === groupNum);
    const avgScore =
      groupStudents.length > 0
        ? groupStudents.reduce((acc, s) => acc + (s.conductScore || 100), 0) /
          groupStudents.length
        : 0;
    const bonusCount = (disciplineLogs || []).filter(
      (l) => l.group === groupNum && l.type === 'bonus'
    ).length;
    const penaltyCount = (disciplineLogs || []).filter(
      (l) => l.group === groupNum && l.type === 'penalty'
    ).length;

    return {
      groupNum,
      name: `Tổ ${groupNum}`,
      avgScore: Number(avgScore.toFixed(1)),
      bonusCount,
      penaltyCount,
      membersCount: groupStudents.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  // Top Commended Students
  const topStudents = [...(students || [])]
    .sort((a, b) => (b.conductScore || 100) - (a.conductScore || 100))
    .slice(0, 3);

  // Students Needing Academic or Discipline Attention
  const warningStudents = (students || []).filter(
    (s) =>
      (s.conductScore || 100) < 95 ||
      (s.grades?.math?.avg || 0) < 8.0 ||
      (s.grades?.physics?.avg || 0) < 7.5
  );

  return (
    <div id="overview-dashboard" className="space-y-6 pb-12">
      {/* Top Banner with Teacher / BGH greeting & quick action buttons */}
      <div className={`text-white rounded-2xl p-6 shadow-md border relative overflow-hidden ${
        role === 'bgh'
          ? 'bg-gradient-to-r from-[#002244] via-[#003366] to-[#1e3a8a] border-amber-400/40'
          : role === 'gvbm'
          ? 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-[#003366] border-indigo-400/40'
          : role === 'csl'
          ? 'bg-gradient-to-r from-teal-900 via-cyan-950 to-[#003366] border-teal-400/40'
          : 'bg-[#003366] border-[#002244]'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                role === 'bgh'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : role === 'gvbm'
                  ? 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40'
                  : role === 'csl'
                  ? 'bg-teal-400/20 text-teal-300 border-teal-400/40'
                  : 'bg-[#98FF98]/20 text-[#98FF98] border-[#98FF98]/30'
              }`}>
                {role === 'bgh'
                  ? `BAN GIÁM HIỆU • THANH TRA TOÀN DIỆN`
                  : role === 'gvbm'
                  ? `GIÁO VIÊN BỘ MÔN • KHỐI KHTN`
                  : role === 'csl'
                  ? `BAN CÁN SỰ LỚP • ĐIỀU HÀNH THI ĐUA & TRỰC NHẬT`
                  : `${currentClass.className} • ${currentClass.specialization || 'CHUYÊN BAN KHTN'}`}
              </span>
              <span className="text-xs text-slate-300">{currentClass.schoolName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {role === 'bgh'
                ? `Tổng Quan Giám Sát Lớp ${currentClass.className}`
                : role === 'gvbm'
                ? `Cổng Giảng Dạy & Nhập Điểm Bộ Môn - ${currentClass.className}`
                : role === 'csl'
                ? `Bảng Điều Hành Ban Cán Sự - ${currentClass.className}`
                : `Bảng Điều Khiển Quản Lý ${currentClass.className}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {role === 'bgh'
                ? `Thanh tra viên: ${currentBgh.name} (${currentBgh.dutyRole || 'Ban Giám Hiệu'}) • GVCN: ${currentTeacher.name}`
                : role === 'gvbm'
                ? `Giáo viên Bộ Môn: Thầy/Cô Bộ Môn KHTN • GVCN: ${currentTeacher.name} • ${currentClass.academicYear}`
                : role === 'csl'
                ? `Ban Cán sự: Lớp trưởng & 4 Tổ trưởng phụ trách • GVCN: ${currentTeacher.name} • ${currentClass.academicYear}`
                : `GVCN: ${currentTeacher.name} • ${currentClass.academicYear} • Cập nhật trực tuyến`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {role === 'bgh' ? (
              <>
                <button
                  id="btn-overview-edit-bgh-top"
                  onClick={onEditBgh}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Sửa Thông Tin BGH</span>
                </button>
                <button
                  id="btn-bgh-sign-week"
                  onClick={handleBghSignWeekly}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-xs border border-white/20 cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-amber-300" />
                  <span>Ký Duyệt Sổ Tuần 24</span>
                </button>
                <button
                  id="btn-overview-ai-advisor"
                  onClick={onOpenAiAdvisor}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold transition-all shadow-xs border border-amber-400/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Cố Vấn BGH</span>
                </button>
              </>
            ) : role === 'csl' ? (
              <>
                <button
                  id="btn-overview-add-discipline"
                  onClick={onOpenAddDiscipline}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Chấm Thi Đua Tổ</span>
                </button>
                <button
                  id="btn-overview-duty"
                  onClick={() => onNavigate('tasks')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Phân Công Trực Nhật</span>
                </button>
                <button
                  id="btn-overview-ai-advisor"
                  onClick={onOpenAiAdvisor}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 text-teal-200 text-xs font-bold transition-all shadow-xs border border-teal-400/30"
                >
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>AI Trợ Lý Cán Sự</span>
                </button>
              </>
            ) : role === 'gvbm' ? (
              <>
                <button
                  id="btn-overview-academic"
                  onClick={() => onNavigate('academic')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Nhập Điểm Môn</span>
                </button>
                <button
                  id="btn-overview-discipline"
                  onClick={() => onNavigate('discipline')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 text-xs font-bold transition-all shadow-xs border border-indigo-400/30"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ghi Sổ Đầu Bài</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="btn-overview-add-discipline"
                  onClick={onOpenAddDiscipline}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ghi Điểm Nề Nếp</span>
                </button>

                <button
                  id="btn-overview-ai-advisor"
                  onClick={onOpenAiAdvisor}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#98FF98] hover:bg-emerald-300 text-[#003366] text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#003366]" />
                  <span>AI Cố Vấn Sư Phạm</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs for Direct Camera / Avatar Upload */}
      <input
        ref={classAvatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="hidden-class-avatar-input"
        onChange={handleClassAvatarFile}
      />
      <input
        ref={teacherAvatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="hidden-teacher-avatar-input"
        onChange={handleTeacherAvatarFile}
      />
      <input
        ref={bghAvatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="hidden-bgh-avatar-input"
        onChange={handleBghAvatarFile}
      />

      {/* Class & GVCN Showcase Cards with Edit Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* Card 1: Class Information & Avatar Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between relative group h-full">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative group/avatar shrink-0">
                  <img
                    src={currentClass.avatar}
                    alt={currentClass.className}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#003366] shadow-md bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultClass.avatar;
                    }}
                  />
                  {role === 'gvcn' && (
                    <button
                      type="button"
                      id="btn-class-avatar-camera"
                      onClick={(e) => {
                        e.stopPropagation();
                        classAvatarInputRef.current?.click();
                      }}
                      title="Chọn ảnh từ máy tính/điện thoại để đổi ảnh đại diện lớp"
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#003366] hover:bg-blue-800 text-white flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#98FF98]" />
                    </button>
                  )}
                </div>

                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded inline-block">
                    {currentClass.schoolName}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
                    {currentClass.className}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {currentClass.academicYear} • {currentClass.roomName || 'Phòng 302 - Tầng 3 Nhà A'}
                  </p>
                </div>
              </div>

              {role === 'gvcn' && onEditClass && (
                <button
                  id="btn-overview-edit-class"
                  onClick={onEditClass}
                  title="Chỉnh sửa thông tin lớp học"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] text-xs font-bold transition-all border border-blue-200 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#003366]" />
                  <span className="hidden sm:inline">Chỉnh Sửa Lớp</span>
                  <span className="sm:hidden">Sửa</span>
                </button>
              )}
            </div>

            {currentClass.specialization && (
              <div className="mt-3.5 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                <span className="font-semibold text-slate-700 truncate">{currentClass.specialization}</span>
              </div>
            )}

            {currentClass.slogan && (
              <div className="mt-2 text-xs text-slate-600 italic bg-amber-50/60 rounded-xl p-2.5 border border-amber-100/80 flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span className="line-clamp-2">"{currentClass.slogan}"</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600 min-h-[42px]">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Sĩ số:</span>
              <strong className="text-slate-900 font-bold">{students.length} Học sinh</strong>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">4 Tổ</span>
            </div>

            <button
              type="button"
              id="btn-edit-stream-badge"
              onClick={role === 'gvcn' ? onEditClass : undefined}
              title={role === 'gvcn' ? "Nhấp để tùy chỉnh nhãn Chuyên ban (KHTN, KHXH...)" : undefined}
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 shadow-2xs ${
                role === 'gvcn' ? 'hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="whitespace-nowrap">{currentClass.streamBadge || 'Chuyên ban KHTN'}</span>
              {role === 'gvcn' && (
                <Pencil className="w-3 h-3 text-emerald-600 opacity-70" />
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Teacher GVCN Information & Portrait Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between relative group h-full">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative group/avatar shrink-0">
                  <img
                    src={currentTeacher.avatar}
                    alt={currentTeacher.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-3 border-[#003366] shadow-md bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultTeacher.avatar;
                    }}
                  />
                  {role === 'gvcn' && (
                    <button
                      type="button"
                      id="btn-teacher-avatar-camera"
                      onClick={(e) => {
                        e.stopPropagation();
                        teacherAvatarInputRef.current?.click();
                      }}
                      title="Chọn ảnh từ máy tính/điện thoại để đổi ảnh chân dung GVCN"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#003366] hover:bg-blue-800 text-white flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#98FF98]" />
                    </button>
                  )}
                  <span className="absolute -top-1 -left-1 text-[9px] font-extrabold bg-[#003366] text-[#98FF98] px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                    GVCN
                  </span>
                </div>

                <div className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {currentTeacher.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                      {currentTeacher.subject || 'Toán Học'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5 truncate">
                    {currentTeacher.title || 'Thạc sĩ Toán học - GVCN Lớp 12A1'}
                  </p>
                </div>
              </div>

              {role === 'gvcn' && onEditTeacher && (
                <button
                  id="btn-overview-edit-teacher"
                  onClick={onEditTeacher}
                  title="Chỉnh sửa thông tin giáo viên chủ nhiệm"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all border border-emerald-200 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Chỉnh Sửa GVCN</span>
                  <span className="sm:hidden">Sửa</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
              {currentTeacher.phone && (
                <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                  <span className="truncate">SĐT: <strong className="text-slate-800">{currentTeacher.phone}</strong></span>
                </div>
              )}
              {currentTeacher.email && (
                <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                  <span className="truncate">Email: <strong className="text-slate-800">{currentTeacher.email}</strong></span>
                </div>
              )}
            </div>

            {currentTeacher.bio && (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {currentTeacher.bio}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600 min-h-[42px]">
            <div
              className="flex items-center gap-1.5 text-xs text-slate-600 truncate"
              title={`Lịch tiếp phụ huynh: ${currentTeacher.officeHours || 'Thứ 2 - Thứ 6 (16:30 - 17:45)'}`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                Tiếp PH: <strong className="text-slate-900 font-bold">{currentTeacher.officeHours || 'Thứ 2 - Thứ 6 (16:30 - 17:45)'}</strong>
              </span>
            </div>

            <button
              type="button"
              id="btn-edit-position-badge"
              onClick={role === 'gvcn' ? onEditTeacher : undefined}
              title={role === 'gvcn' ? "Nhấp để tùy chỉnh chức vụ/chế độ nhiệm vụ GVCN (Chính Nhiệm, Kiêm Nhiệm...)" : undefined}
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 shadow-2xs ${
                role === 'gvcn' ? 'hover:bg-blue-100 hover:border-blue-300 active:scale-95 cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="whitespace-nowrap">{currentTeacher.positionType || 'Chính Nhiệm'}</span>
              {role === 'gvcn' && (
                <Pencil className="w-3 h-3 text-blue-600 opacity-70" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* BGH Toast Notification */}
      {bghToast && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <ClipboardCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{bghToast}</span>
        </div>
      )}

      {/* BGH Quick Directive & Profile Card */}
      {role === 'bgh' && (
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-blue-50/70 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="relative group/bgh-avatar shrink-0">
                <img
                  src={currentBgh.avatar}
                  alt={currentBgh.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = INITIAL_BGH_INFO.avatar;
                  }}
                />
                <button
                  type="button"
                  id="btn-bgh-avatar-camera"
                  onClick={() => bghAvatarInputRef.current?.click()}
                  title="Tải ảnh chân dung BGH từ máy"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-[#003366]">
                    {currentBgh.dutyRole || 'Ban Giám Hiệu'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {currentBgh.department || 'Ban Giám Hiệu - Hội đồng Sư phạm'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {currentBgh.name}
                </h3>
                <p className="text-xs text-amber-900 font-bold">
                  {currentBgh.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {onEditBgh && (
                <button
                  id="btn-bgh-edit-profile-card"
                  onClick={onEditBgh}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Sửa Hồ Sơ & Đổi Ảnh BGH</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Chất Lượng Đào Tạo Mũi Nhọn
              </p>
              <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed">
                ĐTB Khối A đạt <strong>{avgGpa}/10</strong> (+0.6 so với trung bình khối 12). 5 học sinh lọt đội tuyển HSG Cấp Thành Phố.
              </p>
            </div>

            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Kiểm Duyệt Sổ Đầu Bài Tuần
              </p>
              <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed">
                100% tiết dạy đúng phân phối chương trình Sở GD. Đánh giá: <strong>Tiết Tốt (A) đạt 96%</strong>.
              </p>
            </div>

            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Chỉ Đạo Sư Phạm Trọng Tâm
              </p>
              <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed">
                {currentBgh.bio ? currentBgh.bio : 'Đẩy mạnh hướng nghiệp chuyên sâu Khối A & A1; phối hợp GVCN theo dõi sát nề nếp thi thử TN THPT.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sĩ số */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sĩ số Học Sinh
            </p>
            <h3 className="text-2xl font-extrabold text-[#003366] mt-1">
              {totalStudents} <span className="text-xs font-normal text-slate-400">học sinh</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Hiện diện
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Điểm trung bình khối A */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ĐTB Khối Tự Nhiên
            </p>
            <h3 className="text-2xl font-extrabold text-[#003366] mt-1">
              {avgGpa} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tăng +0.4 so với đầu kỳ
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Điểm thi đua nề nếp */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Thi Đua Nề Nếp
            </p>
            <h3 className="text-2xl font-extrabold text-[#003366] mt-1">
              {avgConduct} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Hạng 2 Toàn Trường THPT
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Đơn xin nghỉ chờ duyệt */}
        <div
          onClick={() => onNavigate('leaves')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Đơn Nghỉ Phép
            </p>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-1">
              {pendingLeaves.length}{' '}
              <span className="text-xs font-normal text-slate-400">đơn chờ duyệt</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-orange-600">
              Xem & Phê duyệt ngay <ChevronRight className="w-3 h-3" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Early Warning System Widget (Cảnh Báo Sa Sút Sớm) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                Hệ Thống AI Cảnh Báo Sớm Học Sinh Cần Quan Tâm Đặc Biệt (Early Warning)
              </h3>
              <p className="text-xs text-slate-600">
                Tự động rà soát điểm số sa sút, nghỉ phép nhiều hoặc có vi phạm nề nếp trong tuần
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-950">
            {students.filter((s) => s.grades.gpa < 7.0 || disciplineLogs.filter((d) => d.studentId === s.id).length > 0).length} Học Sinh Cần Chú Ý
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {students
            .filter((s) => s.grades.gpa < 7.5 || disciplineLogs.filter((d) => d.studentId === s.id).length > 0)
            .slice(0, 3)
            .map((st) => {
              const studentDisciplines = disciplineLogs.filter((d) => d.studentId === st.id);
              const studentLeaves = leaveRequests.filter((l) => l.studentId === st.id);
              return (
                <div key={st.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover border" />
                      <span className="text-xs font-bold text-slate-900">{st.name}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      ĐTB: {st.grades.gpa}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>• Vi phạm nề nếp: <strong className="text-rose-600">{studentDisciplines.length} lần</strong></p>
                    <p>• Xin nghỉ phép: <strong className="text-slate-700">{studentLeaves.length} buổi</strong></p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAiAdvisor}
                    className="w-full py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Lập Lộ Trình Cải Thiện AI</span>
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Progression Line Chart & Digital Class Journal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Natural Science Progress Line Chart */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Biểu Đồ Tiến Bộ Khối Tự Nhiên (Toán - Lý - Hóa)
                </h3>
                <p className="text-xs text-slate-500">
                  Theo dõi sự phát triển điểm trung bình các đợt kiểm tra & thi thử TN
                </p>
              </div>
              <button
                id="btn-view-academic-detail"
                onClick={() => onNavigate('academic')}
                className="text-xs font-semibold text-[#003366] hover:underline flex items-center gap-1"
              >
                Xem chi tiết sổ điểm <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[5, 10]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#003366',
                      borderColor: '#002244',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="Toán học"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Vật lý"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Hóa học"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#d97706' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-blue-50/60">
                <span className="text-slate-500 font-medium">Toán học</span>
                <p className="text-sm font-bold text-blue-700">9.1 ĐTB</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50/60">
                <span className="text-slate-500 font-medium">Vật lý</span>
                <p className="text-sm font-bold text-emerald-700">8.7 ĐTB</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60">
                <span className="text-slate-500 font-medium">Hóa học</span>
                <p className="text-sm font-bold text-amber-700">8.5 ĐTB</p>
              </div>
            </div>
          </div>

          {/* Digital Class Journal Preview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#003366]" />
                <h3 className="text-base font-bold text-[#003366]">
                  Sổ Đầu Bài Kỹ Thuật Số (Hôm nay)
                </h3>
              </div>
              <button
                id="btn-view-journal-detail"
                onClick={() => onNavigate('discipline')}
                className="text-xs font-semibold text-[#003366] hover:underline flex items-center gap-1"
              >
                Toàn bộ sổ đầu bài <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Tiết</th>
                    <th className="py-2.5 px-3">Môn học</th>
                    <th className="py-2.5 px-3">Giáo viên</th>
                    <th className="py-2.5 px-3">Tên bài dạy</th>
                    <th className="py-2.5 px-3">Sĩ số</th>
                    <th className="py-2.5 px-3">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(journal || []).slice(0, 4).map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-700">Tiết {entry.period}</td>
                      <td className="py-3 px-3 font-semibold text-[#003366]">{entry.subject}</td>
                      <td className="py-3 px-3 text-slate-600">{entry.teacherName}</td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{entry.lessonName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {entry.attendance}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Loại {entry.assessment}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!journal || journal.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Chưa có dữ liệu sổ đầu bài hôm nay
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Group Ranking & Pedagogical Warnings */}
        <div className="space-y-6">
          {/* Group Thi Đua Leaderboard */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Xếp Hạng Thi Đua 4 Tổ
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Tuần 1</span>
            </div>

            <div className="space-y-3">
              {groupScores.map((group, idx) => (
                <div
                  key={group.groupNum}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{group.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {group.membersCount} HS • +{group.bonusCount} thưởng / -{group.penaltyCount} phạt
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#003366]">
                      {group.avgScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block">điểm TB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sư phạm: Học sinh Cần Quan Tâm / Cảnh Báo Sớm */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Cảnh Báo Sư Phạm & Nề Nếp
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {warningStudents.length} Học sinh
              </span>
            </div>

            <div className="space-y-2.5">
              {(warningStudents || []).slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-8 h-8 rounded-full object-cover border border-red-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-red-600">
                        {(s.conductScore || 100) < 95
                          ? `Nề nếp: ${s.conductScore}đ (${s.violationsCount ?? s.violations?.length ?? 0} vi phạm)`
                          : `Môn Lý/Hóa cần bồi dưỡng (${s.grades?.physics?.avg ?? s.grades?.math?.avg ?? 0}đ)`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenAiAdvisor}
                    title="Phân tích giải pháp sư phạm với AI"
                    className="p-1.5 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-100 font-semibold text-[11px]"
                  >
                    AI Cố vấn
                  </button>
                </div>
              ))}
              {(!warningStudents || warningStudents.length === 0) && (
                <p className="text-center py-3 text-xs text-emerald-700 font-medium">
                  Tất cả học sinh đều duy trì nề nếp và học lực tốt!
                </p>
              )}
            </div>
          </div>

          {/* Quick Duty Roster Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                Lịch Trực Nhật Trong Tuần
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-[#003366] hover:underline"
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {(dutySchedule || []).slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#003366]">{d.dayOfWeek}:</span>
                    <span className="font-semibold text-slate-700">Tổ {d.assignedGroup}</span>
                    <span className="text-slate-400">({d.leaderName})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'Đã hoàn thành'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'Đang thực hiện'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
              {(!dutySchedule || dutySchedule.length === 0) && (
                <p className="text-center py-3 text-xs text-slate-400">
                  Chưa có lịch trực nhật
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
