import React, { useState } from 'react';
import { X, Award, AlertTriangle, PlusCircle, MinusCircle, CheckCircle2, User } from 'lucide-react';
import { Student, DisciplineEntry } from '../types';

interface AddDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAddEntry: (entry: Omit<DisciplineEntry, 'id' | 'timestamp'>) => void;
}

export const AddDisciplineModal: React.FC<AddDisciplineModalProps> = ({
  isOpen,
  onClose,
  students,
  onAddEntry,
}) => {
  if (!isOpen) return null;

  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [type, setType] = useState<'bonus' | 'penalty'>('bonus');
  const [category, setCategory] = useState<DisciplineEntry['category']>('Học tập');
  const [points, setPoints] = useState<number>(3);
  const [reason, setReason] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('Thầy Nguyễn Văn An (GVCN)');
  const [success, setSuccess] = useState(false);

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onAddEntry({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      group: selectedStudent.group,
      type,
      category,
      points: type === 'bonus' ? Math.abs(points) : -Math.abs(points),
      reason,
      recordedBy,
      week: 1,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            type === 'bonus' ? 'bg-[#003366]' : 'bg-red-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              {type === 'bonus' ? (
                <Award className="w-5 h-5 text-[#98FF98]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {type === 'bonus' ? 'Tuyên Dương / Cộng Điểm Nề Nếp' : 'Ghi Nhận Vi Phạm / Trừ Điểm'}
              </h2>
              <p className="text-xs text-white/80">Sổ Đầu Bài & Thi Đua Kỹ Thuật Số (Real-time)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã cập nhật điểm thi đua thời gian thực thành công!</span>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('bonus')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'bonus' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Cộng Điểm Thưởng</span>
            </button>
            <button
              type="button"
              onClick={() => setType('penalty')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'penalty' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Trừ Điểm Vi Phạm</span>
            </button>
          </div>

          {/* Student selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Học Sinh
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#003366]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} - Tổ {s.group}) - Hiện tại: {s.conductScore}đ
                </option>
              ))}
            </select>
          </div>

          {/* Category & Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lĩnh vực / Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Chuyên cần">Chuyên cần / Đi học</option>
                <option value="Học tập">Học tập / Phát biểu</option>
                <option value="Đồng phục">Đồng phục & Tác phong</option>
                <option value="Vệ sinh">Vệ sinh & Trực nhật</option>
                <option value="Hoạt động Đoàn">Hoạt động Đoàn trường</option>
                <option value="Sổ đầu bài">Sổ đầu bài</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điểm ({type === 'bonus' ? '+' : '-'})
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lý do chi tiết / Nội dung tuyên dương & vi phạm
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi rõ tình huống, tiết học, minh chứng..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Recorded By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Người ghi nhận
            </label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                type === 'bonus'
                  ? 'bg-[#003366] hover:bg-[#002244]'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Lưu Điểm Nề Nếp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
