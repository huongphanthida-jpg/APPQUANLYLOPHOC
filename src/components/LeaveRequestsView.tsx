import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Search,
  Plus,
  RotateCcw,
  Trash2,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { Student, UserRole, ClassInfo, LeaveRequest } from '../types';
import { getPersistedStudents } from '../lib/storage';
import { ConfirmModal } from './ConfirmModal';

export type StudentGroupKey = 'elite' | 'development' | 'support' | 'foundation';

interface LeaveRequestsViewProps {
  leaveRequests?: LeaveRequest[];
  onApproveLeave?: (id: string, note?: string) => void;
  onRejectLeave?: (id: string, note?: string) => void;
  onDeleteLeave?: (id: string) => void;
  onOpenAddLeave?: () => void;
  role?: UserRole;
  currentStudentId?: string;
  students?: Student[];
  classInfo?: ClassInfo;
}

// Group Metadata Specification
export const GROUP_META: Record<
  StudentGroupKey,
  {
    title: string;
    subtitle: string;
    badge: string;
    badgeStyle: string;
    color: string;
    borderColor: string;
    cardBg: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  elite: {
    title: 'Học Sinh Ưu Tú',
    subtitle: 'Cả 6 môn ≥ 9.0 & Không môn nào < 6.5',
    badge: '🌟 Ưu Tú (≥9.0)',
    badgeStyle: 'bg-amber-500 text-slate-950 border-amber-400 font-bold',
    color: 'text-amber-800',
    borderColor: 'border-amber-300',
    cardBg: 'bg-amber-50/50',
    icon: Award,
  },
  development: {
    title: 'Học Sinh Phát Triển',
    subtitle: 'Cả 6 môn ≥ 8.0 & Không môn nào < 6.5',
    badge: '🚀 Phát Triển (≥8.0)',
    badgeStyle: 'bg-blue-600 text-white border-blue-500 font-bold',
    color: 'text-blue-800',
    borderColor: 'border-blue-300',
    cardBg: 'bg-blue-50/50',
    icon: TrendingUp,
  },
  support: {
    title: 'Học Sinh Cần Được Hỗ Trợ',
    subtitle: 'Có từ 2 môn trở lên bị điểm < 5.0',
    badge: '⚠️ Cần Hỗ Trợ (<5.0)',
    badgeStyle: 'bg-rose-600 text-white border-rose-500 font-bold',
    color: 'text-rose-800',
    borderColor: 'border-rose-300',
    cardBg: 'bg-rose-50/50',
    icon: AlertTriangle,
  },
  foundation: {
    title: 'Học Sinh Nền Tảng',
    subtitle: 'Các học sinh còn lại giữ vững phong độ',
    badge: '🌿 Nền Tảng',
    badgeStyle: 'bg-emerald-600 text-white border-emerald-500 font-bold',
    color: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    cardBg: 'bg-emerald-50/50',
    icon: ShieldCheck,
  },
};

// 1. Classification Logic according to 6 core subject average scores
export const classifyStudentByGrades = (grades: number[]): StudentGroupKey => {
  if (!grades || grades.length === 0) return 'foundation';
  const belowFiveCount = grades.filter((g) => g < 5.0).length;
  if (belowFiveCount > 1) {
    return 'support'; // Hơn 1 môn < 5
  }
  const allGte9 = grades.every((g) => g >= 9.0);
  const noneLt65 = grades.every((g) => g >= 6.5);
  if (allGte9 && noneLt65) {
    return 'elite'; // Cả 6 môn >= 9.0 và không môn nào < 6.5
  }
  const allGte8 = grades.every((g) => g >= 8.0);
  if (allGte8 && noneLt65) {
    return 'development'; // Cả 6 môn >= 8.0 và không môn nào < 6.5
  }
  return 'foundation'; // Nhóm còn lại
};

export const LeaveRequestsView: React.FC<LeaveRequestsViewProps> = ({
  role = 'gvcn',
  students: propStudents,
  classInfo = {
    className: 'LỚP 11D5',
    schoolYear: '2026 - 2027',
    schoolName: 'THPT TRẦN NGUYÊN HÃN',
    homeroomTeacher: 'Cô Phan Thị Dạ Hương',
    totalStudents: 42,
    groupCount: 4,
    avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300',
  },
}) => {
  // Load students from props or persistent storage
  const allStudents: Student[] = (propStudents && propStudents.length > 0) ? propStudents : getPersistedStudents();

  // Customizations Map: studentId -> StudentGroupKey
  const [customizations, setCustomizations] = useState<Record<string, StudentGroupKey>>(() => {
    try {
      const saved = localStorage.getItem('app_student_group_customizations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // UI Filter & View States
  const [activeTab, setActiveTab] = useState<'all' | StudentGroupKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Add Student to Group
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetGroupForModal, setTargetGroupForModal] = useState<StudentGroupKey>('elite');
  const [modalSearch, setModalSearch] = useState('');

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save Customizations Helper
  const saveCustomizationsToStorage = (updatedMap: Record<string, StudentGroupKey>) => {
    setCustomizations(updatedMap);
    try {
      localStorage.setItem('app_student_group_customizations', JSON.stringify(updatedMap));
    } catch (e) {
      console.error('Lỗi khi lưu phân nhóm học sinh:', e);
    }
  };

  // Extract 6 core subject average scores for a student
  const getStudent6Grades = (student: Student) => {
    const g = student.grades || {};
    return [
      g.math?.avg ?? 8.5,
      g.physics?.avg ?? 8.5,
      g.chemistry?.avg ?? 8.5,
      g.biology?.avg ?? 8.5,
      g.english?.avg ?? 8.5,
      g.literature?.avg ?? 8.5,
    ];
  };

  // Determine effective group for a student (Customization override > Automatic classification)
  const getEffectiveGroup = (student: Student): StudentGroupKey => {
    if (customizations[student.id]) {
      return customizations[student.id];
    }
    const grades = getStudent6Grades(student);
    return classifyStudentByGrades(grades);
  };

  // Calculate Group Counts
  const groupedStudents = allStudents.reduce(
    (acc, s) => {
      const groupKey = getEffectiveGroup(s);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(s);
      return acc;
    },
    { elite: [], development: [], support: [], foundation: [] } as Record<StudentGroupKey, Student[]>
  );

  // Filter students based on active tab and search query
  const getDisplayStudents = (groupKey: StudentGroupKey) => {
    const list = groupedStudents[groupKey] || [];
    return list.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        `tổ ${s.group}`.includes(q)
      );
    });
  };

  // Action: Manually Move / Change Student Group
  const handleAssignStudentGroup = (studentId: string, newGroup: StudentGroupKey) => {
    const updated = { ...customizations, [studentId]: newGroup };
    saveCustomizationsToStorage(updated);
    showToast(`Đã chuyển học sinh sang nhóm "${GROUP_META[newGroup].title}"!`);
  };

  // Action: Remove Student from current group (resets customization or moves to foundation)
  const handleRemoveFromGroup = (student: Student) => {
    setConfirmAction({
      isOpen: true,
      title: 'Gỡ Học Sinh Khỏi Nhóm',
      message: `Bạn có chắc chắn muốn gỡ thủ công em ${student.name} (${student.code}) ra khỏi nhóm hiện tại?`,
      onConfirm: () => {
        const updated = { ...customizations };
        delete updated[student.id]; // Reset to automatic
        saveCustomizationsToStorage(updated);
        showToast(`Đã gỡ học sinh ${student.name} thành công!`);
      },
    });
  };

  // Action: Recalculate all groupings based on gradebook (Reset Customizations)
  const handleRecalculateFromGradebook = () => {
    setConfirmAction({
      isOpen: true,
      title: 'Tính Lại Phân Nhóm Theo Bảng Điểm',
      message: 'Hệ thống sẽ quét lại toàn bộ điểm số 6 môn học TBM để thiết lập lại phân nhóm tự động ban đầu và xóa bỏ các tùy chỉnh thủ công. Bạn có chắc chắn không?',
      onConfirm: () => {
        saveCustomizationsToStorage({});
        showToast('Đã tính toán lại phân nhóm tự động từ Bảng Điểm TBM!');
      },
    });
  };

  // Candidates for Modal "+ Thêm Học Sinh Vào Nhóm"
  const modalCandidates = allStudents.filter((s) => {
    const currentGroup = getEffectiveGroup(s);
    if (currentGroup === targetGroupForModal) return false; // Exclude students already in this group
    const q = modalSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      `tổ ${s.group}`.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#003366] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce text-sm font-semibold border border-amber-400">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={confirmAction.onConfirm}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header & Controls Bar - 1 Single Horizontal Row */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold border border-blue-100">
            <GraduationCap className="w-6 h-6 text-[#003366]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              Phân Nhóm Học Sinh {classInfo?.className || ''}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                Tổng sĩ số: {allStudents.length} Học Sinh
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Phân loại 4 nhóm tự động dựa trên điểm số 6 môn học (Toán, Lý, Hóa, Sinh, Anh, Văn).</span>
            </p>
          </div>
        </div>

        {/* Actions & Search Box */}
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học sinh, mã HS, tổ..."
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

          {(role === 'gvcn' || role === 'bgh') && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTargetGroupForModal(activeTab === 'all' ? 'elite' : activeTab);
                  setShowAddModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-amber-400"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>+ Thêm Học Sinh Vào Nhóm</span>
              </button>

              <button
                type="button"
                onClick={handleRecalculateFromGradebook}
                className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-blue-900"
                title="Quét lại tự động từ Bảng Điểm TBM"
              >
                <RotateCcw className="w-4 h-4 text-cyan-300" />
                <span>Tính Lại Theo Bảng Điểm</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Statistics Cards for 4 Groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(GROUP_META) as StudentGroupKey[]).map((key) => {
          const meta = GROUP_META[key];
          const IconComponent = meta.icon;
          const count = groupedStudents[key]?.length || 0;
          const isSelectedTab = activeTab === key;

          return (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
                isSelectedTab
                  ? 'ring-2 ring-[#003366] bg-white border-[#003366] shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className={`p-2.5 rounded-xl border ${meta.cardBg} ${meta.borderColor}`}>
                  <IconComponent className={`w-5 h-5 ${meta.color}`} />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${meta.badgeStyle}`}>
                  {count} Học sinh
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{meta.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{meta.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 flex-wrap gap-2">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#003366] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất Cả 4 Nhóm ({allStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('elite')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'elite'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌟 Ưu Tú ({groupedStudents.elite?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('development')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'development'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 Phát Triển ({groupedStudents.development?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚠️ Cần Hỗ Trợ ({groupedStudents.support?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('foundation')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'foundation'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌿 Nền Tảng ({groupedStudents.foundation?.length || 0})
          </button>
        </div>

        <div className="text-xs text-slate-500 px-2 font-medium">
          Đã tùy chỉnh thủ công: <strong className="text-[#003366] font-bold">{Object.keys(customizations).length} em</strong>
        </div>
      </div>

      {/* DISPLAY GROUPS CONTENT */}
      {(['elite', 'development', 'support', 'foundation'] as StudentGroupKey[]).map((groupKey) => {
        if (activeTab !== 'all' && activeTab !== groupKey) return null;

        const meta = GROUP_META[groupKey];
        const displayList = getDisplayStudents(groupKey);
        const IconComponent = meta.icon;

        return (
          <section key={groupKey} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${meta.cardBg} ${meta.borderColor}`}>
                  <IconComponent className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {meta.title}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.badgeStyle}`}>
                      {displayList.length} Học Sinh
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">{meta.subtitle}</p>
                </div>
              </div>

              {(role === 'gvcn' || role === 'bgh') && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetGroupForModal(groupKey);
                    setShowAddModal(true);
                  }}
                  className="text-xs font-bold text-[#003366] hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm học sinh vào nhóm này</span>
                </button>
              )}
            </div>

            {/* List of Student Cards in this Group */}
            {displayList.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500 font-medium">Không có học sinh nào trong nhóm này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayList.map((student) => {
                  const grades = student.grades || {};
                  const isCustomized = !!customizations[student.id];

                  const mathAvg = grades.math?.avg ?? 8.5;
                  const phyAvg = grades.physics?.avg ?? 8.5;
                  const chemAvg = grades.chemistry?.avg ?? 8.5;
                  const bioAvg = grades.biology?.avg ?? 8.5;
                  const engAvg = grades.english?.avg ?? 8.5;
                  const litAvg = grades.literature?.avg ?? 8.5;
                  const gpa = grades.gpa ?? 8.5;

                  const subjectList = [
                    { name: 'Toán', score: mathAvg },
                    { name: 'Lý', score: phyAvg },
                    { name: 'Hóa', score: chemAvg },
                    { name: 'Sinh', score: bioAvg },
                    { name: 'Anh', score: engAvg },
                    { name: 'Văn', score: litAvg },
                  ];

                  return (
                    <div
                      key={student.id}
                      className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${meta.cardBg} ${meta.borderColor} hover:shadow-xs`}
                    >
                      <div>
                        {/* Student Profile Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{student.name}</span>
                                {isCustomized && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300" title="Đã chỉnh sửa thủ công">
                                    Thủ công
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                <span className="font-mono">{student.code}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-700">Tổ {student.group}</span>
                              </div>
                            </div>
                          </div>

                          {/* GPA Badge */}
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-[#003366] shadow-2xs">
                              GPA: {gpa.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* 6 Subject Scores Grid */}
                        <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/80 mb-3 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Điểm 6 Môn Học TBM</span>
                            <span className="text-slate-500">Môn &lt;5.0 in đỏ</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {subjectList.map((sub) => {
                              const isLow = sub.score < 5.0;
                              return (
                                <div
                                  key={sub.name}
                                  className={`p-1.5 rounded-lg border text-center text-xs ${
                                    isLow
                                      ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold animate-pulse'
                                      : 'bg-slate-50 text-slate-800 border-slate-200'
                                  }`}
                                >
                                  <div className="text-[10px] text-slate-500">{sub.name}</div>
                                  <div className={`font-mono text-xs font-bold ${isLow ? 'text-rose-700' : 'text-slate-900'}`}>
                                    {sub.score.toFixed(1)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      {(role === 'gvcn' || role === 'bgh') && (
                        <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                          {/* Move Group Select */}
                          <select
                            value={groupKey}
                            onChange={(e) => handleAssignStudentGroup(student.id, e.target.value as StudentGroupKey)}
                            className="text-[11px] font-bold bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#003366] text-slate-700"
                            title="Đổi nhóm cho học sinh"
                          >
                            <option value="elite">🌟 Nhóm Ưu Tú</option>
                            <option value="development">🚀 Nhóm Phát Triển</option>
                            <option value="support">⚠️ Nhóm Cần Hỗ Trợ</option>
                            <option value="foundation">🌿 Nhóm Nền Tảng</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFromGroup(student)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Gỡ khỏi nhóm hiện tại"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* MODAL: THÊM HỌC SINH VÀO NHÓM THỦ CÔNG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#003366]">
                <UserCheck className="w-5 h-5 text-[#003366]" />
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Học Sinh Vào "{GROUP_META[targetGroupForModal].title}"
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Group Selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Nhóm Đích:</span>
              <select
                value={targetGroupForModal}
                onChange={(e) => setTargetGroupForModal(e.target.value as StudentGroupKey)}
                className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#003366] text-[#003366]"
              >
                <option value="elite">🌟 Học Sinh Ưu Tú (≥9.0)</option>
                <option value="development">🚀 Học Sinh Phát Triển (≥8.0)</option>
                <option value="support">⚠️ Học Sinh Cần Hỗ Trợ (&lt;5.0)</option>
                <option value="foundation">🌿 Học Sinh Nền Tảng</option>
              </select>
            </div>

            {/* Modal Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên học sinh hoặc mã HS..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white"
              />
            </div>

            {/* Candidates List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {modalCandidates.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Không tìm thấy học sinh phù hợp chưa có trong nhóm này.
                </div>
              ) : (
                modalCandidates.map((student) => {
                  const currentGrp = getEffectiveGroup(student);
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {student.code} • Tổ {student.group} • Hiện tại: {GROUP_META[currentGrp].badge}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleAssignStudentGroup(student.id, targetGroupForModal);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        + Thêm Vào Nhóm
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
