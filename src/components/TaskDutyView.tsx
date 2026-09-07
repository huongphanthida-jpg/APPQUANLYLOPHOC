import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Upload,
  ArrowRight,
  Trash2,
  Edit3,
  UserCheck,
  Download,
  Printer,
  FileSpreadsheet,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Sun,
  Sunset,
  Check,
  ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TaskItem, DutySchedule, UserRole, Student, DutySession } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { EditDutyModal, STANDARD_DUTY_SLOTS } from './EditDutyModal';

interface TaskDutyViewProps {
  tasks: TaskItem[];
  dutySchedule: DutySchedule[];
  students?: Student[];
  onUpdateTaskStatus: (taskId: string, status: TaskItem['status']) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateDutyStatus: (dutyId: string, status: DutySchedule['status']) => void;
  onSaveDuty?: (duty: DutySchedule) => void;
  onDeleteDuty?: (dutyId: string) => void;
  role: UserRole;
}

export const TaskDutyView: React.FC<TaskDutyViewProps> = ({
  tasks,
  dutySchedule,
  students = [],
  onUpdateTaskStatus,
  onAddTask,
  onDeleteTask,
  onUpdateDutyStatus,
  onSaveDuty,
  onDeleteDuty,
  role,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'duty'>('duty');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedDutyGroupFilter, setSelectedDutyGroupFilter] = useState<number | 'all'>('all');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<'all' | 'Sáng' | 'Chiều'>('all');
  const [selectedDutyWeek, setSelectedDutyWeek] = useState<number>(1);

  // Edit Duty Modal state
  const [isEditDutyModalOpen, setIsEditDutyModalOpen] = useState<boolean>(false);
  const [editingDuty, setEditingDuty] = useState<DutySchedule | null>(null);

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
    confirmText: 'Xác Nhận Xoá',
  });

  const [newTask, setNewTask] = useState<Omit<TaskItem, 'id'>>({
    title: '',
    description: '',
    assignedGroup: 'all',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'todo',
    priority: 'medium',
    proofRequired: false,
  });

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    onAddTask(newTask);
    setShowAddTask(false);
    setNewTask({
      title: '',
      description: '',
      assignedGroup: 'all',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'todo',
      priority: 'medium',
      proofRequired: false,
    });
  };

  // Toggle completion of a specific student assignment on the duty card
  const handleToggleStudentDuty = (duty: DutySchedule, studentId: string) => {
    if (!onSaveDuty) return;
    const currentAssignments = duty.assignedStudents || [];
    const updatedAssignments = currentAssignments.map((a) =>
      a.studentId === studentId ? { ...a, isCompleted: !a.isCompleted } : a
    );

    const allCompleted =
      updatedAssignments.length > 0 && updatedAssignments.every((a) => a.isCompleted);
    const anyCompleted = updatedAssignments.some((a) => a.isCompleted);

    const newStatus: DutySchedule['status'] = allCompleted
      ? 'Đã hoàn thành'
      : anyCompleted
      ? 'Đang thực hiện'
      : duty.status;

    onSaveDuty({
      ...duty,
      assignedStudents: updatedAssignments,
      status: newStatus,
    });
  };

  // Export duty schedule to Excel with session details
  const handleExportDutyExcel = () => {
    const exportRows: any[] = [];

    dutySchedule.forEach((duty) => {
      const sessionText = duty.session || (duty.slotName?.includes('Chiều') ? 'Chiều' : 'Sáng');
      const slotText = duty.slotName || `${sessionText} ${duty.dayOfWeek}`;

      if (duty.assignedStudents && duty.assignedStudents.length > 0) {
        duty.assignedStudents.forEach((studentAssign, idx) => {
          exportRows.push({
            'Khung Trực': idx === 0 ? slotText : '',
            'Buổi Trực': idx === 0 ? sessionText : '',
            'Thứ Trong Tuần': idx === 0 ? duty.dayOfWeek : '',
            'Tổ Phụ Trách': idx === 0 ? `Tổ ${duty.assignedGroup}` : '',
            'Tổ Trưởng': idx === 0 ? duty.leaderName : '',
            'Họ Và Tên Học Sinh': studentAssign.studentName,
            'Đầu Việc / Nhiệm Vụ Cụ Thể': studentAssign.specificTask,
            'Ghi Chú': studentAssign.note || '',
            'Tiến Độ': studentAssign.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành',
            'Trạng Thái Ca Trực': idx === 0 ? duty.status : '',
            'Người Giám Sát': idx === 0 ? duty.inspectedBy || 'GVCN Nguyễn Văn An' : '',
          });
        });
      } else {
        exportRows.push({
          'Khung Trực': slotText,
          'Buổi Trực': sessionText,
          'Thứ Trong Tuần': duty.dayOfWeek,
          'Tổ Phụ Trách': `Tổ ${duty.assignedGroup}`,
          'Tổ Trưởng': duty.leaderName,
          'Họ Và Tên Học Sinh': 'Chưa phân công chi tiết',
          'Đầu Việc / Nhiệm Vụ Cụ Thể': duty.tasks.join('; '),
          'Ghi Chú': duty.notes || '',
          'Tiến Độ': duty.status,
          'Trạng Thái Ca Trực': duty.status,
          'Người Giám Sát': duty.inspectedBy || 'GVCN Nguyễn Văn An',
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 18 },
      { wch: 12 },
      { wch: 15 },
      { wch: 14 },
      { wch: 22 },
      { wch: 24 },
      { wch: 45 },
      { wch: 25 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lich_Truc_Nhat_Tuan');
    XLSX.writeFile(wb, `Lich_Phan_Cong_Truc_Nhat_8_Buoi_Tuan_${selectedDutyWeek}.xlsx`);
  };

  // Auto-generate 8 standard slots for a group in the week
  const handleGenerate8SlotsForGroup = (targetGroup: 1 | 2 | 3 | 4) => {
    if (!onSaveDuty) return;
    const groupMembers = students.filter((s) => s.group === targetGroup);
    const leader = groupMembers[0]?.name || `Tổ trưởng Tổ ${targetGroup}`;

    STANDARD_DUTY_SLOTS.forEach((slot, sIdx) => {
      const isAfternoon = slot.session === 'Chiều';
      const defaultTasks = isAfternoon
        ? [
            'Quét dọn lớp học sau giờ học',
            'Lau sạch bảng & bàn giáo viên',
            'Đổ rác ra khu tập kết & thay túi rác mới',
            'Tắt quạt, điều hòa, đóng cửa sổ & khóa cửa',
          ]
        : [
            'Quét dọn lớp & hành lang trước lớp',
            'Lau bảng & giặt giẻ sạch sẽ',
            'Kê lại bàn ghế ngay ngắn',
            'Chuẩn bị micro & nước uống GV',
          ];

      const assignedStudentsList = groupMembers.map((member, mIdx) => {
        let specificTask = '';
        if (mIdx === 0) {
          specificTask = isAfternoon
            ? 'Phụ trách chung ca trực chiều, kiểm tra thiết bị điện & khóa cửa lớp'
            : 'Tổ trưởng phụ trách chung ca trực sáng & đôn đốc các bạn';
        } else if (mIdx === 1) {
          specificTask = isAfternoon
            ? 'Quét dọn toàn bộ phòng học sau giờ học chiều & gom rác'
            : 'Quét dọn sàn lớp học, bục giảng & hành lang trước lớp';
        } else if (mIdx === 2) {
          specificTask = isAfternoon
            ? 'Lau sạch bảng đen, giặt giẻ phơi khô & lau bàn giáo viên'
            : 'Lau sạch bảng đen, giặt giẻ & chuẩn bị phấn viết mới';
        } else if (mIdx === 3) {
          specificTask = isAfternoon
            ? 'Kê ngay ngắn bàn ghế thẳng tắp, nhặt sạch rác trong hộc bàn'
            : 'Kê lại bàn ghế ngay ngắn, kiểm tra vệ sinh hộc bàn đầu giờ';
        } else if (mIdx === 4) {
          specificTask = isAfternoon
            ? 'Đổ toàn bộ rác lớp ra nơi tập kết rác trường & thay túi mới'
            : 'Thu gom rác đầu giờ & thay túi rác mới vào thùng';
        } else if (mIdx === 5) {
          specificTask = isAfternoon
            ? 'Tắt toàn bộ quạt trần, tắt điều hòa, đóng chặt cửa sổ & khóa cửa'
            : 'Bật quạt, đèn học, chuẩn bị micro & nước uống cho giáo viên';
        } else {
          specificTask = isAfternoon
            ? 'Hỗ trợ quét dọn hành lang, tưới cây xanh & sắp xếp dụng cụ'
            : 'Quét hành lang trước lớp & lau sạch bệ cửa sổ';
        }

        return {
          studentId: member.id,
          studentName: member.name,
          specificTask,
          note: mIdx === 0 ? 'Tổ trưởng phụ trách' : undefined,
          isCompleted: false,
        };
      });

      const newDuty: DutySchedule = {
        id: `duty-slot-${targetGroup}-${slot.id}-${Date.now()}-${sIdx}`,
        dayOfWeek: slot.dayOfWeek,
        session: slot.session,
        slotName: slot.slotName,
        assignedGroup: targetGroup,
        leaderName: leader,
        tasks: defaultTasks,
        status: 'Chưa bắt đầu',
        inspectedBy: 'GVCN Nguyễn Văn An',
        assignedStudents: assignedStudentsList,
        week: selectedDutyWeek,
      };

      onSaveDuty(newDuty);
    });
  };

  // Filtered duty list
  const filteredDutySchedule = dutySchedule.filter((duty) => {
    if (selectedDutyGroupFilter !== 'all' && duty.assignedGroup !== selectedDutyGroupFilter) {
      return false;
    }
    const dutySession = duty.session || (duty.slotName?.includes('Chiều') ? 'Chiều' : 'Sáng');
    if (selectedSessionFilter !== 'all' && dutySession !== selectedSessionFilter) {
      return false;
    }
    return true;
  });

  return (
    <div id="task-duty-view" className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-black flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              LỊCH TRỰC NHẬT 8 BUỔI/TUẦN
            </span>
            <span className="text-xs text-slate-400 font-medium">• 1 Tổ phụ trách toàn tuần</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#003366] dark:text-white mt-1">
            Quản Lý Hoạt Động & Phân Công Trực Nhật Lớp
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Phân công 8 buổi chuẩn/tuần (Sáng & Chiều T2, T3, T4; Sáng T5, T6), chọn buổi chiều và gán nhiệm vụ theo đầu việc chính
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('duty')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'duty'
                  ? 'bg-gradient-to-r from-blue-700 to-[#003366] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Lịch Trực Nhật (8 Buổi)</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-blue-700 to-[#003366] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-700'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Task Board Tổ/Nhóm</span>
            </button>
          </div>

          {/* Add New Duty Button */}
          {(role === 'gvcn' || role === 'csl') && activeTab === 'duty' && (
            <button
              id="btn-add-duty-slot"
              onClick={() => {
                setEditingDuty(null);
                setIsEditDutyModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-[#003366] hover:from-blue-800 hover:to-[#002244] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Thêm Ca Trực Nhật</span>
            </button>
          )}

          {/* Context Action Button for Task Board */}
          {(role === 'gvcn' || role === 'csl') && activeTab === 'tasks' && (
            <button
              id="btn-open-add-task"
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#98FF98]" />
              <span>Giao Nhiệm Vụ Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Tabs */}
      {activeTab === 'tasks' ? (
        /* Task Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Cần làm */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Cần Làm ({todoTasks.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {task.priority === 'urgent'
                        ? 'Khẩn cấp'
                        : task.priority === 'high'
                        ? 'Ưu tiên cao'
                        : 'Bình thường'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Hạn: {task.dueDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#003366] dark:text-blue-400">
                      {task.assignedGroup === 'all' ? 'Cả lớp' : `Tổ ${task.assignedGroup}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {role === 'gvcn' && onDeleteTask && (
                        <button
                          type="button"
                          id={`btn-delete-task-${task.id}`}
                          onClick={() => {
                            setConfirmAction({
                              isOpen: true,
                              title: 'Xoá Nhiệm Vụ',
                              message: `Bạn có chắc chắn muốn xoá nhiệm vụ "${task.title}"?`,
                              confirmText: 'Xoá Nhiệm Vụ',
                              onConfirm: () => onDeleteTask(task.id),
                            });
                          }}
                          title="Xoá nhiệm vụ"
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Bắt đầu <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Đang thực hiện */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                  Đang Thực Hiện ({inProgressTasks.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Đang xử lý
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Hạn: {task.dueDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#003366] dark:text-blue-400">
                      {task.assignedGroup === 'all' ? 'Cả lớp' : `Tổ ${task.assignedGroup}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {role === 'gvcn' && onDeleteTask && (
                        <button
                          type="button"
                          id={`btn-delete-task-prog-${task.id}`}
                          onClick={() => {
                            setConfirmAction({
                              isOpen: true,
                              title: 'Xoá Nhiệm Vụ',
                              message: `Bạn có chắc chắn muốn xoá nhiệm vụ "${task.title}"?`,
                              confirmText: 'Xoá Nhiệm Vụ',
                              onConfirm: () => onDeleteTask(task.id),
                            });
                          }}
                          title="Xoá nhiệm vụ"
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Hoàn thành */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                  Đã Hoàn Thành ({completedTasks.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-emerald-200 dark:border-slate-700 shadow-xs space-y-2 opacity-90"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoàn tất
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                      {role === 'gvcn' && onDeleteTask && (
                        <button
                          type="button"
                          id={`btn-delete-task-done-${task.id}`}
                          onClick={() => {
                            setConfirmAction({
                              isOpen: true,
                              title: 'Xoá Nhiệm Vụ',
                              message: `Bạn có chắc chắn muốn xoá nhiệm vụ đã hoàn thành "${task.title}"?`,
                              confirmText: 'Xoá Nhiệm Vụ',
                              onConfirm: () => onDeleteTask(task.id),
                            });
                          }}
                          title="Xoá nhiệm vụ"
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 line-through">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Duty Schedule Table & Detailed Student Assignments */
        <div className="space-y-5">
          {/* 8-Session Standard Overview & Fast Generator Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-[#003366] text-white shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Quy định 8 buổi trực/tuần
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1 text-white">
                  Phân Công 8 Buổi Trong Tuần Cho 1 Tổ Phụ Trách
                </h3>
                <p className="text-xs text-blue-200">
                  Thứ 2 (Sáng & Chiều) • Thứ 3 (Sáng & Chiều) • Thứ 4 (Sáng & Chiều) • Thứ 5 (Sáng) • Thứ 6 (Sáng)
                </p>
              </div>

              {/* Quick 1-click Auto Generator for any Group */}
              {(role === 'gvcn' || role === 'csl') && (
                <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 p-1.5 rounded-2xl border border-white/20">
                  <span className="text-xs font-bold text-blue-200 px-2 whitespace-nowrap">
                    Khởi tạo 8 buổi cho:
                  </span>
                  {[1, 2, 3, 4].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => handleGenerate8SlotsForGroup(grp as 1 | 2 | 3 | 4)}
                      className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                      title={`Tạo ngay trọn bộ 8 buổi trực nhật chuẩn cho Tổ ${grp} trong tuần này`}
                    >
                      Tổ {grp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8 Slots Quick Overview Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-white/15">
              {STANDARD_DUTY_SLOTS.map((stdSlot) => {
                const isAfternoon = stdSlot.session === 'Chiều';
                const matchingDuty = dutySchedule.find(
                  (d) =>
                    d.dayOfWeek === stdSlot.dayOfWeek &&
                    (d.session === stdSlot.session || d.slotName?.includes(stdSlot.session))
                );

                return (
                  <div
                    key={stdSlot.id}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      matchingDuty
                        ? isAfternoon
                          ? 'bg-indigo-950/80 border-indigo-400 text-white'
                          : 'bg-amber-950/70 border-amber-400 text-white'
                        : 'bg-white/10 border-white/20 text-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-black text-[11px] flex items-center gap-1">
                        {isAfternoon ? <Sunset className="w-3 h-3 text-indigo-300" /> : <Sun className="w-3 h-3 text-amber-300" />}
                        {stdSlot.slotName}
                      </span>
                    </div>

                    {matchingDuty ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/20 inline-block">
                          Tổ {matchingDuty.assignedGroup}
                        </span>
                        <p className="text-[10px] text-white/80 truncate">
                          {matchingDuty.assignedStudents?.length || 0} học sinh
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-blue-300 italic">Chưa có lịch</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duty Controls Bar: Week Selector, Group Filter, Session Filter, Export, Print */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Session Filter (Sáng / Chiều / Tất cả) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Buổi:
                </span>
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSessionFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    Tất cả 8 Buổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionFilter('Sáng')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSessionFilter === 'Sáng'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Sáng (5 buổi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionFilter('Chiều')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSessionFilter === 'Chiều'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    <Sunset className="w-3 h-3" />
                    <span>Chiều (3 buổi)</span>
                  </button>
                </div>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  Tổ:
                </span>
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedDutyGroupFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedDutyGroupFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    Tất cả
                  </button>
                  {[1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedDutyGroupFilter(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDutyGroupFilter === g
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      Tổ {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Tuần:
                </span>
                <select
                  value={selectedDutyWeek}
                  onChange={(e) => setSelectedDutyWeek(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Tuần {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export & Print Actions */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                id="btn-export-duty-schedule"
                onClick={handleExportDutyExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Xuất bảng phân công 8 buổi trực nhật ra tệp Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel</span>
              </button>

              <button
                type="button"
                id="btn-print-duty-schedule"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="In phiếu phân công trực nhật trong tuần"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>In Phiếu</span>
              </button>
            </div>
          </div>

          {/* Duty Schedule Cards List */}
          {filteredDutySchedule.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Chưa có lịch trực nhật nào phù hợp với bộ lọc.
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Nhấn vào nút "Thêm Ca Trực Nhật" hoặc chọn "Khởi tạo 8 buổi cho Tổ" ở thanh trên để tạo nhanh danh sách phân công.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDutySchedule.map((duty) => {
                const isAfternoon =
                  duty.session === 'Chiều' || duty.slotName?.includes('Chiều');
                const sessionLabel = isAfternoon ? 'Chiều' : 'Sáng';
                const slotDisplayName = duty.slotName || `${sessionLabel} ${duty.dayOfWeek}`;
                const assignedCount = duty.assignedStudents?.length || 0;
                const completedStudentCount =
                  duty.assignedStudents?.filter((s) => s.isCompleted).length || 0;

                return (
                  <div
                    key={duty.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                  >
                    {/* Card Top Header */}
                    <div
                      className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isAfternoon
                          ? 'bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-800/80 border-indigo-200/80 dark:border-indigo-900/50'
                          : 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-slate-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-800/80 border-amber-200/80 dark:border-amber-900/50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Session Badge (Sáng / Chiều) */}
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5 text-white ${
                            isAfternoon
                              ? 'bg-gradient-to-r from-indigo-700 to-purple-800'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600'
                          }`}
                        >
                          {isAfternoon ? <Sunset className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                          <span>{slotDisplayName}</span>
                        </span>

                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-600" />
                          TỔ {duty.assignedGroup}
                        </span>

                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          (Tổ trưởng phụ trách: <strong className="text-slate-900 dark:text-slate-100">{duty.leaderName}</strong>)
                        </span>

                        {duty.inspectedBy && (
                          <span className="text-[11px] text-slate-400">
                            • Giám sát: {duty.inspectedBy}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            duty.status === 'Đã hoàn thành'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : duty.status === 'Đang thực hiện'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {duty.status === 'Đã hoàn thành' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {duty.status}
                        </span>

                        {/* Edit / Adjust Duty Button */}
                        {(role === 'gvcn' || role === 'csl') && (
                          <button
                            type="button"
                            id={`btn-edit-duty-${duty.id}`}
                            onClick={() => {
                              setEditingDuty(duty);
                              setIsEditDutyModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="Chỉnh sửa chi tiết buổi trực và phân công các đầu việc chính"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                            <span>Sửa Phân Công</span>
                          </button>
                        )}

                        {(role === 'gvcn' || role === 'csl') && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                onUpdateDutyStatus(
                                  duty.id,
                                  duty.status === 'Đã hoàn thành' ? 'Đang thực hiện' : 'Đã hoàn thành'
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {duty.status === 'Đã hoàn thành' ? 'Đổi trạng thái' : 'Xong ca'}
                            </button>

                            {role === 'gvcn' && onDeleteDuty && (
                              <button
                                type="button"
                                id={`btn-delete-duty-${duty.id}`}
                                onClick={() => {
                                  setConfirmAction({
                                    isOpen: true,
                                    title: 'Xoá Lịch Trực Nhật',
                                    message: `Bạn có chắc chắn muốn xoá lịch trực nhật của Tổ ${duty.assignedGroup} (${slotDisplayName})?`,
                                    confirmText: 'Xoá Lịch',
                                    onConfirm: () => onDeleteDuty(duty.id),
                                  });
                                }}
                                title="Xoá ca trực này"
                                className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body: Detailed Student Assignments Table with Main Tasks */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Assigned Students Grid */}
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            Phân Công Học Sinh Cụ Thể Theo Đầu Việc Chính ({assignedCount} bạn)
                          </span>

                          {assignedCount > 0 && (
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              Tiến độ: <span className="text-emerald-600 font-black">{completedStudentCount}</span>/{assignedCount} bạn đã hoàn thành
                            </span>
                          )}
                        </div>

                        {duty.assignedStudents && duty.assignedStudents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {duty.assignedStudents.map((assignment, sIdx) => {
                              const studentObj = students.find((s) => s.id === assignment.studentId);
                              return (
                                <div
                                  key={assignment.studentId || sIdx}
                                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                                    assignment.isCompleted
                                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                      : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    {/* Quick toggle completion checkbox */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStudentDuty(duty, assignment.studentId)}
                                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                        assignment.isCompleted
                                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                                      }`}
                                      title={assignment.isCompleted ? 'Đã hoàn thành - bấm để đổi' : 'Bấm để đánh dấu đã làm xong nhiệm vụ'}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                          {assignment.studentName}
                                        </h5>
                                        {studentObj && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            Tổ {studentObj.group}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-0.5 flex items-start gap-1">
                                        <span className="shrink-0">👉</span>
                                        <span>{assignment.specificTask}</span>
                                      </p>

                                      {assignment.note && (
                                        <p className="text-[10px] text-slate-400 dark:text-slate-400 italic mt-0.5">
                                          Lưu ý: {assignment.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      assignment.isCompleted
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {assignment.isCompleted ? 'Xong' : 'Chờ làm'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Chưa phân công chi tiết đến từng học sinh cho ca trực {slotDisplayName}.
                            </span>
                            {(role === 'gvcn' || role === 'csl') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDuty(duty);
                                  setIsEditDutyModalOpen(true);
                                }}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Phân công đầu việc ngay</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* General Checklist & Notes */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-500 dark:text-slate-400">Đầu việc chung:</span>
                          {duty.tasks.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                            >
                              <CheckSquare className="w-3 h-3 text-slate-400" />
                              {t}
                            </span>
                          ))}
                        </div>

                        {duty.notes && (
                          <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 self-start sm:self-auto">
                            <Info className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{duty.notes}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Duty Modal */}
      <EditDutyModal
        isOpen={isEditDutyModalOpen}
        duty={editingDuty}
        students={students}
        onClose={() => {
          setIsEditDutyModalOpen(false);
          setEditingDuty(null);
        }}
        onSave={(updatedDuty) => {
          if (onSaveDuty) {
            onSaveDuty(updatedDuty);
          }
        }}
      />

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
