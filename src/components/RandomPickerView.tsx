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

  // Audio Synth via Web Audio API
  const playSoundEffect = (type: 'tick' | 'win' | 'card' | 'countdown') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 + Math.random() * 200, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'win') {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti error if unmounted
        }
        // Fanfare chord
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
      // Audio not supported or blocked by browser policy
    }
  };

  // Filter available students
  const alreadyPickedIds = new Set(randomPicks.map((p) => p.studentId));

  const eligibleStudents = students.filter((s) => {
    if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;
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

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'black 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('12A1', centerX, centerY);
  };

  useEffect(() => {
    if (mode === 'wheel') {
      drawWheel();
    }
  }, [eligibleStudents, mode]);

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

    // Calculate final rotation so pointer (at top, angle = -PI/2) points to winner
    // In Canvas: Pointer is at 3 * PI / 2 (or top)
    const targetSliceCenter = winnerIndex * anglePerSlice + anglePerSlice / 2;
    const pointerAngle = (3 * Math.PI) / 2;
    
    // Add multiple full spins (e.g. 6 to 9 full spins)
    const extraSpins = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const targetTotalAngle = extraSpins + (pointerAngle - targetSliceCenter);

    const startAngle = rotationAngleRef.current % (2 * Math.PI);
    const totalRotation = targetTotalAngle - startAngle;
    const duration = 4200; // 4.2 seconds
    const startTime = performance.now();

    let lastTickTime = 0;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotationAngleRef.current = startAngle + totalRotation * easeOut;

      drawWheel();

      // Sound tick triggers based on angular progression
      if (now - lastTickTime > (30 + progress * 200)) {
        playSoundEffect('tick');
        lastTickTime = now;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        setSelectedStudent(winner);
        playSoundEffect('win');
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateSpin);
  };

  // Handle Flash Mode Spin Action
  const handleStartFlash = () => {
    if (isSpinning) return;
    const candidates = eligibleStudents;
    if (candidates.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    setIsScoreSaved(false);

    let count = 0;
    const maxChanges = 35;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      const tempStudent = candidates[randomIdx];
      setFlashStudentName(`${tempStudent.name} (Tổ ${tempStudent.group})`);
      playSoundEffect('tick');
      count++;

      if (count >= maxChanges) {
        clearInterval(interval);
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        setFlashStudentName(`${finalWinner.name} (Tổ ${finalWinner.group})`);
        setSelectedStudent(finalWinner);
        setIsSpinning(false);
        playSoundEffect('win');
      }
    }, 85);
  };

  // Handle Mystery Box Pick
  const handleMysteryCardPick = () => {
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
    }, 1200);
  };

  // Handle Random Pair Pick
  const handlePairPick = () => {
    const candidates = eligibleStudents;
    if (candidates.length < 2) return;

    setIsSpinning(true);
    setSelectedPair(null);
    setSelectedStudent(null);
    playSoundEffect('card');

    setTimeout(() => {
      const shuffled = [...candidates].sort(() => 0.5 - Math.random());
      setSelectedPair([shuffled[0], shuffled[1]]);
      setIsSpinning(false);
      playSoundEffect('win');
    }, 1000);
  };

  // Handle Team Generator
  const handleGenerateTeams = () => {
    const candidates = eligibleStudents;
    if (candidates.length === 0) return;
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const teams: { id: number; name: string; members: Student[] }[] = [];

    const teamNames = [
      'Đội Rồng Xanh (KHTN)',
      'Đội Phượng Hoàng Lửa',
      'Đội Sao Kim Bứt Phá',
      'Đội Đại Bàng Thép',
      'Đội Bách Khoa Vươn Xa',
      'Đội Hải Mã Tiên Phong',
    ];

    for (let i = 0; i < teamCount; i++) {
      teams.push({
        id: i + 1,
        name: teamNames[i] || `Nhóm ${i + 1}`,
        members: [],
      });
    }

    shuffled.forEach((student, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].members.push(student);
    });

    setGeneratedTeams(teams);
    playSoundEffect('win');
  };

  // Save oral grade & Emulation Record
  const handleSaveResult = () => {
    if (!selectedStudent) return;

    const record: RandomPickRecord = {
      id: `rp-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentCode: selectedStudent.code,
      group: selectedStudent.group,
      mode: mode,
      subject: classInfo?.className ? 'Toán Học (Khối 12)' : 'Khảo sát',
      topic: subjectTopic.trim() || 'Kiểm tra miệng & vấn đáp chuyên đề',
      oralGrade: oralGrade,
      emulationPointsAwarded: emulationPoints,
      feedback: feedbackNote.trim() || 'Đã hoàn thành lượt gọi ngẫu nhiên.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onSaveRandomPick(record);
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-indigo-100">
                  Tiện Ích Lớp Học Thông Minh
                </span>
                <span className="text-xs bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  {students.length} Học Sinh
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
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
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mode === 'team'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-500" />
          <span>Chia Nhóm Tự Động</span>
        </button>

        {onOpenQuizGame && (
          <button
            onClick={onOpenQuizGame}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-md cursor-pointer shrink-0"
          >
            <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>🎮 Đấu Trường Quiz Game Show</span>
          </button>
        )}
      </div>

      {/* Main Grid: Control Panel + Active Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Candidate Pool (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Bộ Lọc Học Sinh
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                {eligibleStudents.length}/{students.length} HS
              </span>
            </h3>

            {/* Filter by Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phân Tổ Áp Dụng:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(['all', 1, 2, 3, 4] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGroup(g)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      selectedGroup === g
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {g === 'all' ? 'Tất cả' : `Tổ ${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Giới Tính:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['all', 'Nam', 'Nữ'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setSelectedGender(gender)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      selectedGender === gender
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {gender === 'all' ? 'Cả Nam & Nữ' : gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox: Exclude already picked */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeAlreadyPicked}
                  onChange={(e) => setExcludeAlreadyPicked(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Không lặp lại học sinh đã gọi ({randomPicks.length} đã gọi)</span>
              </label>
            </div>

            {/* Quick Candidate List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Danh sách ứng viên trong vòng quay:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{eligibleStudents.length}</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {eligibleStudents.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    Không có học sinh nào phù hợp bộ lọc được chọn
                  </div>
                ) : (
                  eligibleStudents.map((s, idx) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-4 text-[10px] text-slate-400 font-mono">{idx + 1}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            s.gender === 'Nam'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              : 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300'
                          }`}
                        >
                          {s.gender || 'N/A'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                          Tổ {s.group}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* History of Picks Today */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                Nhật Ký Gọi Tên Gần Đây ({randomPicks.length})
              </h4>
              {randomPicks.length > 0 && onClearRandomPicks && (
                <button
                  type="button"
                  onClick={onClearRandomPicks}
                  className="text-[11px] text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa
                </button>
              )}
            </div>

            {randomPicks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center italic">
                Chưa có học sinh nào được gọi trong phiên này.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {randomPicks.map((pick) => (
                  <div
                    key={pick.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{pick.studentName}</span>
                      <div className="flex items-center gap-1">
                        {pick.oralGrade !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px]">
                            {pick.oralGrade} đ
                          </span>
                        )}
                        {pick.emulationPointsAwarded ? (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                            +{pick.emulationPointsAwarded} đ Tổ
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Tổ {pick.group} • {pick.topic || 'Vấn đáp'}</span>
                      <span>{pick.timestamp.slice(11, 16)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Interactive Arena (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MODE 1: LUCKY WHEEL */}
          {mode === 'wheel' && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Pointer Indicator Arrow */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-md" />

                {/* Canvas Lucky Wheel */}
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={420}
                  className="rounded-full shadow-2xl transition-transform max-w-full"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSpinning || eligibleStudents.length === 0}
                  onClick={handleSpinWheel}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm text-white flex items-center gap-2 shadow-xl transition-all ${
                    isSpinning || eligibleStudents.length === 0
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-gradient-to-r from-amber-500 via-red-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 active:scale-95 shadow-red-500/20'
                  }`}
                >
                  <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Đang Quay Vòng May Mắn...' : 'Quay Vòng Gọi Tên Ngay!'}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: MYSTERY BOX */}
          {mode === 'mystery_box' && (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-purple-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:to-slate-800/80 shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[380px]">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  🎁 Hộp Bốc Thăm Thẻ Tên Bí Mật
                </h3>
                <p className="text-xs text-slate-500">
                  Bốc ngẫu nhiên một thẻ bài bí mật trong số {eligibleStudents.length} học sinh sẵn sàng.
                </p>
              </div>

              {/* 3D Mystery Box Representation */}
              <div
                onClick={handleMysteryCardPick}
                className={`w-44 h-56 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl flex flex-col items-center justify-center p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:rotate-1 active:scale-95 relative group ${
                  isSpinning ? 'animate-bounce' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-100">LỚP 12A1</span>
                <span className="text-base font-black text-center mt-1">Bốc Thăm</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 pointer-events-none" />
              </div>

              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleMysteryCardPick}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition-all"
              >
                {isSpinning ? 'Đang Mở Hộp Thăm...' : 'Bốc Ngẫu Nhiên 1 Thẻ Bài'}
              </button>
            </div>
          )}

          {/* MODE 3: FLASH SLOT MACHINE */}
          {mode === 'flash' && (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl flex flex-col items-center justify-center space-y-6 min-h-[380px]">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  FLASH SLOT MACHINE
                </span>
                <h3 className="text-xl font-black text-white">Rút Ngẫu Nhiên Siêu Tốc</h3>
              </div>

              {/* Slot Counter Display */}
              <div className="w-full max-w-md p-6 rounded-2xl bg-slate-800/90 border-2 border-indigo-500/60 shadow-inner flex items-center justify-center text-center">
                <span className="text-2xl font-black text-amber-300 font-mono tracking-wide drop-shadow-md">
                  {flashStudentName}
                </span>
              </div>

              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleStartFlash}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm text-white flex items-center gap-2 shadow-xl transition-all ${
                  isSpinning
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 active:scale-95 shadow-amber-500/20'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>{isSpinning ? 'Đang Xáo Tên Siêu Tốc...' : 'Bắt Đầu Chạy Ngẫu Nhiên'}</span>
              </button>
            </div>
          )}

          {/* MODE 4: RANDOM PAIR UP */}
          {mode === 'pair' && (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Bốc Cặp Đôi Học Tập / Vấn Đáp Đối Kháng
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn ngẫu nhiên 2 học sinh cùng vấn đáp, phản biện chéo hoặc thi đố vui nhanh.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handlePairPick}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Bốc Cặp Đôi Mới</span>
                </button>
              </div>

              {selectedPair ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border-2 border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedPair[0].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={selectedPair[0].name}
                        className="w-12 h-12 rounded-xl object-cover border border-blue-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                          Thí Sinh 1 (Tổ {selectedPair[0].group})
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{selectedPair[0].name}</h4>
                        <p className="text-[11px] text-slate-500">{selectedPair[0].code}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedPair[1].avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                        alt={selectedPair[1].name}
                        className="w-12 h-12 rounded-xl object-cover border border-indigo-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800">
                          Thí Sinh 2 (Tổ {selectedPair[1].group})
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{selectedPair[1].name}</h4>
                        <p className="text-[11px] text-slate-500">{selectedPair[1].code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed">
                  Nhấp vào nút "Bốc Cặp Đôi Mới" để chọn 2 học sinh.
                </div>
              )}
            </div>
          )}

          {/* MODE 5: TEAM GENERATOR */}
          {mode === 'team' && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    Chia Nhóm Thảo Luận & Làm Bài Tự Động
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tự động xáo trộn và phân bổ đều {eligibleStudents.length} học sinh thành các nhóm cân đối.
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
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
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {t.members.length} thành viên
                        </span>
                      </div>

                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {t.members.map((m, mIdx) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                          >
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {mIdx + 1}. {m.name}
                            </span>
                            <span className="text-[10px] text-slate-500">Tổ {m.group}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed">
                  Nhấp vào nút "Tạo Nhóm Ngay" để chia danh sách học sinh.
                </div>
              )}
            </div>
          )}

          {/* SELECTED WINNER BANNER & DIRECT ORAL EVALUATION */}
          {selectedStudent && (
            <div className="p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:from-slate-900 dark:to-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-300/40 dark:border-slate-700 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                      alt={selectedStudent.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                        🎉 ĐÃ ĐƯỢC CHỌN VẤN ĐÁP
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        Tổ {selectedStudent.group}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Mã HS: <strong className="font-mono">{selectedStudent.code}</strong> • Điểm TB: <strong>{selectedStudent.grades.gpa}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs text-slate-500">
                    Thế mạnh: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.strengths?.slice(0, 35)}...</span>
                  </span>
                </div>
              </div>

              {/* Oral Grade & Emulation Points Awarding Form */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Đánh Giá Câu Trả Lời & Ghi Nhận Điểm Thi Đua Vào Tổ {selectedStudent.group}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Điểm Miệng / Vấn Đáp (Thang 10):
                    </label>
                    <select
                      value={oralGrade}
                      onChange={(e) => setOralGrade(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value={10}>10.0 Điểm (Xuất Sắc)</option>
                      <option value={9.5}>9.5 Điểm (Rất Tốt)</option>
                      <option value={9}>9.0 Điểm (Tốt)</option>
                      <option value={8.5}>8.5 Điểm (Khá Tốt)</option>
                      <option value={8}>8.0 Điểm (Khá)</option>
                      <option value={7}>7.0 Điểm (Đạt Yêu Cầu)</option>
                      <option value={5}>5.0 Điểm (Cần Cố Gắng Thêm)</option>
                      <option value={0}>0.0 Điểm (Chưa Thuộc Bài)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cộng Điểm Thi Đua Tổ {selectedStudent.group}:
                    </label>
                    <select
                      value={emulationPoints}
                      onChange={(e) => setEmulationPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-indigo-600"
                    >
                      <option value={10}>+10 Điểm (Giải Bài Xuất Sắc)</option>
                      <option value={5}>+5 Điểm (Thuộc Bài & Tự Tin)</option>
                      <option value={3}>+3 Điểm (Đạt Yêu Cầu)</option>
                      <option value={0}>0 Điểm (Bình Thường)</option>
                      <option value={-5}>-5 Điểm (Chưa Chuẩn Bị Bài)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nội Dung / Chuyên Đề Kiểm Tra:
                    </label>
                    <input
                      type="text"
                      value={subjectTopic}
                      onChange={(e) => setSubjectTopic(e.target.value)}
                      placeholder="Ví dụ: Tích phân đổi biến / Este..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Nhận xét ngắn cho học sinh (ví dụ: Trả lời tự tin, cần rèn thêm bấm casio)..."
                    className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />

                  <button
                    type="button"
                    disabled={isScoreSaved}
                    onClick={handleSaveResult}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm ${
                      isScoreSaved
                        ? 'bg-emerald-600 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                    {isScoreSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã Lưu & Cộng Điểm Tổ</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Lưu Đánh Giá & Điểm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
