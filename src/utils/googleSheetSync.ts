import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link,
  Table,
  Check,
  Zap,
  Info,
  DownloadCloud,
  FileSpreadsheet,
  Settings2,
} from 'lucide-react';
import { Student, ClassInfo, GoogleSheetConfig } from '../types';
import {
  fetchStudentsFromGoogleSheet,
  getGoogleSheetCsvUrl,
  SAMPLE_GOOGLE_SHEET_URL,
} from '../utils/googleSheetSync';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (importedStudents: Student[], mode: 'merge' | 'replace', config: GoogleSheetConfig) => void;
  currentCount: number;
  classInfo?: ClassInfo;
  existingStudents?: Student[];
  initialConfig?: GoogleSheetConfig;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  onSync,
  currentCount,
  classInfo,
  existingStudents = [],
  initialConfig,
}) => {
  const [sheetUrl, setSheetUrl] = useState(initialConfig?.sheetUrl || '');
  const [autoSync, setAutoSync] = useState(initialConfig?.autoSync ?? true);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfig?.sheetUrl) {
      setSheetUrl(initialConfig.sheetUrl);
    }
  }, [initialConfig]);

  if (!isOpen) return null;

  const currentClassName = classInfo?.className || 'Lớp 12A1';

  // Test connection & load Google Sheet data
  const handleFetchSheet = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || sheetUrl;
    if (!urlToFetch.trim()) {
      setErrorMessage('Vui lòng nhập đường dẫn Google Sheet.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const students = await fetchStudentsFromGoogleSheet(urlToFetch);
      setParsedStudents(students);
      setSuccessMessage(`Đã kết nối thành công! Đọc được ${students.length} học sinh từ Google Sheet.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối tới Google Sheet.');
      setParsedStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set sample URL and fetch immediately
  const handleUseSample = () => {
    setSheetUrl(SAMPLE_GOOGLE_SHEET_URL);
    handleFetchSheet(SAMPLE_GOOGLE_SHEET_URL);
  };

  // Perform synchronization
  const handleCommitSync = () => {
    if (parsedStudents.length === 0) {
      setErrorMessage('Vui lòng kiểm tra và tải dữ liệu Google Sheet trước khi đồng bộ.');
      return;
    }

    const config: GoogleSheetConfig = {
      sheetUrl: sheetUrl.trim(),
      autoSync,
      lastSyncedAt: new Date().toLocaleString('vi-VN'),
      syncStatus: 'success',
      syncedCount: parsedStudents.length,
    };

    onSync(parsedStudents, importMode, config);
    onClose();
  };

  const existingCodeSet = new Set(existingStudents.map((s) => s.code.toLowerCase()));
  const updateCount = parsedStudents.filter((s) => existingCodeSet.has(s.code.toLowerCase())).length;
  const newCount = parsedStudents.length - updateCount;
  const convertedCsvUrl = getGoogleSheetCsvUrl(sheetUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003366] via-blue-900 to-[#002244] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
              <Globe className="w-6 h-6 animate-pulse text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded">
                  ONLINE DATABASE GOOGLE SHEETS
                </span>
                <span className="text-xs text-slate-300 font-semibold">Tự động đồng bộ</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Kết Nối Cơ Sở Dữ Liệu Lớp Học Trực Tuyến
              </h2>
              <p className="text-xs text-slate-300">
                Đồng bộ realtime danh sách học sinh từ Google Sheet vào ứng dụng DẠ HƯƠNG 2026-2027
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Input Google Sheet URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-[#003366]" />
                Đường Dẫn Bảng Tính Google Sheet (Google Sheets Link):
              </label>
              <button
                type="button"
                onClick={handleUseSample}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Dùng thử link mẫu Google Sheet demo
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit..."
                value={sheetUrl}
                onChange={(e) => {
                  setSheetUrl(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => handleFetchSheet()}
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Đang Tải...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4 text-emerald-300" />
                    <span>Tải Dữ Liệu</span>
                  </>
                )}
              </button>
            </div>

            {sheetUrl && (
              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Endpoint CSV tự chuyển đổi:</span>
                <span className="text-blue-700 font-bold truncate">{convertedCsvUrl}</span>
              </p>
            )}
          </div>

          {/* Guide Alert */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-[#003366]">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              Hướng dẫn chia sẻ Google Sheet để app kết nối được:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700 pl-1">
              <li>Mở Google Sheet &rarr; bấm nút <strong>Chia sẻ (Share)</strong> ở góc phải trên cùng.</li>
              <li>Tại mục Quyền truy cập chung: chọn <strong>"Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view)</strong>.</li>
              <li>Sao chép liên kết (Copy Link) và dán vào ô bên trên &rarr; Bấm <strong>"Tải Dữ Liệu"</strong>.</li>
            </ol>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lỗi kết nối:</strong> {errorMessage}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Kết quả xem trước: {parsedStudents.length} học sinh sẵn sàng đồng bộ
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {importMode === 'merge' && (
                    <>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        Cập nhật: {updateCount} HS
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Thêm mới: {newCount} HS
                      </span>
                    </>
                  )}
                  <span className="text-slate-500">(Hiện có {currentCount} HS trong app)</span>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-2 text-center">Giới tính</th>
                      <th className="py-2.5 px-2 text-center">Tổ</th>
                      <th className="py-2.5 px-2.5">SĐT</th>
                      <th className="py-2.5 px-2.5">Phụ huynh</th>
                      <th className="py-2.5 px-2 text-center">ĐTB</th>
                      <th className="py-2.5 px-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedStudents.map((s, idx) => {
                      const isExisting = existingCodeSet.has(s.code.toLowerCase());
                      return (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-mono text-[#003366] font-bold">{s.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {s.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {s.dob} • {s.strengths.slice(0, 26)}...
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600">{s.gender}</td>
                          <td className="py-2 px-2 text-center font-bold text-slate-700">Tổ {s.group}</td>
                          <td className="py-2 px-2.5 text-slate-600 font-mono">{s.phone}</td>
                          <td className="py-2 px-2.5 text-slate-600">
                            {s.emergencyContact?.parentName || '—'}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-emerald-700">
                            {s.grades?.gpa || '—'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isExisting ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Cập nhật
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Mới
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sync Options & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Auto sync toggle */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Tự động đồng bộ</span>
                    <span className="text-[10px] text-slate-500">Tự cập nhật khi mở ứng dụng</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Import Mode Radio */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">Phương thức:</label>
                  <div className="flex gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-[#003366]"
                      />
                      <span>Bổ sung (Merge)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-rose-600"
                      />
                      <span>Thay thế toàn bộ</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleCommitSync}
            disabled={parsedStudents.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black transition-all shadow-md flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Xác Nhận Đồng Bộ Vào DẠ HƯƠNG 2026-2027</span>
          </button>
        </div>
      </div>
    </div>
  );
};
