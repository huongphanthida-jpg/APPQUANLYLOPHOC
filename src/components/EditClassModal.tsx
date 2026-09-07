import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  School,
  Upload,
  Link2,
  Sparkles,
  Check,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Quote,
  Image as ImageIcon
} from 'lucide-react';
import { ClassInfo } from '../types';
import { INITIAL_CLASS_INFO, PRESET_CLASS_AVATARS } from '../data/mockData';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onSave: (updated: ClassInfo) => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<ClassInfo>({ ...classInfo });
  const [avatarTab, setAvatarTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...classInfo });
      setErrorMsg(null);
    }
  }, [isOpen, classInfo]);

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
      setErrorMsg('Vui lòng nhập đường dẫn URL hình ảnh!');
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: customUrl.trim() }));
    setErrorMsg(null);
    setCustomUrl('');
  };

  const handleResetToDefault = () => {
    setFormData({ ...INITIAL_CLASS_INFO });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className.trim()) {
      setErrorMsg('Tên lớp không được để trống!');
      return;
    }
    if (!formData.schoolName.trim()) {
      setErrorMsg('Tên trường không được để trống!');
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
      id="edit-class-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#002850] to-[#001f3f] text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <School className="w-6 h-6 text-[#98FF98]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#98FF98] bg-[#98FF98]/15 px-2.5 py-0.5 rounded">
                Cài Đặt & Điều Chỉnh
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Chỉnh Sửa Thông Tin & Hình Đại Diện Lớp
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
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar}
                alt="Class Avatar Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#003366] shadow-md bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = INITIAL_CLASS_INFO.avatar;
                }}
              />
              <span className="absolute -bottom-2 -right-1 text-[9px] font-extrabold bg-[#003366] text-[#98FF98] px-2 py-0.5 rounded-full border border-white shadow-xs">
                Xem trước
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                {formData.schoolName || 'THPT TRẦN NGUYÊN HÃN'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 truncate">
                {formData.className || 'LỚP 12A1 (KHTN)'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {formData.academicYear || 'Niên khóa 2023 - 2026'} • {formData.roomName || 'Phòng 302'}
              </p>
              {formData.slogan && (
                <p className="text-xs text-slate-600 italic mt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <Quote className="w-3 h-3 text-[#003366] shrink-0" />
                  <span>"{formData.slogan}"</span>
                </p>
              )}
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  {formData.streamBadge || 'Chuyên ban KHTN'}
                </span>
                {formData.specialization && (
                  <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                    {formData.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Avatar Chooser */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              1. Hình Đại Diện Lớp Học (Class Avatar / Emblem)
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
                <span>Bộ Huy Hiệu & Ảnh Mẫu</span>
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
                {PRESET_CLASS_AVATARS.map((preset) => {
                  const isSelected = formData.avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, avatar: preset.url }));
                        setErrorMsg(null);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white flex flex-col items-center gap-1 text-center ${
                        isSelected
                          ? 'border-[#003366] ring-2 ring-[#003366]/20 shadow-md'
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 object-cover rounded-xl group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-semibold text-slate-700 leading-tight truncate w-full px-1">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#003366] text-[#98FF98] flex items-center justify-center shadow-xs">
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
                  id="class-avatar-upload"
                />
                <label
                  htmlFor="class-avatar-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#003366] flex items-center justify-center shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Nhấp để chọn ảnh hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hỗ trợ PNG, JPG, WebP, GIF (tối đa 5MB)
                    </p>
                  </div>
                  <span className="mt-1 px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-xs hover:bg-[#002244] transition-all">
                    Chọn tệp hình ảnh
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
                    placeholder="https://images.unsplash.com/... hoặc link ảnh online"
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

          {/* Section 2: Class Information Form Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              2. Thông Tin Chi Tiết Lớp Học
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Lớp Học <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: LỚP 12A1 (KHTN)"
                    value={formData.className}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, className: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Trường Học <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: THPT TRẦN NGUYÊN HÃN"
                    value={formData.schoolName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, schoolName: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Niên Khóa Đào Tạo:
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Niên khóa 2023 - 2026"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, academicYear: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phòng Học & Vị Trí:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Phòng 302 - Tầng 3 Nhà A"
                    value={formData.roomName || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, roomName: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Nhãn Chuyên Ban (Hiển thị góc thẻ lớp) <span className="text-emerald-600">*</span>:
                  </label>
                  <span className="text-[11px] text-slate-500">Chọn mẫu hoặc tự nhập</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Chuyên ban KHTN',
                    'Chuyên ban KHXH',
                    'Chuyên Toán - Lý',
                    'Chuyên Tin Học',
                    'Ban Cơ Bản',
                    'Chuyên Ngoại Ngữ',
                    'Tự Nhiên D01',
                  ].map((presetBadge) => (
                    <button
                      key={presetBadge}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, streamBadge: presetBadge }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        (formData.streamBadge || 'Chuyên ban KHTN') === presetBadge
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {presetBadge}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyên ban KHTN, Ban Khoa Học Tự Nhiên..."
                  value={formData.streamBadge || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, streamBadge: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô Tả Chuyên Ban / Tổ Hợp Môn Chi Tiết:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyên ban Khoa học Tự nhiên (Toán - Lý - Hóa - Sinh)"
                  value={formData.specialization || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, specialization: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khẩu Hiệu / Slogan Lớp Học:
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT 2026"
                    value={formData.slogan || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slogan: e.target.value }))
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
              <span>Đã lưu thành công thông tin và hình đại diện Lớp học!</span>
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
