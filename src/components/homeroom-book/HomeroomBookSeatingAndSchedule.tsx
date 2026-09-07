import React, { useState } from 'react';
import {
  Grid,
  GraduationCap,
  Users,
  Phone,
  Mail,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Edit3,
} from 'lucide-react';
import {
  SeatingChartData,
  TimetableData,
  StudyPair,
  SubjectTeacher,
  UserRole,
  Student,
} from '../../types';
import { EditSubjectTeacherModal } from './EditSubjectTeacherModal';
import { EditSeatingModal } from './EditSeatingModal';
import { EditStudyPairModal } from './EditStudyPairModal';
import { EditTimetableModal } from './EditTimetableModal';

interface HomeroomBookSeatingAndScheduleProps {
  seatingChart: SeatingChartData;
  timetable: TimetableData;
  studyPairs: StudyPair[];
  subjectTeachers: SubjectTeacher[];
  students: Student[];
  role: UserRole;
  onUpdateSubjectTeachers?: (newTeachers: SubjectTeacher[]) => void;
  onUpdateSeatingChart?: (newChart: SeatingChartData) => void;
  onUpdateStudyPairs?: (newPairs: StudyPair[]) => void;
  onUpdateTimetable?: (newTimetable: TimetableData) => void;
}

export const HomeroomBookSeatingAndSchedule: React.FC<HomeroomBookSeatingAndScheduleProps> = ({
  seatingChart,
  timetable,
  studyPairs,
  subjectTeachers,
  students,
  role,
  onUpdateSubjectTeachers,
  onUpdateSeatingChart,
  onUpdateStudyPairs,
  onUpdateTimetable,
}) => {
  // Modal states
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<SubjectTeacher | null>(null);

  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false);

  const [isStudyPairModalOpen, setIsStudyPairModalOpen] = useState(false);
  const [selectedStudyPair, setSelectedStudyPair] = useState<StudyPair | null>(null);

  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

  const canEdit = role === 'gvcn';

  const daysList = timetable?.days || [];

  // Seating Helpers
  const getSeatInfo = (colIdx: number, deskIdx: number, seatIdx: number) => {
    return seatingChart?.columns?.[colIdx]?.desks?.[deskIdx]?.seats?.[seatIdx];
  };

  // Subject Teachers actions
  const handleOpenAddTeacher = () => {
    setSelectedTeacher(null);
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (teacher: SubjectTeacher) => {
    setSelectedTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giáo viên bộ môn này?')) return;
    const updated = (subjectTeachers || []).filter((t) => t.id !== id);
    if (onUpdateSubjectTeachers) onUpdateSubjectTeachers(updated);
  };

  const handleSaveTeacher = (savedTeacher: SubjectTeacher) => {
    let updated = [...(subjectTeachers || [])];
    const index = updated.findIndex((t) => t.id === savedTeacher.id);
    if (index >= 0) {
      updated[index] = savedTeacher;
    } else {
      updated.push(savedTeacher);
    }
    if (onUpdateSubjectTeachers) onUpdateSubjectTeachers(updated);
  };

  // Study Pairs actions
  const handleOpenAddPair = () => {
    setSelectedStudyPair(null);
    setIsStudyPairModalOpen(true);
  };

  const handleOpenEditPair = (pair: StudyPair) => {
    setSelectedStudyPair(pair);
    setIsStudyPairModalOpen(true);
  };

  const handleDeletePair = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cặp đôi cùng tiến này?')) return;
    const updated = (studyPairs || []).filter((p) => p.id !== id);
    if (onUpdateStudyPairs) onUpdateStudyPairs(updated);
  };

  const handleSavePair = (savedPair: StudyPair) => {
    let updated = [...(studyPairs || [])];
    const index = updated.findIndex((p) => p.id === savedPair.id);
    if (index >= 0) {
      updated[index] = savedPair;
    } else {
      updated.push(savedPair);
    }
    if (onUpdateStudyPairs) onUpdateStudyPairs(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 4: SƠ ĐỒ LỚP, ĐÔI BẠN CÙNG TIẾN, THỜI KHÓA BIỂU & GV BỘ MÔN
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Bố trí không gian phòng học 302, mạng lưới tương trợ học tập và thời khóa biểu 2 buổi/ngày
            </p>
          </div>
        </div>
      </div>

      {/* 1. Sơ Đồ Bố Trí Chỗ Ngồi Lớp 12A1 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-4 h-4 text-blue-600" />
            1. Sơ Đồ Bố Trí Chỗ Ngồi Phòng Học 302 (4 Dãy x 5-6 Bàn x 2 Chỗ)
          </h4>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsSeatingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer border border-blue-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Sơ Đồ Ghế Ngồi</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Bàn Giáo viên & Bảng phía trên
            </span>
          </div>
        </div>

        {/* Podium */}
        <div className="w-56 mx-auto py-2 px-4 rounded-xl bg-slate-800 text-white text-center text-xs font-black tracking-wider uppercase shadow-sm">
          BẢNG TỪ & BÀN GIÁO VIÊN
        </div>

        {/* 4 Columns Matrix Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {(seatingChart?.columns || []).map((col, colIdx) => (
            <div key={col.id || colIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-center pb-1.5 border-b border-slate-200">
                <span className="font-black text-[#003366] text-xs uppercase">{col.name}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Tổ {colIdx + 1}</span>
              </div>
              <div className="space-y-2">
                {(col.desks || []).map((desk, deskIdx) => {
                  const leftSeat = desk.seats?.[0];
                  const rightSeat = desk.seats?.[1];

                  return (
                    <div
                      key={desk.id || deskIdx}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Bàn {desk.deskNumber}
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <div
                          className={`p-1 rounded font-semibold truncate ${
                            leftSeat?.studentName && leftSeat?.studentName !== 'Bàn trống'
                              ? leftSeat?.gender === 'Nữ'
                                ? 'bg-rose-50 text-rose-900 border border-rose-100'
                                : 'bg-blue-50/80 text-blue-900 border border-blue-100'
                              : 'bg-slate-50 text-slate-400'
                          }`}
                          title={leftSeat?.studentName || 'Bàn trống'}
                        >
                          {leftSeat?.studentName ? leftSeat.studentName.split(' ').pop() : '-'}
                        </div>
                        <div
                          className={`p-1 rounded font-semibold truncate ${
                            rightSeat?.studentName && rightSeat?.studentName !== 'Bàn trống'
                              ? rightSeat?.gender === 'Nữ'
                                ? 'bg-rose-50 text-rose-900 border border-rose-100'
                                : 'bg-blue-50/80 text-blue-900 border border-blue-100'
                              : 'bg-slate-50 text-slate-400'
                          }`}
                          title={rightSeat?.studentName || 'Bàn trống'}
                        >
                          {rightSeat?.studentName ? rightSeat.studentName.split(' ').pop() : '-'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Đôi Bạn Cùng Tiến */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            2. Phong Trào "Đôi Bạn Cùng Tiến" & Nhóm Học Tập Hỗ Trợ 1-1
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {(studyPairs || []).length} Cặp đôi cùng tiến
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddPair}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm Cặp Đôi</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(studyPairs || []).map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 hover:border-emerald-300 transition-all space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-900 text-xs">{p.deskLabel}</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {p.status === 'achieved' ? 'Đã đạt mục tiêu' : 'Đang tiến bộ'}
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPair(p)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Sửa cặp đôi"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePair(p.id)}
                        className="p-1 rounded bg-white text-rose-600 hover:bg-rose-100 shadow-xs cursor-pointer"
                        title="Xóa cặp đôi"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">HS Kèm Cặp</span>
                  <span className="font-bold text-slate-900 block truncate">
                    {p.student1?.name || '-'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {p.student1?.strongSubject} • GPA {p.student1?.gpa}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] font-bold text-slate-400 block">HS Cùng Tiến</span>
                  <span className="font-bold text-slate-900 block truncate">
                    {p.student2?.name || '-'}
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    {p.student2?.strongSubject} • GPA {p.student2?.gpa}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 border-t border-emerald-100 pt-1.5">
                <span className="font-semibold text-slate-700">Mục tiêu:</span> {p.targetGoal}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Danh Sách Giáo Viên Bộ Môn */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            3. Danh Sách Giáo Viên Giảng Dạy Các Bộ Môn Lớp 12A1
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              {(subjectTeachers || []).length} Bộ môn
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddTeacher}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Giáo Viên BM</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(subjectTeachers || []).map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-1.5 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-[#003366] text-xs">{t.subjectName}</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {t.periodsPerWeek} tiết/tuần
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTeacher(t)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(t.id)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h5 className="font-bold text-slate-900 text-sm">{t.teacherName}</h5>
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200">
                <p className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" /> {t.phone}
                </p>
                <p className="flex items-center gap-1.5 text-slate-500 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {t.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Thời Khóa Biểu 2 Buổi Sáng - Chiều */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            4. Thời Khóa Biểu Giảng Dạy Chuẩn 2 Buổi / Ngày
          </h4>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsTimetableModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer border border-indigo-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Thời Khóa Biểu</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {timetable?.appliedDate || 'Áp dụng từ Học kỳ II'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 border border-slate-200 text-center w-16">Tiết</th>
                {daysList.map((day) => (
                  <th key={day.dayKey} className="py-2.5 px-3 border border-slate-200 text-center">
                    {day.dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Sáng */}
              <tr className="bg-blue-50 font-bold text-blue-900">
                <td
                  colSpan={daysList.length + 1}
                  className="py-1.5 px-3 border border-slate-200 text-xs uppercase tracking-wider"
                >
                  BUỔI SÁNG (07:00 - 11:20) - CÁC MÔN VĂN HÓA CHÍNH KHÓA
                </td>
              </tr>
              {[0, 1, 2, 3, 4].map((periodIdx) => (
                <tr key={`morning-${periodIdx}`} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border border-slate-200 text-center font-bold text-slate-600">
                    Tiết {periodIdx + 1}
                  </td>
                  {daysList.map((day) => {
                    const lesson = day.morning && day.morning[periodIdx];
                    return (
                      <td
                        key={day.dayKey}
                        className="py-2 px-3 border border-slate-200 text-center font-medium"
                      >
                        {lesson && lesson.subject ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{lesson.subject}</span>
                            <span className="text-[10px] text-slate-500">{lesson.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Chiều */}
              <tr className="bg-amber-50 font-bold text-amber-900">
                <td
                  colSpan={daysList.length + 1}
                  className="py-1.5 px-3 border border-slate-200 text-xs uppercase tracking-wider"
                >
                  BUỔI CHIỀU (13:30 - 17:45) - ÔN LUYỆN CHUYÊN ĐỀ & GDTC/HĐTN
                </td>
              </tr>
              {[0, 1, 2, 3, 4].map((periodIdx) => (
                <tr key={`afternoon-${periodIdx}`} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border border-slate-200 text-center font-bold text-slate-600">
                    Tiết {periodIdx + 1}
                  </td>
                  {daysList.map((day) => {
                    const lesson = day.afternoon && day.afternoon[periodIdx];
                    return (
                      <td
                        key={day.dayKey}
                        className="py-2 px-3 border border-slate-200 text-center font-medium"
                      >
                        {lesson && lesson.subject ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{lesson.subject}</span>
                            <span className="text-[10px] text-slate-500">{lesson.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subject Teacher Modal */}
      {isTeacherModalOpen && (
        <EditSubjectTeacherModal
          isOpen={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          teacherItem={selectedTeacher}
          onSave={handleSaveTeacher}
        />
      )}

      {/* Edit Seating Modal */}
      {isSeatingModalOpen && (
        <EditSeatingModal
          isOpen={isSeatingModalOpen}
          onClose={() => setIsSeatingModalOpen(false)}
          seatingChart={seatingChart}
          students={students}
          onSave={(newChart) => {
            if (onUpdateSeatingChart) onUpdateSeatingChart(newChart);
          }}
        />
      )}

      {/* Edit Study Pair Modal */}
      {isStudyPairModalOpen && (
        <EditStudyPairModal
          isOpen={isStudyPairModalOpen}
          onClose={() => setIsStudyPairModalOpen(false)}
          studyPair={selectedStudyPair}
          students={students}
          onSave={handleSavePair}
        />
      )}

      {/* Edit Timetable Modal */}
      {isTimetableModalOpen && (
        <EditTimetableModal
          isOpen={isTimetableModalOpen}
          onClose={() => setIsTimetableModalOpen(false)}
          timetable={timetable}
          onSave={(newTimetable) => {
            if (onUpdateTimetable) onUpdateTimetable(newTimetable);
          }}
        />
      )}
    </div>
  );
};
