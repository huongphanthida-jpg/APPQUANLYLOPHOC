import React, { useState } from 'react';
import { X, Save, Grid, Users } from 'lucide-react';
import { SeatingChartData, Student } from '../../types';

interface EditSeatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatingChart: SeatingChartData;
  students: Student[];
  onSave: (savedChart: SeatingChartData) => void;
}

export const EditSeatingModal: React.FC<EditSeatingModalProps> = ({
  isOpen,
  onClose,
  seatingChart,
  students,
  onSave,
}) => {
  const [selectedCol, setSelectedCol] = useState<number>(1);
  const [selectedDesk, setSelectedDesk] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<1 | 2>(1);

  const seatKey = `${selectedCol}-${selectedDesk}-${selectedSeat}`;
  const currentAssignedId = seatingChart?.assignments?.[seatKey] || '';
  const [assignedStudentId, setAssignedStudentId] = useState<string>(currentAssignedId);

  if (!isOpen) return null;

  const handleSelectPosition = (col: number, desk: number, seat: 1 | 2) => {
    setSelectedCol(col);
    setSelectedDesk(desk);
    setSelectedSeat(seat);
    const key = `${col}-${desk}-${seat}`;
    setAssignedStudentId(seatingChart?.assignments?.[key] || '');
  };

  const handleSaveSeat = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAssignments = {
      ...(seatingChart?.assignments || {}),
      [seatKey]: assignedStudentId || null,
    };

    const updated: SeatingChartData = {
      title: seatingChart?.title || 'Sơ Đồ Chỗ Ngồi Lớp Chuẩn',
      description: seatingChart?.description || '4 Dãy x 6 Bàn x 2 Chỗ ngồi',
      updatedAt: new Date().toLocaleDateString('vi-VN'),
      assignments: updatedAssignments,
    };

    onSave(updated);
    onClose();
  };

  const currentStudent = students.find((s) => s.id === currentAssignedId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Chỉnh Sửa & Phân Chỗ Ngồi Sơ Đồ Lớp</h3>
              <p className="text-xs text-blue-200 font-medium">
                Gán học sinh vào từng bàn của 4 dãy (Tổ 1 - 4)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSaveSeat} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn Dãy / Tổ:</label>
              <select
                value={selectedCol}
                onChange={(e) => {
                  const c = Number(e.target.value);
                  handleSelectPosition(c, selectedDesk, selectedSeat);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map((c) => (
                  <option key={c} value={c}>
                    Dãy {c} (Tổ {c})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn Bàn (Hàng):</label>
              <select
                value={selectedDesk}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  handleSelectPosition(selectedCol, d, selectedSeat);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    Bàn {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Vị trí ghế ngồi:</label>
              <select
                value={selectedSeat}
                onChange={(e) => {
                  const s = Number(e.target.value) as 1 | 2;
                  handleSelectPosition(selectedCol, selectedDesk, s);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ghế 1 (Bên trái)</option>
                <option value={2}>Ghế 2 (Bên phải)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>
                Đang chọn: <strong>Dãy {selectedCol} - Bàn {selectedDesk} - Ghế {selectedSeat}</strong>
              </span>
              <span className="text-[11px] text-blue-700 font-bold">
                Hiện tại: {currentStudent?.name || 'Chưa gán'}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Gán học sinh vào vị trí này:</label>
              <select
                value={assignedStudentId}
                onChange={(e) => setAssignedStudentId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Để trống ghế này --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - Tổ {s.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white font-bold shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Gán Chỗ Ngồi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
