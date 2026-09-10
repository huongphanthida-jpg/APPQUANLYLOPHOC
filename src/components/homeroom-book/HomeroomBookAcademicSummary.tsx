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
  X,
  Save,
} from 'lucide-react';
import { Student, UserRole } from '../../types';

// Modal component embedded directly to guarantee Vercel build resolution
interface EditStudentAcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (updatedStudent: Student) => void;
}

const EditStudentAcademicModal: React.FC<EditStudentAcademicModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [conductRating, setConductRating] = useState<'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'>(
    (student?.conductRating as any) || 'Tốt'
  );
  const [conductScore, setConductScore] = useState<number>(student?.conductScore || 95);

  // Subject Grades
  const [mathTx1, setMathTx1] = useState(student?.grades?.math?.tx1 || 8.0);
  const [mathTx2, setMathTx2] = useState(student?.grades?.math?.tx2 || 8.5);
  const [mathGk, setMathGk] = useState(student?.grades?.math?.gk || 8.0);
  const [mathCk, setMathCk] = useState(student?.grades?.math?.ck || 8.5);

  const [physTx1, setPhysTx1] = useState(student?.grades?.physics?.tx1 || 8.0);
  const [physTx2, setPhysTx2] = useState(student?.grades?.physics?.tx2 || 8.0);
  const [physGk, setPhysGk] = useState(student?.grades?.physics?.gk || 8.5);
  const [physCk, setPhysCk] = useState(student?.grades?.physics?.ck || 8.0);

  const [chemTx1, setChemTx1] = useState(student?.grades?.chemistry?.tx1 || 7.5);
  const [chemTx2, setChemTx2] = useState(student?.grades?.chemistry?.tx2 || 8.0);
  const [chemGk, setChemGk] = useState(student?.grades?.chemistry?.gk || 8.0);
  const [chemCk, setChemCk] = useState(student?.grades?.chemistry?.ck || 8.0);

  const [bioAvg, setBioAvg] = useState(student?.grades?.biology?.avg || 8.0);
  const [engAvg, setEngAvg] = useState(student?.grades?.english?.avg || 8.2);
  const [litAvg, setLitAvg] = useState(student?.grades?.literature?.avg || 7.8);

  const [teacherEvaluation, setTeacherEvaluation] = useState(
    student?.teacherEvaluation || 'Học tập chăm chỉ, hoàn thành tốt các chỉ tiêu rèn luyện và phong trào.'
  );

  if (!isOpen || !student) return null;

  const calcSubjAvg = (tx1: number, tx2: number, gk: number, ck: number) => {
    return Number(((tx1 + tx2 + gk * 2 + ck * 3) / 7).toFixed(1));
  };

  const mathAvg = calcSubjAvg(mathTx1, mathTx2, mathGk, mathCk);
  const physAvg = calcSubjAvg(physTx1, physTx2, physGk, physCk);
  const chemAvg = calcSubjAvg(chemTx1, chemTx2, chemGk, chemCk);

  const overallGpa = Number(((mathAvg + physAvg + chemAvg + bioAvg + engAvg + litAvg) / 6).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Student = {
      ...student,
      conductRating,
      conductScore: Number(conductScore),
      teacherEvaluation,
      grades: {
        ...student.grades,
        math: { tx1: mathTx1, tx2: mathTx2, gk: mathGk, ck: mathCk, avg: mathAvg },
        physics: { tx1: physTx1, tx2: physTx2, gk: physGk, ck: physCk, avg: physAvg },
        chemistry: { tx1: chemTx1, tx2: chemTx2, gk: chemGk, ck: chemCk, avg: chemAvg },
        biology: { tx1: bioAvg, tx2: bioAvg, gk: bioAvg, ck: bioAvg, avg: bioAvg },
        english: { tx1: engAvg, tx2: engAvg, gk: engAvg, ck: engAvg, avg: engAvg },
        literature: { tx1: litAvg, tx2: litAvg, gk: litAvg, ck: litAvg, avg: litAvg },
        gpa: overallGpa,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Chỉnh Sửa Điểm & Đánh Giá 2 Mặt GD: {student.name}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Mã định danh: {student.code} • Thuộc Tổ {student.group}
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
          {/* 1. Xếp loại rèn luyện / Hạnh kiểm */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
            <h4 className="font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              1. Xếp Loại Rèn Luyện (Hạnh Kiểm) & Điểm Trừ / Cộng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Xếp loại rèn luyện:</label>
                <select
                  value={conductRating}
                  onChange={(e) => setConductRating(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-black text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Tốt">Tốt (Xuất sắc / Chuẩn mực)</option>
                  <option value="Khá">Khá (Tích cực rèn luyện)</option>
                  <option value="Đạt">Đạt (Cần cố gắng)</option>
                  <option value="Chưa đạt">Chưa đạt (Cần rèn luyện thêm)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Điểm rèn luyện tích lũy (0-100):</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={conductScore}
                  onChange={(e) => setConductScore(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Điểm số các môn học */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                2. Điểm Số Học Tập (6 Môn Trọng Điểm)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003366] font-black text-xs">
                ĐTB Tạm tính: {overallGpa}
              </span>
            </div>

            {/* Toán */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Môn Toán (ĐTB: {mathAvg}):</span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">TX1:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mathTx1}
                    onChange={(e) => setMathTx1(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">TX2:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mathTx2}
                    onChange={(e) => setMathTx2(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">GK (x2):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mathGk}
                    onChange={(e) => setMathGk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">CK (x3):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mathCk}
                    onChange={(e) => setMathCk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-red-700"
                  />
                </div>
              </div>
            </div>

            {/* Vật lí */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Môn Vật lí (ĐTB: {physAvg}):</span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={physTx1}
                    onChange={(e) => setPhysTx1(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={physTx2}
                    onChange={(e) => setPhysTx2(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={physGk}
                    onChange={(e) => setPhysGk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-blue-700"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={physCk}
                    onChange={(e) => setPhysCk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-red-700"
                  />
                </div>
              </div>
            </div>

            {/* Hóa học */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Môn Hóa học (ĐTB: {chemAvg}):</span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={chemTx1}
                    onChange={(e) => setChemTx1(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={chemTx2}
                    onChange={(e) => setChemTx2(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={chemGk}
                    onChange={(e) => setChemGk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-blue-700"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={chemCk}
                    onChange={(e) => setChemCk(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-red-700"
                  />
                </div>
              </div>
            </div>

            {/* Sinh, Anh, Văn */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/50">
              <div>
                <label className="text-[10px] text-slate-600 font-bold block">ĐTB Sinh học:</label>
                <input
                  type="number"
                  step="0.1"
                  value={bioAvg}
                  onChange={(e) => setBioAvg(Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block">ĐTB Tiếng Anh:</label>
                <input
                  type="number"
                  step="0.1"
                  value={engAvg}
                  onChange={(e) => setEngAvg(Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block">ĐTB Ngữ văn:</label>
                <input
                  type="number"
                  step="0.1"
                  value={litAvg}
                  onChange={(e) => setLitAvg(Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 3. Lời phê & Nhận xét của GVCN */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nhận xét & Lời phê của GVCN:</label>
            <textarea
              rows={3}
              value={teacherEvaluation}
              onChange={(e) => setTeacherEvaluation(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhận xét sự tiến bộ, ưu nhược điểm và định hướng phấn đấu..."
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Lưu Điểm & Đánh Giá</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const stats = useMemo(() => {
    let totalGPA = 0;
    let excellentCount = 0; // >= 9.0
    let goodCount = 0; // >= 8.0 & < 9.0
    let fairCount = 0; // >= 6.5 & < 8.0
    let avgCount = 0; // < 6.5

    let conductGood = 0;
    let conductFair = 0;

    (students || []).forEach((s) => {
      const gpa = s.grades?.gpa || 0;
      totalGPA += gpa;
      if (gpa >= 9.0) excellentCount++;
      else if (gpa >= 8.0) goodCount++;
      else if (gpa >= 6.5) fairCount++;
      else avgCount++;

      const cond = s.conductRating || (s.conductScore >= 90 ? 'Tốt' : 'Khá');
      if (cond === 'Tốt') conductGood++;
      else conductFair++;
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
      conductFair,
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

  // Dynamic Subject Columns sync with AcademicView
  const ALL_SUBJECT_MAP: Record<string, { name: string; short: string; colorClass: string }> = {
    math: { name: 'Toán Học', short: 'Toán', colorClass: 'text-blue-700 font-bold' },
    physics: { name: 'Vật Lý', short: 'Vật Lý', colorClass: 'text-amber-700 font-bold' },
    chemistry: { name: 'Hóa Học', short: 'Hóa Học', colorClass: 'text-emerald-700 font-bold' },
    biology: { name: 'Sinh Học', short: 'Sinh', colorClass: 'text-teal-700 font-bold' },
    literature: { name: 'Ngữ Văn', short: 'Ngữ Văn', colorClass: 'text-rose-700 font-bold' },
    history: { name: 'Lịch Sử', short: 'Lịch Sử', colorClass: 'text-amber-600 font-bold' },
    geography: { name: 'Địa Lý', short: 'Địa Lý', colorClass: 'text-lime-700 font-bold' },
    gdcd: { name: 'GDCD', short: 'GDCD', colorClass: 'text-cyan-700 font-bold' },
    english: { name: 'Tiếng Anh', short: 'Tiếng Anh', colorClass: 'text-purple-700 font-bold' },
    informatics: { name: 'Tin Học', short: 'Tin Học', colorClass: 'text-indigo-700 font-bold' },
  };

  const activeSubjectKeys = useMemo(() => {
    try {
      const saved = localStorage.getItem('tbm_active_subject_columns');
      if (saved) return JSON.parse(saved) as string[];
    } catch (e) {}
    return ['math', 'physics', 'chemistry', 'biology', 'literature', 'english'];
  }, []);

  const activeSubjects = useMemo(() => {
    return activeSubjectKeys
      .filter((k) => ALL_SUBJECT_MAP[k])
      .map((k) => ({ key: k, ...ALL_SUBJECT_MAP[k] }));
  }, [activeSubjectKeys]);

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
              Thống kê kết quả học tập các môn học ({activeSubjects.map((s) => s.short).join(', ')}) và xếp loại rèn luyện
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm">
          <span className="text-xs font-bold text-blue-700 block">Điểm Trung Bình Cả Lớp</span>
          <span className="text-2xl font-black text-[#003366]">{stats.avgGPA}</span>
          <span className="text-[10px] text-blue-600 block mt-0.5">Xếp thứ 1 / Toàn Khối</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">Học Lực Giỏi & Xuất Sắc</span>
          <span className="text-2xl font-black text-emerald-600">{stats.excellentCount + stats.goodCount} HS</span>
          <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
            Tỷ lệ: {stats.excellentPercent}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 block">Học Lực Khá</span>
          <span className="text-2xl font-black text-indigo-600">{stats.fairCount} HS</span>
          <span className="text-[10px] text-indigo-600 block mt-0.5">
            Tỷ lệ: {(((stats.fairCount) / (students.length || 1)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm">
          <span className="text-xs font-bold text-purple-700 block">Hạnh Kiểm Loại Tốt</span>
          <span className="text-2xl font-black text-purple-600">{stats.conductGood} HS</span>
          <span className="text-[10px] text-purple-600 block mt-0.5">
            Tỷ lệ: {(((stats.conductGood) / (students.length || 1)) * 100).toFixed(1)}%
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
                <th rowSpan={2} className="py-2.5 px-3 border border-slate-200 bg-blue-50 text-[#003366]">Tổng Cộng</th>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-600 uppercase text-[10px]">
                <th className="py-2 px-2 border border-slate-200 text-emerald-700">Xuất Sắc</th>
                <th className="py-2 px-2 border border-slate-200 text-blue-700">Giỏi</th>
                <th className="py-2 px-2 border border-slate-200 text-indigo-700">Khá</th>
                <th className="py-2 px-2 border border-slate-200 text-slate-500">Đạt / Phụ Đạo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3 border border-slate-200 text-left font-bold text-purple-900 bg-purple-50/30">
                  Tốt (Đạt chuẩn)
                </td>
                <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-bold">{stats.excellentCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-blue-700 font-bold">{stats.goodCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-indigo-700 font-bold">{stats.fairCount - stats.conductFair} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 font-bold text-purple-900 bg-purple-50/50">
                  {stats.conductGood} HS ({(((stats.conductGood) / (students.length || 1)) * 100).toFixed(1)}%)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border border-slate-200 text-left font-bold text-amber-900 bg-amber-50/30">
                  Khá (Cần rèn luyện)
                </td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 text-amber-700 font-bold">{stats.conductFair} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-slate-400">0</td>
                <td className="py-2 px-3 border border-slate-200 font-bold text-amber-900 bg-amber-50/50">
                  {stats.conductFair} HS ({(((stats.conductFair) / (students.length || 1)) * 100).toFixed(1)}%)
                </td>
              </tr>
              <tr className="bg-slate-100 font-black text-slate-900">
                <td className="py-2 px-3 border border-slate-200 text-left uppercase">Tổng Cộng</td>
                <td className="py-2 px-3 border border-slate-200 text-emerald-700">{stats.excellentCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-blue-700">{stats.goodCount} HS</td>
                <td className="py-2 px-3 border border-slate-200 text-indigo-700">{stats.fairCount} HS</td>
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Bảng Điểm Chi Tiết {activeSubjects.length} Môn & Đánh Giá Từng Học Sinh ({students.length} HS)
          </span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                <th className="py-2.5 px-3 border border-slate-200 text-center">STT</th>
                <th className="py-2.5 px-3 border border-slate-200">Họ và Tên</th>
                <th className="py-2.5 px-3 border border-slate-200 text-center">Tổ</th>
                {activeSubjects.map((subj) => (
                  <th key={subj.key} className={`py-2.5 px-3 border border-slate-200 text-center ${subj.colorClass}`}>
                    {subj.short}
                  </th>
                ))}
                <th className="py-2.5 px-3 border border-slate-200 text-center bg-blue-50 text-[#003366]">ĐTB Môn</th>
                <th className="py-2.5 px-3 border border-slate-200 text-center bg-purple-50 text-purple-900">Rèn Luyện</th>
                <th className="py-2.5 px-3 border border-slate-200">GVCN Nhận Xét</th>
                {canEdit && <th className="py-2.5 px-3 border border-slate-200 text-center">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              {(students || []).map((student, index) => {
                const gpa = student.grades?.gpa || 8.0;
                const conduct = student.conductRating || 'Tốt';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 border border-slate-200 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-center">Tổ {student.group}</td>
                    {activeSubjects.map((subj) => {
                      const g = (student.grades as any)?.[subj.key];
                      const val = typeof g === 'number' ? g : (g?.avg ?? 8.0);
                      return (
                        <td key={subj.key} className={`py-2 px-3 border border-slate-200 text-center ${subj.colorClass}`}>
                          {val}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 border border-slate-200 text-center font-black text-[#003366] bg-blue-50/50">
                      {gpa.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-center font-bold text-purple-900 bg-purple-50/40">
                      {conduct}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-[11px] text-slate-600 max-w-xs truncate">
                      {student.teacherEvaluation || 'Học tập chăm chỉ, hoàn thành tốt nhiệm vụ.'}
                    </td>
                    {canEdit && (
                      <td className="py-2 px-3 border border-slate-200 text-center">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
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

export default HomeroomBookAcademicSummary;
