import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Phone,
  Briefcase,
  Layers,
  HeartHandshake,
  Award,
  Plus,
  Edit2,
  Edit3,
  Calendar,
  Trash2,
  AlertCircle,
  X,
  Save,
  Check,
} from 'lucide-react';
import { ClassCommitteeRole, ParentsBoardMember, Student, UserRole, ClassInfo, TeacherInfo, BghInfo } from '../../types';
import { EditCommitteeModal } from './EditCommitteeModal';
import { EditParentsBoardModal } from './EditParentsBoardModal';

interface HomeroomBookOrganizationSectionProps {
  committee: ClassCommitteeRole[];
  parentsBoard: ParentsBoardMember[];
  students: Student[];
  className?: string;
  academicYear?: string;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  bghInfo?: BghInfo;
  role: UserRole;
  onUpdateCommittee?: (newCommittee: ClassCommitteeRole[]) => void;
  onUpdateParentsBoard?: (newBoard: ParentsBoardMember[]) => void;
  onUpdateAdministrative?: (data: {
    classInfo: ClassInfo;
    teacherInfo: TeacherInfo;
    bghInfo: BghInfo;
    academicYear: string;
  }) => void;
}

export const HomeroomBookOrganizationSection: React.FC<HomeroomBookOrganizationSectionProps> = ({
  committee,
  parentsBoard,
  students,
  className,
  academicYear,
  classInfo,
  teacherInfo,
  bghInfo,
  role,
  onUpdateCommittee,
  onUpdateParentsBoard,
  onUpdateAdministrative,
}) => {
  // Modals state
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [selectedCommitteeIndex, setSelectedCommitteeIndex] = useState<number | null>(null);
  const [selectedCommitteeItem, setSelectedCommitteeItem] = useState<ClassCommitteeRole | null>(null);

  const [isParentsModalOpen, setIsParentsModalOpen] = useState(false);
  const [selectedParentsMember, setSelectedParentsMember] = useState<ParentsBoardMember | null>(null);

  const [isEditYearModalOpen, setIsEditYearModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState<string>(
    academicYear || classInfo?.academicYear || '2025 - 2026'
  );

  const displayAcademicYear = academicYear || classInfo?.academicYear || yearInput || '2025 - 2026';

  const [isEditingYearInline, setIsEditingYearInline] = useState(false);
  const [inlineYearValue, setInlineYearValue] = useState<string>(displayAcademicYear);

  const handleSaveAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearInput.trim()) return;

    if (onUpdateAdministrative) {
      onUpdateAdministrative({
        classInfo: {
          ...classInfo,
          className: className || classInfo?.className || '12A1',
          academicYear: yearInput.trim(),
          schoolName: classInfo?.schoolName || 'THPT TRẦN NGUYÊN HÃN',
        },
        teacherInfo: teacherInfo || { name: 'Nguyễn Văn A' },
        bghInfo: bghInfo || { name: 'TS. Lê Thị Mai' },
        academicYear: yearInput.trim(),
      });
    }
    setIsEditYearModalOpen(false);
  };

  const handleSaveAcademicYearInline = (newValue: string) => {
    if (!newValue.trim()) return;
    setYearInput(newValue.trim());

    if (onUpdateAdministrative) {
      onUpdateAdministrative({
        classInfo: {
          ...classInfo,
          className: className || classInfo?.className || '12A1',
          academicYear: newValue.trim(),
          schoolName: classInfo?.schoolName || 'THPT TRẦN NGUYÊN HÃN',
        },
        teacherInfo: teacherInfo || { name: 'Nguyễn Văn A' },
        bghInfo: bghInfo || { name: 'TS. Lê Thị Mai' },
        academicYear: newValue.trim(),
      });
    }
    setIsEditingYearInline(false);
  };

  const [groupLeaders, setGroupLeaders] = useState<{ [key: number]: string }>(() => {
    const saved = localStorage.getItem('homeroom_group_leaders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      1: 'Nguyễn Hoàng Long',
      2: 'Đỗ Hải Đăng',
      3: 'Vũ Đức Trọng',
      4: 'Hoàng Nhật Minh',
    };
  });
  const [isEditLeadersModalOpen, setIsEditLeadersModalOpen] = useState(false);
  const [editLeadersForm, setEditLeadersForm] = useState<{ [key: number]: string }>(groupLeaders);

  const handleSaveLeaders = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupLeaders(editLeadersForm);
    localStorage.setItem('homeroom_group_leaders', JSON.stringify(editLeadersForm));
    setIsEditLeadersModalOpen(false);
  };

  // Group students by team
  const group1Students = (students || []).filter((s) => s.group === 1);
  const group2Students = (students || []).filter((s) => s.group === 2);
  const group3Students = (students || []).filter((s) => s.group === 3);
  const group4Students = (students || []).filter((s) => s.group === 4);

  const canEdit = role === 'gvcn';

  // Committee handlers
  const handleOpenAddCommittee = () => {
    setSelectedCommitteeIndex(null);
    setSelectedCommitteeItem(null);
    setIsCommitteeModalOpen(true);
  };

  const handleOpenEditCommittee = (item: ClassCommitteeRole, index: number) => {
    setSelectedCommitteeIndex(index);
    setSelectedCommitteeItem(item);
    setIsCommitteeModalOpen(true);
  };

  const handleDeleteCommittee = (index: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên ban cán sự này khỏi danh sách?')) return;
    const updated = (committee || []).filter((_, idx) => idx !== index);
    if (onUpdateCommittee) onUpdateCommittee(updated);
  };

  const handleSaveCommittee = (savedItem: ClassCommitteeRole) => {
    let updated = [...(committee || [])];
    if (selectedCommitteeIndex !== null) {
      updated[selectedCommitteeIndex] = savedItem;
    } else {
      updated.push(savedItem);
    }
    if (onUpdateCommittee) onUpdateCommittee(updated);
  };

  // Parents Board handlers
  const handleOpenAddParentsBoard = () => {
    setSelectedParentsMember(null);
    setIsParentsModalOpen(true);
  };

  const handleOpenEditParentsBoard = (item: ParentsBoardMember) => {
    setSelectedParentsMember(item);
    setIsParentsModalOpen(true);
  };

  const handleDeleteParentsBoard = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phụ huynh này khỏi ban đại diện CMHS?')) return;
    const updated = (parentsBoard || []).filter((p) => p.id !== id);
    if (onUpdateParentsBoard) onUpdateParentsBoard(updated);
  };

  const handleSaveParentsBoard = (savedMember: ParentsBoardMember) => {
    let updated = [...(parentsBoard || [])];
    const existingIndex = updated.findIndex((p) => p.id === savedMember.id);
    if (existingIndex >= 0) {
      updated[existingIndex] = savedMember;
    } else {
      updated.push(savedMember);
    }
    if (onUpdateParentsBoard) onUpdateParentsBoard(updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 2: TỔ CHỨC LỚP & BAN ĐẠI DIỆN CHA MẸ HỌC SINH
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Cơ cấu bộ máy Ban cán sự lớp, Ban chấp hành Chi đoàn, Ban đại diện CMHS và danh sách 4 Tổ
            </p>
          </div>
        </div>
      </div>

      {/* 1. Ban Cán Sự Lớp & Chi Đoàn */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            1. Danh Sách Ban Cán Sự Lớp & BCH Chi Đoàn {className || '12A1'}
          </h4>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              {(committee || []).length} Thành viên nòng cốt
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddCommittee}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Cán Sự</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(committee || []).map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003366] text-[11px] font-black">
                  {c.roleName}
                </span>
                
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCommittee(c, idx)}
                        className="p-1 rounded bg-white text-blue-600 hover:bg-blue-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCommittee(idx)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 text-sm">{c.studentName}</h5>
                <p className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {c.phone}
                </p>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Nhiệm vụ:</span> {c.mainDuty}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Ban Đại Diện Cha Mẹ Học Sinh */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0" />
            {isEditingYearInline ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAcademicYearInline(inlineYearValue);
                }}
                className="flex items-center gap-2 flex-wrap"
              >
                <span className="text-sm font-black text-[#003366] uppercase tracking-wider">
                  2. BAN ĐẠI DIỆN CHA MẸ HỌC SINH NĂM HỌC
                </span>
                <input
                  type="text"
                  value={inlineYearValue}
                  onChange={(e) => setInlineYearValue(e.target.value)}
                  autoFocus
                  placeholder="2025 - 2026"
                  className="py-1 px-2.5 rounded-lg bg-purple-50 border-2 border-purple-500 text-sm font-black text-purple-900 focus:outline-none w-36 shadow-inner"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                  title="Lưu năm học mới"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingYearInline(false)}
                  className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                  title="Hủy bỏ"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider">
                  2. Ban Đại Diện Cha Mẹ Học Sinh Năm Học {displayAcademicYear}
                </h4>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setInlineYearValue(displayAcademicYear);
                      setIsEditingYearInline(true);
                    }}
                    className="p-1.5 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-700 hover:text-white border border-purple-300 transition-all cursor-pointer shadow-2xs group flex items-center gap-1 text-xs font-bold"
                    title="Tự điều chỉnh năm học Ban Đại Diện CMHS (Bấm để sửa trực tiếp)"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-700 group-hover:text-white" />
                    <span className="text-[11px] font-bold">Sửa Năm Học</span>
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
              {(parentsBoard || []).length} Đại diện các tổ
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddParentsBoard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Đại Diện PH</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(parentsBoard || []).map((p, idx) => (
            <div
              key={p.id || idx}
              className="p-4 rounded-xl bg-purple-50/30 border border-purple-100 hover:border-purple-300 transition-all space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    p.role === 'Trưởng ban'
                      ? 'bg-purple-700 text-white'
                      : p.role === 'Phó ban'
                      ? 'bg-purple-200 text-purple-900'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {p.role}
                </span>

                <div className="flex items-center gap-1">
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditParentsBoard(p)}
                        className="p-1 rounded bg-white text-purple-600 hover:bg-purple-100 shadow-xs cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteParentsBoard(p.id)}
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-100 shadow-xs cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] text-purple-600 font-semibold">{p.studentName}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 text-sm">{p.fullName}</h5>
                <p className="text-xs text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {p.phone}
                </p>
              </div>

              <div className="pt-1.5 border-t border-purple-100/70 text-[11px] text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{p.workplace}</span>
                </p>
                {p.notes && <p className="text-[10px] text-slate-500 italic">{p.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Phân Chia 4 Tổ & Thành Viên */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            3. Danh Sách Phân Biên Chế 4 Tổ Học Sinh ({students?.length || 0} Học Sinh)
          </h4>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditLeadersForm(groupLeaders);
                setIsEditLeadersModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold border border-blue-200 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Chỉnh Sửa Tổ Trưởng 4 Tổ</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tổ 1 */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="font-black text-blue-900 text-sm uppercase">TỔ 1 (Dãy 1)</span>
              <span className="text-xs font-bold text-blue-700">{group1Students.length} HS</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Tổ trưởng: <span className="text-blue-900 font-black">{groupLeaders[1] || 'Nguyễn Hoàng Long'}</span>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
              {group1Students.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between py-1 border-b border-blue-100/60">
                  <span className="font-medium truncate">{i + 1}. {s.name}</span>
                  <span className="text-[10px] text-slate-500">{s.gender}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tổ 2 */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="font-black text-emerald-900 text-sm uppercase">TỔ 2 (Dãy 2)</span>
              <span className="text-xs font-bold text-emerald-700">{group2Students.length} HS</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Tổ trưởng: <span className="text-emerald-900 font-black">{groupLeaders[2] || 'Đỗ Hải Đăng'}</span>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
              {group2Students.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between py-1 border-b border-emerald-100/60">
                  <span className="font-medium truncate">{i + 1}. {s.name}</span>
                  <span className="text-[10px] text-slate-500">{s.gender}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tổ 3 */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200">
              <span className="font-black text-purple-900 text-sm uppercase">TỔ 3 (Dãy 3)</span>
              <span className="text-xs font-bold text-purple-700">{group3Students.length} HS</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Tổ trưởng: <span className="text-purple-900 font-black">{groupLeaders[3] || 'Vũ Đức Trọng'}</span>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
              {group3Students.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between py-1 border-b border-purple-100/60">
                  <span className="font-medium truncate">{i + 1}. {s.name}</span>
                  <span className="text-[10px] text-slate-500">{s.gender}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tổ 4 */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="font-black text-amber-900 text-sm uppercase">TỔ 4 (Dãy 4)</span>
              <span className="text-xs font-bold text-amber-700">{group4Students.length} HS</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Tổ trưởng: <span className="text-amber-900 font-black">{groupLeaders[4] || 'Hoàng Nhật Minh'}</span>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
              {group4Students.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between py-1 border-b border-amber-100/60">
                  <span className="font-medium truncate">{i + 1}. {s.name}</span>
                  <span className="text-[10px] text-slate-500">{s.gender}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Chỉnh sửa Tổ trưởng */}
      {isEditLeadersModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Chỉnh Sửa Tổ Trưởng 4 Tổ</h3>
                  <p className="text-xs text-blue-200 font-medium">Cập nhật họ tên phụ trách của 4 tổ học sinh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditLeadersModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeaders} className="p-6 space-y-4 text-xs">
              {[1, 2, 3, 4].map((g) => (
                <div key={g}>
                  <label className="font-bold text-slate-700 block mb-1">
                    Họ tên Tổ Trưởng Tổ {g} (Dãy {g}):
                  </label>
                  <input
                    type="text"
                    required
                    value={editLeadersForm[g] || ''}
                    onChange={(e) =>
                      setEditLeadersForm({
                        ...editLeadersForm,
                        [g]: e.target.value,
                      })
                    }
                    placeholder={`Nhập tên tổ trưởng tổ ${g}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditLeadersModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Committee Modal */}
      {isCommitteeModalOpen && (
        <EditCommitteeModal
          isOpen={isCommitteeModalOpen}
          onClose={() => setIsCommitteeModalOpen(false)}
          committeeItem={selectedCommitteeItem}
          students={students}
          onSave={handleSaveCommittee}
        />
      )}

      {/* Edit Parents Board Modal */}
      {isParentsModalOpen && (
        <EditParentsBoardModal
          isOpen={isParentsModalOpen}
          onClose={() => setIsParentsModalOpen(false)}
          memberItem={selectedParentsMember}
          students={students}
          onSave={handleSaveParentsBoard}
        />
      )}

      {/* Modal Chỉnh Sửa Năm Học */}
      {isEditYearModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Chỉnh Sửa Năm Học CMHS</h3>
                  <p className="text-xs text-purple-200 font-medium">Cập nhật niên khóa hoạt động của Ban Đại Diện CMHS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditYearModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademicYear} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Nhập / Chọn Năm Học:
                </label>
                <input
                  type="text"
                  required
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="VD: 2025 - 2026, 2026 - 2027..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">Chọn nhanh năm học mẫu:</span>
                <div className="flex flex-wrap gap-2">
                  {['2025 - 2026', '2026 - 2027', '2027 - 2028', '2024 - 2025'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYearInput(yr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        yearInput === yr
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditYearModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Lưu Năm Học Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeroomBookOrganizationSection;
