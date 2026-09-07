import React, { useState } from 'react';
import {
  ShieldAlert,
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DisciplineEntry, ClassJournalEntry, UserRole, Student } from '../../types';
import { EditDisciplineModal } from './EditDisciplineModal';
import { EditJournalModal } from './EditJournalModal';

interface HomeroomBookDisciplineAndJournalProps {
  disciplineLogs: DisciplineEntry[];
  journal: ClassJournalEntry[];
  students?: Student[];
  role: UserRole;
  onUpdateDisciplineLogs?: (logs: DisciplineEntry[]) => void;
  onUpdateJournal?: (journal: ClassJournalEntry[]) => void;
}

export const HomeroomBookDisciplineAndJournal: React.FC<HomeroomBookDisciplineAndJournalProps> = ({
  disciplineLogs,
  journal,
  students = [],
  role,
  onUpdateDisciplineLogs,
  onUpdateJournal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'bonus' | 'violation' | 'penalty'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineEntry | null>(null);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<ClassJournalEntry | null>(null);

  const canEditDiscipline = role === 'gvcn' || role === 'csl';
  const canEditJournal = role === 'gvcn' || role === 'gvbm' || role === 'csl';
  const canDelete = role === 'gvcn';

  const filteredDiscipline = (disciplineLogs || []).filter((log) => {
    const matchType =
      filterType === 'all' ||
      (filterType === 'bonus' && log.type === 'bonus') ||
      ((filterType === 'violation' || filterType === 'penalty') &&
        (log.type === 'violation' || log.type === 'penalty'));

    const matchSearch =
      (log.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const bonusCount = (disciplineLogs || []).filter((l) => l.type === 'bonus').length;
  const violationCount = (disciplineLogs || []).filter(
    (l) => l.type === 'violation' || l.type === 'penalty'
  ).length;

  // Discipline Handlers
  const handleOpenAddDiscipline = () => {
    setSelectedDiscipline(null);
    setIsDisciplineModalOpen(true);
  };

  const handleOpenEditDiscipline = (log: DisciplineEntry) => {
    setSelectedDiscipline(log);
    setIsDisciplineModalOpen(true);
  };

  const handleDeleteDiscipline = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục ghi nhận này?')) return;
    const updated = (disciplineLogs || []).filter((l) => l.id !== id);
    if (onUpdateDisciplineLogs) onUpdateDisciplineLogs(updated);
  };

  const handleSaveDiscipline = (saved: DisciplineEntry) => {
    let updated = [...(disciplineLogs || [])];
    const index = updated.findIndex((l) => l.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.unshift(saved);
    }
    if (onUpdateDisciplineLogs) onUpdateDisciplineLogs(updated);
  };

  // Journal Handlers
  const handleOpenAddJournal = () => {
    setSelectedJournal(null);
    setIsJournalModalOpen(true);
  };

  const handleOpenEditJournal = (entry: ClassJournalEntry) => {
    setSelectedJournal(entry);
    setIsJournalModalOpen(true);
  };

  const handleDeleteJournal = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tiết học này khỏi Sổ Đầu Bài?')) return;
    const updated = (journal || []).filter((j) => j.id !== id);
    if (onUpdateJournal) onUpdateJournal(updated);
  };

  const handleSaveJournal = (saved: ClassJournalEntry) => {
    let updated = [...(journal || [])];
    const index = updated.findIndex((j) => j.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.unshift(saved);
    }
    if (onUpdateJournal) onUpdateJournal(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 5: THEO DÕI NỀ NẾP, CHUYÊN CẦN, THI ĐUA & SỔ ĐẦU BÀI
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Nhật ký khen thưởng, vi phạm nội quy trường lớp và xếp loại tiết học theo sổ đầu bài
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">Tổng Lượt Ghi Nhận</span>
          <span className="text-2xl font-black text-slate-900">{(disciplineLogs || []).length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Toàn bộ kỳ học</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">Khen Thưởng / Điểm Cộng</span>
          <span className="text-2xl font-black text-emerald-600">+{bonusCount}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Thành tích học tập & phong trào</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm">
          <span className="text-xs font-bold text-rose-700 block">Vi Phạm / Nhắc Nhở</span>
          <span className="text-2xl font-black text-rose-600">-{violationCount}</span>
          <span className="text-[10px] text-rose-500 block mt-0.5">Đã khắc phục 100%</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm">
          <span className="text-xs font-bold text-blue-700 block">Tiết Học Xếp Loại A</span>
          <span className="text-2xl font-black text-blue-600">
            {(journal || []).filter((j) => j.rating === 'A').length} / {(journal || []).length}
          </span>
          <span className="text-[10px] text-blue-600 block mt-0.5">Đạt tỷ lệ 95.8%</span>
        </div>
      </div>

      {/* 1. Sổ Nhật Ký Khen Thưởng & Vi Phạm */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            1. Nhật Ký Theo Dõi Thi Đua, Khen Thưởng & Kỷ Luật
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Tìm học sinh, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Tất cả ({(disciplineLogs || []).length})</option>
              <option value="bonus">Khen thưởng (+)</option>
              <option value="violation">Vi phạm (-)</option>
            </select>

            {canEditDiscipline && (
              <button
                type="button"
                onClick={handleOpenAddDiscipline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Ghi Nhận Mới</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3">Học Sinh</th>
                <th className="py-2.5 px-3 text-center">Loại</th>
                <th className="py-2.5 px-3">Hạng Mục</th>
                <th className="py-2.5 px-3 text-center">Điểm Số</th>
                <th className="py-2.5 px-4">Nội Dung Chi Tiết</th>
                <th className="py-2.5 px-3">Thời Gian</th>
                {(canEditDiscipline || canDelete) && <th className="py-2.5 px-3 text-center w-20">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiscipline.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.studentName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        log.type === 'bonus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.type === 'bonus' ? 'Khen thưởng' : 'Vi phạm'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{log.category}</td>
                  <td className="py-2.5 px-3 text-center font-black">
                    <span className={log.points > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {log.points > 0 ? `+${log.points}` : log.points}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 max-w-sm">{log.reason}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  {(canEditDiscipline || canDelete) && (
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {canEditDiscipline && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditDiscipline(log)}
                            className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                            title="Sửa ghi nhận"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDiscipline(log.id)}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                            title="Xóa ghi nhận"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Sổ Đầu Bài Lớp 12A1 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            2. Trích Lục Nhật Ký Sổ Đầu Bài Lớp Học
          </h4>
          {canEditJournal && (
            <button
              type="button"
              onClick={handleOpenAddJournal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Ghi Sổ Đầu Bài Mới</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3">Thứ / Tiết</th>
                <th className="py-2.5 px-3">Môn Học</th>
                <th className="py-2.5 px-3">Giáo Viên Dạy</th>
                <th className="py-2.5 px-4">Tên Bài Dạy & Nội Dung</th>
                <th className="py-2.5 px-3 text-center">Xếp Loại</th>
                <th className="py-2.5 px-4">Nhận Xét Của Giáo Viên</th>
                {(canEditJournal || canDelete) && <th className="py-2.5 px-3 text-center w-20">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(journal || []).map((j, idx) => (
                <tr key={j.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {j.day || 'Thứ Hai'} (Tiết {j.period})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-900">{j.subject}</td>
                  <td className="py-2.5 px-3 text-slate-700">{j.teacher || j.teacherName}</td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">
                    {j.lessonContent || j.lessonTopic}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-black text-xs ${
                        j.rating === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : j.rating === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Loại {j.rating} ({j.points || 10}đ)
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                    {j.note || j.notes || 'Lớp trật tự, học tập tích cực.'}
                  </td>
                  {(canEditJournal || canDelete) && (
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {canEditJournal && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditJournal(j)}
                            className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                            title="Sửa tiết học"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteJournal(j.id)}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                            title="Xóa tiết học"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Discipline Modal */}
      {isDisciplineModalOpen && (
        <EditDisciplineModal
          isOpen={isDisciplineModalOpen}
          onClose={() => setIsDisciplineModalOpen(false)}
          entry={selectedDiscipline}
          students={students}
          onSave={handleSaveDiscipline}
        />
      )}

      {/* Edit Journal Modal */}
      {isJournalModalOpen && (
        <EditJournalModal
          isOpen={isJournalModalOpen}
          onClose={() => setIsJournalModalOpen(false)}
          entry={selectedJournal}
          onSave={handleSaveJournal}
        />
      )}
    </div>
  );
};
