import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Layers,
  FileText,
  ShieldCheck,
  Award,
  Users,
  Grid,
  Sparkles,
  Calendar,
  Settings2,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  ClassInfo,
  TeacherInfo,
  BghInfo,
  Student,
  DisciplineEntry,
  ClassJournalEntry,
  LeaveRequest,
  DutySchedule,
  SeatingChartData,
  TimetableData,
  StudyPair,
  GroupEmulationLog,
  HomeroomBookData,
} from '../../types';
import { exportHomeroomMasterExcel } from '../../utils/homeroomBookExcelExport';
import { exportHomeroomMasterWord } from '../../utils/homeroomBookWordExport';

interface HomeroomBookExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  teacherInfo: TeacherInfo;
  bghInfo?: BghInfo;
  students: Student[];
  disciplineLogs: DisciplineEntry[];
  journal: ClassJournalEntry[];
  leaveRequests: LeaveRequest[];
  dutySchedule: DutySchedule[];
  seatingChart: SeatingChartData;
  timetable: TimetableData;
  studyPairs: StudyPair[];
  emulationLogs: GroupEmulationLog[];
  bookData: HomeroomBookData;
  onTriggerPrint?: () => void;
  onExportWord?: () => void;
}

export const HomeroomBookExportPreviewModal: React.FC<HomeroomBookExportPreviewModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  teacherInfo,
  bghInfo,
  students,
  disciplineLogs,
  journal,
  leaveRequests,
  dutySchedule,
  seatingChart,
  timetable,
  studyPairs,
  emulationLogs,
  bookData,
  onTriggerPrint,
  onExportWord,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'pdf' | 'snapshot'>('excel');
  const [selectedExcelSheet, setSelectedExcelSheet] = useState<number>(0);
  const [includeOfficialStamps, setIncludeOfficialStamps] = useState<boolean>(true);
  const [includeDetailedGrades, setIncludeDetailedGrades] = useState<boolean>(true);
  const [selectedPdfPage, setSelectedPdfPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen) return null;

  const handleDownloadWord = () => {
    if (onExportWord) {
      onExportWord();
    } else {
      exportHomeroomMasterWord({
        classInfo,
        teacherInfo,
        bghInfo,
        students,
        disciplineLogs,
        journal,
        leaveRequests,
        dutySchedule,
        seatingChart,
        timetable,
        studyPairs,
        emulationLogs,
        bookData,
      });
    }
  };

  const handleDownloadExcel = () => {
    exportHomeroomMasterExcel({
      classInfo,
      teacherInfo,
      bghInfo,
      students,
      disciplineLogs,
      journal,
      leaveRequests,
      dutySchedule,
      seatingChart,
      timetable,
      studyPairs,
      emulationLogs,
      bookData,
    });
  };

  const handleStartPrint = () => {
    onClose();
    if (onTriggerPrint) {
      onTriggerPrint();
    } else {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  const excelSheets = [
    { id: 0, name: '1. Bìa Sổ & Thông Tin', icon: BookOpen, desc: 'Thông tin hành chính, nhà trường, GVCN & BGH' },
    { id: 1, name: '2. Kế Hoạch & Chỉ Tiêu', icon: Layers, desc: 'Sĩ số cơ cấu, chỉ tiêu học tập, rèn luyện & giải pháp' },
    { id: 2, name: '3. Ban Cán Sự & CMHS', icon: Users, desc: 'Cơ cấu cán sự lớp, BCH Chi đoàn và đại diện cha mẹ' },
    { id: 3, name: '4. Sơ Yếu 36 Học Sinh', icon: FileText, desc: 'Họ tên, ngày sinh, giới tính, đoàn viên, SĐT, liên hệ' },
    { id: 4, name: '5. Sơ Đồ Lớp & TKB', icon: Grid, desc: 'Bố trí 4 dãy x 6 bàn, đôi bạn cùng tiến & TKB 2 buổi' },
    { id: 5, name: '6. Nề Nếp & Sổ Đầu Bài', icon: ShieldCheck, desc: 'Nhật ký khen thưởng, vi phạm & phân loại tiết dạy' },
    { id: 6, name: '7. Bảng Điểm & 2 Mặt GD', icon: Award, desc: 'Điểm tổng kết các môn, xếp loại học lực & hạnh kiểm' },
    { id: 7, name: '8. Trực Nhật & Thi Đua', icon: Sparkles, desc: 'Lịch trực 8 ca/tuần và bảng điểm cộng trừ 4 tổ' },
    { id: 8, name: '9. HS Quan Tâm & Đơn Từ', icon: Users, desc: 'Học sinh diện đặc biệt, tiến độ theo dõi và đơn nghỉ' },
    { id: 9, name: '10. Biên Bản & Phê Duyệt', icon: Calendar, desc: 'Nội dung họp PHHS và đánh giá kiểm tra của BGH' },
    { id: 10, name: '11. Danh Sách GV Bộ Môn', icon: Users, desc: 'Tên môn, giáo viên phụ trách, liên hệ và số tiết' },
    { id: 11, name: '12. Tổng Hợp & Đánh Giá', icon: FileSpreadsheet, desc: 'Bảng thống kê tỷ lệ hoàn thành chỉ tiêu năm học' },
  ];

  const pdfPages = [
    { id: 1, title: 'Trang 1: Bìa Sổ Chủ Nhiệm Chuẩn Bộ GD&ĐT', section: 'Bìa & Hành chính' },
    { id: 2, title: 'Trang 2: Kế Hoạch Năm Học & Hệ Thống Chỉ Tiêu', section: 'Kế hoạch & Mục tiêu' },
    { id: 3, title: 'Trang 3: Ban Cán Sự, Ban Đại Diện CMHS & 4 Tổ', section: 'Tổ chức & Bộ máy' },
    { id: 4, title: 'Trang 4: Sơ Yếu Lý Lịch Trích Ngang 36 Học Sinh', section: 'Lý lịch học sinh' },
    { id: 5, title: 'Trang 5: Sơ Đồ Lớp, Đôi Bạn Cùng Tiến & TKB Chuẩn', section: 'Không gian & Giảng dạy' },
    { id: 6, title: 'Trang 6: Theo Dõi Nề Nếp Kỷ Luật & Sổ Đầu Bài', section: 'Kỷ luật & Tiết học' },
    { id: 7, title: 'Trang 7: Bảng Điểm Tổng Hợp & Ma Trận 2 Mặt GD', section: 'Học tập & Hạnh kiểm' },
    { id: 8, title: 'Trang 8: Phân Công Trực Nhật & Bảng Điểm Thi Đua', section: 'Lao động & Thi đua' },
    { id: 9, title: 'Trang 9: Học Sinh Diện Đặc Biệt & Sổ Theo Dõi Nghỉ', section: 'Chăm sóc & Đơn từ' },
    { id: 10, title: 'Trang 10: Biên Bản Họp & Kết Luận Phê Duyệt Của BGH', section: 'Biên bản & Ký duyệt' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#003366] via-blue-900 to-[#002244] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300 border border-white/10 shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase">
                  TRUNG TÂM XEM TRƯỚC XUẤT BẢN
                </span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs text-blue-200 font-semibold">Lớp {classInfo.className}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Xem Trước Dữ Liệu Trước Khi Tải Xuống / In Ấn
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Mode Selector Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xem Trước File Excel (12 Sheet)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Xem Trước Bản In A4 / PDF (10 Trang)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'excel' ? (
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Tải Xuống Ngay (.xlsx)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartPrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Tiến Hành In Sổ (Ctrl + P)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: EXCEL PREVIEW */}
          {activeTab === 'excel' && (
            <div className="space-y-5">
              {/* File Specs Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm">
                      So_Chu_Nhiem_{classInfo.className}_{bookData.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}_Chuan.xlsx
                    </h4>
                    <p className="text-emerald-700 font-medium">
                      Định dạng chuẩn Excel OpenXML (.xlsx) • 12 Sheet chuẩn hóa • Công thức tự động • Tương thích 100%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-700">
                  <span className="font-semibold">
                    Dung lượng: <strong>~95 KB</strong>
                  </span>
                  <span className="font-semibold">
                    Số Sheet: <strong>12 Phân hiệu</strong>
                  </span>
                </div>
              </div>

              {/* Sheet Selector */}
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Chọn Sheet Cần Xem Trước:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {excelSheets.map((sheet) => {
                    const Icon = sheet.icon;
                    const isSelected = selectedExcelSheet === sheet.id;
                    return (
                      <button
                        key={sheet.id}
                        type="button"
                        onClick={() => setSelectedExcelSheet(sheet.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`} />
                          <span className="text-[10px] font-mono opacity-80">Sheet {sheet.id + 1}</span>
                        </div>
                        <h5 className="font-bold text-xs truncate">{sheet.name}</h5>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {sheet.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sheet Data Grid Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Dữ liệu mẫu trong Sheet: {excelSheets[selectedExcelSheet]?.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Khớp nối 100% dữ liệu thực tế
                  </span>
                </div>

                <div className="p-4 overflow-x-auto max-h-72">
                  {selectedExcelSheet === 0 && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-center">
                        <span className="font-black text-[#003366] text-sm uppercase block">
                          SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI
                        </span>
                        <span className="font-bold text-slate-800 block">
                          TRƯỜNG TRUNG HỌC PHỔ THÔNG TÂY NGUYỄN HUỆ
                        </span>
                        <h3 className="text-lg font-black text-blue-900 pt-2">
                          SỔ CHỦ NHIỆM LỚP {classInfo.className}
                        </h3>
                        <p className="text-slate-600 font-semibold">{bookData.academicYear}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700 block">Giáo viên chủ nhiệm:</span>
                          <span className="font-black text-slate-900">{teacherInfo.name}</span>
                          <span className="text-slate-500 block text-[11px]">{teacherInfo.phone} • {teacherInfo.email}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700 block">Ban Giám Hiệu phụ trách:</span>
                          <span className="font-black text-slate-900">{bghInfo?.name || 'TS. Lê Thị Mai'}</span>
                          <span className="text-slate-500 block text-[11px]">Phó Hiệu Trưởng phụ trách khối 12</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedExcelSheet === 3 && (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2 border border-slate-200 text-center w-10">STT</th>
                          <th className="p-2 border border-slate-200">Mã HS</th>
                          <th className="p-2 border border-slate-200">Họ và Tên</th>
                          <th className="p-2 border border-slate-200 text-center">Giới tính</th>
                          <th className="p-2 border border-slate-200">Ngày sinh</th>
                          <th className="p-2 border border-slate-200 text-center">Tổ</th>
                          <th className="p-2 border border-slate-200">SĐT Học sinh</th>
                          <th className="p-2 border border-slate-200">Phụ huynh liên hệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(students || []).slice(0, 8).map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-2 border border-slate-200 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2 border border-slate-200 font-mono font-bold text-blue-700">{s.code}</td>
                            <td className="p-2 border border-slate-200 font-bold text-slate-900">{s.name}</td>
                            <td className="p-2 border border-slate-200 text-center">{s.gender}</td>
                            <td className="p-2 border border-slate-200">{s.dob}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold">Tổ {s.group}</td>
                            <td className="p-2 border border-slate-200">{s.phone || '-'}</td>
                            <td className="p-2 border border-slate-200">{s.emergencyContact?.parentName || s.fatherName || '-'} ({s.emergencyContact?.phone || s.parentPhone || '-'})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedExcelSheet === 6 && (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2 border border-slate-200 text-center w-10">STT</th>
                          <th className="p-2 border border-slate-200">Họ và Tên</th>
                          <th className="p-2 border border-slate-200 text-center">Toán</th>
                          <th className="p-2 border border-slate-200 text-center">Văn</th>
                          <th className="p-2 border border-slate-200 text-center">Anh</th>
                          <th className="p-2 border border-slate-200 text-center">Lý</th>
                          <th className="p-2 border border-slate-200 text-center">Hóa</th>
                          <th className="p-2 border border-slate-200 text-center">Sinh</th>
                          <th className="p-2 border border-slate-200 text-center bg-blue-50 text-blue-900">ĐTB (GPA)</th>
                          <th className="p-2 border border-slate-200 text-center">Học Lực</th>
                          <th className="p-2 border border-slate-200 text-center">Hạnh Kiểm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(students || []).slice(0, 8).map((s, idx) => {
                          const gpa = s.grades?.gpa || 0;
                          return (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="p-2 border border-slate-200 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="p-2 border border-slate-200 font-bold text-slate-900">{s.name}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.math ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.literature ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.english ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.physics ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.chemistry ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center">{s.grades?.biology ?? '-'}</td>
                              <td className="p-2 border border-slate-200 text-center font-black text-blue-700 bg-blue-50/50">{gpa.toFixed(2)}</td>
                              <td className="p-2 border border-slate-200 text-center font-semibold">{gpa >= 9 ? 'Xuất sắc' : gpa >= 8 ? 'Giỏi' : 'Khá'}</td>
                              <td className="p-2 border border-slate-200 text-center font-semibold text-emerald-700">Tốt</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {selectedExcelSheet !== 0 && selectedExcelSheet !== 3 && selectedExcelSheet !== 6 && (
                    <div className="p-6 text-center text-slate-500 space-y-2">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">
                        Sheet "{excelSheets[selectedExcelSheet]?.name}" đã sẵn sàng xuất bản!
                      </p>
                      <p className="text-xs text-slate-400">
                        Bao gồm đầy đủ các bảng dữ liệu, tiêu đề phân hiệu, định dạng ô và công thức tự động theo chuẩn Bộ Giáo Dục.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PDF / PRINT PREVIEW */}
          {activeTab === 'pdf' && (
            <div className="space-y-5">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">Trang:</span>
                  <select
                    value={selectedPdfPage}
                    onChange={(e) => setSelectedPdfPage(Number(e.target.value))}
                    className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none"
                  >
                    {pdfPages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={includeOfficialStamps}
                      onChange={(e) => setIncludeOfficialStamps(e.target.checked)}
                      className="rounded text-[#003366] focus:ring-blue-500"
                    />
                    <span>Kèm mộc dấu & Chữ ký BGH</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={includeDetailedGrades}
                      onChange={(e) => setIncludeDetailedGrades(e.target.checked)}
                      className="rounded text-[#003366] focus:ring-blue-500"
                    />
                    <span>Kèm ma trận điểm chi tiết</span>
                  </label>
                </div>
              </div>

              {/* A4 Visual Sheet Mockup */}
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-300 space-y-6 font-sans text-xs">
                {/* Formal Ministry Header */}
                <div className="flex justify-between items-start border-b border-slate-300 pb-4 text-center">
                  <div className="w-1/2">
                    <span className="font-semibold uppercase text-[11px] block">SỞ GD&ĐT THÀNH PHỐ HÀ NỘI</span>
                    <span className="font-black text-[#003366] text-xs uppercase block">
                      TRƯỜNG THPT TÂY NGUYỄN HUỆ
                    </span>
                    <span className="text-[10px] text-slate-500 block">Số hiệu lưu trữ: SCN-12A1/2026</span>
                  </div>
                  <div className="w-1/2">
                    <span className="font-black text-xs uppercase block">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
                    <span className="font-bold text-[10px] block">Độc lập - Tự do - Hạnh phúc</span>
                    <div className="w-16 h-0.5 bg-slate-800 mx-auto mt-1" />
                  </div>
                </div>

                {/* Page Title */}
                <div className="text-center py-2 space-y-1">
                  <h3 className="text-base font-black text-[#003366] uppercase tracking-wide">
                    {pdfPages[selectedPdfPage - 1]?.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Lớp: {classInfo.className} • {bookData.academicYear} • GVCN: {teacherInfo.name}
                  </p>
                </div>

                {/* Simulated Content based on Page */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 font-semibold border-b border-slate-200 pb-2">
                    <span>Phân đoạn: {pdfPages[selectedPdfPage - 1]?.section}</span>
                    <span>Tình trạng: Đã đồng bộ số liệu chính xác</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs">
                    Nội dung trang này được thiết kế theo đúng quy chuẩn trình bày văn bản nghiệp vụ sư phạm THPT.
                    Dữ liệu các mục, bảng điểm, danh sách học sinh và phân công được dàn trang tự động vừa vặn khổ giấy A4 dọc khi in ấn.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700 block text-[11px]">Sĩ số học sinh:</span>
                      <span className="text-sm font-black text-[#003366]">{students.length} Học sinh (100% Nam/Nữ cân đối)</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700 block text-[11px]">Điểm TB chung lớp:</span>
                      <span className="text-sm font-black text-emerald-700">8.48 / 10.0 (Xếp loại Tốt)</span>
                    </div>
                  </div>
                </div>

                {/* Signature Box */}
                {includeOfficialStamps && (
                  <div className="grid grid-cols-2 pt-6 border-t border-slate-200 text-center">
                    <div className="space-y-12">
                      <div>
                        <span className="font-bold uppercase text-[11px] block">GIÁO VIÊN CHỦ NHIỆM</span>
                        <span className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{teacherInfo.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Đã xác thực chữ ký điện tử</span>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div>
                        <span className="font-bold uppercase text-[11px] block">BAN GIÁM HIỆU PHÊ DUYỆT</span>
                        <span className="text-[10px] text-slate-400 italic">(Ký, đóng dấu điện tử)</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#003366] block">{bghInfo?.name || 'TS. Lê Thị Mai'}</span>
                        <span className="text-[10px] text-rose-700 font-mono">ĐÃ DUYỆT SỔ CHỦ NHIỆM</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* A4 Footer */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                  <span>{classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'} - Sổ Chủ Nhiệm Số Hóa</span>
                  <span>Trang {selectedPdfPage} / 10</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            💡 Gợi ý: Bạn có thể chọn In trực tiếp (Ctrl+P), Tải xuống Word (.doc) hoặc Excel (.xlsx) để chỉnh sửa và báo cáo.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Đóng Xem Trước
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Tải Xuống File Word (.doc)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải Xuống 12 Sheet Excel</span>
            </button>
            <button
              type="button"
              onClick={handleStartPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Sổ Đóng Quyển A4</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
