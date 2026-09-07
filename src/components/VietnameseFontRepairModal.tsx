import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Type,
  FileCheck,
  Eye,
  Edit3,
} from 'lucide-react';
import { Student } from '../types';
import {
  autoRepairVietnameseText,
  convertTCVN3ToUnicode,
  convertVNIToUnicode,
  hasFontCorruption,
} from '../utils/vietnameseEncoding';

interface VietnameseFontRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveRepairedStudents: (updatedStudents: Student[]) => void;
}

export const VietnameseFontRepairModal: React.FC<VietnameseFontRepairModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveRepairedStudents,
}) => {
  const [selectedEncodingTool, setSelectedEncodingTool] = useState<'auto' | 'tcvn3' | 'vni' | 'mojibake'>('auto');
  const [editingStudents, setEditingStudents] = useState<Student[]>(() =>
    JSON.parse(JSON.stringify(students))
  );
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditingStudents(JSON.parse(JSON.stringify(students)));
      setAppliedCount(0);
      setIsSuccessNotification(false);
    }
  }, [isOpen, students]);

  if (!isOpen) return null;

  // Identify students that currently have font corruption in name, strengths, parent name, etc.
  const corruptedCount = useMemo(() => {
    return editingStudents.filter((s) => {
      return (
        hasFontCorruption(s.name) ||
        hasFontCorruption(s.strengths) ||
        hasFontCorruption(s.careerAspiration) ||
        hasFontCorruption(s.healthNote) ||
        hasFontCorruption(s.emergencyContact.parentName) ||
        hasFontCorruption(s.emergencyContact.workplace) ||
        hasFontCorruption(s.address)
      );
    }).length;
  }, [editingStudents]);

  // Apply conversion engine to a single text
  const applyConversion = (text: string, tool: 'auto' | 'tcvn3' | 'vni' | 'mojibake'): string => {
    if (!text) return text;
    if (tool === 'auto') return autoRepairVietnameseText(text);
    if (tool === 'tcvn3') return convertTCVN3ToUnicode(text);
    if (tool === 'vni') return convertVNIToUnicode(text);
    return autoRepairVietnameseText(text);
  };

  // Run repair on all students
  const handleAutoRepairAll = (tool: 'auto' | 'tcvn3' | 'vni' | 'mojibake' = selectedEncodingTool) => {
    let repairedCount = 0;
    const updated = editingStudents.map((s) => {
      const newName = applyConversion(s.name, tool);
      const newStrengths = applyConversion(s.strengths, tool);
      const newCareer = applyConversion(s.careerAspiration, tool);
      const newHealth = applyConversion(s.healthNote, tool);
      const newAddress = applyConversion(s.address, tool);
      const newParentName = applyConversion(s.emergencyContact.parentName, tool);
      const newWorkplace = applyConversion(s.emergencyContact.workplace, tool);

      const hasChanged =
        newName !== s.name ||
        newStrengths !== s.strengths ||
        newCareer !== s.careerAspiration ||
        newHealth !== s.healthNote ||
        newAddress !== s.address ||
        newParentName !== s.emergencyContact.parentName ||
        newWorkplace !== s.emergencyContact.workplace;

      if (hasChanged) repairedCount++;

      return {
        ...s,
        name: newName,
        strengths: newStrengths,
        careerAspiration: newCareer,
        healthNote: newHealth,
        address: newAddress,
        emergencyContact: {
          ...s.emergencyContact,
          parentName: newParentName,
          workplace: newWorkplace,
        },
      };
    });

    setEditingStudents(updated);
    setAppliedCount(repairedCount);
    setIsSuccessNotification(true);
    setTimeout(() => setIsSuccessNotification(false), 4000);
  };

  // Field change handler for single student
  const handleFieldChange = (
    studentId: string,
    field: 'name' | 'strengths' | 'parentName' | 'workplace',
    value: string
  ) => {
    setEditingStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (field === 'name') return { ...s, name: value };
        if (field === 'strengths') return { ...s, strengths: value };
        if (field === 'parentName') {
          return {
            ...s,
            emergencyContact: { ...s.emergencyContact, parentName: value },
          };
        }
        if (field === 'workplace') {
          return {
            ...s,
            emergencyContact: { ...s.emergencyContact, workplace: value },
          };
        }
        return s;
      })
    );
  };

  const handleSaveAndApply = () => {
    onSaveRepairedStudents(editingStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold shadow-2xs border border-amber-400/30">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Bộ Công Cụ Sửa Lỗi Font Chữ & Bảng Mã Tiếng Việt
              </h2>
              <p className="text-xs text-slate-300">
                Tự động khôi phục ký tự bị lỗi dấu (?, , ô vuông, TCVN3 .VnTime, VNI-Times) thành chuẩn Unicode chuẩn mực
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls & Toolkit */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status Alert Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {corruptedCount > 0
                    ? `Phát hiện ${corruptedCount} học sinh có ký tự lỗi font chữ (?, , mojibake)`
                    : `Hồ sơ hiện tại hiển thị đầy đủ dấu tiếng Việt (${editingStudents.length} học sinh)`}
                </p>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  Chọn chế độ xử lý bên dưới và nhấn <strong>"Tự Động Sửa Tất Cả Lỗi Font"</strong> để phục hồi chuẩn xác.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAutoRepairAll('auto')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Sửa Tự Động Toàn Bộ</span>
            </button>
          </div>

          {/* Encoding Conversion Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#003366]" />
              Chọn Bảng Mã Nguồn Cần Chuyển Đổi Sang Unicode:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedEncodingTool('auto');
                  handleAutoRepairAll('auto');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedEncodingTool === 'auto'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] ring-1 ring-[#003366]'
                    : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                  Nhận Diện Thông Minh & Sửa Lỗi
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Tự động dò sửa ?, , mất dấu, lỗi UTF-8/ANSI
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEncodingTool('tcvn3');
                  handleAutoRepairAll('tcvn3');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedEncodingTool === 'tcvn3'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] ring-1 ring-[#003366]'
                    : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  TCVN3 / ABC (.VnTime)
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Chuyển đổi từ font .VnTime, .VnArial cũ
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEncodingTool('vni');
                  handleAutoRepairAll('vni');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedEncodingTool === 'vni'
                    ? 'bg-blue-50 border-[#003366] text-[#003366] ring-1 ring-[#003366]'
                    : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-emerald-600" />
                  VNI-Windows (VNI-Times)
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Chuyển đổi từ font VNI-Times, VNI-Helve
                </span>
              </button>
            </div>
          </div>

          {/* Success Notification */}
          {isSuccessNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Đã xử lý và cập nhật font chữ thành công cho <strong>{appliedCount}</strong> học sinh! Xem bảng đối chiếu bên dưới.
              </span>
            </div>
          )}

          {/* Interactive Inspection & Edit Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#003366]" />
                Bảng Danh Sách Học Sinh Sau Khi Khắc Phục Lỗi Font ({editingStudents.length} HS):
              </h3>
              <span className="text-[11px] text-slate-500">
                (Bạn có thể chỉnh sửa trực tiếp vào ô nếu muốn)
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và Tên Học Sinh</th>
                    <th className="py-2.5 px-3">Sở Trường / Năng Khiếu</th>
                    <th className="py-2.5 px-3">Phụ Huynh</th>
                    <th className="py-2.5 px-2 text-center w-24">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {editingStudents.map((s) => {
                    const isStillCorrupted =
                      hasFontCorruption(s.name) ||
                      hasFontCorruption(s.strengths) ||
                      hasFontCorruption(s.emergencyContact.parentName);

                    return (
                      <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-[#003366]">{s.code}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => handleFieldChange(s.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-[#003366] text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={s.strengths}
                            onChange={(e) => handleFieldChange(s.id, 'strengths', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-[#003366] text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={s.emergencyContact?.parentName || ''}
                            onChange={(e) => handleFieldChange(s.id, 'parentName', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-[#003366] text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {isStillCorrupted ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              Chưa sửa hết
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              Chuẩn Unicode
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAutoRepairAll('auto')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Chạy Lại Sửa Lỗi</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lưu & Áp Dụng Cho Hồ Sơ Học Sinh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
