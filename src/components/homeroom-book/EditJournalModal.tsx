import React, { useState } from 'react';
import { X, Save, BookOpen, Clock, Calendar, Award } from 'lucide-react';
import { ClassJournalEntry } from '../../types';

interface EditJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ClassJournalEntry | null;
  onSave: (savedEntry: ClassJournalEntry) => void;
}

export const EditJournalModal: React.FC<EditJournalModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<string>(entry?.dayOfWeek || 'Thứ Hai');
  const [date, setDate] = useState<string>(
    entry?.date || new Date().toISOString().split('T')[0]
  );
  const [period, setPeriod] = useState<number>(entry?.period || 1);
  const [subject, setSubject] = useState<string>(entry?.subject || 'Toán học');
  const [teacherName, setTeacherName] = useState<string>(
    entry?.teacherName || 'Thầy Nguyễn Văn An'
  );
  const [lessonName, setLessonName] = useState<string>(
    entry?.lessonName || 'Ôn tập Phương trình Mặt phẳng trong không gian Oxyz'
  );
  const [assessment, setAssessment] = useState<'A' | 'B' | 'C' | 'D'>(
    entry?.assessment || 'A'
  );
  const [attendance, setAttendance] = useState<string>(entry?.attendance || 'Đủ');
  const [notes, setNotes] = useState<string>(entry?.notes || 'Lớp trật tự, chuẩn bị bài tốt');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved: ClassJournalEntry = {
      id: entry?.id || `jour-${Date.now()}`,
      dayOfWeek,
      date,
      period: Number(period),
      subject,
      teacherName,
      lessonName,
      attendance,
      assessment,
      notes,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {entry ? 'Chỉnh Sửa Tiết Học Sổ Đầu Bài' : 'Ghi Nhận Tiết Học Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật nội dung bài dạy, sĩ số, xếp loại và nhận xét của GVBM
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thứ:</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Thứ Hai">Thứ Hai</option>
                <option value="Thứ Ba">Thứ Ba</option>
                <option value="Thứ Tư">Thứ Tư</option>
                <option value="Thứ Năm">Thứ Năm</option>
                <option value="Thứ Sáu">Thứ Sáu</option>
                <option value="Thứ Bảy">Thứ Bảy</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ngày:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tiết số:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giáo viên đứng lớp:</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên bài học / Nội dung giảng dạy:</label>
            <input
              type="text"
              required
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Xếp loại tiết học:</label>
              <div className="grid grid-cols-4 gap-1">
                {(['A', 'B', 'C', 'D'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAssessment(r)}
                    className={`py-2 rounded-xl font-black text-center cursor-pointer transition-all ${
                      assessment === r
                        ? r === 'A'
                          ? 'bg-emerald-600 text-white'
                          : r === 'B'
                          ? 'bg-blue-600 text-white'
                          : r === 'C'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Loại {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Học sinh vắng mặt (nếu có):</label>
              <input
                type="text"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Đủ / Vắng 1 (Nam P)"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nhận xét của giáo viên bộ môn:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhận xét tinh thần học tập, trật tự..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{entry ? 'Cập Nhật Sổ Đầu Bài' : 'Lưu Vào Sổ Đầu Bài'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
