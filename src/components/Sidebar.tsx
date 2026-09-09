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
  const defaultClass: ClassInfo = {
    className: 'LỚP 11D5',
    schoolName: 'THPT TRẦN NGUYÊN HÃN',
    academicYear: 'Niên khóa 2024 - 2027',
    avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300',
  };

  const defaultTeacher: TeacherInfo = {
    name: 'Cô Phan Thị Dạ Hương',
    title: 'GVCN Lớp 11D5',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    phone: '0912.345.678',
    email: 'dahuong.gv@tnh.edu.vn',
    subject: 'Chủ nhiệm / Ngữ Văn',
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

  const gradeNumber = currentClass.className.match(/(10|11|12)/)?.[0] || '11';
  const gradeName = `Khối ${gradeNumber}`;

  const gvcnNavItems: NavItem[] = [
    { id: 'overview', label: 'Bảng Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Học Sinh', icon: Users },
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
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

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 via-indigo-950 to-[#001833] text-white">
      {/* Header Info */}
      <div className="p-5 border-b border-white/10 space-y-4">
        {/* Class Info Box */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={currentClass.avatar}
              alt={currentClass.className}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            {role === 'gvcn' && onEditClass && (
              <button
                onClick={onEditClass}
                className="absolute -bottom-1 -right-1 p-1 bg-amber-500 hover:bg-amber-600 rounded-full text-slate-900 shadow-md transition-transform hover:scale-110"
                title="Chỉnh sửa thông tin lớp"
              >
                <Edit2 className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 uppercase block truncate max-w-fit">
              {currentClass.schoolName}
            </span>
            <h2 className="text-base font-black text-white truncate mt-0.5">
              {currentClass.className}
            </h2>
            <p className="text-[11px] text-blue-200 font-medium truncate">
              {currentClass.academicYear}
            </p>
          </div>
        </div>

        {/* User Card */}
        {role === 'bgh' ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentBgh.avatar}
                alt={currentBgh.name}
                className="w-9 h-9 rounded-xl object-cover border border-amber-400/30"
              />
              <div className="min-w-0">
                <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase block">
                  BAN GIÁM HIỆU
                </span>
                <h3 className="text-xs font-bold text-white truncate">{currentBgh.name}</h3>
              </div>
            </div>
            {onEditBgh && (
              <button
                onClick={onEditBgh}
                className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
                title="Chỉnh sửa thông tin BGH"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <img
                  src={currentTeacher.avatar}
                  alt={currentTeacher.name}
                  className="w-9 h-9 rounded-xl object-cover border border-white/20"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black tracking-widest text-blue-300 uppercase block">
                  GIÁO VIÊN CHỦ NHIỆM
                </span>
                <h3 className="text-xs font-bold text-white truncate">{currentTeacher.name}</h3>
              </div>
            </div>
            {role === 'gvcn' && onEditTeacher && (
              <button
                onClick={onEditTeacher}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 transition-colors"
                title="Chỉnh sửa thông tin GVCN"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'ai-advisor') {
                  if (onOpenAiAdvisor) onOpenAiAdvisor();
                } else {
                  onTabChange(item.id as NavigationTab);
                }
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                item.highlight
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-600 mt-3'
                  : isActive
                  ? 'bg-white text-blue-900 shadow-md shadow-black/10'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    item.highlight
                      ? 'text-amber-300'
                      : isActive
                      ? 'text-blue-600'
                      : 'text-blue-200/70'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse">
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
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
