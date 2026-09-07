import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  Search,
  ArrowLeftRight,
  Sparkles,
  RefreshCw,
  Printer,
  Eye,
  Glasses,
  GraduationCap,
  Award,
  HeartPulse,
  UserCheck,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  X,
  Shuffle,
  ChevronDown,
  Info,
  ExternalLink,
  BookOpen,
  HeartHandshake
} from 'lucide-react';
import { Student, UserRole, SeatingChartData, SeatingDisplayMode, ClassInfo, TeacherInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface SeatingChartViewProps {
  students: Student[];
  seatingChart: SeatingChartData;
  onSaveSeatingChart: (chart: SeatingChartData) => void;
  onResetSeatingChart: () => void;
  role: UserRole;
  currentStudentId?: string;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onSelectStudent?: (student: Student) => void;
  onNavigateToConnect?: () => void;
}

export const SeatingChartView: React.FC<SeatingChartViewProps> = ({
  students,
  seatingChart,
  onSaveSeatingChart,
  onResetSeatingChart,
  role,
  currentStudentId,
  classInfo,
  teacherInfo,
  onSelectStudent,
  onNavigateToConnect,
}) => {
  const [displayMode, setDisplayMode] = useState<SeatingDisplayMode>('avatar_name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeatKey, setSelectedSeatKey] = useState<string | null>(null);
  const [targetSwapSeatKey, setTargetSwapSeatKey] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // seatKey to assign
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAutoArrangeOpen, setIsAutoArrangeOpen] = useState<boolean>(false);
  const autoArrangeRef = useRef<HTMLDivElement>(null);

  // Close auto arrange dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autoArrangeRef.current && !autoArrangeRef.current.contains(event.target as Node)) {
        setIsAutoArrangeOpen(false);
      }
    };
    if (isAutoArrangeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAutoArrangeOpen]);

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Xác Nhận',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student map for fast lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Find all unassigned students
  const assignedStudentIds = useMemo(() => {
    return new Set(
      Object.values(seatingChart.assignments).filter((id): id is string => id !== null && id !== undefined)
    );
  }, [seatingChart.assignments]);

  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !assignedStudentIds.has(s.id));
  }, [students, assignedStudentIds]);

  // Check if student matches search
  const isStudentHighlighted = (studentId: string | null): boolean => {
    if (!searchQuery.trim() || !studentId) return false;
    const s = studentMap.get(studentId);
    if (!s) return false;
    const query = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      `tổ ${s.group}`.includes(query) ||
      s.strengths.toLowerCase().includes(query)
    );
  };

  // Handle seat click (Swap or select)
  const handleSeatClick = (seatKey: string) => {
    if (role !== 'gvcn') {
      const studentId = seatingChart.assignments[seatKey];
      if (studentId) {
        const student = studentMap.get(studentId);
        if (student) setViewingStudent(student);
      }
      return;
    }

    // For GVCN only:
    if (!selectedSeatKey) {
      // First click: select seat
      setSelectedSeatKey(seatKey);
      const studentId = seatingChart.assignments[seatKey];
      const student = studentId ? studentMap.get(studentId) : null;
      if (student) {
        showToast(`Đã chọn học sinh: ${student.name}. Nhấp vào vị trí bàn khác để hoán đổi chỗ ngồi!`);
      } else {
        showToast(`Đã chọn vị trí trống. Nhấp vào học sinh khác để chuyển vào đây hoặc gán trực tiếp.`);
      }
    } else if (selectedSeatKey === seatKey) {
      // Click again on same seat: deselect
      setSelectedSeatKey(null);
    } else {
      // Second click on a different seat: SWAP
      const sourceStudentId = seatingChart.assignments[selectedSeatKey] || null;
      const targetStudentId = seatingChart.assignments[seatKey] || null;

      const newAssignments = {
        ...seatingChart.assignments,
        [selectedSeatKey]: targetStudentId,
        [seatKey]: sourceStudentId,
      };

      const sourceName = sourceStudentId ? studentMap.get(sourceStudentId)?.name || 'Ghế' : 'Ghế trống';
      const targetName = targetStudentId ? studentMap.get(targetStudentId)?.name || 'Ghế' : 'Ghế trống';

      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });

      setSelectedSeatKey(null);
      showToast(`Đã hoán đổi chỗ ngồi thành công: [${sourceName}] ⇄ [${targetName}]`);
    }
  };

  // Assign specific student to a seat
  const handleAssignStudent = (seatKey: string, studentId: string | null) => {
    const newAssignments = { ...seatingChart.assignments };

    // If student was previously in another seat, clear it
    if (studentId) {
      Object.keys(newAssignments).forEach((key) => {
        if (newAssignments[key] === studentId) {
          newAssignments[key] = null;
        }
      });
    }

    newAssignments[seatKey] = studentId;

    onSaveSeatingChart({
      ...seatingChart,
      assignments: newAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    setShowAssignModal(null);
    showToast(studentId ? `Đã xếp chỗ cho học sinh ${studentMap.get(studentId)?.name}` : 'Đã dọn trống vị trí ngồi!');
  };

  // Smart Auto-Arrangement Algorithms
  const handleSmartArrange = (type: 'by_group' | 'by_vision' | 'by_academic_pairs' | 'by_gender' | 'shuffle') => {
    const totalDesksPerAisle = 6;
    const totalAisles = 4;
    const newAssignments: { [key: string]: string | null } = {};

    // Initialize empty seats
    for (let col = 1; col <= totalAisles; col++) {
      for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
        newAssignments[`${col}-${desk}-1`] = null;
        newAssignments[`${col}-${desk}-2`] = null;
      }
    }

    if (type === 'by_group') {
      // Tổ 1 -> Dãy 1, Tổ 2 -> Dãy 2, Tổ 3 -> Dãy 3, Tổ 4 -> Dãy 4
      [1, 2, 3, 4].forEach((groupNum) => {
        const groupStudents = students.filter((s) => s.group === groupNum);
        let seatIndex = 0;
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (seatIndex < groupStudents.length) {
              newAssignments[`${groupNum}-${desk}-${seat}`] = groupStudents[seatIndex].id;
              seatIndex++;
            }
          }
        }
      });
      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã sắp xếp sơ đồ chỗ ngồi theo 4 Tổ học tập chuẩn chỉnh!');
    } else if (type === 'by_vision') {
      // Vision / Health priority: students with glasses or health note sit in Desks 1-2
      const visionPriorityStudents = students.filter(
        (s) => s.healthNote.toLowerCase().includes('cận') || s.healthNote.toLowerCase().includes('mắt')
      );
      const otherStudents = students.filter(
        (s) => !s.healthNote.toLowerCase().includes('cận') && !s.healthNote.toLowerCase().includes('mắt')
      );

      const allSorted = [...visionPriorityStudents, ...otherStudents];
      let studentIdx = 0;

      for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
        for (let col = 1; col <= totalAisles; col++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < allSorted.length) {
              newAssignments[`${col}-${desk}-${seat}`] = allSorted[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp học sinh cận thị & cần hỗ trợ thị lực lên các bàn 1 - 2 phía trên!');
    } else if (type === 'by_academic_pairs') {
      // Đôi bạn cùng tiến: 1 student GPA >= 8.5 pairs with 1 student GPA < 8.5
      const sortedByGPA = [...students].sort((a, b) => b.grades.gpa - a.grades.gpa);
      const highGPA = sortedByGPA.slice(0, Math.floor(sortedByGPA.length / 2));
      const moderateGPA = sortedByGPA.slice(Math.floor(sortedByGPA.length / 2));

      const pairedStudents: Student[] = [];
      const maxLength = Math.max(highGPA.length, moderateGPA.length);
      for (let i = 0; i < maxLength; i++) {
        if (highGPA[i]) pairedStudents.push(highGPA[i]);
        if (moderateGPA[i]) pairedStudents.push(moderateGPA[i]);
      }

      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < pairedStudents.length) {
              newAssignments[`${col}-${desk}-${seat}`] = pairedStudents[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp chỗ theo mô hình "Đôi bạn cùng tiến" (kèm cặp nâng cao kết quả học tập)!');
    } else if (type === 'by_gender') {
      // Alternating Male - Female
      const males = students.filter((s) => s.gender === 'Nam');
      const females = students.filter((s) => s.gender === 'Nữ');
      const mixed: Student[] = [];
      const maxLen = Math.max(males.length, females.length);
      for (let i = 0; i < maxLen; i++) {
        if (males[i]) mixed.push(males[i]);
        if (females[i]) mixed.push(females[i]);
      }

      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < mixed.length) {
              newAssignments[`${col}-${desk}-${seat}`] = mixed[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp chỗ xen kẽ Nam - Nữ giúp xây dựng nề nếp kỷ cương!');
    } else if (type === 'shuffle') {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < shuffled.length) {
              newAssignments[`${col}-${desk}-${seat}`] = shuffled[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      onSaveSeatingChart({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xáo trộn ngẫu nhiên toàn bộ vị trí chỗ ngồi trong lớp!');
    }
  };

  const handlePrintSeatingChart = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#003366] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-amber-400/40 text-sm font-medium animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Sơ Đồ Bố Trí Chỗ Ngồi {classInfo?.className || ''}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    4 Dãy × 6 Bàn (48 Chỗ)
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Quy chuẩn 4 dãy đặt nằm ngang trên một hàng, mỗi dãy 6 bàn, mỗi bàn 2 học sinh. Cập nhật ngày:{' '}
                  <span className="font-semibold text-slate-700">{seatingChart.updatedAt}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh / vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Display Mode Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setDisplayMode('avatar_name')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'avatar_name'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị ảnh và tên"
              >
                Ảnh & Tên
              </button>
              <button
                onClick={() => setDisplayMode('grades_gpa')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'grades_gpa'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị điểm GPA và khối A"
              >
                Điểm Khối A
              </button>
              <button
                onClick={() => setDisplayMode('health_vision')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'health_vision'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị thị lực & sức khỏe"
              >
                Thị Lực 👓
              </button>
              <button
                onClick={() => setDisplayMode('connect_pair')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                  displayMode === 'connect_pair'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-bold'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
                title="Hiển thị kết nối đôi bạn cùng tiến & liên lạc phụ huynh"
              >
                <span>🔗 Kết Nối Học Tập</span>
              </button>
            </div>

            {/* Direct Connect Channel Button */}
            {onNavigateToConnect && (
              <button
                onClick={onNavigateToConnect}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#003366] hover:from-blue-700 hover:to-[#002244] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Mở Kênh Kết Nối Giáo Viên - Phụ Huynh - Học Sinh"
              >
                <HeartHandshake className="w-4 h-4 text-[#98FF98]" />
                <span>Kênh Kết Nối PH & HS</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrintSeatingChart}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="In sơ đồ lớp A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Sơ Đồ</span>
            </button>

            {/* Smart Arrange Dropdown (GVCN only) */}
            {role === 'gvcn' && (
              <div className="relative" ref={autoArrangeRef}>
                <button
                  type="button"
                  onClick={() => setIsAutoArrangeOpen((prev) => !prev)}
                  className={`px-3.5 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    isAutoArrangeOpen
                      ? 'bg-[#002244] ring-2 ring-amber-400'
                      : 'bg-[#003366] hover:bg-[#002244]'
                  }`}
                  aria-expanded={isAutoArrangeOpen}
                  title="Mở menu xếp chỗ tự động bằng AI"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Xếp Chỗ Tự Động</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
                      isAutoArrangeOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAutoArrangeOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                      <span>Thuật Toán Xếp Chỗ AI</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">5 Tiêu chí</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_group');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#003366] flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Xếp theo 4 Tổ (Dãy 1-4)</div>
                        <div className="text-[10px] text-slate-500">Quy hoạch 1 Tổ / 1 Dãy</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_vision');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Glasses className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Ưu tiên Cận thị (Bàn 1-2)</div>
                        <div className="text-[10px] text-slate-500">Đưa học sinh đeo kính lên trên</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_academic_pairs');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Đôi bạn cùng tiến (Giỏi + Khá)</div>
                        <div className="text-[10px] text-slate-500">Ghép cặp tương trợ học tập</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_gender');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Xen kẽ Nam - Nữ</div>
                        <div className="text-[10px] text-slate-500">Cân bằng nề nếp kỷ cương</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('shuffle');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 font-medium transition-colors border-t border-slate-100 cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-rose-800">Xáo trộn ngẫu nhiên</div>
                        <div className="text-[10px] text-rose-500">Đổi mới không gian lớp học</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reset Button (GVCN) */}
            {role === 'gvcn' && (
              <button
                onClick={() => {
                  setConfirmAction({
                    isOpen: true,
                    title: 'Khôi Phục Sơ Đồ Chỗ Ngồi Mặc Định',
                    message: `Bạn có chắc chắn muốn khôi phục lại sơ đồ vị trí chỗ ngồi ban đầu của lớp ${classInfo?.className || ''}?`,
                    confirmText: 'Tải Lại Sơ Đồ',
                    onConfirm: () => {
                      onResetSeatingChart();
                      setSelectedSeatKey(null);
                      showToast('Đã khôi phục lại sơ đồ chỗ ngồi mặc định của lớp!');
                    },
                  });
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                title="Khôi phục sơ đồ gốc"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Bar / Legend */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-800">Chú thích sơ đồ:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Tổ 1 (Dãy 1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Tổ 2 (Dãy 2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Tổ 3 (Dãy 3)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Tổ 4 (Dãy 4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-dashed border-slate-400 bg-slate-100"></span>
              <span>Ghế trống ({48 - assignedStudentIds.size})</span>
            </div>
          </div>

          {role === 'gvcn' && (
            <div className="text-[11px] bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Mẹo: Nhấp vào 1 ghế rồi nhấp ghế khác để hoán đổi chỗ ngồi ngay lập tức.</span>
            </div>
          )}
        </div>
      </div>

      {/* CLASSROOM ARENA / SEATING MATRIX */}
      <div className="bg-slate-900/5 rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 shadow-inner">
        {/* FRONT OF THE CLASSROOM (TEACHER'S PODIUM & BLACKBOARD) */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Top Windows & Doors Indicators */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-2">
            <div className="flex items-center gap-1.5 bg-slate-200/80 text-slate-600 px-3 py-1 rounded-md">
              <span>🚪 Cửa chính ra vào (Trước)</span>
            </div>
            <div className="bg-blue-100/60 text-blue-800 px-3 py-1 rounded-md">
              <span>🪟 Cửa sổ thông thoáng dãy hành lang A</span>
            </div>
          </div>

          {/* Teacher's Blackboard */}
          <div className="bg-[#1b382b] text-white rounded-2xl p-4 text-center border-4 border-[#8B5A2B] shadow-lg relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[10px] text-emerald-300 font-mono tracking-widest uppercase">
              BẢNG TỪ CHỐNG LÓA
            </div>
            <div className="absolute top-2 right-4 text-[10px] text-amber-200 font-mono">
              THỨ SÁU, 28/08/2026
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-amber-300 uppercase">
              {classInfo?.className ? `LỚP ${classInfo.className}` : 'SƠ ĐỒ LỚP HỌC'}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 italic">
              "Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT 2026"
            </p>
          </div>

          {/* Teacher's Podium & Desk */}
          <div className="flex items-center justify-center">
            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-6 py-3 shadow-md flex items-center gap-4 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                GV
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  BỤC GIẢNG & BÀN GIÁO VIÊN
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {teacherInfo?.name || 'Thầy Nguyễn Văn An (GVCN)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Phấn, Giáo án, Laptop & Micro truyền giảng
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 AISLES HORIZONTALLY SIDE-BY-SIDE (4 Dãy cùng nằm trên 1 hàng ngang) */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-4 gap-4 md:gap-6 lg:gap-8 min-w-[920px] max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((columnNum) => {
              const groupColor =
                columnNum === 1
                  ? 'border-blue-300 bg-blue-50/40 text-blue-800'
                  : columnNum === 2
                  ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                  : columnNum === 3
                  ? 'border-amber-300 bg-amber-50/40 text-amber-800'
                  : 'border-purple-300 bg-purple-50/40 text-purple-800';

              const headerBg =
                columnNum === 1
                  ? 'bg-blue-600 text-white'
                  : columnNum === 2
                  ? 'bg-emerald-600 text-white'
                  : columnNum === 3
                  ? 'bg-amber-600 text-white'
                  : 'bg-purple-600 text-white';

              return (
                <div key={columnNum} className="space-y-4 flex flex-col">
                  {/* Aisle / Column Header */}
                  <div
                    className={`rounded-xl p-3 text-center shadow-xs border ${groupColor} flex flex-col items-center justify-center`}
                  >
                    <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${headerBg}`}>
                      DÃY {columnNum} (TỔ {columnNum})
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1">
                      6 Bàn • 12 Chỗ ngồi
                    </span>
                  </div>

                  {/* 6 Desks in this column (Bàn 1 -> Bàn 6) */}
                  <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5, 6].map((deskNum) => {
                      const seat1Key = `${columnNum}-${deskNum}-1`;
                      const seat2Key = `${columnNum}-${deskNum}-2`;
                      const student1Id = seatingChart.assignments[seat1Key];
                      const student2Id = seatingChart.assignments[seat2Key];
                      const student1 = student1Id ? studentMap.get(student1Id) : null;
                      const student2 = student2Id ? studentMap.get(student2Id) : null;

                      const isSeat1Selected = selectedSeatKey === seat1Key;
                      const isSeat2Selected = selectedSeatKey === seat2Key;
                      const isSeat1Match = isStudentHighlighted(student1Id);
                      const isSeat2Match = isStudentHighlighted(student2Id);

                      const isCurrentStudent1 = currentStudentId && student1?.id === currentStudentId;
                      const isCurrentStudent2 = currentStudentId && student2?.id === currentStudentId;

                      return (
                        <div
                          key={deskNum}
                          className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200 hover:border-slate-300 transition-all"
                        >
                          {/* Desk Label */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-1.5 px-1">
                            <span>BÀN {deskNum}</span>
                            {deskNum <= 2 && (
                              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
                                Gần bảng
                              </span>
                            )}
                            {deskNum >= 5 && (
                              <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                                Cuối lớp
                              </span>
                            )}
                          </div>

                          {/* 2 Seats (Seat 1 - Left & Seat 2 - Right) */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Seat 1 (Trái) */}
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat1Key)}
                              className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] cursor-pointer ${
                                isSeat1Selected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/80 shadow-md scale-[1.02]'
                                  : isSeat1Match
                                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50'
                                  : isCurrentStudent1
                                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90'
                                  : student1
                                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-300'
                                  : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-400'
                              }`}
                              title={
                                student1
                                  ? `${student1.name} (Tổ ${student1.group}) - Nhấp để chọn/đổi chỗ`
                                  : 'Ghế trống - Nhấp để xếp chỗ'
                              }
                            >
                              {student1 ? (
                                <div className="space-y-1.5 w-full">
                                  {/* Student Header */}
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={student1.avatar}
                                      alt={student1.name}
                                      className="w-6 h-6 rounded-full object-cover border border-white shadow-xs shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                        {student1.name.split(' ').slice(-2).join(' ')}
                                      </div>
                                      <div className="text-[9px] text-slate-400 truncate">
                                        {student1.code.replace('TNH-12A1-', '#')}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mode details */}
                                  {displayMode === 'avatar_name' && (
                                    <div className="text-[10px] text-slate-600 truncate font-medium flex items-center justify-between">
                                      <span className="text-slate-500">{student1.name}</span>
                                      {student1.gender === 'Nữ' && (
                                        <span className="text-[9px] text-rose-500 font-bold">♀</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'grades_gpa' && (
                                    <div className="flex items-center justify-between text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                      <span className="text-emerald-700">GPA {student1.grades.gpa}</span>
                                      <span className="text-blue-700">T {student1.grades.math.avg}</span>
                                    </div>
                                  )}

                                  {displayMode === 'health_vision' && (
                                    <div className="text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                      {student1.healthNote.toLowerCase().includes('cận') ? (
                                        <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                                          👓 {student1.healthNote.split(',')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700">✓ Tốt</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'connect_pair' && (
                                    <div className="text-[9px] text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200/60 truncate font-semibold">
                                      🤝 Mạnh: {student1.strengths ? student1.strengths.split(',')[0] : 'Toán'}
                                    </div>
                                  )}

                                  {/* Current User Badge */}
                                  {isCurrentStudent1 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-2">
                                  <span className="text-[11px] text-slate-400 font-medium">Ghế 1</span>
                                  <span className="text-[9px] text-slate-400">(Trống)</span>
                                </div>
                              )}
                            </button>

                            {/* Seat 2 (Phải) */}
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat2Key)}
                              className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] cursor-pointer ${
                                isSeat2Selected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/80 shadow-md scale-[1.02]'
                                  : isSeat2Match
                                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50'
                                  : isCurrentStudent2
                                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90'
                                  : student2
                                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-300'
                                  : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-400'
                              }`}
                              title={
                                student2
                                  ? `${student2.name} (Tổ ${student2.group}) - Nhấp để chọn/đổi chỗ`
                                  : 'Ghế trống - Nhấp để xếp chỗ'
                              }
                            >
                              {student2 ? (
                                <div className="space-y-1.5 w-full">
                                  {/* Student Header */}
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={student2.avatar}
                                      alt={student2.name}
                                      className="w-6 h-6 rounded-full object-cover border border-white shadow-xs shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                        {student2.name.split(' ').slice(-2).join(' ')}
                                      </div>
                                      <div className="text-[9px] text-slate-400 truncate">
                                        {student2.code.replace('TNH-12A1-', '#')}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mode details */}
                                  {displayMode === 'avatar_name' && (
                                    <div className="text-[10px] text-slate-600 truncate font-medium flex items-center justify-between">
                                      <span className="text-slate-500">{student2.name}</span>
                                      {student2.gender === 'Nữ' && (
                                        <span className="text-[9px] text-rose-500 font-bold">♀</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'grades_gpa' && (
                                    <div className="flex items-center justify-between text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                      <span className="text-emerald-700">GPA {student2.grades.gpa}</span>
                                      <span className="text-blue-700">T {student2.grades.math.avg}</span>
                                    </div>
                                  )}

                                  {displayMode === 'health_vision' && (
                                    <div className="text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                      {student2.healthNote.toLowerCase().includes('cận') ? (
                                        <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                                          👓 {student2.healthNote.split(',')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700">✓ Tốt</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'connect_pair' && (
                                    <div className="text-[9px] text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200/60 truncate font-semibold">
                                      🤝 Mạnh: {student2.strengths ? student2.strengths.split(',')[0] : 'Lý & Hóa'}
                                    </div>
                                  )}

                                  {/* Current User Badge */}
                                  {isCurrentStudent2 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-2">
                                  <span className="text-[11px] text-slate-400 font-medium">Ghế 2</span>
                                  <span className="text-[9px] text-slate-400">(Trống)</span>
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BACK OF THE CLASSROOM (DOOR 2 & NOTICE BOARD) */}
        <div className="max-w-4xl mx-auto mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="bg-slate-200/70 text-slate-600 px-3 py-1 rounded-md font-semibold">
            🚪 Cửa phụ thoát hiểm (Cuối lớp)
          </div>
          <div className="bg-amber-100/70 text-amber-900 px-3 py-1 rounded-md font-semibold">
            📚 Tủ sách học liệu & Bảng tin thi đua Chi đoàn {classInfo?.className || ''}
          </div>
        </div>
      </div>

      {/* UNASSIGNED STUDENTS LIST (If any) */}
      {unassignedStudents.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/30">
          <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Học sinh chưa xếp chỗ ngồi ({unassignedStudents.length} em):</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs flex items-center gap-2 text-xs font-semibold text-slate-800"
              >
                <img src={s.avatar} alt={s.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{s.name}</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                  Tổ {s.group}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={viewingStudent.avatar}
                  alt={viewingStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#003366] shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewingStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingStudent.code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      Tổ {viewingStudent.group}
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      GPA {viewingStudent.grades.gpa}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#003366]" />
                  <span>Điểm Khối A (Toán - Lý - Hóa):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Toán</div>
                    <div className="font-bold text-blue-700 text-sm">{viewingStudent.grades.math.avg}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Vật Lý</div>
                    <div className="font-bold text-purple-700 text-sm">{viewingStudent.grades.physics.avg}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Hóa Học</div>
                    <div className="font-bold text-amber-700 text-sm">{viewingStudent.grades.chemistry.avg}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Glasses className="w-4 h-4 text-amber-600" />
                  <span>Thị lực & Lưu ý sức khỏe:</span>
                </div>
                <p className="text-slate-600">{viewingStudent.healthNote || 'Bình thường'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Sở trường & Năng khiếu:</span>
                </div>
                <p className="text-slate-600">{viewingStudent.strengths || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
              {onSelectStudent && (
                <button
                  onClick={() => {
                    const student = viewingStudent;
                    setViewingStudent(null);
                    onSelectStudent(student);
                  }}
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem Toàn Bộ Hồ Sơ Học Bạ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
      />
    </div>
  );
};
