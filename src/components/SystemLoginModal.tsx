import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  School,
  GraduationCap,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Users,
} from 'lucide-react';
import { UserRole, ClassInfo, TeacherInfo, Student } from '../types';

interface SystemLoginModalProps {
  isOpen: boolean;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  students?: Student[];
  currentRole: UserRole;
  onLoginSuccess: (role: UserRole, remember: boolean, selectedStudentId?: string) => void;
}

export const SystemLoginModal: React.FC<SystemLoginModalProps> = ({
  isOpen,
  classInfo,
  teacherInfo,
  students = [],
  currentRole,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'gvcn');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  if (!isOpen) return null;

  const className = classInfo?.className || 'LỚP 11D5';
  const schoolName = classInfo?.schoolName || 'THPT TRẦN NGUYÊN HÃN';
  const teacherName = teacherInfo?.name || 'Cô Phan Thị Dạ Hương';

  // Preset role passwords
  const ROLE_PASSWORDS: Record<UserRole, string[]> = {
    gvcn: ['123456', 'dahuong2027', 'admin'],
    bgh: ['admin123', '123456', 'bgh2027'],
    gvbm: ['123456', 'gvbm2027'],
    csl: ['123456', 'csl2027'],
    student: ['123456', 'student'],
    parent: ['123456', 'parent'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // General master pass '123456' unlocks any role
    const validPasses = ROLE_PASSWORDS[selectedRole] || ['123456'];
    const trimmedPass = password.trim();

    if (selectedRole === 'student' || selectedRole === 'parent') {
      if (trimmedPass === '' || validPasses.includes(trimmedPass)) {
        onLoginSuccess(selectedRole, rememberMe, selectedStudentId);
        return;
      }
    }

    if (validPasses.includes(trimmedPass) || trimmedPass === '123456') {
      onLoginSuccess(selectedRole, rememberMe, selectedStudentId);
    } else {
      setErrorMessage('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-[#002244] p-6 text-white text-center space-y-2">
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
            <ShieldCheck className="w-3 h-3" />
            Bảo Mật Hệ Thống
          </div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>

          <div>
            <span className="text-[11px] font-black tracking-widest text-blue-200 uppercase">
              {schoolName}
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">{className}</h2>
            <p className="text-xs text-blue-200 font-medium">GVCN: {teacherName}</p>
          </div>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role Switcher Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Chọn Vai Trò Đăng Nhập:
            </label>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('gvcn');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'gvcn'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                GVCN
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('bgh');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'bgh'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                BGH
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('csl');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'csl'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                }`}
              >
                Cán Sự Lớp
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('gvbm');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'gvbm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                GV Môn
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('student');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'student'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                Học Sinh
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('parent');
                  setErrorMessage(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === 'parent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                Phụ Huynh
              </button>
            </div>
          </div>

          {/* Student selection dropdown if role is student or parent */}
          {(selectedRole === 'student' || selectedRole === 'parent') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                {selectedRole === 'student' ? 'Chọn Tên Học Sinh:' : 'Học Sinh Con Em:'}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Tổ {s.group} - Mã: {s.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Mật Khẩu Hệ Thống:
              </span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Remember me & Submit button */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Duy trì đăng nhập trên thiết bị này</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-[#003366] hover:from-blue-800 hover:to-[#002244] text-white text-sm font-black shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>ĐĂNG NHẬP KHỞI ĐỘNG HỆ THỐNG</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
