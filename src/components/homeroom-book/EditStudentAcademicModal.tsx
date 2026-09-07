import React, { useState } from 'react';
import { X, Save, GraduationCap, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { Student } from '../../types';

interface EditStudentAcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (updatedStudent: Student) => void;
}

export const EditStudentAcademicModal: React.FC<EditStudentAcademicModalProps> = ({
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
