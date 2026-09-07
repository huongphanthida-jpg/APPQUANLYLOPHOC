import React, { useState } from 'react';
import { X, HeartHandshake, Save, Phone, Briefcase, User } from 'lucide-react';
import { ParentsBoardMember, Student } from '../../types';

interface EditParentsBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberItem: ParentsBoardMember | null;
  students: Student[];
  onSave: (savedMember: ParentsBoardMember) => void;
}

export const EditParentsBoardModal: React.FC<EditParentsBoardModalProps> = ({
  isOpen,
  onClose,
  memberItem,
  students,
  onSave,
}) => {
  const [role, setRole] = useState<'Trưởng ban' | 'Phó ban' | 'Ủy viên'>(
    memberItem?.role || 'Ủy viên'
  );
  const [fullName, setFullName] = useState(memberItem?.fullName || '');
  const [studentId, setStudentId] = useState(memberItem?.studentId || students[0]?.id || '');
  const [phone, setPhone] = useState(memberItem?.phone || '');
  const [workplace, setWorkplace] = useState(memberItem?.workplace || '');
  const [notes, setNotes] = useState(memberItem?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStudent = students.find((s) => s.id === studentId);
    onSave({
      id: memberItem?.id || `pb-${Date.now()}`,
      role,
      fullName: fullName.trim() || 'Phụ huynh học sinh',
      studentId,
      studentName: selectedStudent ? `PH em ${selectedStudent.name}` : 'Phụ huynh',
      phone: phone.trim() || '0988.123.456',
      workplace: workplace.trim() || 'Kinh doanh tự do',
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {memberItem ? 'Chỉnh Sửa Ban Đại Diện CMHS' : 'Thêm Thành Viên Ban Đại Diện CMHS'}
              </h3>
              <p className="text-xs text-purple-200 font-medium">
                Cập nhật thông tin đại diện phụ huynh học sinh lớp
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Vai trò trong ban:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Trưởng ban">Trưởng ban</option>
                <option value="Phó ban">Phó ban</option>
                <option value="Ủy viên">Ủy viên</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Đại diện cho học sinh:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Họ và Tên Phụ Huynh:</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Ông Nguyễn Văn Thành"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại liên lạc:</label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0913.456.789"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Nghề nghiệp / Cơ quan công tác:</label>
            <div className="relative">
              <input
                type="text"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                placeholder="VD: Kỹ sư Viettel / Giảng viên ĐH"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Ghi chú phân công:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Phụ trách liên lạc phụ huynh Tổ 1 & Tổ 2"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Ban Đại Diện</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
