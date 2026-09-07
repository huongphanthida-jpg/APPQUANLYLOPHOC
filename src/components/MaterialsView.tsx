import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  AlertCircle,
  Plus,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  FileUp,
  FileCheck,
  Sparkles,
  ArrowDownToLine,
  Landmark,
  User,
  ShieldCheck,
  Send,
  Layers,
  ListChecks,
  PlayCircle,
  BarChart3,
  Check,
} from 'lucide-react';
import {
  StudyMaterial,
  AssignmentSubmission,
  Student,
  UserRole,
  MaterialFileType,
  ClassInfo,
  TeacherInfo,
  OnlineExam,
  OnlineExamAttempt,
} from '../types';
import { exportExamToWord } from '../utils/wordExamExport';
import { ConfirmModal } from './ConfirmModal';
import { OnlineExamCreatorModal } from './OnlineExamCreatorModal';
import { TakeOnlineExamModal } from './TakeOnlineExamModal';
import { OnlineExamResultsModal } from './OnlineExamResultsModal';

interface MaterialsViewProps {
  materials: StudyMaterial[];
  submissions: AssignmentSubmission[];
  students: Student[];
  role: UserRole;
  currentStudentId: string;
  onAddMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  onUpdateMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onDeleteMultipleMaterials: (ids: string[]) => void;
  onResetMaterials: () => void;
  onSubmitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  onGradeSubmission: (id: string, score: number, feedback: string) => void;
  onDeleteSubmission?: (id: string) => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onlineExams?: OnlineExam[];
  examAttempts?: OnlineExamAttempt[];
  onSaveExam?: (exam: OnlineExam) => void;
  onDeleteExam?: (id: string) => void;
  onSaveExamAttempt?: (attempt: OnlineExamAttempt) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  submissions,
  students,
  role,
  currentStudentId,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onDeleteMultipleMaterials,
  onResetMaterials,
  onSubmitAssignment,
  onGradeSubmission,
  onDeleteSubmission,
  classInfo = {
    className: '12A1',
    schoolYear: '2025 - 2026',
    schoolName: 'THPT Trần Nguyên Hãn - Hải Phòng',
    homeroomTeacher: 'Nguyễn Văn Cừ',
    totalStudents: 35,
    groupCount: 4,
    avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
  },
  teacherInfo = {
    name: 'ThS. Nguyễn Văn Cừ',
    subject: 'Toán Học & Chủ Nhiệm 12A1',
    phone: '0912.345.678',
    email: 'nguyenvancu.gvcn@thpt-trannguyenhan.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Giáo viên Chủ nhiệm Lớp 12A1 - 15 năm kinh nghiệm luyện thi THPT Quốc gia.',
  },
  onlineExams = [],
  examAttempts = [],
  onSaveExam = (_exam: OnlineExam) => {},
  onDeleteExam = (_id: string) => {},
  onSaveExamAttempt = (_attempt: OnlineExamAttempt) => {},
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'exams' | 'submissions'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [selectedExamSubject, setSelectedExamSubject] = useState<string>('all');
  
  // Multiple selection for deletion
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  
  // Modals & Forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Online Exam Modal States
  const [showExamCreatorModal, setShowExamCreatorModal] = useState(false);
  const [editingExam, setEditingExam] = useState<OnlineExam | null>(null);
  const [takingExam, setTakingExam] = useState<OnlineExam | null>(null);
  const [viewingResultsExam, setViewingResultsExam] = useState<OnlineExam | null>(null);

  // In-app Confirmation Modal State
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

  // Student Assignment Submission Form State
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitType, setSubmitType] = useState<AssignmentSubmission['assignmentType']>('homework');
  const [submitSubject, setSubmitSubject] = useState<AssignmentSubmission['subject']>('Toán');
  const [submitNotes, setSubmitNotes] = useState('');
  const [submitFile, setSubmitFile] = useState<{ name: string; size: string; type: AssignmentSubmission['fileType']; dataUrl?: string } | null>(null);

  // Teacher Grading Modal / Inline
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(9.0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // Upload Material Form State
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatSubject, setNewMatSubject] = useState<StudyMaterial['subject']>('Toán');
  const [newMatFileType, setNewMatFileType] = useState<MaterialFileType>('pdf');
  const [newMatDescription, setNewMatDescription] = useState('');
  const [newMatFile, setNewMatFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assignmentFileInputRef = useRef<HTMLInputElement>(null);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to get file icon and badge colors
  const getFileTypeDetails = (type: MaterialFileType | string) => {
    switch (type) {
      case 'pdf':
        return { label: 'PDF', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: FileText };
      case 'word':
        return { label: 'Word', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText };
      case 'excel':
      case 'sheet':
        return { label: 'Excel/Sheet', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileSpreadsheet };
      case 'image':
        return { label: 'Hình ảnh', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ImageIcon };
      default:
        return { label: 'Tài liệu', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileCode };
    }
  };

  // Filter Materials
  const filteredMaterials = materials.filter((m) => {
    const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchesType = selectedFileType === 'all' || m.fileType === selectedFileType;
    return matchesQuery && matchesSubject && matchesType;
  });

  // Filter Submissions (Data Isolation for Students / Parents)
  const filteredSubmissions = submissions.filter((sub) => {
    if (role === 'student' || role === 'parent') {
      return sub.studentId === currentStudentId;
    }
    return true;
  });

  // Handle Download File Simulation
  const handleDownloadFile = (fileName: string, title: string, fileData?: string) => {
    const blob = new Blob([fileData || `Tài liệu: ${title}\nTrường THPT Trần Nguyên Hãn - Lớp 12A1\nThời gian: ${new Date().toLocaleString('vi-VN')}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'tai_lieu_12a1.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã tải tài liệu "${fileName}" về máy thành công!`);
  };

  // Handle Select All Materials
  const handleToggleSelectAll = () => {
    if (selectedMaterialIds.length === filteredMaterials.length) {
      setSelectedMaterialIds([]);
    } else {
      setSelectedMaterialIds(filteredMaterials.map((m) => m.id));
    }
  };

  const handleToggleSelectMaterial = (id: string) => {
    if (selectedMaterialIds.includes(id)) {
      setSelectedMaterialIds(selectedMaterialIds.filter((item) => item !== id));
    } else {
      setSelectedMaterialIds([...selectedMaterialIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedMaterialIds.length === 0) return;
    const count = selectedMaterialIds.length;
    setConfirmAction({
      isOpen: true,
      title: 'Xác Nhận Xoá Nhiều Tài Liệu',
      message: `Bạn có chắc chắn muốn xoá ${count} tài liệu đã chọn khỏi kho học liệu? Hành động này không thể hoàn tác.`,
      confirmText: `Xoá ${count} File`,
      onConfirm: () => {
        onDeleteMultipleMaterials(selectedMaterialIds);
        setSelectedMaterialIds([]);
        showToast(`Đã xoá thành công ${count} tài liệu đã chọn!`);
      },
    });
  };

  // Upload Material Handler
  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) {
      alert('Vui lòng nhập tiêu đề tài liệu!');
      return;
    }

    const defaultFileName = newMatFile ? newMatFile.name : `${newMatTitle.replace(/\s+/g, '_')}.${newMatFileType === 'word' ? 'docx' : newMatFileType === 'excel' || newMatFileType === 'sheet' ? 'xlsx' : newMatFileType === 'image' ? 'png' : 'pdf'}`;
    const defaultFileSize = newMatFile ? newMatFile.size : '2.5 MB';

    if (editingMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        title: newMatTitle,
        subject: newMatSubject,
        fileType: newMatFileType,
        fileName: defaultFileName,
        fileSize: defaultFileSize,
        description: newMatDescription,
      });
      showToast(`Đã cập nhật thông tin tài liệu "${newMatTitle}"!`);
      setEditingMaterial(null);
    } else {
      onAddMaterial({
        title: newMatTitle,
        subject: newMatSubject,
        fileType: newMatFileType,
        fileName: defaultFileName,
        fileSize: defaultFileSize,
        description: newMatDescription || 'Tài liệu học tập & ôn thi Lớp 12A1.',
        uploadedBy: role === 'bgh' ? 'Ban Giám Hiệu THPT Trần Nguyên Hãn' : 'Thầy Nguyễn Văn An (GVCN)',
        targetGroup: 'all',
      });
      showToast(`Đã tải lên tài liệu "${newMatTitle}" thành công!`);
    }

    setShowUploadModal(false);
    setNewMatTitle('');
    setNewMatDescription('');
    setNewMatFile(null);
  };

  // Student Submit Assignment Handler
  const handleSubmitAssignmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTitle.trim()) {
      alert('Vui lòng nhập tên bài kiểm tra / bài tập!');
      return;
    }

    const fileName = submitFile ? submitFile.name : `Bai_Lam_${submitSubject}_${currentStudent.name.replace(/\s+/g, '')}.${submitType === 'homework' ? 'docx' : 'pdf'}`;
    const fileSize = submitFile ? submitFile.size : '2.8 MB';
    const fileType = submitFile ? submitFile.type : 'pdf';

    onSubmitAssignment({
      assignmentTitle: submitTitle,
      assignmentType: submitType,
      subject: submitSubject,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentCode: currentStudent.code,
      group: currentStudent.group,
      fileName,
      fileType,
      fileSize,
      notes: submitNotes,
      fileData: submitFile?.dataUrl,
    });

    showToast(`Nộp bài "${submitTitle}" môn ${submitSubject} thành công!`);
    setSubmitTitle('');
    setSubmitNotes('');
    setSubmitFile(null);
  };

  // Handle File Input Changes
  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      let type: MaterialFileType = 'pdf';
      if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) type = 'word';
      else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) type = 'excel';
      else if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) type = 'image';

      setNewMatFileType(type);
      setNewMatFile({
        name: file.name,
        size: sizeMb,
      });
      if (!newMatTitle) {
        setNewMatTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAssignmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      let type: AssignmentSubmission['fileType'] = 'pdf';
      if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) type = 'word';
      else if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) type = 'image';

      setSubmitFile({
        name: file.name,
        size: sizeMb,
        type,
      });
    }
  };

  return (
    <div id="materials-view" className="space-y-6 pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Role-Specific Overview */}
      <div className={`text-white rounded-2xl p-6 shadow-md border relative overflow-hidden ${
        role === 'bgh'
          ? 'bg-gradient-to-r from-[#002244] via-[#003366] to-[#1e3a8a] border-amber-400/40'
          : 'bg-[#003366] border-[#002244]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                role === 'bgh' ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-[#98FF98]/20 text-[#98FF98] border-[#98FF98]/30'
              }`}>
                {role === 'bgh' ? 'BAN GIÁM HIỆU • THANH TRA HỌC LIỆU' : 'TRUNG TÂM HỌC LIỆU & NỘP BÀI TRỰC TUYẾN'}
              </span>
              <span className="text-xs text-slate-300">{classInfo?.className || 'Lớp 12A1'} • THPT Trần Nguyên Hãn</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {role === 'student' || role === 'parent'
                ? `Kho Tài Liệu & Nộp Bài - ${currentStudent.name}`
                : 'Kho Tài Liệu Học Liệu & Quản Trị Tệp Tin Học Vụ'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {role === 'student' || role === 'parent'
                ? `Mã HS: ${currentStudent.code} • Tổ ${currentStudent.group} • Tải đề cương, tài liệu và nộp bài kiểm tra/bài thi trực tuyến`
                : 'Quản lý tài liệu Word, PDF, Google Sheet/Excel, Hình ảnh • Chấm bài nộp trực tuyến'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(role === 'gvcn' || role === 'gvbm') && (
              <>
                <button
                  id="btn-open-create-exam"
                  onClick={() => {
                    setEditingExam(null);
                    setShowExamCreatorModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 text-xs font-extrabold transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>+ Tạo Đề Thi Online Mới</span>
                </button>

                <button
                  id="btn-open-upload-material"
                  onClick={() => {
                    setEditingMaterial(null);
                    setNewMatTitle('');
                    setNewMatDescription('');
                    setNewMatFile(null);
                    setShowUploadModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#98FF98] hover:bg-emerald-300 text-[#003366] text-xs font-bold transition-all shadow-xs"
                >
                  <UploadCloud className="w-4 h-4 text-[#003366]" />
                  <span>Tải Lên Học Liệu Mới</span>
                </button>
              </>
            )}

            {(role === 'student' || role === 'parent') && (
              <>
                <button
                  onClick={() => setActiveTab('exams')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 text-xs font-black transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Thi Trực Tuyến Ngay ({onlineExams.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Nộp File Bài Tập</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar / View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-btn-materials"
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'materials'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Kho Học Liệu & Đề Cương ({materials.length})</span>
          </button>

          <button
            id="tab-btn-online-exams"
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListChecks className="w-4 h-4 text-amber-500" />
            <span>Đề Thi Trắc Nghiệm Online ({onlineExams.length})</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black">
              MỚI
            </span>
          </button>

          <button
            id="tab-btn-submissions"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>
              {role === 'student' || role === 'parent'
                ? `Bài Nộp Của Tôi (${filteredSubmissions.length})`
                : `Chấm Bài Nộp Trực Tuyến (${submissions.length})`}
            </span>
          </button>
        </div>

        {/* Search Input for Materials */}
        {activeTab === 'materials' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]"
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB 1: KHO HỌC LIỆU & TÀI LIỆU
          ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Filter Chips & Batch Operations */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Môn học:
              </span>
              {['all', 'Toán', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Ngữ Văn', 'Tiếng Anh', 'Chung'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                    selectedSubject === sub
                      ? 'bg-[#003366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub === 'all' ? 'Tất cả' : sub}
                </button>
              ))}
            </div>

            {/* Batch actions for GVCN */}
            {role === 'gvcn' && selectedMaterialIds.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-rose-800">
                  Đã chọn {selectedMaterialIds.length} file
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xoá Đã Chọn</span>
                </button>
              </div>
            )}
          </div>

          {/* Select all & Count bar for GVCN */}
          {role === 'gvcn' && filteredMaterials.length > 0 && (
            <div className="flex items-center justify-between px-2 text-xs text-slate-500">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#003366]"
              >
                {selectedMaterialIds.length === filteredMaterials.length ? (
                  <CheckSquare className="w-4 h-4 text-[#003366]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Chọn tất cả ({filteredMaterials.length} tài liệu)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-reset-sample-materials"
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: 'Khôi Phục Kho Tài Liệu Mẫu',
                      message: 'Bạn có chắc chắn muốn khôi phục lại toàn bộ kho tài liệu chuẩn ban đầu của lớp?',
                      confirmText: 'Tải Lại Kho Mẫu',
                      onConfirm: () => {
                        onResetMaterials();
                        setSelectedMaterialIds([]);
                        showToast('Đã tải lại kho tài liệu học tập ban đầu!');
                      },
                    });
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#003366] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tải lại kho tài liệu mẫu</span>
                </button>
              </div>
            </div>
          )}

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const fileTypeInfo = getFileTypeDetails(mat.fileType);
              const FileIcon = fileTypeInfo.icon;
              const isSelected = selectedMaterialIds.includes(mat.id);

              return (
                <div
                  key={mat.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between hover:shadow-md relative ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Card Header with Checkbox & Tags */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {role === 'gvcn' && (
                          <button
                            type="button"
                            onClick={() => handleToggleSelectMaterial(mat.id)}
                            className="text-slate-400 hover:text-[#003366]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#003366]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${fileTypeInfo.color}`}>
                          {fileTypeInfo.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {mat.subject}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400">{mat.fileSize}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#003366] transition-colors leading-snug">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Tệp:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[180px]">{mat.fileName}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Đăng bởi:</span>
                        <span className="text-slate-600 truncate max-w-[180px]">{mat.uploadedBy}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      id={`btn-download-${mat.id}`}
                      onClick={() => handleDownloadFile(mat.fileName, mat.title, mat.fileData)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Về Máy</span>
                    </button>

                    <button
                      id={`btn-preview-${mat.id}`}
                      onClick={() => setPreviewMaterial(mat)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Xem trước"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {(role === 'gvcn' || role === 'gvbm') && (
                      <button
                        id={`btn-edit-mat-${mat.id}`}
                        onClick={() => {
                          setEditingMaterial(mat);
                          setNewMatTitle(mat.title);
                          setNewMatSubject(mat.subject);
                          setNewMatFileType(mat.fileType);
                          setNewMatDescription(mat.description);
                          setShowUploadModal(true);
                        }}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa tài liệu"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {role === 'gvcn' && (
                      <button
                        id={`btn-delete-mat-${mat.id}`}
                        onClick={() => {
                          setConfirmAction({
                            isOpen: true,
                            title: 'Xác Nhận Xoá Tài Liệu',
                            message: `Bạn có chắc chắn muốn xoá tài liệu "${mat.title}" khỏi kho học liệu?`,
                            confirmText: 'Xoá Tài Liệu',
                            onConfirm: () => {
                              onDeleteMaterial(mat.id);
                              setSelectedMaterialIds((prev) => prev.filter((id) => id !== mat.id));
                              showToast(`Đã xoá tài liệu "${mat.title}" thành công!`);
                            },
                          });
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="Xoá tài liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Không tìm thấy tài liệu phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn lại danh mục môn học</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ĐỀ THI TRẮC NGHIỆM ONLINE (TỰ ĐỘNG CHẤM ĐIỂM & PHÂN TÍCH)
          ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Header Bar: Filter by Subject & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Môn thi:
              </span>
              {['all', 'Toán', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Ngữ Văn', 'Tiếng Anh'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedExamSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                    selectedExamSubject === sub
                      ? 'bg-[#003366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub === 'all' ? 'Tất cả môn' : sub}
                </button>
              ))}
            </div>

            {(role === 'gvcn' || role === 'gvbm') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingExam(null);
                    setShowExamCreatorModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>AI Tạo Đề Từ Tài Liệu / Ảnh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingExam(null);
                    setShowExamCreatorModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Soạn Thủ Công</span>
                </button>
              </div>
            )}
          </div>

          {/* Intro Information Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 text-sm">
                Phòng Thi Trắc Nghiệm Trực Tuyến - Lớp {classInfo?.className || '12A1'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                Đề thi trắc nghiệm trực tuyến chuẩn cấu trúc THPT: Có đồng hồ bấm giờ làm bài, hệ thống tự động chấm điểm tức thì sau khi nộp, cung cấp đáp án & lời giải chi tiết và biểu đồ phân tích phổ điểm cho Giáo viên & BGH.
              </p>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onlineExams
              .filter((ex) => selectedExamSubject === 'all' || ex.subject === selectedExamSubject)
              .map((exam) => {
                // Find attempt of current student if in student/parent mode
                const studentAttempt = examAttempts.find(
                  (a) => a.examId === exam.id && a.studentId === currentStudentId
                );

                // Count total attempts for GVCN view
                const totalAttemptsForExam = examAttempts.filter((a) => a.examId === exam.id);
                const scores = totalAttemptsForExam.map((a) => a.score);
                const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Header Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              exam.subject === 'Toán'
                                ? 'bg-blue-100 text-blue-700'
                                : exam.subject === 'Vật Lý'
                                ? 'bg-indigo-100 text-indigo-700'
                                : exam.subject === 'Hóa Học'
                                ? 'bg-emerald-100 text-emerald-700'
                                : exam.subject === 'Tiếng Anh'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {exam.subject}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {exam.durationMinutes} phút
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {exam.questions.length} câu hỏi
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Đang mở thi
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {exam.description || `Đề thi trắc nghiệm môn ${exam.subject} - Lớp ${classInfo?.className}`}
                        </p>
                      </div>

                      {/* Meta info tags */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <div>
                          Phân tổ: <strong className="text-slate-700">{exam.targetGroup === 'all' ? 'Cả lớp (Tổ 1-4)' : `Tổ ${exam.targetGroup}`}</strong>
                        </div>
                        <div className="text-right">
                          Hạn chót: <strong className="text-slate-700">{exam.deadline || 'Không giới hạn'}</strong>
                        </div>
                      </div>

                      {/* Student Mode: Result display or prompt to take test */}
                      {(role === 'student' || role === 'parent') && studentAttempt && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                              {studentAttempt.score.toFixed(1)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-emerald-900">
                                Đã Nộp Bài • {studentAttempt.score >= 8.5 ? 'Xuất Sắc' : studentAttempt.score >= 6.5 ? 'Khá Giỏi' : 'Đạt'}
                              </div>
                              <div className="text-[10px] text-emerald-700">
                                Đúng {studentAttempt.correctCount}/{studentAttempt.totalQuestions} câu • Nộp lúc: {studentAttempt.submittedAt}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setTakingExam(exam)}
                            className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
                          >
                            Xem Lại Bài
                          </button>
                        </div>
                      )}

                      {/* Teacher / GVBM Mode: Overall submissions summary */}
                      {(role === 'gvcn' || role === 'gvbm') && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            Đã nộp: <strong className="text-blue-700">{totalAttemptsForExam.length}/{students.length} HS</strong>
                          </span>
                          <span className="text-slate-600">
                            Điểm TB: <strong className="text-emerald-700">{avgScore ? `${avgScore}/10` : 'Chưa có'}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* For Student / Parent */}
                      {(role === 'student' || role === 'parent') ? (
                        studentAttempt ? (
                          <div className="w-full flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setTakingExam(exam)}
                              className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem Chi Tiết Lời Giải
                            </button>
                            <button
                              type="button"
                              onClick={() => setTakingExam(exam)}
                              className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Luyện Tập Lại
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTakingExam(exam)}
                            className="w-full py-2.5 px-4 text-xs font-extrabold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Bắt Đầu Làm Bài Thi Ngay ({exam.durationMinutes} phút)
                          </button>
                        )
                      ) : (
                        /* For GVCN / BGH */
                        <div className="w-full flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingResultsExam(exam)}
                            className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Bảng Điểm & Phân Tích
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              exportExamToWord({
                                title: exam.title,
                                subject: exam.subject,
                                durationMinutes: exam.durationMinutes,
                                description: exam.description,
                                questions: exam.questions,
                                className: classInfo?.className || '12A1',
                                schoolName: classInfo?.schoolName || 'THPT TRẦN NGUYÊN HÃN',
                                teacherName: teacherInfo?.name || 'Thầy Nguyễn Văn An',
                              });
                              showToast(`Đã xuất đề thi "${exam.title}" ra tệp Word (.doc) thành công!`);
                            }}
                            title="Xuất Đề Thi & Đáp Án Chi Tiết Ra File Word (.doc/.docx)"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer border border-emerald-200"
                          >
                            <FileText className="w-4 h-4 text-emerald-700" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTakingExam(exam)}
                            title="Thi thử nghiệm đề thi"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(role === 'gvcn' || role === 'gvbm') && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExam(exam);
                                setShowExamCreatorModal(true);
                              }}
                              title="Chỉnh sửa đề thi"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {role === 'gvcn' && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmAction({
                                  isOpen: true,
                                  title: 'Xác Nhận Xóa Đề Thi',
                                  message: `Bạn có chắc chắn muốn xóa đề thi "${exam.title}"? Dữ liệu bài làm của học sinh sẽ không thể phục hồi.`,
                                  confirmText: 'Xóa Đề Thi',
                                  onConfirm: () => {
                                    onDeleteExam(exam.id);
                                    showToast(`Đã xóa đề thi "${exam.title}" thành công!`);
                                  },
                                });
                              }}
                              title="Xóa đề thi"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {onlineExams.filter((ex) => selectedExamSubject === 'all' || ex.subject === selectedExamSubject).length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <ListChecks className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Chưa có đề thi trắc nghiệm nào cho môn này</h3>
              <p className="text-xs text-slate-500">
                Hãy bấm "Tạo Đề Thi Mới" hoặc chọn từ kho đề mẫu KHTN chuẩn để bắt đầu.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: NỘP BÀI TRỰC TUYẾN & CHẤM ĐIỂM
          ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* If Student / Parent: Show Submission Form */}
          {(role === 'student' || role === 'parent') && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nộp Bài Tập & Bài Kiểm Tra Trực Tuyến
                  </h3>
                  <p className="text-xs text-slate-500">
                    Học sinh: <strong className="text-slate-800">{currentStudent.name}</strong> • Mã HS: <span className="font-mono">{currentStudent.code}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitAssignmentForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                    <select
                      value={submitSubject}
                      onChange={(e) => setSubmitSubject(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    >
                      <option value="Toán">Toán Học</option>
                      <option value="Vật Lý">Vật Lý</option>
                      <option value="Hóa Học">Hóa Học</option>
                      <option value="Sinh Học">Sinh Học</option>
                      <option value="Ngữ Văn">Ngữ Văn</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Loại bài nộp</label>
                    <select
                      value={submitType}
                      onChange={(e) => setSubmitType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    >
                      <option value="homework">Bài tập về nhà</option>
                      <option value="test15">Bài kiểm tra 15 phút</option>
                      <option value="test45">Bài kiểm tra 1 tiết</option>
                      <option value="mock_exam">Đề thi thử THPT 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài kiểm tra / chủ đề</label>
                    <input
                      type="text"
                      placeholder="VD: Chuyên đề Cực trị Hàm số Tuần 24..."
                      value={submitTitle}
                      onChange={(e) => setSubmitTitle(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đính kèm file bài làm (PDF, Word, Ảnh chụp bài viết)</label>
                  <input
                    type="file"
                    ref={assignmentFileInputRef}
                    onChange={handleAssignmentFileChange}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                  />
                  <div
                    onClick={() => assignmentFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#003366] rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors"
                  >
                    {submitFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileCheck className="w-6 h-6 text-emerald-600" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">{submitFile.name}</p>
                          <p className="text-[10px] text-slate-500">{submitFile.size} • Bấm để chọn file khác</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">Kéo thả hoặc bấm để chọn file bài làm</p>
                        <p className="text-[10px] text-slate-400">Hỗ trợ PDF, Word .docx, ảnh JPG/PNG chụp bài kiểm tra</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lời nhắn / Ghi chú gửi thầy cô (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Em đã hoàn thành bài tập, câu 38 em có thắc mắc cách giải..."
                    value={submitNotes}
                    onChange={(e) => setSubmitNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp Bài Ngay</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Submissions History / Teacher Review List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {role === 'student' || role === 'parent'
                    ? 'Lịch Sử Bài Nộp & Kết Quả Chấm Điểm'
                    : 'Danh Sách Học Sinh Nộp Bài Kiểm Tra & Bài Thi'}
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'student' || role === 'parent'
                    ? 'Theo dõi điểm số và nhận xét sư phạm chi tiết từ Thầy Cô'
                    : 'GVCN / BGH kiểm tra bài làm, chấm điểm và gửi phản hồi'}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Tổng: {filteredSubmissions.length} bài
              </span>
            </div>

            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const fileTypeInfo = getFileTypeDetails(sub.fileType);
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${fileTypeInfo.color}`}>
                          {sub.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{sub.assignmentTitle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sub.submittedAt}
                        </span>
                        {sub.status === 'graded' ? (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> Điểm: {sub.score}/10
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Chờ chấm điểm
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Học sinh: {sub.studentName} ({sub.studentCode}) • Tổ {sub.group}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tệp đính kèm: <span className="font-mono text-blue-700">{sub.fileName}</span> ({sub.fileSize})
                        </p>
                        {sub.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            Lời nhắn: "{sub.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(sub.fileName, sub.assignmentTitle, sub.fileData)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải Bài Làm</span>
                        </button>

                        {(role === 'gvcn' || role === 'gvbm') && (
                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeScore(sub.score || 9.0);
                              setGradeFeedback(sub.teacherFeedback || 'Bài làm tốt, trình bày sạch sẽ.');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{sub.status === 'graded' ? 'Sửa Điểm & Nhận Xét' : 'Chấm Điểm'}</span>
                          </button>
                        )}

                        {(role === 'gvcn' || sub.studentId === currentStudentId) && onDeleteSubmission && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmAction({
                                isOpen: true,
                                title: 'Xác Nhận Xoá Bài Nộp',
                                message: `Bạn có chắc chắn muốn xoá bài nộp "${sub.assignmentTitle}" của học sinh ${sub.studentName}?`,
                                confirmText: 'Xoá Bài Nộp',
                                onConfirm: () => {
                                  onDeleteSubmission(sub.id);
                                  showToast(`Đã xoá bài nộp của học sinh ${sub.studentName}`);
                                },
                              });
                            }}
                            title="Xoá bài nộp"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Teacher Feedback Display */}
                    {sub.teacherFeedback && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                        <p className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Nhận xét của Giáo viên:
                        </p>
                        <p className="text-emerald-800 mt-0.5 italic leading-relaxed">
                          "{sub.teacherFeedback}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredSubmissions.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <FileUp className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Chưa có bài kiểm tra hoặc bài tập nào được nộp</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: TẢI LÊN / CHỈNH SỬA TÀI LIỆU HỌC LIỆU
          ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#003366]" />
                {editingMaterial ? 'Chỉnh Sửa Tài Liệu' : 'Tải Lên Tài Liệu / Học Liệu Mới'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề tài liệu *</label>
                <input
                  type="text"
                  placeholder="VD: Đề Cương Ôn Tập HK2 - Môn Toán 12..."
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={newMatSubject}
                    onChange={(e) => setNewMatSubject(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="Toán">Toán Học</option>
                    <option value="Vật Lý">Vật Lý</option>
                    <option value="Hóa Học">Hóa Học</option>
                    <option value="Sinh Học">Sinh Học</option>
                    <option value="Ngữ Văn">Ngữ Văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Chung">Thông Báo / Chung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Định dạng file</label>
                  <select
                    value={newMatFileType}
                    onChange={(e) => setNewMatFileType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="word">Microsoft Word (.docx)</option>
                    <option value="excel">Excel / Google Sheet (.xlsx)</option>
                    <option value="image">Hình ảnh (.png, .jpg)</option>
                    <option value="presentation">Slide PowerPoint (.pptx)</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn file từ máy tính</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMaterialFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-300 hover:border-[#003366] rounded-xl p-3 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
                >
                  {newMatFile ? (
                    <p className="text-xs font-bold text-emerald-700">
                      ✓ Đã chọn: {newMatFile.name} ({newMatFile.size})
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Bấm để chọn file (.pdf, .docx, .xlsx, .png, .jpg)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả nội dung tài liệu</label>
                <textarea
                  rows={2}
                  placeholder="Tóm tắt nội dung chính, hướng dẫn học sinh..."
                  value={newMatDescription}
                  onChange={(e) => setNewMatDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md"
                >
                  {editingMaterial ? 'Lưu Thay Đổi' : 'Tải Lên Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: XEM TRƯỚC TÀI LIỆU (PREVIEW)
          ========================================================================= */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Xem Trước Chi Tiết Tài Liệu</h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">{previewMaterial.title}</p>
                <p className="text-slate-600">{previewMaterial.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Môn học:</span>
                  <span className="font-bold text-slate-800">{previewMaterial.subject}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Định dạng file:</span>
                  <span className="font-bold text-slate-800 uppercase">{previewMaterial.fileType} ({previewMaterial.fileSize})</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Tên file:</span>
                  <span className="font-mono text-slate-800 truncate block">{previewMaterial.fileName}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Thời gian đăng:</span>
                  <span className="font-semibold text-slate-800">{previewMaterial.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDownloadFile(previewMaterial.fileName, previewMaterial.title, previewMaterial.fileData);
                  setPreviewMaterial(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Tải Về Máy Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CHẤM ĐIỂM BÀI NỘP HỌC SINH (GVCN / BGH)
          ========================================================================= */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Chấm Điểm & Nhận Xét Bài Nộp
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{gradingSubmission.assignmentTitle}</p>
              <p className="text-slate-600">
                Học sinh: <strong>{gradingSubmission.studentName}</strong> ({gradingSubmission.studentCode}) • Môn {gradingSubmission.subject}
              </p>
              <p className="text-[11px] text-slate-500">File: {gradingSubmission.fileName}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhập điểm số (Thang điểm 10):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhận xét & Góp ý sư phạm:
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Nhận xét ưu điểm, phần cần sửa, phương pháp cải thiện..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onGradeSubmission(gradingSubmission.id, gradeScore, gradeFeedback);
                  showToast(`Đã chấm điểm ${gradeScore} cho học sinh ${gradingSubmission.studentName}!`);
                  setGradingSubmission(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md"
              >
                Lưu Điểm & Phản Hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Exam Creator Modal */}
      <OnlineExamCreatorModal
        isOpen={showExamCreatorModal}
        onClose={() => {
          setShowExamCreatorModal(false);
          setEditingExam(null);
        }}
        onSaveExam={(savedExam) => {
          onSaveExam(savedExam);
          showToast(
            editingExam
              ? `Đã cập nhật đề thi "${savedExam.title}"!`
              : `Đã tạo đề thi "${savedExam.title}" (${savedExam.questions.length} câu) thành công!`
          );
        }}
        editingExam={editingExam}
        initialExam={editingExam}
        classInfo={classInfo}
        teacherInfo={teacherInfo}
      />

      {/* Take Online Exam Modal */}
      {takingExam && (
        <TakeOnlineExamModal
          isOpen={true}
          onClose={() => setTakingExam(null)}
          exam={takingExam}
          student={currentStudent}
          currentStudent={currentStudent}
          role={role}
          classInfo={classInfo}
          onSaveAttempt={(attempt) => {
            onSaveExamAttempt(attempt);
            showToast(`Đã nộp bài thi! Điểm số: ${attempt.score.toFixed(1)}/10`);
          }}
          existingAttempt={examAttempts.find(
            (a) => a.examId === takingExam.id && a.studentId === currentStudentId
          )}
        />
      )}

      {/* Online Exam Results & Analytics Modal */}
      {viewingResultsExam && (
        <OnlineExamResultsModal
          isOpen={true}
          onClose={() => setViewingResultsExam(null)}
          exam={viewingResultsExam}
          attempts={examAttempts.filter((a) => a.examId === viewingResultsExam.id)}
          students={students}
          classInfo={classInfo}
        />
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
