import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Users,
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  UserCheck,
  Search,
  AlertCircle,
  HelpCircle,
  FileText,
  Sun,
  Sunset,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DutySchedule, DutyMemberAssignment, Student, DutySession, DutyDayOfWeek } from '../types';

interface EditDutyModalProps {
  isOpen: boolean;
  duty: DutySchedule | null;
  students: Student[];
  onClose: () => void;
  onSave: (duty: DutySchedule) => void;
}

// 8 standard slots of the week for 1 group
export const STANDARD_DUTY_SLOTS = [
  { id: 'mon-morning', dayOfWeek: 'Thứ 2' as DutyDayOfWeek, session: 'Sáng' as DutySession, slotName: 'Sáng Thứ 2', label: 'Sáng Thứ 2 (Chào cờ đầu tuần)', timeHint: '06:45 - 11:30' },
  { id: 'mon-afternoon', dayOfWeek: 'Thứ 2' as DutyDayOfWeek, session: 'Chiều' as DutySession, slotName: 'Chiều Thứ 2', label: 'Chiều Thứ 2 (Sau giờ học chiều)', timeHint: '13:00 - 17:15' },
  { id: 'tue-morning', dayOfWeek: 'Thứ 3' as DutyDayOfWeek, session: 'Sáng' as DutySession, slotName: 'Sáng Thứ 3', label: 'Sáng Thứ 3', timeHint: '06:45 - 11:30' },
  { id: 'tue-afternoon', dayOfWeek: 'Thứ 3' as DutyDayOfWeek, session: 'Chiều' as DutySession, slotName: 'Chiều Thứ 3', label: 'Chiều Thứ 3', timeHint: '13:00 - 17:15' },
  { id: 'wed-morning', dayOfWeek: 'Thứ 4' as DutyDayOfWeek, session: 'Sáng' as DutySession, slotName: 'Sáng Thứ 4', label: 'Sáng Thứ 4', timeHint: '06:45 - 11:30' },
  { id: 'wed-afternoon', dayOfWeek: 'Thứ 4' as DutyDayOfWeek, session: 'Chiều' as DutySession, slotName: 'Chiều Thứ 4', label: 'Chiều Thứ 4 (Sinh hoạt CLB/Bồi dưỡng)', timeHint: '13:00 - 17:15' },
  { id: 'thu-morning', dayOfWeek: 'Thứ 5' as DutyDayOfWeek, session: 'Sáng' as DutySession, slotName: 'Sáng Thứ 5', label: 'Sáng Thứ 5', timeHint: '06:45 - 11:30' },
  { id: 'fri-morning', dayOfWeek: 'Thứ 6' as DutyDayOfWeek, session: 'Sáng' as DutySession, slotName: 'Sáng Thứ 6', label: 'Sáng Thứ 6 (Tổng kết tuần)', timeHint: '06:45 - 11:30' },
];

// Main Task Definitions categorized by scope
export interface MainDutyTaskCategory {
  id: string;
  name: string;
  icon: string;
  morningDefault: string;
  afternoonDefault: string;
  subOptions: string[];
}

export const MAIN_DUTY_CATEGORIES: MainDutyTaskCategory[] = [
  {
    id: 'sweep',
    name: 'Quét dọn vệ sinh',
    icon: '🧹',
    morningDefault: 'Quét dọn sàn lớp học, bục giảng & hành lang trước lớp',
    afternoonDefault: 'Quét dọn lớp học sạch sẽ sau giờ học chiều',
    subOptions: [
      'Quét dọn sàn lớp học, bục giảng & hành lang trước lớp',
      'Quét dọn lớp học sạch sẽ sau giờ học chiều',
      'Quét hành lang trước lớp & gom rác vào thùng',
      'Lau sàn bục giảng & lau cửa ra vào',
    ],
  },
  {
    id: 'board',
    name: 'Lau bảng & Phấn',
    icon: '🧽',
    morningDefault: 'Lau sạch bảng đen, giặt giẻ & chuẩn bị phấn viết mới',
    afternoonDefault: 'Lau sạch bảng đen, giặt sạch giẻ & lau bàn giáo viên',
    subOptions: [
      'Lau sạch bảng đen, giặt giẻ & chuẩn bị phấn viết mới',
      'Lau sạch bảng đen, giặt sạch giẻ & lau bàn giáo viên',
      'Chuẩn bị micro, khăn trải bàn & nước uống giáo viên',
      'Giặt giẻ lau bảng sạch sẽ phơi khô cuối ngày',
    ],
  },
  {
    id: 'desks',
    name: 'Kê bàn ghế & Hộc bàn',
    icon: '🪑',
    morningDefault: 'Kê lại bàn ghế ngay ngắn thẳng hàng, kiểm tra hộc bàn',
    afternoonDefault: 'Kê ngay ngắn bàn ghế thẳng tắp, nhặt sạch rác trong hộc bàn',
    subOptions: [
      'Kê lại bàn ghế ngay ngắn thẳng hàng, kiểm tra hộc bàn',
      'Kê ngay ngắn bàn ghế thẳng tắp, nhặt sạch rác trong hộc bàn',
      'Sắp xếp lại tủ sách lớp và bục giảng ngay ngắn',
      'Kiểm tra và xếp gọn bàn ghế cuối buổi học',
    ],
  },
  {
    id: 'trash',
    name: 'Đổ rác & Vệ sinh thùng',
    icon: '🗑️',
    morningDefault: 'Thu gom rác đầu giờ & thay túi rác mới vào thùng',
    afternoonDefault: 'Đổ rác ra khu tập kết rác của trường & thay túi mới',
    subOptions: [
      'Thu gom rác đầu giờ & thay túi rác mới vào thùng',
      'Đổ rác ra khu tập kết rác của trường & thay túi mới',
      'Thu gom rác phân loại và mang đến nơi tập kết',
      'Vệ sinh thùng rác trong và ngoài lớp',
    ],
  },
  {
    id: 'security_electric',
    name: 'Tắt điện & Khóa cửa',
    icon: '💡',
    morningDefault: 'Bật quạt, đèn học và bàn giao lớp cho ca học chiều',
    afternoonDefault: 'Tắt toàn bộ quạt trần, tắt điều hòa, đóng cửa sổ & khóa cửa',
    subOptions: [
      'Tắt toàn bộ quạt trần, tắt điều hòa, đóng cửa sổ & khóa cửa',
      'Kiểm tra toàn bộ thiết bị điện, ngắt cầu dao & khóa cửa an toàn',
      'Đóng các cửa sổ, tắt đèn và bàn giao chìa khóa',
      'Bật quạt, đèn học và chuẩn bị thiết bị dạy học',
    ],
  },
  {
    id: 'leader',
    name: 'Tổ trưởng / Phụ trách',
    icon: '⭐',
    morningDefault: 'Tổ trưởng phụ trách chung ca trực sáng & đôn đốc các bạn',
    afternoonDefault: 'Phụ trách chung ca trực chiều, kiểm tra vệ sinh & khóa cửa',
    subOptions: [
      'Tổ trưởng phụ trách chung ca trực sáng & đôn đốc các bạn',
      'Phụ trách chung ca trực chiều, kiểm tra vệ sinh & khóa cửa',
      'Điều phối phân công, kiểm tra các vị trí & ký sổ trực nhật',
      'Bàn giao phòng học cho GVCN / Tổ tiếp theo',
    ],
  },
];

const COMMON_ALL_TASKS = [
  'Quét dọn lớp học & bục giảng',
  'Quét hành lang trước lớp & đổ rác',
  'Lau bảng đen, giặt giẻ & chuẩn bị phấn',
  'Kê lại bàn ghế ngay ngắn & kiểm tra hộc bàn',
  'Đóng cửa sổ, tắt quạt, điều hòa & khóa cửa',
  'Lau bàn giáo viên, lau cửa kính & tủ lớp',
  'Chuẩn bị micro và nước uống cho giáo viên',
  'Tưới cây xanh ngoài ban công lớp',
];

export const EditDutyModal: React.FC<EditDutyModalProps> = ({
  isOpen,
  duty,
  students,
  onClose,
  onSave,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DutyDayOfWeek>('Thứ 2');
  const [session, setSession] = useState<DutySession>('Sáng');
  const [slotName, setSlotName] = useState<string>('Sáng Thứ 2');
  const [assignedGroup, setAssignedGroup] = useState<1 | 2 | 3 | 4>(1);
  const [leaderName, setLeaderName] = useState<string>('');
  const [status, setStatus] = useState<DutySchedule['status']>('Chưa bắt đầu');
  const [inspectedBy, setInspectedBy] = useState<string>('GVCN Nguyễn Văn An');
  const [notes, setNotes] = useState<string>('');
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [assignedStudents, setAssignedStudents] = useState<DutyMemberAssignment[]>([]);

  // Add student selector state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [filterGroupByClass, setFilterGroupByClass] = useState<number | 'all'>('all');

  useEffect(() => {
    if (duty) {
      setDayOfWeek(duty.dayOfWeek || 'Thứ 2');
      const detSession: DutySession = duty.session || (duty.slotName?.includes('Chiều') ? 'Chiều' : 'Sáng');
      setSession(detSession);
      setSlotName(duty.slotName || `${detSession} ${duty.dayOfWeek}`);
      setAssignedGroup(duty.assignedGroup || 1);
      setLeaderName(duty.leaderName || '');
      setStatus(duty.status || 'Chưa bắt đầu');
      setInspectedBy(duty.inspectedBy || 'GVCN Nguyễn Văn An');
      setNotes(duty.notes || '');
      setTasks(
        duty.tasks && duty.tasks.length > 0
          ? duty.tasks
          : detSession === 'Chiều'
          ? [
              'Quét dọn lớp học sau giờ học',
              'Lau sạch bảng & bàn giáo viên',
              'Đổ rác ra khu tập kết & thay túi mới',
              'Tắt quạt, điều hòa, đóng cửa sổ & khóa cửa',
            ]
          : [
              'Quét dọn lớp & hành lang',
              'Lau bảng & giặt giẻ sạch sẽ',
              'Kê lại bàn ghế ngay ngắn',
              'Chuẩn bị micro & nước uống GV',
            ]
      );
      setAssignedStudents(duty.assignedStudents ? [...duty.assignedStudents] : []);
      setFilterGroupByClass(duty.assignedGroup || 1);
    } else {
      // Default to standard Sáng Thứ 2
      setDayOfWeek('Thứ 2');
      setSession('Sáng');
      setSlotName('Sáng Thứ 2');
      setAssignedGroup(1);
      setLeaderName('');
      setStatus('Chưa bắt đầu');
      setInspectedBy('GVCN Nguyễn Văn An');
      setNotes('');
      setTasks([
        'Quét dọn lớp & hành lang',
        'Lau bảng & giặt giẻ sạch sẽ',
        'Kê lại bàn ghế ngay ngắn',
        'Chuẩn bị micro & nước uống GV',
      ]);
      setAssignedStudents([]);
      setFilterGroupByClass(1);
    }
  }, [duty, isOpen]);

  if (!isOpen) return null;

  // Filter students based on search and group
  const availableStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(studentSearch.toLowerCase());
    const matchGroup = filterGroupByClass === 'all' || s.group === filterGroupByClass;
    return matchSearch && matchGroup;
  });

  // Select one of the 8 standard slot presets
  const handleSelectStandardSlot = (slot: typeof STANDARD_DUTY_SLOTS[0]) => {
    setDayOfWeek(slot.dayOfWeek);
    setSession(slot.session);
    setSlotName(slot.slotName);

    // Update default tasks based on morning vs afternoon if tasks are default
    if (slot.session === 'Chiều') {
      setTasks([
        'Quét dọn lớp học sau giờ học',
        'Lau sạch bảng & bàn giáo viên',
        'Đổ rác ra khu tập kết & thay túi rác',
        'Tắt toàn bộ quạt, điều hòa, đóng cửa sổ & khóa cửa',
      ]);
    } else {
      setTasks([
        'Quét dọn lớp & hành lang',
        'Lau bảng & giặt giẻ sạch sẽ',
        'Kê lại bàn ghế ngay ngắn',
        'Chuẩn bị micro & nước uống GV',
      ]);
    }
  };

  // Toggle session between Sáng and Chiều
  const handleToggleSession = (newSession: DutySession) => {
    setSession(newSession);
    setSlotName(`${newSession} ${dayOfWeek}`);
    if (newSession === 'Chiều') {
      setTasks([
        'Quét dọn lớp học sau giờ học',
        'Lau sạch bảng & bàn giáo viên',
        'Đổ rác ra khu tập kết & thay túi rác',
        'Tắt toàn bộ quạt, điều hòa, đóng cửa sổ & khóa cửa',
      ]);
    } else {
      setTasks([
        'Quét dọn lớp & hành lang',
        'Lau bảng & giặt giẻ sạch sẽ',
        'Kê lại bàn ghế ngay ngắn',
        'Chuẩn bị micro & nước uống GV',
      ]);
    }
  };

  // Auto-assign group members based on the main task categories
  const handleAutoAssignMainTasks = () => {
    const groupMembers = students.filter((s) => s.group === assignedGroup);
    if (groupMembers.length === 0) return;

    // Define smart role distribution based on session
    const isAfternoon = session === 'Chiều';
    
    const assignedList: DutyMemberAssignment[] = groupMembers.map((member, idx) => {
      let specificTask = '';
      let note = '';

      if (idx === 0) {
        // Leader
        specificTask = isAfternoon
          ? 'Phụ trách chung ca trực chiều, kiểm tra thiết bị điện & khóa cửa lớp'
          : 'Tổ trưởng phụ trách chung ca trực sáng & đôn đốc các bạn';
        note = 'Tổ trưởng phụ trách';
      } else if (idx === 1) {
        // Cleaning
        specificTask = isAfternoon
          ? 'Quét dọn toàn bộ phòng học sau giờ học chiều & gom rác'
          : 'Quét dọn sàn lớp học, bục giảng & hành lang trước lớp';
      } else if (idx === 2) {
        // Board & Chalk / Water
        specificTask = isAfternoon
          ? 'Lau sạch bảng đen, giặt giẻ phơi khô & lau bàn giáo viên'
          : 'Lau sạch bảng đen, giặt giẻ & chuẩn bị phấn viết mới';
      } else if (idx === 3) {
        // Desks & Chairs
        specificTask = isAfternoon
          ? 'Kê ngay ngắn bàn ghế thẳng tắp, nhặt sạch rác trong hộc bàn'
          : 'Kê lại bàn ghế ngay ngắn, kiểm tra vệ sinh hộc bàn đầu giờ';
      } else if (idx === 4) {
        // Trash
        specificTask = isAfternoon
          ? 'Đổ toàn bộ rác lớp ra nơi tập kết rác trường & thay túi mới'
          : 'Thu gom rác đầu giờ & thay túi rác mới vào thùng';
      } else if (idx === 5) {
        // Electrical & Door
        specificTask = isAfternoon
          ? 'Tắt toàn bộ quạt trần, tắt điều hòa, đóng chặt cửa sổ & khóa cửa'
          : 'Bật quạt, đèn học, chuẩn bị micro & nước uống cho giáo viên';
      } else {
        // Extra members
        specificTask = isAfternoon
          ? 'Hỗ trợ quét dọn hành lang, tưới cây xanh & sắp xếp dụng cụ'
          : 'Quét hành lang trước lớp & lau sạch bệ cửa sổ';
      }

      return {
        studentId: member.id,
        studentName: member.name,
        specificTask,
        note: note || undefined,
        isCompleted: status === 'Đã hoàn thành',
      };
    });

    setAssignedStudents(assignedList);
    if (groupMembers[0]) {
      setLeaderName(groupMembers[0].name);
    }
  };

  // Add individual student
  const handleAddStudent = () => {
    if (!selectedStudentId) return;
    const found = students.find((s) => s.id === selectedStudentId);
    if (!found) return;

    if (assignedStudents.some((a) => a.studentId === found.id)) {
      return;
    }

    const defaultCategory = MAIN_DUTY_CATEGORIES[assignedStudents.length % MAIN_DUTY_CATEGORIES.length];
    const defaultTask = session === 'Chiều' ? defaultCategory.afternoonDefault : defaultCategory.morningDefault;

    setAssignedStudents((prev) => [
      ...prev,
      {
        studentId: found.id,
        studentName: found.name,
        specificTask: defaultTask,
        isCompleted: false,
      },
    ]);
    setSelectedStudentId('');
  };

  // Update specific student's task or note
  const handleUpdateStudentTask = (studentId: string, specificTask: string) => {
    setAssignedStudents((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, specificTask } : a))
    );
  };

  const handleUpdateStudentNote = (studentId: string, note: string) => {
    setAssignedStudents((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, note } : a))
    );
  };

  const handleToggleStudentCompleted = (studentId: string) => {
    setAssignedStudents((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, isCompleted: !a.isCompleted } : a))
    );
  };

  const handleRemoveStudent = (studentId: string) => {
    setAssignedStudents((prev) => prev.filter((a) => a.studentId !== studentId));
  };

  // General task list handlers
  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    if (!tasks.includes(newTaskInput.trim())) {
      setTasks((prev) => [...prev, newTaskInput.trim()]);
    }
    setNewTaskInput('');
  };

  const handleRemoveTask = (idx: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSlotName = slotName || `${session} ${dayOfWeek}`;

    const updatedDuty: DutySchedule = {
      id: duty?.id || `duty-${Date.now()}`,
      dayOfWeek,
      session,
      slotName: finalSlotName,
      assignedGroup,
      leaderName: leaderName.trim() || `Tổ trưởng Tổ ${assignedGroup}`,
      tasks:
        tasks.length > 0
          ? tasks
          : session === 'Chiều'
          ? [
              'Quét dọn lớp học sau giờ học',
              'Lau sạch bảng & bàn giáo viên',
              'Đổ rác ra khu tập kết & thay túi mới',
              'Tắt quạt, điều hòa, đóng cửa sổ & khóa cửa',
            ]
          : [
              'Quét dọn lớp & hành lang',
              'Lau bảng & giặt giẻ sạch sẽ',
              'Kê lại bàn ghế ngay ngắn',
              'Chuẩn bị micro & nước uống GV',
            ],
      status,
      inspectedBy: inspectedBy.trim() || undefined,
      notes: notes.trim() || undefined,
      assignedStudents,
      week: duty?.week || 1,
    };

    onSave(updatedDuty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#003366] via-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              {session === 'Chiều' ? <Sunset className="w-6 h-6 text-indigo-950" /> : <Sun className="w-6 h-6 text-amber-950" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{duty ? 'Chỉnh Sửa Phân Công Trực Nhật' : 'Thêm Phân Công Trực Nhật Mới'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold flex items-center gap-1">
                  {session === 'Chiều' ? '🌇' : '🌅'} {slotName || `${session} ${dayOfWeek}`} • Tổ {assignedGroup}
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Phân công chuẩn 8 buổi/tuần cho Tổ phụ trách, chọn ca Sáng/Chiều và gán nhiệm vụ theo đầu việc chính
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* FEATURE 1: 8 Standard Weekly Slots Quick Picker */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 dark:from-slate-800/80 dark:via-blue-950/30 dark:to-slate-800/80 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-xs font-black text-[#003366] dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-blue-600" />
                Khung 8 Buổi Trực Chuẩn Trong Tuần (1 Tổ phụ trách)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Chọn nhanh 1 trong 8 ca trực chuẩn:
              </span>
            </div>

            {/* Quick 8 Slots Pill Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STANDARD_DUTY_SLOTS.map((slot) => {
                const isSelected = dayOfWeek === slot.dayOfWeek && session === slot.session;
                const isAfternoon = slot.session === 'Chiều';
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleSelectStandardSlot(slot)}
                    className={`p-2 sm:p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isAfternoon
                          ? 'bg-gradient-to-br from-indigo-700 to-purple-800 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/50'
                          : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
                        : isAfternoon
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                        : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black flex items-center gap-1">
                        {isAfternoon ? <Sunset className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                        {slot.slotName}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${
                        isSelected
                          ? 'text-white/80'
                          : isAfternoon
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {slot.timeHint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURE 2: Session & Basic Info Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {/* Buổi Trực (Sáng / Chiều Switcher) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <span>Buổi Trực</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggleSession('Sáng')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    session === 'Sáng'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Sáng</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleSession('Chiều')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    session === 'Chiều'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  <Sunset className="w-3.5 h-3.5" />
                  <span>Chiều</span>
                </button>
              </div>
            </div>

            {/* Day of week */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Thứ Trong Tuần <span className="text-rose-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => {
                  const newDay = e.target.value as DutyDayOfWeek;
                  setDayOfWeek(newDay);
                  setSlotName(`${session} ${newDay}`);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Thứ 2">Thứ 2</option>
                <option value="Thứ 3">Thứ 3</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
                <option value="Thứ 7">Thứ 7</option>
              </select>
            </div>

            {/* Assigned Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tổ Phụ Trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignedGroup}
                onChange={(e) => {
                  const grp = Number(e.target.value) as 1 | 2 | 3 | 4;
                  setAssignedGroup(grp);
                  setFilterGroupByClass(grp);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trạng Thái Ca Trực
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Leader & Supervisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tổ Trưởng Phụ Trách Ca Trực
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="VD: Nguyễn Hoàng Long"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setLeaderName(e.target.value);
                  }}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Chọn nhanh từ danh sách học sinh Tổ"
                >
                  <option value="">Chọn từ Tổ {assignedGroup}...</option>
                  {students
                    .filter((s) => s.group === assignedGroup)
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Người Giám Sát / Kiểm Tra Ca Trực
              </label>
              <input
                type="text"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                placeholder="VD: GVCN Nguyễn Văn An / Lớp phó Lao động"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* FEATURE 3: PHÂN CÔNG CỤ THỂ CHO CÁC BẠN THEO CÁC ĐẦU VIỆC CHÍNH */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-blue-200/80 dark:border-blue-900/50">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#003366] dark:text-blue-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Phân Công Chi Tiết Theo Đầu Việc Chính ({assignedStudents.length} học sinh)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Gán cụ thể từng bạn vào các đầu việc chính: Quét dọn, Lau bảng, Kê bàn ghế, Đổ rác, Tắt điện & khóa cửa ({session})
                </p>
              </div>

              {/* 1-Click Smart Auto Assign by Main Tasks */}
              <button
                type="button"
                onClick={handleAutoAssignMainTasks}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-[#003366] hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto active:scale-95"
                title={`Tự động chia đều các đầu việc chính của ca ${session} cho tất cả thành viên Tổ ${assignedGroup}`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Phân Bổ Tự Động Đầu Việc Tổ {assignedGroup}</span>
              </button>
            </div>

            {/* Quick Task Category Selector Hint Bar */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-blue-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Các đầu việc chính ca {session} (bấm vào chip để gán nhanh cho học sinh):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MAIN_DUTY_CATEGORIES.map((cat) => {
                  const taskText = session === 'Chiều' ? cat.afternoonDefault : cat.morningDefault;
                  return (
                    <span
                      key={cat.id}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1"
                      title={taskText}
                    >
                      <span>{cat.icon}</span>
                      <strong className="text-blue-900 dark:text-blue-300">{cat.name}</strong>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Add Student Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Thêm học sinh:
                </span>
                <select
                  value={filterGroupByClass}
                  onChange={(e) =>
                    setFilterGroupByClass(
                      e.target.value === 'all' ? 'all' : (Number(e.target.value) as any)
                    )
                  }
                  className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <option value="all">Tất cả lớp</option>
                  <option value={1}>Tổ 1</option>
                  <option value={2}>Tổ 2</option>
                  <option value={3}>Tổ 3</option>
                  <option value={4}>Tổ 4</option>
                </select>
              </div>

              <div className="flex-1 w-full flex items-center gap-2">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">-- Chọn học sinh cần phân công --</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Tổ {s.group} • {s.code})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!selectedStudentId}
                  onClick={handleAddStudent}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>

            {/* List of Assigned Students with Specific Main Tasks */}
            {assignedStudents.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Chưa có học sinh nào được phân công cụ thể cho ca trực {slotName || `${session} ${dayOfWeek}`}.
                </p>
                <p className="text-[11px] text-slate-500">
                  Nhấn nút <strong>"Phân Bổ Tự Động Đầu Việc Tổ {assignedGroup}"</strong> ở trên để hệ thống tự động gán các đầu việc chính.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {assignedStudents.map((assignment, index) => {
                  const studentObj = students.find((s) => s.id === assignment.studentId);
                  return (
                    <div
                      key={assignment.studentId || index}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all space-y-2 ${
                        assignment.isCompleted
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      }`}
                    >
                      {/* Row 1: Student info, task input, notes & action */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                        {/* Student Name & Completion */}
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentCompleted(assignment.studentId)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              assignment.isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-300 text-transparent hover:border-emerald-500'
                            }`}
                            title={assignment.isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu đã hoàn thành'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                {assignment.studentName}
                              </span>
                              {studentObj && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold">
                                  Tổ {studentObj.group}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {assignment.isCompleted ? '✓ Đã hoàn tất nhiệm vụ' : 'Chưa hoàn thành'}
                            </span>
                          </div>
                        </div>

                        {/* Task text input & Note */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={assignment.specificTask}
                              onChange={(e) =>
                                handleUpdateStudentTask(assignment.studentId, e.target.value)
                              }
                              placeholder="Nhiệm vụ cụ thể..."
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={assignment.note || ''}
                              onChange={(e) =>
                                handleUpdateStudentNote(assignment.studentId, e.target.value)
                              }
                              placeholder="Ghi chú thêm (VD: Vệ sinh bục giảng, tiếp nước...)"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Delete action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(assignment.studentId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer self-end md:self-auto shrink-0"
                          title="Xóa học sinh khỏi ca trực"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Row 2: Quick click chips for main task categories */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold mr-1">Đổi việc:</span>
                        {MAIN_DUTY_CATEGORIES.map((cat) => {
                          const taskVal = session === 'Chiều' ? cat.afternoonDefault : cat.morningDefault;
                          const isCurrent = assignment.specificTask === taskVal || assignment.specificTask.includes(cat.name);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleUpdateStudentTask(assignment.studentId, taskVal)}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FEATURE 4: General Checklist Tasks */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Danh Mục Công Việc Chung Của Ca {session} ({tasks.length} đầu việc)
            </label>

            <div className="flex flex-wrap gap-1.5">
              {tasks.map((taskText, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>{taskText}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="hover:text-rose-600 p-0.5 ml-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder={`Thêm đầu việc mới cho ca trực ${session}...`}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* FEATURE 5: Notes & Reminders */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú & Lưu Ý Đặc Biệt Cho Ca {session}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                session === 'Chiều'
                  ? 'VD: Ca chiều sau giờ học cần kiểm tra khóa cẩn thận các cửa sổ góc phòng, tắt cầu dao điều hòa...'
                  : 'VD: Đầu tuần chào cờ cần dọn sớm trước 06:45; có tiết thực hành Hóa cần chuẩn bị xô nước...'
              }
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-[#003366] hover:from-blue-800 hover:to-[#002244] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Lưu Phân Công Ca {session} ({slotName})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

