import React, { useState, useRef, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  HeartPulse,
  Award,
  GraduationCap,
  Download,
  Eye,
  Edit,
  ShieldCheck,
  Sparkles,
  MapPin,
  Trash2,
  UploadCloud,
  Camera,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  Type,
  Wand2,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, UserRole, ClassInfo, TeacherInfo, GoogleSheetConfig } from '../types';
import { ImportStudentsModal } from './ImportStudentsModal';
import { ConfirmModal } from './ConfirmModal';
import { VietnameseFontRepairModal } from './VietnameseFontRepairModal';
import { hasFontCorruption } from '../utils/vietnameseEncoding';

interface StudentsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddNewStudent: () => void;
  onOpenAiEvaluation: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onClearAllStudents?: () => void;
  onImportStudents?: (importedStudents: Student[], mode: 'merge' | 'replace') => void;
  onUpdateStudentAvatar?: (studentId: string, newAvatar: string) => void;
  role: UserRole;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onOpenGoogleSheetSync?: () => void;
  googleSheetConfig?: GoogleSheetConfig;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onSelectStudent,
  onAddNewStudent,
  onOpenAiEvaluation,
  onDeleteStudent,
  onClearAllStudents,
  onImportStudents,
  onUpdateStudentAvatar,
  role,
  searchQuery,
  setSearchQuery,
  classInfo,
  teacherInfo,
  onOpenGoogleSheetSync,
  googleSheetConfig,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFontRepairModalOpen, setIsFontRepairModalOpen] = useState(false);
  const [activeAvatarStudentId, setActiveAvatarStudentId] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Count how many students currently suffer from font/encoding corruption (?, , mojibake)
  const corruptedCount = useMemo(() => {
    return students.filter(
      (s) =>
        hasFontCorruption(s.name) ||
        hasFontCorruption(s.strengths) ||
        hasFontCorruption(s.emergencyContact?.parentName || '') ||
        hasFontCorruption(s.careerAspiration) ||
        hasFontCorruption(s.address)
    ).length;
  }, [students]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.emergencyContact.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emergencyContact.phone.includes(searchQuery) ||
      s.strengths.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAvatarStudentId || !onUpdateStudentAvatar) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateStudentAvatar(activeAvatarStudentId, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so selecting same file triggers change
    e.target.value = '';
  };

  const triggerAvatarUpload = (studentId: string) => {
    setActiveAvatarStudentId(studentId);
    avatarFileInputRef.current?.click();
  };

  const exportExcel = () => {
    const exportData = students.map((s) => ({
      'Mã HS': s.code,
      'Họ và Tên': s.name,
      'Giới tính': s.gender,
      'Ngày sinh': s.dob,
      'Tổ': s.group,
      'SĐT': s.phone,
      'Email': s.email,
      'Địa chỉ': s.address,
      'Sở trường năng khiếu': s.strengths,
      'Định hướng nghề nghiệp': s.careerAspiration,
      'Ghi chú sức khỏe': s.healthNote,
      'Họ tên phụ huynh': s.emergencyContact.parentName,
      'Quan hệ': s.emergencyContact.relationship,
      'SĐT phụ huynh': s.emergencyContact.phone,
      'Nơi công tác phụ huynh': s.emergencyContact.workplace,
      'Toán ĐTB': s.grades.math.avg,
      'Lý ĐTB': s.grades.physics.avg,
      'Hóa ĐTB': s.grades.chemistry.avg,
      'Sinh ĐTB': s.grades.biology.avg,
      'Văn ĐTB': s.grades.literature.avg,
      'Anh ĐTB': s.grades.english.avg,
      'ĐTB Khối A': s.grades.gpa,
      'Hạnh kiểm': s.conductRating,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 8 },
      { wch: 14 }, { wch: 24 }, { wch: 34 }, { wch: 30 }, { wch: 34 },
      { wch: 26 }, { wch: 22 }, { wch: 10 }, { wch: 16 }, { wch: 28 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    const safeClassName = (classInfo?.className || '12A1').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.utils.book_append_sheet(wb, ws, `DS_Hoc_Sinh_${safeClassName}`);
    XLSX.writeFile(wb, `Danh_Sach_${safeClassName}_THPT_Tran_Nguyen_Han.xlsx`);
  };

  const exportRoster = () => {
    const csvContent =
      '\uFEFF' +
      'Mã HS,Họ và Tên,Giới tính,Ngày sinh,Tổ,SĐT,Địa chỉ,Sở trường,Định hướng,Phụ huynh,SĐT Phụ huynh,ĐTB Khối A,Hạnh kiểm\n' +
      students
        .map(
          (s) =>
            `"${s.code}","${s.name}","${s.gender}","${s.dob}",${s.group},"${s.phone}","${s.address}","${s.strengths}","${s.careerAspiration}","${s.emergencyContact.parentName}","${s.emergencyContact.phone}",${s.grades.gpa},"${s.conductRating}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeClassName = (classInfo?.className || '12A1').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Danh_sach_${safeClassName}_THPT_Tran_Nguyen_Han.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="students-view" className="space-y-6 pb-12">
      {/* Hidden File Input for Avatar Changes */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* Import Modal */}
      {isImportModalOpen && onImportStudents && (
        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={onImportStudents}
          currentCount={students.length}
          classInfo={classInfo}
          existingStudents={students}
          onOpenGoogleSheetModal={onOpenGoogleSheetSync}
        />
      )}

      {/* Vietnamese Font Repair Modal */}
      {isFontRepairModalOpen && onImportStudents && (
        <VietnameseFontRepairModal
          isOpen={isFontRepairModalOpen}
          onClose={() => setIsFontRepairModalOpen(false)}
          students={students}
          onSaveRepairedStudents={(updatedList) => {
            onImportStudents(updatedList, 'replace');
          }}
        />
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#003366]">
              DANH SÁCH HỒ SƠ
            </span>
            <span className="text-xs text-slate-400">
              {classInfo?.className || 'Lớp 12A1'} ({students.length} Học sinh)
            </span>
            {googleSheetConfig?.sheetUrl && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Google Sheet Connected</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#003366] mt-1">
            Quản Lý Hồ Sơ Học Sinh
          </h2>
          <p className="text-xs text-slate-500">
            Hồ sơ tích hợp: Sở trường, định hướng đại học, liên hệ khẩn cấp & dữ liệu học tập
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kết Nối Database Google Sheet Trực Tuyến */}
          {role === 'gvcn' && onOpenGoogleSheetSync && (
            <button
              id="btn-open-google-sheet-sync"
              type="button"
              onClick={onOpenGoogleSheetSync}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Kết nối cơ sở dữ liệu danh sách học sinh từ Google Sheets"
            >
              <Globe className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>CSDL Google Sheet</span>
            </button>
          )}

          {/* Sửa lỗi font chữ / Khôi phục tiếng Việt */}
          {role === 'gvcn' && onImportStudents && (
            <button
              id="btn-repair-vietnamese-font"
              type="button"
              onClick={() => setIsFontRepairModalOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                corruptedCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-600 animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="Khắc phục lỗi font chữ, dấu hỏi chấm ?, ô vuông  trong danh sách học sinh"
            >
              <Type className="w-4 h-4 text-amber-900" />
              <span>Sửa Lỗi Font Chữ</span>
              {corruptedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                  {corruptedCount}
                </span>
              )}
            </button>
          )}

          {/* Tải lên File Excel */}
          {role === 'gvcn' && onImportStudents && (
            <button
              id="btn-import-students-sync"
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Tải danh sách học sinh từ file Excel / CSV"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>Tải Lên File Excel</span>
            </button>
          )}

          {/* Xuất Excel (.xlsx) */}
          <button
            id="btn-export-excel-students"
            type="button"
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            title="Xuất bảng tính Excel chuẩn (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {/* Xuất CSV */}
          <button
            id="btn-export-students"
            type="button"
            onClick={exportRoster}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Xuất tệp CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Thêm mới */}
          {role === 'gvcn' && (
            <button
              id="btn-add-student"
              type="button"
              onClick={onAddNewStudent}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Thêm Mới</span>
            </button>
          )}

          {/* Xoá toàn bộ danh sách */}
          {role === 'gvcn' && onClearAllStudents && students.length > 0 && (
            <button
              id="btn-clear-all-students"
              type="button"
              onClick={() => {
                setDeleteConfirmState({
                  isOpen: true,
                  title: 'Xác Nhận Xoá Toàn Bộ Danh Sách Học Sinh',
                  message: `Bạn có chắc chắn muốn xoá toàn bộ ${students.length} học sinh của lớp ${classInfo?.className || ''}? Thao tác này sẽ xoá tất cả dữ liệu hồ sơ học sinh hiện tại.`,
                  confirmText: 'Xác Nhận Xoá Tất Cả',
                  onConfirm: () => {
                    onClearAllStudents();
                  },
                });
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Xoá toàn bộ danh sách học sinh"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Xoá DS</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGroup === 'all'
                ? 'bg-[#003366] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          {[1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === g
                  ? 'bg-[#003366] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tổ {g} ({students.filter((s) => s.group === g).length})
            </button>
          ))}
        </div>

        {/* Search input in view */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, sở trường, phụ huynh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003366] text-slate-800"
          />
        </div>
      </div>

      {/* Students Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            id={`student-card-${student.id}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top row: Avatar & basic identity */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                    />
                    {role === 'gvcn' && onUpdateStudentAvatar && (
                      <button
                        type="button"
                        id={`btn-change-avatar-${student.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerAvatarUpload(student.id);
                        }}
                        title="Thay đổi ảnh đại diện học sinh"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#003366] hover:bg-blue-800 text-white flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110"
                      >
                        <Camera className="w-3 h-3 text-[#98FF98]" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#003366]/10 text-[#003366]">
                        TỔ {student.group}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.code}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-[#003366] transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{student.gender} • {student.dob}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#003366]">
                    {student.grades.gpa}
                  </span>
                  <span className="text-[10px] text-slate-400 block">ĐTB Khối A</span>
                </div>
              </div>

              {/* Strengths & Talents pill */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-3">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  Sở trường & Năng khiếu:
                </p>
                <p className="text-xs text-amber-950 font-medium line-clamp-2 mt-0.5">
                  {student.strengths}
                </p>
              </div>

              {/* Emergency Contact snippet */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-4">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] text-slate-400 font-medium">Phụ huynh:</span>
                  <span className="font-semibold text-slate-800">
                    {student.emergencyContact.parentName} ({student.emergencyContact.relationship})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] text-slate-400 font-medium">SĐT Khẩn:</span>
                  <a
                    href={`tel:${student.emergencyContact.phone}`}
                    className="font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> {student.emergencyContact.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                id={`btn-view-profile-${student.id}`}
                onClick={() => onSelectStudent(student)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem & Chỉnh Sửa</span>
              </button>

              {role === 'gvcn' && (
                <>
                  <button
                    id={`btn-edit-student-${student.id}`}
                    onClick={() => onSelectStudent(student)}
                    title="Chỉnh sửa thông tin học sinh"
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-ai-quick-eval-${student.id}`}
                    onClick={() => onOpenAiEvaluation(student)}
                    title="Viết nhận xét học bạ AI"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  {onDeleteStudent && (
                    <button
                      id={`btn-delete-student-${student.id}`}
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: 'Xác Nhận Xoá Học Sinh',
                          message: `Bạn có chắc chắn muốn xoá học sinh "${student.name}" (${student.code}) khỏi danh sách lớp ${classInfo?.className || ''}?`,
                          confirmText: 'Xoá Học Sinh',
                          onConfirm: () => {
                            onDeleteStudent(student.id);
                          },
                        });
                      }}
                      title="Xoá học sinh"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmState && (
        <ConfirmModal
          isOpen={deleteConfirmState.isOpen}
          onClose={() => setDeleteConfirmState(null)}
          onConfirm={deleteConfirmState.onConfirm}
          title={deleteConfirmState.title}
          message={deleteConfirmState.message}
          confirmText={deleteConfirmState.confirmText}
        />
      )}
    </div>
  );
};
