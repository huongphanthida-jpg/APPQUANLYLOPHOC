import React, { useState } from 'react';
import {
  X,
  Target,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  Shield,
  Compass,
  Users,
} from 'lucide-react';
import { HomeroomBookPlan } from '../../types';

interface EditHomeroomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: HomeroomBookPlan;
  academicYear: string;
  onSave: (updatedPlan: HomeroomBookPlan) => void;
}

export const EditHomeroomPlanModal: React.FC<EditHomeroomPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  academicYear,
  onSave,
}) => {
  const [formData, setFormData] = useState<HomeroomBookPlan>(() => JSON.parse(JSON.stringify(plan)));
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddAdvantage = () => {
    if (!newAdvantage.trim()) return;
    setFormData((prev) => ({
      ...prev,
      advantages: [...(prev.advantages || []), newAdvantage.trim()],
    }));
    setNewAdvantage('');
  };

  const handleRemoveAdvantage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      advantages: (prev.advantages || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddDifficulty = () => {
    if (!newDifficulty.trim()) return;
    setFormData((prev) => ({
      ...prev,
      difficulties: [...(prev.difficulties || []), newDifficulty.trim()],
    }));
    setNewDifficulty('');
  };

  const handleRemoveDifficulty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      difficulties: (prev.difficulties || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#003366] via-blue-900 to-[#002244] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300 border border-white/10 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                CHỈNH SỬA SỔ CHỦ NHIỆM
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Điều Chỉnh Kế Hoạch & Hệ Thống Chỉ Tiêu Năm Học
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* 1. Sĩ số & cơ cấu */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-black text-[#003366] uppercase text-xs flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              1. Cơ cấu & Thống kê học sinh đầu năm
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tổng sĩ số:</label>
                <input
                  type="number"
                  value={formData.totalStudentsStart}
                  onChange={(e) =>
                    setFormData({ ...formData, totalStudentsStart: Number(e.target.value) })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số nam:</label>
                <input
                  type="number"
                  value={formData.maleCount}
                  onChange={(e) =>
                    setFormData({ ...formData, maleCount: Number(e.target.value) })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số nữ:</label>
                <input
                  type="number"
                  value={formData.femaleCount}
                  onChange={(e) =>
                    setFormData({ ...formData, femaleCount: Number(e.target.value) })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Đoàn viên:</label>
                <input
                  type="number"
                  value={formData.unionMembersCount}
                  onChange={(e) =>
                    setFormData({ ...formData, unionMembersCount: Number(e.target.value) })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Chỉ tiêu chất lượng giáo dục */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-black text-[#003366] uppercase text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              2. Chỉ tiêu Kết quả Học tập & Rèn luyện
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Học tập:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block text-[11px]">% Giỏi / Xuất sắc:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.academicTargets?.excellent || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicTargets: {
                            ...formData.academicTargets,
                            excellent: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block text-[11px]">% Khá:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.academicTargets?.good || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicTargets: {
                            ...formData.academicTargets,
                            good: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Rèn luyện (Hạnh kiểm):</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block text-[11px]">% Hạnh kiểm Tốt:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.conductTargets?.good || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conductTargets: {
                            ...formData.conductTargets,
                            good: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block text-[11px]">% Hạnh kiểm Khá:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.conductTargets?.fair || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conductTargets: {
                            ...formData.conductTargets,
                            fair: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chỉ tiêu Đỗ ĐH NV1 (%):</label>
                <input
                  type="number"
                  value={formData.universityAdmissionTargetPercent || 90}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      universityAdmissionTargetPercent: Number(e.target.value),
                    })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Danh hiệu thi đua lớp:</label>
                <input
                  type="text"
                  value={formData.classEmulationTitleTarget || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, classEmulationTitleTarget: e.target.value })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 3. Thuận lợi & Khó khăn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thuận lợi */}
            <div className="space-y-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <h5 className="font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Thuận lợi căn bản
              </h5>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(formData.advantages || []).map((adv, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-slate-700 leading-tight flex-1">{adv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdvantage(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Thêm thuận lợi mới..."
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAdvantage();
                    }
                  }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-emerald-200"
                />
                <button
                  type="button"
                  onClick={handleAddAdvantage}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Khó khăn */}
            <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <h5 className="font-black text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Khó khăn & Thách thức
              </h5>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(formData.difficulties || []).map((diff, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-amber-100">
                    <span className="text-slate-700 leading-tight flex-1">{diff}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDifficulty(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Thêm khó khăn mới..."
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDifficulty();
                    }
                  }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-amber-200"
                />
                <button
                  type="button"
                  onClick={handleAddDifficulty}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Giải pháp sư phạm */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-black text-[#003366] uppercase text-xs flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              3. Hệ thống Giải pháp Sư phạm Trọng tâm
            </h4>
            <div className="space-y-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  a) Giáo dục Đạo đức, Tư tưởng & Lối sống:
                </label>
                <textarea
                  rows={2}
                  value={formData.keyMeasures?.morality || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keyMeasures: { ...formData.keyMeasures, morality: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  b) Nâng cao chất lượng học tập & Ôn thi tốt nghiệp - ĐH:
                </label>
                <textarea
                  rows={2}
                  value={formData.keyMeasures?.studyQuality || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keyMeasures: { ...formData.keyMeasures, studyQuality: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Thay Đổi</span>
          </button>
        </div>

      </div>
    </div>
  );
};
