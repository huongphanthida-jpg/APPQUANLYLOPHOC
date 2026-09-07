import React, { useState } from 'react';
import { X, Save, School, Award, UserCheck, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { ClassInfo, TeacherInfo, BghInfo, HomeroomBookData } from '../../types';

interface EditAdministrativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  teacherInfo: TeacherInfo;
  bghInfo?: BghInfo;
  bookData: HomeroomBookData;
  onSave: (data: {
    classInfo: ClassInfo;
    teacherInfo: TeacherInfo;
    bghInfo: BghInfo;
    academicYear: string;
  }) => void;
}

export const EditAdministrativeModal: React.FC<EditAdministrativeModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  teacherInfo,
  bghInfo,
  bookData,
  onSave,
}) => {
  const [schoolName, setSchoolName] = useState(classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN');
  const [department, setDepartment] = useState('Sở Giáo Dục & Đào Tạo');
  const [className, setClassName] = useState(classInfo.className || '12A1');
  const [academicYear, setAcademicYear] = useState(bookData.academicYear || '2025 - 2026');
  const [room, setRoom] = useState(classInfo.room || 'Phòng 302 (Khu B)');

  // Teacher Info
  const [teacherName, setTeacherName] = useState(teacherInfo.name || 'Thầy Nguyễn Văn An');
  const [teacherPhone, setTeacherPhone] = useState(teacherInfo.phone || '0912.345.678');
  const [teacherEmail, setTeacherEmail] = useState(teacherInfo.email || 'nguyenvanan.gv@tnh.edu.vn');
  const [teacherSubject, setTeacherSubject] = useState(teacherInfo.subject || 'Toán học');
  const [teacherDegree, setTeacherDegree] = useState(teacherInfo.title || teacherInfo.degree || 'Thạc sĩ Toán giải tích - ĐH Sư phạm');

  // BGH Info
  const [bghName, setBghName] = useState(bghInfo?.name || 'TS. Lê Thị Mai');
  const [bghTitle, setBghTitle] = useState(bghInfo?.title || 'Phó Hiệu Trưởng phụ trách Chuyên môn & Khối 12');
  const [bghPhone, setBghPhone] = useState(bghInfo?.phone || '0903.888.999');
  const [bghEmail, setBghEmail] = useState(bghInfo?.email || 'lethimai.bgh@tnh.edu.vn');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      classInfo: {
        ...classInfo,
        schoolName,
        className,
        room,
      },
      teacherInfo: {
        ...teacherInfo,
        name: teacherName,
        phone: teacherPhone,
        email: teacherEmail,
        subject: teacherSubject,
        degree: teacherDegree,
      },
      bghInfo: {
        name: bghName,
        title: bghTitle,
        phone: bghPhone,
        email: bghEmail,
      },
      academicYear,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Chỉnh Sửa Thông Tin Hành Chính & Trang Bìa
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Cập nhật thông tin trường, lớp, giáo viên chủ nhiệm & ban giám hiệu phụ trách
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
          {/* 1. Trường, Lớp, Năm học */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-600" />
              1. Thông Tin Trường & Khối Lớp
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cơ quan quản lý:</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên trường học:</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp chủ nhiệm:</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Năm học:</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Phòng học cố định:</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Giáo viên chủ nhiệm */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
            <h4 className="font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-700" />
              2. Giáo Viên Chủ Nhiệm (GVCN)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên GVCN:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bộ môn giảng dạy:</label>
                <input
                  type="text"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email sư phạm:</label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Trình độ chuyên môn / Học vị:</label>
                <input
                  type="text"
                  value={teacherDegree}
                  onChange={(e) => setTeacherDegree(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Ban Giám Hiệu Phụ Trách */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
            <h4 className="font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              3. Lãnh Đạo Ban Giám Hiệu Phê Duyệt
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ tên Lãnh đạo BGH:</label>
                <input
                  type="text"
                  value={bghName}
                  onChange={(e) => setBghName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chức vụ trong BGH:</label>
                <input
                  type="text"
                  value={bghTitle}
                  onChange={(e) => setBghTitle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại BGH:</label>
                <input
                  type="text"
                  value={bghPhone}
                  onChange={(e) => setBghPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email công vụ BGH:</label>
                <input
                  type="email"
                  value={bghEmail}
                  onChange={(e) => setBghEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span>Lưu Thông Tin Hành Chính</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
