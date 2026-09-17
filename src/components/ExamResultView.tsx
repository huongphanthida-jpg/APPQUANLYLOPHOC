import React from 'react';
import { OnlineExamResultsModal } from './OnlineExamResultsModal';
import { OnlineExam, OnlineExamAttempt, Student, ClassInfo } from '../types';

export interface ExamResultViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  exam?: OnlineExam | null;
  attempts?: OnlineExamAttempt[];
  students?: Student[];
  classInfo?: ClassInfo;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  isOpen = true,
  onClose = () => {},
  exam,
  attempts = [],
  students = [],
  classInfo,
}) => {
  if (!exam) {
    return null;
  }

  return (
    <OnlineExamResultsModal
      isOpen={isOpen}
      onClose={onClose}
      exam={exam}
      attempts={attempts}
      students={students}
      classInfo={classInfo}
    />
  );
};

export const ExamResultsView = ExamResultView;
export default ExamResultView;
