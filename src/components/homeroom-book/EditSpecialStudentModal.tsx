import React, { useState } from 'react';
import { X, HeartHandshake, Save, Plus, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';
import { SpecialStudentCare, Student } from '../../types';

interface EditSpecialStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCareItem: SpecialStudentCare | null;
  students: Student[];
  onSave: (savedItem: SpecialStudentCare) => void;
}

export const EditSpecialStudentModal: React.FC<EditSpecialStudentModalProps> = ({
  isOpen,
  onClose,
  studentCareItem,
  students,
  onSave,
}) => {
  const [studentId, setStudentId] = useState(studentCareItem?.studentId || students[0]?.id || '');
  const [category, setCategory] = useState<
    'Học tập yếu' | 'Hoàn cảnh khó khăn' | 'Sức khỏe đặc biệt' | 'Cá biệt/Nề nếp' | 'Năng khiếu đặc biệt'
  >(studentCareItem?.category || 'Học tập yếu');
  const [reasons, setReasons] = useState(studentCareItem?.reasons || '');
  const [supportPlan, setSupportPlan] = useState(studentCareItem?.supportPlan || '');
  const [followUpNotes, setFollowUpNotes] = useState<
    { date: string; progress: string; evaluatedBy: string }[]
  >(studentCareItem?.followUpNotes || []);

  const [newProgressDate, setNewProgressDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [newProgressText, setNewProgressText] = useState('');
  const [newProgressEvaluator, setNewProgressEvaluator] = useState('GVCN');

  if (!isOpen) return null;

  const handleAddFollowUpNote = () => {
    if (!newProgressText.trim()) return;
    setFollowUpNotes([
      ...followUpNotes,
      {
        date: newProgressDate || new Date().toLocaleDateString('vi-VN'),
        progress: newProgressText.trim(),
        evaluatedBy: newProgressEvaluator.trim() || 'GVCN',
      },
    ]);
    setNewProgressText('');
  };

  const handleRemoveFollowUpNote = (idx: number) => {
    setFollowUpNotes(followUpNotes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundStudent = students.find((s) => s.id === studentId);
    onSave({
      id: studentCareItem?.id || `care-${Date.now()}`,
      studentId,
      studentName: foundStudent ? foundStudent.name : 'Học sinh',
      category,
      reasons: reasons.trim() || 'Cần sự phối hợp giáo dục đặc biệt giữa GVCN và gia đình',
      supportPlan: supportPlan.trim() || 'Phân công đôi bạn cùng tiến, trao đổi phụ huynh định kỳ',
      followUpNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-800 to-pink-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {studentCareItem ? 'Điều Chỉnh Hồ Sơ HS Cần Quan Tâm' : 'Thêm Học Sinh Diện Cần Quan Tâm'}
              </h3>
              <p className="text-xs text-rose-200 font-medium">
                Kế hoạch hỗ trợ, bồi dưỡng & theo dõi tiến bộ
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Chọn Học Sinh:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} (Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Phân loại diện quan tâm:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Học tập yếu">Học tập yếu / Hổng kiến thức</option>
                <option value="Hoàn cảnh khó khăn">Hoàn cảnh gia đình khó khăn / Hộ nghèo</option>
                <option value="Sức khỏe đặc biệt">Sức khỏe đặc biệt / Bệnh lý</option>
                <option value="Cá biệt/Nề nếp">Cá biệt / Vi phạm nề nếp</option>
                <option value="Năng khiếu đặc biệt">Năng khiếu đặc biệt / Đội tuyển HSG</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Đặc điểm / Nguyên nhân cụ thể:</label>
            <textarea
              rows={2}
              required
              value={reasons}
              onChange={(e) => setReasons(e.target.value)}
              placeholder="VD: Mất gốc môn Tiếng Anh và Toán từ lớp 11, hoàn cảnh bố mẹ đi làm xa..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Biện pháp giúp đỡ & Kế hoạch đồng hành:</label>
            <textarea
              rows={2}
              required
              value={supportPlan}
              onChange={(e) => setSupportPlan(e.target.value)}
              placeholder="VD: Phân công Lớp phó học tập kèm 1-1, GVBM phụ đạo sau giờ học, liên hệ mẹ qua Zalo mỗi tuần..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Follow-up Notes Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Nhật Ký Đánh Giá Tiến Bộ Qua Từng Tháng ({followUpNotes.length})
              </label>
            </div>

            {/* List of existing notes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {followUpNotes.length === 0 ? (
                <p className="text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl">
                  Chưa có ghi chép nhật ký tiến bộ nào. Thêm bên dưới.
                </p>
              ) : (
                followUpNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-bold text-[#003366] bg-blue-100 px-2 py-0.5 rounded-md">
                          {note.date}
                        </span>
                        <span>Người theo dõi: <strong>{note.evaluatedBy}</strong></span>
                      </div>
                      <p className="text-slate-800 font-medium">{note.progress}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFollowUpNote(idx)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new progress record */}
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
              <span className="font-bold text-rose-900 block text-[11px]">Thêm Đánh Giá Mới:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Thời điểm (VD: 15/10/2025)"
                  value={newProgressDate}
                  onChange={(e) => setNewProgressDate(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-rose-200 font-medium"
                />
                <input
                  type="text"
                  placeholder="Người đánh giá (GVCN / GVBM)"
                  value={newProgressEvaluator}
                  onChange={(e) => setNewProgressEvaluator(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-rose-200 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddFollowUpNote}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Ghi Nhận
                </button>
              </div>
              <input
                type="text"
                placeholder="Nội dung tiến bộ (VD: Đã làm đủ bài tập Toán, điểm 15 phút đạt 7.5...)"
                value={newProgressText}
                onChange={(e) => setNewProgressText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFollowUpNote();
                  }
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-rose-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Hồ Sơ</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
