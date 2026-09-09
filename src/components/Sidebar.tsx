import React, { useRef } from 'react';
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
  Camera,
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
  onUpdateClassInfo?: (info: ClassInfo) => void;
  onUpdateTeacherInfo?: (info: TeacherInfo) => void;
  onUpdateBghInfo?: (info: BghInfo) => void;
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
  onUpdateClassInfo,
  onUpdateTeacherInfo,
  onUpdateBghInfo,
}) => {
  const classFileInputRef = useRef<HTMLInputElement>(null);
  const teacherFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClassAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onUpdateClassInfo) {
          onUpdateClassInfo({
            ...currentClass,
            avatar: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeacherAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (role === 'bgh' && onUpdateBghInfo) {
          onUpdateBghInfo({
            ...currentBgh,
            avatar: reader.result as string,
          });
        } else if (onUpdateTeacherInfo) {
          onUpdateTeacherInfo({
            ...currentTeacher,
            avatar: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const gvcnNavItems: NavItem[] = [
    { id: 'overview', label: 'Bảng Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Học Sinh', icon: Users },
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
    { id: 'seating', label: 'Sơ Đồ Lớp (4 Dãy)', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu (2 Buổi)', icon: CalendarDays },
    { id: 'connect', label: 'Kênh Kết Nối PH & HS', icon: HeartHandshake },
    { id: 'academic', label: 'Bảng tổng hợp thi đua Lớp', icon: GraduationCap },
    { id: 'materials', label: 'Học Liệu & Nộp Bài', icon: FolderOpen },
    { id: 'discipline', label: 'Nề Nếp & Thi Đua', icon: Award },
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
    { id: 'discipline', label: 'Nề Nếp & Thi Đua', icon: Award },
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
    { id: 'discipline', label: 'Theo Dõi Nề Nếp', icon: Award },
    { id: 'random-picker', label: 'Gọi Tên Trả Lời Bài', icon: Shuffle },
    { id: 'group-emulation', label: 'Tổng Hợp Thi Đua Theo Tổ', icon: Trophy },
    { id: 'leaves', label: 'Danh Sách Vắng Phép', icon: FileText, badge: pendingLeavesCount },
    { id: 'homeroom-book', label: 'Sổ Đầu Bài Lớp', icon: BookOpen },
    { id: 'ai-advisor', label: 'Cố Vấn Sư Phạm Bộ Môn AI', icon: Sparkles, highlight: true },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'overview', label: 'Tổng Quan Của Tôi', icon: LayoutDashboard },
    { id: 'students', label: 'Hồ Sơ Cá Nhân', icon: User },
    { id: 'subject-teachers', label: 'Giáo Viên Bộ Môn', icon: UserCheck },
    { id: 'seating', label: 'Vị Trí Chỗ Ngồi Của Tôi', icon: LayoutGrid },
    { id: 'schedule', label: 'Thời Khoá Biểu Tuần', icon: CalendarDays },
    { id: 'connect', label: 'Kênh Kết Nối & Bạn Học', icon: HeartHandshake },
    { id: 'academic', label: 'Xem Điểm & Học Tập', icon: GraduationCap },
    { id: 'materials', label: 'Kho Học Liệu & Bài Nộp', icon: FolderOpen },
    { id: 'discipline', label: 'Nề Nếp & Thi Đua', icon: Award },
    { id: 'tasks', label: 'Phân Công Trực Nhật', icon: CheckSquare },
    { id: 'random-picker', label: 'Vòng Quay Học Tập', icon: Shuffle },
    { id: 'group-emulation', label: 'Thi Đua Tổ Của Tôi', icon: Trophy },
    { id: 'leaves', label: 'Nộp Đơn Xin Nghỉ Phép', icon: FileText },
    { id: 'homeroom-book', label: 'Sổ Đầu Bài & Sổ CN', icon: BookOpen },
    { id: 'ai-advisor', label: 'Gia Sư & Cố Vấn Học Tập AI', icon: Sparkles, highlight: true },
  ];

  const navItems =
    role === 'gvcn'
      ? gvcnNavItems
      : role === 'bgh'
      ? bghNavItems
      : role === 'subject_teacher'
      ? gvbmNavItems
      : studentNavItems;

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'ai-advisor') {
      if (onOpenAiAdvisor) onOpenAiAdvisor();
    } else {
      onTabChange(item.id as NavigationTab);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Hidden File Inputs for Avatars */}
      <input
        type="file"
        ref={classFileInputRef}
        onChange={handleClassAvatarUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={teacherFileInputRef}
        onChange={handleTeacherAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Desktop Sticky Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 rounded-3xl shadow-lg border border-[#002244] overflow-hidden shrink-0 self-start sticky top-24"
      >
        <div className="flex flex-col h-full bg-[#003366] text-white">
          {/* School Badge Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#002850]/50 group">
            <div className="flex items-center gap-3 min-w-0">
              {/* Class Avatar with Camera Click Overlay */}
              <div className="relative group/avatar w-11 h-11 rounded-2xl overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
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
                <button
                  type="button"
                  onClick={() => classFileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Nhấp để thay đổi ảnh đại diện Lớp"
                >
                  <Camera className="w-4 h-4 text-[#98FF98]" />
                </button>
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

            {role === 'gvcn' && onEditClass && (
              <button
                id="btn-sidebar-edit-class"
                type="button"
                onClick={onEditClass}
                title="Chỉnh sửa thông tin Lớp"
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
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {role === 'gvcn' ? (
                <div className="relative group/tavatar shrink-0">
                  <img
                    src={currentTeacher.avatar}
                    alt={currentTeacher.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#98FF98] shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultTeacher.avatar;
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      teacherFileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover/tavatar:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Nhấp để thay ảnh đại diện GVCN"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#98FF98]" />
                  </button>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#003366] text-[#98FF98] flex items-center justify-center border border-[#98FF98]">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
                </div>
              ) : role === 'bgh' ? (
                <div className="relative group/tavatar shrink-0">
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      teacherFileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover/tavatar:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Nhấp để thay ảnh đại diện BGH"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-600 text-amber-100 flex items-center justify-center border border-white">
                    <Landmark className="w-2 h-2" />
                  </span>
                </div>
              ) : role === 'subject_teacher' ? (
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/30 border border-indigo-300/50 flex items-center justify-center shrink-0 shadow-xs">
                    <GraduationCap className="w-4 h-4 text-indigo-200" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-700 text-white flex items-center justify-center border border-indigo-300">
                    <BookOpen className="w-2 h-2" />
                  </span>
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
                    : role === 'subject_teacher'
                    ? 'Giáo Viên Bộ Môn'
                    : 'Vai trò hiện tại'}
                </p>
                <p className="text-xs font-bold text-white truncate">
                  {role === 'gvcn'
                    ? currentTeacher.name
                    : role === 'bgh'
                    ? currentBgh.name
                    : role === 'subject_teacher'
                    ? 'Thầy/Cô Bộ Môn'
                    : 'Phụ huynh / Học sinh'}
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
                  title="Chỉnh sửa thông tin GVCN"
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
                  title="Chỉnh sửa thông tin BGH"
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
                    : 'bg-emerald-400 text-slate-900'
                }`}
              >
                {role === 'gvcn' ? 'GVCN' : role === 'bgh' ? 'BGH' : 'Khách'}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
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
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">
                Sĩ số: <strong className="text-[#98FF98] font-bold">{studentsCount} Học sinh</strong>
              </span>
              <span className="text-[10px] font-semibold text-[#98FF98] truncate max-w-[100px] inline-block text-right">
                {currentClass.className}
              </span>
            </div>
            <p className="text-slate-400 text-[10px]">Hệ thống Quản trị & Học liệu THPT</p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 bg-[#003366] text-white flex flex-col">
            {/* Class Badge Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#002850]/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative group/avatar w-11 h-11 rounded-2xl overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  {currentClass.avatar ? (
                    <img
                      src={currentClass.avatar}
                      alt={currentClass.className}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <School className="w-5 h-5 text-[#98FF98]" />
                  )}
                  <button
                    type="button"
                    onClick={() => classFileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#98FF98]" />
                  </button>
                </div>
                <div className="overflow-hidden min-w-0">
                  <h2 className="text-sm font-black text-white truncate">{currentClass.className}</h2>
                  <p className="text-[11px] text-slate-300 truncate">{currentClass.schoolName}</p>
                </div>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-white text-[#003366] font-bold' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};
