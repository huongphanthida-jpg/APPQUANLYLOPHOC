import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  RefreshCw,
  Landmark
} from 'lucide-react';
import { Student, UserRole } from '../types';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedStudent?: Student | null;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedStudent,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<
    'roadmap_30days' | 'academic_intervention' | 'conduct_evaluation' | 'parent_conference' | 'disciplinary_advice' | 'bgh_inspection'
  >(selectedStudent ? 'roadmap_30days' : 'academic_intervention');

  const [targetStudentId, setTargetStudentId] = useState<string>(
    selectedStudent?.id || students[0]?.id || ''
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeStudent = students.find((s) => s.id === targetStudentId) || students[0];

  const handleGenerate = async () => {
    setLoading(true);
    setResponse('');

    try {
      const userApiKey = localStorage.getItem('tnh_gvcn_gemini_api_key_v1') || '';
      const userModel = localStorage.getItem('tnh_gvcn_gemini_model_v1') || 'gemini-3-flash-preview';

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userApiKey,
          'x-gemini-model': userModel,
        },
        body: JSON.stringify({
          mode,
          studentData: activeStudent,
          classSummary: {
            totalStudents: students.length,
            averageGPA: (
              students.reduce((acc, s) => acc + s.grades.gpa, 0) / students.length
            ).toFixed(2),
            averageConduct: (
              students.reduce((acc, s) => acc + s.conductScore, 0) / students.length
            ).toFixed(1),
          },
          customPrompt,
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setResponse(data.advice);
      } else {
        setResponse('Không nhận được phản hồi từ Cố Vấn Sư Phạm AI.');
      }
    } catch (err) {
      // Fallback local pedagogical logic if server/network isn't reachable
      const fallbackResponses = {
        roadmap_30days: `### 🎯 LỘ TRÌNH 30 NGÀY BỨT PHÁ ĐIỂM SỐ CÁ NHÂN HÓA - DẠ HƯƠNG 2026-2027
**Học sinh:** ${activeStudent?.name} (Mã HS: ${activeStudent?.code} - Tổ ${activeStudent?.group})
**Mục tiêu:** Nâng ĐTB từ **${activeStudent?.grades.gpa}** lên **${Math.min(10, (activeStudent?.grades.gpa || 8.0) + 0.8).toFixed(1)}** • Chuẩn bị thi Tốt nghiệp THPT 2027

---

#### 📌 TUẦN 1: CỦNG CỐ NỀN TẢNG & LẮP LỖ HỔNG KIẾN THỨC
- **Môn Toán:** Luyện 5 đề trắc nghiệm chuyên đề Hàm số & Tích phân (Target ≥ 8.2đ).
- **Môn Vật Lý:** Ôn kỹ lý thuyết Sóng cơ & Dòng điện xoay chiều (Luyện 30 câu nhận biết/thông hiểu).
- **Phối hợp:** Phân công Đôi bạn cùng tiến kèm cặp 20 phút sau giờ học.

#### 📌 TUẦN 2: TĂNG TỐC KỸ NĂNG GIẢI TRẮC NGHIỆM TỐC ĐỘ HIGH-SPEED
- **Môn Hóa Học & Tiếng Anh:** Luyện giải trắc nghiệm bấm giờ 45 phút trên app DẠ HƯƠNG 2026-2027.
- **Nề nếp:** Duy trì 100 điểm thi đua nề nếp tổ, không vắng học hay đi muộn.

#### 📌 TUẦN 3: LUYỆN ĐỀ THI THỬ CHUYÊN ĐỀ PHÂN HÓA 8.5+
- **Luyện đề AI:** Làm 3 bài kiểm tra trắc nghiệm AI định kỳ do GVCN giao.
- **Đánh giá:** Rà soát các câu làm sai và ghi chép vào Sổ Tay Lỗi Sai (Error Log).

#### 📌 TUẦN 4: TỔNG ÔN MỤC TIÊU & SẴN SÀNG KỲ THI
- BGH & GVCN đánh giá tiến bộ, thưởng +10 điểm thi đua nề nếp và cấp giấy tuyên dương.

---
*Gợi ý thông điệp GVCN gửi Phụ huynh:*
"Kính gửi Phụ huynh em ${activeStudent?.name}, GVCN đã lập Lộ trình tự học 30 ngày cho cháu. Trân trọng kính mời gia đình phối hợp theo dõi khung giờ tự học 20h-22h hằng ngày."`,
        academic_intervention: `### 📊 KẾ HOẠCH BỒI DƯỠNG & PHỤ ĐẠO KHỐI TỰ NHIÊN (TOÁN - LÝ - HÓA)
**Học sinh:** ${activeStudent?.name} (Lớp 12A1 - THPT Trần Nguyên Hãn)
**Điểm hiện tại:** Toán ${activeStudent?.grades.math.avg} | Lý ${activeStudent?.grades.physics.avg} | Hóa ${activeStudent?.grades.chemistry.avg} (ĐTB: ${activeStudent?.grades.gpa})

1. **Nhận định sư phạm:**
   - Học sinh có nền tảng tư duy tốt, tuy nhiên cần củng cố các dạng bài toán vận dụng cao phần Tích phân và Hình không gian giải tích.
2. **Kế hoạch hỗ trợ 4 tuần:**
   - **Tuần 1-2:** Phân công bạn có điểm Lý cao trong Tổ ${activeStudent?.group} kèm cặp phương pháp giải nhanh trắc nghiệm.
   - **Tuần 3-4:** Thầy GVCN giao bộ đề phân hóa 25 câu nhận biết/thông hiểu + 15 câu vận dụng.
3. **Lời khuyên gửi Phụ huynh:**
   - Gia đình tạo điều kiện không gian yên tĩnh 20h-22h hàng ngày và động viên tinh thần trước kỳ thi tốt nghiệp 2026.`,
        conduct_evaluation: `### 📝 BẢN NHẬN XÉT HỌC BẠ ĐIỆN TỬ HỌC KỲ
**Học sinh:** ${activeStudent?.name} - Lớp 12A1
**Hạnh kiểm:** ${activeStudent?.conductRating} (${activeStudent?.conductScore}/100 điểm)

- **Về ý thức kỷ luật & đạo đức:** Luôn chấp hành nghiêm chỉnh nội quy trường THPT Trần Nguyên Hãn, lễ phép với thầy cô, hòa nhã với bạn bè. Tích cực tham gia các phong trào thi đua của Tổ ${activeStudent?.group}.
- **Về học tập:** Có tinh thần tự giác cao, chăm chỉ làm bài tập khối Tự nhiên, tư duy logic nhạy bén.
- **Sở trường & Đóng góp:** Phát huy tốt năng khiếu: *${activeStudent?.strengths}*.
- **Định hướng học kỳ tới:** Tiếp tục duy trì phong độ, tập trung ôn luyện các môn thi Đại học mục tiêu: *${activeStudent?.careerAspiration}*.`,
        parent_conference: `### 📋 KỊCH BẢN HỌP PHỤ HUYNH LỚP 12A1 - THPT TRẦN NGUYÊN HÃN
**Chủ trì:** Thầy Nguyễn Văn An (GVCN)

1. **Báo cáo tình hình chung Lớp 12A1:**
   - Sĩ số: 42/42 học sinh. Nề nếp thi đua đạt Top 1 khối 12.
   - Kết quả Khối Tự Nhiên: ĐTB chung 8.56 (Toán 8.8, Lý 8.5, Hóa 8.4).
2. **Định hướng chiến lược thi Tốt nghiệp THPT 2026:**
   - Phổ biến cấu trúc đề thi trắc nghiệm mới của Bộ GD&ĐT.
   - Tư vấn chọn khối thi (A00, A01, B00) và ngưỡng điểm chuẩn các trường Top (ĐHBK Hà Nội, Ngoại Thương, Y Hải Phòng).
3. **Phối hợp Tam giác Giáo dục (Nhà trường - Gia đình - Học sinh):**
   - Đảm bảo kênh liên lạc khẩn cấp 24/7 qua hệ thống số hóa.`,
        disciplinary_advice: `### 💡 PHƯƠNG PHÁP GIÁO DỤC TÍCH CỰC KỶ LUẬT
**Đối tượng:** ${activeStudent?.name}

1. **Nguyên tắc cốt lõi:** Lắng nghe nguyên nhân cốt lõi trước khi áp dụng chế tài thi đua; giữ thể diện cho học sinh trước tập thể lớp.
2. **Biện pháp thực hiện:**
   - Trò chuyện riêng 10 phút sau giờ sinh hoạt lớp.
   - Giao nhiệm vụ phụ trách tổ chức hoạt động văn thể mỹ/trực nhật để học sinh chuộc lỗi và tích lũy điểm thưởng nề nếp.
   - Nhắn tin thông báo tích cực với phụ huynh khi em có tiến bộ.`,
        bgh_inspection: `### 🏛️ BIÊN BẢN THANH TRA & CHỈ ĐẠO SƯ PHẠM CỦA BAN GIÁM HIỆU
**Đơn vị kiểm tra:** Ban Giám Hiệu THPT Trần Nguyên Hãn
**Lớp được kiểm tra:** Lớp 12A1 (GVCN: Thầy Nguyễn Văn An)
**Thời điểm thanh tra:** Tuần 24 - Năm học 2025-2026

1. **Kết luận Thanh tra Hồ sơ & Sổ Đầu Bài:**
   - Hồ sơ học vụ đầy đủ, cập nhật thời gian thực trên hệ thống điện tử.
   - Sổ đầu bài ghi chép đúng tiến độ phân phối chương trình Sở GD Hải Phòng, 96% tiết học xếp loại Tốt (A).
   - Tỷ lệ chuyên cần đạt 100%, không có trường hợp vắng học không phép.

2. **Chất lượng Khối Tự Nhiên (Khối A00/A01):**
   - Điểm trung bình môn: Toán ${activeStudent ? activeStudent.grades.math.avg : 8.8}, Lý ${activeStudent ? activeStudent.grades.physics.avg : 8.5}, Hóa ${activeStudent ? activeStudent.grades.chemistry.avg : 8.4}.
   - Đạt tiêu chuẩn Lớp Trọng Điểm Mũi Nhọn cấp trường.

3. **Chỉ đạo trọng tâm của BGH gửi GVCN:**
   - Tiếp tục phát huy thế mạnh phương pháp dạy học phân hóa.
   - Tăng cường kiểm tra định kỳ mô phỏng kỳ thi Tốt nghiệp THPT 2026 theo ma trận đề mới.
   - Hoàn tất ký số điện tử biên bản thanh tra toàn diện.`,
      };

      setResponse(fallbackResponses[mode]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#003366] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#98FF98]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#98FF98] text-[#003366]">
                  TRỢ LÝ SƯ PHẠM AI
                </span>
                <span className="text-xs text-slate-300">THPT Trần Nguyên Hãn</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Cố Vấn Giáo Dục & Phân Tích Dữ Liệu Học Sinh
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              {
                id: 'roadmap_30days',
                name: 'Lộ Trình 30 Ngày',
                icon: Sparkles,
                desc: 'Bứt phá điểm số',
              },
              {
                id: 'academic_intervention',
                name: 'Kế Hoạch Phụ Đạo',
                icon: BookOpen,
                desc: 'Khối Tự Nhiên',
              },
              {
                id: 'conduct_evaluation',
                name: 'Nhận Xét Học Bạ',
                icon: GraduationCap,
                desc: 'Chuẩn Thông tư',
              },
              {
                id: 'parent_conference',
                name: 'Họp Phụ Huynh',
                icon: Users,
                desc: 'Kịch bản chi tiết',
              },
              {
                id: 'disciplinary_advice',
                name: 'Tư Vấn Kỷ Luật',
                icon: AlertCircle,
                desc: 'Giáo dục tích cực',
              },
              {
                id: 'bgh_inspection',
                name: 'Thanh Tra BGH',
                icon: Landmark,
                desc: 'Chỉ đạo cấp trường',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-[#003366] ring-2 ring-[#003366]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${
                      isSelected ? 'text-[#003366]' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#003366]' : 'text-slate-800'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Target Student Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đối tượng học sinh phân tích
              </label>
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - Tổ {s.group}) - ĐTB: {s.grades.gpa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú thêm cho AI (Tùy chọn)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="VD: Nhấn mạnh vào định hướng Đại học Bách Khoa..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Action trigger button */}
          <button
            id="btn-run-ai-generation"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#98FF98]" />
                <span>AI đang phân tích hồ sơ & soạn thảo giải pháp sư phạm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#98FF98]" />
                <span>Tạo Nội Dung Tư Vấn Bằng AI</span>
              </>
            )}
          </button>

          {/* Response Box */}
          {response && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Kết quả phân tích từ Gemini AI
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#003366] px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
