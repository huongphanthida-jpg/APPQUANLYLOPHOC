import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, Heart, Briefcase, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { Student } from '../../types';

interface EditStudentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (savedStudent: Student) => void;
}

export const EditStudentRecordModal: React.FC<EditStudentRecordModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [name, setName] = useState(student?.name || '');
  const [code, setCode] = useState(student?.code || `TNH${Math.floor(Math.random() * 900 + 100)}`);
  const [gender, setGender] = useState<'Nam' | 'Nữ'>(student?.gender || 'Nam');
  const [dob, setDob] = useState(student?.dob || '2008-01-01');
  const [group, setGroup] = useState<number>(student?.group || 1);
  const [phone, setPhone] = useState(student?.phone || '');
  const [email, setEmail] = useState(student?.email || '');
  const [address, setAddress] = useState(student?.address || '');
  const [strengths, setStrengths] = useState(student?.strengths || '');
  const [careerAspiration, setCareerAspiration] = useState(student?.careerAspiration || '');
  const [healthNote, setHealthNote] = useState(student?.healthNote || '');

  // Emergency contact / Parents
  const [parentName, setParentName] = useState(student?.emergencyContact?.parentName || '');
  const [relationship, setRelationship] = useState(student?.emergencyContact?.relationship || 'Bố');
  const [parentPhone, setParentPhone] = useState(student?.emergencyContact?.phone || '');
  const [parentWorkplace, setParentWorkplace] = useState(student?.emergencyContact?.workplace || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStudent: Student = {
      ...(student || {
        id: `hs-${Date.now()}`,
        avatar: '',
        conductScore: 100,
        conductRating: 'Tốt',
        grades: {
          math: { tx1: 8.0, tx2: 8.5, gk: 8.0, ck: 8.5, avg: 8.3 },
          physics: { tx1: 8.0, tx2: 8.0, gk: 8.5, ck: 8.0, avg: 8.1 },
          chemistry: { tx1: 7.5, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 7.9 },
          biology: { tx1: 8.0, tx2: 8.5, gk: 8.0, ck: 8.0, avg: 8.1 },
          english: { tx1: 8.0, tx2: 8.0, gk: 8.5, ck: 8.5, avg: 8.3 },
          literature: { tx1: 7.5, tx2: 7.5, gk: 8.0, ck: 8.0, avg: 7.8 },
          gpa: 8.1,
        },
        violations: [],
        commendations: [],
      }),
      name,
      code,
      gender,
      dob,
      group,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@tnh.edu.vn`,
      address,
      strengths,
      careerAspiration,
      healthNote,
      emergencyContact: {
        parentName,
        relationship,
        phone: parentPhone,
        workplace: parentWorkplace,
      },
    };

    onSave(updatedStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {student ? `Chỉnh Sửa Sơ Yếu Lý Lịch: ${student.name}` : 'Thêm Hồ Sơ Học Sinh Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật thông tin định danh, liên lạc và hồ sơ gia đình theo mẫu BGD&ĐT
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {/* 1. Thông tin cá nhân */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              1. Thông Tin Cá Nhân & Định Danh
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã định danh (Mã HS):</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-mono font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giới tính:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày sinh (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thuộc Tổ:</label>
                <select
                  value={group}
                  onChange={(e) => setGroup(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Tổ 1 (Dãy 1)</option>
                  <option value={2}>Tổ 2 (Dãy 2)</option>
                  <option value={3}>Tổ 3 (Dãy 3)</option>
                  <option value={4}>Tổ 4 (Dãy 4)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Điện thoại học sinh:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09xx..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Email học sinh:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@tnh.edu.vn"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ thường trú / Chỗ ở hiện nay:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh..."
                />
              </div>
            </div>
          </div>

          {/* 2. Thông tin phụ huynh & Liên hệ khẩn cấp */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
            <h4 className="font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-purple-600" />
              2. Thông Tin Phụ Huynh & Người Giám Hộ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ tên Phụ huynh:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mối quan hệ:</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Bố / Mẹ / Người giám hộ"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại PHHS:</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Nơi công tác / Nghề nghiệp phụ huynh:</label>
                <input
                  type="text"
                  value={parentWorkplace}
                  onChange={(e) => setParentWorkplace(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Sở trường, Nguyện vọng & Lưu ý sức khỏe */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
            <h4 className="font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-amber-600" />
              3. Năng Khiếu, Nguyện Vọng & Sức Khỏe
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sở trường / Năng khiếu:</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Toán tư duy, cờ vua, văn nghệ, bóng đá..."
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nguyện vọng đại học / Nghề nghiệp:</label>
                <textarea
                  rows={2}
                  value={careerAspiration}
                  onChange={(e) => setCareerAspiration(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ĐH Bách Khoa, ĐH Y Dược, Ngoại Thương..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Ghi chú sức khỏe / Dị ứng / Bệnh mãn tính:</label>
                <input
                  type="text"
                  value={healthNote}
                  onChange={(e) => setHealthNote(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium text-rose-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Cận thị 2 độ, dị ứng phấn hoa, sức khỏe tốt..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{student ? 'Lưu Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
