import React, { useState } from 'react';
import { X, Save, ShieldAlert, Award, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { DisciplineEntry, Student } from '../../types';

interface EditDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DisciplineEntry | null;
  students: Student[];
  onSave: (savedEntry: DisciplineEntry) => void;
}

export const EditDisciplineModal: React.FC<EditDisciplineModalProps> = ({
  isOpen,
  onClose,
  entry,
  students,
  onSave,
}) => {
  const [studentId, setStudentId] = useState(entry?.studentId || students[0]?.id || '');
  const [type, setType] = useState<'bonus' | 'penalty' | 'violation'>(
    entry?.type === 'bonus' ? 'bonus' : 'penalty'
  );
  const [points, setPoints] = useState<number>(entry?.points || (entry?.type === 'bonus' ? 5 : -2));
  const [category, setCategory] = useState(entry?.category || 'Học tập');
  const [reason, setReason] = useState(entry?.reason || '');
  const [timestamp, setTimestamp] = useState(
    entry?.timestamp ||
      new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
  );

  if (!isOpen) return null;

  const handleTypeChange = (newType: 'bonus' | 'penalty') => {
    setType(newType);
    if (newType === 'bonus' && points < 0) {
      setPoints(5);
    } else if (newType === 'penalty' && points > 0) {
      setPoints(-2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    const saved: DisciplineEntry = {
      id: entry?.id || `disc-${Date.now()}`,
      studentId,
      studentName: st?.name || 'Học sinh',
      group: st?.group || 1,
      type: type === 'bonus' ? 'bonus' : 'penalty',
      category: (category.includes('Học tập')
        ? 'Học tập'
        : category.includes('Nề nếp') || category.includes('Đồng phục')
        ? 'Đồng phục'
        : category.includes('Vệ sinh')
        ? 'Vệ sinh'
        : category.includes('Đoàn')
        ? 'Hoạt động Đoàn'
        : category.includes('Đầu bài')
        ? 'Sổ đầu bài'
        : 'Chuyên cần') as DisciplineEntry['category'],
      points: Number(points),
      reason,
      recordedBy: entry?.recordedBy || 'Thầy Nguyễn Văn An (GVCN)',
      timestamp,
      week: entry?.week || 1,
    };

    onSave(saved);
    onClose();
  };

  const categories = [
    'Học tập (Điểm 10, phát biểu, giải bài khó)',
    'Nề nếp (Đi muộn, không đeo thẻ, đồng phục)',
    'Vệ sinh & Trực nhật',
    'Phong trào & Hoạt động Đoàn',
    'Chuyên cần & Thái độ',
    'Khác',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {entry ? 'Chỉnh Sửa Ghi Nhận Nề Nếp' : 'Ghi Nhận Khen Thưởng / Vi Phạm'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật điểm cộng/trừ rèn luyện vào Sổ Theo Dõi Chủ Nhiệm
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Loại ghi nhận:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('bonus')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'bonus'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Khen Thưởng (+ Điểm)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('penalty')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'penalty' || type === 'violation'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Vi Phạm (- Điểm)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn học sinh:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điểm quy đổi:</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className={`w-full py-2 px-3 rounded-xl border font-bold text-sm focus:outline-none focus:ring-2 ${
                  type === 'bonus'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 focus:ring-emerald-500'
                    : 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Danh mục vi phạm / khen thưởng:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nội dung chi tiết / Lý do:</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Đạt điểm 10 kiểm tra 15p môn Toán / Quên đeo huy hiệu đoàn..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Thời gian ghi nhận:</label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
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
              <span>{entry ? 'Cập Nhật Ghi Nhận' : 'Lưu Ghi Nhận'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
