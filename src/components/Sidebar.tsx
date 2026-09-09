import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Award,
  CheckSquare,
  FileText,
  Bell,
  Sparkles,
  School,
  ShieldCheck,
  User,
  HeartHandshake,
  Landmark,
  Building2,
  FolderOpen,
  FileUp,
  FileSpreadsheet,
  Edit2,
  Settings,
  LayoutGrid,
  CalendarDays,
  Shuffle,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { UserRole, NavigationTab, ClassInfo, TeacherInfo, BghInfo } from '../types';

interface NavItem {
  id: NavigationTab | 'ai-advisor';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  role: UserRole;
  pendingLeavesCount?: number;
  studentsCount?: number;
  onOpenAiAdvisor?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  bghInfo?: BghInfo;
  onEditClass?: () => void;
  onEditTeacher?: () => void;
  onEditBgh?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  role,
  pendingLeavesCount = 0,
  studentsCount = 42,
  onOpenAiAdvisor,
  isMobileOpen = false,
  onCloseMobile,
  classInfo,
  teacherInfo,
  bghInfo,
  onEditClass,
  onEditTeacher,
  onEditBgh,
}) => {
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { id: 'overview', label: 'Tổng quan Lớp học', icon: LayoutDashboard },
      { id: 'homeroom-book', label: 'Sổ Chủ nhiệm số', icon: BookOpen },
    ];

    if (role === 'student' || role === 'parent') {
      return [
        ...baseItems,
        { id: 'academic', label: 'Kết quả Học tập', icon: GraduationCap },
        { id: 'discipline', label: 'Nội quy & Thể lệ', icon: Award },
        { id: 'task-duty', label: 'Trực nhật & Nhiệm vụ', icon: CheckSquare },
        { id: 'seating-chart', label: 'Sơ đồ Lớp & Thời khóa biểu', icon: LayoutGrid },
        { id: 'leave-requests', label: 'Đơn xin nghỉ học', icon: FileText },
        { id: 'materials', label: 'Học liệu & Kho số', icon: FolderOpen },
        { id: 'connect', label: 'Số liên lạc điện tử', icon: Bell },
      ];
    }

    if (role === 'subject_teacher') {
      return [
        ...baseItems,
        { id: 'students', label: 'Danh sách Học sinh', icon: Users },
        { id: 'academic', label: 'Sổ điểm Môn học', icon: GraduationCap },
        { id: 'seating-chart', label: 'Sơ đồ Lớp & Thời khóa biểu', icon: LayoutGrid },
        { id: 'materials', label: 'Học liệu số & Bài tập', icon: FolderOpen },
      ];
    }

    if (role === 'bgh') {
      return [
        ...baseItems,
        { id: 'students', label: 'Quản lý Học sinh', icon: Users },
        { id: 'subject-teachers', label: 'Giáo viên Bộ môn', icon: UserCheck },
        { id: 'academic', label: 'Tổng hợp Học tập', icon: GraduationCap },
        { id: 'discipline', label: 'Nề nếp & Kỷ luật', icon: Award },
        { id: 'group-emulation', label: 'Thi đua Khối / Trường', icon: Trophy },
        { id: 'leave-requests', label: 'Duyệt Đơn nghỉ học', icon: FileText, badge: pendingLeavesCount },
        { id: 'materials', label: 'Kho Học liệu Trường', icon: FolderOpen },
        { id: 'connect', label: 'Thông báo & Liên lạc', icon: Bell },
        { id: 'settings', label: 'Cấu hình Hệ thống', icon: Settings },
      ];
    }

    return [
      ...baseItems,
      { id: 'students', label: 'Danh sách Học sinh', icon: Users },
      { id: 'subject-teachers', label: 'Giáo viên Bộ môn', icon: UserCheck },
      { id: 'academic', label: 'Học tập & Điểm số', icon: GraduationCap },
      { id: 'discipline', label: 'Nề nếp & Kỷ luật', icon: Award },
      { id: 'task-duty', label: 'Trực nhật & Nhiệm vụ', icon: CheckSquare },
      { id: 'group-emulation', label: 'Thi đua Nhóm / Tổ', icon: Trophy },
      { id: 'seating-chart', label: 'Sơ đồ & Thời khóa biểu', icon: LayoutGrid },
      { id: 'random-picker', label: 'Gọi tên & Ghép cặp', icon: Shuffle },
      { id: 'leave-requests', label: 'Đơn xin nghỉ học', icon: FileText, badge: pendingLeavesCount },
      { id: 'materials', label: 'Kho Học liệu & Bài tập', icon: FolderOpen },
      { id: 'connect', label: 'Sổ liên lạc điện tử', icon: Bell },
      { id: 'settings', label: 'Cấu hình & Sao lưu', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (id: NavigationTab | 'ai-advisor') => {
    if (id === 'ai-advisor') {
      if (onOpenAiAdvisor) onOpenAiAdvisor();
    } else {
      onTabChange(id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#001A33] text-white">
      {/* Header Info */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-[#002244]/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#003366] to-[#002244] border border-white/20 flex items-center justify-center text-white shadow-inner font-black text-lg">
            {classInfo?.name?.substring(0, 2) || '11'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-white truncate">
                Lớp {classInfo?.name || '11A2'}
              </h2>
              {role === 'teacher' && onEditClass && (
                <button
                  onClick={onEditClass}
                  className="text-slate-400 hover:text-amber-400 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Chỉnh sửa thông tin lớp"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Năm học: {classInfo?.academicYear || '2023 - 2024'}
            </p>
          </div>
        </div>

        {/* Teacher / User Card */}
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#003366] text-[#98FF98]">
                {role === 'teacher' ? (
                  <User className="w-3.5 h-3.5" />
                ) : role === 'bgh' ? (
                  <Landmark className="w-3.5 h-3.5" />
                ) : role === 'subject_teacher' ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <HeartHandshake className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-medium">
                  {role === 'teacher'
                    ? 'GVCN'
                    : role === 'bgh'
                    ? 'Ban Giám Hiệu'
                    : role === 'subject_teacher'
                    ? 'GV Bộ Môn'
                    : 'Học sinh / Phụ huynh'}
                </p>
                <p className="font-semibold text-white truncate text-xs">
                  {role === 'teacher'
                    ? teacherInfo?.name || 'Thầy Nguyễn Văn A'
                    : role === 'bgh'
                    ? bghInfo?.name || 'Cô Trần Thị B (Hiệu Trưởng)'
                    : role === 'subject_teacher'
                    ? 'Thầy Lê Văn C'
                    : 'Phụ huynh HS'}
                </p>
              </div>
            </div>

            {role === 'teacher' && onEditTeacher && (
              <button
                onClick={onEditTeacher}
                className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-white/10 transition-colors"
                title="Sửa thông tin GVCN"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            {role === 'bgh' && onEditBgh && (
              <button
                onClick={onEditBgh}
                className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-white/10 transition-colors"
                title="Sửa thông tin BGH"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-linear-to-r from-[#003366] to-[#002244] text-white font-bold shadow-md border border-white/20'
                  : item.highlight
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-[#98FF98] border border-[#98FF98]/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-[#98FF98]'
                      : 'text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.highlight && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#98FF98]/30 text-[#98FF98]">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 mt-auto border-t border-white/10 bg-[#002244]/50 text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-medium">
            Sĩ số: <strong className="text-white font-bold">{studentsCount} Học sinh</strong>
          </span>
          <span className="text-[10px] font-semibold text-[#98FF98]">Top 1 Khối 12</span>
        </div>
        <p className="text-slate-400 text-[10px]">Hệ thống Quản trị & Học liệu THPT</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 rounded-3xl shadow-lg border border-[#002244] overflow-hidden shrink-0 self-start sticky top-24"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
