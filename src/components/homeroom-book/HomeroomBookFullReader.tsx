import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  FileText,
  Eye,
  Sliders,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
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
  UserRole,
  HomeroomBookPlan,
  ClassCommitteeRole,
  ParentsBoardMember,
  SubjectTeacher,
  SpecialStudentCare,
  ClassMeetingMinute,
  BghInspectionRecord,
} from '../../types';
import { HomeroomBookCover } from './HomeroomBookCover';
import { HomeroomBookPlanSection } from './HomeroomBookPlanSection';
import { HomeroomBookOrganizationSection } from './HomeroomBookOrganizationSection';
import { HomeroomBookStudentRegistry } from './HomeroomBookStudentRegistry';
import { HomeroomBookSeatingAndSchedule } from './HomeroomBookSeatingAndSchedule';
import { HomeroomBookDisciplineAndJournal } from './HomeroomBookDisciplineAndJournal';
import { HomeroomBookAcademicSummary } from './HomeroomBookAcademicSummary';
import { HomeroomBookDutyAndEmulation } from './HomeroomBookDutyAndEmulation';
import { HomeroomBookSpecialCareAndLeaves } from './HomeroomBookSpecialCareAndLeaves';
import { HomeroomBookMinutesAndBgh } from './HomeroomBookMinutesAndBgh';

interface HomeroomBookFullReaderProps {
  role: UserRole;
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
  onUpdatePlan?: (updatedPlan: HomeroomBookPlan) => void;
  onUpdateCommittee?: (newCommittee: ClassCommitteeRole[]) => void;
  onUpdateParentsBoard?: (newBoard: ParentsBoardMember[]) => void;
  onUpdateStudents?: (newStudents: Student[]) => void;
  onUpdateSubjectTeachers?: (newTeachers: SubjectTeacher[]) => void;
  onUpdateSeatingChart?: (newChart: SeatingChartData) => void;
  onUpdateStudyPairs?: (newPairs: StudyPair[]) => void;
  onUpdateTimetable?: (newTimetable: TimetableData) => void;
  onUpdateDisciplineLogs?: (newLogs: DisciplineEntry[]) => void;
  onUpdateJournal?: (newJournal: ClassJournalEntry[]) => void;
  onUpdateDutySchedule?: (newDuty: DutySchedule[]) => void;
  onUpdateEmulationLogs?: (newLogs: GroupEmulationLog[]) => void;
  onUpdateSpecialStudents?: (newSpecial: SpecialStudentCare[]) => void;
  onUpdateLeaveRequests?: (newRequests: LeaveRequest[]) => void;
  onUpdateMinutes?: (newMinutes: ClassMeetingMinute[]) => void;
  onUpdateInspections?: (newInspections: BghInspectionRecord[]) => void;
  onUpdateAdministrative?: (data: {
    classInfo: ClassInfo;
    teacherInfo: TeacherInfo;
    bghInfo: BghInfo;
    academicYear: string;
  }) => void;
  onSelectStudent?: (student: Student) => void;
  onOpenPreviewExport?: () => void;
  onExportExcel?: () => void;
  onExportWord?: () => void;
  onPrintBook?: () => void;
}

export const HomeroomBookFullReader: React.FC<HomeroomBookFullReaderProps> = ({
  role,
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
  onUpdatePlan,
  onUpdateCommittee,
  onUpdateParentsBoard,
  onUpdateStudents,
  onUpdateSubjectTeachers,
  onUpdateSeatingChart,
  onUpdateStudyPairs,
  onUpdateTimetable,
  onUpdateDisciplineLogs,
  onUpdateJournal,
  onUpdateDutySchedule,
  onUpdateEmulationLogs,
  onUpdateSpecialStudents,
  onUpdateLeaveRequests,
  onUpdateMinutes,
  onUpdateInspections,
  onUpdateAdministrative,
  onSelectStudent,
  onOpenPreviewExport,
  onExportExcel,
  onExportWord,
  onPrintBook,
}) => {
  const [viewMode, setViewMode] = useState<'continuous' | 'paginated' | 'grid'>('continuous');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const totalPages = 10;

  const bookPages = [
    {
      page: 1,
      code: 'cover',
      title: 'Trang Bìa & Thông Tin Hành Chính',
      component: (
        <HomeroomBookCover
          classInfo={classInfo}
          teacherInfo={teacherInfo}
          bghInfo={bghInfo}
          bookData={bookData}
          role={role}
          totalStudents={students.length}
          onPrintBook={onPrintBook}
          onExportExcel={onExportExcel}
          onExportWord={onExportWord}
          onUpdateAdministrative={onUpdateAdministrative}
        />
      ),
    },
    {
      page: 2,
      code: 'plan',
      title: 'Phần 1: Kế Hoạch Năm Học & Đặc Điểm Lớp',
      component: (
        <HomeroomBookPlanSection
          plan={bookData.plan}
          academicYear={bookData.academicYear}
          role={role}
          onUpdatePlan={onUpdatePlan}
        />
      ),
    },
    {
      page: 3,
      code: 'org',
      title: 'Phần 2: Tổ Chức Lớp & Ban Đại Diện CMHS',
      component: (
        <HomeroomBookOrganizationSection
          committee={bookData.committee}
          parentsBoard={bookData.parentsBoard}
          students={students}
          role={role}
          onUpdateCommittee={onUpdateCommittee}
          onUpdateParentsBoard={onUpdateParentsBoard}
        />
      ),
    },
    {
      page: 4,
      code: 'registry',
      title: 'Phần 3: Sơ Yếu Lý Lịch 36 Học Sinh',
      component: (
        <HomeroomBookStudentRegistry
          students={students}
          role={role}
          onSelectStudent={onSelectStudent}
          onUpdateStudents={onUpdateStudents}
        />
      ),
    },
    {
      page: 5,
      code: 'seating',
      title: 'Phần 4: Sơ Đồ Lớp, Đôi Bạn & TKB Chuẩn',
      component: (
        <HomeroomBookSeatingAndSchedule
          seatingChart={seatingChart}
          timetable={timetable}
          studyPairs={studyPairs}
          subjectTeachers={bookData.subjectTeachers}
          students={students}
          role={role}
          onUpdateSubjectTeachers={onUpdateSubjectTeachers}
          onUpdateSeatingChart={onUpdateSeatingChart}
          onUpdateStudyPairs={onUpdateStudyPairs}
          onUpdateTimetable={onUpdateTimetable}
        />
      ),
    },
    {
      page: 6,
      code: 'discipline',
      title: 'Phần 5: Nề Nếp Kỷ Luật & Sổ Đầu Bài',
      component: (
        <HomeroomBookDisciplineAndJournal
          disciplineLogs={disciplineLogs}
          journal={journal}
          students={students}
          role={role}
          onUpdateDisciplineLogs={onUpdateDisciplineLogs}
          onUpdateJournal={onUpdateJournal}
        />
      ),
    },
    {
      page: 7,
      code: 'academic',
      title: 'Phần 6: Bảng Điểm & Đánh Giá 2 Mặt GD',
      component: (
        <HomeroomBookAcademicSummary
          students={students}
          role={role}
          onUpdateStudents={onUpdateStudents}
        />
      ),
    },
    {
      page: 8,
      code: 'duty',
      title: 'Phần 7: Trực Nhật 8 Ca & Điểm Thi Đua 4 Tổ',
      component: (
        <HomeroomBookDutyAndEmulation
          dutySchedule={dutySchedule}
          emulationLogs={emulationLogs}
          students={students}
          role={role}
          onUpdateDutySchedule={onUpdateDutySchedule}
          onUpdateEmulationLogs={onUpdateEmulationLogs}
        />
      ),
    },
    {
      page: 9,
      code: 'special-care',
      title: 'Phần 8: Học Sinh Cần Quan Tâm & Đơn Từ',
      component: (
        <HomeroomBookSpecialCareAndLeaves
          specialStudents={bookData.specialStudents}
          leaveRequests={leaveRequests}
          students={students}
          role={role}
          onUpdateSpecialStudents={onUpdateSpecialStudents}
          onUpdateLeaveRequests={onUpdateLeaveRequests}
        />
      ),
    },
    {
      page: 10,
      code: 'minutes',
      title: 'Phần 9: Biên Bản Họp & Duyệt Của BGH',
      component: (
        <HomeroomBookMinutesAndBgh
          meetingMinutes={bookData.meetingMinutes}
          inspections={bookData.inspections}
          role={role}
          onUpdateMinutes={onUpdateMinutes}
          onUpdateInspections={onUpdateInspections}
        />
      ),
    },
  ];

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 15, 150));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 15, 70));
  };

  const handleResetZoom = () => {
    setZoomScale(100);
  };

  return (
    <div
      className={`space-y-6 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-900/90 overflow-y-auto p-4 sm:p-8 backdrop-blur-md'
          : ''
      }`}
    >
      {/* Reader Control Bar (Sticky) */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Left: View Mode Switches & Quick TOC */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('continuous')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem cuộn liền mạch tất cả các trang"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cuộn Liên Tục</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('paginated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'paginated'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Lật xem từng trang đơn lẻ"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Từng Trang</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hiển thị lưới thu nhỏ 10 trang"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Lưới 10 Trang</span>
            </button>
          </div>

          {/* Quick Jump Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Chuyển đến:</span>
            <select
              value={currentPage}
              onChange={(e) => {
                const p = Number(e.target.value);
                setCurrentPage(p);
                if (viewMode === 'continuous') {
                  const el = document.getElementById(`full-book-page-${p}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {bookPages.map((p) => (
                <option key={p.page} value={p.page}>
                  Trang {p.page}: {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Pagination & Zoom Controls */}
        <div className="flex items-center gap-3">
          {viewMode === 'paginated' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={handlePrevPage}
                className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-black text-[#003366]">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={handleNextPage}
                className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom Controller */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white transition-all cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 text-xs font-bold text-slate-700 hover:text-blue-700 cursor-pointer"
              title="Đặt lại 100%"
            >
              {zoomScale}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white transition-all cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Export & Print Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenPreviewExport && (
            <button
              type="button"
              onClick={onOpenPreviewExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] text-xs font-bold border border-blue-200 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Mở bảng xem trước dữ liệu trước khi tải"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Xem Trước Khi Tải</span>
            </button>
          )}

          {onExportWord && (
            <button
              type="button"
              onClick={onExportWord}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Xuất file Word (.doc) trọn bộ 10 phần"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span className="hidden sm:inline">Xuất Word</span>
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Xuất file Excel trọn bộ"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrintBook || (() => window.print())}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
            title="In sổ đóng quyển khổ A4"
          >
            <Printer className="w-4 h-4" />
            <span>In Sổ A4</span>
          </button>
        </div>
      </div>

      {/* Main Viewport with Dynamic Zoom Scale */}
      <div
        className="transition-transform origin-top mx-auto"
        style={{
          transform: zoomScale === 100 ? 'none' : `scale(${zoomScale / 100})`,
          maxWidth: zoomScale > 100 ? `${100 * (zoomScale / 100)}%` : '100%',
        }}
      >
        {/* MODE 1: CONTINUOUS SCROLL (Stacked Formal A4 Book Pages) */}
        {viewMode === 'continuous' && (
          <div className="space-y-12">
            {bookPages.map((pageItem) => (
              <div
                key={pageItem.page}
                id={`full-book-page-${pageItem.page}`}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md relative print:shadow-none print:border-none print:p-0 print-page-break"
              >
                {/* Official Page Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#003366] text-amber-300 text-xs font-black flex items-center justify-center shadow-xs">
                      {pageItem.page}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-[#003366] uppercase tracking-wider">
                        {pageItem.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'} • Lớp {classInfo.className} • {bookData.academicYear}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                    Trang {pageItem.page} / {totalPages}
                  </span>
                </div>

                {/* Page Actual Content */}
                <div>{pageItem.component}</div>

                {/* Official Page Footer */}
                <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 text-[10px] text-slate-400 font-medium print:mt-4">
                  <span>Hệ Thống Sổ Chủ Nhiệm Điện Tử - {classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'}</span>
                  <span className="font-bold text-slate-500">
                    Trang {pageItem.page} / {totalPages}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODE 2: PAGINATED READER (Single Focus Page with Controls) */}
        {viewMode === 'paginated' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-2xl bg-[#003366] text-amber-300 text-sm font-black flex items-center justify-center shadow-xs">
                  {currentPage}
                </span>
                <div>
                  <h3 className="text-sm font-black text-[#003366] uppercase tracking-wider">
                    {bookPages[currentPage - 1]?.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'} • Lớp {classInfo.className} • {bookData.academicYear}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Trước
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003366] text-white text-xs font-bold hover:bg-blue-900 disabled:opacity-40 cursor-pointer"
                >
                  Sau <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Page Content */}
            <div className="min-h-[600px]">{bookPages[currentPage - 1]?.component}</div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 text-xs text-slate-500 font-medium">
              <span>Hệ Thống Sổ Chủ Nhiệm Điện Tử - {classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'}</span>
              <span className="font-black text-[#003366]">
                Trang {currentPage} / {totalPages}
              </span>
            </div>
          </div>
        )}

        {/* MODE 3: THUMBNAIL GRID OVERVIEW (10 Pages Overview) */}
        {viewMode === 'grid' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                Tổng Quan Toàn Bộ 10 Trang Sổ Chủ Nhiệm
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Nhấp vào bất kỳ trang nào để mở đọc chi tiết
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {bookPages.map((pageItem) => (
                <div
                  key={pageItem.page}
                  onClick={() => {
                    setCurrentPage(pageItem.page);
                    setViewMode('paginated');
                  }}
                  className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#003366] text-xs font-black flex items-center justify-center group-hover:bg-[#003366] group-hover:text-amber-300 transition-colors">
                      {pageItem.page}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Trang {pageItem.page}/10
                    </span>
                  </div>

                  <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 text-center group-hover:bg-blue-50/50 transition-colors">
                    <span className="text-xs font-bold text-slate-800 line-clamp-3 leading-snug">
                      {pageItem.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-blue-700 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Mở đọc trang này</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
