import React, { useState, useRef } from 'react';
import {
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
  User,
  Edit2,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Search,
  ChevronRight,
  Sun,
  Sunset,
  GraduationCap,
  Save,
  Plus,
  Video,
  Trash2,
  RefreshCw,
  UploadCloud,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TimetableData, DaySchedule, TimetablePeriod, UserRole, ClassInfo, TeacherInfo } from '../types';
import { INITIAL_TIMETABLE } from '../data/mockData';

interface ScheduleViewProps {
  timetable: TimetableData;
  onSaveTimetable: (data: TimetableData) => void;
  role: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onOpenOnlineClassModal?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  timetable,
  onSaveTimetable,
  role,
  classInfo,
  teacherInfo,
  onOpenOnlineClassModal,
}) => {
  const getCurrentDayKey = (): string => {
    const day = new Date().getDay();
    switch (day) {
      case 1: return 'mon';
      case 2: return 'tue';
      case 3: return 'wed';
      case 4: return 'thu';
      case 5: return 'fri';
      case 6: return 'sat';
      default: return 'mon';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getCurrentDayKey());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  // Editing state
  const [editingPeriod, setEditingPeriod] = useState<{
    dayKey: string;
    session: 'morning' | 'afternoon';
    periodIndex: number;
    data: TimetablePeriod;
  } | null>(null);

  // Modal & Toast states
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedTimetableDays, setParsedTimetableDays] = useState<DaySchedule[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const timetableFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSubjectColor = (subject: string): { bg: string; text: string; border: string } => {
    const s = subject.toLowerCase();
    if (!subject || s === 'trống' || s === 'nghỉ') return { bg: 'bg-[#002244]/5', text: 'text-slate-400', border: 'border-slate-200' };
    if (s.includes('toán')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    if (s.includes('lý') || s.includes('vật lý')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    if (s.includes('hóa') || s.includes('hóa học')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    if (s.includes('văn') || s.includes('ngữ văn')) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    if (s.includes('anh') || s.includes('tiếng anh')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (s.includes('sinh') || s.includes('sinh học')) return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    if (s.includes('thể chất') || s.includes('thể thao')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    if (s.includes('chào cờ') || s.includes('sinh hoạt')) return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' };
    if (s.includes('tin học')) return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' };
    return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    const newDays = timetable.days.map((day) => {
      if (day.dayKey !== editingPeriod.dayKey) return day;

      const newSessionList = [...day[editingPeriod.session]];
      newSessionList[editingPeriod.periodIndex] = editingPeriod.data;

      return {
        ...day,
        [editingPeriod.session]: newSessionList,
      };
    });

    onSaveTimetable({
      ...timetable,
      days: newDays,
    });

    setEditingPeriod(null);
    showToast(`Đã cập nhật tiết ${editingPeriod.data.period} (${editingPeriod.data.subject || 'Tiết trống'}) thành công!`);
  };

  const handleClearSinglePeriod = () => {
    if (!editingPeriod) return;

    const newDays = timetable.days.map((day) => {
      if (day.dayKey !== editingPeriod.dayKey) return day;

      const newSessionList = [...day[editingPeriod.session]];
      newSessionList[editingPeriod.periodIndex] = {
        ...editingPeriod.data,
        subject: '',
        teacher: '',
        room: '',
        note: '',
      };

      return {
        ...day,
        [editingPeriod.session]: newSessionList,
      };
    });

    onSaveTimetable({
      ...timetable,
      days: newDays,
    });

    setEditingPeriod(null);
    showToast(`Đã xóa tiết ${editingPeriod.data.period} về trạng thái tiết trống!`);
  };

  const handleDirectDeletePeriod = (dayKey: string, session: 'morning' | 'afternoon', periodIndex: number) => {
    const newDays = timetable.days.map((day) => {
      if (day.dayKey !== dayKey) return day;

      const newSessionList = [...day[session]];
      newSessionList[periodIndex] = {
        ...newSessionList[periodIndex],
        subject: '',
        teacher: '',
        room: '',
        note: '',
      };

      return {
        ...day,
        [session]: newSessionList,
      };
    });

    onSaveTimetable({
      ...timetable,
      days: newDays,
    });

    showToast(`Đã xóa tiết ${session === 'morning' ? periodIndex + 1 : periodIndex + 6} về trạng thái tiết trống!`);
  };

  const handleClearAllTimetable = () => {
    const emptyDays: DaySchedule[] = timetable.days.map((day) => ({
      ...day,
      morning: day.morning.map((p) => ({ ...p, subject: '', teacher: '', room: '', note: '' })),
      afternoon: day.afternoon.map((p) => ({ ...p, subject: '', teacher: '', room: '', note: '' })),
    }));

    onSaveTimetable({
      ...timetable,
      days: emptyDays,
    });

    setIsConfirmClearAllOpen(false);
    showToast('Đã xóa sạch toàn bộ thời khóa biểu! Bạn có thể tự sắp xếp lại từng tiết.');
  };

  const handleResetDefaultTimetable = () => {
    onSaveTimetable(INITIAL_TIMETABLE);
    setIsConfirmClearAllOpen(false);
    showToast('Đã khôi phục thời khóa biểu mẫu mặc định!');
  };

  // Download Sample Excel Template for Timetable
  const downloadSampleTemplate = () => {
    const data = [
      ['Buổi', 'Tiết', 'Thời Gian', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
      ['Sáng', '1', '07:00 - 07:45', 'Chào cờ & Sinh hoạt dưới cờ', 'Vật Lý (Lý thuyết)', 'Toán Học (Giải Tích)', 'Ngữ Văn', 'Tiếng Anh', 'Thể Dục'],
      ['Sáng', '2', '07:50 - 08:35', 'Toán Học (Đại Số)', 'Vật Lý (Bài tập)', 'Hóa Học', 'Ngữ Văn', 'Tiếng Anh', 'Thể Dục'],
      ['Sáng', '3', '08:55 - 09:40', 'Toán Học (Hình Học)', 'Hóa Học (Thực hành)', 'Hóa Học (Bài tập)', 'Toán Học', 'Lịch Sử', 'Sinh Hoạt Lớp'],
      ['Sáng', '4', '09:45 - 10:30', 'Vật Lý', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Lịch Sử', 'Địa Lý'],
      ['Sáng', '5', '10:35 - 11:20', 'Hóa Học', 'Ngữ Văn', 'Tiếng Anh', 'Sinh Học', 'GD Quốc Phòng', 'Địa Lý'],
      ['Chiều', '6', '13:00 - 13:45', 'Hoạt động trải nghiệm', 'Tin Học', 'Bồi dưỡng Toán', 'Bồi dưỡng Văn', 'Tiếng Anh Tăng Cường', 'Tự Học'],
      ['Chiều', '7', '13:50 - 14:35', 'Hoạt động trải nghiệm', 'Tin Học', 'Bồi dưỡng Toán', 'Bồi dưỡng Văn', 'Tiếng Anh Tăng Cường', 'Tự Học'],
      ['Chiều', '8', '14:45 - 15:30', 'GDQP - AN', 'CLB Thể Thao', 'Ôn Tập Vật Lý', 'Ôn Tập Hóa Học', 'Bồi Dưỡng HSG', 'Nghỉ'],
      ['Chiều', '9', '15:35 - 16:20', 'GDQP - AN', 'CLB Thể Thao', 'Ôn Tập Vật Lý', 'Ôn Tập Hóa Học', 'Bồi Dưỡng HSG', 'Nghỉ'],
      ['Chiều', '10', '16:25 - 17:10', 'Nghỉ', 'Nghỉ', 'Nghỉ', 'Nghỉ', 'Nghỉ', 'Nghỉ'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThoiKhoaBieu');
    XLSX.writeFile(wb, `Mau_Thoi_Khoa_Bieu_${(classInfo?.className || '11D5').replace(/\s+/g, '_')}.xlsx`);
  };

  // Handle Select & Parse Excel Timetable File
  const handleFileSelectTimetable = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        setImportError('File không chứa dữ liệu Thời khóa biểu hoặc sai định dạng!');
        setIsParsing(false);
        return;
      }

      // Find header row containing day columns
      let headerIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const rowStr = rows[i].join(' ').toLowerCase();
        if (rowStr.includes('thứ') || rowStr.includes('hai') || rowStr.includes('ba') || rowStr.includes('tư')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rows[headerIdx].map((h) => String(h || '').trim().toLowerCase());
      const findCol = (keywords: string[]) =>
        headers.findIndex((h) => keywords.some((k) => h.includes(k)));

      const colMon = findCol(['thứ hai', 'thứ 2', 'thuhai', 'thu 2', 'mon']);
      const colTue = findCol(['thứ ba', 'thứ 3', 'thuba', 'thu 3', 'tue']);
      const colWed = findCol(['thứ tư', 'thứ 4', 'thutu', 'thu 4', 'wed']);
      const colThu = findCol(['thứ năm', 'thứ 5', 'thunam', 'thu 5', 'thu']);
      const colFri = findCol(['thứ sáu', 'thứ 6', 'thusau', 'thu 6', 'fri']);
      const colSat = findCol(['thứ bảy', 'thứ 7', 'thubay', 'thu 7', 'sat']);

      // Clone existing timetable structure
      const newDaysData: DaySchedule[] = JSON.parse(JSON.stringify(timetable.days));

      // Loop through data rows (expected 10 periods)
      let dataRowsCount = 0;
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;

        const sessionText = String(r[0] || '').toLowerCase();
        const periodNumRaw = Number(String(r[1] || '').replace(/[^0-9]/g, ''));

        if (!periodNumRaw && dataRowsCount >= 10) continue;

        const periodIdx = dataRowsCount < 10 ? dataRowsCount : 0;
        const isMorning = periodIdx < 5;
        const targetSession = isMorning ? 'morning' : 'afternoon';
        const targetIdx = isMorning ? periodIdx : periodIdx - 5;

        const assignSubject = (dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat', colIdx: number) => {
          if (colIdx !== -1 && r[colIdx]) {
            const val = String(r[colIdx] || '').trim();
            const dayObj = newDaysData.find((d) => d.dayKey === dayKey);
            if (dayObj && dayObj[targetSession][targetIdx]) {
              dayObj[targetSession][targetIdx].subject = val === 'Nghỉ' || val === 'Trống' ? '' : val;
            }
          }
        };

        assignSubject('mon', colMon);
        assignSubject('tue', colTue);
        assignSubject('wed', colWed);
        assignSubject('thu', colThu);
        assignSubject('fri', colFri);
        assignSubject('sat', colSat);

        dataRowsCount++;
        if (dataRowsCount >= 10) break;
      }

      setParsedTimetableDays(newDaysData);
    } catch (err) {
      setImportError('Lỗi đọc file Excel Thời khóa biểu. Vui lòng sử dụng File mẫu chuẩn!');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImportTimetable = () => {
    if (parsedTimetableDays.length === 0) return;

    onSaveTimetable({
      ...timetable,
      days: parsedTimetableDays,
    });

    setIsImportModalOpen(false);
    setParsedTimetableDays([]);
    setImportFile(null);
    showToast('Đã nhập thành công Thời khóa biểu mới từ file Excel!');
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDaySchedule = timetable.days.find((d) => d.dayKey === activeTab) || timetable.days[0];

  const daysHeaderList = [
    { key: 'mon', name: 'THỨ HAI' },
    { key: 'tue', name: 'THỨ BA' },
    { key: 'wed', name: 'THỨ TƯ' },
    { key: 'thu', name: 'THỨ NĂM' },
    { key: 'fri', name: 'THỨ SÁU' },
    { key: 'sat', name: 'THỨ BẢY' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#003366] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-amber-400/40 text-sm font-medium animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Thời Khoá Biểu Giảng Dạy & Học Tập
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    2 Buổi/Ngày • 10 Tiết
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Lớp: <span className="font-bold text-slate-800">{classInfo?.className || '11D5'}</span> •{' '}
                  {timetable.academicYear} • <span className="text-slate-600">{timetable.appliedDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search subject */}
            <div className="relative min-w-[160px] sm:min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Lọc môn học / GV..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
              {searchSubject && (
                <button
                  onClick={() => setSearchSubject('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'weekly'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn Cảnh Tuần (6 Ngày)
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'daily'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chi Tiết Theo Ngày
              </button>
            </div>

            {onOpenOnlineClassModal && (
              <button
                type="button"
                onClick={onOpenOnlineClassModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Mở Cơ sở dữ liệu Lớp học trực tuyến Google Sheets"
              >
                <Video className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>DB Lớp Trực Tuyến</span>
              </button>
            )}

            {(role === 'gvcn' || role === 'bgh') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setImportFile(null);
                    setParsedTimetableDays([]);
                    setImportError(null);
                    setIsImportModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Tải thời khóa biểu từ file Excel trên máy tính"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-300" />
                  <span>Tải Từ Máy Tính</span>
                </button>

                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Tải file Excel mẫu (.xlsx) để điền thời khóa biểu"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Tải File Mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmClearAllOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Xóa toàn bộ thời khóa biểu để tự nhập lại từ đầu"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Xóa Hết TKB</span>
                </button>
              </>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="In thời khoá biểu A4"
            >
              <Printer className="w-4 h-4" />
              <span>In TKB</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: WEEKLY FULL MATRIX */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#003366]" />
              <span>Bảng Tổng Hợp Thời Khoá Biểu Cả Tuần (Thứ 2 - Thứ 7)</span>
            </h2>
            <p className="text-xs text-slate-500 italic">
              {(role === 'gvcn' || role === 'bgh')
                ? 'Nhấp biểu tượng cây bút để SỬA tiết, nhấp biểu tượng THÙNG RÁC để XÓA tiết về tiết trống'
                : 'Xem chi tiết các tiết học trong tuần'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#002850] text-white text-xs font-bold uppercase border-b border-[#001A33]">
                  <th className="p-3 text-center w-16 border-r border-[#001A33]">BUỔI</th>
                  <th className="p-3 text-center w-16 border-r border-[#001A33]">TIẾT</th>
                  <th className="p-3 text-center w-24 border-r border-[#001A33]">THỜI GIAN</th>
                  {daysHeaderList.map((d) => (
                    <th key={d.key} className="p-3 text-center border-r border-[#001A33] last:border-r-0">
                      {d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {/* BUỔI SÁNG (Tiết 1 -> 5) */}
                {[0, 1, 2, 3, 4].map((periodIdx) => (
                  <tr key={`morning-p-${periodIdx}`} className="hover:bg-slate-50/80 transition-colors">
                    {periodIdx === 0 && (
                      <td
                        rowSpan={5}
                        className="p-3 font-bold text-slate-700 bg-amber-50/40 text-center border-r border-slate-200 align-middle"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span className="text-[11px] font-black text-amber-800 uppercase block">BUỔI SÁNG</span>
                          <span className="text-[10px] font-semibold text-amber-600">5 TIẾT</span>
                        </div>
                      </td>
                    )}
                    <td className="p-3 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-50/50">
                      Tiết {periodIdx + 1}
                    </td>
                    <td className="p-2 text-[10px] text-slate-500 font-mono text-center border-r border-slate-200 bg-slate-50/30">
                      {timetable.days[0]?.morning[periodIdx]?.time || '07:00 - 07:45'}
                    </td>

                    {/* Columns for Mon -> Sat */}
                    {daysHeaderList.map((dh) => {
                      const daySchedule = timetable.days.find((d) => d.dayKey === dh.key);
                      const period = daySchedule?.morning[periodIdx];
                      if (!period) return <td key={dh.key} className="p-2 border-r border-slate-200" />;

                      const isMatch =
                        searchSubject &&
                        (period.subject.toLowerCase().includes(searchSubject.toLowerCase()) ||
                          period.teacher.toLowerCase().includes(searchSubject.toLowerCase()));

                      const colors = getSubjectColor(period.subject);
                      const hasSubject = Boolean(period.subject && period.subject.trim() !== '' && period.subject !== 'Trống');

                      return (
                        <td
                          key={dh.key}
                          className={`p-2 border-r border-slate-200 last:border-r-0 align-top transition-all ${
                            isMatch ? 'ring-2 ring-amber-400 bg-amber-50/80 z-10' : ''
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} flex flex-col justify-between h-full min-h-[76px] relative group/cell transition-all ${
                              (role === 'gvcn' || role === 'bgh') ? 'hover:shadow-md cursor-pointer' : ''
                            }`}
                            onClick={() => {
                              if (role === 'gvcn' || role === 'bgh') {
                                setEditingPeriod({
                                  dayKey: dh.key,
                                  session: 'morning',
                                  periodIndex: periodIdx,
                                  data: { ...period },
                                });
                              }
                            }}
                          >
                            {/* Hover Edit & Delete Actions */}
                            {(role === 'gvcn' || role === 'bgh') && (
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/cell:opacity-100 flex items-center gap-1 bg-white/95 rounded-lg p-1 shadow-md border border-slate-200/80 transition-opacity z-20">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPeriod({
                                      dayKey: dh.key,
                                      session: 'morning',
                                      periodIndex: periodIdx,
                                      data: { ...period },
                                    });
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded-md text-[#003366] transition-colors"
                                  title="Chỉnh sửa thông tin tiết"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {hasSubject && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDirectDeletePeriod(dh.key, 'morning', periodIdx);
                                    }}
                                    className="p-1 hover:bg-rose-50 rounded-md text-rose-500 transition-colors"
                                    title="Xóa tiết học này về tiết trống"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}

                            <div>
                              <p className={`font-bold text-xs ${colors.text} leading-snug`}>
                                {hasSubject ? period.subject : <span className="text-slate-400 font-normal italic">-- Tiết Trống --</span>}
                              </p>
                              {hasSubject && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{period.teacher}</span>
                                </p>
                              )}
                            </div>

                            {hasSubject && period.room && (
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-white/70 font-mono text-[9px] border border-slate-200">
                                  {period.room}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* BUỔI CHIỀU (Tiết 6 -> 10) */}
                {[0, 1, 2, 3, 4].map((periodIdx) => (
                  <tr key={`afternoon-p-${periodIdx}`} className="hover:bg-slate-50/80 transition-colors">
                    {periodIdx === 0 && (
                      <td
                        rowSpan={5}
                        className="p-3 font-bold text-slate-700 bg-indigo-50/40 text-center border-r border-slate-200 align-middle"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Sunset className="w-4 h-4 text-indigo-500" />
                          <span className="text-[11px] font-black text-indigo-800 uppercase block">BUỔI CHIỀU</span>
                          <span className="text-[10px] font-semibold text-indigo-600">5 TIẾT</span>
                        </div>
                      </td>
                    )}
                    <td className="p-3 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-50/50">
                      Tiết {periodIdx + 6}
                    </td>
                    <td className="p-2 text-[10px] text-slate-500 font-mono text-center border-r border-slate-200 bg-slate-50/30">
                      {timetable.days[0]?.afternoon[periodIdx]?.time || '13:00 - 13:45'}
                    </td>

                    {/* Columns for Mon -> Sat */}
                    {daysHeaderList.map((dh) => {
                      const daySchedule = timetable.days.find((d) => d.dayKey === dh.key);
                      const period = daySchedule?.afternoon[periodIdx];
                      if (!period) return <td key={dh.key} className="p-2 border-r border-slate-200" />;

                      const isMatch =
                        searchSubject &&
                        (period.subject.toLowerCase().includes(searchSubject.toLowerCase()) ||
                          period.teacher.toLowerCase().includes(searchSubject.toLowerCase()));

                      const colors = getSubjectColor(period.subject);
                      const hasSubject = Boolean(period.subject && period.subject.trim() !== '' && period.subject !== 'Trống');

                      return (
                        <td
                          key={dh.key}
                          className={`p-2 border-r border-slate-200 last:border-r-0 align-top transition-all ${
                            isMatch ? 'ring-2 ring-amber-400 bg-amber-50/80 z-10' : ''
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} flex flex-col justify-between h-full min-h-[76px] relative group/cell transition-all ${
                              (role === 'gvcn' || role === 'bgh') ? 'hover:shadow-md cursor-pointer' : ''
                            }`}
                            onClick={() => {
                              if (role === 'gvcn' || role === 'bgh') {
                                setEditingPeriod({
                                  dayKey: dh.key,
                                  session: 'afternoon',
                                  periodIndex: periodIdx,
                                  data: { ...period },
                                });
                              }
                            }}
                          >
                            {/* Hover Edit & Delete Actions */}
                            {(role === 'gvcn' || role === 'bgh') && (
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/cell:opacity-100 flex items-center gap-1 bg-white/95 rounded-lg p-1 shadow-md border border-slate-200/80 transition-opacity z-20">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPeriod({
                                      dayKey: dh.key,
                                      session: 'afternoon',
                                      periodIndex: periodIdx,
                                      data: { ...period },
                                    });
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded-md text-[#003366] transition-colors"
                                  title="Chỉnh sửa thông tin tiết"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {hasSubject && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDirectDeletePeriod(dh.key, 'afternoon', periodIdx);
                                    }}
                                    className="p-1 hover:bg-rose-50 rounded-md text-rose-500 transition-colors"
                                    title="Xóa tiết học này về tiết trống"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}

                            <div>
                              <p className={`font-bold text-xs ${colors.text} leading-snug`}>
                                {hasSubject ? period.subject : <span className="text-slate-400 font-normal italic">-- Tiết Trống --</span>}
                              </p>
                              {hasSubject && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{period.teacher}</span>
                                </p>
                              )}
                            </div>

                            {hasSubject && period.room && (
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-white/70 font-mono text-[9px] border border-slate-200">
                                  {period.room}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DAILY TIMELINE DETAILS */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {timetable.days.map((day) => {
              const isActive = day.dayKey === activeTab;
              return (
                <button
                  key={day.dayKey}
                  onClick={() => setActiveTab(day.dayKey)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{day.dayName}</span>
                  <span className="text-[10px] opacity-80">({day.date})</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Buổi Sáng (Tiết 1 - 5)</span>
                </h3>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  07:00 - 11:30
                </span>
              </div>

              <div className="space-y-3">
                {activeDaySchedule.morning.map((period, idx) => {
                  const colors = getSubjectColor(period.subject);
                  const hasSubject = Boolean(period.subject && period.subject.trim() !== '' && period.subject !== 'Trống');

                  return (
                    <div
                      key={`m-${idx}`}
                      className={`p-3.5 rounded-xl border ${colors.bg} ${colors.border} flex items-center justify-between gap-4 transition-all ${
                        (role === 'gvcn' || role === 'bgh') ? 'hover:shadow-sm cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (role === 'gvcn' || role === 'bgh') {
                          setEditingPeriod({
                            dayKey: activeDaySchedule.dayKey,
                            session: 'morning',
                            periodIndex: idx,
                            data: { ...period },
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/80 border border-slate-200 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-[10px] text-slate-400 leading-none">Tiết</span>
                          <span className="text-xs text-[#003366] leading-none mt-0.5">{period.period}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-bold text-xs ${colors.text} truncate`}>
                            {hasSubject ? period.subject : <span className="text-slate-400 font-normal italic">-- Tiết Trống --</span>}
                          </h4>
                          {hasSubject && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                              <span>GV: {period.teacher}</span>
                              {period.room && (
                                <span className="px-1.5 py-0.2 rounded bg-white text-[10px] font-mono border border-slate-200">
                                  {period.room}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500 bg-white/60 px-2 py-1 rounded-lg border border-slate-200">
                          {period.time}
                        </span>
                        {(role === 'gvcn' || role === 'bgh') && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPeriod({
                                  dayKey: activeDaySchedule.dayKey,
                                  session: 'morning',
                                  periodIndex: idx,
                                  data: { ...period },
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 shadow-xs"
                              title="Sửa tiết"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {hasSubject && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDirectDeletePeriod(activeDaySchedule.dayKey, 'morning', idx);
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-xs"
                                title="Xóa tiết này về tiết trống"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-indigo-500" />
                  <span>Buổi Chiều (Tiết 6 - 10)</span>
                </h3>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  13:00 - 17:15
                </span>
              </div>

              <div className="space-y-3">
                {activeDaySchedule.afternoon.map((period, idx) => {
                  const colors = getSubjectColor(period.subject);
                  const hasSubject = Boolean(period.subject && period.subject.trim() !== '' && period.subject !== 'Trống');

                  return (
                    <div
                      key={`a-${idx}`}
                      className={`p-3.5 rounded-xl border ${colors.bg} ${colors.border} flex items-center justify-between gap-4 transition-all ${
                        (role === 'gvcn' || role === 'bgh') ? 'hover:shadow-sm cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (role === 'gvcn' || role === 'bgh') {
                          setEditingPeriod({
                            dayKey: activeDaySchedule.dayKey,
                            session: 'afternoon',
                            periodIndex: idx,
                            data: { ...period },
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/80 border border-slate-200 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-[10px] text-slate-400 leading-none">Tiết</span>
                          <span className="text-xs text-[#003366] leading-none mt-0.5">{period.period}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-bold text-xs ${colors.text} truncate`}>
                            {hasSubject ? period.subject : <span className="text-slate-400 font-normal italic">-- Tiết Trống --</span>}
                          </h4>
                          {hasSubject && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                              <span>GV: {period.teacher}</span>
                              {period.room && (
                                <span className="px-1.5 py-0.2 rounded bg-white text-[10px] font-mono border border-slate-200">
                                  {period.room}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500 bg-white/60 px-2 py-1 rounded-lg border border-slate-200">
                          {period.time}
                        </span>
                        {(role === 'gvcn' || role === 'bgh') && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPeriod({
                                  dayKey: activeDaySchedule.dayKey,
                                  session: 'afternoon',
                                  periodIndex: idx,
                                  data: { ...period },
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 shadow-xs"
                              title="Sửa tiết"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {hasSubject && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDirectDeletePeriod(activeDaySchedule.dayKey, 'afternoon', idx);
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-xs"
                                title="Xóa tiết này về tiết trống"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERIOD MODAL */}
      {editingPeriod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Chỉnh Sửa Tiết {editingPeriod.data.period} ({editingPeriod.session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thời gian: {editingPeriod.data.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPeriod(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePeriod} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn Học / Nội Dung:</label>
                <input
                  type="text"
                  value={editingPeriod.data.subject}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      data: { ...editingPeriod.data, subject: e.target.value },
                    })
                  }
                  placeholder="Ví dụ: Toán Học (Giải Tích) - Để trống nếu muốn tiết này thành Tiết Trống"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo Viên Giảng Dạy:</label>
                <input
                  type="text"
                  value={editingPeriod.data.teacher}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      data: { ...editingPeriod.data, teacher: e.target.value },
                    })
                  }
                  placeholder="Ví dụ: Thầy Nguyễn Văn An (GVCN)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng Học:</label>
                  <input
                    type="text"
                    value={editingPeriod.data.room}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        data: { ...editingPeriod.data, room: e.target.value },
                      })
                    }
                    placeholder="Phòng 302"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khung Giờ:</label>
                  <input
                    type="text"
                    value={editingPeriod.data.time}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        data: { ...editingPeriod.data, time: e.target.value },
                      })
                    }
                    placeholder="07:00 - 07:45"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú / Nội Dung Dặn Dò:</label>
                <textarea
                  rows={2}
                  value={editingPeriod.data.note || ''}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      data: { ...editingPeriod.data, note: e.target.value },
                    })
                  }
                  placeholder="Ví dụ: Ôn tập Nguyên hàm - Tích phân, mang máy tính Casio..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearSinglePeriod}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 border border-rose-200 cursor-pointer"
                  title="Xóa thông tin tiết này về trạng thái tiết trống"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Tiết Này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPeriod(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Tiết</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL TIMETABLE MODAL */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-scaleUp">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Xóa Sạch Thời Khóa Biểu Để Tự Điều Chỉnh?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Thao tác này sẽ xóa sạch thông tin môn học và giáo viên của toàn bộ 50 tiết (cả 6 ngày Thứ 2 - Thứ 7), đưa toàn bộ các tiết về trạng thái <strong className="text-slate-800">-- Tiết Trống --</strong> để bạn tự sắp xếp theo ý muốn.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleClearAllTimetable}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÁC NHẬN XÓA SẠCH VỀ TIẾT TRỐNG</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultTimetable}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>KHÔI PHỤC THỜI KHÓA BIỂU MẪU MẶC ĐỊNH</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT TIMETABLE FROM EXCEL / CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
            <div className="p-6 bg-gradient-to-r from-[#003366] via-indigo-900 to-[#001A33] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-300" />
                  Tải Thời Khóa Biểu Từ Máy Tính
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Hỗ trợ định dạng file Excel (.xlsx, .xls) và CSV
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3 transition-colors">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-[#003366]" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {importFile ? importFile.name : 'Kéo thả file Excel Thời khóa biểu vào đây hoặc bấm chọn tệp'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Định dạng chuẩn: Buổi, Tiết, Thời gian, Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs cursor-pointer shadow-md">
                    <UploadCloud className="w-4 h-4 text-cyan-300" />
                    <span>Chọn File Excel Từ Máy</span>
                    <input
                      type="file"
                      ref={timetableFileInputRef}
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileSelectTimetable}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Chưa có file thời khóa biểu mẫu?</span>
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải File Mẫu Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {isParsing && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích thời khóa biểu từ file Excel...</span>
                </div>
              )}

              {importError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedTimetableDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã trích xuất thành công Thời khóa biểu 6 ngày (Thứ 2 - Thứ 7)
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#002850] text-white font-bold sticky top-0">
                        <tr>
                          <th className="p-2 pl-3">Tiết</th>
                          <th className="p-2">Thứ 2</th>
                          <th className="p-2">Thứ 3</th>
                          <th className="p-2">Thứ 4</th>
                          <th className="p-2">Thứ 5</th>
                          <th className="p-2">Thứ 6</th>
                          <th className="p-2">Thứ 7</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((pIdx) => {
                          const session = pIdx < 5 ? 'morning' : 'afternoon';
                          const idxInSession = pIdx < 5 ? pIdx : pIdx - 5;

                          return (
                            <tr key={pIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2 pl-3 font-bold text-[#003366]">Tiết {pIdx + 1}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'mon')?.[session][idxInSession]?.subject || '-'}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'tue')?.[session][idxInSession]?.subject || '-'}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'wed')?.[session][idxInSession]?.subject || '-'}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'thu')?.[session][idxInSession]?.subject || '-'}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'fri')?.[session][idxInSession]?.subject || '-'}</td>
                              <td className="p-2">{parsedTimetableDays.find((d) => d.dayKey === 'sat')?.[session][idxInSession]?.subject || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={parsedTimetableDays.length === 0}
                onClick={handleConfirmImportTimetable}
                className="px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Áp Dụng Thời Khóa Biểu Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
