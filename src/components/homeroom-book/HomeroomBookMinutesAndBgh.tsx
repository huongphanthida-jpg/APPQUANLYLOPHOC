import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Award,
  Users,
  Clock,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ClassMeetingMinute, BghInspectionRecord, UserRole } from '../../types';
import { EditMeetingMinuteModal } from './EditMeetingMinuteModal';
import { EditBghInspectionModal } from './EditBghInspectionModal';

interface HomeroomBookMinutesAndBghProps {
  meetingMinutes: ClassMeetingMinute[];
  inspections: BghInspectionRecord[];
  role: UserRole;
  onUpdateMinutes?: (newMinutes: ClassMeetingMinute[]) => void;
  onUpdateInspections?: (newInspections: BghInspectionRecord[]) => void;
}

export const HomeroomBookMinutesAndBgh: React.FC<HomeroomBookMinutesAndBghProps> = ({
  meetingMinutes,
  inspections,
  role,
  onUpdateMinutes,
  onUpdateInspections,
}) => {
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<ClassMeetingMinute | null>(null);

  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<BghInspectionRecord | null>(null);

  const canEdit = role === 'gvcn' || role === 'bgh' || (role as string) === 'teacher' || (role as string) === 'admin';
  const canEditBgh = role === 'bgh' || role === 'gvcn' || (role as string) === 'admin' || (role as string) === 'teacher';

  // Meeting Minutes actions
  const handleOpenAddMinute = () => {
    setSelectedMinute(null);
    setIsMinuteModalOpen(true);
  };

  const handleOpenEditMinute = (minute: ClassMeetingMinute) => {
    setSelectedMinute(minute);
    setIsMinuteModalOpen(true);
  };

  const handleDeleteMinute = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa biên bản cuộc họp này?')) return;
    const updated = (meetingMinutes || []).filter((m) => m.id !== id);
    if (onUpdateMinutes) onUpdateMinutes(updated);
  };

  const handleSaveMinute = (savedMinute: ClassMeetingMinute) => {
    let updated = [...(meetingMinutes || [])];
    const index = updated.findIndex((m) => m.id === savedMinute.id);
    if (index >= 0) {
      updated[index] = savedMinute;
    } else {
      updated.push(savedMinute);
    }
    if (onUpdateMinutes) onUpdateMinutes(updated);
  };

  // BGH Inspections actions
  const handleOpenAddInspection = () => {
    setSelectedInspection(null);
    setIsInspectionModalOpen(true);
  };

  const handleOpenEditInspection = (insp: BghInspectionRecord) => {
    setSelectedInspection(insp);
    setIsInspectionModalOpen(true);
  };

  const handleDeleteInspection = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá kiểm tra của BGH này?')) return;
    const updated = (inspections || []).filter((i) => i.id !== id);
    if (onUpdateInspections) onUpdateInspections(updated);
  };

  const handleSaveInspection = (savedInsp: BghInspectionRecord) => {
    let updated = [...(inspections || [])];
    const index = updated.findIndex((i) => i.id === savedInsp.id);
    if (index >= 0) {
      updated[index] = savedInsp;
    } else {
      updated.push(savedInsp);
    }
    if (onUpdateInspections) onUpdateInspections(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 9: BIÊN BẢN CÁC KỲ HỌP & KIỂM TRA PHÊ DUYỆT CỦA BGH
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lưu trữ biên bản họp Cha mẹ học sinh và lịch sử các đợt kiểm tra sổ của Ban Giám Hiệu
            </p>
          </div>
        </div>
      </div>

      {/* 1. Lịch Sử Kiểm Tra & Phê Duyệt Của BGH */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            1. Nhật Ký Kiểm Tra & Đánh Giá Của Ban Giám Hiệu
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {(inspections || []).length} Đợt kiểm tra định kỳ
            </span>
            {canEditBgh && (
              <button
                type="button"
                onClick={handleOpenAddInspection}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Đánh Giá BGH</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(inspections || []).map((insp) => (
            <div
              key={insp.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-3 relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#003366] text-xs font-black">
                    {insp.period}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Ngày kiểm tra: {insp.inspectionDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Xếp loại: {insp.rating}
                  </span>
                  {canEditBgh && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditInspection(insp)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInspection(insp.id)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <p>
                  <strong className="text-slate-900">Người kiểm tra:</strong> {insp.inspectorName} ({insp.inspectorRole})
                </p>
                <p>
                  <strong className="text-slate-900">Nội dung đánh giá:</strong> {insp.evaluationContent}
                </p>
                <p>
                  <strong className="text-emerald-800">Ưu điểm:</strong> {insp.strengths}
                </p>
                <p>
                  <strong className="text-blue-800">Kiến nghị / Ý kiến chỉ đạo:</strong> {insp.recommendations}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Trạng thái: Đã ký duyệt điện tử và lưu trữ số hóa</span>
                <span className="font-serif italic font-bold text-rose-800">{insp.inspectorName} (Đã ký duyệt)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trích Lục Biên Bản Các Kỳ Họp */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            2. Biên Bản Các Cuộc Họp Cha Mẹ Học Sinh & Đại Hội Chi Đoàn
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              {(meetingMinutes || []).length} Biên bản lưu trữ
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddMinute}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Biên Bản Mới</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(meetingMinutes || []).map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100 hover:border-blue-300 transition-all space-y-3 relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
                <h5 className="font-bold text-slate-900 text-sm">{m.title}</h5>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {m.meetingType}
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMinute(m)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMinute(m.id)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">Thời gian:</span> <strong>{m.date} ({m.time})</strong>
                </div>
                <div>
                  <span className="text-slate-400">Địa điểm:</span> <strong>{m.location}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Thành phần:</span> <strong>{m.attendeesCount}</strong>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Nội dung chính:</span>
                <p className="whitespace-pre-line leading-relaxed text-slate-700">{m.mainContent}</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-blue-900 block">Nghị quyết / Kết luận:</span>
                  <p className="text-slate-700">{m.resolutions}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Chủ trì: <strong>{m.presidedBy}</strong></span>
                <span>Thư ký: <strong>{m.secretary}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Meeting Minute Modal */}
      {isMinuteModalOpen && (
        <EditMeetingMinuteModal
          isOpen={isMinuteModalOpen}
          onClose={() => setIsMinuteModalOpen(false)}
          minuteItem={selectedMinute}
          onSave={handleSaveMinute}
        />
      )}

      {/* Edit BGH Inspection Modal */}
      {isInspectionModalOpen && (
        <EditBghInspectionModal
          isOpen={isInspectionModalOpen}
          onClose={() => setIsInspectionModalOpen(false)}
          inspectionItem={selectedInspection}
          onSave={handleSaveInspection}
        />
      )}
    </div>
  );
};
