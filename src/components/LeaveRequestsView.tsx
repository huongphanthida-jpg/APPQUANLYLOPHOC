import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';
import { LeaveRequest, UserRole, Student } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface LeaveRequestsViewProps {
  leaveRequests: LeaveRequest[];
  onApproveLeave: (id: string, note?: string) => void;
  onRejectLeave: (id: string, note?: string) => void;
  onDeleteLeave?: (id: string) => void;
  onOpenAddLeave: () => void;
  role: UserRole;
  currentStudentId?: string;
}

export const LeaveRequestsView: React.FC<LeaveRequestsViewProps> = ({
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
  onDeleteLeave,
  onOpenAddLeave,
  role,
  currentStudentId,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [teacherNotes, setTeacherNotes] = useState<{ [id: string]: string }>({});
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Xác Nhận Xoá',
  });

  // If in student or parent mode, only show their own records (Data Isolation)
  const displayRequests = leaveRequests.filter((req) => {
    if (role === 'student' || role === 'parent') {
      if (currentStudentId && req.studentId !== currentStudentId) {
        return false;
      }
    }
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const handleApprove = (id: string) => {
    const note =
      teacherNotes[id] ||
      'Đã xác nhận với phụ huynh. Học sinh lưu ý chép bài và hoàn thành bài tập bù.';
    onApproveLeave(id, note);
  };

  const handleReject = (id: string) => {
    const note = teacherNotes[id] || 'Lý do chưa đủ căn cứ hoặc trùng lịch kiểm tra quan trọng.';
    onRejectLeave(id, note);
  };

  return (
    <div id="leave-requests-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
              QUẢN LÝ ĐƠN TỪ
            </span>
            <span className="text-xs text-slate-400">
              Quy trình phê duyệt số hóa giữa GVCN - Học sinh - Phụ huynh
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#003366] mt-1">
            Đơn Xin Nghỉ Phép & Phê Duyệt Trực Tuyến
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'bgh'
              ? 'Ban Giám Hiệu giám sát tỷ lệ chuyên cần và phê duyệt các trường hợp đặc biệt'
              : role === 'gvcn'
              ? 'GVCN xem xét lý do, giấy xác nhận và gửi lời dặn dò học tập bù'
              : 'Gửi đơn xin phép tới GVCN và theo dõi kết quả phê duyệt'}
          </p>
        </div>

        <button
          id="btn-open-add-leave"
          onClick={onOpenAddLeave}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-[#98FF98]" />
          <span>Tạo Đơn Xin Nghỉ Phép</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-[#003366] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({leaveRequests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'pending'
              ? 'bg-orange-500 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chờ GVCN duyệt ({leaveRequests.filter((l) => l.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã phê duyệt ({leaveRequests.filter((l) => l.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Từ chối ({leaveRequests.filter((l) => l.status === 'rejected').length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Không có đơn xin nghỉ phép nào theo bộ lọc</p>
          </div>
        ) : (
          displayRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-4 ${
                req.status === 'pending'
                  ? 'border-orange-200 bg-orange-50/20'
                  : req.status === 'approved'
                  ? 'border-slate-200'
                  : 'border-red-200 bg-red-50/20'
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold text-sm">
                    T{req.group}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{req.studentName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {req.submittedBy} nộp
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Thời gian nộp: {req.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}
                  >
                    {req.status === 'approved' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã Phê Duyệt</span>
                      </>
                    ) : req.status === 'rejected' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Từ Chối</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                        <span>Chờ GVCN Duyệt</span>
                      </>
                    )}
                  </span>

                  {(role === 'gvcn' || req.submittedBy === 'Phụ huynh') && onDeleteLeave && (
                    <button
                      type="button"
                      id={`btn-delete-leave-${req.id}`}
                      onClick={() => {
                        setConfirmAction({
                          isOpen: true,
                          title: 'Xoá Đơn Xin Phép',
                          message: `Bạn có chắc chắn muốn xoá đơn xin phép của học sinh "${req.studentName}"?`,
                          confirmText: 'Xoá Đơn',
                          onConfirm: () => onDeleteLeave(req.id),
                        });
                      }}
                      title="Xoá đơn xin phép"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Leave details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                  <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thời gian xin nghỉ:</span>
                    <strong className="text-slate-900">
                      {req.startDate} {req.startDate !== req.endDate ? `đến ${req.endDate}` : '(1 ngày)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">Lý do chi tiết:</span>
                    <p className="text-slate-800 font-medium">{req.reason}</p>
                  </div>
                  {req.proofUrl && (
                    <div className="pt-1 text-[11px] text-blue-700 font-semibold">
                      ✓ {req.proofUrl}
                    </div>
                  )}
                </div>

                {/* Teacher Feedback Note */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      Phản hồi & Lời dặn của GVCN:
                    </span>
                    {req.teacherNote ? (
                      <p className="text-xs text-slate-700 italic">"{req.teacherNote}"</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có phản hồi.</p>
                    )}
                  </div>

                  {role === 'gvcn' && req.status === 'pending' && (
                    <div className="space-y-2 pt-2 border-t border-blue-200">
                      <input
                        type="text"
                        placeholder="Nhập lời dặn cho HS / Phụ huynh..."
                        value={teacherNotes[req.id] || ''}
                        onChange={(e) =>
                          setTeacherNotes({ ...teacherNotes, [req.id]: e.target.value })
                        }
                        className="w-full px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Từ Chối
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Phê Duyệt Đơn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
      />
    </div>
  );
};
