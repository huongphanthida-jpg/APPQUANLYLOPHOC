import React, { useState } from 'react';
import { X, FileText, Calendar, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { Student, LeaveRequest, UserRole } from '../types';

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudentId?: string;
  role: UserRole;
  onSubmitLeave: (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudentId,
  role,
  onSubmitLeave,
}) => {
  if (!isOpen) return null;

  const defaultStudent =
    students.find((s) => s.id === currentStudentId) || students[0];

  const [studentId, setStudentId] = useState(defaultStudent.id);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submittedBy, setSubmittedBy] = useState<'Học sinh' | 'Phụ huynh'>(
    role === 'parent' ? 'Phụ huynh' : 'Học sinh'
  );
  const [success, setSuccess] = useState(false);

  const selectedStudent =
    students.find((s) => s.id === studentId) || defaultStudent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmitLeave({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      group: selectedStudent.group,
      startDate,
      endDate,
      reason,
      submittedBy,
      proofUrl: 'Đã đính kèm giấy khám / minh chứng của gia đình',
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#003366] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#98FF98]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nộp Đơn Xin Nghỉ Phép Trực Tuyến</h2>
              <p className="text-xs text-white/80">THPT Trần Nguyên Hãn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đơn xin phép đã được gửi đến Giáo viên chủ nhiệm!</span>
            </div>
          )}

          {/* Student picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Học Sinh Nghỉ Phép
            </label>
            <select
              value={studentId}
              disabled={role === 'student' || role === 'parent'}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} - Tổ {s.group})
                </option>
              ))}
            </select>
          </div>

          {/* Submitted By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Người nộp đơn
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubmittedBy('Phụ huynh')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  submittedBy === 'Phụ huynh'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Phụ Huynh (Bố / Mẹ)
              </button>
              <button
                type="button"
                onClick={() => setSubmittedBy('Học sinh')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  submittedBy === 'Học sinh'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Học Sinh Tự Nộp
              </button>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lý do xin nghỉ phép chi tiết
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Em bị sốt siêu vi, gia đình xin phép thầy cho em nghỉ 1 ngày để đi khám tại BV Việt Tiệp..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Simulated Attachment */}
          <div className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Đính kèm minh chứng y tế / đơn viết tay</span>
            </div>
            <span className="text-[11px] font-bold text-[#003366] bg-blue-100 px-2 py-0.5 rounded">
              Đã tải lên
            </span>
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
              className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-md transition-all"
            >
              Gửi Đơn Cho GVCN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
