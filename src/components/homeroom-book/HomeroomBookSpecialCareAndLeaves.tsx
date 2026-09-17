import React from 'react';
import { SpecialStudentCare, LeaveRequest, Student, UserRole, ClassInfo } from '../../types';
import { LeaveRequestsView } from '../LeaveRequestsView';

interface HomeroomBookSpecialCareAndLeavesProps {
  specialStudents?: SpecialStudentCare[];
  leaveRequests?: LeaveRequest[];
  students?: Student[];
  role?: UserRole;
  classInfo?: ClassInfo;
  onUpdateSpecialStudents?: (newSpecialStudents: SpecialStudentCare[]) => void;
  onUpdateLeaveRequests?: (requests: LeaveRequest[]) => void;
}

export const HomeroomBookSpecialCareAndLeaves: React.FC<HomeroomBookSpecialCareAndLeavesProps> = ({
  leaveRequests = [],
  students = [],
  role = 'gvcn',
  classInfo,
}) => {
  return (
    <div className="space-y-6">
      <LeaveRequestsView
        role={role}
        students={students}
        leaveRequests={leaveRequests}
        classInfo={classInfo}
      />
    </div>
  );
};

export default HomeroomBookSpecialCareAndLeaves;
