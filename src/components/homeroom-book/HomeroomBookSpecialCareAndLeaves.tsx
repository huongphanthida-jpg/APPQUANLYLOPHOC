import React, { useState } from 'react';
import {
  HeartHandshake,
  FileCheck2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { SpecialStudentCare, LeaveRequest, Student, UserRole } from '../../types';
import { EditSpecialStudentModal } from './EditSpecialStudentModal';
import { EditLeaveRequestModal } from './EditLeaveRequestModal';

interface HomeroomBookSpecialCareAndLeavesProps {
  specialStudents: SpecialStudentCare[];
  leaveRequests: LeaveRequest[];
  students?: Student[];
  role: UserRole;
  onUpdateSpecialStudents?: (newSpecialStudents: SpecialStudentCare[]) => void;
  onUpdateLeaveRequests?: (requests: LeaveRequest[]) => void;
}

export const HomeroomBookSpecialCareAndLeaves: React.FC<HomeroomBookSpecialCareAndLeavesProps> = ({
  specialStudents,
  leaveRequests,
  students = [],
  role,
  onUpdateSpecialStudents,
  onUpdateLeaveRequests,
}) => {
  // Modal states
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [selectedCareStudent, setSelectedCareStudent] = useState<SpecialStudentCare | null>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);

  const approvedLeaves = (leaveRequests || []).filter((l) => l.status === 'approved').length;
  const pendingLeaves更为 = (leaveRequests || []).filter((l) => l.status === 'pending').length;

  const canEdit = role === 'gvcn';

  // Care Student handlers
  const handleOpenAddCareStudent = () => {
    setSelectedCareStudent(null);
    setIsCareModalOpen(true);
  };

  const handleOpenEditCareStudent = (item: SpecialStudentCare) => {
    setSelectedCareStudent(item);
    setIsCareModalOpen(true);
  };

  const handleDeleteCareStudent = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ theo dõi học sinh này?')) return;
    const updated = (specialStudents || []).filter((s) => s.id !== id);
    if (onUpdateSpecialStudents) onUpdateSpecialStudents(updated);
  };

  const handleSaveCareStudent = (savedItem: SpecialStudentCare) => {
    let updated = [...(specialStudents || [])];
    const index = updated.findIndex((s) => s.id === savedItem.id);
    if (index >= 0) {
      updated[index] = savedItem;
    } else {
      updated.push(savedItem);
    }
    if (onUpdateSpecialStudents) onUpdateSpecialStudents(updated);
  };

  // Leave Requests handlers
  const handleOpenAddLeave = () => {
    setSelectedLeaveRequest(null);
    setIsLeaveModalOpen(true);
  };

  const handleOpenEditLeave = (req: LeaveRequest) => {
    setSelectedLeaveRequest(req);
    setIsLeaveModalOpen(true);
  };

  const handleDeleteLeave = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn xin nghỉ học này?')) return;
    const updated = (leaveRequests || []).filter((l) => l.id !== id);
    if (onUpdateLeaveRequests) onUpdateLeaveRequests(updated);
  };

  const handleSaveLeave = (savedReq: LeaveRequest) => {
    let updated = [...(leaveRequests || [])];
    const index = updated.findIndex((l) => l.id === savedReq.id);
    if (index >= 0) {
      updated[index] = savedReq;
    } else {
      updated.unshift(savedReq);
    }
    if (onUpdateLeaveRequests) onUpdateLeaveRequests(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 8: HỌC SINH CẦN QUAN TÂM ĐẶC BIỆT & SỔ THEO DÕI ĐƠN TỪ
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Kế hoạch hỗ trợ học sinh có hoàn cảnh đặc biệt/học lực yếu và quản lý đơn xin nghỉ phép
            </p>
          </div>
        </div>
      </div>

      {/* 1. Sổ Theo Dõi Học Sinh Cần Quan Tâm Đặc Biệt */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            1. Danh Sách Học Sinh Thuộc Diện Cần Theo Dõi & Giúp Đỡ
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              {(specialStudents || []).length} Học sinh diện đặc biệt
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddCareStudent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm HS Cần Quan Tâm</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(specialStudents || []).map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-sm">{s.studentName}</h5>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      s.category === 'Học tập yếu'
                        ? 'bg-amber-100 text-amber-800'
                        : s.category === 'Hoàn cảnh khó khăn'
                        ? 'bg-purple-100 text-purple-800'
                        : s.category === 'Sức khỏe đặc biệt'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {s.category}
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCareStudent(s)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCareStudent(s.id)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  <strong className="text-slate-900">Lý do / Đặc điểm:</strong> {s.reasons}
                </p>
                <p>
                  <strong className="text-blue-900">Biện pháp giúp đỡ:</strong> {s.supportPlan}
                </p>
              </div>

              {s.followUpNotes && s.followUpNotes.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Nhật ký tiến bộ & theo dõi:
                  </span>
                  <div className="space-y-1">
                    {(s.followUpNotes || []).map((note, idx) => (
                      <div key={idx} className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400 font-semibold mb-0.5">
                          <span>{note.date}</span>
                          <span className="text-blue-700 font-medium">{note.evaluatedBy}</span>
                        </div>
                        <p className="text-slate-700">{note.progress}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sổ Theo Dõi Đơn Xin Nghỉ Học */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            2. Trích Lục Sổ Đơn Xin Nghỉ Học & Phê Duyệt Của GVCN
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {approvedLeaves} Đã duyệt • {pendingLeaves更为} Đang chờ
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddLeave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm / Duyệt Đơn Mới</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3">Học Sinh</th>
                <th className="py-2.5 px-3">Thời Gian Nghỉ</th>
                <th className="py-2.5 px-4">Lý Do Xin Nghỉ</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-4">Ý Kiến Của GVCN</th>
                <th className="py-2.5 px-3">Ngày Gửi</th>
                {canEdit && <th className="py-2.5 px-3 text-center w-20">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(leaveRequests || []).map((l, idx) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{l.studentName}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                    {l.startDate} {l.endDate !== l.startDate ? `đến ${l.endDate}` : ''}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800">{l.reason}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        l.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {l.status === 'approved'
                        ? 'Đã duyệt'
                        : l.status === 'rejected'
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                    {l.teacherNote || 'Đồng ý cho học sinh nghỉ phép và giao bạn cùng tiến chép bài.'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {l.createdAt}
                  </td>
                  {canEdit && (
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLeave(l)}
                          className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                          title="Sửa / Duyệt đơn"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(l.id)}
                          className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                          title="Xóa đơn"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Special Student Modal */}
      {isCareModalOpen && (
        <EditSpecialStudentModal
          isOpen={isCareModalOpen}
          onClose={() => setIsCareModalOpen(false)}
          studentCareItem={selectedCareStudent}
          students={students}
          onSave={handleSaveCareStudent}
        />
      )}

      {/* Edit Leave Request Modal */}
      {isLeaveModalOpen && (
        <EditLeaveRequestModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          leaveRequest={selectedLeaveRequest}
          students={students}
          onSave={handleSaveLeave}
        />
      )}
    </div>
  );
};
