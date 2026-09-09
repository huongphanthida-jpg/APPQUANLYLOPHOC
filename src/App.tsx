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
