import React, { useState } from 'react';
import {
  X,
  Award,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Filter,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Check,
} from 'lucide-react';
import { OnlineExam, OnlineExamAttempt, Student, ClassInfo } from '../types';

interface OnlineExamResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: OnlineExam;
  attempts: OnlineExamAttempt[];
  students: Student[];
  classInfo?: ClassInfo;
}

export const OnlineExamResultsModal: React.FC<OnlineExamResultsModalProps> = ({
  isOpen,
  onClose,
  exam,
  attempts,
  students,
  classInfo = {
    className: '12A1',
    schoolYear: '2025 - 2026',
    schoolName: 'THPT Trần Nguyên Hãn',
    homeroomTeacher: 'Nguyễn Văn Cừ',
    totalStudents: 35,
    groupCount: 4,
  },
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'ranks' | 'question_analysis'>('ranks');
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter attempts for this exam
  const examAttempts = attempts.filter((a) => a.examId === exam.id);

  // Map students to their best attempt
  const studentAttemptMap = new Map<string, OnlineExamAttempt>();
  examAttempts.forEach((att) => {
    const prev = studentAttemptMap.get(att.studentId);
    if (!prev || att.score > prev.score) {
      studentAttemptMap.set(att.studentId, att);
    }
  });

  // Calculate high-level stats
  const totalSubmissions = studentAttemptMap.size;
  const participationRate = students.length > 0 ? (totalSubmissions / students.length) * 100 : 0;
  
  const scoreList = Array.from(studentAttemptMap.values()).map((a) => a.score);
  const avgScore = scoreList.length > 0 ? scoreList.reduce((a, b) => a + b, 0) / scoreList.length : 0;
  const maxScore = scoreList.length > 0 ? Math.max(...scoreList) : 0;
  const minScore = scoreList.length > 0 ? Math.min(...scoreList) : 0;
  const passCount = scoreList.filter((s) => s >= 5.0).length;
  const passRate = scoreList.length > 0 ? (passCount / scoreList.length) * 100 : 0;

  // Grade Distribution Counts
  const gradeBuckets = {
    excellent: scoreList.filter((s) => s >= 9.0).length, // 9.0 - 10
    good: scoreList.filter((s) => s >= 8.0 && s < 9.0).length, // 8.0 - 8.9
    fair: scoreList.filter((s) => s >= 6.5 && s < 8.0).length, // 6.5 - 7.9
    average: scoreList.filter((s) => s >= 5.0 && s < 6.5).length, // 5.0 - 6.4
    weak: scoreList.filter((s) => s < 5.0).length, // < 5.0
  };

  // Filtered Students List
  const displayList = students
    .map((st) => {
      const att = studentAttemptMap.get(st.id);
      return {
        student: st,
        attempt: att || null,
      };
    })
    .filter(({ student, attempt }) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = selectedGroup === 'all' || student.group === Number(selectedGroup);
      return matchSearch && matchGroup;
    })
    .sort((a, b) => {
      const scoreA = a.attempt ? a.attempt.score : -1;
      const scoreB = b.attempt ? b.attempt.score : -1;
      return scoreB - scoreA;
    });

  // Question-by-question Item Analysis
  const questionStats = exam.questions.map((q, idx) => {
    let rightAnswers = 0;
    let totalAttemptsForQ = 0;
    examAttempts.forEach((att) => {
      if (att.answers[q.id]) {
        totalAttemptsForQ += 1;
        if (att.answers[q.id] === q.correctAnswer) {
          rightAnswers += 1;
        }
      }
    });

    const accuracyRate = totalAttemptsForQ > 0 ? (rightAnswers / totalAttemptsForQ) * 100 : 0;
    return {
      index: idx + 1,
      question: q,
      rightAnswers,
      totalAttempts: totalAttemptsForQ,
      accuracyRate,
    };
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['STT', 'Mã Học Sinh', 'Họ và Tên', 'Tổ', 'Điểm Số (Thang 10)', 'Số Câu Đúng', 'Tổng Câu', 'Thời Gian Làm (Giây)', 'Thời Điểm Nộp', 'Trạng Thái'];
    const rows = displayList.map((item, idx) => [
      idx + 1,
      `"${item.student.code}"`,
      `"${item.student.name}"`,
      item.student.group,
      item.attempt ? item.attempt.score.toFixed(1) : 'Chưa nộp',
      item.attempt ? item.attempt.correctCount : 0,
      exam.questions.length,
      item.attempt ? item.attempt.timeSpentSeconds : 0,
      item.attempt ? `"${item.attempt.submittedAt}"` : 'Chưa nộp',
      item.attempt ? 'Đã hoàn thành' : 'Chưa nộp bài',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Online_${exam.title.replace(/\s+/g, '_')}_${classInfo?.className || '12A1'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white line-clamp-1">
                  Bảng Điểm & Phân Tích Đề Thi: {exam.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-semibold border border-blue-400/30">
                  {exam.subject}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Lớp {classInfo?.className || '12A1'} • Thời lượng: {exam.durationMinutes} phút • Tổng số câu: {exam.questions.length} câu
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              {exportSuccess ? <Check className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
              {exportSuccess ? 'Đã Xuất File!' : 'Xuất Bảng Điểm (.CSV/Excel)'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Level Analytics Cards */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-shrink-0 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số Bài Đã Nộp</span>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {totalSubmissions} / {students.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tỉ lệ tham gia: {participationRate.toFixed(0)}%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Điểm Trung Bình</span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {avgScore.toFixed(1)} / 10
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cao nhất: {maxScore.toFixed(1)} • Thấp nhất: {minScore.toFixed(1)}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tỉ Lệ Đạt (≥ 5.0)</span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {passRate.toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{passCount}/{totalSubmissions} học sinh trên trung bình</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phân Phối Điểm Giỏi</span>
            <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
              {gradeBuckets.excellent + gradeBuckets.good} HS
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">≥ 8.0 điểm: {totalSubmissions > 0 ? (((gradeBuckets.excellent + gradeBuckets.good) / totalSubmissions) * 100).toFixed(0) : 0}%</div>
          </div>
        </div>

        {/* Tab Toggle: Ranks vs Question Analysis */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3">
          <button
            onClick={() => setActiveTab('ranks')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ranks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Bảng Xếp Hạng Điểm Thí Sinh ({displayList.length})
          </button>
          <button
            onClick={() => setActiveTab('question_analysis')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'question_analysis'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Phân Tích Độ Khó Từng Câu Hỏi
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'ranks' && (
            <>
              {/* Search & Filter bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Lọc theo tổ:</span>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">Tất Cả Các Tổ</option>
                    <option value="1">Tổ 1</option>
                    <option value="2">Tổ 2</option>
                    <option value="3">Tổ 3</option>
                    <option value="4">Tổ 4</option>
                  </select>
                </div>
              </div>

              {/* Ranks Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 w-12 text-center">Hạng</th>
                      <th className="py-2.5 px-3">Học Sinh</th>
                      <th className="py-2.5 px-3 text-center">Tổ</th>
                      <th className="py-2.5 px-3 text-center">Thời Gian Làm</th>
                      <th className="py-2.5 px-3 text-center">Số Câu Đúng</th>
                      <th className="py-2.5 px-3 text-right">Điểm Số</th>
                      <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayList.map((item, idx) => {
                      const att = item.attempt;
                      const hasAtt = !!att;

                      return (
                        <tr
                          key={item.student.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-bold">
                            {hasAtt ? (
                              idx < 3 ? (
                                <span
                                  className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] text-white ${
                                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              ) : (
                                <span className="text-slate-500">{idx + 1}</span>
                              )
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={item.student.avatar}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {item.student.name}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.student.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400 text-[10px]">
                              Tổ {item.student.group}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">
                            {hasAtt ? (
                              <span className="flex items-center justify-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium">
                            {hasAtt ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {att.correctCount}/{att.totalQuestions}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {hasAtt ? (
                              <span
                                className={`text-sm font-extrabold ${
                                  att.score >= 8.5
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : att.score >= 6.5
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : att.score >= 5.0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {att.score.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Chưa thi</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {hasAtt ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                Đã nộp
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                                Chưa làm
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Question-by-Question Analytics */}
          {activeTab === 'question_analysis' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                Thống kê tỷ lệ làm đúng từng câu hỏi giúp Giáo viên bộ môn nhận diện các câu hỏi học sinh hay nhầm lẫn để kịp thời giảng lại trên lớp.
              </div>

              <div className="space-y-3">
                {questionStats.map((item) => (
                  <div
                    key={item.question.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {item.index}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {item.question.questionText}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Đáp án đúng: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">[{item.question.correctAnswer}]</strong> • Lời giải: {item.question.explanation || 'Áp dụng công thức cơ bản'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-sm font-extrabold ${
                            item.accuracyRate >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.accuracyRate >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {item.accuracyRate.toFixed(0)}% Đúng
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ({item.rightAnswers}/{item.totalAttempts} bài)
                        </div>
                      </div>
                    </div>

                    {/* Accuracy Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.accuracyRate >= 80
                            ? 'bg-emerald-500'
                            : item.accuracyRate >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${item.accuracyRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            Dữ liệu được cập nhật tự động theo thời gian thực từ các bài làm của học sinh.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Đóng Bảng Thống Kê
          </button>
        </div>
      </div>
    </div>
  );
};
