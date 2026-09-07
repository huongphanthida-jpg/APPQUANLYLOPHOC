import * as XLSX from 'xlsx';
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

export interface HomeroomBookExportParams {
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

export function exportHomeroomMasterExcel(params: HomeroomBookExportParams) {
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

  const wb = XLSX.utils.book_new();

  // 1. Sheet: Trang Bìa & Thông Tin Chung
  const coverData = [
    ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    ['Độc lập - Tự do - Hạnh phúc'],
    ['---------------------------------'],
    ['SỞ GIÁO DỤC VÀ ĐÀO TẠO HẢI PHÒNG'],
    [`TRƯỜNG: ${classInfo.schoolName || 'THPT TRẦN NGUYÊN HÃN'}`],
    [''],
    ['SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH / SỔ CHỦ NHIỆM'],
    [`NĂM HỌC: ${bookData.academicYear || '2025 - 2026'}`],
    [''],
    ['LỚP:', classInfo.className || 'LỚP 12A1'],
    ['PHÒNG HỌC:', classInfo.roomName || 'Phòng 302 - Dãy A'],
    ['CHUYÊN BAN:', classInfo.streamBadge || classInfo.specialization || 'Khối Khoa học Tự nhiên (KHTN)'],
    ['KHẨU HIỆU LỚP:', classInfo.slogan || 'Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT'],
    [''],
    ['GIÁO VIÊN CHỦ NHIỆM:', teacherInfo.name || 'Thầy Nguyễn Văn An'],
    ['CHỨC DANH / HỌC VỊ:', teacherInfo.title || 'Thạc sĩ Toán học'],
    ['SỐ ĐIỆN THOẠI GVCN:', teacherInfo.phone || '0912.345.678'],
    ['EMAIL GVCN:', teacherInfo.email || 'nguyenvanan.gv@tnh.edu.vn'],
    [''],
    ['BAN GIÁM HIỆU DUYỆT:', bghInfo?.name || 'TS. Lê Thị Mai'],
    ['CHỨC VỤ:', bghInfo?.dutyRole || bghInfo?.title || 'Phó Hiệu Trưởng'],
    ['NGÀY DUYỆT SỔ ĐẦU NĂM:', '30/09/2025'],
    ['TÌNH TRẠNG SỔ:', 'Đã kiểm tra, ký duyệt điện tử và lưu trữ số hóa']
  ];
  const wsCover = XLSX.utils.aoa_to_sheet(coverData);
  XLSX.utils.book_append_sheet(wb, wsCover, 'Trang_Bia_Chung');

  // 2. Sheet: Sơ Yếu Lý Lịch & Trích Ngang Học Sinh
  const studentRows = students.map((s, index) => ({
    'STT': index + 1,
    'Mã Học Sinh': s.code,
    'Họ và Tên': s.name,
    'Giới Tính': s.gender,
    'Ngày Sinh': s.dob,
    'Tổ': `Tổ ${s.group}`,
    'Điện Thoại HS': s.phone,
    'Email': s.email,
    'Địa Chỉ Thường Trú': s.address,
    'Họ Tên Phụ Huynh': s.emergencyContact?.parentName || '',
    'Quan Hệ': s.emergencyContact?.relationship || 'Bố',
    'SĐT Phụ Huynh': s.emergencyContact?.phone || '',
    'Nơi Công Tác PH': s.emergencyContact?.workplace || '',
    'Sở Trường / Năng Khiếu': s.strengths || '',
    'Nguyện Vọng Nghề Nghiệp': s.careerAspiration || '',
    'Lưu Ý Sức Khỏe': s.healthNote || '',
    'Đoàn Viên': 'Đoàn viên',
    'Điểm Rèn Luyện': s.conductScore || 100,
    'Xếp Loại Hạnh Kiểm': s.conductRating || 'Tốt',
    'Điểm TB (GPA)': s.grades?.gpa || 0,
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'So_Yeu_Ly_Lich_HS');

  // 3. Sheet: Ban Cán Sự & Ban Đại Diện CMHS
  const committeeRows = (bookData.committee || []).map((c, i) => ({
    'STT': i + 1,
    'Chức Vụ': c.roleName,
    'Họ và Tên': c.studentName,
    'Số Điện Thoại': c.phone,
    'Nhiệm Vụ Phụ Trách': c.mainDuty,
  }));
  const wsCommittee = XLSX.utils.json_to_sheet(committeeRows);
  XLSX.utils.book_append_sheet(wb, wsCommittee, 'Ban_Can_Su_Lop');

  const parentsRows = (bookData.parentsBoard || []).map((p, i) => ({
    'STT': i + 1,
    'Vai Trò': p.role,
    'Họ và Tên PHHS': p.fullName,
    'Phụ Huynh Của Em': p.studentName,
    'Số Điện Thoại': p.phone,
    'Nơi Công Tác / Nghề Nghiệp': p.workplace,
    'Ghi Chú': p.notes || '',
  }));
  const wsParents = XLSX.utils.json_to_sheet(parentsRows);
  XLSX.utils.book_append_sheet(wb, wsParents, 'Ban_Dai_Dien_CMHS');

  // 4. Sheet: Kế Hoạch & Chỉ Tiêu Năm Học
  const planData = [
    ['KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM NĂM HỌC', bookData.academicYear],
    ['LỚP:', classInfo.className, 'SĨ SỐ:', `${bookData.plan.totalStudentsStart} học sinh (Nam: ${bookData.plan.maleCount}, Nữ: ${bookData.plan.femaleCount})`],
    [''],
    ['I. ĐẶC ĐIỂM TÌNH HÌNH LỚP'],
    ['1. Thuận lợi:'],
    ...bookData.plan.advantages.map((a, i) => [`  ${i + 1}. ${a}`]),
    ['2. Khó khăn:'],
    ...bookData.plan.difficulties.map((d, i) => [`  ${i + 1}. ${d}`]),
    [''],
    ['II. CHỈ TIÊU PHẤN ĐẤU NĂM HỌC'],
    ['1. Kết quả học tập:'],
    [`  - Học lực Giỏi & Xuất sắc: ${bookData.plan.academicTargets.excellent}%`],
    [`  - Học lực Khá: ${bookData.plan.academicTargets.good}%`],
    [`  - Học lực Đạt / Chưa đạt: 0%`],
    ['2. Kết quả rèn luyện (Hạnh kiểm):'],
    [`  - Hạnh kiểm Tốt: ${bookData.plan.conductTargets.good}%`],
    [`  - Hạnh kiểm Khá: ${bookData.plan.conductTargets.fair}%`],
    [`3. Tốt nghiệp THPT: ${bookData.plan.graduationTargetPercent}%`],
    [`4. Trúng tuyển Đại học NV1: ${bookData.plan.universityAdmissionTargetPercent}%`],
    [`5. Thi Học sinh Giỏi: ${bookData.plan.hsgAwardsTarget}`],
    [`6. Danh hiệu thi đua lớp: ${bookData.plan.classEmulationTitleTarget}`],
    [''],
    ['III. CÁC BIỆN PHÁP THỰC HIỆN TRỌNG TÂM'],
    ['1. Giáo dục đạo đức, tư tưởng, lối sống:', bookData.plan.keyMeasures.morality],
    ['2. Nâng cao chất lượng học tập & ôn thi:', bookData.plan.keyMeasures.studyQuality],
    ['3. Phối hợp Gia đình - Nhà trường - Xã hội:', bookData.plan.keyMeasures.cooperation],
    ['4. Công tác tự quản và phong trào thi đua:', bookData.plan.keyMeasures.selfManagement],
  ];
  const wsPlan = XLSX.utils.aoa_to_sheet(planData);
  XLSX.utils.book_append_sheet(wb, wsPlan, 'Ke_Hoach_Va_Chi_Tieu');

  // 5. Sheet: Bảng Điểm & Học Lực
  const gradeRows = students.map((s, idx) => ({
    'STT': idx + 1,
    'Mã HS': s.code,
    'Họ và Tên': s.name,
    'Tổ': s.group,
    'Toán TB': s.grades?.math?.avg ?? '',
    'Vật Lý TB': s.grades?.physics?.avg ?? '',
    'Hóa Học TB': s.grades?.chemistry?.avg ?? '',
    'Sinh Học TB': s.grades?.biology?.avg ?? '',
    'Ngữ Văn TB': s.grades?.literature?.avg ?? '',
    'Tiếng Anh TB': s.grades?.english?.avg ?? '',
    'Điểm GPA': s.grades?.gpa ?? '',
    'Xếp Loại Học Lực': (s.grades?.gpa ?? 0) >= 9.0 ? 'Xuất sắc' : (s.grades?.gpa ?? 0) >= 8.0 ? 'Giỏi' : (s.grades?.gpa ?? 0) >= 6.5 ? 'Khá' : 'Đạt',
    'Điểm Rèn Luyện': s.conductScore ?? 100,
    'Xếp Loại Rèn Luyện': s.conductRating ?? 'Tốt',
    'Xếp Hạng': idx + 1,
  }));
  const wsGrades = XLSX.utils.json_to_sheet(gradeRows);
  XLSX.utils.book_append_sheet(wb, wsGrades, 'Bang_Diem_Hoc_Luc');

  // 6. Sheet: Sơ Đồ Chỗ Ngồi & Đôi Bạn Cùng Tiến
  const pairsRows = studyPairs.map((p, i) => ({
    'STT': i + 1,
    'Vị Trí Bàn': p.deskLabel,
    'Học Sinh 1 (Kèm cặp)': `${p.student1.name} (${p.student1.strongSubject} - GPA ${p.student1.gpa})`,
    'Học Sinh 2 (Cùng tiến)': `${p.student2.name} (${p.student2.strongSubject} - GPA ${p.student2.gpa})`,
    'Mục Tiêu Tiến Bộ': p.targetGoal,
    'Trạng Thái': p.status === 'achieved' ? 'Đã đạt' : p.status === 'improving' ? 'Đang tiến bộ' : 'Đang thực hiện',
    'Nhận Xét Của GVCN': p.progressNote,
  }));
  const wsPairs = XLSX.utils.json_to_sheet(pairsRows);
  XLSX.utils.book_append_sheet(wb, wsPairs, 'Doi_Ban_Cung_Tien');

  // 7. Sheet: Thời Khóa Biểu & GV Bộ Môn
  const teachersRows = (bookData.subjectTeachers || []).map((t, i) => ({
    'STT': i + 1,
    'Môn Học': t.subjectName,
    'Giáo Viên Giảng Dạy': t.teacherName,
    'Số Điện Thoại': t.phone,
    'Email': t.email,
    'Số Tiết/Tuần': t.periodsPerWeek,
    'Ghi Chú': t.notes || '',
  }));
  const wsTeachers = XLSX.utils.json_to_sheet(teachersRows);
  XLSX.utils.book_append_sheet(wb, wsTeachers, 'DS_Giao_Vien_Bo_Mon');

  // 8. Sheet: Nề Nếp & Chuyên Cần & Vi Phạm
  const discRows = disciplineLogs.map((d, i) => ({
    'STT': i + 1,
    'Học Sinh': d.studentName,
    'Tổ': d.group,
    'Loại': d.type === 'bonus' ? 'Khen thưởng (+)' : 'Vi phạm / Trừ điểm (-)',
    'Danh Mục': d.category,
    'Điểm Số': d.points > 0 ? `+${d.points}` : `${d.points}`,
    'Nội Dung / Lý Do': d.reason,
    'Người Ghi Nhận': d.recordedBy,
    'Tuần': `Tuần ${d.week}`,
    'Thời Gian': d.timestamp,
  }));
  const wsDisc = XLSX.utils.json_to_sheet(discRows);
  XLSX.utils.book_append_sheet(wb, wsDisc, 'Ne_Nep_Va_Thi_Dua');

  // 9. Sheet: Lịch Trực Nhật 8 Buổi / Tuần
  const dutyRows = dutySchedule.map((duty, idx) => ({
    'STT': idx + 1,
    'Thứ': duty.dayOfWeek,
    'Buổi': duty.session || (duty.dayOfWeek === 'Thứ 5' || duty.dayOfWeek === 'Thứ 6' ? 'Sáng' : 'Sáng & Chiều'),
    'Khung Ca': duty.slotName || `${duty.session || 'Sáng'} ${duty.dayOfWeek}`,
    'Tổ Phụ Trách': `Tổ ${duty.assignedGroup}`,
    'Tổ Trưởng': duty.leaderName,
    'Trạng Thái': duty.status,
    'Số Lượng HS Phân Công': duty.assignedStudents?.length || 0,
    'Đầu Việc': (duty.tasks || []).join('; '),
    'Chi Tiết Phân Công': (duty.assignedStudents || []).map((s) => `${s.studentName}: ${s.specificTask} (${s.isCompleted ? 'Xong' : 'Chờ'})`).join(' | '),
    'Ghi Chú': duty.notes || '',
  }));
  const wsDuty = XLSX.utils.json_to_sheet(dutyRows);
  XLSX.utils.book_append_sheet(wb, wsDuty, 'Lich_Truc_Nhat_8_Buoi');

  // 10. Sheet: Tổng Hợp Thi Đua 4 Tổ
  const emRows = emulationLogs.map((e, idx) => ({
    'STT': idx + 1,
    'Tổ': `Tổ ${e.group}`,
    'Tuần': `Tuần ${e.week}`,
    'Tháng': e.month,
    'Hạng Mục': e.category,
    'Nội Dung Thành Tích / Vi Phạm': e.title,
    'Điểm Cộng / Trừ': e.points > 0 ? `+${e.points}` : `${e.points}`,
    'Mô Tả Chi Tiết': e.description || '',
    'Ngày Ghi Nhận': e.date,
    'Người Đánh Giá': e.recordedBy,
  }));
  const wsEm = XLSX.utils.json_to_sheet(emRows);
  XLSX.utils.book_append_sheet(wb, wsEm, 'Tong_Hop_Thi_Dua_To');

  // 11. Sheet: Đơn Xin Nghỉ Học
  const leaveRows = leaveRequests.map((l, i) => ({
    'STT': i + 1,
    'Học Sinh': l.studentName,
    'Tổ': l.group,
    'Từ Ngày': l.startDate,
    'Đến Ngày': l.endDate,
    'Lý Do': l.reason,
    'Người Gửi': l.submittedBy,
    'Trạng Thái': l.status === 'approved' ? 'Đã duyệt' : l.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt',
    'Ý Kiến GVCN': l.teacherNote || '',
    'Ngày Nộp': l.createdAt,
  }));
  const wsLeave = XLSX.utils.json_to_sheet(leaveRows);
  XLSX.utils.book_append_sheet(wb, wsLeave, 'So_Theo_Doi_Don_Tu');

  // 12. Sheet: Học Sinh Cần Quan Tâm & Biên Bản BGH
  const specialRows = (bookData.specialStudents || []).map((s, i) => ({
    'STT': i + 1,
    'Học Sinh': s.studentName,
    'Phân Loại': s.category,
    'Lý Do Cần Quan Tâm': s.reasons,
    'Kế Hoạch Giúp Đỡ': s.supportPlan,
    'Nhật Ký Tiến Bộ': (s.followUpNotes || []).map((n) => `[${n.date}] ${n.progress} (${n.evaluatedBy})`).join('; '),
  }));
  const wsSpecial = XLSX.utils.json_to_sheet(specialRows);
  XLSX.utils.book_append_sheet(wb, wsSpecial, 'HS_Can_Quan_Tam_Dac_Biet');

  // Write file
  const fileName = `SO_CHU_NHIEM_TOAN_DIEN_${(classInfo.className || '12A1').replace(/\s+/g, '_')}_NAM_HOC_2025_2026.xlsx`;
  XLSX.writeFile(wb, fileName);
}
