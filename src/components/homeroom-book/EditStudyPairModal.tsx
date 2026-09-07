import React, { useState } from 'react';
import { X, Save, HeartHandshake, Users, Target } from 'lucide-react';
import { StudyPair, Student } from '../../types';

interface EditStudyPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: StudyPair | null;
  students: Student[];
  onSave: (savedPair: StudyPair) => void;
}

export const EditStudyPairModal: React.FC<EditStudyPairModalProps> = ({
  isOpen,
  onClose,
  pair,
  students,
  onSave,
}) => {
  const [student1Id, setStudent1Id] = useState(pair?.student1?.id || students[0]?.id || '');
  const [student2Id, setStudent2Id] = useState(pair?.student2?.id || students[1]?.id || '');
  const [targetGoal, setTargetGoal] = useState(
    pair?.targetGoal || 'Kèm cặp môn Toán, nâng cao điểm thi thử'
  );
  const [deskLabel, setDeskLabel] = useState(pair?.deskLabel || 'Bàn 1 Dãy 1');
  const [status, setStatus] = useState<'active' | 'improving' | 'achieved'>(
    pair?.status || 'active'
  );
  const [progressNote, setProgressNote] = useState(
    pair?.progressNote || 'Hai bạn học tập ăn ý, tiến bộ đều'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st1 = students.find((s) => s.id === student1Id);
    const st2 = students.find((s) => s.id === student2Id);

    const saved: StudyPair = {
      id: pair?.id || `pair-${Date.now()}`,
      deskKey: pair?.deskKey || '1-1',
      deskLabel,
      student1: {
        id: student1Id,
        name: st1?.name || 'Học sinh 1',
        strongSubject: st1?.strengths || 'Toán học',
        gpa: st1?.grades?.gpa || 8.5,
      },
      student2: {
        id: student2Id,
        name: st2?.name || 'Học sinh 2',
        strongSubject: st2?.strengths || 'Ngữ Văn',
        gpa: st2?.grades?.gpa || 7.0,
      },
      targetGoal,
      status,
      progressNote,
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
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {pair ? 'Chỉnh Sửa Đôi Bạn Cùng Tiến' : 'Thiết Lập Đôi Bạn Cùng Tiến Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Ghép đôi học sinh giỏi hỗ trợ học sinh cần nâng cao học lực
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Học sinh 1 (Kèm cặp / Phụ trách):</label>
              <select
                value={student1Id}
                onChange={(e) => setStudent1Id(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Học sinh 2 (Được giúp đỡ):</label>
              <select
                value={student2Id}
                onChange={(e) => setStudent2Id(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Vị trí bàn ngồi / Khu vực:</label>
            <input
              type="text"
              value={deskLabel}
              onChange={(e) => setDeskLabel(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Bàn 1 Dãy 1"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mục tiêu kèm cặp / Nhiệm vụ cụ thể:</label>
            <textarea
              rows={3}
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mục tiêu môn học, cải thiện điểm kiểm tra, truy bài đầu giờ..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Trạng thái tiến độ:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'improving' | 'achieved')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Đang triển khai kèm cặp tích cực</option>
              <option value="improving">Đang tiến bộ rõ rệt</option>
              <option value="achieved">Đã đạt mục tiêu đề ra</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi chú tiến bộ:</label>
            <input
              type="text"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span>Lưu Đôi Bạn Cùng Tiến</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
