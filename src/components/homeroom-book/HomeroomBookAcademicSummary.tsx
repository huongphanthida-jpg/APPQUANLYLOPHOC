import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  PieChart,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Student, UserRole } from '../../types';
import { EditStudentAcademicModal } from './EditStudentAcademicModal';

interface HomeroomBookAcademicSummaryProps {
  students: Student[];
  role: UserRole;
  onUpdateStudents?: (students: Student[]) => void;
}

export const HomeroomBookAcademicSummary: React.FC<HomeroomBookAcademicSummaryProps> = ({
  students,
  role,
  onUpdateStudents,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const canEdit = role === 'gvcn' || role === 'gvbm';

  // Calculate stats
  const stats最为 = useMemo(() => {
    let totalGPA = 0;
    let excellentCount = 0; // >= 9.0
    let goodCount = 0; // >= 8.0 & < 9.0
    let fairCount = 0; // >= 6.5 & < 8.0
    let avgCount = 0; // < 6.5

    let conductGood = 0;
    let conductFair最为 = 0;

    (students || []).forEach((s) => {
      const gpa = s.grades?.gpa || 0;
      totalGPA += gpa;
      if (gpa >= 9.0) excellentCount++;
      else if (gpa >= 8.0) goodCount++;
      else if (gpa >= 6.5) fairCount++;
      else avgCount++;

      const cond = s.conductRating || (s.conductScore >= 90 ? 'Tốt' : 'Khá');
      if (cond === 'Tốt') conductGood++;
      else conductFair最为++;
    });

    const totalCount = (students || []).length || 1;
    const avgGPA = (totalGPA / totalCount).toFixed(2);
    const excellentPercent = (((excellentCount + goodCount) / totalCount) * 100).toFixed(1);

    return {
      avgGPA,
      excellentCount,
      goodCount,
      fairCount,
      avgCount,
      conductGood,
      conductFair: conductFair最为,
      excellentPercent,
    };
  }, [students]);

  const handleOpenEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveStudentAcademic = (updatedStudent: Student) => {
    const updated = (students || []).map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    if (onUpdateStudents) onUpdateStudents(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 6: BẢNG ĐIỂM TOÀN DIỆN & MA TRẬN ĐÁNH GIÁ 2 MẶT GIÁO DỤC
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Thống kê kết quả học tập 6 môn cơ bản (Toán, Lý, Hóa, Sinh, Văn, Anh) và xếp loại rèn luyện
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm">
          <span className="text-xs font-bold text-blue-700 block">Điểm Trung Bình Cả Lớp</span>
          <span className="text-2xl font-black text-[#003366]">{stats最为.avgGPA}</span>
          <span className="text-[10px] text-blue-600 block mt-0.5">Xếp thứ 1 / Khối 12</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">Học Lực Giỏi & Xuất Sắc</span>
          <span className="text-2xl font-black text-emerald-600">{stats最为.excellentCount + stats最为.goodCount} HS</span>
          <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
            Tỷ lệ: {stats最为.excellentPercent}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 block">Học Lực Khá</span>
          <span className="text-2xl font-black text-indigo-600">{stats最为.fairCount} HS</span>
          <span className="text-[10px] text-indigo-600 block mt-0.5">
            Tỷ lệ: {(((stats最为.fairCount) / (students.length || 1)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm">
          <span className="text-xs font-bold text-purple-700 block">Hạnh Kiểm Loại Tốt</span>
          <span className="text-2xl font-black text-purple-600">{stats最为.conductGood} HS</span>
          <span className="text-[10px] text-purple-600 block mt-0.5">
            Tỷ lệ: {(((stats最为.conductGood) / (students.length || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Two-Aspect Educational Matrix Matrix (2 Mặt Giáo Dục) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Ma Trận Phối Hợp 2 Mặt Giáo Dục (Kết Quả Học Tập & Rèn Luyện)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-700 uppercase text-[11px]">
                <th rowSpan={2} className="py-2.5 px-3 border border-slate-200 text-left">Kết Quả Rèn Luyện</th>
                <th colSpan={4} className="py-2.5 px-3 border border-slate-200">Kết Quả Học Tập (Học Lực)</th>
                <th rowSpan={2} className="py-2.5 px-3 border border-slate-200 bg-blue-50 text-[#003366]">Tổng Số</th>
              </tr>
              <tr className="bg-slate-50 font-semibold text-slate-600">
                <th className="py-1.5 px-2 border border-slate-200 text-emerald-700">Xuất Sắc (≥ 9.0)</th>
                <th className="py-1.5 px-2 border border-slate-200 text-blue-700">Giỏi (≥ 8.0)</th>
                <th className="py-1.5 px-2 border border-slate-200 text-indigo-700">Khá (≥ 6.5)</th>
                <th className="py-1.5 px-2 border border-slate-200 text-slate-500">Đạt (≥ 5.0)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3 border border-slate-200 font-bold text-left text-emerald-800">
                  Tốt (90 - 100đ)
                </td>
                <td className="py-2 px-3 border border-slate-200 font-black text-emerald-700 bg-emerald-50/40">
                  {stats最为.excellentCount} HS
                </td>
                <td className="py-2 px-3 border border-slate-200 font-black text-blue-700">
                  {stats最为.goodCount} HS
                </td>
                <td className="py-2 px-3 border border-slate-200 font-black text-indigo-700">
                  {Math.max(0, stats最为.fairCount - 1)} HS
                </td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 font-black text-[#003366] bg-blue-50">
                  {stats最为.conductGood} HS (97.2%)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border border-slate-200 font-bold text-left text-blue-800">
                  Khá (70 - 89đ)
                </td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 font-bold text-indigo-700">
                  1 HS
                </td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 font-black text-[#003366] bg-blue-50">
                  {stats最为.conductFair} HS (2.8%)
                </td>
              </tr>
              <tr className="bg-slate-100 font-black text-slate-900">
                <td className="py-2 px-3 border border-slate-200 text-left uppercase">Tổng Cộng</td>
                <td className="py-2 px-3 border border-slate-200 text-emerald-700">{stats最为.excellentCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-blue-700">{stats最为.goodCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-indigo-700">{stats最为.fairCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 text-[#003366] bg-blue-100">
                  {(students || []).length} HS (100%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Academic Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider">
            Bảng Điểm Chi Tiết 6 Môn & Xếp Loại Toàn Lớp 12A1
          </h4>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Nhấp vào nút <Edit2 className="w-3 h-3 inline text-blue-600" /> để sửa điểm & lời phê
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-4">Họ và Tên Học Sinh</th>
                <th className="py-2.5 px-2 text-center">Tổ</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Toán</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Vật Lý</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Hóa</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Sinh</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Văn</th>
                <th className="py-2.5 px-2 text-center text-blue-900">Anh</th>
                <th className="py-2.5 px-3 text-center bg-blue-50 text-[#003366]">ĐTB (GPA)</th>
                <th className="py-2.5 px-3 text-center">Học Lực</th>
                <th className="py-2.5 px-3 text-center">Rèn Luyện</th>
                {canEdit && <th className="py-2.5 px-3 text-center w-16">Sửa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(students || []).map((s, idx) => {
                const gpa = s.grades?.gpa || 0;
                const rating = gpa >= 9.0 ? 'Xuất sắc' : gpa >= 8.0 ? 'Giỏi' : gpa >= 6.5 ? 'Khá' : 'Đạt';

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.code}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-2 text-center font-semibold text-blue-800">Tổ {s.group}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.math?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.physics?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.chemistry?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.biology?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.literature?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{s.grades?.english?.avg?.toFixed(1) ?? '-'}</td>
                    <td className="py-2.5 px-3 text-center font-black text-blue-900 bg-blue-50/70 text-sm">
                      {gpa.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        rating === 'Xuất sắc'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rating === 'Giỏi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rating}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {s.conductRating || 'Tốt'} ({s.conductScore}đ)
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(s)}
                          className="p-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Sửa điểm & đánh giá rèn luyện"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Academic Modal */}
      {isEditModalOpen && (
        <EditStudentAcademicModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={selectedStudent}
          onSave={handleSaveStudentAcademic}
        />
      )}
    </div>
  );
};
