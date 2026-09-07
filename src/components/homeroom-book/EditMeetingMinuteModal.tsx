import React, { useState } from 'react';
import { X, FileText, Save, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { ClassMeetingMinute } from '../../types';

interface EditMeetingMinuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  minuteItem: ClassMeetingMinute | null;
  onSave: (savedMinute: ClassMeetingMinute) => void;
}

export const EditMeetingMinuteModal: React.FC<EditMeetingMinuteModalProps> = ({
  isOpen,
  onClose,
  minuteItem,
  onSave,
}) => {
  const [title, setTitle] = useState(
    minuteItem?.title || 'Biên Bản Họp Cha Mẹ Học Sinh Đầu Năm Học 2025 - 2026'
  );
  const [meetingType, setMeetingType] = useState<
    | 'Sinh hoạt lớp cuối tuần'
    | 'Họp Phụ huynh đầu năm'
    | 'Họp Phụ huynh cuối HK1'
    | 'Họp Phụ huynh cuối năm'
    | 'Đại hội Chi đoàn'
  >(minuteItem?.meetingType || 'Họp Phụ huynh đầu năm');
  const [date, setDate] = useState(minuteItem?.date || new Date().toLocaleDateString('vi-VN'));
  const [time, setTime] = useState(minuteItem?.time || '08:00 - 10:30');
  const [location, setLocation] = useState(minuteItem?.location || 'Phòng học 302 - Nhà B');
  const [attendeesCount, setAttendeesCount] = useState(minuteItem?.attendeesCount || '36/36 Phụ huynh (Đạt 100%)');
  const [presidedBy, setPresidedBy] = useState(minuteItem?.presidedBy || 'ThS. Nguyễn Văn Cường (GVCN)');
  const [secretary, setSecretary] = useState(minuteItem?.secretary || 'Trần Thị Thu Hà (Thư ký)');
  const [mainContent, setMainContent] = useState(minuteItem?.mainContent || '');
  const [resolutions, setResolutions] = useState(minuteItem?.resolutions || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: minuteItem?.id || `minute-${Date.now()}`,
      title: title.trim(),
      meetingType,
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      attendeesCount: attendeesCount.trim(),
      presidedBy: presidedBy.trim(),
      secretary: secretary.trim(),
      mainContent: mainContent.trim(),
      resolutions: resolutions.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {minuteItem ? 'Chỉnh Sửa Biên Bản Cuộc Họp' : 'Tạo Biên Bản Cuộc Họp Mới'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Lưu trữ biên bản họp Cha mẹ học sinh, Đại hội Chi đoàn & Sinh hoạt
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1.5">Tiêu đề biên bản:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Biên Bản Họp Cha Mẹ Học Sinh Đầu Năm Học"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Loại cuộc họp:</label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Họp Phụ huynh đầu năm">Họp Phụ huynh đầu năm</option>
                <option value="Họp Phụ huynh cuối HK1">Họp Phụ huynh cuối HK1</option>
                <option value="Họp Phụ huynh cuối năm">Họp Phụ huynh cuối năm</option>
                <option value="Đại hội Chi đoàn">Đại hội Chi đoàn</option>
                <option value="Sinh hoạt lớp cuối tuần">Sinh hoạt lớp cuối tuần</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Ngày họp:</label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="VD: 14/09/2025"
                  className="w-full py-2 pl-8 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Thời gian:</label>
              <div className="relative">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="VD: 08:00 - 10:30"
                  className="w-full py-2 pl-8 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Địa điểm:</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Phòng 302 - Nhà B"
                  className="w-full py-2 pl-8 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Thành phần tham dự:</label>
              <div className="relative">
                <input
                  type="text"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(e.target.value)}
                  placeholder="VD: 36/36 PH (100%)"
                  className="w-full py-2 pl-8 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Chủ trì cuộc họp:</label>
              <input
                type="text"
                value={presidedBy}
                onChange={(e) => setPresidedBy(e.target.value)}
                placeholder="VD: ThS. Nguyễn Văn Cường (GVCN)"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Thư ký cuộc họp:</label>
              <input
                type="text"
                value={secretary}
                onChange={(e) => setSecretary(e.target.value)}
                placeholder="VD: Trần Thị Thu Hà (Thư ký)"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Nội dung chính cuộc họp:</label>
            <textarea
              rows={4}
              required
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              placeholder="1. Báo cáo tình hình lớp đầu năm...\n2. Triển khai kế hoạch năm học...\n3. Ý kiến thảo luận của phụ huynh..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Nghị quyết & Kết luận biểu quyết:</label>
            <textarea
              rows={3}
              required
              value={resolutions}
              onChange={(e) => setResolutions(e.target.value)}
              placeholder="VD: 100% phụ huynh nhất trí thông qua kế hoạch hoạt động của lớp và bầu Ban đại diện CMHS năm học 2025 - 2026."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-black shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Biên Bản</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
