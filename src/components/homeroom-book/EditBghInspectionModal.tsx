import React, { useState } from 'react';
import { X, ShieldCheck, Save, Calendar, CheckCircle2, Award, User } from 'lucide-react';
import { BghInspectionRecord } from '../../types';

interface EditBghInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionItem: BghInspectionRecord | null;
  onSave: (savedItem: BghInspectionRecord) => void;
}

export const EditBghInspectionModal: React.FC<EditBghInspectionModalProps> = ({
  isOpen,
  onClose,
  inspectionItem,
  onSave,
}) => {
  const [period, setPeriod] = useState<
    'Đầu năm học' | 'Tháng 10' | 'Cuối Học kỳ 1' | 'Tháng 3' | 'Cuối Năm học' | 'Đột xuất'
  >(inspectionItem?.period || 'Đầu năm học');
  const [inspectionDate, setInspectionDate] = useState(
    inspectionItem?.inspectionDate || new Date().toLocaleDateString('vi-VN')
  );
  const [inspectorName, setInspectorName] = useState(
    inspectionItem?.inspectorName || 'TS. Lê Thị Mai (Phó Hiệu Trưởng)'
  );
  const [inspectorRole, setInspectorRole] = useState(
    inspectionItem?.inspectorRole || 'Phó Hiệu Trưởng chuyên môn'
  );
  const [rating, setRating] = useState<'Xuất sắc' | 'Tốt' | 'Khá' | 'Đạt'>(
    inspectionItem?.rating || 'Xuất sắc'
  );
  const [evaluationContent, setEvaluationContent] = useState(
    inspectionItem?.evaluationContent || ''
  );
  const [strengths, setStrengths] = useState(inspectionItem?.strengths || '');
  const [recommendations, setRecommendations] = useState(
    inspectionItem?.recommendations || ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: inspectionItem?.id || `insp-${Date.now()}`,
      period,
      inspectionDate: inspectionDate.trim(),
      inspectorName: inspectorName.trim(),
      inspectorRole: inspectorRole.trim(),
      rating,
      evaluationContent: evaluationContent.trim() || 'Hồ sơ sổ sách chủ nhiệm được thiết lập đầy đủ, khoa học và đúng quy chuẩn sư phạm.',
      strengths: strengths.trim() || 'Kế hoạch rõ ràng, nắm chắc đặc điểm từng học sinh, phối hợp tốt với phụ huynh.',
      recommendations: recommendations.trim() || 'Tiếp tục phát huy phong trào thi đua và quan tâm sát sao học sinh yếu.',
      signed: true,
      signatureDate: inspectionDate.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {inspectionItem ? 'Chỉnh Sửa Đánh Giá Của BGH' : 'Thêm Nhật Ký Kiểm Tra BGH'}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                Ghi nhận kết quả kiểm tra sổ và đánh giá nghiệp vụ chủ nhiệm
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Đợt kiểm tra:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Đầu năm học">Đầu năm học</option>
                <option value="Tháng 10">Tháng 10 (Giữa HK1)</option>
                <option value="Cuối Học kỳ 1">Cuối Học kỳ 1</option>
                <option value="Tháng 3">Tháng 3 (Giữa HK2)</option>
                <option value="Cuối Năm học">Cuối Năm học</option>
                <option value="Đột xuất">Kiểm tra đột xuất</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Ngày kiểm tra:</label>
              <div className="relative">
                <input
                  type="text"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  placeholder="VD: 25/09/2025"
                  className="w-full py-2 pl-8 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Xếp loại hồ sơ:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-300 font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Xuất sắc">Xuất sắc</option>
                <option value="Tốt">Tốt</option>
                <option value="Khá">Khá</option>
                <option value="Đạt">Đạt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Người kiểm tra (BGH):</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="VD: TS. Lê Thị Mai"
                  className="w-full py-2 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Chức vụ:</label>
              <input
                type="text"
                value={inspectorRole}
                onChange={(e) => setInspectorRole(e.target.value)}
                placeholder="VD: Phó Hiệu Trưởng phụ trách khối 12"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Nội dung đánh giá tổng quát:</label>
            <textarea
              rows={3}
              required
              value={evaluationContent}
              onChange={(e) => setEvaluationContent(e.target.value)}
              placeholder="VD: Hồ sơ sổ sách chủ nhiệm được thiết lập đầy đủ, khoa học và đúng quy chuẩn sư phạm. Số liệu thống kê đồng bộ..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-emerald-800 block mb-1.5">Ưu điểm nổi bật:</label>
            <textarea
              rows={2}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="VD: Kế hoạch rõ ràng, nắm chắc đặc điểm từng học sinh, phối hợp tốt với cha mẹ học sinh..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-blue-800 block mb-1.5">Kiến nghị / Ý kiến chỉ đạo của BGH:</label>
            <textarea
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="VD: Tiếp tục phát huy nền nếp tự quản của ban cán sự và duy trì các biện pháp kèm cặp học sinh yếu..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Đánh Giá BGH</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
