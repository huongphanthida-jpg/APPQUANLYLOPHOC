import React, { useState } from 'react';
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
} from 'lucide-react';
import { TimetableData, DaySchedule, TimetablePeriod, UserRole, ClassInfo, TeacherInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';

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
  // Current real day of week or default to 'mon'
  const getCurrentDayKey = (): string => {
    const day = new Date().getDay();
    switch (day) {
      case 1: return 'mon';
      case 2: return 'tue';
      case 3: return 'wed';
      case 4: return 'thu';
      case 5: return 'fri';
      case 6: return 'sat';
      default: return 'mon'; // Sunday default to Monday
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSubjectColor = (subject: string): { bg: string; text: string; border: string } => {
    const s = subject.toLowerCase();
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
    showToast(`Đã cập nhật tiết ${editingPeriod.data.period} (${editingPeriod.data.subject}) thành công!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDaySchedule = timetable.days.find((d) => d.dayKey === activeTab) || timetable.days[0];

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
                  Lớp: <span className="font-bold text-slate-800">{classInfo?.className || '12A1'}</span> •{' '}
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

            {/* View Mode Toggle: Weekly Matrix vs Daily Timeline */}
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

            {/* Print Button */}
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

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="In thời khoá biểu A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In TKB</span>
            </button>
          </div>
        </div>

        {/* Quick Session Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-900">Buổi Sáng (5 Tiết: 07:00 - 11:20)</div>
              <div className="text-[11px] text-amber-700">Chương trình chính khóa & Thi THPT</div>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sunset className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-blue-900">Buổi Chiều (5 Tiết: 13:30 - 17:45)</div>
              <div className="text-[11px] text-blue-700">Bồi dưỡng Khối A, Luyện đề & Ngoại khóa</div>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-900">Tổng Quy Mô Học Tập</div>
              <div className="text-[11px] text-emerald-700">60 tiết/tuần (Toán: 10 tiết • Lý: 8 tiết • Hóa: 8 tiết)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= VIEW MODE 1: WEEKLY FULL MATRIX ======================= */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#003366]" />
              <span>Bảng Tổng Hợp Thời Khoá Biểu Cả Tuần (Thứ 2 - Thứ 7)</span>
            </h2>
            <div className="text-xs text-slate-500 italic">
              {role === 'gvcn' && 'Nhấp vào biểu tượng chỉnh sửa trên từng tiết để sửa đổi'}
            </div>
          </div>

          {/* FULL WEEKLY TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#003366] text-white text-xs uppercase tracking-wider">
                  <th className="p-3 font-bold border-r border-blue-900/40 w-24 text-center">Buổi</th>
                  <th className="p-3 font-bold border-r border-blue-900/40 w-16 text-center">Tiết</th>
                  <th className="p-3 font-bold border-r border-blue-900/40 w-28 text-center">Thời Gian</th>
                  {timetable.days.map((d) => (
                    <th key={d.dayKey} className="p-3 font-bold border-r border-blue-900/40 text-center last:border-r-0">
                      {d.dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200">
                {/* MORNING SESSIONS (TIẾT 1 -> 5) */}
                {[0, 1, 2, 3, 4].map((periodIndex) => {
                  const periodNum = periodIndex + 1;
                  const samplePeriod = timetable.days[0].morning[periodIndex];

                  return (
                    <tr key={`morning-${periodIndex}`} className="hover:bg-slate-50/70 transition-colors">
                      {periodIndex === 0 && (
                        <td
                          rowSpan={5}
                          className="p-3 font-bold text-amber-900 bg-amber-50/80 border-r border-slate-200 text-center uppercase tracking-wider"
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Sun className="w-5 h-5 text-amber-600" />
                            <span>BUỔI SÁNG</span>
                            <span className="text-[10px] text-amber-700 font-normal">5 Tiết</span>
                          </div>
                        </td>
                      )}
                      <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200 text-center bg-slate-50/50">
                        Tiết {periodNum}
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-500 font-mono border-r border-slate-200 text-center">
                        {samplePeriod?.time || ''}
                      </td>
                      {timetable.days.map((day) => {
                        const p = day.morning[periodIndex];
                        if (!p) return <td key={day.dayKey} className="p-2 border-r border-slate-200"></td>;

                        const colors = getSubjectColor(p.subject);
                        const isMatch =
                          searchSubject &&
                          (p.subject.toLowerCase().includes(searchSubject.toLowerCase()) ||
                            p.teacher.toLowerCase().includes(searchSubject.toLowerCase()));

                        return (
                          <td
                            key={day.dayKey}
                            className={`p-2 border-r border-slate-200 align-top transition-all ${
                              isMatch ? 'ring-2 ring-amber-400 bg-amber-50' : ''
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl border ${colors.bg} ${colors.border} space-y-1 relative group hover:shadow-xs transition-all`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className={`font-bold text-xs ${colors.text} leading-tight`}>
                                  {p.subject}
                                </div>
                                {role === 'gvcn' && (
                                  <button
                                    onClick={() =>
                                      setEditingPeriod({
                                        dayKey: day.dayKey,
                                        session: 'morning',
                                        periodIndex,
                                        data: { ...p },
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#003366] transition-opacity"
                                    title="Chỉnh sửa tiết học"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{p.teacher}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex items-center justify-between pt-0.5">
                                <span className="bg-white/80 px-1 py-0.2 rounded border border-slate-200/60 font-mono">
                                  {p.room}
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* BREAK TIME DIVIDER */}
                <tr className="bg-slate-100 font-bold text-slate-600 text-center text-xs">
                  <td colSpan={3} className="py-2 border-r border-slate-200 text-slate-500">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>11:20 - 13:30</span>
                    </div>
                  </td>
                  <td colSpan={6} className="py-2 text-slate-600 uppercase tracking-widest text-[11px] bg-slate-100/90">
                    🍱 NGHỈ TRƯA & SINH HOẠT BÁN TRÚ TỰ NHIÊN (11:20 - 13:30)
                  </td>
                </tr>

                {/* AFTERNOON SESSIONS (TIẾT 1 -> 5) */}
                {[0, 1, 2, 3, 4].map((periodIndex) => {
                  const periodNum = periodIndex + 1;
                  const samplePeriod = timetable.days[0].afternoon[periodIndex];

                  return (
                    <tr key={`afternoon-${periodIndex}`} className="hover:bg-slate-50/70 transition-colors">
                      {periodIndex === 0 && (
                        <td
                          rowSpan={5}
                          className="p-3 font-bold text-blue-900 bg-blue-50/80 border-r border-slate-200 text-center uppercase tracking-wider"
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Sunset className="w-5 h-5 text-blue-600" />
                            <span>BUỔI CHIỀU</span>
                            <span className="text-[10px] text-blue-700 font-normal">5 Tiết</span>
                          </div>
                        </td>
                      )}
                      <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200 text-center bg-slate-50/50">
                        Tiết {periodNum}
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-500 font-mono border-r border-slate-200 text-center">
                        {samplePeriod?.time || ''}
                      </td>
                      {timetable.days.map((day) => {
                        const p = day.afternoon[periodIndex];
                        if (!p) return <td key={day.dayKey} className="p-2 border-r border-slate-200"></td>;

                        const colors = getSubjectColor(p.subject);
                        const isMatch =
                          searchSubject &&
                          (p.subject.toLowerCase().includes(searchSubject.toLowerCase()) ||
                            p.teacher.toLowerCase().includes(searchSubject.toLowerCase()));

                        return (
                          <td
                            key={day.dayKey}
                            className={`p-2 border-r border-slate-200 align-top transition-all ${
                              isMatch ? 'ring-2 ring-amber-400 bg-amber-50' : ''
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl border ${colors.bg} ${colors.border} space-y-1 relative group hover:shadow-xs transition-all`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className={`font-bold text-xs ${colors.text} leading-tight`}>
                                  {p.subject}
                                </div>
                                {role === 'gvcn' && (
                                  <button
                                    onClick={() =>
                                      setEditingPeriod({
                                        dayKey: day.dayKey,
                                        session: 'afternoon',
                                        periodIndex,
                                        data: { ...p },
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#003366] transition-opacity"
                                    title="Chỉnh sửa tiết học"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{p.teacher}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex items-center justify-between pt-0.5">
                                <span className="bg-white/80 px-1 py-0.2 rounded border border-slate-200/60 font-mono">
                                  {p.room}
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= VIEW MODE 2: DAILY TIMELINE CARDS ======================= */}
      {viewMode === 'daily' && (
        <div className="space-y-5">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {timetable.days.map((day) => {
              const isSelected = activeTab === day.dayKey;
              return (
                <button
                  key={day.dayKey}
                  onClick={() => setActiveTab(day.dayKey)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{day.dayName}</span>
                </button>
              );
            })}
          </div>

          {/* Daily 2 Sessions Split Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MORNING CARD (5 PERIODS) */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Buổi Sáng • {activeDaySchedule.dayName}
                    </h3>
                    <p className="text-[11px] text-slate-500">5 Tiết học (07:00 - 11:20)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Chính Khóa
                </span>
              </div>

              {/* List of 5 periods */}
              <div className="space-y-3">
                {activeDaySchedule.morning.map((p, idx) => {
                  const colors = getSubjectColor(p.subject);
                  return (
                    <div
                      key={`m-${p.period}`}
                      className={`p-3.5 rounded-xl border ${colors.bg} ${colors.border} flex items-start justify-between gap-3`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white shadow-2xs border border-slate-200 text-[#003366] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {p.period}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{p.subject}</span>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-600">
                              {p.time}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {p.teacher}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {p.room}
                            </span>
                          </div>
                          {p.note && (
                            <div className="text-[11px] text-slate-500 italic bg-white/70 px-2 py-1 rounded border border-slate-100">
                              📝 {p.note}
                            </div>
                          )}
                        </div>
                      </div>

                      {role === 'gvcn' && (
                        <button
                          onClick={() =>
                            setEditingPeriod({
                              dayKey: activeDaySchedule.dayKey,
                              session: 'morning',
                              periodIndex: idx,
                              data: { ...p },
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-[#003366] rounded-lg hover:bg-white/80 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AFTERNOON CARD (5 PERIODS) */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Buổi Chiều • {activeDaySchedule.dayName}
                    </h3>
                    <p className="text-[11px] text-slate-500">5 Tiết học (13:30 - 17:45)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  Bồi Dưỡng & Khối A
                </span>
              </div>

              {/* List of 5 periods */}
              <div className="space-y-3">
                {activeDaySchedule.afternoon.map((p, idx) => {
                  const colors = getSubjectColor(p.subject);
                  return (
                    <div
                      key={`a-${p.period}`}
                      className={`p-3.5 rounded-xl border ${colors.bg} ${colors.border} flex items-start justify-between gap-3`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white shadow-2xs border border-slate-200 text-[#003366] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {p.period}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{p.subject}</span>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-600">
                              {p.time}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {p.teacher}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {p.room}
                            </span>
                          </div>
                          {p.note && (
                            <div className="text-[11px] text-slate-500 italic bg-white/70 px-2 py-1 rounded border border-slate-100">
                              📝 {p.note}
                            </div>
                          )}
                        </div>
                      </div>

                      {role === 'gvcn' && (
                        <button
                          onClick={() =>
                            setEditingPeriod({
                              dayKey: activeDaySchedule.dayKey,
                              session: 'afternoon',
                              periodIndex: idx,
                              data: { ...p },
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-[#003366] rounded-lg hover:bg-white/80 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERIOD MODAL (GVCN & BGH) */}
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
                  required
                  value={editingPeriod.data.subject}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      data: { ...editingPeriod.data, subject: e.target.value },
                    })
                  }
                  placeholder="Ví dụ: Toán Học (Giải Tích)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo Viên Giảng Dạy:</label>
                <input
                  type="text"
                  required
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
                    required
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
                    required
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
