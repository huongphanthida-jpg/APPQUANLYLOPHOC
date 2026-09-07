import { Student, ClassInfo, TeacherInfo, BghInfo, GroupEmulationLog } from '../types';

export interface PptxExportParams {
  type: 'parent_meeting' | 'weekly_meeting';
  classInfo: ClassInfo;
  teacherInfo: TeacherInfo;
  bghInfo?: BghInfo;
  students: Student[];
  emulationLogs?: GroupEmulationLog[];
}

export function exportPresentationPptx(params: PptxExportParams) {
  const { type, classInfo, teacherInfo, bghInfo, students } = params;

  const className = classInfo.className || '12A1';
  const schoolName = classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN';
  const teacherName = teacherInfo.name || 'Thầy Nguyễn Văn An';
  const academicYear = classInfo.academicYear || 'Niên khóa 2023 - 2026';
  const meetingTitle =
    type === 'parent_meeting'
      ? `BÁO CÁO HỘI NGHỊ HỌP PHỤ HUYNH LỚP ${className}`
      : `BÁO CÁO KẾT QUẢ THI ĐƯA & SINH HOẠT LỚP ${className}`;

  // Calculate statistics
  const totalStudents = students.length || 42;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;
  const avgGpa = (students.reduce((acc, s) => acc + s.grades.gpa, 0) / totalStudents).toFixed(2);
  const excellentCount = students.filter((s) => s.grades.gpa >= 8.0).length;
  const goodCount = students.filter((s) => s.grades.gpa >= 6.5 && s.grades.gpa < 8.0).length;

  // Top 5 students
  const topStudents = [...students].sort((a, b) => b.grades.gpa - a.grades.gpa).slice(0, 5);

  const slidesHtml = `
<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
xmlns:oa="urn:schemas-microsoft-com:office:activation"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(meetingTitle)}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #002244; color: #ffffff; margin: 0; padding: 20px; }
    .slide { width: 960px; height: 540px; background: linear-gradient(135deg, #003366 0%, #001a33 100%); border-radius: 20px; padding: 40px; box-sizing: border-box; margin: 0 auto 30px auto; border: 2px solid #004488; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); page-break-after: always; }
    .slide-header { border-bottom: 2px solid #98FF98; padding-bottom: 12px; margin-bottom: 25px; flex justify-content: space-between; }
    .slide-title { font-size: 26pt; font-weight: 800; color: #ffffff; margin: 0; }
    .slide-subtitle { font-size: 13pt; color: #98FF98; font-weight: 600; margin-top: 4px; }
    .slide-body { font-size: 14pt; line-height: 1.6; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
    .card { background: rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; border: 1px solid rgba(255,255,255,0.15); }
    .stat-number { font-size: 32pt; font-weight: 900; color: #98FF98; margin: 5px 0; }
    .table-custom { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12pt; }
    .table-custom th { background: rgba(152, 255, 152, 0.2); color: #98FF98; text-align: left; padding: 10px; border-bottom: 2px solid #98FF98; }
    .table-custom td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .footer { position: absolute; bottom: 20px; left: 40px; right: 40px; font-size: 10pt; color: #88aacc; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER SLIDE -->
  <div class="slide" style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #002850 0%, #001226 100%); border: 3px solid #98FF98;">
    <div style="background: rgba(152, 255, 152, 0.15); color: #98FF98; padding: 6px 18px; border-radius: 20px; font-size: 12pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
      ${escapeHtml(schoolName)}
    </div>
    <h1 style="font-size: 34pt; font-weight: 900; color: #ffffff; margin: 0 0 15px 0; line-height: 1.2;">
      ${escapeHtml(meetingTitle)}
    </h1>
    <h3 style="font-size: 20pt; color: #98FF98; margin: 0 0 30px 0; font-weight: 700;">
      HỆ THỐNG QUẢN TRỊ & HỌC LIỆU DẠ HƯƠNG 2026-2027
    </h3>
    <div style="font-size: 14pt; color: #d0e0f0; background: rgba(255,255,255,0.05); padding: 15px 30px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);">
      <span>Giáo viên chủ nhiệm: <b>${escapeHtml(teacherName)}</b></span> | 
      <span>Niên khóa: <b>${escapeHtml(academicYear)}</b></span>
    </div>
    <div class="footer">
      <span>THPT Trần Nguyên Hãn - Hải Phòng</span>
      <span>Hệ thống EdTech 2027</span>
    </div>
  </div>

  <!-- SLIDE 2: CLASS OVERVIEW & SĨ SỐ -->
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">1. Tổng Quan Sĩ Số & Đặc Điểm Tình Hình Lớp</h2>
      <div class="slide-subtitle">Lớp ${escapeHtml(className)} - Chuyên ban Khoa học Tự nhiên</div>
    </div>
    <div class="card-grid">
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">Tổng Sĩ Số Học Sinh</div>
        <div class="stat-number">${totalStudents} <span style="font-size: 14pt; color: #fff;">HS</span></div>
        <div style="font-size: 11pt; color: #98FF98;">Top 1 Thi đua Khối 12</div>
      </div>
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">Cơ Cấu Nam / Nữ</div>
        <div class="stat-number" style="color: #60a5fa;">${maleCount} <span style="font-size: 14pt; color: #f472b6;">Nam / ${femaleCount} Nữ</span></div>
        <div style="font-size: 11pt; color: #ddd;">Tỷ lệ cân bằng 100% Đoàn viên</div>
      </div>
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">ĐTB Chung Cả Lớp</div>
        <div class="stat-number" style="color: #f59e0b;">${avgGpa} <span style="font-size: 14pt; color: #fff;">/ 10.0</span></div>
        <div style="font-size: 11pt; color: #98FF98;">Khối Tự Nhiên (Toán - Lý - Hóa)</div>
      </div>
    </div>
    <div style="margin-top: 25px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; font-size: 12pt;">
      <b style="color: #98FF98;">Ghi nhận chung của GVCN:</b> Tập thể học sinh chấp hành tốt kỷ luật trường THPT Trần Nguyên Hãn, 100% tham gia các phong trào Đoàn thể và duy trì tinh thần tự học cao chuẩn bị cho kỳ thi Tốt nghiệp THPT 2027.
    </div>
    <div class="footer">
      <span>Trang 2 | Báo cáo GVCN</span>
      <span>DẠ HƯƠNG 2026-2027</span>
    </div>
  </div>

  <!-- SLIDE 3: HONOR ROLL - TOP 5 -->
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">2. Bảng Vàng Tuyên Dương Học Sinh Xuất Sắc</h2>
      <div class="slide-subtitle">Top 5 Học Sinh Có Thành Tích Khối Tự Nhiên Dẫn Đầu</div>
    </div>
    <table class="table-custom">
      <thead>
        <tr>
          <th>Hạng</th>
          <th>Mã HS</th>
          <th>Họ và Tên</th>
          <th>Tổ</th>
          <th>Sở Trường & Năng Khiếu</th>
          <th>ĐTB Khối A</th>
          <th>Hạnh Kiểm</th>
        </tr>
      </thead>
      <tbody>
        ${topStudents
          .map(
            (s, idx) => `
          <tr>
            <td><b style="color: #98FF98;">#${idx + 1}</b></td>
            <td style="font-family: monospace;">${s.code}</td>
            <td><b>${escapeHtml(s.name)}</b></td>
            <td>Tổ ${s.group}</td>
            <td>${escapeHtml(s.strengths.slice(0, 35))}...</td>
            <td><b style="color: #f59e0b; font-size: 14pt;">${s.grades.gpa}</b></td>
            <td><span style="color: #34d399; font-weight: bold;">${s.conductRating}</span></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <div class="footer">
      <span>Trang 3 | Bảng Vàng Tuyên Dương</span>
      <span>DẠ HƯƠNG 2026-2027</span>
    </div>
  </div>

  <!-- SLIDE 4: ACADEMIC & EMULATION TARGETS -->
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">3. Thống Kê Học Lực & Chỉ Tiêu Thi Đại Học 2027</h2>
      <div class="slide-subtitle">Phân hóa kết quả học tập & Mục tiêu xét tuyển Đại học</div>
    </div>
    <div class="card-grid">
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">Tỷ Lệ Giỏi (≥ 8.0)</div>
        <div class="stat-number" style="color: #34d399;">${excellentCount} <span style="font-size: 14pt; color: #fff;">HS (${Math.round((excellentCount/totalStudents)*100)}%)</span></div>
        <div style="font-size: 11pt; color: #ddd;">Tập trung Khối Tự nhiên</div>
      </div>
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">Tỷ Lệ Khá (6.5 - 7.9)</div>
        <div class="stat-number" style="color: #60a5fa;">${goodCount} <span style="font-size: 14pt; color: #fff;">HS (${Math.round((goodCount/totalStudents)*100)}%)</span></div>
        <div style="font-size: 11pt; color: #ddd;">Đang cải thiện tích cực</div>
      </div>
      <div class="card">
        <div style="font-size: 11pt; color: #aaa;">Mục Tiêu Đỗ Đại Học</div>
        <div class="stat-number" style="color: #f59e0b;">100%</div>
        <div style="font-size: 11pt; color: #98FF98;">ĐH Bách Khoa, Y Dược, Ngoại Thương</div>
      </div>
    </div>
    <div style="margin-top: 25px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; font-size: 11pt; line-height: 1.5;">
      <b style="color: #98FF98;">Giải pháp thực hiện trọng tâm:</b><br/>
      1. Triển khai mô hình "Đôi bạn cùng tiến" phân công các học sinh Top 1 kèm cặp môn Vật Lý và Hóa Học.<br/>
      2. Tăng cường giao bài tập kiểm tra trắc nghiệm AI định kỳ hằng tuần trên hệ thống DẠ HƯƠNG 2026-2027.<br/>
      3. Phối hợp chặt chẽ giữa GVCN và Phụ huynh theo dõi sát sao lịch học thêm và giờ tự học tại nhà.
    </div>
    <div class="footer">
      <span>Trang 4 | Kế hoạch Học tập</span>
      <span>DẠ HƯƠNG 2026-2027</span>
    </div>
  </div>

  <!-- SLIDE 5: CLOSING & CONNECT -->
  <div class="slide" style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h2 style="font-size: 30pt; color: #98FF98; font-weight: 800; margin-bottom: 15px;">
      TRÂN TRỌNG CẢM ƠN QUÝ PHỤ HUYNH & CÁC EM HỌC SINH!
    </h2>
    <p style="font-size: 14pt; color: #d0e0f0; max-width: 700px; line-height: 1.6; margin-bottom: 30px;">
      Sự đồng hành kết nối giữa Nhà trường - Gia đình - Xã hội là chìa khóa vàng giúp tập thể lớp ${escapeHtml(className)} bứt phá rực rỡ trong kỳ thi Tốt nghiệp THPT & Tuyển sinh Đại học 2027.
    </p>
    <div style="border-top: 2px solid #98FF98; padding-top: 20px; font-size: 13pt; color: #ffffff;">
      <b>GIÁO VIÊN CHỦ NHIỆM LỚP ${escapeHtml(className)}</b><br/>
      <span style="font-size: 16pt; font-weight: 800; color: #98FF98;">${escapeHtml(teacherName)}</span>
    </div>
    <div class="footer">
      <span>THPT Trần Nguyên Hãn</span>
      <span>DẠ HƯƠNG 2026-2027</span>
    </div>
  </div>

</body>
</html>
  `;

  const blob = new Blob([slidesHtml], { type: 'application/vnd.ms-powerpoint;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = className.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Slide_Hop_Phu_Huynh_${safeName}_THPT_Tran_Nguyen_Han.pptx`;
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
