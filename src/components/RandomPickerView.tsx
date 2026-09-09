import React, { useState, useEffect, useRef } from 'react';
import {
  Shuffle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Filter,
  Layers,
  Zap,
  Play,
  Pause,
  Copy,
  Download,
  Trash2,
  HelpCircle,
  Flame,
  UserCheck,
  GraduationCap,
  Save,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { Student, UserRole, RandomPickRecord, ClassInfo } from '../types';
import confetti from 'canvas-confetti';

interface RandomPickerViewProps {
  students?: Student[];
  role: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: { name: string; subject: string; email?: string; phone?: string; avatar?: string };
  randomPicks?: RandomPickRecord[];
  recentPicks?: RandomPickRecord[];
  onSavePick?: (pick: RandomPickRecord) => void;
  onSaveRandomPick?: (pick: RandomPickRecord) => void;
  onDeletePick?: (id: string) => void;
  onDeleteRandomPick?: (id: string) => void;
  onClearPicks?: () => void;
  onClearRandomPicks?: () => void;
  onOpenQuizGame?: () => void;
}

export const RandomPickerView: React.FC<RandomPickerViewProps> = ({
  students = [],
  role,
  classInfo,
  teacherInfo,
  randomPicks: propRandomPicks,
  recentPicks: propRecentPicks,
  onSavePick,
  onSaveRandomPick: propSaveRandomPick,
  onDeletePick,
  onDeleteRandomPick: propDeleteRandomPick,
  onClearPicks,
  onClearRandomPicks: propClearRandomPicks,
  onOpenQuizGame,
}) => {
  const randomPicks = propRandomPicks || propRecentPicks || [];
  const onSaveRandomPick = propSaveRandomPick || onSavePick || (() => {});
  const onDeleteRandomPick = propDeleteRandomPick || onDeletePick;
  const onClearRandomPicks = propClearRandomPicks || onClearPicks;

  // Mode selection: 'wheel' | 'mystery_box' | 'flash' | 'pair' | 'team'
  const [mode, setMode] = useState<'wheel' | 'mystery_box' | 'flash' | 'pair' | 'team'>('wheel');

  // Filter settings
  const [selectedGroup, setSelectedGroup] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [excludeAlreadyPicked, setExcludeAlreadyPicked] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Wheel & Picker state
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedPair, setSelectedPair] = useState<[Student, Student] | null>(null);
  const [generatedTeams, setGeneratedTeams] = useState<{ id: number; name: string; members: Student[] }[]>([]);
  const [teamCount, setTeamCount] = useState<number>(4);

  // Rapid Flash State
  const [flashStudentName, setFlashStudentName] = useState<string>('Bấm Bắt Đầu Để Quay');

  // Oral grading & emulation reward form state
  const [oralGrade, setOralGrade] = useState<number>(10);
  const [emulationPoints, setEmulationPoints] = useState<number>(5);
  const [subjectTopic, setSubjectTopic] = useState<string>('');
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [isScoreSaved, setIsScoreSaved] = useState(false);

  // Canvas ref for wheel
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const spinSpeedRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio Synthesizer for sound effects
  const playSoundEffect = (type: 'tick' | 'win' | 'card') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
        });
      } else if (type === 'card') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  // Filter available students
  const alreadyPickedIds = new Set(randomPicks.map((p) => p.studentId));

  const eligibleStudents = students.filter((s) => {
    if (selectedGroup !== 'all' && Number(s.group) !== Number(selectedGroup)) return false;
    if (selectedGender !== 'all') {
      const studentGender = (s.gender || '').trim().toLowerCase();
      const filterGender = selectedGender.trim().toLowerCase();
      if (studentGender !== filterGender) return false;
    }
    if (excludeAlreadyPicked && alreadyPickedIds.has(s.id)) return false;
    return true;
  });

  // Palette for wheel sectors
  const sectorColors = [
    '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669',
    '#0891B2', '#4F46E5', '#D97706', '#10B981', '#6366F1',
    '#EC4899', '#F59E0B', '#14B8A6', '#8B5CF6', '#F97316'
  ];

  // Draw the lucky wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const candidates = eligibleStudents;
    const numSlices = candidates.length;

    if (numSlices === 0) {
      // Draw outer rim empty state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1E293B';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Empty wheel message
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emptyMsg =
        selectedGender === 'Nam'
          ? 'Không có học sinh Nam phù hợp bộ lọc'
          : selectedGender === 'Nữ'
          ? 'Không có học sinh Nữ phù hợp bộ lọc'
          : 'Không có học sinh phù hợp bộ lọc';
      ctx.fillText(emptyMsg, centerX, centerY);
      return;
    }

    const anglePerSlice = (2 * Math.PI) / numSlices;
    const currentRotation = rotationAngleRef.current;

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const sliceStart = currentRotation + i * anglePerSlice;
      const sliceEnd = sliceStart + anglePerSlice;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sliceStart, sliceEnd);
      ctx.closePath();

      // Fill color
      ctx.fillStyle = sectorColors[i % sectorColors.length];
      ctx.fill();

      // Outer boundary stroke
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text label (Student Name)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(sliceStart + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${numSlices > 25 ? '11px' : numSlices > 15 ? '13px' : '14px'} system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 3;

      // Truncate name if too long
      const studentName = candidates[i].name;
      const shortName = studentName.split(' ').slice(-2).join(' '); // e.g. "Hoàng Long"
      ctx.fillText(`Tổ ${candidates[i].group} - ${shortName}`, radius - 20, 5);
      ctx.restore();
    }

    // Outer Ring Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Inner Center Pivot Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F8FAFC';
    ctx.stroke();

    // Synchronized Class Name inside Center Pin
    const classBadgeText = (classInfo?.className || '11D3').replace(/^LỚP\s*/i, '').trim().toUpperCase() || '11D3';
    ctx.fillStyle = '#38BDF8';
    ctx.font = classBadgeText.length > 5 ? 'bold 9px system-ui, sans-serif' : 'black 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(classBadgeText, centerX, centerY);
  };

  useEffect(() => {
    if (mode === 'wheel') {
      drawWheel();
    }
  }, [eligibleStudents, mode, classInfo]);

  // Handle Lucky Wheel Spin Action
  const handleSpinWheel = () => {
    if (isSpinning) return;
    const candidates = eligibleStudents;
    if (candidates.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    setIsScoreSaved(false);

    // Pick winning index beforehand
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[winnerIndex];

    const numSlices = candidates.length;
    const anglePerSlice = (2 * Math.PI) / numSlices;

    const targetSliceCenter = winnerIndex * anglePerSlice + anglePerSlice / 2;
    const pointerAngle = (3 * Math.PI) / 2;

    const extraSpins = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const targetTotalAngle = extraSpins + (pointerAngle - targetSliceCenter);

    const startAngle = rotationAngleRef.current % (2 * Math.PI);
    const totalRotation = targetTotalAngle - startAngle;

    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotationAngleRef.current = startAngle + totalRotation * easeOut;

      drawWheel();

      if (elapsed % 120 < 16) {
        playSoundEffect('tick');
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setSelectedStudent(winner);
        playSoundEffect('win');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle Flash Rapid Spin
  const handleStartFlash = () => {
    if (isSpinning) return;
    const candidates = eligibleStudents;
    if (candidates.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    setIsScoreSaved(false);

    let counter = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * candidates.length);
      setFlashStudentName(candidates[idx].name);
      playSoundEffect('tick');
      counter++;

      if (counter > 25) {
        clearInterval(interval);
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        setFlashStudentName(finalWinner.name);
        setSelectedStudent(finalWinner);
        setIsSpinning(false);
        playSoundEffect('win');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }, 90);
  };

  // Handle Mystery Box Pick
  const handlePickMysteryCard = () => {
    if (isSpinning) return;
    const candidates = eligibleStudents;
    if (candidates.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    setIsScoreSaved(false);
    playSoundEffect('card');

    setTimeout(() => {
      const winner = candidates[Math.floor(Math.random() * candidates.length)];
      setSelectedStudent(winner);
      setIsSpinning(false);
      playSoundEffect('win');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  // Handle Pair Picker (Bốc cặp đôi)
  const handlePickPair = () => {
    const candidates = eligibleStudents;
    if (candidates.length < 2) return;

    setIsSpinning(true);
    setSelectedPair(null);
    playSoundEffect('card');

    setTimeout(() => {
      const idx1 = Math.floor(Math.random() * candidates.length);
      let idx2 = Math.floor(Math.random() * candidates.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * candidates.length);
      }
      setSelectedPair([candidates[idx1], candidates[idx2]]);
      setIsSpinning(false);
      playSoundEffect('win');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  // Handle Team Generator (Chia Nhóm)
  const handleGenerateTeams = () => {
    const candidates = [...eligibleStudents];
    if (candidates.length === 0) return;

    // Shuffle array (Fisher-Yates)
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const numTeams = Math.max(2, Math.min(teamCount, candidates.length));
    const teams: { id: number; name: string; members: Student[] }[] = Array.from({ length: numTeams }, (_, i) => ({
      id: i + 1,
      name: `Nhóm ${i + 1}`,
      members: [],
    }));

    candidates.forEach((student, idx) => {
      teams[idx % numTeams].members.push(student);
    });

    setGeneratedTeams(teams);
    playSoundEffect('win');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  // Save Oral Score / Emulation Log
  const handleSaveOralScore = () => {
    if (!selectedStudent) return;

    const newRecord: RandomPickRecord = {
      id: `pick-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      group: selectedStudent.group,
      timestamp: new Date().toISOString(),
      oralGrade: oralGrade > 0 ? oralGrade : undefined,
      emulationPointsAwarded: emulationPoints,
      topic: subjectTopic.trim() || undefined,
      feedback: feedbackNote.trim() || undefined,
    };

    onSaveRandomPick(newRecord);
    setIsScoreSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
              <Shuffle className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-indigo-100">
                  Tiện Ích Lớp Học Thông Minh
                </span>
                <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full font-bold">
                  {classInfo?.className || 'Lớp 11D3'}
                </span>
                <span className="text-xs bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  {students.length} Học Sinh
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Gọi Tên Ngẫu Nhiên & Vấn Đáp Khảo Sát Bài Cũ
              </h2>
              <p className="text-xs text-indigo-100/90 max-w-2xl mt-0.5">
                Vòng quay may mắn, hộp bốc thăm bí mật, rút thẻ siêu tốc và chia nhóm thảo luận. Hỗ trợ chấm điểm miệng và cộng điểm thi đua tức thì vào Tổ!
              </p>
            </div>
          </div>

          {/* Sound Toggle & Quick Reset */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                soundEnabled
                  ? 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                  : 'bg-black/30 border-white/10 text-white/60 hover:bg-black/40'
              }`}
              title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
        <button
          onClick={() => {
            setMode('wheel');
            setSelectedStudent(null);
            setSelectedPair(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            mode === 'wheel'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span>Vòng Quay May Mắn (Lucky Wheel)</span>
        </button>

        <button
          onClick={() => {
            setMode('mystery_box');
            setSelectedStudent(null);
            setSelectedPair(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            mode === 'mystery_box'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Hộp Bốc Thăm Bí Mật</span>
        </button>

        <button
          onClick={() => {
            setMode('flash');
            setSelectedStudent(null);
            setSelectedPair(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            mode === 'flash'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Rút Ngẫu Nhiên Siêu Tốc</span>
        </button>

        <button
          onClick={() => {
            setMode('pair');
            setSelectedStudent(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            mode === 'pair'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-blue-500" />
          <span>Bốc Cặp Đôi Đối Kháng</span>
        </button>

        <button
          onClick={() => {
            setMode('team');
            setSelectedStudent(null);
            setSelectedPair(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            mode === 'team'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-500" />
          <span>Chia Nhóm Thảo Luận</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Filters Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Bộ Lọc Học Sinh
              </h3>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                {eligibleStudents.length}/{students.length} HS
              </span>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Phân Tổ Áp Dụng:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(['all', 1, 2, 3, 4] as const).map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      selectedGroup === grp
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {grp === 'all' ? 'Tất cả' : `Tổ ${grp}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Giới Tính:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['all', 'Nam', 'Nữ'] as const).map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setSelectedGender(gen)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      selectedGender === gen
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {gen === 'all' ? 'Cả Nam & Nữ' : gen}
                  </button>
                ))}
              </div>
            </div>

            {/* Exclude picked checkbox */}
            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={excludeAlreadyPicked}
                onChange={(e) => setExcludeAlreadyPicked(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>Không lặp lại học sinh đã gọi ({alreadyPickedIds.size} đã gọi)</span>
            </label>

            {/* Candidate List Preview */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Danh sách ứng viên trong vòng quay:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{eligibleStudents.length}</span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {eligibleStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      <span className="text-slate-400 font-mono mr-1.5">{idx + 1}</span>
                      {st.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {st.gender}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        Tổ {st.group}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Picks Log Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Nhật Ký Gọi Tên Gần Đây ({randomPicks.length})
              </h3>
              {randomPicks.length > 0 && onClearRandomPicks && (
                <button
                  onClick={onClearRandomPicks}
                  className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              )}
            </div>

            {randomPicks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center italic">
                Chưa có lượt quay / gọi tên nào trong tiết học này.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {randomPicks.map((pick) => (
                  <div
                    key={pick.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{pick.studentName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                          Tổ {pick.group}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {pick.topic ? `Bài: ${pick.topic} • ` : ''}
                        {new Date(pick.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {pick.oralGrade !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black text-xs">
                          {pick.oralGrade} đ
                        </span>
                      )}
                      {pick.emulationPointsAwarded ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs">
                          +{pick.emulationPointsAwarded} đ Tổ
                        </span>
                      ) : null}
                      {onDeleteRandomPick && (
                        <button
                          onClick={() => onDeleteRandomPick(pick.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Active Picker Display (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MODE 1: LUCKY WHEEL */}
          {mode === 'wheel' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center space-y-6 relative min-h-[460px]">
              <div className="relative flex items-center justify-center">
                {/* Pointer indicator at top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-md" />

                {/* Canvas Wheel */}
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={380}
                  className="rounded-full shadow-2xl border-4 border-slate-900/10 dark:border-slate-800 max-w-full h-auto"
                />
              </div>

              {/* Action Spin Button */}
              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleSpinWheel}
                className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer ${
                  isSpinning || eligibleStudents.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white shadow-orange-500/25 hover:shadow-orange-500/40'
                }`}
              >
                <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'ĐANG QUAY MAY MẮN...' : 'QUAY NGAY KẾT QUẢ'}</span>
              </button>
            </div>
          )}

          {/* MODE 2: MYSTERY BOX */}
          {mode === 'mystery_box' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center space-y-6 text-center min-h-[460px]">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce">
                <Sparkles className="w-12 h-12 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Hộp Bốc Thăm Thẻ Bí Mật
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Bốc ngẫu nhiên 1 lá thăm may mắn từ danh sách {eligibleStudents.length} học sinh đủ điều kiện!
                </p>
              </div>

              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handlePickMysteryCard}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-base shadow-xl shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>BỐC THĂM BÍ MẬT</span>
              </button>
            </div>
          )}

          {/* MODE 3: RAPID FLASH */}
          {mode === 'flash' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center space-y-6 text-center min-h-[460px]">
              <div className="w-full max-w-lg p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-2xl space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  Rút Siêu Tốc
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wide truncate">
                  {flashStudentName}
                </h2>
              </div>

              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleStartFlash}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                <span>BẮT ĐẦU RÚT SIÊU TỐC</span>
              </button>
            </div>
          )}

          {/* MODE 4: PAIR PICKER */}
          {mode === 'pair' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center space-y-6 text-center min-h-[460px]">
              {selectedPair ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-[10px]">
                      HỌC SINH A
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedPair[0].name}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      Tổ {selectedPair[0].group} • Mã: {selectedPair[0].code}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-center space-y-2">
                    <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white font-black text-[10px]">
                      HỌC SINH B
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedPair[1].name}
                    </h4>
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-bold">
                      Tổ {selectedPair[1].group} • Mã: {selectedPair[1].code}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Bốc Cặp Đôi Ngẫu Nhiên
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Tự động ghép 2 học sinh bất kỳ để khảo sát hoặc thi đấu vấn đáp cặp đôi!
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length < 2}
                onClick={handlePickPair}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-5 h-5" />
                <span>BỐC CẶP ĐÔI NGAY</span>
              </button>
            </div>
          )}

          {/* MODE 5: TEAM GENERATOR */}
          {mode === 'team' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 min-h-[460px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    Chia Nhóm Thảo Luận Ngẫu Nhiên
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phân chia đều {eligibleStudents.length} học sinh thành các nhóm ngẫu nhiên
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Số nhóm:</span>
                    <select
                      value={teamCount}
                      onChange={(e) => setTeamCount(Number(e.target.value))}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value={2}>2 Nhóm</option>
                      <option value={3}>3 Nhóm</option>
                      <option value={4}>4 Nhóm</option>
                      <option value={5}>5 Nhóm</option>
                      <option value={6}>6 Nhóm</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateTeams}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Tạo Nhóm Ngay</span>
                  </button>
                </div>
              </div>

              {generatedTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {generatedTeams.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                            {t.id}
                          </span>
                          <span>{t.name}</span>
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {t.members.length} Học sinh
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {t.members.map((m, idx) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span className="truncate pr-2">
                              <span className="text-slate-400 font-mono text-[11px] mr-1">
                                {idx + 1}.
                              </span>
                              {m.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">
                              Tổ {m.group}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-12 text-center italic">
                  Bấm "Tạo Nhóm Ngay" để chia danh sách học sinh ngẫu nhiên vào các nhóm thảo luận!
                </p>
              )}
            </div>
          )}

          {/* SELECTED WINNER & ORAL GRADING FORM (When student is selected) */}
          {selectedStudent && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white border border-indigo-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={selectedStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase tracking-wider">
                      Học Sinh Được Chọn Vấn Đáp
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Mã HS: <span className="font-mono text-amber-300 font-bold">{selectedStudent.code}</span> • Tổ{' '}
                      <span className="font-bold text-amber-300">{selectedStudent.group}</span>
                    </p>
                  </div>
                </div>

                {isScoreSaved ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Đã Lưu Điểm & Thi Đua
                  </span>
                ) : null}
              </div>

              {/* Form Input for Oral Score & Emulation Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-indigo-200 mb-1">
                    Điểm Miệng / Khảo Sát (1 - 10):
                  </label>
                  <select
                    value={oralGrade}
                    onChange={(e) => setOralGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5, 4, 3, 0].map((sc) => (
                      <option key={sc} value={sc} className="text-slate-900">
                        {sc === 0 ? 'Không cho điểm' : `${sc} Điểm`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-indigo-200 mb-1">
                    Cộng Điểm Thi Đua Phong Trào (Cho Tổ {selectedStudent.group}):
                  </label>
                  <select
                    value={emulationPoints}
                    onChange={(e) => setEmulationPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-emerald-300 font-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value={10} className="text-slate-900">+10 Điểm (Trả lời xuất sắc)</option>
                    <option value={5} className="text-slate-900">+5 Điểm (Trả lời tốt)</option>
                    <option value={2} className="text-slate-900">+2 Điểm (Tích cực tham gia)</option>
                    <option value={0} className="text-slate-900">0 Điểm (Không cộng)</option>
                    <option value={-5} className="text-slate-900">-5 Điểm (Không thuộc bài cũ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-indigo-200 mb-1">
                    Chuyên Đề / Bài Khảo Sát:
                  </label>
                  <input
                    type="text"
                    value={subjectTopic}
                    onChange={(e) => setSubjectTopic(e.target.value)}
                    placeholder="Ví dụ: Kiểm tra bài cũ Tiết 4..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-indigo-200 mb-1">
                    Ghi Chú Nhận Xét Nhanh:
                  </label>
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Ví dụ: Nắm vững kiến thức, phản xạ nhanh..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveOralScore}
                  disabled={isScoreSaved}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    isScoreSaved
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isScoreSaved ? 'Đã Lưu Điểm' : 'Lưu Điểm & Cộng Thi Đua Tổ'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
