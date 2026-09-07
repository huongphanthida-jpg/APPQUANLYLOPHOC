import React, { useState, useRef } from 'react';
import {
  Settings,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  ArrowDownToLine,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Building2,
  User,
  GraduationCap,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
  FolderOpen,
  LayoutGrid,
  CalendarDays,
  Wand2,
  Award,
  BookOpen,
  Globe,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Student,
  UserRole,
  ClassInfo,
  TeacherInfo,
  BghInfo,
  GoogleSheetConfig,
} from '../types';
import { ConfirmModal } from './ConfirmModal';
import { Video } from 'lucide-react';

interface SettingsViewProps {
  role: UserRole;
  students: Student[];
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  bghInfo?: BghInfo;
  onEditClass: () => void;
  onEditTeacher: () => void;
  onEditBgh: () => void;
  onOpenImportStudents: () => void;
  onOpenImportGrades: () => void;
  onOpenFontRepair: () => void;
  onResetMaterials: () => void;
  onResetSeatingChart: () => void;
  onResetTimetable?: () => void;
  onRestoreDefaultStudents?: () => void;
  onOpenGoogleSheetSync?: () => void;
  onOpenOnlineClassModal?: () => void;
  googleSheetConfig?: GoogleSheetConfig;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  role,
  students,
  classInfo,
  teacherInfo,
  bghInfo,
  onEditClass,
  onEditTeacher,
  onEditBgh,
  onOpenImportStudents,
  onOpenImportGrades,
  onOpenFontRepair,
  onResetMaterials,
  onResetSeatingChart,
  onResetTimetable,
  onRestoreDefaultStudents,
  onOpenGoogleSheetSync,
  onOpenOnlineClassModal,
  googleSheetConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'config' | 'maintenance'>('files');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // In-app Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Xác Nhận',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentClassName = classInfo?.className || 'Lớp Học';
  const safeClassName = currentClassName.replace(/[^a-zA-Z0-9]/g, '_');

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================

  // 1. Export Academic Gradebook (Excel/CSV)
  const handleExportGradeBook = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const headers = [
      'STT',
      'Mã HS',
      'Họ và Tên',
      'Tổ',
      'Toán TX1',
      'Toán TX2',
      'Toán GK',
      'Toán CK',
      'Toán TB',
      'Lý TB',
      'Hóa TB',
      'Sinh TB',
      'Văn TB',
      'Anh TB',
      'GPA Tự Nhiên',
      'Hạnh Kiểm',
      'Xếp Loại Học Lực',
    ];

    const data = students.map((s, idx) => ({
      'STT': idx + 1,
      'Mã HS': s.code,
      'Họ và Tên': s.name,
      'Tổ': s.group,
      'Toán TX1': s.grades.math.tx1,
      'Toán TX2': s.grades.math.tx2,
      'Toán GK': s.grades.math.gk,
      'Toán CK': s.grades.math.ck,
      'Toán TB': s.grades.math.avg,
      'Lý TB': s.grades.physics.avg,
      'Hóa TB': s.grades.chemistry.avg,
      'Sinh TB': s.grades.biology.avg,
      'Văn TB': s.grades.literature.avg,
      'Anh TB': s.grades.english.avg,
      'GPA Tự Nhiên': s.grades.gpa,
      'Hạnh Kiểm': s.conductRating,
      'Xếp Loại Học Lực': s.grades.gpa >= 8.0 ? 'Giỏi' : s.grades.gpa >= 6.5 ? 'Khá' : 'Trung Bình',
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'So_Diem_Dien_Tu');
      XLSX.writeFile(wb, `So_Diem_Dien_Tu_${safeClassName}_THPT_TranNguyenHan.xlsx`);
    } else {
      const rows = students.map((s, idx) => [
        idx + 1,
        s.code,
        `"${s.name}"`,
        s.group,
        s.grades.math.tx1,
        s.grades.math.tx2,
        s.grades.math.gk,
        s.grades.math.ck,
        s.grades.math.avg,
        s.grades.physics.avg,
        s.grades.chemistry.avg,
        s.grades.biology.avg,
        s.grades.literature.avg,
        s.grades.english.avg,
        s.grades.gpa,
        s.conductRating,
        s.grades.gpa >= 8.0 ? 'Giỏi' : s.grades.gpa >= 6.5 ? 'Khá' : 'Trung Bình',
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bang_Diem_${safeClassName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    showToast(`Đã xuất Sổ điểm điện tử ${currentClassName} thành công!`);
  };

  // 2. Export Student Directory List (Excel/CSV)
  const handleExportStudentList = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const data = students.map((s, idx) => ({
      'STT': idx + 1,
      'Mã Học Sinh': s.code,
      'Họ và Tên': s.name,
      'Giới Tính': s.gender,
      'Ngày Sinh': s.dob,
      'Tổ': s.group,
      'SĐT Học Sinh': s.phone,
      'Họ Tên Phụ Huynh': s.emergencyContact.parentName,
      'Quan Hệ': s.emergencyContact.relationship,
      'SĐT Phụ Huynh': s.emergencyContact.phone,
      'Địa Chỉ Thường Trú': s.address,
      'Năng Khiếu / Thế Mạnh': s.strengths,
      'Nguyện Vọng Đại Học': s.careerAspiration,
      'Ghi Chú Y Tế': s.healthNotes || 'Bình thường',
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Trich_Ngang');
      XLSX.writeFile(wb, `Danh_Sach_Trich_Ngang_${safeClassName}_THPT_TranNguyenHan.xlsx`);
    } else {
      const headers = ['STT', 'Mã HS', 'Họ và Tên', 'Giới Tính', 'Ngày Sinh', 'Tổ', 'SĐT Học Sinh', 'Phụ Huynh', 'SĐT Phụ Huynh', 'Địa Chỉ', 'Năng Khiếu', 'Nguyện Vọng ĐH'];
      const rows = students.map((s, idx) => [
        idx + 1,
        s.code,
        `"${s.name}"`,
        s.gender,
        s.dob,
        s.group,
        s.phone,
        `"${s.emergencyContact.parentName} (${s.emergencyContact.relationship})"`,
        s.emergencyContact.phone,
        `"${s.address}"`,
        `"${s.strengths}"`,
        `"${s.careerAspiration}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_Sach_Trich_Ngang_${safeClassName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    showToast(`Đã xuất Danh sách trích ngang học sinh ${currentClassName} thành công!`);
  };

  // 3. Full System Backup (.json)
  const handleExportSystemBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      classInfo,
      teacherInfo,
      bghInfo,
      students,
      localStorageData: { ...localStorage },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sao_Luu_He_Thong_${safeClassName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Đã tải xuống file sao lưu hệ thống toàn vẹn!`);
  };

  // 4. Full System Restore (.json)
  const handleRestoreJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.localStorageData) {
          Object.keys(parsed.localStorageData).forEach((key) => {
            localStorage.setItem(key, parsed.localStorageData[key]);
          });
        }
        showToast('Khôi phục dữ liệu thành công! Đang làm mới hệ thống...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        showToast('Lỗi: File sao lưu không hợp lệ hoặc bị hỏng.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="text-white rounded-2xl p-6 shadow-md border relative overflow-hidden bg-gradient-to-r from-[#002244] via-[#003366] to-[#1e3a8a] border-blue-400/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-400/20 text-amber-300 border-amber-400/40 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>PHÂN HIỆU CÀI ĐẶT & QUẢN TRỊ DỮ LIỆU</span>
              </span>
              <span className="text-xs text-slate-300">
                {classInfo?.className || 'Lớp Học'} • {classInfo?.schoolName || 'THPT Trần Nguyên Hãn'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Cài Đặt & Trung Tâm Quản Trị Tệp Học Vụ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Quản lý xuất/nhập Excel sổ điểm, danh sách trích ngang học sinh, cấu hình thông tin lớp, GVCN, BGH và bảo trì hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-backup-system-json"
              onClick={handleExportSystemBackup}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#003366] text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Sao Lưu Toàn Bộ Dữ Liệu (.JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            id="settings-tab-files"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Trung Tâm Xuất / Nhập & Quản Trị Tệp</span>
          </button>

          <button
            id="settings-tab-config"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Cấu Hình Lớp, GVCN & BGH</span>
          </button>

          <button
            id="settings-tab-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Bảo Trì & Đặt Lại Dữ Liệu</span>
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
          Sĩ số: <strong className="text-[#003366]">{students.length} học sinh</strong>
        </span>
      </div>

      {/* =========================================================================
          TAB 1: TRUNG TÂM XUẤT / NHẬP & QUẢN TRỊ TỆP (DATA & FILE MANAGEMENT)
          ========================================================================= */}
      {activeTab === 'files' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Export Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Export Gradebook */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-900">Xuất Sổ Điểm Điện Tử {currentClassName}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  Tải xuống toàn bộ bảng điểm định kỳ (TX1, TX2, Giữa kỳ, Cuối kỳ, Điểm trung bình và GPA Khối Tự Nhiên) theo định dạng bảng tính Excel / CSV chuẩn Sở Giáo dục.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-emerald-50/60 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sĩ số</span>
                    <strong className="text-emerald-800">{students.length} HS</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">GPA Chung</span>
                    <strong className="text-emerald-800">
                      {(students.reduce((acc, s) => acc + s.grades.gpa, 0) / (students.length || 1)).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Môn Đánh Giá</span>
                    <strong className="text-emerald-800">6 Môn</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-export-grades-excel"
                  onClick={() => handleExportGradeBook('xlsx')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Xuất File Excel (.xlsx)</span>
                </button>
                <button
                  id="btn-export-grades-csv"
                  onClick={() => handleExportGradeBook('csv')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Xuất File CSV</span>
                </button>
              </div>
            </div>

            {/* Box 2: Export Student Directory */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-blue-700">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-900">Xuất Danh Sách Trích Ngang Học Sinh</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  Xuất toàn bộ danh sách {students.length} học sinh kèm thông tin liên lạc phụ huynh, nơi công tác, phân tổ thi đua, năng khiếu, định hướng nghề nghiệp và nguyện vọng xét tuyển Đại học.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-blue-50/60 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tổ 1 - Tổ 4</span>
                    <strong className="text-blue-800">4 Tổ</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Hồ sơ SĐT</span>
                    <strong className="text-blue-800">100% Đầy Đủ</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nguyện vọng</span>
                    <strong className="text-blue-800">Đã Khảo Sát</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-export-students-excel"
                  onClick={() => handleExportStudentList('xlsx')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Xuất File Excel (.xlsx)</span>
                </button>
                <button
                  id="btn-export-students-csv"
                  onClick={() => handleExportStudentList('csv')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Xuất File CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Google Sheets Connection Box */}
          {onOpenGoogleSheetSync && (
            <div className="bg-gradient-to-r from-emerald-900 via-[#003366] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    ONLINE DATABASE GOOGLE SHEETS
                  </span>
                  {googleSheetConfig?.sheetUrl ? (
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Đã Kết Nối ({googleSheetConfig.syncedCount || students.length} HS)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Chưa thiết lập</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-300 animate-pulse" />
                  Cơ Sở Dữ Liệu Danh Sách Học Sinh Từ Google Sheet
                </h3>
                <p className="text-xs text-slate-300">
                  Tự động kết nối và đồng bộ danh sách học sinh từ bảng tính Google Sheet trực tiếp vào hệ thống DẠ HƯƠNG 2026-2027.
                  {googleSheetConfig?.lastSyncedAt && ` • Lần đồng bộ gần nhất: ${googleSheetConfig.lastSyncedAt}`}
                </p>
              </div>

              <button
                id="btn-settings-open-google-sheet"
                type="button"
                onClick={onOpenGoogleSheetSync}
                className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-slate-950" />
                <span>{googleSheetConfig?.sheetUrl ? 'Quản Lý & Đồng Bộ Học Sinh' : 'Kết Nối Google Sheet Ngay'}</span>
              </button>
            </div>
          )}

          {/* Google Sheets Online Classes Database Card */}
          {onOpenOnlineClassModal && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded">
                    REALTIME SYNC
                  </span>
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Đã Sẵn Sàng Kết Nối
                  </span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-300 animate-pulse" />
                  Cơ Sở Dữ Liệu Danh Sách Lớp Học Trực Tuyến Từ Google Sheet
                </h3>
                <p className="text-xs text-slate-300">
                  Đồng bộ realtime danh sách các phòng học Google Meet, Zoom, MS Teams từ Google Sheet vào ứng dụng DẠ HƯƠNG 2026-2027.
                </p>
              </div>

              <button
                id="btn-settings-open-online-class-sheet"
                type="button"
                onClick={onOpenOnlineClassModal}
                className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Video className="w-4 h-4 text-slate-950" />
                <span>Quản Lý DB Lớp Trực Tuyến</span>
              </button>
            </div>
          )}

          {/* Advanced Import & Encoding Tools */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-700" />
                Bộ Công Cụ Nhập Dữ Liệu Nâng Cao & Tự Động Sửa Lỗi Font Tiếng Việt
              </h3>
              <span className="text-[11px] text-slate-500">Hỗ trợ định dạng .xlsx, .xls, .csv, .json</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tool 1: Import Students */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <User className="w-4 h-4" />
                    <p className="text-xs font-bold text-slate-800">Nhập Danh Sách Học Sinh</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nạp hàng loạt hồ sơ học sinh từ file Excel với tính năng xem trước thông minh, tự động gán tổ và phân loại.
                  </p>
                </div>
                <button
                  id="btn-trigger-import-students"
                  onClick={onOpenImportStudents}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Mở Trình Nạp Học Sinh</span>
                </button>
              </div>

              {/* Tool 2: Import Grades */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <p className="text-xs font-bold text-slate-800">Nhập Bảng Điểm Từ Excel</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cập nhật điểm định kỳ các môn Toán, Lý, Hóa, Sinh, Văn, Anh trực tiếp từ bảng điểm bộ môn.
                  </p>
                </div>
                <button
                  id="btn-trigger-import-grades"
                  onClick={onOpenImportGrades}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Mở Trình Nạp Bảng Điểm</span>
                </button>
              </div>

              {/* Tool 3: Vietnamese Font Repair */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 mb-1">
                    <Wand2 className="w-4 h-4" />
                    <p className="text-xs font-bold text-amber-900">Sửa Lỗi Font Chữ Tiếng Việt</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tự động quét & sửa các lỗi vỡ chữ font TCVN3 (.VNTime), VNI-Times sang chuẩn Unicode UTF-8 chỉ bằng 1 chạm.
                  </p>
                </div>
                <button
                  id="btn-trigger-font-repair"
                  onClick={onOpenFontRepair}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Mở Công Cụ Sửa Font</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup & JSON Restore */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-700" />
              Sao Lưu Toàn Bộ Cấu Hình & Dữ Liệu Học Vụ (JSON System Vault)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tạo bản sao lưu toàn diện lưu trữ trong 1 file JSON độc lập để dễ dàng chuyển sang máy tính khác hoặc lưu trữ định kỳ hàng tuần.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportSystemBackup}
                className="py-3 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Tải Bản Sao Lưu Dự Phòng (.json)</span>
              </button>

              <div>
                <input
                  type="file"
                  ref={jsonFileInputRef}
                  onChange={handleRestoreJsonFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <UploadCloud className="w-4 h-4 text-[#003366]" />
                  <span>Khôi Phục Dữ Liệu Từ File Sao Lưu JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CẤU HÌNH THÔNG TIN LỚP HỌC, GVCN & BGH
          ========================================================================= */}
      {activeTab === 'config' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center font-black text-lg overflow-hidden shrink-0 border border-blue-200">
                    {classInfo?.avatar ? (
                      <img src={classInfo.avatar} alt="Class" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{classInfo?.className || 'LỚP HỌC'}</h3>
                    <p className="text-xs text-slate-500">{classInfo?.schoolName || 'THPT Trần Nguyên Hãn'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Niên khóa:</span>
                    <span className="font-semibold text-slate-800">{classInfo?.academicYear || '2023 - 2026'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phòng học:</span>
                    <span className="font-semibold text-slate-800">Phòng 302 - Khu A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sĩ số hiện tại:</span>
                    <span className="font-bold text-[#003366]">{students.length} học sinh</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-edit-class-from-settings"
                onClick={onEditClass}
                className="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>Chỉnh Sửa Thông Tin Lớp</span>
              </button>
            </div>

            {/* Teacher Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg overflow-hidden shrink-0 border border-amber-200">
                    {teacherInfo?.avatar ? (
                      <img src={teacherInfo.avatar} alt="GVCN" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{teacherInfo?.name || 'Thầy Nguyễn Văn An'}</h3>
                    <p className="text-xs text-amber-700 font-semibold">{teacherInfo?.title || 'Thạc sĩ Toán học - GVCN'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Điện thoại:</span>
                    <span className="font-semibold text-slate-800">{teacherInfo?.phone || '0912.345.678'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{teacherInfo?.email || 'gvcn.12a1@tnh.edu.vn'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bộ môn:</span>
                    <span className="font-semibold text-slate-800">{teacherInfo?.subject || 'Toán Học'}</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-edit-teacher-from-settings"
                onClick={onEditTeacher}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Chỉnh Sửa Thông Tin GVCN</span>
              </button>
            </div>

            {/* BGH Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-lg overflow-hidden shrink-0 border border-purple-200">
                    {bghInfo?.avatar ? (
                      <img src={bghInfo.avatar} alt="BGH" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{bghInfo?.name || 'TS. Lê Thị Mai'}</h3>
                    <p className="text-xs text-purple-700 font-semibold">{bghInfo?.dutyRole || 'Phó Hiệu Trưởng'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phòng làm việc:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{bghInfo?.office || 'Phòng BGH - Tầng 2'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hotline BGH:</span>
                    <span className="font-semibold text-slate-800">{bghInfo?.phone || '0903.888.999'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phụ trách:</span>
                    <span className="font-semibold text-slate-800">Chuyên Môn KHTN</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-edit-bgh-from-settings"
                onClick={onEditBgh}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Chỉnh Sửa Thông Tin BGH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BẢO TRÌ & ĐẶT LẠI DỮ LIỆU (MAINTENANCE & RESET)
          ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-700" />
              Khôi Phục & Đặt Lại Từng Phân Hệ Dữ Liệu
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có thể khôi phục lại dữ liệu mẫu cho từng mô-đun độc lập nếu phát sinh sai sót trong quá trình thao tác hoặc giảng dạy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {/* Reset Seating */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                    <LayoutGrid className="w-4 h-4" />
                    <span>Sơ Đồ Chỗ Ngồi Lớp Học</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Khôi phục lại sơ đồ 4 dãy bàn tiêu chuẩn và phân bổ chỗ ngồi mẫu.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: 'Khôi Phục Sơ Đồ Lớp',
                      message: 'Bạn có chắc chắn muốn khôi phục lại sơ đồ chỗ ngồi 4 dãy về trạng thái ban đầu?',
                      confirmText: 'Khôi Phục Sơ Đồ',
                      onConfirm: () => {
                        onResetSeatingChart();
                        showToast('Đã khôi phục sơ đồ lớp học thành công!');
                      },
                    });
                  }}
                  className="w-full py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Khôi Phục Sơ Đồ Mẫu
                </button>
              </div>

              {/* Reset Materials */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <FolderOpen className="w-4 h-4" />
                    <span>Kho Học Liệu & Đề Cương</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tải lại danh mục đề cương ôn tập, tài liệu PDF mẫu các môn tự nhiên.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: 'Khôi Phục Kho Học Liệu',
                      message: 'Bạn có chắc chắn muốn nạp lại kho học liệu mẫu chuẩn của nhà trường?',
                      confirmText: 'Nạp Lại Học Liệu',
                      onConfirm: () => {
                        onResetMaterials();
                        showToast('Đã nạp lại kho học liệu mẫu chuẩn!');
                      },
                    });
                  }}
                  className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Nạp Lại Học Liệu Mẫu
                </button>
              </div>

              {/* Reset Timetable */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <CalendarDays className="w-4 h-4" />
                    <span>Thời Khóa Biểu Giảng Dạy</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Khôi phục lại thời khóa biểu 2 buổi sáng & chiều chuẩn của khối 12.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: 'Khôi Phục Thời Khóa Biểu',
                      message: 'Bạn có chắc chắn muốn đặt lại thời khóa biểu 2 buổi về lịch chuẩn?',
                      confirmText: 'Khôi Phục TKB',
                      onConfirm: () => {
                        if (onResetTimetable) onResetTimetable();
                        showToast('Đã khôi phục thời khóa biểu chuẩn!');
                      },
                    });
                  }}
                  className="w-full py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Khôi Phục TKB Chuẩn
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Full System Reset */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-rose-900">Xóa Trắng & Đặt Lại Toàn Bộ Hệ Thống (Factory Reset)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ xóa sạch toàn bộ bộ nhớ đệm (localStorage) trên trình duyệt, đặt lại tất cả hồ sơ học sinh, sổ điểm, sổ đầu bài, đơn nghỉ phép, học liệu và thời khóa biểu về trạng thái mẫu ban đầu.
            </p>
            <div className="pt-2">
              <button
                id="btn-factory-reset-entire-app"
                onClick={() => {
                  setConfirmAction({
                    isOpen: true,
                    title: 'Xác Nhận Đặt Lại Toàn Bộ Ứng Dụng',
                    message: 'CẢNH BÁO: Tất cả dữ liệu cập nhật sẽ bị xóa và ứng dụng sẽ tải lại về trạng thái mẫu ban đầu. Bạn có chắc chắn muốn tiếp tục?',
                    confirmText: 'Xác Nhận Đặt Lại Hệ Thống',
                    onConfirm: () => {
                      localStorage.clear();
                      window.location.reload();
                    },
                  });
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Đặt Lại Toàn Bộ Dữ Liệu Về Trạng Thái Xuất Xưởng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Modal Confirmation */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
      />
    </div>
  );
};
