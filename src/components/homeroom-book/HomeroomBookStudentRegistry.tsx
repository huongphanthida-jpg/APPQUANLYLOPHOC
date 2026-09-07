import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  User,
  Phone,
  MapPin,
  Heart,
  Briefcase,
  Download,
  Calendar,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Student, UserRole } from '../../types';
import { EditStudentRecordModal } from './EditStudentRecordModal';

interface HomeroomBookStudentRegistryProps {
  students: Student[];
  role: UserRole;
  onSelectStudent?: (student: Student) => void;
  onUpdateStudents?: (students: Student[]) => void;
}

export const HomeroomBookStudentRegistry: React.FC<HomeroomBookStudentRegistryProps> = ({
  students,
  role,
  onSelectStudent,
  onUpdateStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Nam' | 'Nữ'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentToEdit, setSelectedStudentToEdit] = useState<Student | null>(null);

  const canEdit = role === 'gvcn';

  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const matchSearch难以 =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone || '').includes(searchTerm) ||
        (s.emergencyContact?.parentName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;

      return matchSearch难以 && matchGroup && matchGender;
    });
  }, [students, searchTerm, selectedGroup, selectedGender]);

  const handleOpenAddStudent = () => {
    setSelectedStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi danh sách lớp 12A1?')) return;
    const updated = (students || []).filter((s) => s.id !== studentId);
    if (onUpdateStudents) onUpdateStudents(updated);
  };

  const handleSaveStudent = (savedStudent: Student) => {
    let updated = [...(students || [])];
    const existingIndex = updated.findIndex((s) => s.id === savedStudent.id);
    if (existingIndex >= 0) {
      updated[existingIndex] = savedStudent;
    } else {
      updated.push(savedStudent);
    }
    if (onUpdateStudents) onUpdateStudents(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                PHẦN 3: SƠ YẾU LÝ LỊCH & DANH SÁCH TRÍCH NGANG HỌC SINH
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Hồ sơ thông tin cá nhân, nhân thân gia đình, địa chỉ thường trú và ghi chú sức khỏe 36 học sinh
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddStudent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm Học Sinh Mới</span>
              </button>
            )}
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#003366] text-xs font-black border border-blue-200">
              Hiển thị: {filteredStudents.length} / {(students || []).length} Học sinh
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã HS, SĐT, tên PHHS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các Tổ (Tổ 1 - 4)</option>
              <option value={1}>Tổ 1 (Dãy 1)</option>
              <option value={2}>Tổ 2 (Dãy 2)</option>
              <option value={3}>Tổ 3 (Dãy 3)</option>
              <option value={4}>Tổ 4 (Dãy 4)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả Giới tính</option>
              <option value="Nam">Học sinh Nam</option>
              <option value="Nữ">Học sinh Nữ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Mã Định Danh</th>
                <th className="py-3 px-4">Họ và Tên Học Sinh</th>
                <th className="py-3 px-3 text-center">Giới Tính</th>
                <th className="py-3 px-3">Ngày Sinh</th>
                <th className="py-3 px-3 text-center">Tổ</th>
                <th className="py-3 px-3">Điện Thoại HS</th>
                <th className="py-3 px-4">Địa Chỉ Thường Trú</th>
                <th className="py-3 px-4">Họ Tên & SĐT Phụ Huynh</th>
                <th className="py-3 px-3">Sở Trường / Lưu Ý</th>
                {canEdit && <th className="py-3 px-3 text-center w-24">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectStudent && onSelectStudent(s)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-900 text-[11px] whitespace-nowrap">
                    {s.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {s.avatar ? (
                        <img
                          src={s.avatar}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.gender}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {s.dob}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-[#003366]">
                    Tổ {s.group}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                    {s.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={s.address}>
                    {s.address}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">
                        {s.emergencyContact?.parentName} ({s.emergencyContact?.relationship || 'Bố'})
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {s.emergencyContact?.phone}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs truncate" title={`${s.strengths || ''} | ${s.healthNote || ''}`}>
                    {s.healthNote ? (
                      <span className="text-rose-700 font-semibold block">{s.healthNote}</span>
                    ) : (
                      <span>{s.strengths?.slice(0, 35)}...</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditStudent(s, e)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Sửa hồ sơ học sinh này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteStudent(s.id, e)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Record Modal */}
      {isModalOpen && (
        <EditStudentRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={selectedStudentToEdit}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
};
