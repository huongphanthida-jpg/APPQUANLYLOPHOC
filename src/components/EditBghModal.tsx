import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Landmark,
  Upload,
  Link2,
  Sparkles,
  Check,
  RotateCcw,
  Phone,
  Mail,
  Building2,
  Award,
  Shield,
  FileText,
  Camera,
} from 'lucide-react';
import { BghInfo } from '../types';
import { INITIAL_BGH_INFO, PRESET_BGH_AVATARS } from '../data/mockData';

interface EditBghModalProps {
  isOpen: boolean;
  onClose: () => void;
  bghInfo: BghInfo;
  onSave: (updated: BghInfo) => void;
}

export const EditBghModal: React.FC<EditBghModalProps> = ({
  isOpen,
  onClose,
  bghInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<BghInfo>({ ...bghInfo });
  const [avatarTab, setAvatarTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...bghInfo });
      setErrorMsg(null);
    }
  }, [isOpen, bghInfo]);

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
      setErrorMsg('Vui lòng nhập đường dẫn URL hình ảnh chân dung BGH!');
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: customUrl.trim() }));
    setErrorMsg(null);
    setCustomUrl('');
  };

  const handleResetToDefault = () => {
    setFormData({ ...INITIAL_BGH_INFO });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Họ và tên thành viên Ban Giám Hiệu không được để trống!');
      return;
    }

    onSave(formData);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 600);
  };

  const presetRoles = [
    'Hiệu Trưởng',
    'Phó Hiệu Trưởng',
    'Chủ Tịch Hội Đồng Trường',
    'Trưởng Ban Thanh Tra',
    'Thành Viên BGH',
    'Cố Vấn Ban Giám Hiệu',
  ];

  return (
    <div
      id="edit-bgh-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-[#003366] text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Landmark className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 bg-amber-900/40 px-2.5 py-0.5 rounded border border-amber-300/30">
                Hồ Sơ Ban Giám Hiệu
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Chỉnh Sửa Thông Tin & Ảnh Đại Diện BGH
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Preview BGH Profile Card */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-amber-500 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = INITIAL_BGH_INFO.avatar;
                }}
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-amber-600 text-white p-1 rounded-full shadow border-2 border-white">
                <Landmark className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-[#003366] font-extrabold uppercase">
                  {formData.dutyRole || 'Ban Giám Hiệu'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formData.department || 'Ban Giám Hiệu - Trường THPT Trần Nguyên Hãn'}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {formData.name || 'TS. Lê Thị Mai'}
              </h3>
              <p className="text-xs text-amber-900 font-bold mt-0.5">
                {formData.title || 'Phó Hiệu Trưởng - Phụ trách Khối 12'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-600 mt-1.5">
                {formData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-700" />
                    <strong>{formData.phone}</strong>
                  </span>
                )}
                {formData.office && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-700" />
                    <span>{formData.office}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Selection & Upload Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Ảnh Đại Diện Chân Dung BGH
            </label>

            {/* Tab navigation for avatar */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  avatarTab === 'presets'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ảnh Chân Dung Mẫu
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  avatarTab === 'upload'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tải Ảnh Lên Từ Máy
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  avatarTab === 'url'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đường Dẫn URL
              </button>
            </div>

            {/* Presets Grid */}
            {avatarTab === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {PRESET_BGH_AVATARS.map((preset) => {
                  const isSelected = formData.avatar === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.url }))}
                      className={`relative flex items-center gap-2.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">
                          {preset.label}
                        </p>
                        <span className="text-[10px] text-slate-500">Chân dung chuẩn</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Tab */}
            {avatarTab === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Nhấp để tải ảnh chân dung BGH từ máy tính/điện thoại
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hỗ trợ PNG, JPG, JPEG, WebP (Tối đa 5MB)
                </p>
              </div>
            )}

            {/* Custom URL Tab */}
            {avatarTab === 'url' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://example.com/anh-dai-dien-bgh.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Áp Dụng
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên Lãnh Đạo BGH <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: TS. Lê Thị Mai, ThS. Nguyễn Văn Bình..."
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chức Vụ & Danh Xưng Chi Tiết <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phó Hiệu Trưởng - Phụ trách Khối 12 & Chuyên môn KHTN..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Chức danh nhiệm vụ BGH */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Chức Danh Nhiệm Vụ (Hiển thị nhãn BGH) <span className="text-amber-600">*</span>:
                </label>
                <span className="text-[11px] text-slate-500">Chọn nhanh hoặc tự nhập</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {presetRoles.map((roleTag) => (
                  <button
                    key={roleTag}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, dutyRole: roleTag }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      (formData.dutyRole || 'Phó Hiệu Trưởng') === roleTag
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {roleTag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ví dụ: Hiệu Trưởng, Phó Hiệu Trưởng, Trưởng Ban Thanh Tra..."
                value={formData.dutyRole || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, dutyRole: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điện Thoại / Hotline Công Vụ:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="0903.888.999"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Công Vụ:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="lethimai.bgh@tnh.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phòng Làm Việc / Trụ Sở:
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Phòng BGH - Tầng 2 Nhà Hiệu Bộ"
                  value={formData.office || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, office: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đơn Vị Trực Thuộc:
              </label>
              <input
                type="text"
                placeholder="Ban Giám Hiệu - Hội đồng Sư phạm"
                value={formData.department || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới Thiệu & Trọng Tâm Chỉ Đạo:
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả quá trình công tác, chuyên môn và các chỉ đạo trọng tâm trong năm học..."
                value={formData.bio || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mặc Định</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                id="btn-save-bgh-info"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                {successToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Lưu!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu Thông Tin BGH</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
