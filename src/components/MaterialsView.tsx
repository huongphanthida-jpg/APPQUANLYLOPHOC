import React, { useState, useRef } from 'react';
import {
  FileText,
  Bell,
  UploadCloud,
  Download,
  Trash2,
  Search,
  Plus,
  Megaphone,
  Building2,
  Calendar,
  FileSpreadsheet,
  Image as ImageIcon,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  StudyMaterial,
  AssignmentSubmission,
  Student,
  UserRole,
  ClassInfo,
  TeacherInfo,
  OnlineExam,
  OnlineExamAttempt,
} from '../types';
import { ConfirmModal } from './ConfirmModal';

export interface ClassAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  author: string;
  createdAt: string;
  category?: string;
}

export interface SchoolDocument {
  id: string;
  title: string;
  documentType: 'cong_van' | 'thong_bao' | 'bieu_mau';
  issueDate: string;
  issuer: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  fileUrl?: string;
  description?: string;
}

interface MaterialsViewProps {
  materials?: StudyMaterial[];
  submissions?: AssignmentSubmission[];
  students?: Student[];
  role?: UserRole;
  currentStudentId?: string;
  onAddMaterial?: (material: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  onUpdateMaterial?: (material: StudyMaterial) => void;
  onDeleteMaterial?: (id: string) => void;
  onDeleteMultipleMaterials?: (ids: string[]) => void;
  onResetMaterials?: () => void;
  onSubmitAssignment?: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  onGradeSubmission?: (id: string, score: number, feedback: string) => void;
  onDeleteSubmission?: (id: string) => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onlineExams?: OnlineExam[];
  examAttempts?: OnlineExamAttempt[];
  onSaveExam?: (exam: OnlineExam) => void;
  onDeleteExam?: (id: string) => void;
  onSaveExamAttempt?: (attempt: OnlineExamAttempt) => void;
}

const DEFAULT_ANNOUNCEMENTS: ClassAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'HỌP PHỤ HUYNH KHẨN CẤP ĐẦU NĂM HỌC 2026 - 2027',
    content:
      'Kính mời toàn thể Phụ huynh học sinh tham dự buổi họp mặt lúc 08h00 Chủ Nhật tuần này tại phòng học chính của lớp. Nội dung: Triển khai kế hoạch năm học mới, thông qua quy chế thi đua và bầu Ban đại diện Cha mẹ học sinh.',
    priority: 'urgent',
    author: 'Cô Phan Thị Dạ Hương (GVCN)',
    createdAt: '08:00 - 15/09/2026',
    category: 'Họp Phụ Huynh',
  },
  {
    id: 'ann-2',
    title: 'THÔNG BÁO LỊCH KHÁM SỨC KHỎE ĐỊNH KỲ & TIÊM CHỦNG',
    content:
      'Yêu cầu 100% học sinh mang theo sổ theo dõi sức khỏe và tập trung đúng 07h30 sáng Thứ 5 tại Phòng Y tế nhà trường. Các em nhịn ăn sáng để làm xét nghiệm theo đúng quy định.',
    priority: 'important',
    author: 'Cô Phan Thị Dạ Hương (GVCN)',
    createdAt: '14:20 - 12/09/2026',
    category: 'Y Tế Học Đường',
  },
  {
    id: 'ann-3',
    title: 'NHẮC NHỞ HOÀN THIỆN HỒ SƠ VÀ SƠ YẾU LÝ LỊCH HỌC SINH',
    content:
      'Học sinh nộp bổ sung 02 ảnh 3x4 (mặc áo sơ mi trắng có phù hiệu) và 01 bản sao giấy khai sinh công chứng cho Lớp trưởng trước ngày 20/09/2026 để tổng hợp gửi BGH.',
    priority: 'normal',
    author: 'Ban Cán Sự Lớp',
    createdAt: '10:15 - 10/09/2026',
    category: 'Hồ Sơ Học Sinh',
  },
];

const DEFAULT_DOCUMENTS: SchoolDocument[] = [
  {
    id: 'doc-1',
    title: 'Công văn 1284/SGDĐT-GDTrH về Kế hoạch giảng dạy & kiểm tra đánh giá năm học 2026 - 2027',
    documentType: 'cong_van',
    issueDate: '01/09/2026',
    issuer: 'Sở GD&ĐT Hải Phòng',
    fileName: 'Cong_van_1284_SGDDT_Ke_hoach_2026_2027.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    description: 'Văn bản chỉ đạo chuyên môn hướng dẫn giảng dạy, kiểm tra định kỳ và đánh giá xếp loại học sinh THPT.',
  },
  {
    id: 'doc-2',
    title: 'Thông báo Quyết định Ban hành Nội quy Học sinh & Quy chế Thi đua Khen thưởng 2026',
    documentType: 'thong_bao',
    issueDate: '05/09/2026',
    issuer: 'BGH THPT Trần Nguyên Hãn',
    fileName: 'Noi_quy_va_Quy_che_thi_dua_2026_2027.pdf',
    fileSize: '1.8 MB',
    fileType: 'pdf',
    description: 'Quy định chi tiết về trang phục, nề nếp kỷ luật, thang điểm thi đua tuần và hình thức khen thưởng.',
  },
  {
    id: 'doc-3',
    title: 'Biểu mẫu Đơn xin nghỉ học & Giấy xác nhận Phụ huynh học sinh năm học 2026',
    documentType: 'bieu_mau',
    issueDate: '08/09/2026',
    issuer: 'Đoàn Trường THPT TNH',
    fileName: 'Bieu_mau_don_xin_nghi_hoc_PHHS_2026.docx',
    fileSize: '450 KB',
    fileType: 'word',
    description: 'Mẫu đơn chuẩn dành cho Phụ huynh xin phép cho học sinh nghỉ học có lý do chính đáng.',
  },
  {
    id: 'doc-4',
    title: 'Sổ tay Hướng dẫn Đăng ký Khối thi & Nguyện vọng Xét tuyển Đại học 2027',
    documentType: 'bieu_mau',
    issueDate: '10/09/2026',
    issuer: 'Tổ Tư Vấn Hướng Nghiệp',
    fileName: 'Huong_dan_dang_ky_khoi_thi_2027.xlsx',
    fileSize: '3.2 MB',
    fileType: 'excel',
    description: 'Bảng tra cứu tổ hợp môn xét tuyển, chỉ tiêu tuyển sinh và lộ trình ôn tập THPT Quốc gia.',
  },
];

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  role = 'gvcn',
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
  // Announcements State with persistent localStorage
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('app_class_announcements');
      return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  });

  // School Documents State with persistent localStorage
  const [documents, setDocuments] = useState<SchoolDocument[]>(() => {
    try {
      const saved = localStorage.getItem('app_school_documents');
      return saved ? JSON.parse(saved) : DEFAULT_DOCUMENTS;
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  });

  // Filter & Search States
  const [docFilterTab, setDocFilterTab] = useState<'all' | 'cong_van' | 'thong_bao' | 'bieu_mau'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Announcement Form State
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [annCategory, setAnnCategory] = useState('Thông Báo Lớp');

  // New Document Upload State
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'cong_van' | 'thong_bao' | 'bieu_mau'>('cong_van');
  const [docIssuer, setDocIssuer] = useState('BGH THPT Trần Nguyên Hãn');
  const [docIssueDate, setDocIssueDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [docDescription, setDocDescription] = useState('');
  const [selectedDocFile, setSelectedDocFile] = useState<{
    fileName: string;
    fileSize: string;
    fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
    fileUrl?: string;
  } | null>(null);

  // In-app Confirmation Modal
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to localStorage immediately upon changes
  const saveAnnouncementsToStorage = (updated: ClassAnnouncement[]) => {
    setAnnouncements(updated);
    try {
      localStorage.setItem('app_class_announcements', JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi khi lưu thông báo vào localStorage:', e);
    }
  };

  const saveDocumentsToStorage = (updated: SchoolDocument[]) => {
    setDocuments(updated);
    try {
      localStorage.setItem('app_school_documents', JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi khi lưu văn bản vào localStorage:', e);
    }
  };

  // Action: Add Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${now.toLocaleDateString('vi-VN')}`;

    const newAnn: ClassAnnouncement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      author: role === 'bgh' ? 'Ban Giám Hiệu' : 'Cô Phan Thị Dạ Hương (GVCN)',
      createdAt: timeStr,
      category: annCategory,
    };

    const updated = [newAnn, ...announcements];
    saveAnnouncementsToStorage(updated);
    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnPriority('important');
    showToast('Đã đăng thông báo mới cho lớp thành công!');
  };

  // Action: Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    setConfirmAction({
      isOpen: true,
      title: 'Xác Nhận Xoá Thông Báo',
      message: 'Bạn có chắc chắn muốn xoá thông báo này khỏi bảng tin lớp không?',
      onConfirm: () => {
        const updated = announcements.filter((a) => a.id !== id);
        saveAnnouncementsToStorage(updated);
        showToast('Đã xoá thông báo thành công!');
      },
    });
  };

  // Action: Handle File Selection for Document Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let type: 'pdf' | 'word' | 'excel' | 'image' | 'other' = 'other';
      if (ext === 'pdf') type = 'pdf';
      else if (['doc', 'docx'].includes(ext)) type = 'word';
      else if (['xls', 'xlsx', 'csv'].includes(ext)) type = 'excel';
      else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) type = 'image';

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeStr = file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedDocFile({
          fileName: file.name,
          fileSize: sizeStr,
          fileType: type,
          fileUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Action: Add Document
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      showToast('Vui lòng nhập tên/tiêu đề văn bản!');
      return;
    }

    const newDoc: SchoolDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      documentType: docType,
      issueDate: docIssueDate || new Date().toLocaleDateString('vi-VN'),
      issuer: docIssuer.trim() || 'BGH THPT Trần Nguyên Hãn',
      fileName: selectedDocFile?.fileName || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedDocFile?.fileSize || '1.5 MB',
      fileType: selectedDocFile?.fileType || 'pdf',
      fileUrl: selectedDocFile?.fileUrl,
      description: docDescription.trim() || 'Văn bản công văn chính thức lưu trữ tại phân hệ quản lý.',
    };

    const updated = [newDoc, ...documents];
    saveDocumentsToStorage(updated);
    setShowDocModal(false);
    setDocTitle('');
    setDocDescription('');
    setSelectedDocFile(null);
    showToast('Đã tải lên văn bản mới thành công!');
  };

  // Action: Delete Document
  const handleDeleteDocument = (id: string) => {
    setConfirmAction({
      isOpen: true,
      title: 'Xác Nhận Xoá Văn Bản',
      message: 'Bạn có chắc chắn muốn xoá văn bản công văn này khỏi hệ thống lưu trữ?',
      onConfirm: () => {
        const updated = documents.filter((d) => d.id !== id);
        saveDocumentsToStorage(updated);
        showToast('Đã xoá văn bản thành công!');
      },
    });
  };

  // Action: View / Download Document File
  const handleViewOrDownloadDoc = (doc: SchoolDocument) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Đã tải xuống file "${doc.fileName}"!`);
    } else {
      // Simulate file download for default sample documents
      const blob = new Blob(
        [
          `--- VĂN BẢN QUẢN LÝ THPT TRẦN NGUYÊN HÃN ---\n\nTiêu đề: ${doc.title}\nĐơn vị ban hành: ${doc.issuer}\nNgày ban hành: ${doc.issueDate}\nMô tả: ${doc.description || 'Không có mô tả'}\n\nFile đính kèm mô phỏng dữ liệu hệ thống.`,
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Đã xem / tải xuống văn bản "${doc.fileName}"!`);
    }
  };

  // Helper for document file icon
  const getDocTypeBadge = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-rose-100 text-rose-700 border-rose-200', icon: FileText };
      case 'word':
        return { label: 'Word', bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText };
      case 'excel':
        return { label: 'Excel', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileSpreadsheet };
      case 'image':
        return { label: 'Hình ảnh', bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: ImageIcon };
      default:
        return { label: 'Tài liệu', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  // Filter Documents by Category and Search Query
  const filteredDocs = documents.filter((doc) => {
    const matchesTab = docFilterTab === 'all' || doc.documentType === docFilterTab;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Filter Announcements by Search Query
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <FileText className="w-6 h-6 text-[#003366]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              Văn Bản & Thông Báo {classInfo?.className || ''}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                {announcements.length} Thông Báo • {documents.length} Công Văn
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Trung tâm lưu trữ công văn nhà trường & bảng thông báo nhanh cho lớp học.</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm thông báo, công văn, tên file..."
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
                onClick={() => setShowAnnounceModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-amber-400"
              >
                <Megaphone className="w-4 h-4 text-slate-950" />
                <span>+ Đăng Thông Báo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-blue-900"
              >
                <UploadCloud className="w-4 h-4 text-cyan-300" />
                <span>+ Tải Lên Văn Bản</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KHU VỰC 1: ĐĂNG THÔNG BÁO NHANH CHỦ NHIỆM */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Bảng Thông Báo Nhanh Lớp Học
                <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                  {filteredAnnouncements.length} Tin Đăng
                </span>
              </h2>
            </div>
          </div>
          {(role === 'gvcn' || role === 'bgh') && (
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="text-xs font-bold text-[#003366] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng thông báo mới</span>
            </button>
          )}
        </div>

        {/* List of Announcements */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Chưa có thông báo nào trong danh sách tìm kiếm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((ann) => {
              const isUrgent = ann.priority === 'urgent';
              const isImportant = ann.priority === 'important';

              return (
                <div
                  key={ann.id}
                  className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                    isUrgent
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-2 ring-rose-400 animate-pulse'
                      : isImportant
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Priority & Category Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isUrgent
                            ? 'bg-rose-600 text-white border-rose-700'
                            : isImportant
                            ? 'bg-amber-500 text-slate-950 border-amber-600'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isUrgent ? '🚨 KHẨN CẤP' : isImportant ? '⚠️ QUAN TRỌNG' : '📢 THƯỜNG'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {ann.createdAt}
                      </span>
                    </div>

                    {/* Announcement Title */}
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">{ann.title}</h3>

                    {/* Content */}
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">{ann.content}</p>
                  </div>

                  {/* Footer Author & Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#003366]" />
                      {ann.author}
                    </span>

                    {(role === 'gvcn' || role === 'bgh') && (
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Xoá thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* KHU VỰC 2: KHO LƯU TRỮ VĂN BẢN & CÔNG VĂN */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#003366] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-[#003366]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Kho Văn Bản & Công Văn Nhà Trường
                <span className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                  {filteredDocs.length} Hồ Sơ
                </span>
              </h2>
            </div>
          </div>

          {/* Document Filter Category Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setDocFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                docFilterTab === 'all'
                  ? 'bg-white text-[#003366] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả ({documents.length})
            </button>
            <button
              onClick={() => setDocFilterTab('cong_van')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                docFilterTab === 'cong_van'
                  ? 'bg-white text-[#003366] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Công Văn Sở & BGH
            </button>
            <button
              onClick={() => setDocFilterTab('thong_bao')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                docFilterTab === 'thong_bao'
                  ? 'bg-white text-[#003366] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thông Báo / Đoàn Trường
            </button>
            <button
              onClick={() => setDocFilterTab('bieu_mau')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                docFilterTab === 'bieu_mau'
                  ? 'bg-white text-[#003366] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Biểu Mẫu Chuyên Môn
            </button>
          </div>
        </div>

        {/* Documents Table List */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy văn bản phù hợp.</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm Tải Lên Văn Bản Mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">TÊN VĂN BẢN / CÔNG VĂN</th>
                  <th className="py-3 px-4 whitespace-nowrap">LOẠI HỒ SƠ</th>
                  <th className="py-3 px-4 whitespace-nowrap">ĐƠN VỊ BAN HÀNH</th>
                  <th className="py-3 px-4 whitespace-nowrap">NGÀY BAN HÀNH</th>
                  <th className="py-3 px-4 whitespace-nowrap">DUNG LƯỢNG</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDocs.map((doc) => {
                  const badge = getDocTypeBadge(doc.fileType);
                  const IconComp = badge.icon;

                  return (
                    <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badge.bg}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#003366] text-xs leading-snug">
                              {doc.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-2">
                              <span className="font-mono text-slate-600">{doc.fileName}</span>
                              {doc.description && <span>• {doc.description}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            doc.documentType === 'cong_van'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : doc.documentType === 'thong_bao'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          {doc.documentType === 'cong_van'
                            ? 'Công Văn'
                            : doc.documentType === 'thong_bao'
                            ? 'Thông Báo'
                            : 'Biểu Mẫu'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{doc.issuer}</td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{doc.issueDate}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{doc.fileSize}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewOrDownloadDoc(doc)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003366] font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                            title="Tải xuống hoặc xem file văn bản"
                          >
                            <Download className="w-3.5 h-3.5 text-[#003366]" />
                            <span>Tải về</span>
                          </button>

                          {(role === 'gvcn' || role === 'bgh') && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200"
                              title="Xoá văn bản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL 1: ĐĂNG THÔNG BÁO MỚI */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#003366]">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Soạn Thông Báo Nhanh Lớp Học</h3>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Thông Báo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lịch họp Phụ huynh đầu năm học 2026 - 2027..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức Độ Ưu Tiên</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white font-semibold"
                  >
                    <option value="normal">📢 Thường</option>
                    <option value="important">⚠️ Quan trọng</option>
                    <option value="urgent">🚨 Khẩn cấp (Viền đỏ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Danh Mục</label>
                  <input
                    type="text"
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    placeholder="VD: Họp PH, Nề Nếp..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Chi Tiết *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập chi tiết thời gian, địa điểm, yêu cầu chuẩn bị cho học sinh và phụ huynh..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer border border-amber-400"
                >
                  <Megaphone className="w-4 h-4 text-slate-950" />
                  <span>Đăng Thông Báo Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TẢI LÊN VĂN BẢN MỚI */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#003366]">
                <UploadCloud className="w-5 h-5 text-[#003366]" />
                <h3 className="text-base font-bold text-slate-900">Tải Lên Văn Bản / Công Văn Mới</h3>
              </div>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Văn Bản / Công Văn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công văn chỉ đạo tổ chức Hội khỏe Phù Đổng năm 2026..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân Loại Văn Bản</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white font-semibold"
                  >
                    <option value="cong_van">📄 Công Văn (Sở/BGH)</option>
                    <option value="thong_bao">📢 Thông Báo (Lớp/Đoàn)</option>
                    <option value="bieu_mau">📋 Biểu Mẫu Hướng Dẫn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn Vị Ban Hành</label>
                  <input
                    type="text"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    placeholder="VD: Sở GD&ĐT, BGH..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Tệp Đính Kèm (PDF, Word, Excel, Ảnh)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-[#003366] bg-blue-50/50 hover:bg-blue-50 rounded-xl p-4 text-center cursor-pointer transition-all"
                >
                  <UploadCloud className="w-8 h-8 text-[#003366] mx-auto mb-1.5" />
                  {selectedDocFile ? (
                    <div className="text-xs font-bold text-slate-800">
                      <span>{selectedDocFile.fileName}</span>
                      <span className="ml-2 text-emerald-600 text-[11px]">({selectedDocFile.fileSize})</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Nhấp để tải tệp từ máy tính</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ file PDF, Word, Excel, Hình ảnh (Tối đa 25MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú / Trích Yếu Nội Dung</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về hiệu lực ban hành hoặc các mốc thời gian quan trọng..."
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer border border-blue-900"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-300" />
                  <span>Lưu & Ban Hành</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
