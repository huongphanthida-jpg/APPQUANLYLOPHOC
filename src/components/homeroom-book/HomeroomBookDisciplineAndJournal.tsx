import React from 'react';
import { DisciplineEntry, ClassJournalEntry, Student, UserRole, LeaveRequest, ClassInfo, TeacherInfo } from '../../types';
import { DisciplineView } from '../DisciplineView';

interface HomeroomBookDisciplineAndJournalProps {
  disciplineLogs?: DisciplineEntry[];
  journal?: ClassJournalEntry[];
  students?: Student[];
  role?: UserRole;
  leaveRequests?: LeaveRequest[];
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
  onUpdateDisciplineLogs?: (logs: DisciplineEntry[]) => void;
  onUpdateJournal?: (journal: ClassJournalEntry[]) => void;
  onOpenAddDiscipline?: (studentId?: string) => void;
  onSelectStudent?: (student: Student) => void;
}

export const HomeroomBookDisciplineAndJournal: React.FC<HomeroomBookDisciplineAndJournalProps> = ({
  disciplineLogs = [],
  journal = [],
  students = [],
  role = 'gvcn',
  leaveRequests = [],
  classInfo,
  teacherInfo,
  onUpdateDisciplineLogs,
  onUpdateJournal,
  onOpenAddDiscipline,
  onSelectStudent,
}) => {
  const handleDeleteDisciplineLog = (id: string) => {
    const updated = (disciplineLogs || []).filter((l) => l.id !== id);
    if (onUpdateDisciplineLogs) onUpdateDisciplineLogs(updated);
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = (journal || []).filter((j) => j.id !== id);
    if (onUpdateJournal) onUpdateJournal(updated);
  };

  const handleAddJournalEntry = (entry: Omit<ClassJournalEntry, 'id'>) => {
    const newEntry: ClassJournalEntry = {
      ...entry,
      id: `j_${Date.now()}`,
    };
    const updated = [newEntry, ...(journal || [])];
    if (onUpdateJournal) onUpdateJournal(updated);
  };

  return (
    <div className="space-y-6">
      <DisciplineView
        students={students}
        disciplineLogs={disciplineLogs}
        journal={journal}
        onOpenAddDiscipline={onOpenAddDiscipline || (() => {})}
        onAddJournalEntry={handleAddJournalEntry}
        onDeleteDisciplineLog={handleDeleteDisciplineLog}
        onDeleteJournalEntry={handleDeleteJournalEntry}
        role={role}
        leaveRequests={leaveRequests}
        classInfo={classInfo}
        teacherInfo={teacherInfo}
        onSelectStudent={onSelectStudent}
      />
    </div>
  );
};

export default HomeroomBookDisciplineAndJournal;
