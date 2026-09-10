{/* Nề nếp & Thi đua View */}
{currentTab === 'discipline' && (
  <DisciplineView
    students={students}
    disciplineLogs={disciplineLogs}
    journal={journal}
    onOpenAddDiscipline={(studentId) => {
      setSelectedStudentForModal(students.find(s => s.id === studentId) || null);
      setIsAddDisciplineOpen(true);
    }}
    onAddJournalEntry={(entry) => {
      const newEntry = { ...entry, id: `j-${Date.now()}` };
      const updated = [newEntry, ...journal];
      setJournal(updated);
      saveJournal(updated);
    }}
    onDeleteDisciplineLog={(id) => {
      const updated = disciplineLogs.filter((l) => l.id !== id);
      setDisciplineLogs(updated);
      saveDisciplineLogs(updated);
    }}
    onDeleteJournalEntry={(id) => {
      const updated = journal.filter((j) => j.id !== id);
      setJournal(updated);
      saveJournal(updated);
    }}
    role={role}
    leaveRequests={leaveRequests}
    classInfo={classInfo}
    teacherInfo={teacherInfo}
    onSelectStudent={(student) => {
      setSelectedStudentForModal(student);
      setIsStudentModalOpen(true);
    }}
  />
)}
