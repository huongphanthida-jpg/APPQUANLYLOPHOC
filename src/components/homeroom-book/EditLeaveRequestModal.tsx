import React, { useState } from 'react';
import { X, Save, FileText, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { LeaveRequest, Student } from '../../types';

interface EditLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  students: Student[];
  onSave: (savedRequest: LeaveRequest) => void;
}

export const EditLeaveRequestModal: React.FC<EditLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  leaveRequest,
  students,
  onSave,
}) => {
  const [studentId, setStudentId] = useState(leaveRequest?.studentId || students[0]?.id || '');
  const [startDate, setStartDate] = useState(
    leaveRequest?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    leaveRequest?.endDate || new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState(
    leaveRequest?.reason || 'Bị sốt cao cần điều trị theo chỉ định bác sĩ'
  );
  const [submittedBy, setSubmittedBy] = useState<'Học sinh' | 'Phụ huynh'>(
    leaveRequest?.submittedBy || 'Phụ huynh'
  );
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>(
    leaveRequest?.status || 'approved'
  );
  const [teacherNote, setTeacherNote] = useState(
    leaveRequest?.teacherNote || 'GVCN đồng ý cho nghỉ học. Nhắc nhở mượn vở bạn chép bài đầy đủ.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    const saved: LeaveRequest = {
      id: leaveRequest?.id || `leave-${Date.now()}`,
      studentId,
      studentName: st?.name || 'Học sinh',
      group: st?.group || 1,
      startDate,
      endDate,
      reason,
      submittedBy,
      status,
      teacherNote,
      createdAt: leaveRequest?.createdAt || new Date().toLocaleDateString('vi-VN'),
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {leaveRequest ? 'Duyệt & Chỉnh Sửa Đơn Xin Nghỉ Học' : 'Tạo Đơn Xin Nghỉ Học Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Quản lý ngày nghỉ, lý do và ý kiến phê duyệt của GVCN
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
            <label className="font-bold text-slate-700 block mb-1">Học sinh xin nghỉ:</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nghỉ từ ngày:</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đến hết ngày:</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lý do xin phép:</label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi rõ nguyên nhân: ốm, việc gia đình..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Người gửi đơn:</label>
            <select
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Phụ huynh">Phụ huynh</option>
              <option value="Học sinh">Học sinh</option>
            </select>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Trạng thái phê duyệt của GVCN:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('approved')}
                  className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    status === 'approved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đồng Ý</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    status === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chờ Duyệt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('rejected')}
                  className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    status === 'rejected'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Từ Chối</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Ý kiến & Lời dặn của GVCN:</label>
              <input
                type="text"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ý kiến ghi vào sổ chủ nhiệm..."
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
              <span>Lưu Đơn Nghỉ Học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
