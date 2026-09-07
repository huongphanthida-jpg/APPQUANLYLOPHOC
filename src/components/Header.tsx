import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  User,
  HeartHandshake,
  Landmark,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertCircle,
  LogIn,
  FileText,
  Eye,
  EyeOff,
  Edit2,
  School,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Users
} from 'lucide-react';
import { UserRole, Student, ClassInfo, TeacherInfo, BghInfo } from '../types';

interface HeaderProps {
  role: UserRole;
  onRoleChange?: (role: UserRole) => void;
  setRole?: (role: UserRole) => void;
  selectedStudentId?: string;
  setSelectedStudentId?: (id: string) => void;
  students?: Student[];
  onOpenMobileMenu?: () => void;
  onResetData?: () => void;
  onOpenAiAdvisor?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectStudent?: (student: Student) => void;
  pendingLeavesCount?: number;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  bghInfo?: BghInfo;
  onEditClass?: () => void;
  onEditTeacher?: () => void;
  onEditBgh?: () => void;
  onOpenGeminiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onRoleChange,
  setRole,
  selectedStudentId,
  setSelectedStudentId,
  students = [],
  onOpenMobileMenu,
  onResetData,
  onOpenAiAdvisor,
  searchQuery,
  setSearchQuery,
  onSelectStudent,
  pendingLeavesCount = 0,
  classInfo,
  teacherInfo,
  bghInfo,
  onEditClass,
  onEditTeacher,
  onEditBgh,
  onOpenGeminiKeyModal,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // GVCN Authentication Modal State (Password: 123456)
  const [showGvcnAuthModal, setShowGvcnAuthModal] = useState(false);
  const [gvcnPassword, setGvcnPassword] = useState('');
  const [gvcnAuthError, setGvcnAuthError] = useState<string | null>(null);
  const [showGvcnPasswordText, setShowGvcnPasswordText] = useState(false);

  // BGH Authentication Modal State (Password: 123)
  const [showBghAuthModal, setShowBghAuthModal] = useState(false);
  const [bghPassword, setBghPassword] = useState('');
  const [bghAuthError, setBghAuthError] = useState<string | null>(null);
  const [showBghPasswordText, setShowBghPasswordText] = useState(false);

  // GV Bộ Môn (GVBM) Authentication Modal State (Password: 2345)
  const [showGvbmAuthModal, setShowGvbmAuthModal] = useState(false);
  const [gvbmPassword, setGvbmPassword] = useState('');
  const [gvbmAuthError, setGvbmAuthError] = useState<string | null>(null);
  const [showGvbmPasswordText, setShowGvbmPasswordText] = useState(false);

  // Cán Sự Lớp (CSL) Authentication Modal State (Password: 1234)
  const [showCslAuthModal, setShowCslAuthModal] = useState(false);
  const [cslPassword, setCslPassword] = useState('');
  const [cslAuthError, setCslAuthError] = useState<string | null>(null);
  const [showCslPasswordText, setShowCslPasswordText] = useState(false);

  // Student Code Login Modal State
  const [showStudentCodeModal, setShowStudentCodeModal] = useState(false);
  const [targetStudentCode, setTargetStudentCode] = useState('');
  const [studentCodeError, setStudentCodeError] = useState<string | null>(null);
  const [pendingStudentRole, setPendingStudentRole] = useState<'student' | 'parent'>('student');

  const selectedStudent =
    (students || []).find((s) => s.id === selectedStudentId) || (students && students[0]);

  const changeRoleDirect = (newRole: UserRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else if (setRole) {
      setRole(newRole);
    }
    setShowRoleMenu(false);
    setToastMsg(
      `Đã chuyển chế độ xem: ${
        newRole === 'gvcn'
          ? 'Giáo viên chủ nhiệm (Toàn quyền quản lý học vụ)'
          : newRole === 'bgh'
          ? 'Ban Giám Hiệu (Thanh tra & Giám sát vĩ mô, Ký số Sổ đầu bài)'
          : newRole === 'gvbm'
          ? 'Giáo viên Bộ Môn (Nhập điểm môn, ghi nhận sổ đầu bài tiết dạy, chia sẻ học liệu)'
          : newRole === 'csl'
          ? 'Cán Sự Lớp (Ủy quyền điểm danh chuyên cần, phân công trực nhật, ghi sổ đầu bài)'
          : newRole === 'student'
          ? `Học sinh: ${selectedStudent?.name || 'Học sinh'} (Data Isolation - Mã ${selectedStudent?.code || ''})`
          : `Phụ huynh của em ${selectedStudent?.name || 'Học sinh'} (Data Isolation)`
      }`
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRoleSelect = (targetRole: UserRole) => {
    setShowRoleMenu(false);
    if (targetRole === 'gvcn') {
      if (role === 'gvcn') return;
      setGvcnPassword('');
      setGvcnAuthError(null);
      setShowGvcnPasswordText(false);
      setShowGvcnAuthModal(true);
    } else if (targetRole === 'bgh') {
      if (role === 'bgh') return;
      setBghPassword('');
      setBghAuthError(null);
      setShowBghPasswordText(false);
      setShowBghAuthModal(true);
    } else if (targetRole === 'gvbm') {
      if (role === 'gvbm') return;
      setGvbmPassword('');
      setGvbmAuthError(null);
      setShowGvbmPasswordText(false);
      setShowGvbmAuthModal(true);
    } else if (targetRole === 'csl') {
      if (role === 'csl') return;
      setCslPassword('');
      setCslAuthError(null);
      setShowCslPasswordText(false);
      setShowCslAuthModal(true);
    } else if (targetRole === 'student' || targetRole === 'parent') {
      setPendingStudentRole(targetRole);
      setTargetStudentCode(selectedStudent?.code || students[0]?.code || '');
      setStudentCodeError(null);
      setShowStudentCodeModal(true);
    } else {
      changeRoleDirect(targetRole);
    }
  };

  // Verify GVCN Password (123456)
  const handleVerifyGvcnPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (gvcnPassword.trim() === '123456') {
      setShowGvcnAuthModal(false);
      changeRoleDirect('gvcn');
    } else {
      setGvcnAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  // Verify BGH Password (123)
  const handleVerifyBghPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (bghPassword.trim() === '123') {
      setShowBghAuthModal(false);
      changeRoleDirect('bgh');
    } else {
      setBghAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  // Verify GV Bộ Môn Password (2345)
  const handleVerifyGvbmPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (gvbmPassword.trim() === '2345') {
      setShowGvbmAuthModal(false);
      changeRoleDirect('gvbm');
    } else {
      setGvbmAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  // Verify Cán Sự Lớp Password (1234)
  const handleVerifyCslPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (cslPassword.trim() === '1234') {
      setShowCslAuthModal(false);
      changeRoleDirect('csl');
    } else {
      setCslAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  // Verify Student Code
  const handleVerifyStudentCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = targetStudentCode.trim().toUpperCase();
    const matched = students.find(
      (s) => s.code.toUpperCase() === cleanCode || s.id.toUpperCase() === cleanCode || s.code.endsWith(cleanCode)
    );

    if (matched) {
      if (setSelectedStudentId) {
        setSelectedStudentId(matched.id);
      }
      setShowStudentCodeModal(false);
      changeRoleDirect(pendingStudentRole);
    } else {
      const sampleCodes = students.slice(0, 2).map((s) => s.code).join(', ');
      setStudentCodeError(`Không tìm thấy mã học sinh "${targetStudentCode}". Vui lòng thử lại${sampleCodes ? ` (Ví dụ: ${sampleCodes}...)` : ''}.`);
    }
  };

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            id="btn-open-sidebar"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="header-global-search"
              type="text"
              placeholder="Tìm nhanh học sinh, điểm số, sổ đầu bài, tổ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Real-time Auto-save & Sync Status */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium select-none"
            title="Mọi thao tác chỉnh sửa, điểm số, sơ đồ, thời khoá biểu được hệ thống tự động lưu & đồng bộ tức thì"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Tự động đồng bộ & Lưu</span>
          </div>
        </div>

        {/* Right: Role Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Edit Class button on header for GVCN */}
          {role === 'gvcn' && classInfo && (
            <button
              id="btn-header-class-info"
              type="button"
              onClick={onEditClass}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#003366] transition-colors"
              title="Nhấp để sửa thông tin lớp & niên khóa"
            >
              <School className="w-3.5 h-3.5 text-[#003366]" />
              <span>{classInfo?.className || 'Lớp 12A1'}</span>
              <Edit2 className="w-3 h-3 text-slate-400" />
            </button>
          )}
          {/* Quick AI Advisor trigger button */}
          <button
            id="btn-header-ai-advisor"
            onClick={onOpenAiAdvisor}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{role === 'bgh' ? 'Cố Vấn BGH AI' : 'AI Cố Vấn GVCN'}</span>
          </button>

          {/* Settings API Key button with red link text */}
          <button
            id="btn-header-gemini-key"
            onClick={onOpenGeminiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-all shadow-2xs cursor-pointer"
            title="Cấu hình Model & Gemini API Key cá nhân"
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-600">
              Lấy API key để sử dụng app
            </span>
          </button>

          {/* Student Selector when in Student or Parent mode */}
          {role !== 'gvcn' && role !== 'bgh' && (
            <div className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-200">
              <span className="text-[11px] font-bold text-blue-800 hidden sm:inline">
                {role === 'student' ? 'Mã HS:' : 'Con em:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPendingStudentRole(role as any);
                  setTargetStudentCode(selectedStudent?.code || students[0]?.code || '');
                  setStudentCodeError(null);
                  setShowStudentCodeModal(true);
                }}
                className="text-xs font-black text-[#003366] hover:underline flex items-center gap-1"
                title="Bấm để đổi mã số học sinh đăng nhập"
              >
                <span>{selectedStudent?.name} ({selectedStudent?.code})</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          )}

          {/* Role Switching Dropdown (RBAC Simulator) */}
          <div className="relative flex items-center gap-1.5">
            {role === 'gvcn' && teacherInfo && (
              <div
                onClick={onEditTeacher}
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                title="Bấm để chỉnh sửa hồ sơ & ảnh GVCN"
              >
                <img
                  src={teacherInfo.avatar}
                  alt={teacherInfo.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#003366]"
                />
                <span className="text-xs font-bold text-slate-800">{teacherInfo.name}</span>
                <Edit2 className="w-3 h-3 text-slate-500" />
              </div>
            )}

            {role === 'bgh' && bghInfo && (
              <div
                onClick={onEditBgh}
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 cursor-pointer hover:bg-amber-100 transition-colors"
                title="Bấm để chỉnh sửa hồ sơ & ảnh đại diện BGH"
              >
                <img
                  src={bghInfo.avatar}
                  alt={bghInfo.name}
                  className="w-6 h-6 rounded-full object-cover border border-amber-600"
                />
                <span className="text-xs font-bold text-amber-950">{bghInfo.name}</span>
                <Edit2 className="w-3 h-3 text-amber-700" />
              </div>
            )}

            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                role === 'gvcn'
                  ? 'bg-[#003366] text-white border-[#002244]'
                  : role === 'bgh'
                  ? 'bg-amber-500 text-[#003366] border-amber-600 font-extrabold'
                  : role === 'gvbm'
                  ? 'bg-indigo-700 text-white border-indigo-800 font-bold'
                  : role === 'csl'
                  ? 'bg-teal-700 text-white border-teal-800 font-bold'
                  : role === 'student'
                  ? 'bg-sky-600 text-white border-sky-700'
                  : 'bg-emerald-700 text-white border-emerald-800'
              }`}
            >
              {role === 'gvcn' ? (
                <ShieldCheck className="w-4 h-4 text-[#98FF98]" />
              ) : role === 'bgh' ? (
                <Landmark className="w-4 h-4 text-[#003366]" />
              ) : role === 'gvbm' ? (
                <GraduationCap className="w-4 h-4 text-indigo-200" />
              ) : role === 'csl' ? (
                <ClipboardCheck className="w-4 h-4 text-teal-200" />
              ) : role === 'student' ? (
                <User className="w-4 h-4 text-sky-200" />
              ) : (
                <HeartHandshake className="w-4 h-4 text-emerald-200" />
              )}
              <span className="hidden sm:inline">
                {role === 'gvcn'
                  ? `GVCN (${teacherInfo?.name || 'Quản trị'})`
                  : role === 'bgh'
                  ? `BGH (${bghInfo?.name || 'Thanh tra'})`
                  : role === 'gvbm'
                  ? 'GV Bộ Môn'
                  : role === 'csl'
                  ? 'Cán Sự Lớp'
                  : role === 'student'
                  ? 'Học sinh'
                  : 'Phụ huynh'}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div
                  id="role-dropdown-menu"
                  className="absolute right-0 top-full mt-2.5 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-80px)] overflow-y-auto"
                >
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-xs font-bold text-slate-800">
                      Chuyển đổi vai trò & Cơ chế bảo mật (RBAC)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Phân quyền nghiêm ngặt theo chuẩn Bộ Giáo Dục
                    </p>
                  </div>

                  {/* 1. GVCN */}
                  <button
                    id="select-role-gvcn"
                    type="button"
                    onClick={() => handleRoleSelect('gvcn')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-blue-50/80 transition-colors border-b border-slate-100 cursor-pointer ${
                      role === 'gvcn' ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#003366] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-[#98FF98]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#003366]">
                          1. Giáo viên chủ nhiệm (GVCN)
                        </span>
                        {role === 'gvcn' && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Quản trị học vụ toàn diện, xếp chỗ ngồi, nhập/sửa điểm số, tải file đề cương & giáo án
                      </p>
                    </div>
                  </button>

                  {/* 2. Ban Giám Hiệu */}
                  <button
                    id="select-role-bgh"
                    type="button"
                    onClick={() => handleRoleSelect('bgh')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-amber-50/80 transition-colors border-b border-slate-100 cursor-pointer ${
                      role === 'bgh' ? 'bg-amber-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-[#003366] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900">
                          2. Ban Giám Hiệu (BGH)
                        </span>
                        {role === 'bgh' && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Toàn quyền thanh tra, ký duyệt Sổ đầu bài & đơn phép; bảo toàn nguyên vẹn điểm số
                      </p>
                    </div>
                  </button>

                  {/* 3. Giáo viên Bộ Môn (GVBM) */}
                  <button
                    id="select-role-gvbm"
                    type="button"
                    onClick={() => handleRoleSelect('gvbm')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-indigo-50/80 transition-colors border-b border-slate-100 cursor-pointer ${
                      role === 'gvbm' ? 'bg-indigo-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <GraduationCap className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-900">
                          3. Giáo viên Bộ Môn (GVBM)
                        </span>
                        {role === 'gvbm' && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Nhập điểm môn phụ trách, ghi nhận Sổ đầu bài tiết dạy, chia sẻ học liệu & đề kiểm tra
                      </p>
                    </div>
                  </button>

                  {/* 4. Cán Sự Lớp (CSL) */}
                  <button
                    id="select-role-csl"
                    type="button"
                    onClick={() => handleRoleSelect('csl')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-teal-50/80 transition-colors border-b border-slate-100 cursor-pointer ${
                      role === 'csl' ? 'bg-teal-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <ClipboardCheck className="w-5 h-5 text-teal-200" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-teal-900">
                          4. Cán Sự Lớp (Lớp Trưởng / Tổ Trưởng)
                        </span>
                        {role === 'csl' && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Ủy quyền thay GVCN điểm danh chuyên cần, phân công trực nhật, ghi sổ đầu bài & chấm thi đua tổ
                      </p>
                    </div>
                  </button>

                  {/* 5. Học sinh */}
                  <button
                    id="select-role-student"
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-sky-50/80 transition-colors border-b border-slate-100 cursor-pointer ${
                      role === 'student' ? 'bg-sky-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <User className="w-5 h-5 text-sky-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-sky-900">
                          5. Học sinh (Đăng nhập theo Mã HS)
                        </span>
                        {role === 'student' && (
                          <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Data Isolation: Tải học liệu về máy, nộp bài kiểm tra/bài thi trực tuyến, xem điểm cá nhân
                      </p>
                    </div>
                  </button>

                  {/* 6. Phụ huynh */}
                  <button
                    id="select-role-parent"
                    type="button"
                    onClick={() => handleRoleSelect('parent')}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-emerald-50/80 transition-colors cursor-pointer ${
                      role === 'parent' ? 'bg-emerald-50 font-semibold' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <HeartHandshake className="w-5 h-5 text-emerald-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900">
                          6. Phụ huynh (Đăng nhập Mã HS con)
                        </span>
                        {role === 'parent' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Sổ liên lạc điện tử con em, xem bài nộp, gửi đơn nghỉ phép trực tuyến
                      </p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Reset Mock Data button */}
          <button
            id="btn-reset-data"
            onClick={onResetData}
            title="Khôi phục dữ liệu mẫu ban đầu"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast confirmation for RBAC switch */}
      {toastMsg && (
        <div className="mt-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          GVCN PASSWORD AUTHENTICATION MODAL (Password: 123456 - NOT revealed in UI)
          ========================================================================= */}
      {showGvcnAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-blue-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#003366] text-[#98FF98] flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Xác Thực Quyền Giáo Viên Chủ Nhiệm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vui lòng nhập mật khẩu quản trị học vụ để truy cập quyền Giáo viên chủ nhiệm{classInfo?.className ? ` ${classInfo.className}` : ''}.
              </p>
            </div>

            <form onSubmit={handleVerifyGvcnPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu GVCN:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showGvcnPasswordText ? 'text' : 'password'}
                    autoFocus
                    placeholder="Nhập mật khẩu..."
                    value={gvcnPassword}
                    onChange={(e) => {
                      setGvcnPassword(e.target.value);
                      if (gvcnAuthError) setGvcnAuthError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGvcnPasswordText(!showGvcnPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showGvcnPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {gvcnAuthError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {gvcnAuthError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGvcnAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-[#98FF98]" />
                  <span>Đăng Nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BGH PASSWORD AUTHENTICATION MODAL (Password: 123 - NOT revealed in UI)
          ========================================================================= */}
      {showBghAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-300 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Xác Thực Quyền Ban Giám Hiệu
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vui lòng nhập mật khẩu quản trị cấp trường để truy cập chế độ Thanh tra & Giám sát vĩ mô.
              </p>
            </div>

            <form onSubmit={handleVerifyBghPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu Ban Giám Hiệu:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showBghPasswordText ? 'text' : 'password'}
                    autoFocus
                    placeholder="Nhập mật khẩu..."
                    value={bghPassword}
                    onChange={(e) => {
                      setBghPassword(e.target.value);
                      if (bghAuthError) setBghAuthError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBghPasswordText(!showBghPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showBghPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {bghAuthError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {bghAuthError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBghAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Xác Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          GV BỘ MÔN PASSWORD AUTHENTICATION MODAL (Password: 2345)
          ========================================================================= */}
      {showGvbmAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-indigo-300 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mx-auto shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Xác Thực Giáo Viên Bộ Môn
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vui lòng nhập mật khẩu GV Bộ Môn để nhập điểm môn học, ghi nhận Sổ đầu bài tiết dạy và chia sẻ học liệu.
              </p>
            </div>

            <form onSubmit={handleVerifyGvbmPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu GV Bộ Môn:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showGvbmPasswordText ? 'text' : 'password'}
                    autoFocus
                    placeholder="Nhập mật khẩu..."
                    value={gvbmPassword}
                    onChange={(e) => {
                      setGvbmPassword(e.target.value);
                      if (gvbmAuthError) setGvbmAuthError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGvbmPasswordText(!showGvbmPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showGvbmPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {gvbmAuthError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {gvbmAuthError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGvbmAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Xác Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CÁN SỰ LỚP PASSWORD AUTHENTICATION MODAL (Password: 1234)
          ========================================================================= */}
      {showCslAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-teal-300 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-inner">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Xác Thực Cán Sự Lớp (Lớp Trưởng / Tổ Trưởng)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vui lòng nhập mật khẩu Ban Cán sự để thực hiện điểm danh chuyên cần, phân công trực nhật, ghi Sổ đầu bài và chấm điểm thi đua tổ.
              </p>
            </div>

            <form onSubmit={handleVerifyCslPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu Cán Sự Lớp:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCslPasswordText ? 'text' : 'password'}
                    autoFocus
                    placeholder="Nhập mật khẩu..."
                    value={cslPassword}
                    onChange={(e) => {
                      setCslPassword(e.target.value);
                      if (cslAuthError) setCslAuthError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCslPasswordText(!showCslPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showCslPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {cslAuthError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {cslAuthError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCslAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Xác Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDENT / PARENT CODE LOGIN MODAL
          ========================================================================= */}
      {showStudentCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto shadow-inner">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Đăng Nhập {pendingStudentRole === 'student' ? 'Học Sinh' : 'Phụ Huynh'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập Mã số học sinh trong danh sách{classInfo?.className ? ` ${classInfo.className}` : ''} để thực thi cơ chế Cô lập Dữ liệu (Data Isolation).
              </p>
            </div>

            <form onSubmit={handleVerifyStudentCode} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã số học sinh{students.length >= 2 ? (
                    <> (VD: <span className="font-mono text-blue-700">{students[0].code}</span> hoặc <span className="font-mono text-blue-700">{students[1].code}</span>):</>
                  ) : (
                    <> (VD: <span className="font-mono text-blue-700">HS-01</span>):</>
                  )}
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Nhập mã định danh học sinh..."
                  value={targetStudentCode}
                  onChange={(e) => {
                    setTargetStudentCode(e.target.value);
                    if (studentCodeError) setStudentCodeError(null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                {studentCodeError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {studentCodeError}
                  </p>
                )}
              </div>

              {/* Quick Pick Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Hoặc chọn nhanh từ danh sách {students.length} học sinh:
                </label>
                <select
                  value={targetStudentCode}
                  onChange={(e) => setTargetStudentCode(e.target.value)}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name} (Tổ {s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentCodeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
