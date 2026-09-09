import React, { useState } from 'react';
import { X, Save, GraduationCap, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { Student } from '../types';

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

  const mAvg = calcSubjAvg(mathTx1, mathTx2, mathGk, mathCk);
  const pAvg = calcSubjAvg(physTx1, physTx2, physGk, physCk);
  const cAvg = calcSubjAvg(chemTx1, chemTx2, chemGk, chemCk);

  const overallGpa = Number(
    ((mAvg + pAvg + cAvg + bioAvg + engAvg + litAvg) / 6).toFixed(2)
  );

  let calculatedAcademicRank: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
  if (overallGpa >= 9.0) calculatedAcademicRank = 'Xuất sắc';
  else if (overallGpa >= 8.0) calculatedAcademicRank = 'Giỏi';
  else if (overallGpa >= 6.5) calculatedAcademicRank = 'Khá';
  else if (overallGpa >= 5.0) calculatedAcademicRank = 'Trung bình';
  else calculatedAcademicRank = 'Yếu';

  const handleSave = () => {
    const updated: Student = {
      ...student,
      conductRating,
      conductScore,
      academicRank: calculatedAcademicRank,
      gpa: overallGpa,
      teacherEvaluation,
      grades: {
        math: { tx1: mathTx1, tx2: mathTx2, gk: mathGk, ck: mathCk, avg: mAvg },
        physics: { tx1: physTx1, tx2: physTx2, gk: physGk, ck: physCk, avg: pAvg },
        chemistry: { tx1: chemTx1, tx2: chemTx2, gk: chemGk, ck: chemCk, avg: cAvg },
        biology: { tx1: bioAvg, tx2: bioAvg, gk: bioAvg, ck: bioAvg, avg: bioAvg },
        english: { tx1: engAvg, tx2: engAvg, gk: engAvg, ck: engAvg, avg: engAvg },
        literature: { tx1: litAvg, tx2: litAvg, gk: litAvg, ck: litAvg, avg: litAvg },
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cập nhật Học tập & Rèn luyện</h3>
              <p className="text-xs text-slate-500">Học sinh: {student.name} - SBD: {student.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" /> Hạnh kiểm & Điểm rèn luyện
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Xếp loại Hạnh kiểm</label>
                <select
                  value={conductRating}
                  onChange={(e) => setConductRating(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Đạt">Đạt</option>
                  <option value="Chưa đạt">Chưa đạt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Điểm rèn luyện (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={conductScore}
                  onChange={(e) => setConductScore(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Điểm số các môn học
            </h4>

            <div className="p-3 border border-slate-100 rounded-xl bg-white space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Toán học</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">TBC: {mAvg}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 1</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={mathTx1}
                    onChange={(e) => setMathTx1(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 2</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={mathTx2}
                    onChange={(e) => setMathTx2(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">GK (x2)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={mathGk}
                    onChange={(e) => setMathGk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">CK (x3)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={mathCk}
                    onChange={(e) => setMathCk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center font-bold text-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-100 rounded-xl bg-white space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Vật lý</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">TBC: {pAvg}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 1</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={physTx1}
                    onChange={(e) => setPhysTx1(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 2</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={physTx2}
                    onChange={(e) => setPhysTx2(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">GK (x2)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={physGk}
                    onChange={(e) => setPhysGk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">CK (x3)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={physCk}
                    onChange={(e) => setPhysCk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center font-bold text-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-100 rounded-xl bg-white space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Hóa học</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">TBC: {cAvg}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 1</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={chemTx1}
                    onChange={(e) => setChemTx1(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">TX 2</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={chemTx2}
                    onChange={(e) => setChemTx2(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">GK (x2)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={chemGk}
                    onChange={(e) => setChemGk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">CK (x3)</span>
                  <input
                    type="number" step="0.1" min="0" max="10" value={chemCk}
                    onChange={(e) => setChemCk(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-center font-bold text-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 border border-slate-100 rounded-xl bg-white">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sinh học (TBC)</label>
                <input
                  type="number" step="0.1" min="0" max="10" value={bioAvg}
                  onChange={(e) => setBioAvg(Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-xs text-center font-medium text-slate-700"
                />
              </div>

              <div className="p-2.5 border border-slate-100 rounded-xl bg-white">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tiếng Anh (TBC)</label>
                <input
                  type="number" step="0.1" min="0" max="10" value={engAvg}
                  onChange={(e) => setEngAvg(Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-xs text-center font-medium text-slate-700"
                />
              </div>

              <div className="p-2.5 border border-slate-100 rounded-xl bg-white">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngữ văn (TBC)</label>
                <input
                  type="number" step="0.1" min="0" max="10" value={litAvg}
                  onChange={(e) => setLitAvg(Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-xs text-center font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 font-semibold block">Điểm trung bình môn (GPA)</span>
              <span className="text-2xl font-black text-indigo-700">{overallGpa}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-indigo-600 font-semibold block">Danh hiệu / Học lực</span>
              <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {calculatedAcademicRank}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nhận xét của Giáo viên Chủ nhiệm
            </label>
            <textarea
              rows={3}
              value={teacherEvaluation}
              onChange={(e) => setTeacherEvaluation(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              placeholder="Nhập nhận xét chi tiết về tình hình học tập và rèn luyện..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentAcademicModal;
