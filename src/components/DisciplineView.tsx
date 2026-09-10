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
  const [bghSigned, setBghSigned] = useState(true);
  const [bghDirectiveText, setBghDirectiveText] = useState('Ban Giám Hiệu ghi nhận: Nề nếp chuyên cần của lớp tốt. Đề nghị GVCN tiếp tục động viên học sinh giữ vững kỷ luật trong giai đoạn thi đua nước rút.');
  const [showDirectiveEdit, setShowDirectiveEdit] = useState(false);
  const [bghToast, setBghToast] = useState<string | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSignWeeklyJournal = () => {
    setBghSigned(true);
    setBghToast('Ban Giám Hiệu đã phê duyệt nề nếp thi đua tuần thứ 24 thành công!');
    setTimeout(() => setBghToast(null), 4000);
  };

  const filteredLogs = disciplineLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.type === selectedFilter;
  });

  // Read synced base score from localStorage (defaults to 0đ if base score is set to 0)
  const attBase = localStorage.getItem('emulation_attendance_base_score') !== null
    ? Math.max(0, Number(localStorage.getItem('emulation_attendance_base_score')))
    : 0;
  const condBase = localStorage.getItem('emulation_conduct_base_score') !== null
    ? Math.max(0, Number(localStorage.getItem('emulation_conduct_base_score')))
    : 0;
  const baseScore = Math.round(attBase * 0.4 + condBase * 0.6);

  // Calculate Group statistics (Synchronized with Base Score configuration)
  const groupStats = [1, 2, 3, 4].map((g) => {
    const groupStudents = students.filter((s) => s.group === g);
    const studentIds = new Set(groupStudents.map((s) => s.id));

    const groupLogs = disciplineLogs.filter(
      (l) => l.group === g || (l.studentId && studentIds.has(l.studentId))
    );

    const bonusLogs = groupLogs.filter((l) => l.type === 'bonus' || l.type === 'commendation');
    const penaltyLogs = groupLogs.filter((l) => l.type === 'penalty' || l.type === 'violation');

    const bonusCount = bonusLogs.length;
    const penaltyCount = penaltyLogs.length;

    const bonusPoints = bonusLogs.reduce((sum, l) => sum + Math.abs(l.points || 0), 0);
    const penaltyPoints = penaltyLogs.reduce((sum, l) => sum + Math.abs(l.points || 0), 0);

    const score = baseScore + bonusPoints - penaltyPoints;

    return { group: g, score, bonus: bonusCount, penalty: penaltyCount, count: groupStudents.length };
  }).sort((a, b) => b.score - a.score);

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
            Theo Dõi Nề Nếp & Điểm Thi Đua
          </h2>
          <p className="text-xs text-slate-500">
            Đánh giá chuyên cần, theo dõi nề nếp và cộng/trừ điểm rèn luyện 4 Tổ
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
              <span>{bghSigned ? '✓ BGH Đã Phê Duyệt Nề Nếp Tuần 24' : 'Ký Số & Phê Duyệt Nề Nếp'}</span>
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

        {(role === 'gvcn' || role === 'csl') && (
          <div className="flex items-center gap-2">
            <button
              id="btn-open-add-discipline"
              onClick={onOpenAddDiscipline}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cộng / Trừ Điểm Thi Đua</span>
            </button>
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
                Ý Kiến Thanh Tra & Chỉ Đạo Của Ban Giám Hiệu Về Nề Nếp Lớp Học
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
              {item.score} <span className="text-xs font-normal text-slate-400">điểm TB</span>
            </h4>
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">+{item.bonus} tuyên dương</span>
              <span className="text-red-600 font-semibold">-{item.penalty} vi phạm</span>
            </div>
          </div>
        ))}
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
