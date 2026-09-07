import React, { useState } from 'react';
import { X, BookOpen, Save, Phone, Mail, Clock, User } from 'lucide-react';
import { SubjectTeacher } from '../../types';

interface EditSubjectTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherItem: SubjectTeacher | null;
  onSave: (savedTeacher: SubjectTeacher) => void;
}

export const EditSubjectTeacherModal: React.FC<EditSubjectTeacherModalProps> = ({
  isOpen,
  onClose,
  teacherItem,
  onSave,
}) => {
  const [subjectName, setSubjectName] = useState(teacherItem?.subjectName || 'Toán học');
  const [teacherName, setTeacherName] = useState(teacherItem?.teacherName || '');
  const [phone, setPhone] = useState(teacherItem?.phone || '');
  const [email, setEmail] = useState(teacherItem?.email || '');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(teacherItem?.periodsPerWeek || 4);
  const [notes, setNotes] = useState(teacherItem?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: teacherItem?.id || `st-${Date.now()}`,
      subjectName: subjectName.trim(),
      teacherName: teacherName.trim(),
      phone: phone.trim() || '0901.234.567',
      email: email.trim() || `${subjectName.toLowerCase()}@taynguyenhue.edu.vn`,
      periodsPerWeek: Number(periodsPerWeek) || 1,
      notes: notes.trim(),
    });
    onClose();
  };

  const defaultSubjects = [
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lý',
    'GDCD & Kinh tế Pháp luật',
    'Tin học',
    'Công nghệ',
    'Giáo dục Thể chất',
    'GD Quốc phòng & An ninh',
    'HĐTN & Hướng nghiệp',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {teacherItem ? 'Chỉnh Sửa Giáo Viên Bộ Môn' : 'Thêm Giáo Viên Bộ Môn'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật thông tin giảng dạy & phương thức liên lạc
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
              <label className="font-bold text-slate-700 block mb-1.5">Tên Môn Học:</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {defaultSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Số tiết / tuần:</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Họ và Tên Giáo Viên:</label>
            <div className="relative">
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="VD: ThS. Nguyễn Hoàng Anh"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại:</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912.987.654"
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email liên hệ:</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: anh.nh@taynguyenhue.edu.vn"
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Ghi chú chuyên môn:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Tổ trưởng chuyên môn Tự Nhiên / Bồi dưỡng HSG"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Giáo Viên</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
