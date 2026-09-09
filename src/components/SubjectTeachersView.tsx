import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Clock,
  Filter,
  Grid,
  List,
  Sparkles,
  School,
  X,
  UserCheck,
  Camera,
  UploadCloud,
  Download,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SubjectTeacher, UserRole, ClassInfo, TeacherInfo } from '../types';

interface SubjectTeachersViewProps {
  subjectTeachers: SubjectTeacher[];
  onAddTeacher: (teacher: Omit<SubjectTeacher, 'id'>) => void;
  onUpdateTeacher: (teacher: SubjectTeacher) => void;
  onDeleteTeacher: (id: string) => void;
  onClearAllTeachers: () => void;
  onImportTeachers: (importedTeachers: SubjectTeacher[], mode: 'merge' | 'replace') => void;
  onResetDefaultTeachers?: () => void;
  role: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
}

export const SubjectTeachersView: React.FC<SubjectTeachersViewProps> = ({
  subjectTeachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onClearAllTeachers,
  onImportTeachers,
  onResetDefaultTeachers,
  role,
  classInfo,
  teacherInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<SubjectTeacher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states for Add/Edit
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(2);
  const [notes, setNotes] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [roleBadge, setRoleBadge] = useState('');
  const [avatar, setAvatar] = useState('');

  // File import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedTeachers, setParsedTeachers] = useState<SubjectTeacher[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Hidden File input ref for camera avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const formAvatarInputRef = useRef<HTMLInputElement>(null);
  const [targetAvatarTeacherId, setTargetAvatarTeacherId] = useState<string | null>(null);

  const className = classInfo?.className || 'LỚP 11D5';
  const gvcnName = teacherInfo?.name || 'Cô Phan Thị Dạ Hương';
  const canManage = role === 'gvcn' || role === 'bgh';

  // Unique list of subject names for filtering
  const subjectList = Array.from(
    new Set(subjectTeachers.map((t) => t.subjectName.replace(/\s*\(.*\)/, '').trim()))
  );

  const filteredTeachers = subjectTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'all' ||
      teacher.subjectName.toLowerCase().includes(selectedSubjectFilter.toLowerCase());

    return matchesSearch && matchesSubject;
  });

  const totalPeriods = subjectTeachers.reduce((sum, t) => sum + (t.periodsPerWeek || 0), 0);

  // Camera button handler for direct card avatar update
  const triggerCardAvatarUpload = (teacherId: string) => {
    setTargetAvatarTeacherId(teacherId);
    avatarInputRef.current?.click();
  };

  const handleCardAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetAvatarTeacherId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        const targetTeacher = subjectTeachers.find((t) => t.id === targetAvatarTeacherId);
        if (targetTeacher) {
          onUpdateTeacher({
            ...targetTeacher,
            avatar: base64Url,
          });
        }
      }
      setTargetAvatarTeacherId(null);
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Avatar upload handler inside Add/Edit Form
  const handleFormAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setAvatar(base64Url);
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setSubjectName('');
    setTeacherName('');
    setPhone('');
    setEmail('');
    setPeriodsPerWeek(2);
    setNotes('');
    setOfficeHours('');
    setRoleBadge('');
    setAvatar('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (teacher: SubjectTeacher) => {
    setEditingTeacher(teacher);
    setSubjectName(teacher.subjectName);
    setTeacherName(teacher.teacherName);
    setPhone(teacher.phone);
    setEmail(teacher.email);
    setPeriodsPerWeek(teacher.periodsPerWeek || 2);
    setNotes(teacher.notes || '');
    setOfficeHours(teacher.officeHours || '');
    setRoleBadge(teacher.roleBadge || '');
    setAvatar(teacher.avatar || '');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !teacherName.trim()) return;

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        subjectName: subjectName.trim(),
        teacherName: teacherName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        periodsPerWeek: Number(periodsPerWeek) || 0,
        notes: notes.trim(),
        officeHours: officeHours.trim(),
        roleBadge: roleBadge.trim(),
        avatar: avatar.trim(),
      });
      setEditingTeacher(null);
    } else {
      onAddTeacher({
        subjectName: subjectName.trim(),
        teacherName: teacherName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        periodsPerWeek: Number(periodsPerWeek) || 0,
        notes: notes.trim(),
        officeHours: officeHours.trim(),
        roleBadge: roleBadge.trim(),
        avatar: avatar.trim(),
      });
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteTeacher(deletingId);
      setDeletingId(null);
    }
  };

  // Excel / CSV Parse Logic
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        setImportError('File không chứa dữ liệu hoặc sai định dạng!');
        setIsParsing(false);
        return;
      }

      // Identify header row
      let headerIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const rowStr = rows[i].join(' ').toLowerCase();
        if (rowStr.includes('môn') || rowStr.includes('tên') || rowStr.includes('giáo viên')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rows[headerIdx].map((h: any) => String(h || '').trim().toLowerCase());

      const getCol = (keywords: string[]) => {
        return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
      };

      const subjectCol = getCol(['môn', 'subject']);
      const nameCol = getCol(['tên', 'họ tên', 'giáo viên', 'teacher', 'thầy', 'cô']);
      const phoneCol = getCol(['sđt', 'điện thoại', 'zalo', 'phone']);
      const emailCol = getCol(['email', 'thư']);
      const periodsCol = getCol(['tiết', 'số tiết', 'period']);
      const notesCol = getCol(['ghi chú', 'nhiệm vụ', 'note']);

      const parsed: SubjectTeacher[] = [];

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const subName = subjectCol >= 0 ? String(row[subjectCol] || '').trim() : '';
        const tName = nameCol >= 0 ? String(row[nameCol] || '').trim() : '';

        // If both subject and teacher name are empty, skip row
        if (!subName && !tName) continue;

        const tPhone = phoneCol >= 0 ? String(row[phoneCol] || '').trim() : '';
        const tEmail = emailCol >= 0 ? String(row[emailCol] || '').trim() : '';
        const tPeriods = periodsCol >= 0 ? parseInt(String(row[periodsCol]), 10) || 2 : 2;
        const tNotes = notesCol >= 0 ? String(row[notesCol] || '').trim() : '';

        parsed.push({
          id: `st-imp-${Date.now()}-${r}`,
          subjectName: subName || 'Bộ Môn',
          teacherName: tName || 'Chưa cập nhật',
          phone: tPhone,
          email: tEmail,
          periodsPerWeek: tPeriods,
          notes: tNotes,
        });
      }

      if (parsed.length === 0) {
        setImportError('Không tìm thấy danh sách giáo viên hợp lệ trong file!');
      } else {
        setParsedTeachers(parsed);
      }
    } catch (err) {
      setImportError('Lỗi đọc file Excel/CSV. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedTeachers.length === 0) return;
    onImportTeachers(parsedTeachers, importMode);
    setIsImportModalOpen(false);
    setImportFile(null);
    setParsedTeachers([]);
  };

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const data = [
      ['Môn Học', 'Họ và Tên Giáo Viên', 'Số Điện Thoại (Zalo)', 'Email Liên Hệ', 'Số Tiết/Tuần', 'Ghi Chú Chuyên Môn'],
      ['Toán Học', 'Thầy Nguyễn Văn An', '0912345678', 'nguyenvanan.gv@tnh.edu.vn', 5, 'Chủ nhiệm / Thạc sĩ Toán học'],
      ['Ngữ Văn', 'Cô Phan Thị Dạ Hương', '0987654321', 'dahuong.gv@tnh.edu.vn', 4, 'GVCN 11D5 / Tổ phó Ngữ Văn'],
      ['Tiếng Anh', 'Cô Trần Thị Quỳnh Mai', '0903112233', 'quynhmai.gv@tnh.edu.vn', 3, 'Chứng chỉ IELTS 8.0'],
      ['Vật Lý', 'Thầy Lê Văn Hùng', '0915223344', 'hunglv.gv@tnh.edu.vn', 3, 'Bồi dưỡng học sinh giỏi Lý'],
      ['Hóa Học', 'Cô Đỗ Thị Hoa', '0982334455', 'hoadt.gv@tnh.edu.vn', 2, 'Chuyên đề ôn thi Tốt nghiệp THPT'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach_GVBM');
    XLSX.writeFile(wb, `Mau_Danh_Sach_Giao_Vien_Bo_Mon_${className.replace(/\s+/g, '_')}.xlsx`);
  };

  const getSubjectBadgeColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('toán')) return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (s.includes('văn')) return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    if (s.includes('anh')) return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (s.includes('lý')) return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (s.includes('hóa')) return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (s.includes('sinh')) return 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    if (s.includes('sử') || s.includes('địa')) return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    if (s.includes('tin')) return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Hidden File Input for Direct Card Camera Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleCardAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-[#002244] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold border border-white/15">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Phân Hệ Quản Lý Hội Đồng Sư Phạm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Danh Sách Giáo Viên Bộ Môn {className}
            </h1>
            <p className="text-sm text-blue-100/90 font-medium max-w-2xl">
              Tổng hợp toàn bộ Thầy/Cô giáo bộ môn giảng dạy trực tiếp cho {className}. GVCN: <strong className="text-amber-300">{gvcnName}</strong>.
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm GVBM Mới</span>
              </button>

              <button
                onClick={() => {
                  setImportFile(null);
                  setParsedTeachers([]);
                  setImportError(null);
                  setIsImportModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
              >
                <UploadCloud className="w-4 h-4 text-cyan-300" />
                <span>Tải Từ Máy Tính</span>
              </button>

              <button
                onClick={downloadSampleTemplate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 font-bold text-xs border border-emerald-400/40 transition-all cursor-pointer backdrop-blur-xs"
                title="Tải file Excel mẫu (.xlsx) để điền thông tin và cập nhật lên hệ thống"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Tải File Mẫu Excel</span>
              </button>

              <button
                onClick={() => setIsConfirmClearModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs border border-rose-400/30 transition-all cursor-pointer"
                title="Xoá toàn bộ dữ liệu hoặc khôi phục mặc định"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Xoá Hết Dữ Liệu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Số GVBM
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {subjectTeachers.length} <span className="text-xs font-normal text-slate-500">Thầy/Cô</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Số Tiết/Tuần
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalPeriods} <span className="text-xs font-normal text-slate-500">tiết/tuần</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Liên Lạc Trực Tiếp
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              100% <span className="text-xs font-normal text-slate-500">Có SĐT/Zalo</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center flex-shrink-0">
            <School className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Khối / Lớp
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {className}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên GV, môn học, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View mode */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả môn học ({subjectTeachers.length})</option>
              {subjectList.map((sub) => (
                <option key={sub} value={sub}>
                  Môn {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng thẻ"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Display Section */}
      {filteredTeachers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Chưa có Giáo viên bộ môn nào trong danh sách
            </h3>
            <p className="text-xs text-slate-400">
              Bạn có thể thêm từng Thầy/Cô mới, hoặc tải file Excel danh sách từ máy tính lên.
            </p>
          </div>
          {canManage && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                Thêm Thủ Công
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                Tải File Từ Máy
              </button>
              {onResetDefaultTeachers && (
                <button
                  onClick={onResetDefaultTeachers}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/30 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Khôi Phục Mẫu 12 Môn
                </button>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const badgeColor = getSubjectBadgeColor(teacher.subjectName);

            return (
              <div
                key={teacher.id}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="space-y-4">
                  {/* Card Header: Subject Badge & Action Menu */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${badgeColor} shadow-2xs`}
                    >
                      {teacher.subjectName}
                    </span>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(teacher.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Xoá GVBM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Teacher Avatar & Camera Button */}
                  <div className="flex items-start gap-3.5 pt-1">
                    <div
                      onClick={() => triggerCardAvatarUpload(teacher.id)}
                      className="relative group/avatar cursor-pointer flex-shrink-0"
                      title="Bấm để thay đổi ảnh đại diện Thầy/Cô"
                    >
                      {teacher.avatar ? (
                        <img
                          src={teacher.avatar}
                          alt={teacher.teacherName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md group-hover/avatar:opacity-85 transition-opacity"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 text-white font-black text-lg flex items-center justify-center shadow-md group-hover/avatar:brightness-110 transition-all">
                          {teacher.teacherName.split(' ').pop()?.[0] || 'T'}
                        </div>
                      )}

                      {/* Always visible Camera Badge Icon */}
                      <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform group-hover/avatar:scale-110 active:scale-95">
                        <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>

                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-extrabold backdrop-blur-3xs">
                        <Camera className="w-4 h-4 mb-0.5" />
                        <span>Đổi ảnh</span>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {teacher.teacherName}
                        </h3>
                        {teacher.roleBadge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            {teacher.roleBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {teacher.periodsPerWeek || 2} tiết/tuần
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info lines */}
                  <div className="space-y-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        SĐT / Zalo:
                      </span>
                      <a
                        href={`tel:${teacher.phone}`}
                        className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600"
                      >
                        {teacher.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2 font-medium">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        Email:
                      </span>
                      <a
                        href={`mailto:${teacher.email}`}
                        className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px] hover:text-blue-600"
                      >
                        {teacher.email || 'Chưa cập nhật'}
                      </a>
                    </div>

                    {teacher.notes && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[11px] font-medium leading-relaxed">
                        <strong className="font-bold text-slate-700 dark:text-slate-200">Ghi chú: </strong>
                        {teacher.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action buttons Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${teacher.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/80 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi Điện</span>
                  </a>

                  <a
                    href={`https://zalo.me/${teacher.phone?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800/80 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Nhắn Zalo</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 pl-6">STT</th>
                  <th className="p-4">Ảnh / Môn</th>
                  <th className="p-4">Họ và Tên Giáo Viên</th>
                  <th className="p-4">Số Tiết/Tuần</th>
                  <th className="p-4">Số Điện Thoại (Zalo)</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Ghi Chú Chuyên Môn</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {filteredTeachers.map((teacher, index) => {
                  const badgeColor = getSubjectBadgeColor(teacher.subjectName);

                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-400">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => triggerCardAvatarUpload(teacher.id)}
                            className="relative group/tblavatar cursor-pointer"
                            title="Bấm để thay đổi ảnh đại diện Thầy/Cô"
                          >
                            {teacher.avatar ? (
                              <img
                                src={teacher.avatar}
                                alt={teacher.teacherName}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                {teacher.teacherName.split(' ').pop()?.[0] || 'T'}
                              </div>
                            )}
                            <div
                              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-white dark:border-slate-900"
                            >
                              <Camera className="w-2.5 h-2.5" />
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${badgeColor}`}>
                            {teacher.subjectName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        {teacher.teacherName}
                      </td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                        {teacher.periodsPerWeek || 2} tiết
                      </td>
                      <td className="p-4">
                        <a
                          href={`tel:${teacher.phone}`}
                          className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600"
                        >
                          {teacher.phone}
                        </a>
                      </td>
                      <td className="p-4 text-slate-500">{teacher.email}</td>
                      <td className="p-4 text-slate-500 max-w-xs truncate">
                        {teacher.notes || '-'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://zalo.me/${teacher.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                            title="Chat Zalo"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEditModal(teacher)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingId(teacher.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xoá"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Subject Teacher */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                {editingTeacher ? 'Chỉnh Sửa GVBM' : 'Thêm Giáo Viên Bộ Môn Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              {/* Form Avatar Picker */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-300 dark:border-slate-600 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {teacherName.split(' ').pop()?.[0] || 'GV'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => formAvatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
                    title="Chọn ảnh từ máy"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={formAvatarInputRef}
                  onChange={handleFormAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ảnh Đại Diện Thầy/Cô:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => formAvatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Tải ảnh từ máy
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"
                      >
                        Gỡ ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Môn Học Giảng Dạy *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Toán Học, Ngữ Văn, Tiếng Anh..."
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và Tên Thầy/Cô *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thầy Nguyễn Văn An"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại (Zalo)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 0912.345.678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Tiết Giảng Dạy/Tuần
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={periodsPerWeek}
                    onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ Email Liên Hệ
                </label>
                <input
                  type="email"
                  placeholder="VD: nguyenvanan.gv@tnh.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Nhiệm Vụ & Danh Hiệu
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Thạc sĩ chuyên môn, Bồi dưỡng học sinh giỏi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  {editingTeacher ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Single Teacher Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Xác Nhận Xoá Giáo Viên?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa giáo viên bộ môn này khỏi danh sách lớp?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Xác Nhận Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear All Data / Reset Modal */}
      {isConfirmClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Xoá Dữ Liệu Giáo Viên Bộ Môn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bạn đang lựa chọn xoá danh sách Giáo Viên Bộ Môn hiện tại ({subjectTeachers.length} Thầy/Cô). Hãy chọn thao tác bạn muốn thực hiện:
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  onClearAllTeachers();
                  setIsConfirmClearModalOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>XOÁ HẾT VỀ TRỐNG (0 DỮ LIỆU)</span>
              </button>

              {onResetDefaultTeachers && (
                <button
                  onClick={() => {
                    onResetDefaultTeachers();
                    setIsConfirmClearModalOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>KHÔI PHỤC MẶC ĐỊNH (12 MÔN)</span>
                </button>
              )}

              <button
                onClick={() => setIsConfirmClearModalOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Teachers From Excel / CSV File */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-[#002244] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-300" />
                  Tải Danh Sách GVBM Từ Máy Tính
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Hỗ trợ định dạng Excel (.xlsx, .xls) và CSV
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* File Dropzone */}
              <div className="space-y-2">
                <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3 transition-colors">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {importFile ? importFile.name : 'Kéo thả file Excel/CSV vào đây hoặc bấm tải lên'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Cột chấp nhận: Môn Học, Họ Tên Giáo Viên, SĐT, Email, Số Tiết, Ghi Chú
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md">
                    <UploadCloud className="w-4 h-4" />
                    <span>Chọn File Từ Máy</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Chưa có file chuẩn cấu trúc?</span>
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải File Mẫu Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Parsing status */}
              {isParsing && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang đọc dữ liệu từ file Excel...</span>
                </div>
              )}

              {importError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedTeachers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã trích xuất thành công {parsedTeachers.length} Thầy/Cô từ file
                    </span>
                  </div>

                  {/* Mode selector */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chế Độ Nhập Dữ Liệu:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          importMode === 'merge'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Thêm nối tiếp (+{parsedTeachers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          importMode === 'replace'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        Thay thế toàn bộ danh sách
                      </button>
                    </div>
                  </div>

                  {/* Table snippet */}
                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5 pl-3">Môn Học</th>
                          <th className="p-2.5">Họ và Tên</th>
                          <th className="p-2.5">SĐT</th>
                          <th className="p-2.5">Số Tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-2.5 pl-3 font-bold text-blue-600">{t.subjectName}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{t.teacherName}</td>
                            <td className="p-2.5">{t.phone || '-'}</td>
                            <td className="p-2.5">{t.periodsPerWeek} tiết</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={parsedTeachers.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>XÁC NHẬN NHẬP ({parsedTeachers.length} GVBM)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
