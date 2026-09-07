import React, { useState } from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  Printer,
  Archive,
  Target,
  Users,
  FileText,
  Grid,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Layers,
  Search,
  Eye,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  Student,
  DisciplineEntry,
  ClassJournalEntry,
  LeaveRequest,
  DutySchedule,
  ClassInfo,
  TeacherInfo,
  BghInfo,
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
} from '../types';
import { HomeroomBookCover } from './homeroom-book/HomeroomBookCover';
import { HomeroomBookPlanSection } from './homeroom-book/HomeroomBookPlanSection';
import { HomeroomBookOrganizationSection } from './homeroom-book/HomeroomBookOrganizationSection';
import { HomeroomBookStudentRegistry } from './homeroom-book/HomeroomBookStudentRegistry';
import { HomeroomBookSeatingAndSchedule } from './homeroom-book/HomeroomBookSeatingAndSchedule';
import { HomeroomBookDisciplineAndJournal } from './homeroom-book/HomeroomBookDisciplineAndJournal';
import { HomeroomBookAcademicSummary } from './homeroom-book/HomeroomBookAcademicSummary';
import { HomeroomBookDutyAndEmulation } from './homeroom-book/HomeroomBookDutyAndEmulation';
import { HomeroomBookSpecialCareAndLeaves } from './homeroom-book/HomeroomBookSpecialCareAndLeaves';
import { HomeroomBookMinutesAndBgh } from './homeroom-book/HomeroomBookMinutesAndBgh';
import { HomeroomBookArchiveAndExport } from './homeroom-book/HomeroomBookArchiveAndExport';
import { HomeroomBookFullReader } from './homeroom-book/HomeroomBookFullReader';
import { HomeroomBookExportPreviewModal } from './homeroom-book/HomeroomBookExportPreviewModal';
import { exportHomeroomMasterExcel } from '../utils/homeroomBookExcelExport';

interface HomeroomBookViewProps {
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
  onUpdateBookData?: (data: HomeroomBookData) => void;
  onUpdateStudents?: (students: Student[]) => void;
  onUpdateClassInfo?: (info: ClassInfo) => void;
  onUpdateTeacherInfo?: (info: TeacherInfo) => void;
  onUpdateBghInfo?: (info: BghInfo) => void;
  onUpdateSeatingChart?: (seating: SeatingChartData) => void;
  onUpdateTimetable?: (timetable: TimetableData) => void;
  onUpdateStudyPairs?: (pairs: StudyPair[]) => void;
  onUpdateDisciplineLogs?: (logs: DisciplineEntry[]) => void;
  onUpdateJournal?: (journal: ClassJournalEntry[]) => void;
  onUpdateLeaveRequests?: (requests: LeaveRequest[]) => void;
  onUpdateDutySchedule?: (duty: DutySchedule[]) => void;
  onUpdateEmulationLogs?: (logs: GroupEmulationLog[]) => void;
  onSelectStudent?: (student: Student) => void;
}

type BookTab =
  | 'cover'
  | 'plan'
  | 'org'
  | 'registry'
  | 'seating-schedule'
  | 'discipline-journal'
  | 'academic'
  | 'duty-emulation'
  | 'special-care'
  | 'minutes-bgh'
  | 'archive'
  | 'full-reader';

export const HomeroomBookView: React.FC<HomeroomBookViewProps> = ({
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
  onUpdateBookData,
  onUpdateStudents,
  onUpdateClassInfo,
  onUpdateTeacherInfo,
  onUpdateBghInfo,
  onUpdateSeatingChart,
  onUpdateTimetable,
  onUpdateStudyPairs,
  onUpdateDisciplineLogs,
  onUpdateJournal,
  onUpdateLeaveRequests,
  onUpdateDutySchedule,
  onUpdateEmulationLogs,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<BookTab>('cover');
  const [isPreviewExportModalOpen, setIsPreviewExportModalOpen] = useState(false);

  const handleExportExcel = () => {
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

  const handlePrintBook = () => {
    setActiveTab('full-reader');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // State update handlers for deep persistence
  const handleUpdatePlan = (updatedPlan: HomeroomBookPlan) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        plan: updatedPlan,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateCommittee = (newCommittee: ClassCommitteeRole[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        committee: newCommittee,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateParentsBoard = (newBoard: ParentsBoardMember[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        parentsBoard: newBoard,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateSubjectTeachers = (newTeachers: SubjectTeacher[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        subjectTeachers: newTeachers,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateSpecialStudents = (newSpecial: SpecialStudentCare[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        specialStudents: newSpecial,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateMinutes = (newMinutes: ClassMeetingMinute[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        meetingMinutes: newMinutes,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateInspections = (newInspections: BghInspectionRecord[]) => {
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        inspections: newInspections,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleUpdateAdministrative = (data: {
    classInfo: ClassInfo;
    teacherInfo: TeacherInfo;
    bghInfo: BghInfo;
    academicYear: string;
  }) => {
    if (onUpdateClassInfo) onUpdateClassInfo(data.classInfo);
    if (onUpdateTeacherInfo) onUpdateTeacherInfo(data.teacherInfo);
    if (onUpdateBghInfo) onUpdateBghInfo(data.bghInfo);
    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        academicYear: data.academicYear,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleCreateSnapshot = (title: string, period: string, note: string) => {
    const avgGPA = Number(
      (
        students.reduce((acc, s) => acc + (s.grades?.gpa || 0), 0) /
        (students.length || 1)
      ).toFixed(2)
    );

    const goodConductPercent = Number(
      (
        (students.filter(
          (s) => (s.conductRating || (s.conductScore >= 90 ? 'Tốt' : 'Khá')) === 'Tốt'
        ).length /
          (students.length || 1)) *
        100
      ).toFixed(1)
    );

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      title,
      period,
      note: note || 'Bản lưu trữ dữ liệu số hóa tự động',
      createdAt: new Date().toLocaleString('vi-VN'),
      createdBy: `${teacherInfo.name} (GVCN ${classInfo.className})`,
      totalStudents: students.length,
      gpaAverage: avgGPA,
      goodConductPercent,
    };

    if (onUpdateBookData) {
      onUpdateBookData({
        ...bookData,
        snapshots: [newSnapshot, ...(bookData.snapshots || [])],
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const navItems = [
    { id: 'cover' as BookTab, label: 'Trang Bìa & Hành Chính', icon: BookOpen },
    { id: 'plan' as BookTab, label: 'Kế Hoạch & Chỉ Tiêu', icon: Target },
    { id: 'org' as BookTab, label: 'Ban Cán Sự & CMHS', icon: Users },
    { id: 'registry' as BookTab, label: 'Sơ Yếu Lý Lịch 36 HS', icon: FileText },
    { id: 'seating-schedule' as BookTab, label: 'Sơ Đồ Lớp & TKB', icon: Grid },
    { id: 'discipline-journal' as BookTab, label: 'Nề Nếp & Sổ Đầu Bài', icon: ShieldAlert },
    { id: 'academic' as BookTab, label: 'Bảng Điểm & 2 Mặt GD', icon: GraduationCap },
    { id: 'duty-emulation' as BookTab, label: 'Trực Nhật & Thi Đua', icon: Sparkles },
    { id: 'special-care' as BookTab, label: 'HS Quan Tâm & Đơn Từ', icon: HeartHandshake },
    { id: 'minutes-bgh' as BookTab, label: 'Biên Bản & Duyệt BGH', icon: ShieldCheck },
    { id: 'archive' as BookTab, label: 'Lưu Trữ & Xuất File', icon: Archive },
    { id: 'full-reader' as BookTab, label: '📖 Xem Tất Cả Các Trang (10 Trang)', icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003366] to-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <BookOpen className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003366] text-[10px] font-black uppercase">
                HỆ THỐNG SỔ CHỦ NHIỆM ĐIỆN TỬ
              </span>
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đồng bộ 12 phân hiệu chuẩn
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#003366] tracking-tight">
              SỔ CHỦ NHIỆM - LỚP {classInfo.className}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Năm học {bookData.academicYear} • GVCN: {teacherInfo.name} • Phó Hiệu Trưởng: {bghInfo?.name || 'TS. Lê Thị Mai'}
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Xem trước khi tải Button */}
          <button
            type="button"
            onClick={() => setIsPreviewExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] text-xs font-bold border border-blue-200 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Xem trước toàn bộ 12 sheet Excel & 10 trang PDF trước khi tải"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Xem Trước Khi Tải</span>
          </button>

          {/* Xem tất cả các trang Button */}
          <button
            type="button"
            onClick={() => setActiveTab('full-reader')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Mở trình đọc 10 trang sổ liên tục, từng trang hoặc lưới thu nhỏ"
          >
            <Layers className="w-4 h-4 text-indigo-200" />
            <span>Xem Tất Cả Các Trang</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            title="Xuất file Excel trọn bộ 12 Sheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">Xuất 12 Sheet Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrintBook}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
            title="In sổ đóng quyển A4"
          >
            <Printer className="w-4 h-4" />
            <span>In Sổ A4</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#003366] text-white shadow-sm ring-2 ring-blue-400/20'
                    : 'text-slate-600 hover:text-[#003366] hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <div className="transition-all">
        {activeTab === 'cover' && (
          <HomeroomBookCover
            classInfo={classInfo}
            teacherInfo={teacherInfo}
            bghInfo={bghInfo}
            bookData={bookData}
            role={role}
            totalStudents={students.length}
            onPrintBook={handlePrintBook}
            onExportExcel={handleExportExcel}
            onUpdateAdministrative={handleUpdateAdministrative}
          />
        )}

        {activeTab === 'plan' && (
          <HomeroomBookPlanSection
            plan={bookData.plan}
            academicYear={bookData.academicYear}
            role={role}
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {activeTab === 'org' && (
          <HomeroomBookOrganizationSection
            committee={bookData.committee}
            parentsBoard={bookData.parentsBoard}
            students={students}
            role={role}
            onUpdateCommittee={handleUpdateCommittee}
            onUpdateParentsBoard={handleUpdateParentsBoard}
          />
        )}

        {activeTab === 'registry' && (
          <HomeroomBookStudentRegistry
            students={students}
            role={role}
            onSelectStudent={onSelectStudent}
            onUpdateStudents={onUpdateStudents}
          />
        )}

        {activeTab === 'seating-schedule' && (
          <HomeroomBookSeatingAndSchedule
            seatingChart={seatingChart}
            timetable={timetable}
            studyPairs={studyPairs}
            subjectTeachers={bookData.subjectTeachers}
            students={students}
            role={role}
            onUpdateSubjectTeachers={handleUpdateSubjectTeachers}
            onUpdateSeatingChart={onUpdateSeatingChart}
            onUpdateStudyPairs={onUpdateStudyPairs}
            onUpdateTimetable={onUpdateTimetable}
          />
        )}

        {activeTab === 'discipline-journal' && (
          <HomeroomBookDisciplineAndJournal
            disciplineLogs={disciplineLogs}
            journal={journal}
            students={students}
            role={role}
            onUpdateDisciplineLogs={onUpdateDisciplineLogs}
            onUpdateJournal={onUpdateJournal}
          />
        )}

        {activeTab === 'academic' && (
          <HomeroomBookAcademicSummary
            students={students}
            role={role}
            onUpdateStudents={onUpdateStudents}
          />
        )}

        {activeTab === 'duty-emulation' && (
          <HomeroomBookDutyAndEmulation
            dutySchedule={dutySchedule}
            emulationLogs={emulationLogs}
            students={students}
            role={role}
            onUpdateDutySchedule={onUpdateDutySchedule}
            onUpdateEmulationLogs={onUpdateEmulationLogs}
          />
        )}

        {activeTab === 'special-care' && (
          <HomeroomBookSpecialCareAndLeaves
            specialStudents={bookData.specialStudents}
            leaveRequests={leaveRequests}
            students={students}
            role={role}
            onUpdateSpecialStudents={handleUpdateSpecialStudents}
            onUpdateLeaveRequests={onUpdateLeaveRequests}
          />
        )}

        {activeTab === 'minutes-bgh' && (
          <HomeroomBookMinutesAndBgh
            meetingMinutes={bookData.meetingMinutes}
            inspections={bookData.inspections}
            role={role}
            onUpdateMinutes={handleUpdateMinutes}
            onUpdateInspections={handleUpdateInspections}
          />
        )}

        {activeTab === 'archive' && (
          <HomeroomBookArchiveAndExport
            snapshots={bookData.snapshots || []}
            academicYear={bookData.academicYear}
            role={role}
            onExportExcel={handleExportExcel}
            onPrintBook={handlePrintBook}
            onCreateSnapshot={handleCreateSnapshot}
          />
        )}

        {/* FULL READER: XEM TẤT CẢ CÁC TRANG (Cuộn liên tục / Từng trang / Lưới thu nhỏ) */}
        {activeTab === 'full-reader' && (
          <HomeroomBookFullReader
            role={role}
            classInfo={classInfo}
            teacherInfo={teacherInfo}
            bghInfo={bghInfo}
            students={students}
            disciplineLogs={disciplineLogs}
            journal={journal}
            leaveRequests={leaveRequests}
            dutySchedule={dutySchedule}
            seatingChart={seatingChart}
            timetable={timetable}
            studyPairs={studyPairs}
            emulationLogs={emulationLogs}
            bookData={bookData}
            onUpdatePlan={handleUpdatePlan}
            onUpdateCommittee={handleUpdateCommittee}
            onUpdateParentsBoard={handleUpdateParentsBoard}
            onUpdateStudents={onUpdateStudents}
            onUpdateSubjectTeachers={handleUpdateSubjectTeachers}
            onUpdateSeatingChart={onUpdateSeatingChart}
            onUpdateStudyPairs={onUpdateStudyPairs}
            onUpdateTimetable={onUpdateTimetable}
            onUpdateDisciplineLogs={onUpdateDisciplineLogs}
            onUpdateJournal={onUpdateJournal}
            onUpdateDutySchedule={onUpdateDutySchedule}
            onUpdateEmulationLogs={onUpdateEmulationLogs}
            onUpdateSpecialStudents={handleUpdateSpecialStudents}
            onUpdateLeaveRequests={onUpdateLeaveRequests}
            onUpdateMinutes={handleUpdateMinutes}
            onUpdateInspections={handleUpdateInspections}
            onUpdateAdministrative={handleUpdateAdministrative}
            onSelectStudent={onSelectStudent}
            onOpenPreviewExport={() => setIsPreviewExportModalOpen(true)}
            onExportExcel={handleExportExcel}
            onPrintBook={handlePrintBook}
          />
        )}
      </div>

      {/* Global Preview Before Download Modal */}
      {isPreviewExportModalOpen && (
        <HomeroomBookExportPreviewModal
          isOpen={isPreviewExportModalOpen}
          onClose={() => setIsPreviewExportModalOpen(false)}
          classInfo={classInfo}
          teacherInfo={teacherInfo}
          bghInfo={bghInfo}
          students={students}
          disciplineLogs={disciplineLogs}
          journal={journal}
          leaveRequests={leaveRequests}
          dutySchedule={dutySchedule}
          seatingChart={seatingChart}
          timetable={timetable}
          studyPairs={studyPairs}
          emulationLogs={emulationLogs}
          bookData={bookData}
          onExportExcel={handleExportExcel}
          onPrintBook={handlePrintBook}
        />
      )}
    </div>
  );
};
