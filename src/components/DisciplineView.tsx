import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Landmark,
  BookmarkCheck,
  ShieldCheck,
  ClipboardCheck,
  Trash2
} from 'lucide-react';
import { DisciplineEntry, ClassJournalEntry, Student, UserRole } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface DisciplineViewProps {
  students: Student[];
  disciplineLogs: DisciplineEntry[];
  journal: ClassJournalEntry[];
  onOpenAddDiscipline: () => void;
  onAddJournalEntry: (entry: Omit<ClassJournalEntry, 'id'>) => void;
  onDeleteDisciplineLog?: (id: string) => void;
  onDeleteJournalEntry?: (id: string) => void;
  role: UserRole;
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  students,
  disciplineLogs,
  journal,
  onOpenAddDiscipline,
  onAddJournalEntry,
  onDeleteDisciplineLog,
  onDeleteJournalEntry,
  role,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bonus' | 'penalty'>('all');
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [bghSigned, setBghSigned] = useState(true);
  const [bghDirectiveText, setBghDirectiveText] = useState('Ban Giám Hiệu ghi nhận: Nề nếp chuyên cần của lớp tốt, 100% tiết học đạt chuẩn A. Đề nghị GVCN tiếp tục động viên học sinh giữ vững kỷ luật trong giai đoạn ôn thi nước rút.');
  const [showDirectiveEdit, setShowDirectiveEdit] = useState(false);
  const [bghToast, setBghToast] = useState<string | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [newJournal, setNewJournal] = useState<Omit<ClassJournalEntry, 'id'>>({
    dayOfWeek: 'Thứ Năm',
    date: new Date().toISOString().split('T')[0],
    period: 1,
    subject: 'Toán học',
    teacherName: 'Thầy Trần Đình Khôi',
    lessonName: '',
    attendance: 'Đủ 42/42',
    assessment: 'A',
    notes: '',
  });

  const handleSignWeeklyJournal = () => {
    setBghSigned(true);
    setBghToast('Ban Giám Hiệu đã ký số xác nhận Sổ Đầu Bài tuần thứ 24 thành công!');
    setTimeout(() => setBghToast(null), 4000);
  };

  const filteredLogs = disciplineLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.type === selectedFilter;
  });

  // Calculate Group statistics
  const groupStats = [1, 2, 3, 4].map((g) => {
    const groupStudents = students.filter((s) => s.group === g);
    const avgConduct = groupStudents.length
      ? Math.round(groupStudents.reduce((acc, s) => acc + s.conductScore, 0) / groupStudents.length)
      : 0;
    const bonus = disciplineLogs.filter((l) => l.group === g && l.type === 'bonus').length;
    const penalty = disciplineLogs.filter((l) => l.group === g && l.type === 'penalty').length;
    return { group: g, avgConduct, bonus, penalty, count: groupStudents.length };
  }).sort((a, b) => b.avgConduct - a.avgConduct);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournal.lessonName.trim()) return;
    onAddJournalEntry(newJournal);
    setShowAddJournal(false);
    setNewJournal({
      ...newJournal,
      lessonName: '',
      notes: '',
    });
  };

  return (
    <div id="discipline-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              NỀ NẾP & THI ĐUA
            </span>
            <span className="text-xs text-slate-400">Hệ thống tính điểm thời gian thực (Real-time)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#003366] mt-1">
            Sổ Đầu Bài Kỹ Thuật Số & Điểm Thi Đua
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý nhật ký tiết học, đánh giá chuyên cần, cộng/trừ điểm rèn luyện 4 Tổ
          </p>
        </div>

        {role === 'bgh' && (
          <div className="flex items-center gap-2">
            <button
              id="btn-bgh-sign-journal"
              onClick={handleSignWeeklyJournal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{bghSigned ? '✓ BGH Đã Ký Số Sổ Tuần 24' : 'Ký Số & Phê Duyệt Sổ Đầu Bài'}</span>
            </button>
            <button
              id="btn-bgh-add-directive"
              onClick={() => setShowDirectiveEdit(!showDirectiveEdit)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#003366] text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Landmark className="w-4 h-4 text-blue-700" />
              <span>Chỉ Đạo Sư Phạm BGH</span>
            </button>
          </div>
        )}

        {(role === 'gvcn' || role === 'gvbm' || role === 'csl') && (
          <div className="flex items-center gap-2">
            <button
              id="btn-open-add-journal"
              onClick={() => setShowAddJournal(!showAddJournal)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Ghi Sổ Đầu Bài</span>
            </button>

            {(role === 'gvcn' || role === 'csl') && (
              <button
                id="btn-open-add-discipline"
                onClick={onOpenAddDiscipline}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cộng / Trừ Điểm Thi Đua</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* BGH Toast Notification */}
      {bghToast && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{bghToast}</span>
        </div>
      )}

      {/* BGH Directive Box / Form */}
      {(role === 'bgh' || showDirectiveEdit) && (
        <div className="bg-gradient-to-br from-amber-50/90 via-slate-50 to-blue-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Ý Kiến Thanh Tra & Chỉ Đạo Của Ban Giám Hiệu Vào Sổ Đầu Bài
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
              Ký duyệt bởi: TS. Lê Thị Mai - P.Hiệu Trưởng
            </span>
          </div>

          {showDirectiveEdit ? (
            <div className="space-y-2">
              <textarea
                value={bghDirectiveText}
                onChange={(e) => setBghDirectiveText(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Nhập nhận xét thanh tra & chỉ đạo chuyên môn..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDirectiveEdit(false)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                >
                  Lưu Chỉ Đạo Sư Phạm
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{bghDirectiveText}"
              </p>
              {role === 'bgh' && (
                <button
                  onClick={() => setShowDirectiveEdit(true)}
                  className="text-[11px] font-bold text-blue-700 hover:underline shrink-0"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Journal Form Collapse */}
      {showAddJournal && (
        <form
          onSubmit={handleSaveJournal}
          className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <h3 className="text-sm font-bold text-[#003366] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Nhập Tiết Học Mới Vào Sổ Đầu Bài
            </h3>
            <span className="text-xs text-slate-500">THPT Trần Nguyên Hãn</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thứ & Tiết</label>
              <div className="flex gap-1.5">
                <select
                  value={newJournal.dayOfWeek}
                  onChange={(e) => setNewJournal({ ...newJournal, dayOfWeek: e.target.value })}
                  className="w-2/3 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Thứ Hai">Thứ 2</option>
                  <option value="Thứ Ba">Thứ 3</option>
                  <option value="Thứ Tư">Thứ 4</option>
                  <option value="Thứ Năm">Thứ 5</option>
                  <option value="Thứ Sáu">Thứ 6</option>
                  <option value="Thứ Bảy">Thứ 7</option>
                </select>
                <select
                  value={newJournal.period}
                  onChange={(e) => setNewJournal({ ...newJournal, period: Number(e.target.value) })}
                  className="w-1/3 px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                >
                  {[1, 2, 3, 4, 5].map((p) => (
                    <option key={p} value={p}>
                      T{p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                required
                value={newJournal.subject}
                onChange={(e) => setNewJournal({ ...newJournal, subject: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên dạy</label>
              <input
                type="text"
                required
                value={newJournal.teacherName}
                onChange={(e) => setNewJournal({ ...newJournal, teacherName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xếp loại tiết</label>
              <select
                value={newJournal.assessment}
                onChange={(e) => setNewJournal({ ...newJournal, assessment: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
              >
                <option value="A">Loại A (Tốt)</option>
                <option value="B">Loại B (Khá)</option>
                <option value="C">Loại C (Trung bình)</option>
                <option value="D">Loại D (Yếu)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài học</label>
              <input
                type="text"
                required
                placeholder="VD: Bài 12: Đồ thị hàm số phân thức bậc nhất..."
                value={newJournal.lessonName}
                onChange={(e) => setNewJournal({ ...newJournal, lessonName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhận xét của GV bộ môn</label>
              <input
                type="text"
                placeholder="Lớp sôi nổi, làm bài tốt..."
                value={newJournal.notes}
                onChange={(e) => setNewJournal({ ...newJournal, notes: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddJournal(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#003366] text-white text-xs font-bold shadow-xs"
            >
              Lưu Vào Sổ Đầu Bài
            </button>
          </div>
        </form>
      )}

      {/* 4 Groups Thi Đua Leaderboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {groupStats.map((item, idx) => (
          <div
            key={item.group}
            className={`p-4 rounded-2xl border ${
              idx === 0
                ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">TỔ {item.group}</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  idx === 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Hạng {idx + 1}
              </span>
            </div>
            <h4 className="text-2xl font-black text-[#003366] mt-1">
              {item.avgConduct} <span className="text-xs font-normal text-slate-400">điểm TB</span>
            </h4>
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">+{item.bonus} tuyên dương</span>
              <span className="text-red-600 font-semibold">-{item.penalty} vi phạm</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sổ Đầu Bài Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#003366]" />
            <h3 className="text-base font-bold text-[#003366]">
              Nhật Ký Sổ Đầu Bài Lớp Học
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Học kỳ I - Năm học 2025 - 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">Thứ / Ngày</th>
                <th className="py-3 px-2 text-center">Tiết</th>
                <th className="py-3 px-3">Môn học</th>
                <th className="py-3 px-3">Giáo viên</th>
                <th className="py-3 px-4">Tên bài dạy</th>
                <th className="py-3 px-3">Sĩ số</th>
                <th className="py-3 px-3">Xếp loại</th>
                <th className="py-3 px-4">Nhận xét của GV</th>
                {role === 'gvcn' && onDeleteJournalEntry && (
                  <th className="py-3 px-2 text-center w-12">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journal.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {entry.dayOfWeek}
                    <span className="block text-[10px] text-slate-400 font-normal">{entry.date}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-[#003366]">Tiết {entry.period}</td>
                  <td className="py-3 px-3 font-bold text-blue-900">{entry.subject}</td>
                  <td className="py-3 px-3 text-slate-700">{entry.teacherName}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{entry.lessonName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {entry.attendance}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Loại {entry.assessment}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 italic">{entry.notes || '—'}</td>
                  {role === 'gvcn' && onDeleteJournalEntry && (
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        id={`btn-delete-journal-${entry.id}`}
                        onClick={() => {
                          setConfirmModalState({
                            isOpen: true,
                            title: 'Xoá Mục Sổ Đầu Bài',
                            message: `Bạn có chắc muốn xoá mục sổ đầu bài môn ${entry.subject} (Tiết ${entry.period}, ngày ${entry.date})?`,
                            onConfirm: () => onDeleteJournalEntry(entry.id),
                          });
                        }}
                        title="Xoá mục sổ đầu bài"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Discipline & Commendation Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#003366] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Lịch Sử Điểm Cộng / Trừ Thi Đua Thời Gian Thực
            </h3>
            <p className="text-xs text-slate-500">
              Minh bạch mọi quyết định tuyên dương và vi phạm kỷ luật của học sinh
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'all' ? 'bg-[#003366] text-white' : 'bg-white border text-slate-600'
              }`}
            >
              Tất cả ({disciplineLogs.length})
            </button>
            <button
              onClick={() => setSelectedFilter('bonus')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'bonus' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              + Thưởng ({disciplineLogs.filter((l) => l.type === 'bonus').length})
            </button>
            <button
              onClick={() => setSelectedFilter('penalty')}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedFilter === 'penalty' ? 'bg-red-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              - Vi phạm ({disciplineLogs.filter((l) => l.type === 'penalty').length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                    log.type === 'bonus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.points > 0 ? `+${log.points}` : log.points}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{log.studentName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Tổ {log.group}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#003366]">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">{log.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ghi nhận bởi: {log.recordedBy} • Thời gian: {log.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    log.type === 'bonus'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {log.type === 'bonus' ? 'Tuyên Dương' : 'Vi Phạm'}
                </span>

                {role === 'gvcn' && onDeleteDisciplineLog && (
                  <button
                    type="button"
                    id={`btn-delete-discipline-${log.id}`}
                    onClick={() => {
                      setConfirmModalState({
                        isOpen: true,
                        title: 'Xoá Bản Ghi Thi Đua',
                        message: `Bạn có chắc muốn xoá bản ghi thi đua (${log.type === 'bonus' ? 'Tuyên dương' : 'Vi phạm'}) của học sinh "${log.studentName}"?`,
                        onConfirm: () => onDeleteDisciplineLog(log.id),
                      });
                    }}
                    title="Xoá bản ghi thi đua"
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalState && (
        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() => setConfirmModalState(null)}
          onConfirm={confirmModalState.onConfirm}
          title={confirmModalState.title}
          message={confirmModalState.message}
        />
      )}
    </div>
  );
};
