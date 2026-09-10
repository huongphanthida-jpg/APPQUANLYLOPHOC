import React, { useState } from 'react';
import { X, Save, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { TimetableData, DaySchedule, TimetablePeriod } from '../../types';

interface EditTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableData;
  onSave: (savedTimetable: TimetableData) => void;
}

export const EditTimetableModal: React.FC<EditTimetableModalProps> = ({
  isOpen,
  onClose,
  timetable,
  onSave,
}) => {
  const [appliedDate, setAppliedDate] = useState<string>(
    timetable?.appliedDate || '05/01/2026'
  );
  const [morningTime, setMorningTime] = useState<string>(
    timetable?.morningTime || '07:00 - 11:20'
  );
  const [morningLabel, setMorningLabel] = useState<string>(
    timetable?.morningLabel || 'CÁC MÔN VĂN HÓA CHÍNH KHÓA'
  );
  const [afternoonTime, setAfternoonTime] = useState<string>(
    timetable?.afternoonTime || '13:30 - 17:45'
  );
  const [afternoonLabel, setAfternoonLabel] = useState<string>(
    timetable?.afternoonLabel || 'ÔN LUYỆN CHUYÊN ĐỀ & GDTC/HĐTN'
  );

  const [dayKey, setDayKey] = useState<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>('mon');
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [subject, setSubject] = useState<string>('Toán');
  const [teacher, setTeacher] = useState<string>('Thầy An (GVCN)');
  const [room, setRoom] = useState<string>('P.302');
  const [time, setTime] = useState<string>('07:15 - 08:00');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectSlot = (
    selDayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat',
    selSession: 'morning' | 'afternoon',
    selPeriod: number
  ) => {
    setDayKey(selDayKey);
    setSession(selSession);
    setPeriodNumber(selPeriod);
    const dayData = (timetable?.days || []).find((d) => d.dayKey === selDayKey);
    const periodList = selSession === 'morning' ? dayData?.morning : dayData?.afternoon;
    const found = (periodList || []).find((p) => p.period === selPeriod);
    if (found) {
      setSubject(found.subject || '');
      setTeacher(found.teacher || '');
      setRoom(found.room || 'P.302');
      setTime(found.time || (selSession === 'morning' ? '07:15 - 08:00' : '13:30 - 14:15'));
      setNote(found.note || '');
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDays: DaySchedule[] = JSON.parse(JSON.stringify(timetable?.days || []));
    let targetDay = updatedDays.find((d) => d.dayKey === dayKey);

    if (!targetDay) {
      const dayNames: Record<string, string> = {
        mon: 'Thứ Hai',
        tue: 'Thứ Ba',
        wed: 'Thứ Tư',
        thu: 'Thứ Năm',
        fri: 'Thứ Sáu',
        sat: 'Thứ Bảy',
      };
      targetDay = {
        dayKey,
        dayName: dayNames[dayKey] || 'Thứ Hai',
        morning: [],
        afternoon: [],
      };
      updatedDays.push(targetDay);
    }

    const targetList = session === 'morning' ? targetDay.morning : targetDay.afternoon;
    const existingIndex = targetList.findIndex((p) => p.period === periodNumber);

    const periodData: TimetablePeriod = {
      period: periodNumber,
      time: time || (session === 'morning' ? '07:15 - 08:00' : '13:30 - 14:15'),
      subject,
      teacher,
      room,
      note,
    };

    if (existingIndex >= 0) {
      targetList[existingIndex] = periodData;
    } else {
      targetList.push(periodData);
      targetList.sort((a, b) => a.period - b.period);
    }

    const updatedTimetable: TimetableData = {
      academicYear: timetable?.academicYear || '2025 - 2026',
      appliedDate: appliedDate || '05/01/2026',
      morningTime: morningTime || '07:00 - 11:20',
      morningLabel: morningLabel || 'CÁC MÔN VĂN HÓA CHÍNH KHÓA',
      afternoonTime: afternoonTime || '13:30 - 17:45',
      afternoonLabel: afternoonLabel || 'ÔN LUYỆN CHUYÊN ĐỀ & GDTC/HĐTN',
      days: updatedDays,
    };

    onSave(updatedTimetable);
    onClose();
  };

  const dayOptions: { key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'; label: string }[] = [
    { key: 'mon', label: 'Thứ Hai' },
    { key: 'tue', label: 'Thứ Ba' },
    { key: 'wed', label: 'Thứ Tư' },
    { key: 'thu', label: 'Thứ Năm' },
    { key: 'fri', label: 'Thứ Sáu' },
    { key: 'sat', label: 'Thứ Bảy' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Chỉnh Sửa Thời Khóa Biểu Lớp</h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật thông tin hiển thị khung giờ, ngày áp dụng & phân công môn học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSaveSlot} className="p-6 space-y-5 text-xs overflow-y-auto">
          {/* Section 1: Cấu hình khung thời gian & thông tin tiêu đề */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
              <div className="flex items-center gap-2 text-[#003366] font-black text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>1. Cấu Hình Ngày Áp Dụng & Khung Giờ Buổi Học</span>
              </div>
              <span className="text-[10px] text-indigo-700 font-semibold">Tự điều chỉnh hiển thị</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời gian áp dụng (Hiển thị góc phải TKB):</label>
              <input
                type="text"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: 05/01/2026 hoặc Học kỳ II (05/01/2026)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-2 p-3 bg-white/80 rounded-xl border border-blue-100">
                <span className="font-black text-blue-900 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                  ☀️ Buổi Sáng:
                </span>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Khung giờ (VD: 07:00 - 11:20):</label>
                  <input
                    type="text"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 font-bold text-blue-950 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="07:00 - 11:20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nội dung / Tiêu đề buổi sáng:</label>
                  <input
                    type="text"
                    value={morningLabel}
                    onChange={(e) => setMorningLabel(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CÁC MÔN VĂN HÓA CHÍNH KHÓA"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-white/80 rounded-xl border border-amber-100">
                <span className="font-black text-amber-900 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                  🌙 Buổi Chiều:
                </span>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Khung giờ (VD: 13:30 - 17:45):</label>
                  <input
                    type="text"
                    value={afternoonTime}
                    onChange={(e) => setAfternoonTime(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 font-bold text-amber-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="13:30 - 17:45"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nội dung / Tiêu đề buổi chiều:</label>
                  <input
                    type="text"
                    value={afternoonLabel}
                    onChange={(e) => setAfternoonLabel(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ÔN LUYỆN CHUYÊN ĐỀ & GDTC/HĐTN"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chỉnh sửa tiết học chi tiết */}
          <div className="space-y-3 pt-1 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#003366] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                2. Chỉnh Sửa Chi Tiết Tiết Học Theo Lịch
              </span>
              <span className="text-[10px] text-slate-500">Chọn vị trí tiết để cập nhật</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buổi học:</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSelectSlot(dayKey, 'morning', periodNumber)}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      session === 'morning' ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSlot(dayKey, 'afternoon', periodNumber)}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      session === 'afternoon' ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Chiều
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày trong tuần:</label>
                <select
                  value={dayKey}
                  onChange={(e) =>
                    handleSelectSlot(
                      e.target.value as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat',
                      session,
                      periodNumber
                    )
                  }
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dayOptions.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiết thứ:</label>
                <select
                  value={periodNumber}
                  onChange={(e) => handleSelectSlot(dayKey, session, Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Tiết 1</option>
                  <option value={2}>Tiết 2</option>
                  <option value={3}>Tiết 3</option>
                  <option value={4}>Tiết 4</option>
                  <option value={5}>Tiết 5</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên môn học:</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Toán, Vật lí, Hóa học, Sinh học, Ngữ văn..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giáo viên giảng dạy:</label>
                  <input
                    type="text"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Cô Phan Thị Dạ Hương"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng học (nếu có):</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="P.302, Lab Tin..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khung giờ tiết học:</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="07:15 - 08:00"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú (dụng cụ / bài tập):</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mang máy tính Casio..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Lưu Cấu Hình & Thời Khóa Biểu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
