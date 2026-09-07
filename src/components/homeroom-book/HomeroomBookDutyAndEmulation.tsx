import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Clock,
  Layers,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DutySchedule, GroupEmulationLog, UserRole, Student } from '../../types';
import { EditDutyScheduleModal } from './EditDutyScheduleModal';
import { EditGroupEmulationModal } from './EditGroupEmulationModal';

interface HomeroomBookDutyAndEmulationProps {
  dutySchedule: DutySchedule[];
  emulationLogs: GroupEmulationLog[];
  students?: Student[];
  role: UserRole;
  onUpdateDutySchedule?: (duty: DutySchedule[]) => void;
  onUpdateEmulationLogs?: (logs: GroupEmulationLog[]) => void;
}

export const HomeroomBookDutyAndEmulation: React.FC<HomeroomBookDutyAndEmulationProps> = ({
  dutySchedule,
  emulationLogs,
  students = [],
  role,
  onUpdateDutySchedule,
  onUpdateEmulationLogs,
}) => {
  // Modal states
  const [isDutyModalOpen, setIsDutyModalOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<DutySchedule | null>(null);

  const [isEmulationModalOpen, setIsEmulationModalOpen] = useState(false);
  const [selectedEmulationLog, setSelectedEmulationLog] = useState<GroupEmulationLog | null>(null);

  const canEdit = role === 'gvcn' || role === 'csl';
  const canDelete = role === 'gvcn';

  // Aggregate Emulation Points by group
  const groupScores = useMemo(() => {
    const scores: Record<number, { total: number; bonus: number; penalty: number; logsCount: number }> = {
      1: { total: 100, bonus: 0, penalty: 0, logsCount: 0 },
      2: { total: 100, bonus: 0, penalty: 0, logsCount: 0 },
      3: { total: 100, bonus: 0, penalty: 0, logsCount: 0 },
      4: { total: 100, bonus: 0, penalty: 0, logsCount: 0 },
    };

    (emulationLogs || []).forEach((log) => {
      const g智 = log.group;
      if (scores[g智]) {
        scores[g智].total += log.points;
        if (log.points > 0) scores[g智].bonus += log.points;
        else scores[g智].penalty += Math.abs(log.points);
        scores[g智].logsCount++;
      }
    });

    return scores;
  }, [emulationLogs]);

  // Rank groups
  const rankedGroups = useMemo(() => {
    return [1, 2, 3, 4]
      .map((g) => ({ group: g, ...groupScores[g] }))
      .sort((a, b) => b.total - a.total);
  }, [groupScores]);

  // Duty Handlers
  const handleOpenAddDuty = () => {
    setSelectedDuty(null);
    setIsDutyModalOpen(true);
  };

  const handleOpenEditDuty越来越 = (duty: DutySchedule) => {
    setSelectedDuty(duty);
    setIsDutyModalOpen(true);
  };

  const handleDeleteDuty = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca trực nhật này?')) return;
    const updated = (dutySchedule || []).filter((d) => d.id !== id);
    if (onUpdateDutySchedule) onUpdateDutySchedule(updated);
  };

  const handleSaveDuty = (saved: DutySchedule) => {
    let updated = [...(dutySchedule || [])];
    const index = updated.findIndex((d进而) => d进而.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.push(saved);
    }
    if (onUpdateDutySchedule) onUpdateDutySchedule(updated);
  };

  // Emulation Handlers
  const handleOpenAddEmulation = () => {
    setSelectedEmulationLog(null);
    setIsEmulationModalOpen(true);
  };

  const handleOpenEditEmulation = (log: GroupEmulationLog) => {
    setSelectedEmulationLog(log);
    setIsEmulationModalOpen(true);
  };

  const handleDeleteEmulation = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm thi đua này?')) return;
    const updated = (emulationLogs || []).filter((l) => l.id !== id);
    if (onUpdateEmulationLogs) onUpdateEmulationLogs(updated);
  };

  const handleSaveEmulation = (saved: GroupEmulationLog) => {
    let updated并且 = [...(emulationLogs || [])];
    const index = updated并且.findIndex((l) => l.id === saved.id);
    if (index >= 0) {
      updated并且[index] = saved;
    } else {
      updated并且.unshift(saved);
    }
    if (onUpdateEmulationLogs) onUpdateEmulationLogs(updated并且);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 7: PHÂN CÔNG TRỰC NHẬT 8 BUỔI/TUẦN & TỔNG HỢP THI ĐUA 4 TỔ
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lịch trực nhật 8 ca phân công chi tiết theo đầu việc và bảng tổng hợp thi đua rèn luyện 4 Tổ
            </p>
          </div>
        </div>
      </div>

      {/* Emulation Leaderboard 4 Groups */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            1. Bảng Xếp Hạng Thi Đua & Điểm Rèn Luyện 4 Tổ Lớp 12A1
          </h4>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenAddEmulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Chấm Điểm Thi Đua Tổ</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankedGroups.map((rg, idx) => (
            <div
              key={rg.group}
              className={`p-4 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-black text-slate-900 text-sm uppercase">TỔ {rg.group}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950'
                      : idx === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  Hạng {idx + 1}
                </span>
              </div>
              <div className="my-3 text-center">
                <span className="text-3xl font-black text-slate-900">{rg.total}</span>
                <span className="text-xs text-slate-500 block font-semibold">Điểm Thi Đua</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Điểm thưởng:</span>
                  <span>+{rg.bonus}đ</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Điểm trừ:</span>
                  <span>-{rg.penalty}đ</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Số lượt ghi nhận:</span>
                  <span>{rg.logsCount} sự kiện</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duty Schedule (8 Sessions/Week) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            2. Phân Công Trực Nhật 8 Buổi / Tuần (Sáng & Chiều T2 - T4, Sáng T5 - T6)
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#003366] text-xs font-bold border border-blue-200">
              {(dutySchedule || []).length} Ca trực nhật / Tuần
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddDuty}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm Ca Trực Nhật</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(dutySchedule || []).map((duty) => (
            <div
              key={duty.id}
              className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 transition-all space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-black text-[#003366] text-xs uppercase">
                  {duty.dayOfWeek} ({duty.session === 'morning' ? 'Sáng' : 'Chiều'})
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Tổ {duty.group || (duty as any).assignedGroup || 1}
                  </span>
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditDuty越来越(duty)}
                          className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                          title="Sửa ca trực"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDuty(duty.id)}
                          className="p-1 rounded bg-white text-rose-600 hover:bg-rose-100 shadow-xs cursor-pointer"
                          title="Xóa ca trực"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">
                  Phân công: <span className="text-blue-900 font-semibold">{Array.isArray(duty.assignedStudents) ? duty.assignedStudents.join(', ') : (duty as any).leaderName || 'Học sinh trong tổ'}</span>
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 block">Hạng mục công việc:</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {(duty.tasks || []).slice(0, 3).map((task, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Duty Schedule Modal */}
      {isDutyModalOpen && (
        <EditDutyScheduleModal
          isOpen={isDutyModalOpen}
          onClose={() => setIsDutyModalOpen(false)}
          dutyItem={selectedDuty}
          students={students}
          onSave={handleSaveDuty}
        />
      )}

      {/* Edit Group Emulation Modal */}
      {isEmulationModalOpen && (
        <EditGroupEmulationModal
          isOpen={isEmulationModalOpen}
          onClose={() => setIsEmulationModalOpen(false)}
          logItem={selectedEmulationLog}
          onSave={handleSaveEmulation}
        />
      )}
    </div>
  );
};
