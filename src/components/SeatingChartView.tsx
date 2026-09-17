import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  Search,
  ArrowLeftRight,
  Sparkles,
  RefreshCw,
  Printer,
  Eye,
  Glasses,
  GraduationCap,
  Award,
  HeartPulse,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  MapPin,
  Edit3,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  X,
  Shuffle,
  ChevronDown,
  Info,
  ExternalLink,
  BookOpen,
  HeartHandshake,
  Save,
  Download,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, UserRole, SeatingChartData, SeatingDisplayMode, ClassInfo, TeacherInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { EditSeatingModal } from './homeroom-book/EditSeatingModal';

interface SeatingChartViewProps {
  students: Student[];
  seatingChart: SeatingChartData;
  onSaveSeatingChart: (chart: SeatingChartData) => void;
  onResetSeatingChart: () => void;
  role: UserRole;
  currentStudentId?: string;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onSelectStudent?: (student: Student) => void;
  onNavigateToConnect?: () => void;
}

export const SeatingChartView: React.FC<SeatingChartViewProps> = ({
  students,
  seatingChart,
  onSaveSeatingChart,
  onResetSeatingChart,
  role,
  currentStudentId,
  classInfo,
  teacherInfo,
  onSelectStudent,
  onNavigateToConnect,
}) => {
  const [displayMode, setDisplayMode] = useState<SeatingDisplayMode>('avatar_name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeatKey, setSelectedSeatKey] = useState<string | null>(null);
  const [targetSwapSeatKey, setTargetSwapSeatKey] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // seatKey to assign
  const [selectedUnassignedStudentId, setSelectedUnassignedStudentId] = useState<string | null>(null);
  const [assignModalSearch, setAssignModalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditSeatingModalOpen, setIsEditSeatingModalOpen] = useState(false);
  const [isAutoArrangeOpen, setIsAutoArrangeOpen] = useState(false);
  const autoArrangeRef = useRef<HTMLDivElement>(null);

  // Excel template download & import states
  const [isImportSeatingModalOpen, setIsImportSeatingModalOpen] = useState(false);
  const [importSeatingFile, setImportSeatingFile] = useState<File | null>(null);
  const [parsedAssignments, setParsedAssignments] = useState<{ [seatKey: string]: string | null } | null>(null);
  const [parsedCount, setParsedCount] = useState<number>(0);
  const [importSeatingError, setImportSeatingError] = useState<string | null>(null);
  const [isParsingSeating, setIsParsingSeating] = useState(false);
  const seatingFileInputRef = useRef<HTMLInputElement>(null);

  const handlePrintSeatingChart = () => {
    window.print();
  };

  // Download Sample Excel Template for Seating Chart (4 Aisles x 6 Desks x 2 Seats)
  const downloadSeatingTemplate = () => {
    const sampleRows = [
      ['Dãy', 'Bàn', 'Ghế', 'Mã học sinh', 'Họ và tên học sinh'],
      [1, 1, 1, 'HS001', 'Nguyễn Văn An'],
      [1, 1, 2, 'HS002', 'Bùi Thị Bình'],
      [1, 2, 1, 'HS003', 'Trần Văn Cường'],
      [1, 2, 2, 'HS004', 'Đỗ Thị Duyên'],
      [1, 3, 1, 'HS005', 'Lê Hoàng Em'],
      [1, 3, 2, 'HS006', 'Phạm Thị Giang'],
      [2, 1, 1, 'HS007', 'Vũ Văn Hùng'],
      [2, 1, 2, 'HS008', 'Đặng Thị Hương'],
      [2, 2, 1, 'HS009', 'Hoàng Văn Khoa'],
      [2, 2, 2, 'HS010', 'Ngô Thị Lan'],
      [3, 1, 1, 'HS011', 'Trịnh Văn Minh'],
      [3, 1, 2, 'HS012', 'Lý Thị Ngân'],
      [4, 1, 1, 'HS013', 'Dương Văn Nam'],
      [4, 1, 2, 'HS014', 'Mai Thị Oanh'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SoDoLop4Day');
    const className = classInfo?.className || '11D5';
    XLSX.writeFile(wb, `mau_so_do_lop_4_day_${className.replace(/\s+/g, '_')}.xlsx`);
    showToast('Đã tải xuống file Excel mẫu sơ đồ lớp (4 Dãy x 6 Bàn)!');
  };

  // Parse Excel / CSV Seating Chart File
  const handleFileSelectSeating = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportSeatingFile(file);
    setImportSeatingError(null);
    setIsParsingSeating(true);
    setParsedAssignments(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        setImportSeatingError('File không chứa dữ liệu Sơ đồ lớp hoặc sai định dạng!');
        setIsParsingSeating(false);
        return;
      }

      // Find header row containing column keywords: dãy, bàn, ghế, tên / mã
      let headerIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const rowStr = rows[i].join(' ').toLowerCase();
        if (rowStr.includes('dãy') || rowStr.includes('bàn') || rowStr.includes('ghế') || rowStr.includes('họ và tên') || rowStr.includes('tên')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rows[headerIdx].map((h) => String(h || '').trim().toLowerCase());
      const findCol = (keywords: string[]) =>
        headers.findIndex((h) => keywords.some((k) => h.includes(k)));

      const colDay = findCol(['dãy', 'day', 'column', 'aisle', 'cot']);
      const colBan = findCol(['bàn', 'ban', 'row', 'hang']);
      const colGhe = findCol(['ghế', 'ghe', 'seat', 'vitri', 'vi tri']);
      const colCode = findCol(['mã', 'ma', 'code', 'stt', 'id']);
      const colName = findCol(['họ và tên', 'ho va ten', 'tên', 'ten', 'name', 'học sinh', 'hoc sinh']);

      if (colDay === -1 || colBan === -1 || colGhe === -1) {
        setImportSeatingError('File Excel thiếu các cột vị trí bắt buộc: Dãy, Bàn, Ghế!');
        setIsParsingSeating(false);
        return;
      }

      const newAssignments: { [seatKey: string]: string | null } = { ...(seatingChart?.assignments || {}) };
      // Clear current seat assignments for fresh import layout
      for (let col = 1; col <= 4; col++) {
        for (let desk = 1; desk <= 6; desk++) {
          newAssignments[`${col}-${desk}-1`] = null;
          newAssignments[`${col}-${desk}-2`] = null;
        }
      }

      let count = 0;
      const allStudents = students || [];

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;

        const dayVal = Number(String(r[colDay] || '').replace(/[^0-9]/g, ''));
        const banVal = Number(String(r[colBan] || '').replace(/[^0-9]/g, ''));
        const gheVal = Number(String(r[colGhe] || '').replace(/[^0-9]/g, ''));

        if (!dayVal || !banVal || !gheVal) continue;
        if (dayVal < 1 || dayVal > 4 || banVal < 1 || banVal > 6 || (gheVal !== 1 && gheVal !== 2)) continue;

        const codeVal = colCode !== -1 && r[colCode] ? String(r[colCode]).trim() : '';
        const nameVal = colName !== -1 && r[colName] ? String(r[colName]).trim() : '';

        if (!codeVal && !nameVal) continue;

        // Match student by code first, then by name
        let matchedStudent: Student | undefined;
        if (codeVal) {
          matchedStudent = allStudents.find(
            (s) => s.code.toLowerCase() === codeVal.toLowerCase() || s.id === codeVal
          );
        }
        if (!matchedStudent && nameVal) {
          matchedStudent = allStudents.find(
            (s) => s.name.toLowerCase().trim() === nameVal.toLowerCase()
          );
        }

        if (matchedStudent) {
          const seatKey = `${dayVal}-${banVal}-${gheVal}`;
          newAssignments[seatKey] = matchedStudent.id;
          count++;
        }
      }

      if (count === 0) {
        setImportSeatingError('Không tìm thấy học sinh khớp theo Mã học sinh hoặc Họ và tên trong danh sách lớp!');
        setIsParsingSeating(false);
        return;
      }

      setParsedAssignments(newAssignments);
      setParsedCount(count);
    } catch (err) {
      console.error("Lỗi đọc file Excel sơ đồ lớp:", err);
      setImportSeatingError('Lỗi đọc file Excel sơ đồ lớp. Vui lòng sử dụng file mẫu chuẩn!');
    } finally {
      setIsParsingSeating(false);
    }
  };

  const handleConfirmImportSeating = () => {
    if (!parsedAssignments) return;

    const updatedChart: SeatingChartData = {
      ...(seatingChart || {}),
      assignments: parsedAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    saveChartToLocalStorage(updatedChart);
    setIsImportSeatingModalOpen(false);
    setParsedAssignments(null);
    setImportSeatingFile(null);
    showToast(`Đã nhập thành công sơ đồ chỗ ngồi từ file Excel! Đã xếp ${parsedCount} học sinh vào vị trí.`);
  };

  // Student map for fast lookup (defined at top to prevent TDZ ReferenceError)
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    (students || []).forEach((s) => {
      if (s && s.id) map.set(s.id, s);
    });
    return map;
  }, [students]);

  // Find all assigned and unassigned students safely
  const assignedStudentIds = useMemo(() => {
    if (!seatingChart || !seatingChart.assignments) return new Set<string>();
    return new Set(
      Object.values(seatingChart.assignments).filter((id): id is string => id !== null && id !== undefined && id !== '')
    );
  }, [seatingChart?.assignments]);

  const unassignedStudents = useMemo(() => {
    return (students || []).filter((s) => s && s.id && !assignedStudentIds.has(s.id));
  }, [students, assignedStudentIds]);

  // Defensive helper function to load saved seating data from localStorage
  const loadSavedSeating = () => {
    try {
      const raw =
        localStorage.getItem('app_seating_chart_data') ||
        localStorage.getItem('seating_chart_data') ||
        localStorage.getItem('tnh_gvcn_seating_v1');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.assignments || parsed.seats)) {
        return parsed;
      }
      return null;
    } catch (err) {
      console.error("Lỗi parse dữ liệu sơ đồ:", err);
      return null;
    }
  };

  // Helper to persist seating chart directly to localStorage with key 'app_seating_chart_data' and notify parent
  const saveChartToLocalStorage = (chart: SeatingChartData) => {
    try {
      const payload = {
        ...(chart || {}),
        seats: chart?.assignments || {},
        unassignedStudents: (unassignedStudents || [])?.map((s) => s?.id),
        lastUpdated: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(payload);
      localStorage.setItem('app_seating_chart_data', jsonStr);
      localStorage.setItem('seating_chart_data', jsonStr);
      localStorage.setItem('tnh_gvcn_seating_v1', jsonStr);
    } catch (e) {
      console.warn('Failed to save app_seating_chart_data to localStorage:', e);
    }
    onSaveSeatingChart(chart);
  };

  // Mount effect: Read from localStorage key 'app_seating_chart_data' on component startup with defensive fallback
  useEffect(() => {
    const saved = loadSavedSeating();
    if (saved) {
      const assignments = saved.assignments || (typeof saved.seats === 'object' ? saved.seats : null);
      if (assignments && typeof assignments === 'object') {
        onSaveSeatingChart({
          ...(seatingChart || {}),
          ...saved,
          assignments,
        });
      }
    }
  }, []);

  // Auto-persist effect: Watch seatingChart & unassignedStudents changes and save persistently to localStorage
  useEffect(() => {
    if (seatingChart && seatingChart.assignments && Object.keys(seatingChart.assignments).length > 0) {
      try {
        const payload = {
          ...seatingChart,
          seats: seatingChart.assignments,
          unassignedStudents: (unassignedStudents || [])?.map((s) => s?.id),
          lastUpdated: new Date().toISOString(),
        };
        const jsonStr = JSON.stringify(payload);
        localStorage.setItem('app_seating_chart_data', jsonStr);
        localStorage.setItem('seating_chart_data', jsonStr);
        localStorage.setItem('tnh_gvcn_seating_v1', jsonStr);
      } catch (e) {
        console.warn('Auto-persist app_seating_chart_data error:', e);
      }
    }
  }, [seatingChart, unassignedStudents]);

  // Auto-arrange unassigned students only into remaining empty seats without changing existing seats
  const handleAutoArrangeUnassignedOnly = () => {
    if (unassignedStudents.length === 0) {
      showToast('Tất cả học sinh trong lớp đều đã có chỗ ngồi!');
      return;
    }

    const totalDesksPerAisle = 6;
    const totalAisles = 4;
    const newAssignments = { ...(seatingChart?.assignments || {}) };

    // Find all currently empty seats
    const emptySeatKeys: string[] = [];
    for (let col = 1; col <= totalAisles; col++) {
      for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
        for (let seat = 1; seat <= 2; seat++) {
          const key = `${col}-${desk}-${seat}`;
          if (!newAssignments[key]) {
            emptySeatKeys.push(key);
          }
        }
      }
    }

    if (emptySeatKeys.length === 0) {
      showToast('Sơ đồ lớp đã đầy (48/48 ghế), không còn ghế trống!');
      return;
    }

    let assignedCount = 0;
    const remainingStudents = [...unassignedStudents];
    const unplaced: Student[] = [];

    // Step 1: Try placing students into their designated Group aisle if an empty seat exists there
    const currentAisleGroups = seatingChart.aisleGroups || { 1: 1, 2: 2, 3: 3, 4: 4 };
    const getPreferredCol = (groupNum: number): number => {
      for (let col = 1; col <= 4; col++) {
        if ((currentAisleGroups[col] ?? col) === groupNum) return col;
      }
      return Math.min(4, Math.max(1, groupNum || 1));
    };

    for (const student of remainingStudents) {
      const preferredCol = getPreferredCol(student.group || 1);
      const matchIndex = emptySeatKeys.findIndex((k) => k.startsWith(`${preferredCol}-`));
      if (matchIndex >= 0) {
        const targetSeatKey = emptySeatKeys.splice(matchIndex, 1)[0];
        newAssignments[targetSeatKey] = student.id;
        assignedCount++;
      } else {
        unplaced.push(student);
      }
    }

    // Step 2: Place remaining unplaced students into any open empty seat
    for (const student of unplaced) {
      if (emptySeatKeys.length > 0) {
        const targetSeatKey = emptySeatKeys.shift()!;
        newAssignments[targetSeatKey] = student.id;
        assignedCount++;
      }
    }

    saveChartToLocalStorage({
      ...seatingChart,
      assignments: newAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    showToast(`Đã tự động xếp chỗ thành công cho ${assignedCount} học sinh chưa có chỗ ngồi!`);
  };

  const handleAssignSingleUnassignedStudent = (student: Student) => {
    const totalDesksPerAisle = 6;
    const totalAisles = 4;
    const newAssignments = { ...(seatingChart?.assignments || {}) };

    const currentAisleGroups = seatingChart.aisleGroups || { 1: 1, 2: 2, 3: 3, 4: 4 };
    let preferredCol = 1;
    for (let c = 1; c <= 4; c++) {
      if ((currentAisleGroups[c] ?? c) === student.group) {
        preferredCol = c;
        break;
      }
    }
    let targetSeatKey: string | null = null;

    // Try preferred column first
    for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
      for (let seat = 1; seat <= 2; seat++) {
        const key = `${preferredCol}-${desk}-${seat}`;
        if (!newAssignments[key]) {
          targetSeatKey = key;
          break;
        }
      }
      if (targetSeatKey) break;
    }

    // If preferred column is full, try any column
    if (!targetSeatKey) {
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            const key = `${col}-${desk}-${seat}`;
            if (!newAssignments[key]) {
              targetSeatKey = key;
              break;
            }
          }
          if (targetSeatKey) break;
        }
      }
    }

    if (!targetSeatKey) {
      showToast('Sơ đồ lớp đã đầy chỗ (48/48)!');
      return;
    }

    newAssignments[targetSeatKey] = student.id;
    saveChartToLocalStorage({
      ...seatingChart,
      assignments: newAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    showToast(`Đã xếp chỗ cho ${student.name} vào Dãy ${targetSeatKey.split('-')[0]} - Bàn ${targetSeatKey.split('-')[1]}!`);
  };

  // Kick / Remove a student from a seat out to the unassigned pool
  const handleUnassignStudent = (seatKey: string) => {
    const currentAssignments = { ...(seatingChart?.assignments || {}) };
    const studentId = currentAssignments[seatKey];
    if (!studentId) return;

    const student = studentMap.get(studentId);
    currentAssignments[seatKey] = null;
    delete currentAssignments[seatKey];

    saveChartToLocalStorage({
      ...seatingChart,
      assignments: currentAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    if (selectedSeatKey === seatKey) {
      setSelectedSeatKey(null);
    }

    showToast(`Đã đưa ${student ? student.name : 'học sinh'} ra khỏi chỗ ngồi (chuyển vào danh sách chưa xếp chỗ)!`);
  };

  // Assign a student (from unassigned list or modal) directly to a specified target seat
  const handleAssignUnassignedToSeat = (studentId: string, targetSeatKey: string) => {
    const newAssignments = { ...(seatingChart?.assignments || {}) };
    const student = studentMap.get(studentId);
    const parts = targetSeatKey.split('-');
    const seatName = `Dãy ${parts[0]} - Bàn ${parts[1]} - Ghế ${parts[2]}`;

    // Clear student from previous seat if assigned
    Object.keys(newAssignments).forEach((key) => {
      if (newAssignments[key] === studentId) {
        newAssignments[key] = null;
      }
    });

    const previousStudentId = newAssignments[targetSeatKey];
    const previousStudent = previousStudentId ? studentMap.get(previousStudentId) : null;

    newAssignments[targetSeatKey] = studentId;

    saveChartToLocalStorage({
      ...seatingChart,
      assignments: newAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    setSelectedUnassignedStudentId(null);
    setSelectedSeatKey(null);
    setShowAssignModal(null);

    if (previousStudent && previousStudent.id !== studentId) {
      showToast(`Đã xếp chỗ cho ${student?.name || 'học sinh'} vào ${seatName} (thay thế cho ${previousStudent.name})!`);
    } else {
      showToast(`Đã xếp chỗ thành công cho ${student?.name || 'học sinh'} vào ${seatName}!`);
    }
  };

  // Close auto arrange dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autoArrangeRef.current && !autoArrangeRef.current.contains(event.target as Node)) {
        setIsAutoArrangeOpen(false);
      }
    };
    if (isAutoArrangeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAutoArrangeOpen]);

  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Xác Nhận',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };



  // Helper to find which Dãy is assigned to a given Tổ
  const getAisleForGroup = (groupNum: number): string => {
    const currentAisleGroups = seatingChart.aisleGroups || { 1: 1, 2: 2, 3: 3, 4: 4 };
    const matchingCols: number[] = [];
    for (let c = 1; c <= 4; c++) {
      if ((currentAisleGroups[c] ?? c) === groupNum) {
        matchingCols.push(c);
      }
    }
    if (matchingCols.length > 0) {
      return matchingCols.map((c) => `Dãy ${c}`).join(', ');
    }
    return `Dãy ${groupNum}`;
  };

  // Check if student matches search
  const isStudentHighlighted = (studentId: string | null): boolean => {
    if (!searchQuery.trim() || !studentId) return false;
    const s = studentMap.get(studentId);
    if (!s) return false;
    const query = searchQuery.toLowerCase().trim();
    return (
      (s.name || '').toLowerCase().includes(query) ||
      (s.code || '').toLowerCase().includes(query) ||
      `tổ ${s.group || ''}`.includes(query) ||
      (s.strengths || '').toLowerCase().includes(query)
    );
  };

  // Handle seat click (Swap, unassigned placement, or select)
  const handleSeatClick = (seatKey: string) => {
    const currentAssignments = seatingChart?.assignments || {};
    if (role !== 'gvcn') {
      const studentId = currentAssignments[seatKey];
      if (studentId) {
        const student = studentMap.get(studentId);
        if (student) setViewingStudent(student);
      }
      return;
    }

    // If an unassigned student was selected from the list below, place them directly into this seat
    if (selectedUnassignedStudentId) {
      handleAssignUnassignedToSeat(selectedUnassignedStudentId, seatKey);
      return;
    }

    // For GVCN standard click:
    if (!selectedSeatKey) {
      // First click: select seat
      setSelectedSeatKey(seatKey);
      const studentId = currentAssignments[seatKey];
      const student = studentId ? studentMap.get(studentId) : null;
      if (student) {
        showToast(`Đã chọn: ${student.name}. Nhấp ghế khác để hoán đổi, hoặc bấm "Kích Ra Danh Sách Chờ".`);
      } else {
        showToast(`Đã chọn ghế trống. Nhấp học sinh chưa xếp chỗ hoặc bấm "Gán Học Sinh" để đặt vào.`);
      }
    } else if (selectedSeatKey === seatKey) {
      // Click again on same seat: deselect
      setSelectedSeatKey(null);
    } else {
      // Second click on a different seat: SWAP
      const sourceStudentId = currentAssignments[selectedSeatKey] || null;
      const targetStudentId = currentAssignments[seatKey] || null;

      const newAssignments = {
        ...currentAssignments,
        [selectedSeatKey]: targetStudentId,
        [seatKey]: sourceStudentId,
      };

      const sourceName = sourceStudentId ? studentMap.get(sourceStudentId)?.name || 'Ghế' : 'Ghế trống';
      const targetName = targetStudentId ? studentMap.get(targetStudentId)?.name || 'Ghế' : 'Ghế trống';

      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });

      setSelectedSeatKey(null);
      showToast(`Đã hoán đổi chỗ ngồi thành công: [${sourceName}] ⇄ [${targetName}]`);
    }
  };

  // Assign specific student to a seat
  const handleAssignStudent = (seatKey: string, studentId: string | null) => {
    const newAssignments = { ...(seatingChart?.assignments || {}) };

    // If student was previously in another seat, clear it
    if (studentId) {
      Object.keys(newAssignments).forEach((key) => {
        if (newAssignments[key] === studentId) {
          newAssignments[key] = null;
        }
      });
    }

    newAssignments[seatKey] = studentId;

    saveChartToLocalStorage({
      ...seatingChart,
      assignments: newAssignments,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    setShowAssignModal(null);
    showToast(studentId ? `Đã xếp chỗ cho học sinh ${studentMap.get(studentId)?.name}` : 'Đã dọn trống vị trí ngồi!');
  };

  // Smart Auto-Arrangement Algorithms
  const handleSmartArrange = (type: 'by_group' | 'by_vision' | 'by_academic_pairs' | 'by_gender' | 'shuffle') => {
    const totalDesksPerAisle = 6;
    const totalAisles = 4;
    const newAssignments: { [key: string]: string | null } = {};

    // Initialize empty seats
    for (let col = 1; col <= totalAisles; col++) {
      for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
        newAssignments[`${col}-${desk}-1`] = null;
        newAssignments[`${col}-${desk}-2`] = null;
      }
    }

    if (type === 'by_group') {
      // Map Dãy 1, 2, 3, 4 according to configured aisleGroups
      const currentAisleGroups = seatingChart.aisleGroups || { 1: 1, 2: 2, 3: 3, 4: 4 };
      [1, 2, 3, 4].forEach((columnNum) => {
        const targetGroup = currentAisleGroups[columnNum] ?? columnNum;
        const groupStudents = students.filter((s) => s.group === targetGroup);
        let seatIndex = 0;
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (seatIndex < groupStudents.length) {
              newAssignments[`${columnNum}-${desk}-${seat}`] = groupStudents[seatIndex].id;
              seatIndex++;
            }
          }
        }
      });
      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã sắp xếp sơ đồ chỗ ngồi theo 4 Tổ học tập chuẩn chỉnh!');
    } else if (type === 'by_vision') {
      // Vision / Health priority: students with glasses or health note sit in Desks 1-2
      const visionPriorityStudents = students.filter(
        (s) => s.healthNote.toLowerCase().includes('cận') || s.healthNote.toLowerCase().includes('mắt')
      );
      const otherStudents = students.filter(
        (s) => !s.healthNote.toLowerCase().includes('cận') && !s.healthNote.toLowerCase().includes('mắt')
      );

      const allSorted = [...visionPriorityStudents, ...otherStudents];
      let studentIdx = 0;

      for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
        for (let col = 1; col <= totalAisles; col++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < allSorted.length) {
              newAssignments[`${col}-${desk}-${seat}`] = allSorted[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp học sinh cận thị & cần hỗ trợ thị lực lên các bàn 1 - 2 phía trên!');
    } else if (type === 'by_academic_pairs') {
      // Đôi bạn cùng tiến: 1 student GPA >= 8.5 pairs with 1 student GPA < 8.5
      const sortedByGPA = [...students].sort((a, b) => b.grades.gpa - a.grades.gpa);
      const highGPA = sortedByGPA.slice(0, Math.floor(sortedByGPA.length / 2));
      const moderateGPA = sortedByGPA.slice(Math.floor(sortedByGPA.length / 2));

      const pairedStudents: Student[] = [];
      const maxLength = Math.max(highGPA.length, moderateGPA.length);
      for (let i = 0; i < maxLength; i++) {
        if (highGPA[i]) pairedStudents.push(highGPA[i]);
        if (moderateGPA[i]) pairedStudents.push(moderateGPA[i]);
      }

      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < pairedStudents.length) {
              newAssignments[`${col}-${desk}-${seat}`] = pairedStudents[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp chỗ theo mô hình "Đôi bạn cùng tiến" (kèm cặp nâng cao kết quả học tập)!');
    } else if (type === 'by_gender') {
      // Alternating Male - Female
      const males = students.filter((s) => s.gender === 'Nam');
      const females = students.filter((s) => s.gender === 'Nữ');
      const mixed: Student[] = [];
      const maxLen = Math.max(males.length, females.length);
      for (let i = 0; i < maxLen; i++) {
        if (males[i]) mixed.push(males[i]);
        if (females[i]) mixed.push(females[i]);
      }

      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < mixed.length) {
              newAssignments[`${col}-${desk}-${seat}`] = mixed[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xếp chỗ xen kẽ Nam - Nữ giúp xây dựng nề nếp kỷ cương!');
    } else if (type === 'shuffle') {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      let studentIdx = 0;
      for (let col = 1; col <= totalAisles; col++) {
        for (let desk = 1; desk <= totalDesksPerAisle; desk++) {
          for (let seat = 1; seat <= 2; seat++) {
            if (studentIdx < shuffled.length) {
              newAssignments[`${col}-${desk}-${seat}`] = shuffled[studentIdx].id;
              studentIdx++;
            }
          }
        }
      }
      saveChartToLocalStorage({
        ...seatingChart,
        assignments: newAssignments,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      showToast('Đã xáo trộn ngẫu nhiên toàn bộ vị trí chỗ ngồi trong lớp!');
    }
  };


  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#003366] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-amber-400/40 text-sm font-medium animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Sơ Đồ Bố Trí Chỗ Ngồi {classInfo?.className || ''}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    4 Dãy × 6 Bàn (48 Chỗ)
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Quy chuẩn 4 dãy đặt nằm ngang trên một hàng, mỗi dãy 6 bàn, mỗi bàn 2 học sinh.</span>
                  <span>•</span>
                  <span>Cập nhật ngày: <strong className="font-semibold text-slate-700">{seatingChart.updatedAt}</strong></span>
                  {(role === 'gvcn' || role === 'bgh') && (
                    <button
                      type="button"
                      onClick={() => setIsEditSeatingModalOpen(true)}
                      className="ml-1.5 px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Nhấp để điều chỉnh thông tin sơ đồ lớp"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>Điều chỉnh</span>
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(role === 'gvcn' || role === 'bgh') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    saveChartToLocalStorage(seatingChart);
                    showToast('Đã lưu sơ đồ chỗ ngồi thành công vào bộ nhớ!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-500"
                  title="Lưu vị trí bàn ghế hiện tại vào localStorage"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Lưu Sơ Đồ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditSeatingModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-amber-400"
                  title="Điều chỉnh thông tin tiêu đề, ngày áp dụng & xếp chỗ thủ công"
                >
                  <Edit3 className="w-4 h-4 text-slate-950" />
                  <span>Điều Chỉnh Dữ Liệu</span>
                </button>
              </>
            )}
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh / vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Display Mode Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setDisplayMode('avatar_name')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'avatar_name'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị ảnh và tên"
              >
                Ảnh & Tên
              </button>
              <button
                onClick={() => setDisplayMode('grades_gpa')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'grades_gpa'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị điểm GPA và khối A"
              >
                Điểm Khối A
              </button>
              <button
                onClick={() => setDisplayMode('health_vision')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  displayMode === 'health_vision'
                    ? 'bg-white text-[#003366] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị thị lực & sức khỏe"
              >
                Thị Lực 👓
              </button>
              <button
                onClick={() => setDisplayMode('connect_pair')}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                  displayMode === 'connect_pair'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-bold'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
                title="Hiển thị kết nối đôi bạn cùng tiến & liên lạc phụ huynh"
              >
                <span>🔗 Kết Nối Học Tập</span>
              </button>
            </div>

            {/* Direct Connect Channel Button */}
            {onNavigateToConnect && (
              <button
                onClick={onNavigateToConnect}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#003366] hover:from-blue-700 hover:to-[#002244] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Mở Kênh Kết Nối Giáo Viên - Phụ Huynh - Học Sinh"
              >
                <HeartHandshake className="w-4 h-4 text-[#98FF98]" />
                <span>Kênh Kết Nối PH & HS</span>
              </button>
            )}

            {(role === 'gvcn' || role === 'bgh') && (
              <>
                <button
                  type="button"
                  onClick={downloadSeatingTemplate}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  title="Tải file Excel mẫu sơ đồ lớp 4 dãy (Dãy, Bàn, Ghế, Họ tên)"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Tải File Mẫu Sơ Đồ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportSeatingFile(null);
                    setImportSeatingError(null);
                    setParsedAssignments(null);
                    setIsImportSeatingModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  title="Tải sơ đồ chỗ ngồi từ file Excel (.xlsx, .xls) hoặc .csv từ máy tính"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-300" />
                  <span>Nhập Sơ Đồ Từ File</span>
                </button>
              </>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrintSeatingChart}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="In sơ đồ lớp A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Sơ Đồ</span>
            </button>

            {/* Smart Arrange Dropdown (GVCN only) */}
            {role === 'gvcn' && (
              <div className="relative" ref={autoArrangeRef}>
                <button
                  type="button"
                  onClick={() => setIsAutoArrangeOpen((prev) => !prev)}
                  className={`px-3.5 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    isAutoArrangeOpen
                      ? 'bg-[#002244] ring-2 ring-amber-400'
                      : 'bg-[#003366] hover:bg-[#002244]'
                  }`}
                  aria-expanded={isAutoArrangeOpen}
                  title="Mở menu xếp chỗ tự động bằng AI"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Xếp Chỗ Tự Động</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
                      isAutoArrangeOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAutoArrangeOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                      <span>Thuật Toán Xếp Chỗ AI</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">6 Tùy chọn</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAutoArrangeUnassignedOnly();
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer border-b border-slate-100 bg-amber-50/40"
                    >
                      <UserPlus className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-amber-950">Tự xếp chỗ cho HS chưa có ghế</div>
                        <div className="text-[10px] text-amber-700">Điền nốt các bạn chưa có chỗ vào ghế trống</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_group');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#003366] flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Xếp theo 4 Tổ (Dãy 1-4)</div>
                        <div className="text-[10px] text-slate-500">Quy hoạch 1 Tổ / 1 Dãy</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_vision');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Glasses className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Ưu tiên Cận thị (Bàn 1-2)</div>
                        <div className="text-[10px] text-slate-500">Đưa học sinh đeo kính lên trên</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_academic_pairs');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Đôi bạn cùng tiến (Giỏi + Khá)</div>
                        <div className="text-[10px] text-slate-500">Ghép cặp tương trợ học tập</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('by_gender');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Xen kẽ Nam - Nữ</div>
                        <div className="text-[10px] text-slate-500">Cân bằng nề nếp kỷ cương</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSmartArrange('shuffle');
                        setIsAutoArrangeOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 font-medium transition-colors border-t border-slate-100 cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-rose-800">Xáo trộn ngẫu nhiên</div>
                        <div className="text-[10px] text-rose-500">Đổi mới không gian lớp học</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reset Button (GVCN) */}
            {role === 'gvcn' && (
              <button
                onClick={() => {
                  setConfirmAction({
                    isOpen: true,
                    title: 'Khôi Phục Sơ Đồ Chỗ Ngồi Mặc Định',
                    message: `Bạn có chắc chắn muốn khôi phục lại sơ đồ vị trí chỗ ngồi ban đầu của lớp ${classInfo?.className || ''}?`,
                    confirmText: 'Tải Lại Sơ Đồ',
                    onConfirm: () => {
                      try {
                        localStorage.removeItem('app_seating_chart_data');
                        localStorage.removeItem('seating_chart_data');
                        localStorage.removeItem('tnh_gvcn_seating_v1');
                      } catch (e) {
                        console.warn('Error clearing seating chart from localStorage:', e);
                      }
                      onResetSeatingChart();
                      setSelectedSeatKey(null);
                      showToast('Đã khôi phục lại sơ đồ chỗ ngồi mặc định của lớp!');
                    },
                  });
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                title="Khôi phục sơ đồ gốc"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Bar / Legend */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-800">Chú thích sơ đồ:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Tổ 1 ({getAisleForGroup(1)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Tổ 2 ({getAisleForGroup(2)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Tổ 3 ({getAisleForGroup(3)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Tổ 4 ({getAisleForGroup(4)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-dashed border-slate-400 bg-slate-100"></span>
              <span>Ghế trống ({48 - assignedStudentIds.size})</span>
            </div>
          </div>

          {role === 'gvcn' && (
            <div className="text-[11px] bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Mẹo: Nhấp vào 1 ghế rồi nhấp ghế khác để hoán đổi chỗ ngồi ngay lập tức.</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE SELECTION BANNERS FOR GVCN */}
      {selectedUnassignedStudentId && role === 'gvcn' && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#003366] text-white rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-slideDown border-2 border-amber-300">
          <div className="flex items-center gap-3 text-xs md:text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-sm animate-bounce">
              📍
            </div>
            <div>
              <div className="text-amber-300 font-extrabold text-sm md:text-base">
                Đang chọn: {studentMap.get(selectedUnassignedStudentId)?.name} (Chưa xếp chỗ)
              </div>
              <div className="text-blue-100 text-xs font-normal">
                Nhấp vào bất kỳ ghế nào trên sơ đồ bên dưới để xếp học sinh này vào ghế đó!
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedUnassignedStudentId(null)}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 cursor-pointer transition-all"
          >
            ✕ Hủy chọn
          </button>
        </div>
      )}

      {selectedSeatKey && role === 'gvcn' && !selectedUnassignedStudentId && (
        <div className="bg-amber-500 text-slate-950 rounded-2xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-slideDown border-2 border-amber-400">
          <div className="flex items-center gap-2.5 text-xs md:text-sm font-bold">
            <span className="w-3 h-3 rounded-full bg-slate-950 animate-ping shrink-0" />
            <span>
              Đang chọn vị trí: Dãy {selectedSeatKey.split('-')[0]} - Bàn {selectedSeatKey.split('-')[1]} - Ghế {selectedSeatKey.split('-')[2]}
              {seatingChart?.assignments?.[selectedSeatKey]
                ? ` (${studentMap.get(seatingChart.assignments[selectedSeatKey])?.name || 'Đã có học sinh'})`
                : ' (Ghế trống)'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {seatingChart?.assignments?.[selectedSeatKey] && (
              <button
                type="button"
                onClick={() => handleUnassignStudent(selectedSeatKey)}
                className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Bỏ xếp chỗ cho em này, đưa em ra danh sách chưa xếp chỗ"
              >
                <UserMinus className="w-3.5 h-3.5 text-rose-200" />
                <span>Kích Ra Danh Sách Chờ</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAssignModal(selectedSeatKey)}
              className="px-3 py-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Mở danh sách chọn học sinh chưa có chỗ để xếp vào ghế này"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
              <span>Gán Học Sinh Vào Ghế Này</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSeatKey(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 font-bold text-xs cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* CLASSROOM ARENA / SEATING MATRIX */}
      <div className="bg-slate-900/5 rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 shadow-inner">
        {/* FRONT OF THE CLASSROOM (TEACHER'S PODIUM & BLACKBOARD) */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Top Windows & Doors Indicators */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-2">
            <div className="flex items-center gap-1.5 bg-slate-200/80 text-slate-600 px-3 py-1 rounded-md">
              <span>🚪 Cửa chính ra vào (Trước)</span>
            </div>
            <div className="bg-blue-100/60 text-blue-800 px-3 py-1 rounded-md">
              <span>🪟 Cửa sổ thông thoáng dãy hành lang A</span>
            </div>
          </div>

          {/* Teacher's Blackboard */}
          <div className="bg-[#1b382b] text-white rounded-2xl p-4 text-center border-4 border-[#8B5A2B] shadow-lg relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[10px] text-emerald-300 font-mono tracking-widest uppercase">
              BẢNG TỪ CHỐNG LÓA
            </div>
            <div className="absolute top-2 right-4 text-[10px] text-amber-200 font-mono">
              THỨ SÁU, 28/08/2026
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-amber-300 uppercase">
              {classInfo?.className ? `LỚP ${classInfo.className}` : 'SƠ ĐỒ LỚP HỌC'}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 italic">
              "Kỷ luật - Trí tuệ - Bứt phá kỳ thi Tốt nghiệp THPT 2026"
            </p>
          </div>

          {/* Teacher's Podium & Desk */}
          <div className="flex items-center justify-center">
            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-6 py-3 shadow-md flex items-center gap-4 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                GV
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  BỤC GIẢNG & BÀN GIÁO VIÊN
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {teacherInfo?.name || 'Thầy Nguyễn Văn An (GVCN)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Phấn, Giáo án, Laptop & Micro truyền giảng
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 AISLES HORIZONTALLY SIDE-BY-SIDE (4 Dãy cùng nằm trên 1 hàng ngang) */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-4 gap-4 md:gap-6 lg:gap-8 min-w-[920px] max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((columnNum) => {
              const assignedGroup = seatingChart.aisleGroups?.[columnNum] ?? columnNum;

              const groupColor =
                assignedGroup === 1
                  ? 'border-blue-300 bg-blue-50/40 text-blue-800'
                  : assignedGroup === 2
                  ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                  : assignedGroup === 3
                  ? 'border-amber-300 bg-amber-50/40 text-amber-800'
                  : 'border-purple-300 bg-purple-50/40 text-purple-800';

              const headerBg =
                assignedGroup === 1
                  ? 'bg-blue-600 text-white'
                  : assignedGroup === 2
                  ? 'bg-emerald-600 text-white'
                  : assignedGroup === 3
                  ? 'bg-amber-600 text-white'
                  : 'bg-purple-600 text-white';

              return (
                <div key={columnNum} className="space-y-4 flex flex-col">
                  {/* Aisle / Column Header */}
                  <div
                    className={`rounded-xl p-3 text-center shadow-xs border ${groupColor} flex flex-col items-center justify-center relative group/aisle`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${headerBg} flex items-center gap-1 shadow-2xs`}>
                        <span>DÃY {columnNum}</span>
                        <span>(</span>
                        {role === 'gvcn' || role === 'bgh' ? (
                          <select
                            value={assignedGroup}
                            onChange={(e) => {
                              const newGrp = Number(e.target.value);
                              const newAisleGroups = {
                                ...(seatingChart.aisleGroups || { 1: 1, 2: 2, 3: 3, 4: 4 }),
                                [columnNum]: newGrp,
                              };
                              saveChartToLocalStorage({
                                ...seatingChart,
                                aisleGroups: newAisleGroups,
                                updatedAt: new Date().toISOString().split('T')[0],
                              });
                              showToast(`Đã điều chỉnh Dãy ${columnNum} gán cho Tổ ${newGrp}!`);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white font-black text-xs border border-white/40 rounded px-1 py-0.2 focus:outline-none cursor-pointer"
                            title="Nhấp để đổi Tổ gán cho Dãy này"
                          >
                            <option value={1} className="bg-slate-900 text-white font-bold">TỔ 1</option>
                            <option value={2} className="bg-slate-900 text-white font-bold">TỔ 2</option>
                            <option value={3} className="bg-slate-900 text-white font-bold">TỔ 3</option>
                            <option value={4} className="bg-slate-900 text-white font-bold">TỔ 4</option>
                          </select>
                        ) : (
                          <span>TỔ {assignedGroup}</span>
                        )}
                        <span>)</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 mt-1">
                      6 Bàn • 12 Chỗ ngồi
                    </span>
                  </div>

                  {/* 6 Desks in this column (Bàn 1 -> Bàn 6) */}
                  <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5, 6].map((deskNum) => {
                      const seat1Key = `${columnNum}-${deskNum}-1`;
                      const seat2Key = `${columnNum}-${deskNum}-2`;
                      const student1Id = seatingChart?.assignments?.[seat1Key] || null;
                      const student2Id = seatingChart?.assignments?.[seat2Key] || null;
                      const student1 = student1Id ? studentMap.get(student1Id) : null;
                      const student2 = student2Id ? studentMap.get(student2Id) : null;

                      const isSeat1Selected = selectedSeatKey === seat1Key;
                      const isSeat2Selected = selectedSeatKey === seat2Key;
                      const isSeat1Match = isStudentHighlighted(student1Id);
                      const isSeat2Match = isStudentHighlighted(student2Id);

                      const isCurrentStudent1 = currentStudentId && student1?.id === currentStudentId;
                      const isCurrentStudent2 = currentStudentId && student2?.id === currentStudentId;

                      return (
                        <div
                          key={deskNum}
                          className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200 hover:border-slate-300 transition-all"
                        >
                          {/* Desk Label */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-1.5 px-1">
                            <span>BÀN {deskNum}</span>
                            {deskNum <= 2 && (
                              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
                                Gần bảng
                              </span>
                            )}
                            {deskNum >= 5 && (
                              <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                                Cuối lớp
                              </span>
                            )}
                          </div>

                          {/* 2 Seats (Seat 1 - Left & Seat 2 - Right) */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Seat 1 (Trái) */}
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat1Key)}
                              className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] cursor-pointer group/seat ${
                                isSeat1Selected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/80 shadow-md scale-[1.02]'
                                  : isSeat1Match
                                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50'
                                  : isCurrentStudent1
                                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90'
                                  : student1
                                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-300'
                                  : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-400'
                              }`}
                              title={
                                student1
                                  ? `${student1.name} (Tổ ${student1.group}) - Nhấp để chọn/đổi chỗ`
                                  : 'Ghế trống - Nhấp để xếp chỗ'
                              }
                            >
                              {/* Quick Kick Button for GVCN (Ẩn mặc định, chỉ hiện khi được chọn/kích vào hoặc di chuột) */}
                              {role === 'gvcn' && student1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnassignStudent(seat1Key);
                                  }}
                                  className={`absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] shadow-md z-10 cursor-pointer transition-all duration-200 ${
                                    isSeat1Selected
                                      ? 'opacity-100 scale-110 ring-2 ring-white animate-pulse'
                                      : 'opacity-0 group-hover/seat:opacity-100 hover:scale-110'
                                  }`}
                                  title={`Kích ${student1.name} ra khỏi chỗ (chuyển vào danh sách chưa xếp chỗ)`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Target placement overlay when selecting an unassigned student */}
                              {selectedUnassignedStudentId && role === 'gvcn' && (
                                <div className="absolute inset-0 bg-emerald-500/15 border-2 border-dashed border-emerald-500 rounded-xl flex flex-col items-center justify-center z-20 backdrop-blur-[1px] animate-pulse p-1 text-center">
                                  <MapPin className="w-4 h-4 text-emerald-700" />
                                  <span className="text-[9px] font-black text-emerald-950 bg-emerald-100 px-1 py-0.2 rounded mt-0.5">Đặt vào đây</span>
                                </div>
                              )}

                              {student1 ? (
                                <div className="space-y-1.5 w-full">
                                  {/* Student Header */}
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={student1.avatar}
                                      alt={student1.name}
                                      className="w-6 h-6 rounded-full object-cover border border-white shadow-xs shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                        {student1.name.split(' ').slice(-2).join(' ')}
                                      </div>
                                      <div className="text-[9px] text-slate-400 truncate">
                                        {student1.code.replace('TNH-12A1-', '#')}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mode details */}
                                  {displayMode === 'avatar_name' && (
                                    <div className="text-[10px] text-slate-600 truncate font-medium flex items-center justify-between">
                                      <span className="text-slate-500">{student1.name}</span>
                                      {student1.gender === 'Nữ' && (
                                        <span className="text-[9px] text-rose-500 font-bold">♀</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'grades_gpa' && (
                                    <div className="flex items-center justify-between text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                      <span className="text-emerald-700">GPA {student1.grades.gpa}</span>
                                      <span className="text-blue-700">T {student1.grades.math.avg}</span>
                                    </div>
                                  )}

                                  {displayMode === 'health_vision' && (
                                    <div className="text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                      {student1.healthNote.toLowerCase().includes('cận') ? (
                                        <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                                          👓 {student1.healthNote.split(',')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700">✓ Tốt</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'connect_pair' && (
                                    <div className="text-[9px] text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200/60 truncate font-semibold">
                                      🤝 Mạnh: {student1.strengths ? student1.strengths.split(',')[0] : 'Toán'}
                                    </div>
                                  )}

                                  {/* Current User Badge */}
                                  {isCurrentStudent1 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-2">
                                  <span className="text-[11px] text-slate-400 font-medium">Ghế 1</span>
                                  <span className="text-[9px] text-slate-400">(Trống)</span>
                                </div>
                              )}
                            </button>

                            {/* Seat 2 (Phải) */}
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat2Key)}
                              className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] cursor-pointer group/seat ${
                                isSeat2Selected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/80 shadow-md scale-[1.02]'
                                  : isSeat2Match
                                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50'
                                  : isCurrentStudent2
                                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90'
                                  : student2
                                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-300'
                                  : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-400'
                              }`}
                              title={
                                student2
                                  ? `${student2.name} (Tổ ${student2.group}) - Nhấp để chọn/đổi chỗ`
                                  : 'Ghế trống - Nhấp để xếp chỗ'
                              }
                            >
                              {/* Quick Kick Button for GVCN (Ẩn mặc định, chỉ hiện khi được chọn/kích vào hoặc di chuột) */}
                              {role === 'gvcn' && student2 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnassignStudent(seat2Key);
                                  }}
                                  className={`absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] shadow-md z-10 cursor-pointer transition-all duration-200 ${
                                    isSeat2Selected
                                      ? 'opacity-100 scale-110 ring-2 ring-white animate-pulse'
                                      : 'opacity-0 group-hover/seat:opacity-100 hover:scale-110'
                                  }`}
                                  title={`Kích ${student2.name} ra khỏi chỗ (chuyển vào danh sách chưa xếp chỗ)`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Target placement overlay when selecting an unassigned student */}
                              {selectedUnassignedStudentId && role === 'gvcn' && (
                                <div className="absolute inset-0 bg-emerald-500/15 border-2 border-dashed border-emerald-500 rounded-xl flex flex-col items-center justify-center z-20 backdrop-blur-[1px] animate-pulse p-1 text-center">
                                  <MapPin className="w-4 h-4 text-emerald-700" />
                                  <span className="text-[9px] font-black text-emerald-950 bg-emerald-100 px-1 py-0.2 rounded mt-0.5">Đặt vào đây</span>
                                </div>
                              )}
                              {student2 ? (
                                <div className="space-y-1.5 w-full">
                                  {/* Student Header */}
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={student2.avatar}
                                      alt={student2.name}
                                      className="w-6 h-6 rounded-full object-cover border border-white shadow-xs shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                        {student2.name.split(' ').slice(-2).join(' ')}
                                      </div>
                                      <div className="text-[9px] text-slate-400 truncate">
                                        {student2.code.replace('TNH-12A1-', '#')}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mode details */}
                                  {displayMode === 'avatar_name' && (
                                    <div className="text-[10px] text-slate-600 truncate font-medium flex items-center justify-between">
                                      <span className="text-slate-500">{student2.name}</span>
                                      {student2.gender === 'Nữ' && (
                                        <span className="text-[9px] text-rose-500 font-bold">♀</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'grades_gpa' && (
                                    <div className="flex items-center justify-between text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                      <span className="text-emerald-700">GPA {student2.grades.gpa}</span>
                                      <span className="text-blue-700">T {student2.grades.math.avg}</span>
                                    </div>
                                  )}

                                  {displayMode === 'health_vision' && (
                                    <div className="text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                      {student2.healthNote.toLowerCase().includes('cận') ? (
                                        <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                                          👓 {student2.healthNote.split(',')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700">✓ Tốt</span>
                                      )}
                                    </div>
                                  )}

                                  {displayMode === 'connect_pair' && (
                                    <div className="text-[9px] text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200/60 truncate font-semibold">
                                      🤝 Mạnh: {student2.strengths ? student2.strengths.split(',')[0] : 'Lý & Hóa'}
                                    </div>
                                  )}

                                  {/* Current User Badge */}
                                  {isCurrentStudent2 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-2">
                                  <span className="text-[11px] text-slate-400 font-medium">Ghế 2</span>
                                  <span className="text-[9px] text-slate-400">(Trống)</span>
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BACK OF THE CLASSROOM (DOOR 2 & NOTICE BOARD) */}
        <div className="max-w-4xl mx-auto mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="bg-slate-200/70 text-slate-600 px-3 py-1 rounded-md font-semibold">
            🚪 Cửa phụ thoát hiểm (Cuối lớp)
          </div>
          <div className="bg-amber-100/70 text-amber-900 px-3 py-1 rounded-md font-semibold">
            📚 Tủ sách học liệu & Bảng tin thi đua Chi đoàn {classInfo?.className || ''}
          </div>
        </div>
      </div>

      {/* UNASSIGNED STUDENTS LIST (If any) */}
      {(unassignedStudents || [])?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/40 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Học sinh chưa xếp chỗ ngồi ({(unassignedStudents || [])?.length} em):</span>
              </h3>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Mẹo: Bấm <strong>"📍 Chọn đặt ghế"</strong> rồi nhấp vào vị trí ghế bất kỳ trên sơ đồ để xếp chỗ cho em đó.
              </p>
            </div>
            {role === 'gvcn' && (
              <button
                type="button"
                onClick={handleAutoArrangeUnassignedOnly}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-400 shrink-0"
                title="Tự động lấp đầy các ghế trống bằng danh sách các học sinh chưa có chỗ ngồi"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Tự Xếp Chỗ Cho {(unassignedStudents || [])?.length} Em Chưa Có Ghế</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(unassignedStudents || [])?.map((s) => {
              const isSelected = selectedUnassignedStudentId === s.id;

              return (
                <div
                  key={s.id}
                  className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md text-blue-950 scale-105'
                      : 'bg-white border-amber-200 text-slate-800 shadow-2xs hover:border-amber-400'
                  }`}
                >
                  <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover border border-white" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 leading-tight">{s.name}</span>
                    <span className="text-[9px] text-slate-500 font-normal">Tổ {s.group}</span>
                  </div>

                  {role === 'gvcn' && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUnassignedStudentId(null);
                          } else if (selectedSeatKey) {
                            handleAssignUnassignedToSeat(s.id, selectedSeatKey);
                          } else {
                            setSelectedUnassignedStudentId(s.id);
                            showToast(`Đã chọn học sinh: ${s.name}. Hãy nhấp vào ghế muốn đặt trên sơ đồ!`);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] border transition-colors flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                        title={isSelected ? 'Hủy chọn đặt ghế' : `Chọn đặt chỗ theo ý cho ${s.name}`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{isSelected ? 'Đang chọn' : 'Đặt ghế'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAssignSingleUnassignedStudent(s)}
                        className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] border border-amber-300 transition-colors cursor-pointer"
                        title={`Tự động chọn ghế trống phù hợp nhất cho ${s.name}`}
                      >
                        + Tự xếp
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={viewingStudent.avatar}
                  alt={viewingStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#003366] shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewingStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingStudent.code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      Tổ {viewingStudent.group}
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      GPA {viewingStudent.grades.gpa}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#003366]" />
                  <span>Điểm Khối A (Toán - Lý - Hóa):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Toán</div>
                    <div className="font-bold text-blue-700 text-sm">{viewingStudent.grades.math.avg}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Vật Lý</div>
                    <div className="font-bold text-purple-700 text-sm">{viewingStudent.grades.physics.avg}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500">Hóa Học</div>
                    <div className="font-bold text-amber-700 text-sm">{viewingStudent.grades.chemistry.avg}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Glasses className="w-4 h-4 text-amber-600" />
                  <span>Thị lực & Lưu ý sức khỏe:</span>
                </div>
                <p className="text-slate-600">{viewingStudent.healthNote || 'Bình thường'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Sở trường & Năng khiếu:</span>
                </div>
                <p className="text-slate-600">{viewingStudent.strengths || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                {role === 'gvcn' && seatingChart?.assignments && Object.keys(seatingChart.assignments).find((k) => seatingChart.assignments[k] === viewingStudent.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentKey = Object.keys(seatingChart.assignments).find((k) => seatingChart.assignments[k] === viewingStudent.id);
                      if (currentKey) {
                        handleUnassignStudent(currentKey);
                        setViewingStudent(null);
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Bỏ chỗ ngồi của học sinh này, chuyển ra danh sách chưa xếp"
                  >
                    <UserMinus className="w-4 h-4 text-rose-600" />
                    <span>Kích Ra Danh Sách Chờ</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                {onSelectStudent && (
                  <button
                    onClick={() => {
                      const student = viewingStudent;
                      setViewingStudent(null);
                      onSelectStudent(student);
                    }}
                    className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem Toàn Bộ Hồ Sơ Học Bạ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASSIGN STUDENT DIRECTLY TO A SEAT */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#003366]" />
                  <span>Xếp Học Sinh Vào Dãy {showAssignModal.split('-')[0]} - Bàn {showAssignModal.split('-')[1]} - Ghế {showAssignModal.split('-')[2]}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {seatingChart?.assignments?.[showAssignModal]
                    ? `Hiện tại: ${studentMap.get(seatingChart.assignments[showAssignModal])?.name}`
                    : 'Hiện tại: Ghế trống'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setAssignModalSearch('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, mã HS, Tổ..."
                value={assignModalSearch}
                onChange={(e) => setAssignModalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {/* Option to clear seat */}
              {seatingChart?.assignments?.[showAssignModal] && (
                <button
                  type="button"
                  onClick={() => {
                    handleUnassignStudent(showAssignModal);
                    setShowAssignModal(null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserMinus className="w-4 h-4 text-rose-600" />
                    <span>Kích học sinh hiện tại ra ngoài danh sách chờ</span>
                  </span>
                  <span className="text-[10px] bg-rose-200 px-2 py-0.5 rounded font-extrabold">Bỏ xếp chỗ</span>
                </button>
              )}

              {/* Unassigned Students Section */}
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider pt-1 flex items-center justify-between">
                <span>Học sinh chưa xếp chỗ ({unassignedStudents.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Ưu tiên xếp</span>
              </div>

              {unassignedStudents
                .filter(
                  (s) =>
                    !assignModalSearch.trim() ||
                    s.name.toLowerCase().includes(assignModalSearch.toLowerCase()) ||
                    s.code.toLowerCase().includes(assignModalSearch.toLowerCase()) ||
                    `tổ ${s.group}`.includes(assignModalSearch.toLowerCase())
                )
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAssignUnassignedToSeat(s.id, showAssignModal)}
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-slate-800 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover border border-white" />
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.code} • Tổ {s.group}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#003366] text-white font-bold text-[10px] shadow-xs">
                      Đặt vào ghế này
                    </span>
                  </button>
                ))}

              {/* Other Assigned Students (Option to transfer) */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-100">
                Chuyển học sinh đang ngồi ghế khác sang ghế này
              </div>
              {(students || [])
                .filter((s) => assignedStudentIds.has(s.id) && s.id !== seatingChart?.assignments?.[showAssignModal])
                .filter(
                  (s) =>
                    !assignModalSearch.trim() ||
                    s.name.toLowerCase().includes(assignModalSearch.toLowerCase()) ||
                    s.code.toLowerCase().includes(assignModalSearch.toLowerCase())
                )
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAssignUnassignedToSeat(s.id, showAssignModal)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div className="text-left">
                        <div className="font-semibold text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.code} • Tổ {s.group}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[10px]">
                      Chuyển vị trí
                    </span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(null);
                  setAssignModalSearch('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
      />

      {/* MODAL IMPORT SEATING CHART FROM EXCEL / CSV */}
      {isImportSeatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-[#003366] via-indigo-900 to-[#001A33] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-300" />
                  Nhập Sơ Đồ Chỗ Ngồi Từ File Excel
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Tự động gán học sinh vào Dãy (1-4), Bàn (1-6), Ghế (1-2)
                </p>
              </div>
              <button
                onClick={() => setIsImportSeatingModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl bg-slate-50 text-center space-y-3 transition-colors">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-[#003366]" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      {importSeatingFile ? importSeatingFile.name : 'Kéo thả file Excel Sơ đồ lớp vào đây hoặc bấm chọn tệp'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Cấu trúc chuẩn: Dãy (1-4), Bàn (1-6), Ghế (1-2), Mã học sinh / Họ và tên
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs cursor-pointer shadow-md">
                    <UploadCloud className="w-4 h-4 text-cyan-300" />
                    <span>Chọn File Excel Từ Máy</span>
                    <input
                      type="file"
                      ref={seatingFileInputRef}
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileSelectSeating}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Chưa có file sơ đồ lớp mẫu?</span>
                  <button
                    type="button"
                    onClick={downloadSeatingTemplate}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải File Mẫu Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {isParsingSeating && (
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích dữ liệu sơ đồ lớp từ file Excel...</span>
                </div>
              )}

              {importSeatingError && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importSeatingError}</span>
                </div>
              )}

              {parsedAssignments && parsedCount > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs space-y-1 border border-emerald-200">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã phân tích thành công file Excel Sơ đồ lớp!</span>
                  </div>
                  <p className="text-[11px] text-emerald-600">
                    Đã đối chiếu và tìm thấy <strong className="font-bold text-emerald-900">{parsedCount}</strong> học sinh trùng khớp theo danh sách lớp để gán vào bàn ghế.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportSeatingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={!parsedAssignments || parsedCount === 0}
                onClick={handleConfirmImportSeating}
                className="px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Áp Dụng Sơ Đồ Lớp Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SEATING CHART METADATA & ASSIGNMENTS MODAL */}
      {isEditSeatingModalOpen && (
        <EditSeatingModal
          isOpen={isEditSeatingModalOpen}
          onClose={() => setIsEditSeatingModalOpen(false)}
          seatingChart={seatingChart}
          students={students}
          onSave={(newChart) => {
            saveChartToLocalStorage(newChart);
            showToast('Đã lưu điều chỉnh dữ liệu sơ đồ lớp thành công!');
          }}
        />
      )}
    </div>
  );
};
