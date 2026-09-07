import React, { useState } from 'react';
import { X, Save, Sparkles, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { DutySchedule, DutyDayOfWeek, DutySession, Student } from '../../types';

interface EditDutyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dutyItem: DutySchedule | null;
  students: Student[];
  onSave: (savedDuty: DutySchedule) => void;
}

export const EditDutyScheduleModal: React.FC<EditDutyScheduleModalProps> = ({
  isOpen,
  onClose,
  dutyItem,
  students,
  onSave,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DutyDayOfWeek>(
    (dutyItem?.dayOfWeek as DutyDayOfWeek) || 'Thứ 2'
  );
  const [session, setSession] = useState<DutySession>(
    (dutyItem?.session as DutySession) || 'Sáng'
  );
  const [assignedGroup, setAssignedGroup] = useState<1 | 2 | 3 | 4>(
    dutyItem?.assignedGroup || 1
  );
  const [leaderName, setLeaderName] = useState<string>(
    dutyItem?.leaderName || students[0]?.name || 'Tổ trưởng'
  );
  const [tasks, setTasks] = useState<string[]>(
    dutyItem?.tasks || [
      'Quét lớp học',
      'Lau bảng & bàn giáo viên',
      'Kê lại bàn ghế ngay ngắn',
      'Đổ rác đúng nơi quy định',
    ]
  );
  const [status, setStatus] = useState<'Đã hoàn thành' | 'Đang thực hiện' | 'Chưa bắt đầu'>(
    dutyItem?.status || 'Đang thực hiện'
  );
  const [notes, setNotes] = useState<string>(dutyItem?.notes || '');

  if (!isOpen) return null;

  const handleToggleTask = (taskName: string) => {
    if (tasks.includes(taskName)) {
      setTasks(tasks.filter((t) => t !== taskName));
    } else {
      setTasks([...tasks, taskName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved: DutySchedule = {
      id: dutyItem?.id || `duty-${Date.now()}`,
      dayOfWeek,
      session,
      slotName: `${session} ${dayOfWeek}`,
      assignedGroup,
      leaderName,
      tasks,
      status,
      notes,
    };
    onSave(saved);
    onClose();
  };

  const standardTasks = [
    'Quét dọn phòng học',
    'Lau sạch bảng & bàn giáo viên',
    'Kê ngay ngắn bàn ghế các dãy',
    'Đổ rác & thay túi rác mới',
    'Tưới cây cảnh ban công',
    'Đóng cửa sổ & tắt điện quạt sau giờ học',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#003366] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {dutyItem ? 'Chỉnh Sửa Ca Trực Nhật' : 'Thêm Ca Trực Nhật Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Phân công thứ, buổi, tổ trực và các hạng mục vệ sinh
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thứ:</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DutyDayOfWeek)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Thứ 2">Thứ 2</option>
                <option value="Thứ 3">Thứ 3</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
                <option value="Thứ 7">Thứ 7</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Buổi trực:</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as DutySession)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sáng">Sáng (Đầu giờ)</option>
                <option value="Chiều">Chiều (Cuối giờ)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tổ phụ trách:</label>
              <select
                value={assignedGroup}
                onChange={(e) => setAssignedGroup(Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tổ trưởng / Phụ trách chính:</label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Nguyễn Văn An (Tổ trưởng)"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-2">Các hạng mục công việc trực nhật:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardTasks.map((st) => (
                <label
                  key={st}
                  onClick={() => handleToggleTask(st)}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    tasks.includes(st)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tasks.includes(st)}
                    onChange={() => {}}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Trạng thái đánh giá:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Đã hoàn thành">Đã hoàn thành xuất sắc (Sạch sẽ, đúng giờ)</option>
              <option value="Đang thực hiện">Đang theo dõi thực hiện</option>
              <option value="Chưa bắt đầu">Chưa bắt đầu</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi chú thêm:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Kiểm tra kỹ quạt trần, đóng chốt cửa sổ sau giờ học..."
            />
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
              <span>Lưu Lịch Trực Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
