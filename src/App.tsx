import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { StudentsView } from './components/StudentsView';
import { AcademicView } from './components/AcademicView';
import { DisciplineView } from './components/DisciplineView';
import { TaskDutyView } from './components/TaskDutyView';
import { RandomPickerView } from './components/RandomPickerView';
import { GroupEmulationView } from './components/GroupEmulationView';
import { LeaveRequestsView } from './components/LeaveRequestsView';
import { MaterialsView } from './components/MaterialsView';
import { SeatingChartView } from './components/SeatingChartView';
import { ScheduleView } from './components/ScheduleView';
import { ConnectView } from './components/ConnectView';
import { StudentModal } from './components/StudentModal';
import { AddDisciplineModal } from './components/AddDisciplineModal';
import { AddLeaveModal } from './components/AddLeaveModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { EditClassModal } from './components/EditClassModal';
import { EditTeacherModal } from './components/EditTeacherModal';
import { EditBghModal } from './components/EditBghModal';
import { SettingsView } from './components/SettingsView';
import { HomeroomBookView } from './components/HomeroomBookView';
import { SubjectTeachersView } from './components/SubjectTeachersView';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { ImportGradesModal } from './components/ImportGradesModal';
import { VietnameseFontRepairModal } from './components/VietnameseFontRepairModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { GeminiApiKeyModal } from './components/GeminiApiKeyModal';
import { OnlineClassDatabaseModal } from './components/OnlineClassDatabaseModal';
import { SystemLoginModal } from './components/SystemLoginModal';
import { getStoredGeminiApiKey } from './utils/geminiApiKeyManager';
import {
  Student,
  UserRole,
  NavigationTab,
  DisciplineEntry,
  ClassJournalEntry,
  TaskItem,
  DutySchedule,
  LeaveRequest,
  StudyMaterial,
  AssignmentSubmission,
  ClassInfo,
  TeacherInfo,
  BghInfo,
  SeatingChartData,
  TimetableData,
  ChatMessage,
  ParentMeeting,
  StudyPair,
  OnlineExam,
  OnlineExamAttempt,
  RandomPickRecord,
  GroupEmulationLog,
  HomeroomBookData,
  GoogleSheetConfig,
  OnlineClass,
  OnlineClassSheetConfig,
  SubjectTeacher,
} from './types';
import {
  getStoredStudents,
  saveStudents,
  getStoredGoogleSheetConfig,
  saveGoogleSheetConfig,
  getStoredOnlineClasses,
  saveOnlineClasses,
  getStoredOnlineClassSheetConfig,
  saveOnlineClassSheetConfig,
  getStoredDisciplineLogs,
  saveDisciplineLogs,
  getStoredJournal,
  saveJournal,
  getStoredTasks,
  saveTasks,
  getStoredDutySchedule,
  saveDutySchedule,
  getStoredLeaveRequests,
  saveLeaveRequests,
  getStoredMaterials,
  saveMaterials,
  getStoredSubmissions,
  saveSubmissions,
  getStoredRole,
  saveRole,
  getStoredSystemAuth,
  saveSystemAuth,
  getStoredClassInfo,
  saveClassInfo,
  getStoredTeacherInfo,
  saveTeacherInfo,
  getStoredBghInfo,
  saveBghInfo,
  getStoredSeatingChart,
  saveSeatingChart,
  getStoredTimetable,
  saveTimetable,
  getStoredChatMessages,
  saveChatMessages,
  getStoredParentMeetings,
  saveParentMeetings,
  getStoredStudyPairs,
  saveStudyPairs,
  getStoredOnlineExams,
  saveOnlineExams,
  getStoredExamAttempts,
  saveExamAttempts,
  getStoredRandomPicks,
  saveRandomPicks,
  getStoredGroupEmulationLogs,
  saveGroupEmulationLogs,
  getStoredHomeroomBookData,
  saveHomeroomBookData,
  getStoredSubjectTeachers,
  saveSubjectTeachers,
} from './lib/storage';
import { INITIAL_SEATING_CHART, INITIAL_TIMETABLE } from './data/mockData';
import { INITIAL_HOMEROOM_BOOK_DATA } from './data/homeroomBookData';
import { fetchStudentsFromGoogleSheet, fetchOnlineClassesFromGoogleSheet } from './utils/googleSheetSync';

export default function App() {
  // State Initialization
  const [isSystemAuthenticated, setIsSystemAuthenticated] = useState<boolean>(getStoredSystemAuth());
  const [role, setRole] = useState<UserRole>(getStoredRole());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig | undefined>(
    getStoredGoogleSheetConfig() || undefined
  );
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineEntry[]>(getStoredDisciplineLogs());
  const [journal, setJournal] = useState<ClassJournalEntry[]>(getStoredJournal());
  const [tasks, setTasks] = useState<TaskItem[]>(getStoredTasks());
  const [dutySchedule, setDutySchedule] = useState<DutySchedule[]>(getStoredDutySchedule());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(getStoredLeaveRequests());
  const [materials, setMaterials] = useState<StudyMaterial[]>(getStoredMaterials());
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(getStoredSubmissions());
  const [onlineExams, setOnlineExams] = useState<OnlineExam[]>(getStoredOnlineExams());
  const [examAttempts, setExamAttempts] = useState<OnlineExamAttempt[]>(getStoredExamAttempts());
  const [classInfo, setClassInfo] = useState<ClassInfo>(getStoredClassInfo());
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>(getStoredTeacherInfo());
  const [bghInfo, setBghInfo] = useState<BghInfo>(getStoredBghInfo());
  const [seatingChart, setSeatingChart] = useState<SeatingChartData>(getStoredSeatingChart());
  const [timetable, setTimetable] = useState<TimetableData>(getStoredTimetable());
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredChatMessages());
  const [parentMeetings, setParentMeetings] = useState<ParentMeeting[]>(getStoredParentMeetings());
  const [studyPairs, setStudyPairs] = useState<StudyPair[]>(getStoredStudyPairs());
  const [randomPicks, setRandomPicks] = useState<RandomPickRecord[]>(getStoredRandomPicks());
  const [emulationLogs, setEmulationLogs] = useState<GroupEmulationLog[]>(getStoredGroupEmulationLogs());
  const [homeroomBookData, setHomeroomBookData] = useState<HomeroomBookData>(getStoredHomeroomBookData());
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>(getStoredSubjectTeachers());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleAddSubjectTeacher = (teacherData: Omit<SubjectTeacher, 'id'>) => {
    const newTeacher: SubjectTeacher = {
      ...teacherData,
      id: `st-${Date.now()}`,
    };
    const updated = [newTeacher, ...subjectTeachers];
    setSubjectTeachers(updated);
    saveSubjectTeachers(updated);
  };

  const handleUpdateSubjectTeacher = (updatedTeacher: SubjectTeacher) => {
    const updated = subjectTeachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t));
    setSubjectTeachers(updated);
    saveSubjectTeachers(updated);
  };

  const handleDeleteSubjectTeacher = (id: string) => {
    const updated = subjectTeachers.filter((t) => t.id !== id);
    setSubjectTeachers(updated);
    saveSubjectTeachers(updated);
  };

  const handleClearAllSubjectTeachers = () => {
    setSubjectTeachers([]);
    saveSubjectTeachers([]);
  };

  const handleResetDefaultSubjectTeachers = () => {
    const defaultData = INITIAL_HOMEROOM_BOOK_DATA.subjectTeachers || [];
    setSubjectTeachers(defaultData);
    saveSubjectTeachers(defaultData);
  };

  const handleImportSubjectTeachers = (
    importedTeachers: SubjectTeacher[],
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      setSubjectTeachers(importedTeachers);
      saveSubjectTeachers(importedTeachers);
    } else {
      const merged = [...subjectTeachers, ...importedTeachers];
      setSubjectTeachers(merged);
      saveSubjectTeachers(merged);
    }
  };

  // Modals state
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAddDisciplineOpen, setIsAddDisciplineOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isEditBghOpen, setIsEditBghOpen] = useState(false);
  const [isImportStudentsOpen, setIsImportStudentsOpen] = useState(false);
  const [isImportGradesOpen, setIsImportGradesOpen] = useState(false);
  const [isFontRepairOpen, setIsFontRepairOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isGeminiKeyModalOpen, setIsGeminiKeyModalOpen] = useState(false);
  const [isOnlineClassModalOpen, setIsOnlineClassModalOpen] = useState(false);
  const [aiSelectedStudent, setAiSelectedStudent] = useState<Student | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Online Classes Google Sheet Database State
  const [onlineClasses, setOnlineClasses] = useState<OnlineClass[]>(
    getStoredOnlineClasses() || []
  );
  const [onlineClassSheetConfig, setOnlineClassSheetConfig] = useState<
    OnlineClassSheetConfig | undefined
  >(getStoredOnlineClassSheetConfig() || undefined);

  const handleSaveOnlineClasses = (
    classes: OnlineClass[],
    config?: OnlineClassSheetConfig
  ) => {
    setOnlineClasses(classes);
    saveOnlineClasses(classes);
    if (config) {
      setOnlineClassSheetConfig(config);
      saveOnlineClassSheetConfig(config);
    }
  };

  // Auto Sync Google Sheet on startup & background interval if autoSync is enabled
  useEffect(() => {
    const performAutoSync = () => {
      // 1. Sync Student List
      const cfg = getStoredGoogleSheetConfig();
      if (cfg && cfg.autoSync && cfg.sheetUrl) {
        fetchStudentsFromGoogleSheet(cfg.sheetUrl)
          .then((syncedStudents) => {
            handleImportStudentsList(syncedStudents, 'merge');
            const updatedCfg: GoogleSheetConfig = {
              ...cfg,
              lastSyncedAt: new Date().toLocaleString('vi-VN'),
              syncStatus: 'success',
              syncedCount: syncedStudents.length,
            };
            setGoogleSheetConfig(updatedCfg);
            saveGoogleSheetConfig(updatedCfg);
          })
          .catch((err) => {
            console.warn('Auto sync Google Sheet Students failed:', err);
          });
      }

      // 2. Sync Online Classes List
      const classCfg = getStoredOnlineClassSheetConfig();
      if (classCfg && classCfg.autoSync && classCfg.sheetUrl) {
        fetchOnlineClassesFromGoogleSheet(classCfg.sheetUrl)
          .then((fetchedClasses) => {
            handleSaveOnlineClasses(fetchedClasses, {
              ...classCfg,
              lastSyncedAt: new Date().toLocaleString('vi-VN'),
              syncStatus: 'success',
              syncedCount: fetchedClasses.length,
            });
          })
          .catch((err) => {
            console.warn('Auto sync Google Sheet Online Classes failed:', err);
          });
      }
    };

    performAutoSync();

    // Prompt user for API Key if not set
    const existingApiKey = getStoredGeminiApiKey();
    if (!existingApiKey) {
      setIsGeminiKeyModalOpen(true);
    }

    // Setup 5-minute background auto-sync timer
    const syncInterval = setInterval(performAutoSync, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  const handleSyncGoogleSheet = (
    importedStudents: Student[],
    mode: 'merge' | 'replace',
    config: GoogleSheetConfig
  ) => {
    handleImportStudentsList(importedStudents, mode);
    setGoogleSheetConfig(config);
    saveGoogleSheetConfig(config);
  };

  // Parent / Student Current Context (Data Isolation)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'hs-01');
  const currentStudentId = selectedStudentId || students[0]?.id || 'hs-01';

  // Handlers for Class & Teacher & BGH Info
  const handleSaveClassInfo = (updated: ClassInfo) => {
    setClassInfo(updated);
    saveClassInfo(updated);
  };

  const handleSaveTeacherInfo = (updated: TeacherInfo) => {
    setTeacherInfo(updated);
    saveTeacherInfo(updated);
  };

  const handleSaveBghInfo = (updated: BghInfo) => {
    setBghInfo(updated);
    saveBghInfo(updated);
  };

  const handleUpdateClassAvatar = (avatar: string) => {
    const updated = { ...classInfo, avatar };
    setClassInfo(updated);
    saveClassInfo(updated);
  };

  const handleUpdateTeacherAvatar = (avatar: string) => {
    const updated = { ...teacherInfo, avatar };
    setTeacherInfo(updated);
    saveTeacherInfo(updated);
  };

  const handleUpdateBghAvatar = (avatar: string) => {
    const updated = { ...bghInfo, avatar };
    setBghInfo(updated);
    saveBghInfo(updated);
  };


  // Handlers for Storage Updates
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    saveRole(newRole);
  };

  const handleSystemLoginSuccess = (targetRole: UserRole, remember: boolean, targetStudentId?: string) => {
    setIsSystemAuthenticated(true);
    saveSystemAuth(true, remember);
    handleRoleChange(targetRole);
    if (targetStudentId) {
      setSelectedStudentId(targetStudentId);
    }
  };

  const handleLockSystem = () => {
    setIsSystemAuthenticated(false);
    saveSystemAuth(false);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    const existingIndex = students.findIndex((s) => s.id === updatedStudent.id);
    let newStudents: Student[];
    if (existingIndex >= 0) {
      newStudents = [...students];
      newStudents[existingIndex] = updatedStudent;
    } else {
      newStudents = [updatedStudent, ...students];
    }
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);
    if (currentStudentId === studentId) {
      setSelectedStudentId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const handleClearAllStudents = () => {
    setStudents([]);
    saveStudents([]);
    setSelectedStudentId('');
  };

  const handleUpdateStudentAvatar = (studentId: string, newAvatar: string) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, avatar: newAvatar } : s));
    setStudents(updated);
    saveStudents(updated);
    if (selectedStudentForModal && selectedStudentForModal.id === studentId) {
      setSelectedStudentForModal((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
    }
  };

  const handleImportStudentsList = (
    importedList: Student[],
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      setStudents(importedList);
      saveStudents(importedList);
      if (importedList.length > 0) {
        setSelectedStudentId(importedList[0].id);
      }
    } else {
      // Merge mode: update existing by code or ID, append new ones
      const existingMap = new Map<string, Student>(students.map((s) => [s.code.toLowerCase(), s]));
      const existingIdMap = new Map<string, Student>(students.map((s) => [s.id, s]));

      const result: Student[] = [...students];

      importedList.forEach((incoming) => {
        const foundByCode = existingMap.get(incoming.code.toLowerCase());
        const foundById = existingIdMap.get(incoming.id);
        const match = foundByCode || foundById;

        if (match) {
          const idx = result.findIndex((s) => s.id === match.id);
          if (idx >= 0) {
            result[idx] = { ...result[idx], ...incoming, id: match.id };
          }
        } else {
          result.push(incoming);
        }
      });

      setStudents(result);
      saveStudents(result);
    }
  };

  const handleAddNewStudent = () => {
    const newStudentTemplate: Student = {
      id: `hs-${Date.now().toString().slice(-4)}`,
      code: `TNH${(students.length + 1).toString().padStart(3, '0')}`,
      name: 'Học sinh mới 12A1',
      gender: 'Nam',
      dob: '2008-01-01',
      group: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      phone: '0901234567',
      email: 'hocsinh.moi@tnh.edu.vn',
      address: 'Lê Chân, Hải Phòng',
      strengths: 'Chăm chỉ, tích cực trong các hoạt động phong trào',
      careerAspiration: 'Đại học Hàng Hải Việt Nam',
      healthNote: 'Sức khỏe tốt',
      emergencyContact: {
        parentName: 'Phụ huynh học sinh',
        relationship: 'Bố',
        phone: '0912345678',
        workplace: 'Hải Phòng',
      },
      conductScore: 100,
      conductRating: 'Tốt',
      grades: {
        math: { tx1: 8.0, tx2: 8.5, gk: 8.0, ck: 8.5, avg: 8.3 },
        physics: { tx1: 8.0, tx2: 8.0, gk: 8.5, ck: 8.0, avg: 8.1 },
        chemistry: { tx1: 7.5, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 7.9 },
        biology: { tx1: 8.0, tx2: 8.5, gk: 8.0, ck: 8.0, avg: 8.1 },
        english: { tx1: 8.0, tx2: 8.0, gk: 8.5, ck: 8.5, avg: 8.3 },
        literature: { tx1: 7.5, tx2: 7.5, gk: 8.0, ck: 8.0, avg: 7.8 },
        gpa: 8.1,
      },
      progressHistory: [
        { period: 'Tháng 9', math: 8.0, physics: 7.8, chemistry: 7.5 },
        { period: 'Giữa HK1', math: 8.2, physics: 8.0, chemistry: 7.8 },
        { period: 'Cuối HK1', math: 8.3, physics: 8.1, chemistry: 7.9 },
        { period: 'Giữa HK2', math: 8.5, physics: 8.3, chemistry: 8.0 },
        { period: 'Thi Thử TN', math: 8.6, physics: 8.4, chemistry: 8.2 },
      ],
      violations: [],
      commendations: ['Gia nhập lớp 12A1'],
    };

    setSelectedStudentForModal(newStudentTemplate);
    setIsStudentModalOpen(true);
  };

  const handleUpdateStudentGrade = (
    studentId: string,
    subject: string,
    field: string,
    value: number
  ) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const updatedGrades = { ...s.grades };
        if ((updatedGrades as any)[subject]) {
          (updatedGrades as any)[subject][field] = value;
          // Recalculate subject avg
          const subj = (updatedGrades as any)[subject];
          subj.avg = Number(((subj.tx1 + subj.tx2 + subj.gk * 2 + subj.ck * 3) / 7).toFixed(1));
        }
        // Recalculate GPA Khối A
        const newGpa = Number(
          (
            (updatedGrades.math.avg +
              updatedGrades.physics.avg +
              updatedGrades.chemistry.avg) /
            3
          ).toFixed(2)
        );
        updatedGrades.gpa = newGpa;

        return { ...s, grades: updatedGrades };
      }
      return s;
    });

    setStudents(updated);
    saveStudents(updated);
  };

  const handleImportGrades = (
    updatedStudentsList: Student[],
    periodName: string,
    updateCurrentGrades: boolean
  ) => {
    setStudents(updatedStudentsList);
    saveStudents(updatedStudentsList);
  };

  const handleAddDisciplineEntry = (
    entryData: Omit<DisciplineEntry, 'id' | 'timestamp'>
  ) => {
    const newEntry: DisciplineEntry = {
      ...entryData,
      id: `disc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
    };

    const newLogs = [newEntry, ...disciplineLogs];
    setDisciplineLogs(newLogs);
    saveDisciplineLogs(newLogs);

    // Update student's real-time conduct score
    const updatedStudents = students.map((s) => {
      if (s.id === entryData.studentId) {
        const newScore = Math.max(0, Math.min(100, s.conductScore + entryData.points));
        let newRating: Student['conductRating'] = 'Tốt';
        if (newScore < 65) newRating = 'Yếu';
        else if (newScore < 80) newRating = 'Trung bình';
        else if (newScore < 90) newRating = 'Khá';

        const currentViolations = Array.isArray(s.violations) ? s.violations : [];
        const currentCommendations = Array.isArray(s.commendations) ? s.commendations : [];

        const updatedViolations =
          entryData.type === 'penalty'
            ? [entryData.reason, ...currentViolations]
            : currentViolations;
        const updatedCommendations =
          entryData.type === 'bonus'
            ? [entryData.reason, ...currentCommendations]
            : currentCommendations;

        return {
          ...s,
          conductScore: newScore,
          conductRating: newRating,
          violationsCount: updatedViolations.length,
          commendationsCount: updatedCommendations.length,
          violations: updatedViolations,
          commendations: updatedCommendations,
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    saveStudents(updatedStudents);
  };

  const handleAddJournalEntry = (entry: Omit<ClassJournalEntry, 'id'>) => {
    const newEntry: ClassJournalEntry = {
      ...entry,
      id: `jour-${Date.now()}`,
    };
    const newJournals = [newEntry, ...journal];
    setJournal(newJournals);
    saveJournal(newJournals);
  };

  const handleDeleteDisciplineLog = (id: string) => {
    const updated = disciplineLogs.filter((d) => d.id !== id);
    setDisciplineLogs(updated);
    saveDisciplineLogs(updated);
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = journal.filter((j) => j.id !== id);
    setJournal(updated);
    saveJournal(updated);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskItem['status']) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(updated);
    saveTasks(updated);
  };

  const handleAddTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleUpdateDutyStatus = (dutyId: string, status: DutySchedule['status']) => {
    const updated = dutySchedule.map((d) => (d.id === dutyId ? { ...d, status } : d));
    setDutySchedule(updated);
    saveDutySchedule(updated);
  };

  const handleSaveDuty = (duty: DutySchedule) => {
    setDutySchedule((prev) => {
      const exists = prev.some((d) => d.id === duty.id);
      const updated = exists ? prev.map((d) => (d.id === duty.id ? duty : d)) : [...prev, duty];
      saveDutySchedule(updated);
      return updated;
    });
  };

  const handleBatchSaveDuty = (duties: DutySchedule[]) => {
    setDutySchedule((prev) => {
      let updated = [...prev];
      duties.forEach((newDuty) => {
        const idx = updated.findIndex((d) => d.id === newDuty.id);
        if (idx >= 0) {
          updated[idx] = newDuty;
        } else {
          updated.push(newDuty);
        }
      });
      saveDutySchedule(updated);
      return updated;
    });
  };

  const handleDeleteDuty = (dutyId: string) => {
    const updated = dutySchedule.filter((d) => d.id !== dutyId);
    setDutySchedule(updated);
    saveDutySchedule(updated);
  };

  const handleSubmitLeave = (
    reqData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: LeaveRequest = {
      ...reqData,
      id: `leave-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    const updated = [newReq, ...leaveRequests];
    setLeaveRequests(updated);
    saveLeaveRequests(updated);
  };

  const handleApproveLeave = (id: string, note?: string) => {
    const updated = leaveRequests.map((l) =>
      l.id === id ? { ...l, status: 'approved' as const, teacherNote: note } : l
    );
    setLeaveRequests(updated);
    saveLeaveRequests(updated);
  };

  const handleRejectLeave = (id: string, note?: string) => {
    const updated = leaveRequests.map((l) =>
      l.id === id ? { ...l, status: 'rejected' as const, teacherNote: note } : l
    );
    setLeaveRequests(updated);
    saveLeaveRequests(updated);
  };

  const handleDeleteLeave = (id: string) => {
    const updated = leaveRequests.filter((l) => l.id !== id);
    setLeaveRequests(updated);
    saveLeaveRequests(updated);
  };

  const handleOpenAiEvaluation = (student: Student) => {
    setAiSelectedStudent(student);
    setIsAiAdvisorOpen(true);
  };

  const handleSaveSeatingChart = (updatedChart: SeatingChartData) => {
    setSeatingChart(updatedChart);
    saveSeatingChart(updatedChart);
  };

  const handleResetSeatingChart = () => {
    setSeatingChart(INITIAL_SEATING_CHART);
    saveSeatingChart(INITIAL_SEATING_CHART);
  };

  const handleSaveTimetable = (updatedTimetable: TimetableData) => {
    setTimetable(updatedTimetable);
    saveTimetable(updatedTimetable);
  };

  const handleResetTimetable = () => {
    setTimetable(INITIAL_TIMETABLE);
    saveTimetable(INITIAL_TIMETABLE);
  };

  const handleUpdateHomeroomBookData = (data: HomeroomBookData) => {
    setHomeroomBookData(data);
    saveHomeroomBookData(data);
  };

  const handleImportStudentsFromModal = (importedStudents: Student[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setStudents(importedStudents);
      saveStudents(importedStudents);
    } else {
      // Merge by student code/id
      const existingMap = new Map<string, Student>(students.map((s) => [s.code, s]));
      importedStudents.forEach((st) => {
        existingMap.set(st.code, st);
      });
      const merged: Student[] = Array.from(existingMap.values());
      setStudents(merged);
      saveStudents(merged);
    }
  };

  const handleSaveRepairedStudents = (repairedStudents: Student[]) => {
    setStudents(repairedStudents);
    saveStudents(repairedStudents);
  };

  const handleResetData = () => {
    localStorage.clear();
    setStudents(getStoredStudents());
    setDisciplineLogs(getStoredDisciplineLogs());
    setJournal(getStoredJournal());
    setTasks(getStoredTasks());
    setDutySchedule(getStoredDutySchedule());
    setLeaveRequests(getStoredLeaveRequests());
    setMaterials(getStoredMaterials());
    setSubmissions(getStoredSubmissions());
    setOnlineExams(getStoredOnlineExams());
    setExamAttempts(getStoredExamAttempts());
    setClassInfo(getStoredClassInfo());
    setTeacherInfo(getStoredTeacherInfo());
    setSeatingChart(getStoredSeatingChart());
    setTimetable(getStoredTimetable());
    setMessages(getStoredChatMessages());
    setParentMeetings(getStoredParentMeetings());
    setStudyPairs(getStoredStudyPairs());
    setRandomPicks(getStoredRandomPicks());
    setEmulationLogs(getStoredGroupEmulationLogs());
  };

  // Connection & Communication Handlers
  const handleSendMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveChatMessages(updated);
  };

  const handleDeleteChatMessage = (messageId: string) => {
    const updated = messages.filter((m) => m.id !== messageId);
    setMessages(updated);
    saveChatMessages(updated);
  };

  const handleClearChannelMessages = (channelId: string) => {
    const updated = messages.filter((m) => {
      if (channelId.startsWith('student_')) {
        const sId = channelId.replace('student_', '');
        return !(m.channelId === channelId || m.senderId === sId || m.receiverId === sId);
      }
      return m.channelId !== channelId;
    });
    setMessages(updated);
    saveChatMessages(updated);
  };

  const handleClearAllMessages = () => {
    setMessages([]);
    saveChatMessages([]);
  };

  const handleAddParentMeeting = (meetingData: Omit<ParentMeeting, 'id'>) => {
    const newMeeting: ParentMeeting = {
      ...meetingData,
      id: `meet-${Date.now()}`,
    };
    const updated = [newMeeting, ...parentMeetings];
    setParentMeetings(updated);
    saveParentMeetings(updated);
  };

  const handleUpdateMeetingStatus = (
    id: string,
    status: ParentMeeting['status']
  ) => {
    const updated = parentMeetings.map((m) =>
      m.id === id
        ? {
            ...m,
            status,
          }
        : m
    );
    setParentMeetings(updated);
    saveParentMeetings(updated);
  };

  const handleDeleteParentMeeting = (meetingId: string) => {
    const updated = parentMeetings.filter((m) => m.id !== meetingId);
    setParentMeetings(updated);
    saveParentMeetings(updated);
  };

  const handleClearCompletedMeetings = () => {
    const updated = parentMeetings.filter((m) => m.status !== 'completed' && m.status !== 'cancelled');
    setParentMeetings(updated);
    saveParentMeetings(updated);
  };

  const handleAddStudyPair = (pairData: Omit<StudyPair, 'id'>) => {
    const newPair: StudyPair = {
      ...pairData,
      id: `pair-${Date.now()}`,
    };
    const updated = [newPair, ...studyPairs];
    setStudyPairs(updated);
    saveStudyPairs(updated);
  };

  const handleDeleteStudyPair = (pairId: string) => {
    const updated = studyPairs.filter((p) => p.id !== pairId);
    setStudyPairs(updated);
    saveStudyPairs(updated);
  };

  const handleClearAllStudyPairs = () => {
    setStudyPairs([]);
    saveStudyPairs([]);
  };

  // Materials & Assignment Submissions Handlers
  const handleAddMaterial = (
    matData: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadCount'>
  ) => {
    const newMat: StudyMaterial = {
      ...matData,
      id: `mat-${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      downloadCount: 0,
    };
    const updated = [newMat, ...materials];
    setMaterials(updated);
    saveMaterials(updated);
  };

  const handleUpdateMaterial = (updatedMat: StudyMaterial) => {
    const updated = materials.map((m) => (m.id === updatedMat.id ? updatedMat : m));
    setMaterials(updated);
    saveMaterials(updated);
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    saveMaterials(updated);
  };

  const handleDeleteMultipleMaterials = (ids: string[]) => {
    const updated = materials.filter((m) => !ids.includes(m.id));
    setMaterials(updated);
    saveMaterials(updated);
  };

  const handleResetMaterials = () => {
    localStorage.removeItem('tnh_12a1_materials');
    setMaterials(getStoredMaterials());
  };

  const handleSubmitAssignment = (
    subData: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newSub: AssignmentSubmission = {
      ...subData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'submitted',
    };
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    saveSubmissions(updated);
  };

  const handleGradeSubmission = (id: string, score: number, feedback: string) => {
    const updated = submissions.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'graded' as const,
            score,
            teacherFeedback: feedback,
            gradedAt: new Date().toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
        : s
    );
    setSubmissions(updated);
    saveSubmissions(updated);
  };

  const handleDeleteSubmission = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    saveSubmissions(updated);
  };

  // Online Exam Handlers
  const handleSaveOnlineExam = (savedExam: OnlineExam) => {
    const exists = onlineExams.some((e) => e.id === savedExam.id);
    const updated = exists
      ? onlineExams.map((e) => (e.id === savedExam.id ? savedExam : e))
      : [savedExam, ...onlineExams];
    setOnlineExams(updated);
    saveOnlineExams(updated);
  };

  const handleDeleteOnlineExam = (id: string) => {
    const updatedExams = onlineExams.filter((e) => e.id !== id);
    setOnlineExams(updatedExams);
    saveOnlineExams(updatedExams);
    // Also remove associated attempts
    const updatedAttempts = examAttempts.filter((a) => a.examId !== id);
    setExamAttempts(updatedAttempts);
    saveExamAttempts(updatedAttempts);
  };

  const handleSaveExamAttempt = (attempt: OnlineExamAttempt) => {
    const filtered = examAttempts.filter(
      (a) => !(a.examId === attempt.examId && a.studentId === attempt.studentId)
    );
    const updated = [attempt, ...filtered];
    setExamAttempts(updated);
    saveExamAttempts(updated);
  };

  // Random Picker Handlers
  const handleSaveRandomPick = (pick: RandomPickRecord) => {
    const updated = [pick, ...randomPicks];
    setRandomPicks(updated);
    saveRandomPicks(updated);

    // If oral grade or emulation points were awarded, log to group emulation logs automatically
    if (pick.emulationPointsAwarded) {
      const emLog: GroupEmulationLog = {
        id: `em-rp-${Date.now()}`,
        group: pick.group as 1 | 2 | 3 | 4,
        week: 1,
        month: 'Tháng 9',
        category: 'academic',
        title: `Vấn đáp miệng: ${pick.studentName} (${pick.oralGrade !== undefined ? pick.oralGrade + 'đ' : 'Tốt'})`,
        points: pick.emulationPointsAwarded,
        description: pick.feedback || `Chuyên đề: ${pick.topic || 'Vấn đáp lớp học'}`,
        date: pick.timestamp.slice(0, 10),
        recordedBy: teacherInfo?.name || 'Thầy Nguyễn Văn An (GVCN)',
      };
      const updatedLogs = [emLog, ...emulationLogs];
      setEmulationLogs(updatedLogs);
      saveGroupEmulationLogs(updatedLogs);
    }
  };

  const handleDeleteRandomPick = (id: string) => {
    const updated = randomPicks.filter((p) => p.id !== id);
    setRandomPicks(updated);
    saveRandomPicks(updated);
  };

  const handleClearRandomPicks = () => {
    setRandomPicks([]);
    saveRandomPicks([]);
  };

  // Group Emulation Handlers
  const handleAddEmulationLog = (log: GroupEmulationLog) => {
    const updated = [log, ...emulationLogs];
    setEmulationLogs(updated);
    saveGroupEmulationLogs(updated);
  };

  const handleDeleteEmulationLog = (id: string) => {
    const updated = emulationLogs.filter((l) => l.id !== id);
    setEmulationLogs(updated);
    saveGroupEmulationLogs(updated);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleImportAllData = (allData: {
    students?: Student[];
    materials?: StudyMaterial[];
    journal?: ClassJournalEntry[];
    disciplineLogs?: DisciplineEntry[];
  }) => {
    if (allData.students && allData.students.length > 0) {
      setStudents(allData.students);
      saveStudents(allData.students);
    }
    if (allData.materials && allData.materials.length > 0) {
      setMaterials(allData.materials);
      saveMaterials(allData.materials);
    }
    if (allData.journal && allData.journal.length > 0) {
      setJournal(allData.journal);
      saveJournal(allData.journal);
    }
    if (allData.disciplineLogs && allData.disciplineLogs.length > 0) {
      setDisciplineLogs(allData.disciplineLogs);
      saveDisciplineLogs(allData.disciplineLogs);
    }
  };

  // Filter students based on RBAC Data Isolation for Parent / Student role
  const visibleStudents =
    role === 'parent' || role === 'student'
      ? students.filter((s) => s.id === currentStudentId)
      : students;

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col antialiased text-slate-800">
      {/* Top Header */}
      <Header
        role={role}
        onRoleChange={handleRoleChange}
        setRole={handleRoleChange}
        selectedStudentId={currentStudentId}
        setSelectedStudentId={setSelectedStudentId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        students={students}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSelectStudent={(s) => {
          setSelectedStudentForModal(s);
          setIsStudentModalOpen(true);
        }}
        onResetData={handleResetData}
        onOpenAiAdvisor={() => {
          setAiSelectedStudent(null);
          setIsAiAdvisorOpen(true);
        }}
        pendingLeavesCount={leaveRequests.filter((l) => l.status === 'pending').length}
        classInfo={classInfo}
        teacherInfo={teacherInfo}
        bghInfo={bghInfo}
        onEditClass={() => setIsEditClassOpen(true)}
        onEditTeacher={() => setIsEditTeacherOpen(true)}
        onEditBgh={() => setIsEditBghOpen(true)}
        onOpenGeminiKeyModal={() => setIsGeminiKeyModalOpen(true)}
        onLockSystem={handleLockSystem}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 gap-6">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          role={role}
          pendingLeavesCount={leaveRequests.filter((l) => l.status === 'pending').length}
          studentsCount={students.length}
          onOpenAiAdvisor={() => {
            setAiSelectedStudent(null);
            setIsAiAdvisorOpen(true);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          classInfo={classInfo}
          teacherInfo={teacherInfo}
          bghInfo={bghInfo}
          onEditClass={() => setIsEditClassOpen(true)}
          onEditTeacher={() => setIsEditTeacherOpen(true)}
          onEditBgh={() => setIsEditBghOpen(true)}
          onUpdateClassInfo={handleSaveClassInfo}
          onUpdateTeacherInfo={handleSaveTeacherInfo}
          onUpdateBghInfo={handleSaveBghInfo}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {currentTab === 'overview' && (
            <OverviewView
              students={visibleStudents}
              disciplineLogs={disciplineLogs}
              tasks={tasks}
              leaveRequests={leaveRequests}
              journal={journal}
              dutySchedule={dutySchedule}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              bghInfo={bghInfo}
              onEditClass={() => setIsEditClassOpen(true)}
              onEditTeacher={() => setIsEditTeacherOpen(true)}
              onEditBgh={() => setIsEditBghOpen(true)}
              onUpdateClassAvatar={handleUpdateClassAvatar}
              onUpdateTeacherAvatar={handleUpdateTeacherAvatar}
              onUpdateBghAvatar={handleUpdateBghAvatar}
              onNavigate={setCurrentTab}
              onOpenAddDiscipline={() => setIsAddDisciplineOpen(true)}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
              onOpenAiAdvisor={() => {
                setAiSelectedStudent(null);
                setIsAiAdvisorOpen(true);
              }}
              role={role}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              students={visibleStudents}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
              onAddNewStudent={handleAddNewStudent}
              onOpenAiEvaluation={handleOpenAiEvaluation}
              onDeleteStudent={handleDeleteStudent}
              onClearAllStudents={handleClearAllStudents}
              onImportStudents={handleImportStudentsList}
              onUpdateStudentAvatar={handleUpdateStudentAvatar}
              role={role}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              onOpenGoogleSheetSync={() => setIsGoogleSheetModalOpen(true)}
              googleSheetConfig={googleSheetConfig}
            />
          )}

          {currentTab === 'subject-teachers' && (
            <SubjectTeachersView
              subjectTeachers={subjectTeachers}
              onAddTeacher={handleAddSubjectTeacher}
              onUpdateTeacher={handleUpdateSubjectTeacher}
              onDeleteTeacher={handleDeleteSubjectTeacher}
              onClearAllTeachers={handleClearAllSubjectTeachers}
              onImportTeachers={handleImportSubjectTeachers}
              onResetDefaultTeachers={handleResetDefaultSubjectTeachers}
              role={role}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
            />
          )}

          {currentTab === 'seating' && (
            <SeatingChartView
              students={students}
              seatingChart={seatingChart}
              onSaveSeatingChart={handleSaveSeatingChart}
              onResetSeatingChart={handleResetSeatingChart}
              role={role}
              currentStudentId={currentStudentId}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
              onNavigateToConnect={() => setCurrentTab('connect')}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleView
              timetable={timetable}
              onSaveTimetable={handleSaveTimetable}
              role={role}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              onOpenOnlineClassModal={() => setIsOnlineClassModalOpen(true)}
            />
          )}

          {currentTab === 'connect' && (
            <ConnectView
              students={students}
              role={role}
              currentStudentId={currentStudentId}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              messages={messages}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteChatMessage}
              onClearChannelMessages={handleClearChannelMessages}
              onClearAllMessages={handleClearAllMessages}
              meetings={parentMeetings}
              onAddMeeting={handleAddParentMeeting}
              onUpdateMeetingStatus={handleUpdateMeetingStatus}
              onDeleteMeeting={handleDeleteParentMeeting}
              onClearCompletedMeetings={handleClearCompletedMeetings}
              studyPairs={studyPairs}
              onAddStudyPair={handleAddStudyPair}
              onDeleteStudyPair={handleDeleteStudyPair}
              onClearAllStudyPairs={handleClearAllStudyPairs}
              onNavigateToSeating={() => setCurrentTab('seating')}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
              onlineClasses={onlineClasses}
              onOpenOnlineClassModal={() => setIsOnlineClassModalOpen(true)}
            />
          )}

          {currentTab === 'academic' && (
            <AcademicView
              students={visibleStudents}
              onUpdateStudentGrade={handleUpdateStudentGrade}
              onImportGrades={handleImportGrades}
              role={role}
              onOpenAiAdvisor={() => {
                setAiSelectedStudent(null);
                setIsAiAdvisorOpen(true);
              }}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              disciplineLogs={disciplineLogs}
              leaveRequests={leaveRequests}
              onOpenAddDiscipline={() => setIsAddDisciplineOpen(true)}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'materials' && (
            <MaterialsView
              materials={materials}
              submissions={submissions}
              students={students}
              role={role}
              currentStudentId={currentStudentId}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onDeleteMultipleMaterials={handleDeleteMultipleMaterials}
              onResetMaterials={handleResetMaterials}
              onSubmitAssignment={handleSubmitAssignment}
              onGradeSubmission={handleGradeSubmission}
              onDeleteSubmission={handleDeleteSubmission}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              onlineExams={onlineExams}
              examAttempts={examAttempts}
              onSaveExam={handleSaveOnlineExam}
              onDeleteExam={handleDeleteOnlineExam}
              onSaveExamAttempt={handleSaveExamAttempt}
            />
          )}

          {currentTab === 'discipline' && (
            <DisciplineView
              students={visibleStudents}
              disciplineLogs={disciplineLogs}
              journal={journal}
              onOpenAddDiscipline={() => setIsAddDisciplineOpen(true)}
              onAddJournalEntry={handleAddJournalEntry}
              onDeleteDisciplineLog={handleDeleteDisciplineLog}
              onDeleteJournalEntry={handleDeleteJournalEntry}
              role={role}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskDutyView
              tasks={tasks}
              dutySchedule={dutySchedule}
              students={students}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateDutyStatus={handleUpdateDutyStatus}
              onSaveDuty={handleSaveDuty}
              onBatchSaveDuty={handleBatchSaveDuty}
              onDeleteDuty={handleDeleteDuty}
              role={role}
            />
          )}

          {currentTab === 'random-picker' && (
            <RandomPickerView
              students={students}
              role={role}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              randomPicks={randomPicks}
              onSaveRandomPick={handleSaveRandomPick}
              onDeleteRandomPick={handleDeleteRandomPick}
              onClearRandomPicks={handleClearRandomPicks}
            />
          )}

          {currentTab === 'group-emulation' && (
            <GroupEmulationView
              students={students}
              role={role}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              emulationLogs={emulationLogs}
              onAddEmulationLog={handleAddEmulationLog}
              onDeleteEmulationLog={handleDeleteEmulationLog}
              disciplineLogs={disciplineLogs}
              dutySchedule={dutySchedule}
              examAttempts={examAttempts}
              randomPicks={randomPicks}
              onUpdateStudents={(newStudents) => {
                setStudents(newStudents);
                saveStudents(newStudents);
              }}
              homeroomBookData={homeroomBookData}
            />
          )}

          {currentTab === 'leaves' && (
            <LeaveRequestsView
              leaveRequests={leaveRequests}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onDeleteLeave={handleDeleteLeave}
              onOpenAddLeave={() => setIsAddLeaveOpen(true)}
              role={role}
              currentStudentId={currentStudentId}
            />
          )}

          {currentTab === 'homeroom-book' && (
            <HomeroomBookView
              role={role}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              bghInfo={bghInfo}
              students={students}
              disciplineLogs={disciplineLogs}
              journal={journal}
              leaveRequests={leaveRequests}
              dutySchedule={dutySchedule}
              seatingChart={seatingChart}
              timetable={timetable}
              studyPairs={studyPairs}
              emulationLogs={emulationLogs}
              bookData={homeroomBookData}
              onUpdateBookData={handleUpdateHomeroomBookData}
              onUpdateStudents={(newStudents) => {
                setStudents(newStudents);
                saveStudents(newStudents);
              }}
              onUpdateClassInfo={handleSaveClassInfo}
              onUpdateTeacherInfo={handleSaveTeacherInfo}
              onUpdateBghInfo={handleSaveBghInfo}
              onUpdateSeatingChart={(newChart) => {
                setSeatingChart(newChart);
                saveSeatingChart(newChart);
              }}
              onUpdateTimetable={(newTimetable) => {
                setTimetable(newTimetable);
                saveTimetable(newTimetable);
              }}
              onUpdateStudyPairs={(newPairs) => {
                setStudyPairs(newPairs);
                saveStudyPairs(newPairs);
              }}
              onUpdateDisciplineLogs={(newLogs) => {
                setDisciplineLogs(newLogs);
                saveDisciplineLogs(newLogs);
              }}
              onUpdateJournal={(newJournal) => {
                setJournal(newJournal);
                saveJournal(newJournal);
              }}
              onUpdateLeaveRequests={(newRequests) => {
                setLeaveRequests(newRequests);
                saveLeaveRequests(newRequests);
              }}
              onUpdateDutySchedule={(newDuty) => {
                setDutySchedule(newDuty);
                saveDutySchedule(newDuty);
              }}
              onUpdateEmulationLogs={(newLogs) => {
                setEmulationLogs(newLogs);
                saveGroupEmulationLogs(newLogs);
              }}
              onSelectStudent={(s) => {
                setSelectedStudentForModal(s);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              role={role}
              students={students}
              classInfo={classInfo}
              teacherInfo={teacherInfo}
              bghInfo={bghInfo}
              onEditClass={() => setIsEditClassOpen(true)}
              onEditTeacher={() => setIsEditTeacherOpen(true)}
              onEditBgh={() => setIsEditBghOpen(true)}
              onOpenImportStudents={() => setIsImportStudentsOpen(true)}
              onOpenImportGrades={() => setIsImportGradesOpen(true)}
              onOpenFontRepair={() => setIsFontRepairOpen(true)}
              onResetMaterials={handleResetMaterials}
              onResetSeatingChart={handleResetSeatingChart}
              onResetTimetable={handleResetTimetable}
              onOpenGoogleSheetSync={() => setIsGoogleSheetModalOpen(true)}
              onOpenOnlineClassModal={() => setIsOnlineClassModalOpen(true)}
              googleSheetConfig={googleSheetConfig}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GoogleSheetSyncModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        onSync={handleSyncGoogleSheet}
        currentCount={students.length}
        classInfo={classInfo}
        existingStudents={students}
        initialConfig={googleSheetConfig}
      />

      <OnlineClassDatabaseModal
        isOpen={isOnlineClassModalOpen}
        onClose={() => setIsOnlineClassModalOpen(false)}
        onlineClasses={onlineClasses}
        onSaveOnlineClasses={handleSaveOnlineClasses}
        initialConfig={onlineClassSheetConfig}
        role={role}
      />

      <GeminiApiKeyModal
        isOpen={isGeminiKeyModalOpen}
        onClose={() => setIsGeminiKeyModalOpen(false)}
      />

      <StudentModal
        student={selectedStudentForModal}
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        onDeleteStudent={handleDeleteStudent}
        isGVCN={role === 'gvcn'}
        onOpenAiEvaluation={handleOpenAiEvaluation}
      />

      <ImportStudentsModal
        isOpen={isImportStudentsOpen}
        onClose={() => setIsImportStudentsOpen(false)}
        onImport={handleImportStudentsFromModal}
        currentCount={students.length}
        classInfo={classInfo}
        existingStudents={students}
      />

      <ImportGradesModal
        isOpen={isImportGradesOpen}
        onClose={() => setIsImportGradesOpen(false)}
        students={students}
        onImportGrades={handleImportGrades}
        classInfo={classInfo}
        existingPeriods={['Tháng 9', 'Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Thi Thử TN']}
      />

      <VietnameseFontRepairModal
        isOpen={isFontRepairOpen}
        onClose={() => setIsFontRepairOpen(false)}
        students={students}
        onSaveRepairedStudents={handleSaveRepairedStudents}
      />

      <AddDisciplineModal
        isOpen={isAddDisciplineOpen}
        onClose={() => setIsAddDisciplineOpen(false)}
        students={students}
        onAddEntry={handleAddDisciplineEntry}
      />

      <AddLeaveModal
        isOpen={isAddLeaveOpen}
        onClose={() => setIsAddLeaveOpen(false)}
        students={students}
        currentStudentId={currentStudentId}
        role={role}
        onSubmitLeave={handleSubmitLeave}
      />

      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        students={students}
        selectedStudent={aiSelectedStudent}
      />

      <EditClassModal
        isOpen={isEditClassOpen}
        onClose={() => setIsEditClassOpen(false)}
        classInfo={classInfo}
        onSave={handleSaveClassInfo}
      />

      <EditTeacherModal
        isOpen={isEditTeacherOpen}
        onClose={() => setIsEditTeacherOpen(false)}
        teacherInfo={teacherInfo}
        onSave={handleSaveTeacherInfo}
      />

      <EditBghModal
        isOpen={isEditBghOpen}
        onClose={() => setIsEditBghOpen(false)}
        bghInfo={bghInfo}
        onSave={handleSaveBghInfo}
      />

      {/* System Startup Password Login Modal */}
      <SystemLoginModal
        isOpen={!isSystemAuthenticated}
        classInfo={classInfo}
        teacherInfo={teacherInfo}
        students={students}
        currentRole={role}
        onLoginSuccess={handleSystemLoginSuccess}
      />
    </div>
  );
}
