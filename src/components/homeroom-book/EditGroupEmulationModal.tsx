import React, { useState } from 'react';
import { X, Save, Trophy, Award, AlertTriangle } from 'lucide-react';
import { GroupEmulationLog } from '../../types';

interface EditGroupEmulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  logItem: GroupEmulationLog | null;
  onSave: (savedLog: GroupEmulationLog) => void;
}

export const EditGroupEmulationModal: React.FC<EditGroupEmulationModalProps> = ({
  isOpen,
  onClose,
  logItem,
  onSave,
}) => {
  const [group, setGroup] = useState<1 | 2 | 3 | 4>(logItem?.group || 1);
  const [week, setWeek] = useState<number>(logItem?.week || 24);
  const [month, setMonth] = useState<string>(logItem?.month || 'Tháng 3');
  const [type, setType] = useState<'bonus' | 'penalty'>(
    (logItem?.points || 5) >= 0 ? 'bonus' : 'penalty'
  );
  const [points, setPoints] = useState<number>(Math.abs(logItem?.points || 5));
  const [category, setCategory] = useState<GroupEmulationLog['category']>(
    logItem?.category || 'academic'
  );
  const [title, setTitle] = useState<string>(
    logItem?.title || 'Phát biểu xây dựng bài & đạt điểm tốt'
  );
  const [description, setDescription] = useState<string>(
    logItem?.description || '100% thành viên hoàn thành bài tập'
  );
  const [date, setDate] = useState<string>(
    logItem?.date || new Date().toISOString().split('T')[0]
  );
  const [recordedBy, setRecordedBy] = useState<string>(
    logItem?.recordedBy || 'Lớp phó Học tập'
  );

  if (!isOpen) return null;

  const handleTypeChange = (newType: 'bonus' | 'penalty') => {
    setType(newType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPoints = type === 'penalty' ? -Math.abs(Number(points)) : Math.abs(Number(points));
    const saved: GroupEmulationLog = {
      id: logItem?.id || `emu-${Date.now()}`,
      group,
      week: Number(week),
      month,
      date,
      points: finalPoints,
      category,
      title,
      description,
      recordedBy,
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
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {logItem ? 'Chỉnh Sửa Điểm Thi Đua Tổ' : 'Cộng / Trừ Điểm Thi Đua Tổ'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật điểm xếp hạng thi đua tuần giữa 4 Tổ
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
              <span>Cộng Điểm (+ Điểm)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('penalty')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'penalty'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Trừ Điểm (- Điểm)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn Tổ:</label>
              <select
                value={group}
                onChange={(e) => setGroup(Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-black text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tuần học:</label>
              <input
                type="number"
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Điểm số:</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border font-bold text-center text-sm focus:outline-none focus:ring-2 bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lĩnh vực thi đua:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="academic">Học tập (academic)</option>
              <option value="discipline">Kỷ luật & Nề nếp (discipline)</option>
              <option value="attendance">Chuyên cần (attendance)</option>
              <option value="duty">Trực nhật vệ sinh (duty)</option>
              <option value="special_bonus">Thưởng đặc biệt (special_bonus)</option>
              <option value="special_penalty">Phạt đặc biệt (special_penalty)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tiêu đề ghi nhận:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 100% đạt điểm tốt tiết Toán..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Chi tiết mô tả:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi rõ thành tích hoặc vi phạm cụ thể..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ngày ghi nhận:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Người chấm / Theo dõi:</label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              <span>{logItem ? 'Cập Nhật Điểm' : 'Lưu Điểm Thi Đua'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
