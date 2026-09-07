import React, { useState } from 'react';
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
} from 'lucide-react';
import { SubjectTeacher, UserRole, ClassInfo, TeacherInfo } from '../types';

interface SubjectTeachersViewProps {
  subjectTeachers: SubjectTeacher[];
  onAddTeacher: (teacher: Omit<SubjectTeacher, 'id'>) => void;
  onUpdateTeacher: (teacher: SubjectTeacher) => void;
  onDeleteTeacher: (id: string) => void;
  role: UserRole;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
}

export const SubjectTeachersView: React.FC<SubjectTeachersViewProps> = ({
  subjectTeachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
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

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(2);
  const [notes, setNotes] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [roleBadge, setRoleBadge] = useState('');

  const className = classInfo?.className || 'LỚP 11D5';
  const gvcnName = teacherInfo?.name || 'Cô Phan Thị Dạ Hương';

  const canManage = role === 'gvcn' || role === 'bgh';

  // Get unique list of subject names for filter
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

  const openAddModal = () => {
    setSubjectName('');
    setTeacherName('');
    setPhone('');
    setEmail('');
    setPeriodsPerWeek(2);
    setNotes('');
    setOfficeHours('');
    setRoleBadge('');
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
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm GVBM Mới</span>
            </button>
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
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy Giáo viên bộ môn phù hợp
          </h3>
          <p className="text-xs text-slate-400">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn lọc môn học khác.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const badgeColor = getSubjectBadgeColor(teacher.subjectName);
            const isGvcn = teacher.subjectName.toLowerCase().includes('gvcn');

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

                  {/* Teacher Avatar & Info */}
                  <div className="flex items-start gap-3.5 pt-1">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                      {teacher.teacherName.split(' ').pop()?.[0] || 'T'}
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
                  <th className="p-4">Môn Giảng Dạy</th>
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
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${badgeColor}`}>
                          {teacher.subjectName}
                        </span>
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

      {/* Confirm Delete Modal */}
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
    </div>
  );
};
