import React, { useState } from 'react';
import {
  School,
  Award,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  QrCode,
  Sparkles,
  Printer,
  FileSpreadsheet,
  FileText,
  Edit3,
} from 'lucide-react';
import { ClassInfo, TeacherInfo, BghInfo, HomeroomBookData, UserRole } from '../../types';
import { EditAdministrativeModal } from './EditAdministrativeModal';

interface HomeroomBookCoverProps {
  classInfo: ClassInfo;
  teacherInfo: TeacherInfo;
  bghInfo?: BghInfo;
  bookData: HomeroomBookData;
  role: UserRole;
  totalStudents: number;
  onPrintBook?: () => void;
  onExportExcel?: () => void;
  onExportWord?: () => void;
  onUpdateAdministrative?: (data: {
    classInfo: ClassInfo;
    teacherInfo: TeacherInfo;
    bghInfo: BghInfo;
    academicYear: string;
  }) => void;
}

export const HomeroomBookCover: React.FC<HomeroomBookCoverProps> = ({
  classInfo,
  teacherInfo,
  bghInfo,
  bookData,
  role,
  totalStudents,
  onPrintBook,
  onExportExcel,
  onExportWord,
  onUpdateAdministrative,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const canEdit = role === 'gvcn';

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-gradient-to-r from-[#003366] via-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              HỒ SƠ SỐ HÓA CHÍNH THỨC - BỘ GIÁO DỤC & ĐÀO TẠO
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH (SỔ CHỦ NHIỆM)
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
            Lưu trữ, tổng hợp toàn diện và đồng bộ dữ liệu từ 12 phân hiệu của lớp {classInfo.className} ({bookData.academicYear}). Đầy đủ giá trị pháp lý phục vụ báo cáo và thanh tra kiểm tra sư phạm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 border border-blue-400/30"
              title="Chỉnh sửa thông tin trường, lớp, GVCN và BGH"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>Chỉnh Sửa Thông Tin Bìa</span>
            </button>
          )}

          {onExportWord && (
            <button
              type="button"
              onClick={onExportWord}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
              title="Tải toàn bộ Sổ Chủ Nhiệm định dạng file Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Tải File Word (.doc)</span>
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
              title="Xuất trọn bộ 12 Sheet Excel chuẩn mẫu báo cáo"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất Trọn Bộ 12 Sheet Excel</span>
            </button>
          )}

          {onPrintBook && (
            <button
              type="button"
              onClick={onPrintBook}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
              title="In toàn bộ cuốn sổ khổ A4 chuẩn đóng quyển"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>In Sổ Đóng Quyển A4</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Style Book Cover */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border-4 border-double border-[#003366]/30 shadow-xl relative overflow-hidden text-center">
        {/* Ornamental Border Corners */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#003366]/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#003366]/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#003366]/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#003366]/60 pointer-events-none" />

        {/* National Motto */}
        <div className="space-y-1 mb-8">
          <p className="text-xs sm:text-sm font-black text-slate-800 tracking-widest uppercase">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            Độc lập - Tự do - Hạnh phúc
          </p>
          <div className="w-32 h-0.5 bg-slate-400 mx-auto mt-2" />
        </div>

        {/* School Administration Header */}
        <div className="mb-8 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HẢI PHÒNG
          </p>
          <h3 className="text-lg sm:text-xl font-black text-[#003366] uppercase tracking-wide">
            {classInfo.schoolName || 'TRƯỜNG THPT TRẦN NGUYÊN HÃN'}
          </h3>
        </div>

        {/* Logo / Badge Emblem */}
        <div className="my-6 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-700 via-[#003366] to-indigo-950 p-1 shadow-lg flex items-center justify-center text-white">
            <School className="w-12 h-12 text-amber-300" />
          </div>
        </div>

        {/* Book Main Title */}
        <div className="my-8 space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-[#003366] tracking-tight uppercase leading-tight font-serif">
            SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH
          </h1>
          <p className="text-base sm:text-xl font-black text-blue-700 uppercase tracking-widest">
            (SỔ CÔNG TÁC CHỦ NHIỆM LỚP)
          </p>
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-sm font-black">
            {bookData.academicYear}
          </div>
        </div>

        {/* Class & Personnel Details Grid */}
        <div className="max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3.5 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 font-medium">Lớp:</span>{' '}
              <strong className="text-slate-900 font-black text-base">{classInfo.className}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Sĩ số học sinh:</span>{' '}
              <strong className="text-slate-900 font-black text-base">{totalStudents} Học sinh</strong> (18 Nam / 18 Nữ)
            </div>
            <div>
              <span className="text-slate-500 font-medium">Phòng học:</span>{' '}
              <strong className="text-slate-800">{classInfo.roomName || 'Phòng 302 - Dãy A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Chuyên ban:</span>{' '}
              <strong className="text-slate-800">{classInfo.streamBadge || 'Khối Tự Nhiên (KHTN)'}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium">Khẩu hiệu lớp:</span>{' '}
              <em className="text-blue-800 font-semibold">"{classInfo.slogan || 'Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT'}"</em>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 font-medium">Giáo viên chủ nhiệm:</span>
              <p className="font-black text-slate-900 text-base mt-0.5">{teacherInfo.name}</p>
              <p className="text-xs text-slate-600">{teacherInfo.title}</p>
              <p className="text-xs text-blue-700 font-semibold">{teacherInfo.phone} • {teacherInfo.email}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Phê duyệt Ban Giám Hiệu:</span>
              <p className="font-black text-slate-900 text-base mt-0.5">{bghInfo?.name || 'TS. Lê Thị Mai'}</p>
              <p className="text-xs text-slate-600">{bghInfo?.dutyRole || 'Phó Hiệu Trưởng - Phụ trách Khối 12'}</p>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã kiểm tra & ký duyệt điện tử
              </p>
            </div>
          </div>
        </div>

        {/* Verification Seals & Signatures Block */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          {/* QR Code Verification */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center mb-1.5 shadow-xs">
              <QrCode className="w-12 h-12 text-[#003366]" />
            </div>
            <span className="font-bold text-[#003366]">Mã Số Hóa Hồ Sơ</span>
            <span className="text-[10px] text-slate-500 font-mono">TNH-12A1-2025-2026</span>
          </div>

          {/* Teacher Signature */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 block uppercase">Giáo Viên Chủ Nhiệm</span>
            <span className="text-[10px] text-slate-400 italic block">Ký và ghi rõ họ tên</span>
            <div className="h-10 flex items-center justify-center font-serif italic text-blue-900 font-bold text-sm">
              {teacherInfo.name}
            </div>
            <strong className="text-slate-800 text-xs block">{teacherInfo.name}</strong>
          </div>

          {/* BGH Seal & Signature */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 block uppercase">Ban Giám Hiệu Duyệt</span>
            <span className="text-[10px] text-slate-400 italic block">Ký tên & Đóng dấu</span>
            <div className="h-10 flex items-center justify-center font-serif italic text-rose-800 font-bold text-sm">
              {bghInfo?.name || 'TS. Lê Thị Mai'} (Đã duyệt)
            </div>
            <strong className="text-slate-800 text-xs block">{bghInfo?.name || 'TS. Lê Thị Mai'}</strong>
          </div>
        </div>
      </div>

      {/* Edit Administrative Modal */}
      {isEditModalOpen && (
        <EditAdministrativeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          classInfo={classInfo}
          teacherInfo={teacherInfo}
          bghInfo={bghInfo}
          bookData={bookData}
          onSave={(data) => {
            if (onUpdateAdministrative) {
              onUpdateAdministrative(data);
            }
          }}
        />
      )}
    </div>
  );
};
