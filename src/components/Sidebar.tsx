import React from 'react';
import {
  LayoutDashboard,
  Users,
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
  const defaultClass: ClassInfo = {
    className: 'LỚP 12A1 (KHTN)',
    schoolName: 'THPT TRẦN NGUYÊN HÃN',
    academicYear: 'Niên khóa 2023 - 2026',
    avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300',
  };

  const defaultTeacher: TeacherInfo = {
    name: 'Thầy Nguyễn Văn An',
    title: 'Thạc sĩ Toán học - GVCN 12A1',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    phone: '0912.345.678',
    email: 'nguyenvanan.gv@tnh.edu.vn',
    subject: 'Toán Học',
  };

  const defaultBgh: BghInfo = {
    name: 'TS. Lê Thị Mai',
    title: 'Phó Hiệu Trưởng - Phụ trách Khối 12 & Chuyên môn KHTN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    phone: '0903.888.999',
    email: 'lethimai.bgh@tnh.edu.vn',
    office: 'Phòng BGH - Tầng 2 Nhà Hiệu Bộ',
    dutyRole: 'Phó Hiệu Trưởng',
  };

  const currentClass = classInfo || defaultClass;
  const currentTeacher = teacherInfo || defaultTeacher;
  const currentBgh = bghInfo || defaultBgh;

  const gvcnNavItems: NavItem[] = [
    { id: 'overview', label: 'Bảng Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Học Sinh', icon: Users },
    { id: 'seating', label: 'Sơ Đồ Lớp (4 Dãy)', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu (2 Buổi)', icon: CalendarDays },
    { id: 'connect', label: 'Kênh Kết Nối PH & HS', icon: HeartHandshake },
    { id: 'academic', label: 'Bảng tổng hợp thi đua Lớp', icon: GraduationCap },
    { id: 'materials', label: 'Học Liệu & Nộp Bài', icon: FolderOpen },
    { id: 'discipline', label: 'Nề Nếp & Sổ Đầu Bài', icon: Award },
    { id: 'tasks', label: 'Nhiệm Vụ & Trực Nhật', icon: CheckSquare },
    { id: 'random-picker', label: 'Gọi Tên Ngẫu Nhiên', icon: Shuffle },
    { id: 'group-emulation', label: 'Tổng Hợp Thi Đua Theo Tổ', icon: Trophy },
    { id: 'leaves', label: 'Đơn Từ & Phê Duyệt', icon: FileText, badge: pendingLeavesCount },
    { id: 'homeroom-book', label: 'Sổ Chủ Nhiệm', icon: BookOpen },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
    { id: 'ai-advisor', label: 'Cố Vấn Sư Phạm AI', icon: Sparkles, highlight: true },
  ];

  const bghNavItems: NavItem[] = [
    { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Học Sinh', icon: Users },
    { id: 'seating', label: 'Sơ Đồ Lớp', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Giảng Dạy', icon: CalendarDays },
    { id: 'connect', label: 'Cổng Kết Nối & Liên Lạc', icon: HeartHandshake },
    { id: 'academic', label: 'Bảng tổng hợp thi đua', icon: GraduationCap },
    { id: 'materials', label: 'Kho Tài Liệu & Hồ Sơ', icon: FolderOpen },
    { id: 'discipline', label: 'Kiểm Duyệt Sổ Đầu Bài', icon: Award },
    { id: 'tasks', label: 'Thông báo & Kế Hoạch', icon: CheckSquare },
    { id: 'random-picker', label: 'Gọi Tên Ngẫu Nhiên', icon: Shuffle },
    { id: 'group-emulation', label: 'Tổng Hợp Thi Đua Theo Tổ', icon: Trophy },
    { id: 'leaves', label: 'Đơn Từ', icon: FileText, badge: pendingLeavesCount },
    { id: 'homeroom-book', label: 'Sổ Chủ Nhiệm & Báo Cáo', icon: BookOpen },
    { id: 'ai-advisor', label: 'Trợ Lý Chiến Lược BGH AI', icon: Sparkles, highlight: true },
  ];

  const gvbmNavItems: NavItem[] = [
    { id: 'overview', label: 'Bảng Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Học Sinh', icon: Users },
    { id: 'seating', label: 'Sơ Đồ Lớp (4 Dãy)', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Tiết Dạy', icon: CalendarDays },
    { id: 'materials', label: 'Học Liệu & Đề Kiểm Tra', icon: FolderOpen },
    { id: 'academic', label: 'Nhập & Quản Lý Điểm Môn', icon: GraduationCap },
    { id: 'discipline', label: 'Ghi Nhận Sổ Đầu Bài Tiết', icon: Award },
    { id: 'random-picker', label: 'Gọi Tên Trả Lời Bài', icon: Shuffle },
    { id: 'group-emulation', label: 'Tổng Hợp Thi Đua Theo Tổ', icon: Trophy },
    { id: 'leaves', label: 'Danh Sách Vắng Phép', icon: FileText, badge: pendingLeavesCount },
    { id: 'homeroom-book', label: 'Sổ Đầu Bài Lớp', icon: BookOpen },
    { id: 'ai-advisor', label: 'Cố Vấn Sư Phạm Bộ Môn AI', icon: Sparkles, highlight: true },
  ];

  const cslNavItems: NavItem[] = [
    { id: 'overview', label: 'Bảng Tổng Quan Lớp', icon: LayoutDashboard },
    { id: 'discipline', label: 'Điểm Danh & Sổ Đầu Bài', icon: Award },
    { id: 'tasks', label: 'Phân Công Trực Nhật & Nhiệm Vụ', icon: CheckSquare },
    { id: 'students', label: 'Sĩ Số & Hồ Sơ Lớp', icon: Users },
    { id: 'seating', label: 'Sơ Đồ Lớp (4 Dãy)', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Lớp', icon: CalendarDays },
    { id: 'group-emulation', label: 'Chấm Điểm Thi Đua 4 Tổ', icon: Trophy },
    { id: 'random-picker', label: 'Vòng Quay Gọi Tên', icon: Shuffle },
    { id: 'materials', label: 'Học Liệu & Bài Nộp Lớp', icon: FolderOpen },
    { id: 'leaves', label: 'Theo Dõi Đơn Nghỉ Phép', icon: FileText },
    { id: 'homeroom-book', label: 'Sổ Chủ Nhiệm (Sổ Đầu Bài)', icon: BookOpen },
    { id: 'ai-advisor', label: 'Trợ Lý Ban Cán Sự AI', icon: Sparkles, highlight: true },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'overview', label: 'Tổng Quan Của Tôi', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Cá Nhân', icon: User },
    { id: 'seating', label: 'Vị Trí Chỗ Ngồi Của Tôi', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Tuần', icon: CalendarDays },
    { id: 'connect', label: 'Kênh Kết Nối & Bạn Học', icon: HeartHandshake },
    { id: 'academic', label: 'Tiến Độ Học Tập', icon: GraduationCap },
    { id: 'materials', label: 'Nộp Bài & Tải Học Liệu', icon: FileUp },
    { id: 'discipline', label: 'Điểm Thi Đua Của Tôi', icon: Award },
    { id: 'tasks', label: 'Lịch Trực Nhật Tổ', icon: CheckSquare },
    { id: 'random-picker', label: 'Vòng Quay Gọi Tên', icon: Shuffle },
    { id: 'group-emulation', label: 'Thi Đua Các Tổ', icon: Trophy },
    { id: 'leaves', label: 'Nộp Đơn Nghỉ Phép', icon: FileText },
  ];

  const parentNavItems: NavItem[] = [
    { id: 'overview', label: 'Sổ Liên Lạc Điện Tử', icon: HeartHandshake },
    { id: 'students', label: 'Hồ Sơ & Sức Khỏe Con', icon: User },
    { id: 'seating', label: 'Vị Trí Chỗ Ngồi Của Con', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Lớp', icon: CalendarDays },
    { id: 'connect', label: 'Kênh Kết Nối GVCN & Lớp', icon: HeartHandshake },
    { id: 'academic', label: 'Kết Quả Khối Tự Nhiên', icon: GraduationCap },
    { id: 'materials', label: 'Học Liệu & Bài Nộp Con', icon: FolderOpen },
    { id: 'discipline', label: 'Nề Nếp & Chuyên Cần', icon: Award },
    { id: 'random-picker', label: 'Vòng Quay Gọi Tên', icon: Shuffle },
    { id: 'group-emulation', label: 'Thi Đua Các Tổ', icon: Trophy },
    { id: 'leaves', label: 'Gửi Đơn Cho GVCN', icon: FileText },
  ];

  const navItems =
    role === 'gvcn'
      ? gvcnNavItems
      : role === 'bgh'
      ? bghNavItems
      : role === 'gvbm'
      ? gvbmNavItems
      : role === 'csl'
      ? cslNavItems
      : role === 'student'
      ? studentNavItems
      : parentNavItems;

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'ai-advisor') {
      if (onOpenAiAdvisor) onOpenAiAdvisor();
    } else {
      onTabChange(item.id as NavigationTab);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#003366] text-white">
      {/* School Badge Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#002850]/50 group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            {currentClass.avatar ? (
              <img
                src={currentClass.avatar}
                alt={currentClass.className}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultClass.avatar;
                }}
              />
            ) : (
              <School className="w-5 h-5 text-[#98FF98]" />
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#98FF98] bg-[#98FF98]/15 px-2 py-0.5 rounded truncate block">
              {currentClass.schoolName}
            </span>
            <h2 className="text-sm font-black text-white truncate mt-0.5">
              {currentClass.className}
            </h2>
            <p className="text-[11px] text-slate-300 truncate">{currentClass.academicYear}</p>
          </div>
        </div>

        {/* Quick Edit Class button for GVCN */}
        {role === 'gvcn' && onEditClass && (
          <button
            id="btn-sidebar-edit-class"
            type="button"
            onClick={onEditClass}
            title="Chỉnh sửa thông tin & hình đại diện Lớp"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-[#98FF98] text-slate-300 hover:text-[#003366] transition-all opacity-80 hover:opacity-100 shrink-0 ml-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Role & User Indicator Widget */}
      <div
        className={`mx-3.5 my-3 p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between group transition-all ${
          (role === 'gvcn' && onEditTeacher) || (role === 'bgh' && onEditBgh)
            ? 'hover:bg-white/15 cursor-pointer'
            : ''
        }`}
        onClick={() => {
          if (role === 'gvcn' && onEditTeacher) onEditTeacher();
          if (role === 'bgh' && onEditBgh) onEditBgh();
        }}
        title={
          role === 'gvcn'
            ? 'Nhấp để chỉnh sửa thông tin & ảnh đại diện GVCN'
            : role === 'bgh'
            ? 'Nhấp để chỉnh sửa thông tin & ảnh đại diện BGH'
            : undefined
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {role === 'gvcn' ? (
            <div className="relative shrink-0">
              <img
                src={currentTeacher.avatar}
                alt={currentTeacher.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#98FF98] shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultTeacher.avatar;
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#003366] text-[#98FF98] flex items-center justify-center border border-[#98FF98]">
                <ShieldCheck className="w-2.5 h-2.5" />
              </span>
            </div>
          ) : role === 'bgh' ? (
            <div className="relative shrink-0">
              {currentBgh.avatar ? (
                <img
                  src={currentBgh.avatar}
                  alt={currentBgh.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultBgh.avatar;
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4 text-amber-300" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-600 text-amber-100 flex items-center justify-center border border-white">
                <Landmark className="w-2 h-2" />
              </span>
            </div>
          ) : role === 'gvbm' ? (
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/30 border border-indigo-300/50 flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-4 h-4 text-indigo-200" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-700 text-white flex items-center justify-center border border-indigo-300">
                <BookOpen className="w-2 h-2" />
              </span>
            </div>
          ) : role === 'csl' ? (
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-teal-500/30 border border-teal-300/50 flex items-center justify-center shrink-0 shadow-xs">
                <CheckSquare className="w-4 h-4 text-teal-200" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-teal-700 text-white flex items-center justify-center border border-teal-300">
                <Award className="w-2 h-2" />
              </span>
            </div>
          ) : role === 'student' ? (
            <div className="w-9 h-9 rounded-2xl bg-sky-400/20 border border-sky-300/40 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sky-300" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 text-amber-300" />
            </div>
          )}
          <div className="overflow-hidden min-w-0">
            <p className="text-[10px] text-slate-300 font-semibold uppercase truncate">
              {role === 'gvcn'
                ? 'Giáo Viên Chủ Nhiệm'
                : role === 'bgh'
                ? currentBgh.dutyRole || 'Ban Giám Hiệu'
                : role === 'gvbm'
                ? 'Giáo Viên Bộ Môn'
                : role === 'csl'
                ? 'Ban Cán Sự Lớp'
                : 'Vai trò hiện tại'}
            </p>
            <p className="text-xs font-bold text-white truncate">
              {role === 'gvcn'
                ? currentTeacher.name
                : role === 'bgh'
                ? currentBgh.name
                : role === 'gvbm'
                ? 'Thầy/Cô Bộ Môn KHTN'
                : role === 'csl'
                ? 'Lớp Trưởng / Cán Sự Lớp'
                : role === 'student'
                ? `Học sinh ${currentClass.className}`
                : 'Phụ huynh Học sinh'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {role === 'gvcn' && onEditTeacher && (
            <button
              id="btn-sidebar-edit-teacher"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditTeacher();
              }}
              title="Chỉnh sửa thông tin & hình đại diện GVCN"
              className="p-1 rounded-lg bg-white/10 hover:bg-[#98FF98] text-slate-300 hover:text-[#003366] transition-all opacity-80 hover:opacity-100 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}

          {role === 'bgh' && onEditBgh && (
            <button
              id="btn-sidebar-edit-bgh"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditBgh();
              }}
              title="Chỉnh sửa thông tin & ảnh đại diện BGH"
              className="p-1 rounded-lg bg-white/10 hover:bg-amber-400 text-amber-200 hover:text-[#003366] transition-all opacity-80 hover:opacity-100 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}

          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
              role === 'gvcn'
                ? 'bg-[#98FF98] text-[#003366]'
                : role === 'bgh'
                ? 'bg-amber-400 text-[#003366]'
                : role === 'student'
                ? 'bg-sky-400 text-slate-900'
                : 'bg-emerald-400 text-slate-900'
            }`}
          >
            {role === 'gvcn' ? 'GVCN' : role === 'bgh' ? 'BGH' : role === 'student' ? 'Học Sinh' : 'Phụ Huynh'}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-white text-[#003366] font-bold shadow-md'
                  : item.highlight
                  ? 'bg-[#98FF98]/15 text-[#98FF98] hover:bg-[#98FF98]/25 border border-[#98FF98]/30 font-bold'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-[#003366]'
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
        <div className="flex justify-between">
          <span className="text-slate-300">Sĩ số: <strong>42 Học sinh</strong></span>
          <span className="text-emerald-300 font-bold">Top 1 Khối 12</span>
        </div>
        <p className="text-slate-300 text-[10px]">Hệ thống Quản trị & Học liệu THPT</p>
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

