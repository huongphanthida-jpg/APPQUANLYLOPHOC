import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  MessageSquare,
  Phone,
  Mail,
  Users,
  Calendar,
  Sparkles,
  Send,
  Plus,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Video,
  MapPin,
  FileText,
  Download,
  AlertCircle,
  Share2,
  Paperclip,
  Check,
  Award,
  ArrowRight,
  UserCheck,
  Smile,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  X,
  Trash2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Student,
  UserRole,
  ClassInfo,
  TeacherInfo,
  ChatMessage,
  ParentMeeting,
  StudyPair,
  SeatingChartData,
  OnlineClass,
} from '../types';
import { exportPresentationPptx } from '../utils/pptxExport';

interface DeleteConfirmState {
  title: string;
  message: string;
  actionLabel?: string;
  onConfirm: () => void;
}

interface ConnectViewProps {
  students: Student[];
  role: UserRole;
  currentStudentId?: string;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onDeleteMessage?: (messageId: string) => void;
  onClearChannelMessages?: (channelId: string) => void;
  onClearAllMessages?: () => void;
  meetings: ParentMeeting[];
  onAddMeeting: (meeting: Omit<ParentMeeting, 'id'>) => void;
  onUpdateMeetingStatus: (id: string, status: ParentMeeting['status']) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onClearCompletedMeetings?: () => void;
  studyPairs: StudyPair[];
  onAddStudyPair: (pair: Omit<StudyPair, 'id'>) => void;
  onDeleteStudyPair?: (pairId: string) => void;
  onClearAllStudyPairs?: () => void;
  onNavigateToSeating?: () => void;
  onSelectStudent?: (student: Student) => void;
  onlineClasses?: OnlineClass[];
  onOpenOnlineClassModal?: () => void;
}

export const ConnectView: React.FC<ConnectViewProps> = ({
  students,
  role,
  currentStudentId,
  classInfo = {
    className: '12A1',
    schoolYear: '2025 - 2026',
    schoolName: 'THPT Trần Nguyên Hãn',
    homeroomTeacher: 'Nguyễn Văn Cừ',
    totalStudents: 35,
    groupCount: 4,
  },
  teacherInfo = {
    name: 'ThS. Nguyễn Văn Cừ',
    subject: 'Toán Học & GVCN',
    phone: '0912.345.678',
    email: 'nguyenvancu.gvcn@thpt-trannguyenhan.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  },
  messages,
  onSendMessage,
  onDeleteMessage,
  onClearChannelMessages,
  onClearAllMessages,
  meetings,
  onAddMeeting,
  onUpdateMeetingStatus,
  onDeleteMeeting,
  onClearCompletedMeetings,
  studyPairs,
  onAddStudyPair,
  onDeleteStudyPair,
  onClearAllStudyPairs,
  onNavigateToSeating,
  onSelectStudent,
  onlineClasses = [],
  onOpenOnlineClassModal,
}) => {
  const [activeTab, setActiveTab] = useState<'messenger' | 'contacts' | 'studypairs' | 'meetings' | 'hotline'>('messenger');
  const [selectedChannel, setSelectedChannel] = useState<string>('class_general');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isNewPairModalOpen, setIsNewPairModalOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [viewingContactStudent, setViewingContactStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // New Meeting Form State
  const [newMeetingStudentId, setNewMeetingStudentId] = useState<string>(students[0]?.id || '');
  const [newMeetingDate, setNewMeetingDate] = useState('2026-08-30');
  const [newMeetingTime, setNewMeetingTime] = useState('16:30 - 17:00');
  const [newMeetingType, setNewMeetingType] = useState<'direct' | 'online'>('direct');
  const [newMeetingTopic, setNewMeetingTopic] = useState('');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Phòng Tiếp PH - Nhà A (P.102)');

  // New Study Pair Form State
  const [pairStudent1Id, setPairStudent1Id] = useState<string>(students[0]?.id || '');
  const [pairStudent2Id, setPairStudent2Id] = useState<string>(students[1]?.id || '');
  const [pairDeskLabel, setPairDeskLabel] = useState('Dãy 1 • Bàn 2');
  const [pairGoal, setPairGoal] = useState('Cùng đạt 9.0+ khối A00 và hỗ trợ giải bài tập khó');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student Map
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Current user's student if in student/parent mode
  const currentStudent = currentStudentId ? studentMap.get(currentStudentId) : students[0];

  // Channels definition
  const channels = [
    {
      id: 'class_general',
      name: `📢 Kênh Chung ${classInfo?.className || '12A1'}`,
      sub: 'Toàn bộ GVCN, Học sinh & Phụ huynh',
      badge: 'Chung',
      color: 'bg-blue-500',
    },
    {
      id: 'parents_forum',
      name: '👨‍👩‍👧‍👦 Diễn Đàn Phụ Huynh',
      sub: 'Trao đổi giữa GVCN và Hội Cha Mẹ Học Sinh',
      badge: 'Phụ huynh',
      color: 'bg-emerald-500',
    },
    {
      id: 'group_1',
      name: '👥 Kênh Tổ 1 (Dãy 1)',
      sub: 'Thảo luận học tập & thi đua Tổ 1',
      badge: 'Tổ 1',
      color: 'bg-indigo-500',
    },
    {
      id: 'group_2',
      name: '👥 Kênh Tổ 2 (Dãy 2)',
      sub: 'Thảo luận học tập & thi đua Tổ 2',
      badge: 'Tổ 2',
      color: 'bg-teal-500',
    },
    {
      id: 'group_3',
      name: '👥 Kênh Tổ 3 (Dãy 3)',
      sub: 'Thảo luận học tập & thi đua Tổ 3',
      badge: 'Tổ 3',
      color: 'bg-amber-500',
    },
    {
      id: 'group_4',
      name: '👥 Kênh Tổ 4 (Dãy 4)',
      sub: 'Thảo luận học tập & thi đua Tổ 4',
      badge: 'Tổ 4',
      color: 'bg-purple-500',
    },
  ];

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (selectedChannel.startsWith('student_')) {
      const targetStudentId = selectedChannel.replace('student_', '');
      return messages.filter(
        (m) =>
          m.channelId === selectedChannel ||
          m.senderId === targetStudentId ||
          m.receiverId === targetStudentId
      );
    }
    return messages.filter((m) => m.channelId === selectedChannel);
  }, [messages, selectedChannel]);

  // Filtered Contacts for directory
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.emergencyContact.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.emergencyContact.phone.includes(searchQuery);

      const matchGroup = selectedGroupFilter === 'all' || s.group === selectedGroupFilter;

      return matchSearch && matchGroup;
    });
  }, [students, searchQuery, selectedGroupFilter]);

  // Current channel info
  const currentChannelObj = useMemo(() => {
    if (selectedChannel.startsWith('student_')) {
      const sId = selectedChannel.replace('student_', '');
      const student = studentMap.get(sId);
      return {
        name: student ? `Trao đổi với học sinh ${student.name}` : 'Kênh riêng học sinh',
        isDirect: true,
      };
    }
    const ch = channels.find((c) => c.id === selectedChannel);
    return {
      name: ch?.name || 'Kênh Trao Đổi',
      isDirect: false,
    };
  }, [selectedChannel, channels, studentMap]);

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    let senderName = teacherInfo.name;
    let senderRole: 'gvcn' | 'parent' | 'student' = 'gvcn';
    let senderAvatar = teacherInfo.avatar;
    let senderId = 'gvcn';

    if (role === 'student' && currentStudent) {
      senderName = currentStudent.name;
      senderRole = 'student';
      senderAvatar = currentStudent.avatar;
      senderId = currentStudent.id;
    } else if (role === 'parent' && currentStudent) {
      senderName = `PH em ${currentStudent.name} (${currentStudent.emergencyContact.parentName})`;
      senderRole = 'parent';
      senderAvatar = currentStudent.avatar;
      senderId = `parent_${currentStudent.id}`;
    }

    onSendMessage({
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      content: messageInput.trim(),
      channelId: selectedChannel,
      receiverId: selectedChannel.startsWith('student_')
        ? selectedChannel.replace('student_', '')
        : undefined,
    });

    setMessageInput('');
  };

  // Quick message template
  const insertTemplate = (text: string) => {
    setMessageInput(text);
  };

  // Delete message handler with confirmation
  const handleDeleteSingleMessage = (msg: ChatMessage) => {
    setDeleteConfirm({
      title: 'Xóa tin nhắn',
      message: `Thầy/Cô có chắc chắn muốn xóa tin nhắn của "${msg.senderName}": "${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}"?`,
      actionLabel: 'Xóa Tin Nhắn',
      onConfirm: () => {
        onDeleteMessage?.(msg.id);
        setDeleteConfirm(null);
        showToast('Đã xóa tin nhắn thành công!');
      },
    });
  };

  // Clear current channel messages
  const handleClearCurrentChannel = () => {
    const channelName = currentChannelObj.name;
    const msgCount = filteredMessages.length;
    if (msgCount === 0) {
      showToast('Kênh hiện tại chưa có tin nhắn nào để xóa.');
      return;
    }
    setDeleteConfirm({
      title: 'Xóa lịch sử tin nhắn trong kênh',
      message: `Thầy/Cô có chắc chắn muốn xóa toàn bộ ${msgCount} tin nhắn trong ${channelName}? Dữ liệu sau khi xóa sẽ không thể phục hồi.`,
      actionLabel: 'Xóa Toàn Bộ Tin Nhắn Kênh',
      onConfirm: () => {
        onClearChannelMessages?.(selectedChannel);
        setDeleteConfirm(null);
        showToast(`Đã xóa sạch tin nhắn trong ${channelName}!`);
      },
    });
  };

  // Delete meeting handler
  const handleDeleteMeeting = (meeting: ParentMeeting) => {
    setDeleteConfirm({
      title: 'Xóa lịch hẹn trao đổi phụ huynh',
      message: `Thầy/Cô có chắc chắn muốn xóa lịch hẹn trao đổi với phụ huynh em "${meeting.studentName}" (${meeting.meetingDate} lúc ${meeting.meetingTime})?`,
      actionLabel: 'Xóa Lịch Hẹn',
      onConfirm: () => {
        onDeleteMeeting?.(meeting.id);
        setDeleteConfirm(null);
        showToast('Đã xóa lịch hẹn gặp phụ huynh!');
      },
    });
  };

  // Delete completed/cancelled meetings
  const handleClearFinishedMeetings = () => {
    const finishedCount = meetings.filter(
      (m) => m.status === 'completed' || m.status === 'cancelled'
    ).length;
    if (finishedCount === 0) {
      showToast('Không có lịch hẹn nào đã hoàn thành hoặc đã hủy để dọn dẹp.');
      return;
    }
    setDeleteConfirm({
      title: 'Dọn dẹp lịch hẹn đã xong / đã hủy',
      message: `Thầy/Cô có chắc chắn muốn xóa tất cả ${finishedCount} lịch hẹn đã hoàn thành hoặc đã hủy?`,
      actionLabel: 'Dọn Dẹp Lịch Hẹn',
      onConfirm: () => {
        onClearCompletedMeetings?.();
        setDeleteConfirm(null);
        showToast(`Đã dọn dẹp ${finishedCount} lịch hẹn cũ!`);
      },
    });
  };

  // Delete study pair handler
  const handleDeletePair = (pair: StudyPair) => {
    setDeleteConfirm({
      title: 'Hủy ghép cặp Đôi bạn cùng tiến',
      message: `Thầy/Cô có chắc chắn muốn xóa / hủy ghép cặp đôi bạn cùng tiến giữa hai học sinh "${pair.student1.name}" và "${pair.student2.name}" (${pair.deskLabel})?`,
      actionLabel: 'Hủy Ghép Cặp',
      onConfirm: () => {
        onDeleteStudyPair?.(pair.id);
        setDeleteConfirm(null);
        showToast('Đã hủy liên kết đôi bạn cùng tiến!');
      },
    });
  };

  // Clear all study pairs
  const handleClearAllPairs = () => {
    if (studyPairs.length === 0) {
      showToast('Chưa có cặp đôi nào được ghép để xóa.');
      return;
    }
    setDeleteConfirm({
      title: 'Xóa toàn bộ danh sách Đôi bạn cùng tiến',
      message: `Thầy/Cô có chắc chắn muốn xóa toàn bộ ${studyPairs.length} cặp Đôi bạn cùng tiến trong lớp?`,
      actionLabel: 'Xóa Toàn Bộ Ghép Cặp',
      onConfirm: () => {
        onClearAllStudyPairs?.();
        setDeleteConfirm(null);
        showToast('Đã xóa toàn bộ danh sách Đôi bạn cùng tiến!');
      },
    });
  };

  // Submit new meeting
  const handleSubmitNewMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentMap.get(newMeetingStudentId);
    if (!student) return;

    onAddMeeting({
      studentId: student.id,
      studentName: student.name,
      parentName: student.emergencyContact.parentName,
      parentPhone: student.emergencyContact.phone,
      meetingDate: newMeetingDate,
      meetingTime: newMeetingTime,
      meetingType: newMeetingType,
      topic: newMeetingTopic || 'Trao đổi kết quả học tập và rèn luyện đợt 1',
      locationOrLink: newMeetingLocation || 'Phòng Tiếp PH - Nhà A (P.102)',
      status: 'pending',
      teacherNotes: 'Đề nghị PH mang theo học bạ/phiếu điểm và sổ liên lạc',
    });

    setIsNewMeetingModalOpen(false);
    setNewMeetingTopic('');
    showToast('Đã lên lịch hẹn gặp Phụ huynh thành công!');
  };

  // Submit new study pair
  const handleSubmitNewStudyPair = (e: React.FormEvent) => {
    e.preventDefault();
    const s1 = studentMap.get(pairStudent1Id);
    const s2 = studentMap.get(pairStudent2Id);
    if (!s1 || !s2 || s1.id === s2.id) {
      showToast('Vui lòng chọn 2 học sinh khác nhau!');
      return;
    }

    onAddStudyPair({
      student1: {
        id: s1.id,
        name: s1.name,
        strongSubject: s1.strengths || 'Toán & Lý',
        gpa: s1.grades.math.avg,
      },
      student2: {
        id: s2.id,
        name: s2.name,
        strongSubject: s2.strengths || 'Hóa & Anh',
        gpa: s2.grades.chemistry.avg,
      },
      deskLabel: pairDeskLabel || 'Dãy 1 • Bàn 2',
      status: 'active',
      targetGoal: pairGoal || 'Cùng đạt 9.0+ khối A00 và hỗ trợ giải bài tập khó',
      progressNote: 'Đã hoàn thành 5 đề toán khảo sát đầu năm và kèm bài tập tự học',
    });

    setIsNewPairModalOpen(false);
    showToast('Đã ghép nối Đôi bạn cùng tiến thành công!');
  };

  const isGVCN = role === 'gvcn' || role === 'bgh';

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-blue-900/40 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-60 h-60 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Information - Full Width Horizontal */}
        <div className="relative z-10 flex flex-col gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl bg-white/15 text-[#98FF98] border border-white/20 flex items-center gap-1.5 shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5" />
              CỔNG KẾT NỐI ĐA CHIỀU • SỔ LIÊN LẠC ĐIỆN TỬ
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              {classInfo?.className || 'Lớp 12A1'} • {classInfo?.schoolName || 'THPT Trần Nguyên Hãn'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
            Kênh Kết Nối Giáo Viên - Phụ Huynh - Học Sinh
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-5xl">
            Hệ thống kết nối trực tuyến 24/7, nhắn tin tương tác tức thì, đặt lịch trao đổi chuyên sâu, phân quyền quản lý và xóa dữ liệu cho Giáo viên chủ nhiệm.
          </p>
        </div>

        {/* Action buttons bar */}
        <div className="relative z-10 flex items-center justify-start lg:justify-end gap-2.5 flex-wrap pt-0.5">
          {onNavigateToSeating && (
            <button
              type="button"
              onClick={onNavigateToSeating}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <LayoutGrid className="w-4 h-4 text-[#98FF98]" />
              <span>Xem Sơ Đồ Lớp (4 Dãy)</span>
            </button>
          )}

          {isGVCN && (
            <>
              <button
                type="button"
                onClick={() => {
                  exportPresentationPptx({
                    type: 'parent_meeting',
                    classInfo: classInfo || {
                      className: '12A1',
                      schoolName: 'THPT TRẦN NGUYÊN HÃN',
                      academicYear: 'Niên khóa 2023 - 2026',
                      avatar: '',
                    },
                    teacherInfo: teacherInfo || {
                      name: 'Thầy Nguyễn Văn An',
                      title: 'GVCN Lớp 12A1',
                      avatar: '',
                      phone: '0912.345.678',
                      email: 'nguyenvanan@tnh.edu.vn',
                      subject: 'Toán',
                    },
                    students,
                  });
                  showToast('Đã xuất thành công tệp Trình chiếu PowerPoint Họp Phụ Huynh (.pptx)!');
                }}
                className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Xuất bài trình chiếu PowerPoint (.pptx) chuẩn Họp Phụ Huynh"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Xuất Slide PowerPoint (.pptx)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDataManagementOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                title="Quản lý và xóa dữ liệu kênh kết nối dành cho GVCN"
              >
                <Trash2 className="w-4 h-4 text-rose-300" />
                <span>Quản Lý Xóa Dữ Liệu</span>
              </button>

              {onOpenOnlineClassModal && (
                <button
                  type="button"
                  onClick={onOpenOnlineClassModal}
                  className="px-4 py-2 rounded-2xl bg-[#98FF98] hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-slate-950" />
                  <span>DB Lớp Trực Tuyến ({onlineClasses.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsNewMeetingModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt Lịch Hẹn PH</span>
              </button>
            </>
          )}
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/15 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('messenger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'messenger'
                ? 'bg-white text-[#003366] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kênh Tin Nhắn & Trao Đổi</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'contacts'
                ? 'bg-white text-[#003366] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Danh Bạ & Sổ Liên Lạc ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studypairs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'studypairs'
                ? 'bg-white text-[#003366] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Đôi Bạn Cùng Tiến ({studyPairs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meetings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'meetings'
                ? 'bg-white text-[#003366] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch Trao Đổi PH ({meetings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'hotline'
                ? 'bg-white text-[#003366] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Đường Dây Nóng 24/7</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MESSENGER & DIRECT COMMUNICATION */}
      {activeTab === 'messenger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Channel list on the left */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col h-[640px]">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#003366]" />
                Kênh Trao Đổi & Nhóm Lớp
              </h3>
              <p className="text-[11px] text-slate-500">Chọn nhóm để bắt đầu gửi thông điệp kết nối</p>
            </div>

            {/* Quick search channel */}
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Kênh Chung & Nhóm Tổ
              </div>

              {channels.map((ch) => {
                const isSelected = selectedChannel === ch.id;
                const unreadCount = messages.filter((m) => m.channelId === ch.id).length;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#003366] text-white shadow-md'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${ch.color}`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{ch.name}</p>
                        <p
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {ch.sub}
                        </p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Direct channels with students */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-3 pb-1">
                Nhắn Tin Trực Tiếp Học Sinh (1-1)
              </div>

              {students.slice(0, 10).map((s) => {
                const chId = `student_${s.id}`;
                const isSelected = selectedChannel === chId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedChannel(chId)}
                    className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#003366] text-white shadow-md'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{s.name}</p>
                        <p
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          Tổ {s.group} • {s.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window on the right */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[640px] overflow-hidden">
            {/* Chat header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#003366] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#98FF98]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {currentChannelObj.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    Đồng bộ trực tuyến • {filteredMessages.length} tin nhắn trong kênh
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isGVCN && (
                  <button
                    type="button"
                    onClick={handleClearCurrentChannel}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200/60"
                    title="Xóa toàn bộ tin nhắn trong kênh này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Xóa Lịch Sử Kênh</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Hẹn gặp PH</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-semibold text-slate-600">Chưa có tin nhắn nào trong kênh này</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Hãy gửi tin nhắn đầu tiên để khởi tạo kết nối trao đổi với học sinh và phụ huynh!
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMe =
                    (role === 'gvcn' && msg.senderRole === 'gvcn') ||
                    (role === 'student' && msg.senderRole === 'student') ||
                    (role === 'parent' && msg.senderRole === 'parent');

                  return (
                    <div
                      key={msg.id}
                      className={`group relative flex gap-3 max-w-[85%] ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <img
                        src={
                          msg.senderAvatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
                        }
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                              msg.senderRole === 'gvcn'
                                ? 'bg-blue-100 text-[#003366]'
                                : msg.senderRole === 'parent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {msg.senderRole.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>

                        <div className="relative group/bubble flex items-center gap-1.5">
                          {/* Message Content Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#003366] text-white rounded-tr-xs shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {/* Delete Action Button for GVCN or Sender */}
                          {(isGVCN || isMe) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSingleMessage(msg)}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 shrink-0 ${
                                isMe ? 'order-first' : 'order-last'
                              }`}
                              title="Xóa tin nhắn này (Dành cho GVCN)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Template Chips */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Mẫu nhanh:</span>
              <button
                type="button"
                onClick={() =>
                  insertTemplate('Kính gửi Quý phụ huynh, nhà trường đã cập nhật kết quả khảo sát Khối A đợt 2.')
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#003366] text-slate-600 transition-colors whitespace-nowrap"
              >
                📊 Kết quả khảo sát
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTemplate('Nhắc nhở học sinh chuẩn bị đầy đủ dụng cụ học tập và làm bài tập về nhà đúng hạn.')
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#003366] text-slate-600 transition-colors whitespace-nowrap"
              >
                📚 Nhắc bài tập
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTemplate('Kính mời Quý phụ huynh tham dự buổi trao đổi định hướng ôn thi Đại học sắp tới.')
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#003366] text-slate-600 transition-colors whitespace-nowrap"
              >
                📅 Thư mời họp PH
              </button>
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Nhập nội dung trao đổi kết nối (GVCN, Phụ huynh, Học sinh)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white shadow-md transition-transform active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT DIRECTORY & DIGITAL CONTACT BOOK */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên học sinh, mã số, phụ huynh, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Lọc theo Tổ:</span>
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGroupFilter === 'all'
                    ? 'bg-[#003366] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất Cả ({students.length})
              </button>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroupFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGroupFilter === g
                      ? 'bg-[#003366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tổ {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-500">
                        Mã: <span className="font-mono font-semibold">{s.code}</span> • Tổ {s.group}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#003366] border border-blue-100">
                    Bàn {s.group}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <p className="text-slate-600 flex items-center justify-between">
                    <span className="text-slate-400">Phụ huynh:</span>
                    <span className="font-bold text-slate-800">
                      {s.emergencyContact.parentName} ({s.emergencyContact.relationship})
                    </span>
                  </p>
                  <p className="text-slate-600 flex items-center justify-between">
                    <span className="text-slate-400">Điện thoại PH:</span>
                    <span className="font-mono font-bold text-blue-700">{s.emergencyContact.phone}</span>
                  </p>
                  <p className="text-slate-600 flex items-center justify-between">
                    <span className="text-slate-400">Điểm TB Toán:</span>
                    <span className="font-extrabold text-emerald-700">{s.grades.math.avg}</span>
                  </p>
                </div>

                {/* Quick Action buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <a
                    href={`tel:${s.emergencyContact.phone.replace(/[^0-9]/g, '')}`}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi Điện</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChannel(`student_${s.id}`);
                      setActiveTab('messenger');
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Nhắn Tin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingContactStudent(s)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Xem chi tiết Sổ Liên Lạc Điện Tử"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDY PAIRS & MUTUAL ASSISTANCE (ĐÔI BẠN CÙNG TIẾN) */}
      {activeTab === 'studypairs' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 rounded-3xl border border-amber-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3" />
                MÔ HÌNH SƯ PHẠM KẾT NỐI
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Ghép Cặp & Phát Triển "Đôi Bạn Cùng Tiến" Lớp {classInfo?.className || '12A1'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kết nối 2 học sinh cùng bàn (hoặc khác tổ) để kèm cặp, chia sẻ phương pháp giải Toán - Lý - Hóa và cùng tiến bộ trong kỳ thi tốt nghiệp.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {isGVCN && studyPairs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPairs}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Xóa toàn bộ danh sách ghép đôi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Tất Cả Ghép Cặp</span>
                </button>
              )}

              {isGVCN && (
                <button
                  type="button"
                  onClick={() => setIsNewPairModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ghép Cặp Mới</span>
                </button>
              )}
            </div>
          </div>

          {studyPairs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Sparkles className="w-12 h-12 text-amber-300 mx-auto stroke-1" />
              <p className="text-base font-bold text-slate-700">Chưa có danh sách Đôi bạn cùng tiến nào</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Giáo viên chủ nhiệm có thể bấm "Ghép Cặp Mới" để liên kết học sinh khá giỏi với học sinh cần hỗ trợ.
              </p>
              {isGVCN && (
                <button
                  type="button"
                  onClick={() => setIsNewPairModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ghép Cặp Ngay</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyPairs.map((pair) => (
                <div
                  key={pair.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        📍 {pair.deskLabel}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          pair.status === 'achieved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pair.status === 'improving'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pair.status === 'achieved'
                          ? '🎉 Đạt Thành Tích'
                          : pair.status === 'improving'
                          ? '📈 Đang Tiến Bộ'
                          : '🔥 Đang Kèm Cặp'}
                      </span>
                    </div>

                    {/* 2 Students comparison */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-3 text-center">
                      <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <p className="text-xs font-bold text-slate-900 truncate">{pair.student1.name}</p>
                        <p className="text-[10px] text-blue-600 font-semibold truncate mt-0.5">
                          {pair.student1.strongSubject}
                        </p>
                        <p className="text-[11px] font-mono font-extrabold text-slate-700 mt-1">
                          GPA: {pair.student1.gpa}
                        </p>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <p className="text-xs font-bold text-slate-900 truncate">{pair.student2.name}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold truncate mt-0.5">
                          {pair.student2.strongSubject}
                        </p>
                        <p className="text-[11px] font-mono font-extrabold text-slate-700 mt-1">
                          GPA: {pair.student2.gpa}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <p className="text-[11px] font-bold text-slate-500">🎯 Mục tiêu kết nối:</p>
                      <p className="font-semibold text-slate-800 leading-snug">{pair.targetGoal}</p>

                      <p className="text-[11px] font-bold text-slate-500 pt-1">📝 Ghi nhận tiến bộ:</p>
                      <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                        "{pair.progressNote}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChannel('class_general');
                        setMessageInput(`[Đôi bạn cùng tiến - ${pair.deskLabel}] Chúc mừng 2 bạn ${pair.student1.name} và ${pair.student2.name} đã hoàn thành xuất sắc mục tiêu!`);
                        setActiveTab('messenger');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#003366] hover:bg-blue-100 font-bold text-[11px] transition-colors"
                    >
                      Khen Ngợi
                    </button>

                    {isGVCN && (
                      <button
                        type="button"
                        onClick={() => handleDeletePair(pair)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Hủy ghép đôi bạn này (Dành cho GVCN)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hủy Cặp</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PARENT MEETINGS (LỊCH HẸN TRAO ĐỔI PHHS) */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#003366]" />
                Lịch Hẹn & Hội Thảo Trao Đổi Phụ Huynh ({meetings.length} Cuộc hẹn)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý, theo dõi và chỉnh sửa các buổi gặp gỡ trực tiếp hoặc trực tuyến 1-1 giữa Giáo viên chủ nhiệm và Phụ huynh
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {isGVCN && meetings.some((m) => m.status === 'completed' || m.status === 'cancelled') && (
                <button
                  type="button"
                  onClick={handleClearFinishedMeetings}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Xóa các lịch hẹn đã hoàn thành hoặc bị hủy"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dọn Dẹp Lịch Cũ</span>
                </button>
              )}

              {isGVCN && (
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Lịch Hẹn Mới</span>
                </button>
              )}
            </div>
          </div>

          {meetings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Calendar className="w-12 h-12 text-blue-300 mx-auto stroke-1" />
              <p className="text-base font-bold text-slate-700">Chưa có cuộc hẹn trao đổi phụ huynh nào</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Bấm "Tạo Lịch Hẹn Mới" để lên lịch trao đổi trực tiếp tại trường hoặc trực tuyến qua Google Meet.
              </p>
              {isGVCN && (
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lên Lịch Ngay</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-[#003366] border border-blue-200/50 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {m.meetingDate} • {m.meetingTime}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          m.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.status === 'confirmed'
                          ? '✅ Đã Xác Nhận'
                          : m.status === 'pending'
                          ? '⏳ Chờ Xác Nhận'
                          : m.status === 'completed'
                          ? '🎉 Đã Hoàn Thành'
                          : '❌ Đã Hủy'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.topic}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Học sinh: <span className="font-bold text-slate-800">{m.studentName}</span> • Phụ huynh:{' '}
                        <span className="font-bold text-slate-800">{m.parentName}</span>
                      </p>
                      <p className="text-xs font-mono text-blue-700 mt-0.5">📞 {m.parentPhone}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center gap-2">
                      {m.meetingType === 'online' ? (
                        <Video className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate font-medium text-slate-700">{m.locationOrLink}</span>
                    </div>

                    {m.teacherNotes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                        Ghi chú: {m.teacherNotes}
                      </p>
                    )}
                  </div>

                  {/* Status & Deletion action buttons */}
                  {isGVCN && (
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                      {m.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateMeetingStatus(m.id, 'confirmed');
                            showToast('Đã xác nhận lịch hẹn gặp phụ huynh!');
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                        >
                          Xác Nhận
                        </button>
                      )}
                      {m.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateMeetingStatus(m.id, 'completed');
                            showToast('Đã đánh dấu hoàn thành buổi trao đổi!');
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                        >
                          Hoàn Thành
                        </button>
                      )}

                      <a
                        href={`tel:${m.parentPhone.replace(/[^0-9]/g, '')}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi PH</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(m)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-colors"
                        title="Xóa cuộc hẹn này (Dành cho GVCN)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HOTLINE & EMERGENCY CHANNELS */}
      {activeTab === 'hotline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Đường Dây Nóng Giáo Viên Chủ Nhiệm</h3>
                <p className="text-xs text-slate-500">Hỗ trợ tiếp nhận thông tin khẩn cấp 24/7</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-2">
              <p className="text-xs text-emerald-900 font-bold">
                {teacherInfo?.name || 'ThS. Nguyễn Văn Cừ'} - GVCN {classInfo?.className || '12A1'}
              </p>
              <p className="text-xl font-black font-mono text-emerald-800">{teacherInfo?.phone || '0912.345.678'}</p>
              <p className="text-xs text-slate-600">Email: {teacherInfo?.email || 'nguyenvancu.gvcn@thpt-trannguyenhan.edu.vn'}</p>
              <p className="text-xs text-slate-600">Thời gian tiếp PH tại trường: Thứ 2 - Thứ 6 (16:30 - 17:30)</p>
            </div>

            <a
              href={`tel:${(teacherInfo?.phone || '0912345678').replace(/[^0-9]/g, '')}`}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi Trực Tiếp Cho GVCN</span>
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#003366]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tổng Đài Nhà Trường {classInfo?.schoolName || 'THPT Trần Nguyên Hãn'}
                </h3>
                <p className="text-xs text-slate-500">Ban Giám Hiệu & Phòng Giám Thị - Y Tế</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60 space-y-2">
              <p className="text-xs text-[#003366] font-bold">Văn Phòng Nhà Trường & Phòng Giám Thị</p>
              <p className="text-xl font-black font-mono text-blue-900">(0225) 3.847.123</p>
              <p className="text-xs text-slate-600">Địa chỉ: Số 12 Lạch Tray, Ngô Quyền, TP. Hải Phòng</p>
              <p className="text-xs text-slate-600">Cổng Thông Tin Điện Tử: c3trannguyenhan.edu.vn</p>
            </div>

            <a
              href="tel:02253847123"
              className="w-full py-3 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi Tổng Đài THPT Trần Nguyên Hãn</span>
            </a>
          </div>
        </div>
      )}

      {/* MODAL: DATA MANAGEMENT & DELETION CENTER FOR GVCN */}
      {isDataManagementOpen && isGVCN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Quản Lý & Xóa Dữ Liệu Kết Nối</h3>
                  <p className="text-xs text-slate-500">Phân quyền dành riêng cho Giáo viên chủ nhiệm & BGH</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDataManagementOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Warning Notice */}
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lưu ý an toàn dữ liệu sư phạm:</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Các thao tác xóa dưới đây sẽ xóa vĩnh viễn các bản ghi tương ứng khỏi bộ nhớ lưu trữ của lớp {classInfo?.className || '12A1'}. Thầy/Cô vui lòng kiểm tra kỹ trước khi xác nhận.
                </p>
              </div>
            </div>

            {/* Group 1: Chat Messages */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Tin Nhắn & Trao Đổi Trực Tuyến
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hiện có <span className="font-bold text-slate-700">{messages.length}</span> tin nhắn đã lưu trên toàn bộ hệ thống
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClearCurrentChannel();
                    setIsDataManagementOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa tin nhắn trong kênh hiện tại</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirm({
                      title: 'Xóa toàn bộ tất cả tin nhắn',
                      message: `Thầy/Cô có chắc chắn muốn xóa toàn bộ ${messages.length} tin nhắn trên tất cả các kênh trao đổi không?`,
                      actionLabel: 'Xóa Toàn Bộ Tin Nhắn',
                      onConfirm: () => {
                        onClearAllMessages?.();
                        setDeleteConfirm(null);
                        setIsDataManagementOpen(false);
                        showToast('Đã xóa toàn bộ dữ liệu tin nhắn!');
                      },
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa toàn bộ tin nhắn ({messages.length})</span>
                </button>
              </div>
            </div>

            {/* Group 2: Parent Meetings */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Lịch Hẹn Trao Đổi Phụ Huynh
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hiện có <span className="font-bold text-slate-700">{meetings.length}</span> cuộc hẹn đã tạo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClearFinishedMeetings();
                    setIsDataManagementOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Dọn dẹp lịch đã hoàn thành / hủy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirm({
                      title: 'Xóa toàn bộ lịch hẹn',
                      message: `Thầy/Cô có chắc chắn muốn xóa toàn bộ ${meetings.length} lịch hẹn trao đổi phụ huynh?`,
                      actionLabel: 'Xóa Toàn Bộ Lịch Hẹn',
                      onConfirm: () => {
                        // Delete all meetings
                        meetings.forEach((m) => onDeleteMeeting?.(m.id));
                        setDeleteConfirm(null);
                        setIsDataManagementOpen(false);
                        showToast('Đã xóa toàn bộ lịch hẹn trao đổi!');
                      },
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa tất cả lịch hẹn ({meetings.length})</span>
                </button>
              </div>
            </div>

            {/* Group 3: Study Pairs */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Đôi Bạn Cùng Tiến
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hiện có <span className="font-bold text-slate-700">{studyPairs.length}</span> cặp đôi đang liên kết
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClearAllPairs();
                    setIsDataManagementOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa toàn bộ danh sách ghép cặp ({studyPairs.length})</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDataManagementOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR SAFE DELETION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{deleteConfirm.title}</h3>
                <p className="text-xs text-slate-500">Thao tác dành cho Giáo viên chủ nhiệm</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {deleteConfirm.message}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-transform active:scale-95"
              >
                {deleteConfirm.actionLabel || 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PARENT MEETING */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Đặt Lịch Hẹn Với Phụ Huynh</h3>
                  <p className="text-xs text-slate-500">Trao đổi 1-1 chuyên sâu về học sinh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewMeeting} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Học Sinh:</label>
                <select
                  value={newMeetingStudentId}
                  onChange={(e) => setNewMeetingStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - PH: {s.emergencyContact.parentName} ({s.emergencyContact.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Hẹn:</label>
                  <input
                    type="date"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khung Giờ:</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    placeholder="Ví dụ: 16:30 - 17:00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hình Thức:</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as 'direct' | 'online')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="direct">Trực tiếp tại trường</option>
                    <option value="online">Trực tuyến (Google Meet)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa điểm / Đường link:</label>
                  <input
                    type="text"
                    value={newMeetingLocation}
                    onChange={(e) => setNewMeetingLocation(e.target.value)}
                    placeholder="P. Tiếp PH hoặc Link Meet"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ Đề Trao Đổi:</label>
                <input
                  type="text"
                  value={newMeetingTopic}
                  onChange={(e) => setNewMeetingTopic(e.target.value)}
                  placeholder="Ví dụ: Tư vấn định hướng chọn khối thi & kết quả Toán - Lý"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-md"
                >
                  Xác Nhận Đặt Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDY PAIR */}
      {isNewPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ghép Cặp Đôi Bạn Cùng Tiến</h3>
                  <p className="text-xs text-slate-500">Liên kết học tập theo sơ đồ bàn học</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPairModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewStudyPair} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học sinh 1 (Thế mạnh 1):</label>
                  <select
                    value={pairStudent1Id}
                    onChange={(e) => setPairStudent1Id(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Tổ {s.group} - {s.strengths || 'Toán'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học sinh 2 (Thế mạnh 2):</label>
                  <select
                    value={pairStudent2Id}
                    onChange={(e) => setPairStudent2Id(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Tổ {s.group} - {s.strengths || 'Vật lý'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vị Trí Bàn / Tổ:</label>
                <input
                  type="text"
                  value={pairDeskLabel}
                  onChange={(e) => setPairDeskLabel(e.target.value)}
                  placeholder="Ví dụ: Dãy 1 • Bàn 2 (Ghế 1 & Ghế 2)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mục Tiêu Đôi Bạn Cùng Tiến:</label>
                <input
                  type="text"
                  value={pairGoal}
                  onChange={(e) => setPairGoal(e.target.value)}
                  placeholder="Ví dụ: Cùng đạt 9.0+ Toán Lý Hóa và luyện 20 đề thi thử"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPairModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md"
                >
                  Kích Hoạt Cặp Đôi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL CONTACT BOOK QUICK VIEW */}
      {viewingContactStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={viewingContactStudent.avatar}
                  alt={viewingContactStudent.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingContactStudent.name}</h3>
                  <p className="text-xs text-slate-500">
                    Mã HS: {viewingContactStudent.code} • Tổ {viewingContactStudent.group} • {classInfo?.className || '12A1'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingContactStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Academic Highlights */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Toán Học</p>
                  <p className="text-lg font-black text-blue-700 mt-0.5">{viewingContactStudent.grades.math.avg}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Vật Lý</p>
                  <p className="text-lg font-black text-indigo-700 mt-0.5">{viewingContactStudent.grades.physics.avg}</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Hóa Học</p>
                  <p className="text-lg font-black text-teal-700 mt-0.5">{viewingContactStudent.grades.chemistry.avg}</p>
                </div>
              </div>

              {/* Contact and Guardian Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[#003366]" />
                  Thông Tin Liên Lạc & Người Giám Hộ:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phụ Huynh:</span>
                    <span className="font-bold">
                      {viewingContactStudent.emergencyContact.parentName} (
                      {viewingContactStudent.emergencyContact.relationship})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Số Điện Thoại PH:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {viewingContactStudent.emergencyContact.phone}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Địa Chỉ Thường Trú:</span>
                    <span className="font-medium">{viewingContactStudent.address}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Sở Trường / Nguyện Vọng ĐH:</span>
                    <span className="font-semibold text-emerald-700">
                      {viewingContactStudent.strengths} • {viewingContactStudent.careerAspiration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`tel:${viewingContactStudent.emergencyContact.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi Điện Cho PH</span>
              </a>

              {onSelectStudent && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectStudent(viewingContactStudent);
                    setViewingContactStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-sm"
                >
                  Xem Hồ Sơ Chi Tiết
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
