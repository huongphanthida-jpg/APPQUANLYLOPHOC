import { OnlineExamQuestion } from '../types';

export interface ExamWordExportParams {
  title: string;
  subject: string;
  durationMinutes: number;
  description: string;
  questions: OnlineExamQuestion[];
  className?: string;
  schoolName?: string;
  teacherName?: string;
}

export function exportExamToWord(params: ExamWordExportParams) {
  const {
    title,
    subject,
    durationMinutes,
    description,
    questions,
    className = '12A1',
    schoolName = 'THPT TRẦN NGUYÊN HÃN',
    teacherName = 'Thầy Nguyễn Văn An (GVCN)',
  } = params;

  const safeTitle = title.replace(/[^a-zA-Z0-9_ -]/g, '');
  const nowStr = new Date().toLocaleDateString('vi-VN');

  const questionsHtml = questions
    .map((q, idx) => {
      const optionsStr = q.options
        .map(
          (opt) =>
            `<td style="padding: 6px; width: 25%; font-size: 11pt;"><b>${opt.key}.</b> ${escapeHtml(
              opt.text
            )}</td>`
        )
        .join('');

      return `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <p style="font-[#003366]; font-weight: bold; margin-bottom: 6px;">
            Câu ${idx + 1} (${q.points || (10 / (questions.length || 1)).toFixed(2)} điểm): ${escapeHtml(
        q.questionText
      )}
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-left: 12px;">
            <tr>${optionsStr}</tr>
          </table>
        </div>
      `;
    })
    .join('');

  const answerKeyHtml = questions
    .map(
      (q, idx) =>
        `<td style="border: 1px solid #003366; padding: 4px; text-align: center; font-size: 10pt;">
          <b>C${idx + 1}</b><br/><span style="color: #0066cc; font-weight: bold;">${q.correctAnswer}</span>
        </td>`
    )
    .join('');

  const detailedExplanationsHtml = questions
    .map(
      (q, idx) => `
      <div style="margin-bottom: 10px; font-size: 10.5pt; border-left: 3px solid #003366; padding-left: 10px;">
        <p style="margin: 0; font-weight: bold; color: #003366;">
          Lời giải Câu ${idx + 1} (Đáp án ${q.correctAnswer}):
        </p>
        <p style="margin: 4px 0 0 0; color: #333333;">${escapeHtml(
          q.explanation || 'Áp dụng công thức và kiến thức trọng tâm.'
        )}</p>
      </div>
    `
    )
    .join('');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.3;
      color: #000;
    }
    h1, h2, h3 { font-family: 'Times New Roman', Times, serif; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .header-table td { vertical-align: top; text-align: center; }
    .title-box { text-align: center; margin: 15px 0 20px 0; }
    .title-main { font-size: 15pt; font-weight: bold; text-transform: uppercase; color: #003366; }
    .title-sub { font-size: 11pt; italic: true; color: #444; }
    .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
    .matrix-table th, .matrix-table td { border: 1px solid #666; padding: 5px; text-align: center; }
    .matrix-table th { background-color: #f0f4f8; font-weight: bold; }
    .answers-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width: 45%;">
          <b>SỞ GIÁO DỤC VÀ ĐÀO TẠO HẢI PHÒNG</b><br/>
          <b>TRƯỜNG ${escapeHtml(schoolName)}</b><br/>
          <span>Lớp: <b>${escapeHtml(className)}</b></span>
        </td>
        <td style="width: 55%;">
          <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
          <b>Độc lập - Tự do - Hạnh phúc</b><br/>
          <span><i>Hải Phòng, ngày ${nowStr}</i></span>
        </td>
      </tr>
    </table>

    <!-- Exam Title -->
    <div class="title-box">
      <div class="title-main">${escapeHtml(title)}</div>
      <div class="title-sub">Môn thi: <b>${escapeHtml(
        subject
      )}</b> | Thời gian làm bài: <b>${durationMinutes} phút</b> (Không kể thời gian phát đề)</div>
      <div style="font-size: 10pt; margin-top: 4px; color: #555;">Hệ thống AI Cố vấn - DẠ HƯƠNG 2026-2027</div>
    </div>

    <!-- Student Name Block -->
    <div style="border: 1px solid #003366; padding: 10px; margin-bottom: 20px; background-color: #fafbfc; font-size: 11pt;">
      <span>Họ và tên học sinh: ............................................................................</span>
      <span style="margin-left: 20px;">SBD: ......................</span>
      <span style="margin-left: 20px;">Số điểm: .......... / 10.0</span>
    </div>

    <!-- Description / Instructions -->
    ${
      description
        ? `<p style="font-style: italic; font-size: 11pt; margin-bottom: 15px; color: #333;"><b>Ghi chú đề thi:</b> ${escapeHtml(
            description
          )}</p>`
        : ''
    }

    <!-- Matrix Table -->
    <h3 style="font-size: 12pt; color: #003366; margin-bottom: 8px;">I. MA TRẬN ĐỀ THI (${
      questions.length
    } CÂU TRẮC NGHIỆM KHIẾU NĂNG)</h3>
    <table class="matrix-table">
      <thead>
        <tr>
          <th>Môn Học</th>
          <th>Tổng Số Câu</th>
          <th>Nhận Biết (40%)</th>
          <th>Thông Hiểu (30%)</th>
          <th>Vận Dụng (20%)</th>
          <th>Vận Dụng Cao (10%)</th>
          <th>Thang Điểm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>${escapeHtml(subject)}</b></td>
          <td><b>${questions.length} câu</b></td>
          <td>${Math.round(questions.length * 0.4)} câu</td>
          <td>${Math.round(questions.length * 0.3)} câu</td>
          <td>${Math.round(questions.length * 0.2)} câu</td>
          <td>${Math.max(1, Math.round(questions.length * 0.1))} câu</td>
          <td><b>10.0 Điểm</b></td>
        </tr>
      </tbody>
    </table>

    <!-- Questions Section -->
    <h3 style="font-size: 12pt; color: #003366; margin-bottom: 12px;">II. NỘI DUNG CÂU HỎI TRẮC NGHIỆM</h3>
    ${questionsHtml}

    <div style="text-align: center; margin: 30px 0; font-weight: bold; color: #666;">
      ---------- HẾT ----------<br/>
      <span style="font-weight: normal; font-size: 10pt; font-style: italic;">(Cán bộ coi thi không giải thích gì thêm)</span>
    </div>

    <!-- ANSWER KEY PAGE -->
    <div class="page-break"></div>

    <div class="title-box">
      <div class="title-main" style="color: #003366;">ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT</div>
      <div class="title-sub">${escapeHtml(title)} - Môn ${escapeHtml(subject)} (Lớp ${escapeHtml(className)})</div>
    </div>

    <h3 style="font-size: 12pt; color: #003366; margin-bottom: 8px;">1. BẢNG ĐÁP ÁN NHANH</h3>
    <table class="answers-table">
      <tr>${answerKeyHtml}</tr>
    </table>

    <h3 style="font-size: 12pt; color: #003366; margin-top: 25px; margin-bottom: 12px;">2. LỜI GIẢI CHI TIẾT TỪNG BƯỚC (AI ADVISOR EXPLANATION)</h3>
    ${detailedExplanationsHtml}

    <!-- Signature Footnote -->
    <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; text-align: center; font-size: 11pt;">
          <b>DUYỆT CỦA BAN GIÁM HIỆU</b><br/>
          <span style="font-size: 10pt; italic: true;">(Ký & ghi rõ họ tên)</span>
          <br/><br/><br/><br/>
          <b>TS. Lê Thị Mai</b>
        </td>
        <td style="width: 50%; text-align: center; font-size: 11pt;">
          <b>GIÁO VIÊN RA ĐỀ & CHỦ NHIỆM</b><br/>
          <span style="font-size: 10pt; italic: true;">(Ký & ghi rõ họ tên)</span>
          <br/><br/><br/><br/>
          <b>${escapeHtml(teacherName)}</b>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `De_Thi_Word_${safeTitle}_Lop_${className}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
