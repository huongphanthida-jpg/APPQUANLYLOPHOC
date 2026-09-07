import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shuffle,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  ArrowRight,
  Flame,
  Star,
  Check,
  Play,
  RefreshCw,
} from 'lucide-react';
import { Student, UserRole, ClassInfo } from '../types';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  subject: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    subject: 'Toán Học',
    questionText: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = (x - 1)(x + 2)^2. Số điểm cực trị của hàm số là:',
    options: [
      { key: 'A', text: '1 điểm cực trị (tại x = 1)' },
      { key: 'B', text: '2 điểm cực trị (tại x = 1 và x = -2)' },
      { key: 'C', text: '3 điểm cực trị' },
      { key: 'D', text: 'Không có điểm cực trị nào' },
    ],
    correctAnswer: 'A',
    explanation: 'f\'(x) đổi dấu khi qua x = 1 (nghiệm bội 1). Nghiệm x = -2 là nghiệm bội chẵn (bội 2) nên f\'(x) không đổi dấu. Do đó hàm số chỉ có 1 cực trị.',
    points: 10,
  },
  {
    id: 'q-2',
    subject: 'Vật Lý',
    questionText: 'Một con lắc lò xo gồm lò xo có độ cứng k = 100 N/m và vật nhỏ m = 100g. Chu kỳ dao động riêng là (lấy π² = 10):',
    options: [
      { key: 'A', text: 'T = 0,2 s' },
      { key: 'B', text: 'T = 0,1 s' },
      { key: 'C', text: 'T = 2,0 s' },
      { key: 'D', text: 'T = 0,4 s' },
    ],
    correctAnswer: 'A',
    explanation: 'Đổi m = 0,1 kg. Công thức chu kỳ T = 2π√(m/k) = 2π√(0,1 / 100) = 2π / 31,62 = 0,2s.',
    points: 10,
  },
  {
    id: 'q-3',
    subject: 'Hóa Học',
    questionText: 'Cho các dung dịch: Glucozơ, Saccarozơ, Anilin, Axit axetic, Metylamin. Số dung dịch làm quỳ tím hóa xanh là:',
    options: [
      { key: 'A', text: '1 dung dịch (Metylamin)' },
      { key: 'B', text: '2 dung dịch (Metylamin & Anilin)' },
      { key: 'C', text: '3 dung dịch' },
      { key: 'D', text: '0 dung dịch' },
    ],
    correctAnswer: 'A',
    explanation: 'Metylamin (CH3NH2) là amin béo có tính bazơ mạnh hơn NH3 nên làm quỳ tím hóa xanh. Anilin có tính bazơ rất yếu không đổi màu quỳ tím.',
    points: 10,
  },
  {
    id: 'q-4',
    subject: 'Tiếng Anh',
    questionText: 'If she _______ harder during the term, she would have passed the final exam with distinction.',
    options: [
      { key: 'A', text: 'had studied' },
      { key: 'B', text: 'studied' },
      { key: 'C', text: 'has studied' },
      { key: 'D', text: 'would study' },
    ],
    correctAnswer: 'A',
    explanation: 'Cấu trúc câu điều kiện loại 3 trái với quá khứ: If + S + had + P2, S + would have + P2.',
    points: 10,
  },
  {
    id: 'q-5',
    subject: 'Sinh Học',
    questionText: 'Trong cơ chế điều hòa hoạt động của operon Lac ở E. coli, chất cảm ứng lactozơ liên kết làm biến đổi cấu hình không gian của:',
    options: [
      { key: 'A', text: 'Protein ức chế' },
      { key: 'B', text: 'Vùng vận hành (O)' },
      { key: 'C', text: 'Vùng khởi động (P)' },
      { key: 'D', text: 'Enzym ARN polimeraza' },
    ],
    correctAnswer: 'A',
    explanation: 'Lactozơ liên kết trực tiếp với protein ức chế làm nó bị bất hoạt (biến đổi cấu hình) không gắn được vào vùng vận hành O.',
    points: 10,
  },
];

interface EducationalQuizGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  role: UserRole;
  classInfo?: ClassInfo;
  onAddDisciplinePoints?: (studentId: string, points: number, reason: string) => void;
}

export const EducationalQuizGameModal: React.FC<EducationalQuizGameModalProps> = ({
  isOpen,
  onClose,
  students,
  role,
  classInfo,
  onAddDisciplinePoints,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Score & Streak
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filtered questions
  const questions = DEFAULT_QUIZ_QUESTIONS.filter(
    (q) => selectedSubject === 'Tất cả' || q.subject === selectedSubject
  );
  const currentQ = questions[currentQuestionIndex % questions.length] || DEFAULT_QUIZ_QUESTIONS[0];

  useEffect(() => {
    if (isOpen) {
      handleResetGame();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      // Time up
      setIsTimerRunning(false);
      setIsAnswerSubmitted(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  if (!isOpen) return null;

  const handlePickRandomStudent = () => {
    if (!students || students.length === 0) return;
    const randomIndex = Math.floor(Math.random() * students.length);
    setSelectedStudent(students[randomIndex]);
    playSound('pick');
  };

  const handleStartQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(30);
    setIsTimerRunning(true);
  };

  const handleSelectOption = (key: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(key);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    setIsTimerRunning(false);
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + currentQ.points);
      setStreak((prev) => prev + 1);
      playSound('win');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      // Reward emulation points to selected student if present
      if (selectedStudent && onAddDisciplinePoints) {
        onAddDisciplinePoints(
          selectedStudent.id,
          5,
          `Xuất sắc trả lời đúng câu hỏi Quiz Game môn ${currentQ.subject}`
        );
      }
    } else {
      setStreak(0);
      playSound('wrong');
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    handleStartQuestion();
  };

  const handleResetGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setSelectedStudent(students[0] || null);
    handleStartQuestion();
  };

  const playSound = (type: 'win' | 'wrong' | 'pick') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'win') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // web audio fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] via-indigo-900 to-[#002244] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold shadow-2xs">
              <Trophy className="w-6 h-6 animate-bounce text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  CLASSROOM QUIZ SHOW
                </span>
                <span className="text-xs text-slate-300 font-semibold">DẠ HƯƠNG 2026-2027</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Đấu Trường Trắc Nghiệm Học Tập Tương Tác
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-300" /> : <VolumeX className="w-5 h-5 opacity-60" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Control Bar: Subject Filter & Random Pick Student */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="font-bold text-slate-700 shrink-0">Môn học:</span>
            {['Tất cả', 'Toán Học', 'Vật Lý', 'Hóa Học', 'Tiếng Anh', 'Sinh Học'].map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  setSelectedSubject(subj);
                  setCurrentQuestionIndex(0);
                  handleStartQuestion();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-[#003366] text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Random Student Selector Widget */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">
                {selectedStudent ? `${selectedStudent.name} (Tổ ${selectedStudent.group})` : 'Chọn Học Sinh'}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePickRandomStudent}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Quay tên chọn học sinh ngẫu nhiên trả lời"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Gọi Tên Ngẫu Nhiên</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status Indicators: Score, Streak, Timer Bar */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Điểm Số</div>
                  <div className="text-lg font-black text-amber-300">{score} điểm</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Chuỗi Đúng</div>
                  <div className="text-lg font-black text-rose-300">{streak} 🔥</div>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 animate-spin" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Thời Gian</div>
                <div
                  className={`text-xl font-black ${
                    timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-emerald-300'
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-[#003366] px-3 py-1 rounded-lg">
                Môn: {currentQ.subject}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                +{currentQ.points} Điểm Thi Đua
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </h3>

            {/* Options List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                const isCorrect = currentQ.correctAnswer === opt.key;

                let btnStyle =
                  'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-blue-400';
                if (isSelected) {
                  btnStyle = 'bg-blue-600 border-blue-600 text-white font-bold shadow-md';
                }
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-300';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-600 border-rose-600 text-white font-bold';
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-black shrink-0">
                      {opt.key}
                    </span>
                    <span className="mt-0.5 leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Box when submitted */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#003366] font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lời Giải Chi Tiết & Hướng Dẫn Sư Phạm:</span>
              </div>
              <p className="leading-relaxed text-slate-700 italic bg-white/80 p-3 rounded-xl border border-blue-100">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetGame}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm Lại từ Đầu</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-all shadow-md flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Chốt Đáp Án</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Câu Tiếp Theo</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
