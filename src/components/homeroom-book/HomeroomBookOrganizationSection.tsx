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
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ClassCommitteeRole, ParentsBoardMember, Student, UserRole } from '../../types';
import { EditCommitteeModal } from './EditCommitteeModal';
import { EditParentsBoardModal } from './EditParentsBoardModal';

interface HomeroomBookOrganizationSectionProps {
  committee: ClassCommitteeRole[];
  parentsBoard: ParentsBoardMember[];
  students: Student[];
  role: UserRole;
  onUpdateCommittee?: (newCommittee: ClassCommitteeRole[]) => void;
  onUpdateParentsBoard?: (newBoard: ParentsBoardMember[]) => void;
}

export const HomeroomBookOrganizationSection: React.FC<HomeroomBookOrganizationSectionProps> = ({
  committee,
  parentsBoard,
  students,
  role,
  onUpdateCommittee,
  onUpdateParentsBoard,
}) => {
  // Modals state
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [selectedCommitteeIndex, setSelectedCommitteeIndex] = useState<number | null>(null);
  const [selectedCommitteeItem, setSelectedCommitteeItem] = useState<ClassCommitteeRole | null>(null);

  const [isParentsModalOpen, setIsParentsModalOpen] = useState(false);
  const [selectedParentsMember, setSelectedParentsMember] = useState<ParentsBoardMember | null>(null);

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
            1. Danh Sách Ban Cán Sự Lớp & BCH Chi Đoàn 12A1
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
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-600" />
            2. Ban Đại Diện Cha Mẹ Học Sinh Năm Học 2025 - 2026
          </h4>
          
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
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          3. Danh Sách Phân Biên Chế 4 Tổ Học Sinh (36 Học Sinh)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tổ 1 */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="font-black text-blue-900 text-sm uppercase">TỔ 1 (Dãy 1)</span>
              <span className="text-xs font-bold text-blue-700">{group1Students.length} HS</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Tổ trưởng: <span className="text-blue-900 font-black">Nguyễn Hoàng Long</span>
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
              Tổ trưởng: <span className="text-emerald-900 font-black">Đỗ Hải Đăng</span>
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
              Tổ trưởng: <span className="text-purple-900 font-black">Vũ Đức Trọng</span>
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
              Tổ trưởng: <span className="text-amber-900 font-black">Hoàng Nhật Minh</span>
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
    </div>
  );
};
