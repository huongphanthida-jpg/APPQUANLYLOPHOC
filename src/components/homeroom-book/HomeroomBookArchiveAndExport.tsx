import React, { useState } from 'react';
import {
  Archive,
  Download,
  Printer,
  FileSpreadsheet,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';
import { HomeroomBookSnapshot, HomeroomBookData, UserRole } from '../../types';

interface HomeroomBookArchiveAndExportProps {
  snapshots: HomeroomBookSnapshot[];
  academicYear: string;
  role: UserRole;
  onExportExcel: () => void;
  onExportWord?: () => void;
  onPrintBook: () => void;
  onCreateSnapshot?: (title: string, period: string, note: string) => void;
}

export const HomeroomBookArchiveAndExport: React.FC<HomeroomBookArchiveAndExportProps> = ({
  snapshots,
  academicYear,
  role,
  onExportExcel,
  onExportWord,
  onPrintBook,
  onCreateSnapshot,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('Chốt sổ Giữa Học kỳ 2');
  const [note, setNote] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (onCreateSnapshot) {
      onCreateSnapshot(title.trim(), period, note.trim());
    }
    setTitle('');
    setNote('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              PHẦN 10: TRUNG TÂM LƯU TRỮ, CHỐT SỔ & XUẤT HỒ SƠ BÁO CÁO
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Đóng băng dữ liệu theo các mốc thời gian, xuất file Word (.doc), Excel 12 Sheet và in ấn toàn diện phục vụ kiểm tra
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Word Full */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base">Xuất File Word (.doc)</h4>
                <p className="text-xs text-blue-200">Đầy đủ 10 phần & Chữ ký số</p>
              </div>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Tải toàn bộ dữ liệu Sổ Chủ Nhiệm thành tài liệu MS Word (.doc), bố cục trang in A4 chuẩn Bộ GD&ĐT, đầy đủ tiêu ngữ, trang bìa, bảng biểu và khung chữ ký xác nhận.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportWord || onExportExcel}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuống File Word (.doc)</span>
          </button>
        </div>

        {/* Export Excel Full */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base">Xuất 12 Sheet Excel</h4>
                <p className="text-xs text-emerald-200">Chuẩn mẫu biểu kiểm tra sư phạm</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              File Excel xuất ra tích hợp toàn bộ 12 Sheet: Trang bìa, Sơ yếu lý lịch, Ban cán sự & CMHS, Kế hoạch, Bảng điểm, Sơ đồ lớp, TKB, Nề nếp, Trực nhật, Thi đua, Đơn từ và HS đặc biệt.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportExcel}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuống File Excel (.xlsx)</span>
          </button>
        </div>

        {/* Print Book A4 */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-[#003366] text-white shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base">In Đóng Quyển A4</h4>
                <p className="text-xs text-amber-200">Định dạng phân trang chuẩn BGH</p>
              </div>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              Chuyển giao diện sang chế độ in chuẩn A4, hiển thị đầy đủ khung viền trang trọng, dấu kiểm duyệt, mã QR số hóa và chữ ký điện tử của GVCN và Ban Giám Hiệu.
            </p>
          </div>
          <button
            type="button"
            onClick={onPrintBook}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Mở Chế Độ In Sổ Toàn Diện (A4)</span>
          </button>
        </div>
      </div>

      {/* Snapshots & History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Danh Sách Các Bản Chốt Sổ & Lưu Trữ Hồ Sơ Điện Tử ({academicYear})
          </h4>

          {role === 'gvcn' && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Chốt Sổ Kỳ Này (Tạo Snapshot)</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(snapshots || []).map((snap) => (
            <div
              key={snap.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003366] text-[11px] font-black">
                    {snap.period}
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">{snap.title}</h5>
                </div>
                <p className="text-xs text-slate-600">{snap.note}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                  <span>Thời gian chốt: <strong>{snap.createdAt}</strong></span>
                  <span>Người thực hiện: <strong>{snap.createdBy}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="text-right text-xs mr-2 hidden sm:block">
                  <span className="text-slate-500 block text-[10px]">Điểm TB Lớp</span>
                  <span className="font-black text-blue-900">{snap.gpaAverage} / 10.0</span>
                </div>
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Excel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Tạo Bản Chốt Sổ & Lưu Trữ Hồ Sơ
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Bản Chốt Sổ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hồ Sơ Sổ Chủ Nhiệm - Bản Báo Cáo Giữa Học Kỳ 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mốc Thời Gian / Kỳ Báo Cáo *</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Chốt sổ Đầu năm học">Chốt sổ Đầu năm học</option>
                  <option value="Chốt sổ Tháng 10">Chốt sổ Tháng 10</option>
                  <option value="Chốt sổ Cuối HK1">Chốt sổ Cuối HK1 (Sơ kết)</option>
                  <option value="Chốt sổ Giữa HK2">Chốt sổ Giữa HK2</option>
                  <option value="Chốt sổ Tổng kết Năm học">Chốt sổ Tổng kết Năm học (Chính thức)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú / Nội Dung Đi Kèm</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú về tình trạng hoàn thiện dữ liệu, ý kiến duyệt của BGH..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Xác Nhận Chốt Sổ & Lưu Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
