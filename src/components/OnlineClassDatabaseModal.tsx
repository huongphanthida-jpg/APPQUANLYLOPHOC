import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Video,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  Zap,
  BookOpen,
  Calendar,
  Clock,
  User,
  FileSpreadsheet,
  Copy,
} from 'lucide-react';
import { OnlineClass, OnlineClassSheetConfig, UserRole } from '../types';
import {
  fetchOnlineClassesFromGoogleSheet,
  getGoogleSheetCsvUrl,
  SAMPLE_ONLINE_CLASS_SHEET_URL,
} from '../utils/googleSheetSync';

interface OnlineClassDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineClasses: OnlineClass[];
  onSaveOnlineClasses: (classes: OnlineClass[], config?: OnlineClassSheetConfig) => void;
  initialConfig?: OnlineClassSheetConfig;
  role?: UserRole;
}

export const OnlineClassDatabaseModal: React.FC<OnlineClassDatabaseModalProps> = ({
  isOpen,
  onClose,
  onlineClasses,
  onSaveOnlineClasses,
  initialConfig,
  role = 'gvcn',
}) => {
  const [sheetUrl, setSheetUrl] = useState(initialConfig?.sheetUrl || '');
  const [autoSync, setAutoSync] = useState(initialConfig?.autoSync ?? true);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [classList, setClassList] = useState<OnlineClass[]>(onlineClasses);
  const [parsedFromSheet, setParsedFromSheet] = useState<OnlineClass[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');

  // Manual Add/Edit Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<OnlineClass>>({
    className: '',
    subject: 'Toán Học',
    teacherName: 'Thầy Nguyễn Văn An (GVCN)',
    scheduleTime: 'Tối Thứ 2 & Thứ 5 (19:30 - 21:00)',
    platform: 'Google Meet',
    meetLink: '',
    passcode: '',
    status: 'upcoming',
    notes: '',
  });

  useEffect(() => {
    setClassList(onlineClasses);
  }, [onlineClasses]);

  useEffect(() => {
    if (initialConfig?.sheetUrl) {
      setSheetUrl(initialConfig.sheetUrl);
    }
  }, [initialConfig]);

  if (!isOpen) return null;

  const isTeacherOrAdmin = role === 'gvcn' || role === 'bgh' || role === 'gvbm';

  // Fetch online classes from Google Sheet URL
  const handleFetchSheet = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || sheetUrl;
    if (!urlToFetch.trim()) {
      setErrorMessage('Vui lòng nhập đường dẫn Google Sheet.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const fetchedClasses = await fetchOnlineClassesFromGoogleSheet(urlToFetch);
      setParsedFromSheet(fetchedClasses);
      setSuccessMessage(
        `Kết nối thành công! Đã tải ${fetchedClasses.length} lớp học trực tuyến từ Google Sheet.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối tới Google Sheet.');
      setParsedFromSheet([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSample = () => {
    setSheetUrl(SAMPLE_ONLINE_CLASS_SHEET_URL);
    handleFetchSheet(SAMPLE_ONLINE_CLASS_SHEET_URL);
  };

  // Commit Google Sheet sync to current list
  const handleCommitSheetSync = () => {
    if (parsedFromSheet.length === 0) {
      setErrorMessage('Chưa có dữ liệu trích xuất từ Google Sheet để đồng bộ.');
      return;
    }

    let updated: OnlineClass[] = [];
    if (importMode === 'replace') {
      updated = [...parsedFromSheet];
    } else {
      // Merge by ID or ClassName
      const existingMap = new Map(classList.map((c) => [c.className.toLowerCase(), c]));
      parsedFromSheet.forEach((item) => {
        existingMap.set(item.className.toLowerCase(), item);
      });
      updated = Array.from(existingMap.values());
    }

    const config: OnlineClassSheetConfig = {
      sheetUrl: sheetUrl.trim(),
      autoSync,
      lastSyncedAt: new Date().toLocaleString('vi-VN'),
      syncStatus: 'success',
      syncedCount: updated.length,
    };

    setClassList(updated);
    onSaveOnlineClasses(updated, config);
    setSuccessMessage(`Đã đồng bộ thành công ${updated.length} lớp học trực tuyến vào hệ thống DẠ HƯƠNG 2026-2027.`);
    setParsedFromSheet([]);
  };

  // Save manual Add/Edit
  const handleSaveManualForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className?.trim()) return;

    if (editingId) {
      const updated = classList.map((c) =>
        c.id === editingId ? ({ ...c, ...formData } as OnlineClass) : c
      );
      setClassList(updated);
      onSaveOnlineClasses(updated);
    } else {
      const newClass: OnlineClass = {
        id: `oc-manual-${Date.now()}`,
        className: formData.className || 'Lớp Trực Tuyến Mới',
        subject: formData.subject || 'Toán Học',
        teacherName: formData.teacherName || 'Giáo viên phụ trách',
        scheduleTime: formData.scheduleTime || 'Lịch học tự do',
        platform: formData.platform || 'Google Meet',
        meetLink: formData.meetLink || 'https://meet.google.com',
        passcode: formData.passcode || '',
        status: formData.status || 'upcoming',
        notes: formData.notes || '',
        documentUrl: formData.documentUrl || '',
        lastSyncedAt: new Date().toLocaleString('vi-VN'),
      };
      const updated = [newClass, ...classList];
      setClassList(updated);
      onSaveOnlineClasses(updated);
    }

    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      className: '',
      subject: 'Toán Học',
      teacherName: 'Thầy Nguyễn Văn An (GVCN)',
      scheduleTime: 'Tối Thứ 2 & Thứ 5 (19:30 - 21:00)',
      platform: 'Google Meet',
      meetLink: '',
      passcode: '',
      status: 'upcoming',
      notes: '',
    });
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lớp học trực tuyến này?')) {
      const updated = classList.filter((c) => c.id !== id);
      setClassList(updated);
      onSaveOnlineClasses(updated);
    }
  };

  const handleEditClick = (c: OnlineClass) => {
    setEditingId(c.id);
    setFormData(c);
    setShowAddForm(true);
  };

  // Filtered List
  const filteredClasses = classList.filter((c) => {
    const matchesSearch =
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003366] via-blue-900 to-[#002244] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
              <Video className="w-6 h-6 animate-pulse text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded">
                  DATABASE GOOGLE SHEETS
                </span>
                <span className="text-xs text-slate-300 font-semibold">DẠ HƯƠNG 2026-2027</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Cơ Sở Dữ Liệu Danh Sách Lớp Học Trực Tuyến
              </h2>
              <p className="text-xs text-slate-300">
                Đồng bộ realtime danh sách phòng học Google Meet, Zoom, MS Teams từ Google Sheet vào ứng dụng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Google Sheet Sync Form */}
          {isTeacherOrAdmin && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-sm font-bold text-[#003366]">
                    Kết Nối & Đồng Bộ Từ Bảng Tính Google Sheet
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Điền đường dẫn Google Sheet mẫu để chạy thử ngay"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Dùng Google Sheet Mẫu 1-Click</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="Dán liên kết Google Sheet công khai (e.g. https://docs.google.com/spreadsheets/d/...)"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchSheet()}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Đang Tải...' : 'Tải Dữ Liệu'}</span>
                </button>
              </div>

              {/* Mode Selection & Commit button if parsed */}
              {parsedFromSheet.length > 0 && (
                <div className="pt-2 border-t border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span>Chế độ đồng bộ:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-[#003366]"
                      />
                      <span>Hợp nhất (Merge)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-[#003366]"
                      />
                      <span>Ghi đè tất cả (Replace)</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleCommitSheetSync}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Lưu Đồng Bộ ({parsedFromSheet.length} Lớp)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 2: Online Class Database Header & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Danh Sách Lớp Học Trực Tuyến ({filteredClasses.length})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                Live DB
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm môn, giáo viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      className: '',
                      subject: 'Toán Học',
                      teacherName: 'Thầy Nguyễn Văn An (GVCN)',
                      scheduleTime: 'Tối Thứ 2 & Thứ 5 (19:30 - 21:00)',
                      platform: 'Google Meet',
                      meetLink: '',
                      passcode: '',
                      status: 'upcoming',
                      notes: '',
                    });
                    setShowAddForm(!showAddForm);
                  }}
                  className="px-3 py-1.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Lớp Mới</span>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({classList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'live'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Đang diễn ra ({classList.filter((c) => c.status === 'live').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Sắp diễn ra ({classList.filter((c) => c.status === 'upcoming').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ended')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'ended'
                  ? 'bg-slate-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Hoàn thành ({classList.filter((c) => c.status === 'ended').length})
            </button>
          </div>

          {/* Section 3: Add / Edit Manual Class Form */}
          {showAddForm && isTeacherOrAdmin && (
            <form
              onSubmit={handleSaveManualForm}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-black uppercase text-[#003366]">
                  {editingId ? 'Chỉnh Sửa Lớp Học Trực Tuyến' : 'Thêm Mới Lớp Học Trực Tuyến'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Lớp / Môn Học *</label>
                  <input
                    type="text"
                    required
                    value={formData.className || ''}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="e.g. Toán 12A1 - Luyện đề THPT QG"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giáo Viên Phụ Trách</label>
                  <input
                    type="text"
                    value={formData.teacherName || ''}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    placeholder="e.g. Thầy Nguyễn Văn An (GVCN)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn Học</label>
                  <select
                    value={formData.subject || 'Toán Học'}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Toán Học">Toán Học</option>
                    <option value="Vật Lý">Vật Lý</option>
                    <option value="Hóa Học">Hóa Học</option>
                    <option value="Sinh Học">Sinh Học</option>
                    <option value="Ngữ Văn">Ngữ Văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Sinh Hoạt Lớp">Sinh Hoạt Lớp</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nền Tảng Phụ Trách</label>
                  <select
                    value={formData.platform || 'Google Meet'}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value as any })
                    }
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="MS Teams">MS Teams</option>
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="K12Online">K12Online</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Link Tham Gia Lớp *</label>
                  <input
                    type="url"
                    required
                    value={formData.meetLink || ''}
                    onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian / Lịch Học</label>
                  <input
                    type="text"
                    value={formData.scheduleTime || ''}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    placeholder="e.g. Tối Thứ 2 & Thứ 5 (19:30 - 21:00)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Phòng / Passcode</label>
                  <input
                    type="text"
                    value={formData.passcode || ''}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    placeholder="e.g. ID: 987 654 3210 | Pass: 123456"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng Thái Lớp</label>
                  <select
                    value={formData.status || 'upcoming'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="live">🔴 Đang diễn ra (Live)</option>
                    <option value="upcoming">🟡 Sắp diễn ra (Upcoming)</option>
                    <option value="ended">⚪ Hoàn thành (Ended)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Học Sinh</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Chuẩn bị đề số 8 và máy tính fx-580VN"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Cập Nhật' : 'Lưu Lớp Mới'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Section 4: Class Cards Grid */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Chưa có lớp học trực tuyến nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Nhấn "Tải Dữ Liệu" từ Google Sheet hoặc bấm "Tạo Lớp Mới" để thêm lớp học.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.status === 'live'
                      ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-emerald-300 shadow-md ring-2 ring-emerald-400/30'
                      : item.status === 'upcoming'
                      ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Subject badge & Platform badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-blue-100 text-[#003366] px-2.5 py-0.5 rounded-lg">
                          {item.subject}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {item.platform}
                        </span>
                      </div>

                      {item.status === 'live' ? (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          ĐANG DIỄN RA
                        </span>
                      ) : item.status === 'upcoming' ? (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                          SẮP DIỄN RA
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          HOÀN THÀNH
                        </span>
                      )}
                    </div>

                    {/* Class Name */}
                    <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                      {item.className}
                    </h3>

                    {/* Teacher & Schedule Info */}
                    <div className="space-y-1 text-xs text-slate-600 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{item.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.scheduleTime}</span>
                      </div>
                      {item.passcode && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{item.passcode}</span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 italic bg-slate-100/70 p-2 rounded-xl mt-1 border border-slate-200/60">
                          📌 {item.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <a
                      href={item.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                        item.status === 'live'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-pulse'
                          : 'bg-[#003366] hover:bg-[#002244] text-white'
                      }`}
                    >
                      <Video className="w-4 h-4 text-emerald-300" />
                      <span>Vào Lớp Trực Tuyến</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    {isTeacherOrAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin lớp"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa lớp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">
            DẠ HƯƠNG 2026-2027 • Hệ thống kết nối lớp học trực tuyến Google Sheets 24/7
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
