import React, { useState } from 'react';
import { X, Users, Save, ShieldCheck, Phone, Check } from 'lucide-react';
import { ClassCommitteeRole, Student } from '../../types';

interface EditCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  committeeItem: ClassCommitteeRole | null;
  students: Student[];
  onSave: (savedItem: ClassCommitteeRole) => void;
}

export const EditCommitteeModal: React.FC<EditCommitteeModalProps> = ({
  isOpen,
  onClose,
  committeeItem,
  students,
  onSave,
}) => {
  const [roleName, setRoleName] = useState(committeeItem?.roleName || 'Lớp trưởng');
  const [studentId, setStudentId] = useState(committeeItem?.studentId || students[0]?.id || '');
  const [phone, setPhone] = useState(committeeItem?.phone || '');
  const [mainDuty, setMainDuty] = useState(committeeItem?.mainDuty || '');

  if (!isOpen) return null;

  const handleStudentChange = (selectedId: string) => {
    setStudentId(selectedId);
    const found = students.find((s) => s.id === selectedId);
    if (found && found.phone) {
      setPhone(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStudent = students.find((s) => s.id === studentId);
    onSave({
      roleName,
      studentId,
      studentName: selectedStudent ? selectedStudent.name : 'Chưa gán',
      phone: phone || (selectedStudent ? selectedStudent.phone || '0987.654.321' : ''),
      mainDuty,
    });
    onClose();
  };

  const defaultRoles = [
    'Lớp trưởng',
    'Lớp phó Học tập',
    'Lớp phó Lao động - Đời sống',
    'Lớp phó Văn thể mỹ',
    'Bí thư Chi đoàn',
    'Phó Bí thư Chi đoàn',
    'Ủy viên BCH Chi đoàn',
    'Tổ trưởng Tổ 1',
    'Tổ trưởng Tổ 2',
    'Tổ trưởng Tổ 3',
    'Tổ trưởng Tổ 4',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {committeeItem ? 'Chỉnh Sửa Ban Cán Sự Lớp' : 'Thêm Thành Viên Ban Cán Sự'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật phân công vai trò, số điện thoại & nhiệm vụ
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
            <label className="font-bold text-slate-700 block mb-1.5">Chức vụ / Vai trò:</label>
            <div className="flex gap-2">
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {defaultRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Chọn Học Sinh:</label>
            <select
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.gender} - Tổ {s.group})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại liên lạc:</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912.345.678"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Nhiệm vụ trọng tâm:</label>
            <textarea
              rows={3}
              value={mainDuty}
              onChange={(e) => setMainDuty(e.target.value)}
              placeholder="VD: Phụ trách quản lý nề nếp chung, điều hành các buổi sinh hoạt lớp, báo cáo sĩ số cho GVCN hàng ngày..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
