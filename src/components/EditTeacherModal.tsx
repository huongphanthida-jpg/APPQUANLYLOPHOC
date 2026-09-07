import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UserCheck,
  Upload,
  Link2,
  Sparkles,
  Check,
  RotateCcw,
  Phone,
  Mail,
  BookOpen,
  Award,
  Clock,
  Quote,
  ShieldCheck
} from 'lucide-react';
import { TeacherInfo } from '../types';
import { INITIAL_TEACHER_INFO, PRESET_TEACHER_AVATARS } from '../data/mockData';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherInfo: TeacherInfo;
  onSave: (updated: TeacherInfo) => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacherInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<TeacherInfo>({ ...teacherInfo });
  const [avatarTab, setAvatarTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...teacherInfo });
      setErrorMsg(null);
    }
  }, [isOpen, teacherInfo]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WebP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh tối đa là 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn URL hình ảnh chân dung!');
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: customUrl.trim() }));
    setErrorMsg(null);
    setCustomUrl('');
  };

  const handleResetToDefault = () => {
    setFormData({ ...INITIAL_TEACHER_INFO });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Họ và tên Giáo viên chủ nhiệm không được để trống!');
      return;
    }

    onSave(formData);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 600);
  };

  return (
    <div
      id="edit-teacher-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#002850] to-[#001f3f] text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#98FF98]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#98FF98] bg-[#98FF98]/15 px-2.5 py-0.5 rounded">
                Hồ Sơ Giáo Viên Chủ Nhiệm
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Chỉnh Sửa Tên & Hình Đại Diện GVCN
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Preview Teacher Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar}
                alt="Teacher Portrait Preview"
                className="w-20 h-20 rounded-full object-cover border-3 border-[#003366] shadow-md bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = INITIAL_TEACHER_INFO.avatar;
                }}
              />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-extrabold bg-[#003366] text-[#98FF98] px-2 py-0.5 rounded-full border border-white shadow-xs">
                GVCN
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left overflow-hidden">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-black text-slate-900 truncate">
                  {formData.name || 'Thầy Nguyễn Văn An'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {formData.subject || 'Toán Học'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {formData.title || 'Thạc sĩ Toán học - GVCN 12A1'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-500 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                  {formData.positionType || 'Chính Nhiệm'}
                </span>
                {formData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#003366]" />
                    {formData.phone}
                  </span>
                )}
                {formData.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#003366]" />
                    {formData.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Teacher Avatar Chooser */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              1. Hình Đại Diện / Ảnh Chân Dung GVCN
            </label>

            {/* Avatar Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bộ Chân Dung Mẫu</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'upload'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Ảnh Từ Máy</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'url'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Nhập URL</span>
              </button>
            </div>

            {/* Presets View */}
            {avatarTab === 'presets' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                {PRESET_TEACHER_AVATARS.map((preset) => {
                  const isSelected = formData.avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, avatar: preset.url }));
                        setErrorMsg(null);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-1.5 bg-white flex flex-col items-center gap-1 text-center ${
                        isSelected
                          ? 'border-[#003366] ring-2 ring-[#003366]/20 shadow-md'
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-14 h-14 object-cover rounded-full group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-semibold text-slate-700 leading-tight truncate w-full px-0.5">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#003366] text-[#98FF98] flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Upload Tab */}
            {avatarTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="teacher-avatar-upload"
                />
                <label
                  htmlFor="teacher-avatar-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#003366] flex items-center justify-center shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Nhấp để chọn ảnh chân dung hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hỗ trợ PNG, JPG, WebP (tối đa 5MB)
                    </p>
                  </div>
                  <span className="mt-1 px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-xs hover:bg-[#002244] transition-all">
                    Chọn ảnh chân dung
                  </span>
                </label>
              </div>
            )}

            {/* URL Tab */}
            {avatarTab === 'url' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... hoặc liên kết ảnh chân dung"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-colors shrink-0"
                >
                  Áp Dụng
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Teacher Information Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              2. Thông Tin Giáo Viên Chủ Nhiệm
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và Tên GVCN <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thầy Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chức Danh & Học Vị:
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Thạc sĩ Toán học - GVCN Lớp 12A1"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Môn Giảng Dạy Chuyên Trách:
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Toán Học, Vật Lý, Hóa Học..."
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Điện Thoại Liên Hệ:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912.345.678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hòm Thư Điện Tử (Email):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Ví dụ: nguyenvanan.gv@tnh.edu.vn"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Chế Độ Nhiệm Vụ GVCN (Hiển thị góc thẻ GVCN) <span className="text-blue-600">*</span>:
                  </label>
                  <span className="text-[11px] text-slate-500">Chọn mẫu hoặc tự nhập</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Chính Nhiệm',
                    'Kiêm Nhiệm',
                    'Phụ Trách Lớp',
                    'Tập Sự',
                    'Đặc Phái',
                  ].map((presetPos) => (
                    <button
                      key={presetPos}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, positionType: presetPos }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        (formData.positionType || 'Chính Nhiệm') === presetPos
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      {presetPos}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: Chính Nhiệm, Kiêm Nhiệm, Phụ Trách..."
                  value={formData.positionType || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, positionType: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời Gian Tiếp Phụ Huynh / Học Sinh:
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Thứ 2 - Thứ 6 (16:30 - 17:45)"
                    value={formData.officeHours || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, officeHours: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới Thiệu & Lời Nhắn Gửi Sư Phạm:
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Thạc sĩ Phương pháp Giảng dạy Toán học. Tổ phó chuyên môn Toán. Luôn đồng hành cùng các em học sinh..."
                    value={formData.bio || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-xl p-3">
              {errorMsg}
            </p>
          )}

          {/* Success Toast */}
          {successToast && (
            <p className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu thành công thông tin và hình đại diện Giáo viên chủ nhiệm!</span>
            </p>
          )}
        </form>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
            <span className="sm:hidden">Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md transition-all"
            >
              <Check className="w-4 h-4 text-[#98FF98]" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
