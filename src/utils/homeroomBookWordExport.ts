import {
  Student,
  DisciplineEntry,
  ClassJournalEntry,
  LeaveRequest,
  DutySchedule,
  ClassInfo,
  TeacherInfo,
  BghInfo,
  SeatingChartData,
  TimetableData,
  StudyPair,
  GroupEmulationLog,
  HomeroomBookData,
} from '../types';

export interface HomeroomBookWordExportParams {
  classInfo: ClassInfo;
  teacherInfo: TeacherInfo;
  bghInfo?: BghInfo;
  students: Student[];
  disciplineLogs: DisciplineEntry[];
  journal: ClassJournalEntry[];
  leaveRequests: LeaveRequest[];
  dutySchedule: DutySchedule[];
  seatingChart: SeatingChartData;
  timetable: TimetableData;
  studyPairs: StudyPair[];
  emulationLogs: GroupEmulationLog[];
  bookData: HomeroomBookData;
}

export function exportHomeroomMasterWord(params: HomeroomBookWordExportParams) {
  const {
    classInfo,
    teacherInfo,
    bghInfo,
    students,
    disciplineLogs,
    journal,
    leaveRequests,
    dutySchedule,
    timetable,
    studyPairs,
    emulationLogs,
    bookData,
  } = params;

  const schoolName = classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN';
  const className = classInfo.className || '12A1';
  const academicYear = bookData.academicYear || classInfo.academicYear || '2025 - 2026';
  const teacherName = teacherInfo.name || 'Thầy Nguyễn Văn An';
  const bghName = bghInfo?.name || 'TS. Lê Thị Mai';
  const bghRole = bghInfo?.dutyRole || bghInfo?.title || 'Phó Hiệu Trưởng';

  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Sổ Chủ Nhiệm Lớp ${className} - ${schoolName}</title>
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
      size: 21.0cm 29.7cm; /* A4 */
      margin: 2.0cm 1.8cm 2.0cm 2.0cm;
      mso-page-orientation: portrait;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.35;
      color: #000000;
      background-color: #ffffff;
    }
    h1, h2, h3, h4 {
      font-family: 'Times New Roman', Times, serif;
      color: #003366;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; }
    h2 { font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5pt solid #003366; padding-bottom: 3pt; margin-top: 18pt; }
    h3 { font-size: 13pt; font-weight: bold; color: #1e3a8a; }
    p, li { font-size: 12pt; margin-bottom: 4pt; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 8pt;
      margin-bottom: 14pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      border: 1px solid #333333;
      padding: 5pt 6pt;
      font-size: 10.5pt;
      vertical-align: middle;
    }
    th {
      background-color: #f0f4f8;
      font-weight: bold;
      text-align: center;
      color: #002244;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: bold; }
    .text-italic { font-style: italic; }
    .page-break {
      page-break-before: always;
      mso-break-type: page-break;
      clear: both;
    }
    .header-table {
      border: none;
      width: 100%;
      margin-bottom: 15pt;
    }
    .header-table td {
      border: none;
      padding: 2pt 4pt;
      vertical-align: top;
    }
    .signature-table {
      border: none;
      width: 100%;
      margin-top: 25pt;
      page-break-inside: avoid;
    }
    .signature-table td {
      border: none;
      padding: 4pt;
      text-align: center;
      vertical-align: top;
    }
    .badge {
      display: inline-block;
      padding: 2pt 6pt;
      border-radius: 4pt;
      font-size: 9.5pt;
      font-weight: bold;
    }
    .footer-note {
      font-size: 9.5pt;
      color: #666666;
      border-top: 1px dashed #cccccc;
      padding-top: 5pt;
      margin-top: 15pt;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="Section1">

  <!-- ==================== TRANG BÌA ==================== -->
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <p style="font-size: 11pt; font-weight: bold; margin: 0;">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
        <p style="font-size: 12pt; font-weight: bold; color: #003366; margin: 2pt 0 0 0;">${schoolName.toUpperCase()}</p>
        <p style="font-size: 10pt; margin: 2pt 0 0 0;">***</p>
      </td>
      <td style="width: 55%; text-align: center;">
        <p style="font-size: 11pt; font-weight: bold; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p style="font-size: 11pt; font-weight: bold; margin: 2pt 0 0 0;">Độc lập - Tự do - Hạnh phúc</p>
        <p style="font-size: 10pt; margin: 2pt 0 0 0;">-----------------------</p>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-top: 40pt; margin-bottom: 30pt;">
    <p style="font-size: 13pt; letter-spacing: 2pt; font-weight: bold; color: #555555; margin-bottom: 8pt;">HỆ THỐNG SỔ ĐIỆN TỬ BẬC THPT</p>
    <h1 style="font-size: 22pt; line-height: 1.25; margin: 0; color: #003366;">SỔ CHỦ NHIỆM TOÀN DIỆN</h1>
    <p style="font-size: 16pt; font-weight: bold; color: #b45309; margin-top: 10pt;">LỚP: ${className}</p>
    <p style="font-size: 13pt; font-weight: bold; color: #333333; margin-top: 6pt;">NĂM HỌC: ${academicYear}</p>
    <p style="font-size: 11pt; font-style: italic; color: #555555; margin-top: 4pt;">(Lưu trữ hồ sơ học sinh, nề nếp, học tập & thi đua)</p>
  </div>

  <table style="width: 80%; margin: 0 auto; border: 1.5pt solid #003366;">
    <tr style="background-color: #f0f4f8;">
      <th colspan="2" style="font-size: 12pt; padding: 8pt; text-align: center; color: #003366;">THÔNG TIN HÀNH CHÍNH & TỔ CHỨC</th>
    </tr>
    <tr>
      <td style="width: 40%; font-weight: bold; background-color: #fbfbfb;">Trường THPT:</td>
      <td style="font-weight: bold; color: #003366;">${schoolName}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Phòng học / Địa điểm:</td>
      <td>${classInfo.roomName || 'Phòng 302 - Nhà A'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Chuyên ban / Khối:</td>
      <td>${classInfo.streamBadge || classInfo.specialization || 'Khối Khoa học Tự nhiên (KHTN)'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Khẩu hiệu lớp:</td>
      <td style="font-style: italic; color: #003366;">"${classInfo.slogan || 'Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT'}"</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Sĩ số đầu năm:</td>
      <td><strong>${students.length}</strong> học sinh (Nam: ${students.filter(s => s.gender === 'Nam').length} - Nữ: ${students.filter(s => s.gender === 'Nữ').length})</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Giáo viên chủ nhiệm (GVCN):</td>
      <td><strong>${teacherName}</strong> (${teacherInfo.title || 'Thạc sĩ Toán học'}) - SĐT: ${teacherInfo.phone || '0912.345.678'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #fbfbfb;">Ban Giám Hiệu phụ trách:</td>
      <td><strong>${bghName}</strong> (${bghRole}) - SĐT: ${bghInfo?.phone || '0903.888.999'}</td>
    </tr>
  </table>

  <div class="footer-note" style="margin-top: 50pt;">
    Hệ Thống Sổ Chủ Nhiệm Số Hóa • ${schoolName} • Đồng Bộ Dữ Liệu Học Đường Toàn Diện
  </div>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 1: KẾ HOẠCH NĂM HỌC ==================== -->
  <h2>PHẦN 1: KẾ HOẠCH NĂM HỌC & CHỈ TIÊU PHẤN ĐẤU</h2>
  
  <h3>I. Đặc điểm tình hình lớp</h3>
  <p><strong>1. Thuận lợi:</strong></p>
  <ul>
    ${(bookData.plan?.advantages || [
      'Đa số học sinh có ý thức tự giác học tập, tinh thần đoàn kết và kỷ luật tốt.',
      'Đội ngũ Giáo viên bộ môn giàu kinh nghiệm luyện thi Tốt nghiệp THPT và Đánh giá năng lực.',
      'Ban đại diện Cha mẹ học sinh nhiệt tình, luôn đồng hành chặt chẽ cùng GVCN và Nhà trường.'
    ]).map(adv => `<li>${adv}</li>`).join('')}
  </ul>

  <p><strong>2. Khó khăn:</strong></p>
  <ul>
    ${(bookData.plan?.difficulties || [
      'Áp lực học tập năm cuối cấp rất lớn đối với kỳ thi Tốt nghiệp THPT và xét tuyển Đại học.',
      'Một số học sinh nhà ở xa trường, việc đi lại trong mùa mưa bão gặp khó khăn.'
    ]).map(dif => `<li>${dif}</li>`).join('')}
  </ul>

  <h3>II. Các chỉ tiêu thi đua năm học (${academicYear})</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">STT</th>
        <th style="width: 50%;">Hạng Mục / Lĩnh Vực Đánh Giá</th>
        <th style="width: 40%;">Chỉ Tiêu Phấn Đấu Đăng Ký</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td><strong>Học lực Xuất sắc & Giỏi</strong></td>
        <td class="text-center text-bold" style="color: #003366;">${bookData.plan?.academicTargets?.excellent || 65}% trở lên</td>
      </tr>
      <tr>
        <td class="text-center">2</td>
        <td><strong>Học lực Khá</strong></td>
        <td class="text-center text-bold">${bookData.plan?.academicTargets?.good || 35}%</td>
      </tr>
      <tr>
        <td class="text-center">3</td>
        <td><strong>Học lực Đạt / Chưa đạt</strong></td>
        <td class="text-center text-bold" style="color: #16a34a;">0% (Không có HS xếp loại yếu)</td>
      </tr>
      <tr>
        <td class="text-center">4</td>
        <td><strong>Hạnh kiểm (Rèn luyện) Tốt</strong></td>
        <td class="text-center text-bold" style="color: #003366;">${bookData.plan?.conductTargets?.good || 95}%</td>
      </tr>
      <tr>
        <td class="text-center">5</td>
        <td><strong>Tốt nghiệp THPT Quốc gia</strong></td>
        <td class="text-center text-bold" style="color: #b45309;">${bookData.plan?.graduationTargetPercent || 100}%</td>
      </tr>
      <tr>
        <td class="text-center">6</td>
        <td><strong>Trúng tuyển Đại học Nguyện vọng 1</strong></td>
        <td class="text-center text-bold">${bookData.plan?.universityAdmissionTargetPercent || 92}%</td>
      </tr>
      <tr>
        <td class="text-center">7</td>
        <td><strong>Chỉ tiêu Học sinh Giỏi (Cấp trường & Thành phố)</strong></td>
        <td>${bookData.plan?.hsgAwardsTarget || 'Đạt từ 5 - 8 giải cấp Trường và 2 - 4 giải cấp Thành phố'}</td>
      </tr>
      <tr>
        <td class="text-center">8</td>
        <td><strong>Danh hiệu thi đua tập thể lớp</strong></td>
        <td class="text-bold" style="color: #003366;">${bookData.plan?.classEmulationTitleTarget || 'Tập thể Lớp Tiên tiến Xuất sắc / Chi đoàn Vững mạnh Xuất sắc'}</td>
      </tr>
    </tbody>
  </table>

  <h3>III. Biện pháp thực hiện trọng tâm</h3>
  <p><strong>1. Giáo dục đạo đức & nề nếp:</strong> ${bookData.plan?.keyMeasures?.morality || 'Tăng cường giáo dục truyền thống nhà trường, văn hóa ứng xử văn minh trong không gian mạng và đời sống học đường.'}</p>
  <p><strong>2. Nâng cao chất lượng học tập:</strong> ${bookData.plan?.keyMeasures?.studyQuality || 'Tổ chức các nhóm học tập Đôi bạn cùng tiến, phụ đạo học sinh còn hạn chế, tăng cường luyện đề phân hóa theo cấu trúc đề thi mới.'}</p>
  <p><strong>3. Phối hợp Gia đình - Nhà trường - Xã hội:</strong> ${bookData.plan?.keyMeasures?.cooperation || 'Duy trì liên lạc thường xuyên qua sổ liên lạc điện tử, họp phụ huynh định kỳ và giải quyết kịp thời các vấn đề phát sinh.'}</p>
  <p><strong>4. Năng lực tự quản & phong trào:</strong> ${bookData.plan?.keyMeasures?.selfManagement || 'Phát huy vai trò của Ban cán sự lớp và Ban chấp hành Chi đoàn trong việc tự quản 15 phút đầu giờ và kiểm tra chéo giữa các tổ.'}</p>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 2: CƠ CẤU TỔ CHỨC ==================== -->
  <h2>PHẦN 2: CƠ CẤU TỔ CHỨC LỚP, BAN ĐẠI DIỆN CMHS & GV BỘ MÔN</h2>

  <h3>I. Ban Cán Sự Lớp & Ban Chấp Hành Chi Đoàn</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 25%;">Chức Vụ</th>
        <th style="width: 27%;">Họ và Tên Học Sinh</th>
        <th style="width: 15%;">Số Điện Thoại</th>
        <th style="width: 25%;">Nhiệm Vụ Phụ Trách</th>
      </tr>
    </thead>
    <tbody>
      ${(bookData.committee || []).map((c, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-bold">${c.roleName}</td>
          <td>${c.studentName}</td>
          <td class="text-center">${c.phone}</td>
          <td>${c.mainDuty}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>II. Ban Đại Diện Cha Mẹ Học Sinh (CMHS)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 20%;">Vai Trò</th>
        <th style="width: 24%;">Họ và Tên Phụ Huynh</th>
        <th style="width: 18%;">PH Của Học Sinh</th>
        <th style="width: 15%;">Số Điện Thoại</th>
        <th style="width: 15%;">Nơi Công Tác / Ghi Chú</th>
      </tr>
    </thead>
    <tbody>
      ${(bookData.parentsBoard || []).map((p, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-bold">${p.role}</td>
          <td>${p.fullName}</td>
          <td>${p.studentName}</td>
          <td class="text-center">${p.phone}</td>
          <td>${p.workplace || p.notes || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>III. Danh Sách Giáo Viên Bộ Môn Giảng Dạy</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 22%;">Môn Học</th>
        <th style="width: 28%;">Họ và Tên Giáo Viên</th>
        <th style="width: 18%;">Số Tiết / Tuần</th>
        <th style="width: 24%;">Số Điện Thoại / Email</th>
      </tr>
    </thead>
    <tbody>
      ${(bookData.subjectTeachers || []).map((t, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-bold">${t.subjectName}</td>
          <td>${t.teacherName}</td>
          <td class="text-center">${t.periodsPerWeek || 3} tiết</td>
          <td>${t.phone} ${t.email ? `<br><span style="font-size: 9pt; color: #555;">${t.email}</span>` : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 3: SƠ YẾU LÝ LỊCH HỌC SINH ==================== -->
  <h2>PHẦN 3: SƠ YẾU LÝ LỊCH VÀ TRÍCH NGANG HỌC SINH (SĨ SỐ: ${students.length})</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 9%;">Mã HS</th>
        <th style="width: 18%;">Họ và Tên</th>
        <th style="width: 7%;">Phái</th>
        <th style="width: 10%;">Ngày Sinh</th>
        <th style="width: 6%;">Tổ</th>
        <th style="width: 18%;">Họ Tên & SĐT Phụ Huynh</th>
        <th style="width: 15%;">Địa Chỉ Thường Trú</th>
        <th style="width: 12%;">ĐTB / Xếp Loại</th>
      </tr>
    </thead>
    <tbody>
      ${students.map((s, idx) => {
        const gpa = s.grades?.gpa || 0;
        const hlk = gpa >= 9.0 ? 'Xuất sắc' : gpa >= 8.0 ? 'Giỏi' : gpa >= 6.5 ? 'Khá' : 'Đạt';
        const hk = s.conductRating || 'Tốt';
        return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center text-bold" style="font-family: monospace;">${s.code}</td>
          <td class="text-bold">${s.name}</td>
          <td class="text-center">${s.gender}</td>
          <td class="text-center">${s.dob}</td>
          <td class="text-center">Tổ ${s.group}</td>
          <td>
            ${s.emergencyContact?.parentName || '-'}<br>
            <span style="font-size: 9pt; color: #003366;">${s.emergencyContact?.phone || s.phone || '-'}</span>
          </td>
          <td style="font-size: 9.5pt;">${s.address || '-'}</td>
          <td class="text-center">
            <strong>${gpa.toFixed(1)}</strong><br>
            <span style="font-size: 9pt;">${hlk} / ${hk}</span>
          </td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 4: SƠ ĐỒ LỚP & THỜI KHÓA BIỂU ==================== -->
  <h2>PHẦN 4: SƠ ĐỒ LỚP HỌC, ĐÔI BẠN CÙNG TIẾN & THỜI KHÓA BIỂU</h2>

  <h3>I. Danh Sách Các Cặp "Đôi Bạn Cùng Tiến"</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 14%;">Vị Trí Bàn</th>
        <th style="width: 25%;">Học Sinh Kèm Cặp (Nòng Cốt)</th>
        <th style="width: 25%;">Học Sinh Cần Hỗ Trợ</th>
        <th style="width: 28%;">Mục Tiêu & Tiến Độ Học Tập</th>
      </tr>
    </thead>
    <tbody>
      ${(studyPairs || []).map((pair, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center text-bold">${pair.deskLabel || pair.deskKey}</td>
          <td><strong>${pair.student1?.name || '-'}</strong> (Giỏi ${pair.student1?.strongSubject || 'Toán'})</td>
          <td>${pair.student2?.name || '-'} (Mục tiêu: ${pair.student2?.strongSubject || 'Cải thiện điểm'})</td>
          <td>
            <strong>Mục tiêu:</strong> ${pair.targetGoal}<br>
            <span style="font-size: 9pt; color: #16a34a;">${pair.progressNote || 'Tiến bộ rõ rệt'}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>II. Thời Khóa Biểu Giảng Dạy (Sáng & Chiều)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Tiết</th>
        <th style="width: 15%;">Thứ Hai</th>
        <th style="width: 15%;">Thứ Ba</th>
        <th style="width: 15%;">Thứ Tư</th>
        <th style="width: 15%;">Thứ Năm</th>
        <th style="width: 15%;">Thứ Sáu</th>
        <th style="width: 15%;">Thứ Bảy</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th colspan="7" style="background-color: #e0f2fe; color: #0369a1; text-align: left; padding: 4pt 8pt;">BUỔI SÁNG (07:00 - 11:30)</th>
      </tr>
      ${[1, 2, 3, 4, 5].map(periodNum => `
        <tr>
          <td class="text-center text-bold">Tiết ${periodNum}</td>
          ${['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(dayKey => {
            const dayObj = (timetable?.days || []).find(d => d.dayKey === dayKey);
            const period = (dayObj?.morning || []).find(p => p.period === periodNum);
            return `
              <td style="font-size: 9.5pt;">
                ${period ? `<strong>${period.subject}</strong><br><span style="font-size: 8.5pt; color: #555;">${period.teacher || ''}</span>` : '-'}
              </td>
            `;
          }).join('')}
        </tr>
      `).join('')}
      <tr>
        <th colspan="7" style="background-color: #fef3c7; color: #92400e; text-align: left; padding: 4pt 8pt;">BUỔI CHIỀU (13:30 - 17:00)</th>
      </tr>
      ${[1, 2, 3, 4].map(periodNum => `
        <tr>
          <td class="text-center text-bold">Tiết ${periodNum}</td>
          ${['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(dayKey => {
            const dayObj = (timetable?.days || []).find(d => d.dayKey === dayKey);
            const period = (dayObj?.afternoon || []).find(p => p.period === periodNum);
            return `
              <td style="font-size: 9.5pt;">
                ${period ? `<strong>${period.subject}</strong><br><span style="font-size: 8.5pt; color: #555;">${period.teacher || ''}</span>` : '-'}
              </td>
            `;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 5: NỀ NẾP & SỔ ĐẦU BÀI ==================== -->
  <h2>PHẦN 5: THEO DÕI NỀ NẾP, NHẬT KÝ SỔ ĐẦU BÀI & KỶ LUẬT</h2>

  <h3>I. Nhật Ký Giảng Dạy & Sổ Đầu Bài Trọng Điểm</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Thứ / Ngày</th>
        <th style="width: 8%;">Tiết</th>
        <th style="width: 16%;">Môn Học</th>
        <th style="width: 20%;">Giáo Viên Giảng Dạy</th>
        <th style="width: 18%;">Tên Bài Dạy</th>
        <th style="width: 14%;">Sĩ Số / Vắng</th>
        <th style="width: 10%;">Xếp Loại</th>
      </tr>
    </thead>
    <tbody>
      ${(journal.slice(0, 15) || []).map((j) => `
        <tr>
          <td class="text-center">${j.dayOfWeek || 'Thứ 2'} (${j.date || ''})</td>
          <td class="text-center">Tiết ${j.period || 1}</td>
          <td class="text-bold">${j.subject}</td>
          <td>${j.teacherName}</td>
          <td>${j.lessonName || '-'}</td>
          <td class="text-center">${j.attendance || 'Đủ'}</td>
          <td class="text-center text-bold" style="color: #16a34a;">${j.assessment || 'A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>II. Sổ Theo Dõi Vi Phạm Kỷ Luật & Tuyên Dương Khen Thưởng</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 14%;">Thời Gian</th>
        <th style="width: 20%;">Học Sinh</th>
        <th style="width: 14%;">Phân Loại</th>
        <th style="width: 10%;">Điểm</th>
        <th style="width: 34%;">Lý Do / Nội Dung Ghi Nhận</th>
      </tr>
    </thead>
    <tbody>
      ${(disciplineLogs.slice(0, 15) || []).map((d, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${d.timestamp || `Tuần ${d.week}`}</td>
          <td class="text-bold">${d.studentName} (Tổ ${d.group})</td>
          <td class="text-center text-bold" style="color: ${d.type === 'bonus' ? '#16a34a' : '#dc2626'};">
            ${d.type === 'bonus' ? 'Khen Thưởng' : 'Vi Phạm'}
          </td>
          <td class="text-center text-bold">${d.points > 0 ? `+${d.points}` : d.points}</td>
          <td>${d.reason} (${d.category})</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 6: BẢNG ĐIỂM & ĐÁNH GIÁ ==================== -->
  <h2>PHẦN 6: BẢNG TỔNG HỢP ĐIỂM SỐ & KẾT QUẢ 2 MẶT GIÁO DỤC</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 20%;">Họ và Tên</th>
        <th style="width: 7%;">Toán</th>
        <th style="width: 7%;">Vật Lý</th>
        <th style="width: 7%;">Hóa</th>
        <th style="width: 7%;">Sinh</th>
        <th style="width: 7%;">Văn</th>
        <th style="width: 7%;">Anh</th>
        <th style="width: 8%;">ĐTB</th>
        <th style="width: 11%;">Học Lực</th>
        <th style="width: 14%;">Hạnh Kiểm</th>
      </tr>
    </thead>
    <tbody>
      ${students.map((s, idx) => {
        const gpa = s.grades?.gpa || 0;
        const hlk = gpa >= 9.0 ? 'Xuất sắc' : gpa >= 8.0 ? 'Giỏi' : gpa >= 6.5 ? 'Khá' : 'Đạt';
        const hk = s.conductRating || 'Tốt';
        return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-bold">${s.name}</td>
          <td class="text-center">${s.grades?.math?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center">${s.grades?.physics?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center">${s.grades?.chemistry?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center">${s.grades?.biology?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center">${s.grades?.literature?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center">${s.grades?.english?.avg?.toFixed(1) ?? '-'}</td>
          <td class="text-center text-bold" style="color: #003366;">${gpa.toFixed(1)}</td>
          <td class="text-center text-bold">${hlk}</td>
          <td class="text-center text-bold" style="color: #16a34a;">${hk}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 7: TRỰC NHẬT & THI ĐUA TỔ ==================== -->
  <h2>PHẦN 7: PHÂN CÔNG TRỰC NHẬT & ĐIỂM THI ĐUA 4 TỔ</h2>

  <h3>I. Lịch Phân Công Trực Nhật Trong Tuần</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Thứ / Buổi</th>
        <th style="width: 15%;">Tổ Phụ Trách</th>
        <th style="width: 25%;">Trưởng Nhóm Trực</th>
        <th style="width: 45%;">Nhiệm Vụ Vệ Sinh & Kiểm Tra</th>
      </tr>
    </thead>
    <tbody>
      ${(dutySchedule || []).map((duty) => `
        <tr>
          <td class="text-center text-bold">${duty.dayOfWeek} (${duty.session || 'Sáng'})</td>
          <td class="text-center">Tổ ${duty.assignedGroup}</td>
          <td class="text-bold">${duty.leaderName}</td>
          <td>${duty.tasks?.join('; ') || 'Lau bảng, giặt giẻ, quét lớp, kê bàn ghế ngay ngắn'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>II. Tổng Hợp Nhật Ký Thi Đua Tổ</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">STT</th>
        <th style="width: 14%;">Thời Gian</th>
        <th style="width: 12%;">Tổ</th>
        <th style="width: 12%;">Điểm</th>
        <th style="width: 26%;">Hạng Mục</th>
        <th style="width: 26%;">Nội Dung / Tiêu Chí</th>
      </tr>
    </thead>
    <tbody>
      ${(emulationLogs.slice(0, 15) || []).map((log, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${log.date || log.month}</td>
          <td class="text-center text-bold">Tổ ${log.group}</td>
          <td class="text-center text-bold" style="color: ${log.points >= 0 ? '#16a34a' : '#dc2626'};">
            ${log.points > 0 ? `+${log.points}` : log.points}
          </td>
          <td>${log.category}</td>
          <td>${log.title}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 8: HS ĐẶC BIỆT & ĐƠN TỪ ==================== -->
  <h2>PHẦN 8: HỌC SINH CẦN QUAN TÂM ĐẶC BIỆT & SỔ THEO DÕI ĐƠN TỪ</h2>

  <h3>I. Danh Sách Học Sinh Có Hoàn Cảnh / Cần Bồi Dưỡng Đặc Biệt</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 22%;">Họ và Tên Học Sinh</th>
        <th style="width: 24%;">Phân Loại & Lý Do</th>
        <th style="width: 30%;">Kế Hoạch Giúp Đỡ & Biện Pháp</th>
        <th style="width: 16%;">Theo Dõi / Đánh Giá</th>
      </tr>
    </thead>
    <tbody>
      ${(bookData.specialStudents || []).map((sp, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-bold">${sp.studentName}</td>
          <td><strong>${sp.category}:</strong> ${sp.reasons}</td>
          <td>${sp.supportPlan}</td>
          <td class="text-center text-bold" style="color: #16a34a;">Đang tiến bộ</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>II. Sổ Theo Dõi Đơn Xin Nghỉ Phép Của Học Sinh</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 14%;">Ngày Tạo</th>
        <th style="width: 22%;">Học Sinh Xin Nghỉ</th>
        <th style="width: 28%;">Lý Do Nghỉ Học</th>
        <th style="width: 16%;">Thời Gian Nghỉ</th>
        <th style="width: 12%;">Trạng Thái</th>
      </tr>
    </thead>
    <tbody>
      ${(leaveRequests.slice(0, 15) || []).map((req, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${req.createdAt || '-'}</td>
          <td class="text-bold">${req.studentName} (Tổ ${req.group})</td>
          <td>${req.reason}</td>
          <td class="text-center">${req.startDate} ${req.endDate ? `đến ${req.endDate}` : ''}</td>
          <td class="text-center text-bold" style="color: #16a34a;">${req.status === 'approved' ? 'Đã Duyệt' : 'Đã Ghi Nhận'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PHẦN 9: BIÊN BẢN & DUYỆT BGH ==================== -->
  <h2>PHẦN 9: BIÊN BẢN HỌP & NHẬN XÉT KIỂM TRA CỦA BAN GIÁM HIỆU</h2>

  <h3>I. Biên Bản Các Kỳ Họp Cha Mẹ Học Sinh & Sinh Hoạt Lớp</h3>
  ${(bookData.meetingMinutes || []).map((m, idx) => `
    <div style="border: 1px solid #cccccc; padding: 10pt; margin-bottom: 12pt; background-color: #fafafa;">
      <p style="font-weight: bold; font-size: 12pt; color: #003366; margin-top: 0;">${idx + 1}. ${m.title} (${m.date})</p>
      <p><strong>Loại cuộc họp:</strong> ${m.meetingType} | <strong>Chủ trì:</strong> ${m.presidedBy} | <strong>Thư ký:</strong> ${m.secretary} | <strong>Tham dự:</strong> ${m.attendeesCount}</p>
      <p><strong>Nội dung trọng tâm:</strong></p>
      <p style="white-space: pre-line; margin-left: 10pt;">${m.mainContent}</p>
      <p><strong>Nghị quyết thống nhất:</strong> <span style="font-style: italic; color: #1e3a8a;">${m.resolutions}</span></p>
    </div>
  `).join('')}

  <h3>II. Nhận Xét & Đánh Giá Kiểm Tra Sổ Định Kỳ Của Ban Giám Hiệu</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Thời Gian</th>
        <th style="width: 25%;">Cán Bộ Kiểm Tra</th>
        <th style="width: 45%;">Ý Kiến Nhận Xét & Đánh Giá Chất Lượng</th>
        <th style="width: 15%;">Xếp Loại Sổ</th>
      </tr>
    </thead>
    <tbody>
      ${(bookData.inspections || []).map((ins) => `
        <tr>
          <td class="text-center text-bold">${ins.inspectionDate || ins.period}</td>
          <td><strong>${ins.inspectorName}</strong><br><span style="font-size: 9pt; color: #555;">${ins.inspectorRole}</span></td>
          <td>
            <strong>Ưu điểm:</strong> ${ins.strengths}<br>
            ${ins.recommendations ? `<strong>Kiến nghị:</strong> ${ins.recommendations}` : ''}
          </td>
          <td class="text-center text-bold" style="color: #16a34a;">${ins.rating || 'Tốt (A)'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- ==================== KHUNG CHỮ KÝ XÁC NHẬN CHÍNH THỨC ==================== -->
  <table class="signature-table">
    <tr>
      <td style="width: 50%;">
        <p style="font-size: 11pt; margin-bottom: 2pt;"><em>Hải Phòng, ngày ...... tháng ...... năm 2026</em></p>
        <p style="font-weight: bold; text-transform: uppercase; margin: 0; font-size: 11pt;">GIÁO VIÊN CHỦ NHIỆM</p>
        <p style="font-size: 10pt; font-style: italic; color: #666666; margin: 2pt 0 45pt 0;">(Ký và ghi rõ họ tên)</p>
        <p style="font-weight: bold; font-size: 12pt; color: #003366; margin: 0;">${teacherName}</p>
        <p style="font-size: 9.5pt; color: #16a34a; margin: 2pt 0 0 0;">✓ Đã ký xác thực điện tử</p>
      </td>
      <td style="width: 50%;">
        <p style="font-size: 11pt; margin-bottom: 2pt;"><em>Duyệt của Ban Giám Hiệu nhà trường</em></p>
        <p style="font-weight: bold; text-transform: uppercase; margin: 0; font-size: 11pt;">BAN GIÁM HIỆU PHÊ DUYỆT</p>
        <p style="font-size: 10pt; font-style: italic; color: #666666; margin: 2pt 0 45pt 0;">(Ký, đóng dấu số hóa)</p>
        <p style="font-weight: bold; font-size: 12pt; color: #003366; margin: 0;">${bghName}</p>
        <p style="font-size: 9.5pt; color: #b45309; margin: 2pt 0 0 0;">★ ĐÃ DUYỆT LƯU TRỮ HỒ SƠ</p>
      </td>
    </tr>
  </table>

  <div class="footer-note" style="margin-top: 35pt;">
    HỆ THỐNG SỔ CHỦ NHIỆM ĐIỆN TỬ - ${schoolName.toUpperCase()} • NĂM HỌC ${academicYear}
  </div>

</div>
</body>
</html>
`;

  // Trigger download with Word format .doc
  const cleanClassName = (className || '12A1').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanAcademicYear = (academicYear || '2025_2026').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `So_Chu_Nhiem_${cleanClassName}_${cleanAcademicYear}.doc`;

  const blob = new Blob(['\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
