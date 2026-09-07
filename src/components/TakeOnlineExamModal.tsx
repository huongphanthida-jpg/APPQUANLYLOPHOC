import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  BookOpen,
  Send,
  Sparkles,
  Share2,
  Check,
  XCircle,
} from 'lucide-react';
import { OnlineExam, OnlineExamAttempt, Student, UserRole, ClassInfo } from '../types';

interface TakeOnlineExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: OnlineExam;
  student?: Student | null;
  currentStudent?: Student | null;
  role?: UserRole;
  onSaveAttempt: (attempt: OnlineExamAttempt) => void;
  existingAttempt?: OnlineExamAttempt | null;
  classInfo?: ClassInfo;
}

export const TakeOnlineExamModal: React.FC<TakeOnlineExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  student: propStudent,
  currentStudent,
  role = 'student',
  onSaveAttempt,
  existingAttempt,
  classInfo = {
    className: '12A1',
    schoolYear: '2025 - 2026',
    schoolName: 'THPT Trần Nguyên Hãn',
    homeroomTeacher: 'Nguyễn Văn Cừ',
    totalStudents: 35,
    groupCount: 4,
  },
}) => {
  const student: Student = propStudent || currentStudent || {
    id: 'hs-default',
    name: 'Học sinh 12A1',
    code: '12A1-01',
    gender: 'Nam',
    group: 1,
    desk: 'Dãy 1 - Bàn 1',
    grades: {},
    attendance: { present: 100, late: 0, excused: 0, unexcused: 0 },
    conduct: 'Tốt',
    academicRank: 'Giỏi',
    parentName: 'Phụ huynh',
    parentPhone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  };

  // Navigation & Answers State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: 'A' | 'B' | 'C' | 'D' }>(
    existingAttempt?.answers || {}
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qId: string]: boolean }>({});
  
  // Timer State (in seconds)
  const totalSeconds = (exam.durationMinutes || 45) * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(
    existingAttempt ? 0 : totalSeconds
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!existingAttempt);
  const [reviewMode, setReviewMode] = useState<boolean>(!!existingAttempt);
  const [completedAttempt, setCompletedAttempt] = useState<OnlineExamAttempt | null>(
    existingAttempt || null
  );

  // Confirm submit dialog
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Font size multiplier
  const [fontScale, setFontScale] = useState<number>(1); // 1 = normal, 1.1 = larger, 1.2 = largest

  // Timer interval ref
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (existingAttempt) {
      setIsSubmitted(true);
      setReviewMode(true);
      setCompletedAttempt(existingAttempt);
      setAnswers(existingAttempt.answers || {});
      return;
    }

    // Reset when starting a fresh test
    setIsSubmitted(false);
    setReviewMode(false);
    setCompletedAttempt(null);
    setAnswers({});
    setFlaggedQuestions({});
    setCurrentQIndex(0);
    setSecondsLeft(totalSeconds);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, exam.id, existingAttempt]);

  if (!isOpen) return null;

  const currentQ = exam.questions[currentQIndex] || exam.questions[0];

  // Select Option
  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted && !reviewMode) return;
    if (isSubmitted) return; // cannot edit after submit

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optKey,
    }));
  };

  // Toggle flag / bookmark question
  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Auto-submit when time is up
  const handleAutoSubmit = () => {
    calculateAndSaveAttempt();
  };

  // User click submit
  const handleManualSubmit = () => {
    setShowConfirmSubmit(false);
    if (timerRef.current) clearInterval(timerRef.current);
    calculateAndSaveAttempt();
  };

  // Calculate score and trigger save
  const calculateAndSaveAttempt = () => {
    let totalScore = 0;
    let correctCount = 0;

    exam.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected && selected === q.correctAnswer) {
        correctCount += 1;
        totalScore += q.points || (10 / exam.questions.length);
      }
    });

    const timeSpent = totalSeconds - secondsLeft;

    const newAttempt: OnlineExamAttempt = {
      id: `att-${Date.now()}`,
      examId: exam.id,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.code,
      group: student.group,
      startedAt: new Date(Date.now() - timeSpent * 1000).toISOString().replace('T', ' ').slice(0, 16),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      timeSpentSeconds: timeSpent > 0 ? timeSpent : 60,
      answers,
      score: +totalScore.toFixed(1),
      correctCount,
      totalQuestions: exam.questions.length,
      status: 'completed',
    };

    setCompletedAttempt(newAttempt);
    setIsSubmitted(true);
    setReviewMode(true);
    onSaveAttempt(newAttempt);
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.questions.length - answeredCount;

  // Rating badge for completed attempt
  const getRatingInfo = (score: number) => {
    if (score >= 9.0) return { label: 'Xuất Sắc', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' };
    if (score >= 8.0) return { label: 'Giỏi', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300' };
    if (score >= 6.5) return { label: 'Khá', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300' };
    if (score >= 5.0) return { label: 'Trung Bình', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-300' };
    return { label: 'Cần Cố Gắng', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/60 border-red-300' };
  };

  const isTimeCritical = secondsLeft <= 180 && !isSubmitted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[94vh] max-h-[900px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              {exam.subject.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {exam.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-semibold border border-blue-400/30">
                  {exam.subject}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Thí sinh: <strong className="text-white">{student.name}</strong> ({student.code}) • Lớp {classInfo?.className || '12A1'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Countdown Timer or Status Badge */}
            {!isSubmitted ? (
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  isTimeCritical
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-emerald-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(secondsLeft)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Hoàn Thành Bài Thi</span>
              </div>
            )}

            {/* Font scaling control */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setFontScale(Math.max(0.9, fontScale - 0.1))}
                className="px-2 py-1 text-xs text-slate-300 hover:text-white"
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontScale(Math.min(1.3, fontScale + 0.1))}
                className="px-2 py-1 text-xs text-slate-300 hover:text-white"
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body Content: 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Question Navigator Palette & Progress */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col flex-shrink-0 overflow-y-auto">
            {/* Summary Progress Box */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 mb-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                <span>Tiến Độ Làm Bài</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {answeredCount}/{exam.questions.length} câu
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-600"></span>
                  <span>Đã làm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span>Đánh dấu</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></span>
                  <span>Chưa làm</span>
                </div>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Bảng Câu Hỏi ({exam.questions.length})
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlagged = !!flaggedQuestions[q.id];

                  // In review mode: check if answer is right or wrong
                  let reviewColor = '';
                  if (reviewMode) {
                    const isRight = answers[q.id] === q.correctAnswer;
                    reviewColor = isRight
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-red-500 text-white border-red-500';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                        reviewMode
                          ? reviewColor
                          : isCurrent
                          ? 'ring-2 ring-blue-500 border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : isAnswered
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && !reviewMode && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit / Finish Action in Left Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Nộp Bài Thi Ngay
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Hoàn Tất & Thoát
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Active Question Screen or Result Screen */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto p-6">
            {/* SCORE BANNER WHEN COMPLETED */}
            {isSubmitted && completedAttempt && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
                    <span className="text-xl font-extrabold leading-none">{completedAttempt.score.toFixed(1)}</span>
                    <span className="text-[10px] font-medium text-blue-100">/ 10 ĐIỂM</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Kết Quả Bài Thi Trắc Nghiệm Online
                      </h3>
                      {(() => {
                        const r = getRatingInfo(completedAttempt.score);
                        return (
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${r.bg} ${r.color}`}>
                            {r.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Đúng <strong className="text-emerald-600 dark:text-emerald-400">{completedAttempt.correctCount}</strong> / {completedAttempt.totalQuestions} câu hỏi • Thời gian làm bài:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {Math.floor(completedAttempt.timeSpentSeconds / 60)} phút {completedAttempt.timeSpentSeconds % 60} giây
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Restart test for practice
                      setIsSubmitted(false);
                      setReviewMode(false);
                      setCompletedAttempt(null);
                      setAnswers({});
                      setFlaggedQuestions({});
                      setCurrentQIndex(0);
                      setSecondsLeft(totalSeconds);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Làm Lại Luyện Tập
                  </button>
                </div>
              </div>
            )}

            {/* Question Display Card */}
            {currentQ ? (
              <div className="flex-1 flex flex-col justify-between space-y-6" style={{ fontSize: `${fontScale}rem` }}>
                <div className="space-y-4">
                  {/* Question Header & Points */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                        CÂU HỎI {currentQIndex + 1} / {exam.questions.length}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({currentQ.points || 1.0} điểm)
                      </span>
                    </div>

                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={() => toggleFlag(currentQ.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                          flaggedQuestions[currentQ.id]
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-600 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {flaggedQuestions[currentQ.id] ? 'Đã đánh dấu 🚩' : 'Đánh dấu xem lại'}
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed text-base sm:text-lg">
                    {currentQ.questionText}
                  </div>

                  {/* 4 Options Selection */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = answers[currentQ.id] === opt.key;
                      const isCorrect = currentQ.correctAnswer === opt.key;

                      let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-300';
                      let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200';

                      if (isSelected && !reviewMode) {
                        optionStyle = 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500';
                        badgeStyle = 'bg-blue-600 text-white';
                      }

                      if (reviewMode) {
                        if (isCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500';
                          badgeStyle = 'bg-emerald-600 text-white';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-950 dark:text-red-100 ring-2 ring-red-500';
                          badgeStyle = 'bg-red-600 text-white';
                        }
                      }

                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleSelectOption(opt.key)}
                          className={`p-3.5 sm:p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all duration-150 ${optionStyle}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform ${badgeStyle}`}>
                            {opt.key}
                          </div>
                          <div className="flex-1 text-sm font-medium leading-normal">
                            {opt.text}
                          </div>

                          {/* Result icons in review mode */}
                          {reviewMode && isCorrect && (
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold gap-1">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="hidden sm:inline">Đáp án đúng</span>
                            </div>
                          )}
                          {reviewMode && isSelected && !isCorrect && (
                            <div className="flex items-center text-red-600 dark:text-red-400 text-xs font-bold gap-1">
                              <XCircle className="w-5 h-5" />
                              <span className="hidden sm:inline">Lựa chọn của bạn</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation in Review Mode */}
                  {reviewMode && currentQ.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1 animate-in fade-in">
                      <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                        <HelpCircle className="w-4 h-4" />
                        💡 Hướng dẫn giải & Lời giải chi tiết:
                      </div>
                      <p className="leading-relaxed pl-5 font-mono text-[11px] sm:text-xs">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button
                    type="button"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Câu Trước
                  </button>

                  <div className="text-xs text-slate-400 font-medium">
                    Câu <strong className="text-slate-700 dark:text-slate-200">{currentQIndex + 1}</strong> / {exam.questions.length}
                  </div>

                  {currentQIndex < exam.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      Câu Tiếp Theo
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    !isSubmitted && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmSubmit(true)}
                        className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Nộp Bài Thi
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Confirm Submit Warning */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-8 h-8 flex-shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác Nhận Nộp Bài Thi Trực Tuyến?
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Bạn đã hoàn thành: <strong className="text-blue-600">{answeredCount}/{exam.questions.length} câu</strong>.
                </p>
                {unansweredCount > 0 && (
                  <p className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ Vẫn còn <strong>{unansweredCount} câu chưa chọn đáp án</strong>. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
                  </p>
                )}
                <p>Sau khi nộp, hệ thống sẽ tự động chấm điểm và ghi nhận vào sổ điểm của Lớp {classInfo?.className || '12A1'}.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Quay Lại Làm Tiếp
                </button>
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
                >
                  Đồng Ý Nộp Bài
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
