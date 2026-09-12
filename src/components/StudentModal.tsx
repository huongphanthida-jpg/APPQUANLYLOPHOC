import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Briefcase,
  Award,
  Sparkles,
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Camera,
  Edit3
} from 'lucide-react';
import { Student } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface StudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  isGVCN: boolean;
  onOpenAiEvaluation?: (student: Student) => void;
}

function buildSafeStudent(stu: Student | null): Student {
  const defaultGrades = {
    math: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    physics: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    chemistry: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    biology: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    literature: { tx1: 7.8, tx2: 7.8, gk: 7.8, ck: 7.8, avg: 7.8 },
    english: { tx1: 8.2, tx2: 8.2, gk: 8.2, ck: 8.2, avg: 8.2 },
    history: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    geography: { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 },
    informatics: { tx1: 8.2, tx2: 8.2, gk: 8.2, ck: 8.2, avg: 8.2 },
    gpa: 8.0,
  };

  if (!stu) {
    return {
      id: '',
      code: 'HS-00',
      name: 'Học sinh',
      gender: 'Nam',
      dob: '2008-01-01',
      group: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      phone: '',
      email: '',
      address: '',
      strengths: '',
      careerAspiration: '',
      healthNote: '',
      emergencyContact: {
        parentName: 'Phụ huynh học sinh',
        relationship: 'Bố',
        phone: '',
        workplace: '',
      },
      conductScore: 95,
      conductRating: 'Tốt',
      grades: defaultGrades,
      progressHistory: [],
    };
  }

  const grades = stu.grades
    ? {
        math: stu.grades.math || defaultGrades.math,
        physics: stu.grades.physics || defaultGrades.physics,
        chemistry: stu.grades.chemistry || defaultGrades.chemistry,
        biology: stu.grades.biology || defaultGrades.biology,
        literature: stu.grades.literature || defaultGrades.literature,
        english: stu.grades.english || defaultGrades.english,
        history: stu.grades.history || defaultGrades.history,
        geography: stu.grades.geography || defaultGrades.geography,
        informatics: stu.grades.informatics || defaultGrades.informatics,
        gpa: stu.grades.gpa ?? 8.0,
      }
    : defaultGrades;

  const emergencyContact = {
    parentName: stu.emergencyContact?.parentName || 'Phụ huynh học sinh',
    relationship: stu.emergencyContact?.relationship || 'Bố',
    phone: stu.emergencyContact?.phone || '',
    workplace: stu.emergencyContact?.workplace || '',
  };

  return {
    ...stu,
    name: stu.name || '',
    code: stu.code || '',
    gender: stu.gender || 'Nam',
    dob: stu.dob || '2008-01-01',
    group: (stu.group && stu.group >= 1 && stu.group <= 4 ? stu.group : 1) as 1 | 2 | 3 | 4,
    avatar: stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: stu.phone || '',
    email: stu.email || '',
    address: stu.address || '',
    strengths: stu.strengths || '',
    careerAspiration: stu.careerAspiration || '',
    healthNote: stu.healthNote || '',
    conductScore: stu.conductScore ?? 95,
    conductRating: stu.conductRating || 'Tốt',
    grades,
    emergencyContact,
    progressHistory: stu.progressHistory || [],
  };
}

export const StudentModal: React.FC<StudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
  onDeleteStudent,
  isGVCN,
  onOpenAiEvaluation,
}) => {
  const [formData, setFormData] = useState<Student>(() => buildSafeStudent(student));
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'emergency'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditingGrades, setIsEditingGrades] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_SUBJECT_NAMES: Record<string, string> = {
    math: 'Toán học (Khối A)',
    physics: 'Vật lý (Khối A)',
    chemistry: 'Hóa học (Khối A)',
    biology: 'Sinh học',
    english: 'Tiếng Anh',
    literature: 'Ngữ văn',
    history: 'Lịch sử',
    geography: 'Địa lý',
    informatics: 'Tin học',
  };

  const [subjectNames, setSubjectNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('custom_subject_names');
      return saved ? { ...DEFAULT_SUBJECT_NAMES, ...JSON.parse(saved) } : DEFAULT_SUBJECT_NAMES;
    } catch {
      return DEFAULT_SUBJECT_NAMES;
    }
  });

  const [editingSubjectKey, setEditingSubjectKey] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState<string>('');

  const handleSaveSubjectName = (key: string) => {
    if (!editingSubjectName.trim()) {
      setEditingSubjectKey(null);
      return;
    }
    const updated = { ...subjectNames, [key]: editingSubjectName.trim() };
    setSubjectNames(updated);
    try {
      localStorage.setItem('custom_subject_names', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingSubjectKey(null);
  };

  useEffect(() => {
    if (student) {
      setFormData(buildSafeStudent(student));
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGradeChange = (
    subjectKey:
      | 'math'
      | 'literature'
      | 'gdcd'
      | 'history'
      | 'geography'
      | 'english'
      | 'physics'
      | 'chemistry'
      | 'biology'
      | 'informatics',
    field: 'tx1' | 'tx2' | 'gk' | 'ck',
    rawVal: string
  ) => {
    const val = parseFloat(rawVal);
    const numVal = isNaN(val) ? 0 : Math.min(10, Math.max(0, val));

    setFormData((prev) => {
      const currentSubject = (prev.grades as any)[subjectKey] || { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 };
      const updatedSubject = {
        ...currentSubject,
        [field]: numVal,
      };

      const tx1 = updatedSubject.tx1;
      const tx2 = updatedSubject.tx2;
      const gk = updatedSubject.gk;
      const ck = updatedSubject.ck;

      const avg = Number(((tx1 + tx2 + gk * 2 + ck * 3) / 7).toFixed(1));
      updatedSubject.avg = avg;

      const newGrades = {
        ...prev.grades,
        [subjectKey]: updatedSubject,
      };

      const subjects = [
        'math',
        'literature',
        'gdcd',
        'history',
        'geography',
        'english',
        'physics',
        'chemistry',
        'biology',
      ] as const;

      const totalAvg = subjects.reduce((sum, key) => {
        const subj = (newGrades as any)[key] || { avg: 8.0 };
        return sum + (subj.avg || 0);
      }, 0);

      const gpa = Number((totalAvg / subjects.length).toFixed(2));
      newGrades.gpa = gpa;

      return {
        ...prev,
        grades: newGrades,
      };
    });
  };

  const handleAvgGradeChange = (
    subjectKey:
      | 'math'
      | 'literature'
      | 'gdcd'
      | 'history'
      | 'geography'
      | 'english'
      | 'physics'
      | 'chemistry'
      | 'biology'
      | 'informatics',
    rawVal: string
  ) => {
    const val = parseFloat(rawVal);
    const numVal = isNaN(val) ? 0 : Math.min(10, Math.max(0, val));

    setFormData((prev) => {
      const currentSubject = (prev.grades as any)[subjectKey] || { tx1: 8.0, tx2: 8.0, gk: 8.0, ck: 8.0, avg: 8.0 };
      const updatedSubject = {
        ...currentSubject,
        tx1: numVal,
        tx2: numVal,
        gk: numVal,
        ck: numVal,
        avg: numVal,
      };

      const newGrades = {
        ...prev.grades,
        [subjectKey]: updatedSubject,
      };

      const subjects = [
        'math',
        'literature',
        'gdcd',
        'history',
        'geography',
        'english',
        'physics',
        'chemistry',
        'biology',
      ] as const;

      const totalAvg = subjects.reduce((sum, key) => {
        const subj = (newGrades as any)[key] || { avg: 8.0 };
        return sum + (subj.avg || 0);
      }, 0);

      const gpa = Number((totalAvg / subjects.length).toFixed(2));
      newGrades.gpa = gpa;

      return {
        ...prev,
        grades: newGrades,
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Navy banner */}
        <div className="bg-[#003366] text-white p-5 sm:p-6 flex items-start justify-between relative">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#98FF98] shadow-md"
              />
              {isGVCN && (
                <button
                  type="button"
                  id="btn-modal-change-avatar"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Thay đổi ảnh đại diện học sinh"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-[#003366] transition-transform hover:scale-110"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/20 text-[#98FF98]">
                  {formData.code} • TỔ {formData.group}
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  Hạnh kiểm: {formData.conductRating} ({formData.conductScore}đ)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {formData.name}
              </h2>
              <p className="text-xs text-slate-300">
                THPT Trần Nguyên Hãn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#003366] text-[#003366] bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hồ Sơ Học Sinh
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'emergency'
                ? 'border-[#003366] text-[#003366] bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Liên Hệ Khẩn Cấp & Sức Khỏe
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'academic'
                ? 'border-[#003366] text-[#003366] bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Điểm Số TB Các Môn
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lưu thông tin học sinh thành công!</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    disabled={!isGVCN}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tổ Phụ Trách
                  </label>
                  <select
                    disabled={!isGVCN}
                    value={formData.group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        group: Number(e.target.value) as 1 | 2 | 3 | 4,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày sinh & Giới tính
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      disabled={!isGVCN}
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-2/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                    <select
                      disabled={!isGVCN}
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as 'Nam' | 'Nữ',
                        })
                      }
                      className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại Học sinh
                  </label>
                  <input
                    type="text"
                    disabled={!isGVCN}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Học sinh
                  </label>
                  <input
                    type="email"
                    disabled={!isGVCN}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  disabled={!isGVCN}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Sở trường & Năng khiếu */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Sở Trường, Năng Khiếu & Hoạt Động Nổi Bật</span>
                </div>
                <textarea
                  rows={3}
                  disabled={!isGVCN}
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="Ví dụ: Năng khiếu Toán học, chơi cờ vua, MC sự kiện, thiết kế đồ họa..."
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none"
                />
              </div>

              {/* Định hướng nghề nghiệp */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#003366] font-bold text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Định Hướng Ngành Học & Đại Học Mục Tiêu 2026</span>
                </div>
                <input
                  type="text"
                  disabled={!isGVCN}
                  value={formData.careerAspiration}
                  onChange={(e) =>
                    setFormData({ ...formData, careerAspiration: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs sm:text-sm">
                  <HeartPulse className="w-4 h-4 text-red-600" />
                  <span>Thông Tin Khẩn Cấp & Người Giám Hộ (Phụ Huynh)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ Tên Phụ Huynh
                    </label>
                    <input
                      type="text"
                      disabled={!isGVCN}
                      value={formData.emergencyContact.parentName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            parentName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quan Hệ & Số Điện Thoại
                    </label>
                    <div className="flex gap-2">
                      <select
                        disabled={!isGVCN}
                        value={formData.emergencyContact.relationship}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              relationship: e.target.value as any,
                            },
                          })
                        }
                        className="w-1/3 px-2 py-2 bg-white border border-red-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="Bố">Bố</option>
                        <option value="Mẹ">Mẹ</option>
                        <option value="Người giám hộ">Giám hộ</option>
                      </select>
                      <input
                        type="text"
                        disabled={!isGVCN}
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-2/3 px-3 py-2 bg-white border border-red-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold text-red-700"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nơi công tác của Phụ huynh
                  </label>
                  <input
                    type="text"
                    disabled={!isGVCN}
                    value={formData.emergencyContact.workplace}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          workplace: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Lưu ý sức khỏe */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Lưu Ý Sức Khỏe & Dị Ứng / Chấn Thương
                </label>
                <textarea
                  rows={2}
                  disabled={!isGVCN}
                  value={formData.healthNote}
                  onChange={(e) => setFormData({ ...formData, healthNote: e.target.value })}
                  placeholder="Tiền sử hen suyễn, cận thị, chấn thương thể thao..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-4">
                  <span>
                    Điểm trung bình các môn (ĐTB):{' '}
                    <strong className="text-sm font-black text-[#003366]">
                      {Number(
                        (
                          ['math', 'physics', 'chemistry', 'biology', 'english', 'literature', 'history', 'geography', 'informatics'].reduce((sum, k) => {
                            const g = (formData.grades as any)[k];
                            return sum + (g?.avg ?? 8.0);
                          }, 0) / 9
                        ).toFixed(2)
                      )}
                    </strong>
                  </span>
                  <span>Hạnh kiểm: <strong className="text-emerald-700 font-bold">{formData.conductRating}</strong> ({formData.conductScore}đ)</span>
                </div>

                {isGVCN && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubjectNames(DEFAULT_SUBJECT_NAMES);
                        try {
                          localStorage.removeItem('custom_subject_names');
                        } catch (e) {}
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-blue-100/50 transition-colors cursor-pointer"
                      title="Khôi phục lại tên các môn học mặc định ban đầu"
                    >
                      🔄 Khôi phục tên môn
                    </button>
                    <button
                      type="button"
                      id="btn-toggle-edit-grades"
                      onClick={() => setIsEditingGrades(!isEditingGrades)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isEditingGrades
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-white border border-blue-300 text-[#003366] hover:bg-blue-100'
                      }`}
                      title="Nhấp vào đây hoặc biểu tượng cây bút để sửa điểm trực tiếp"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingGrades ? 'Hoàn tất sửa điểm' : 'Sửa điểm số'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-4 text-left">Môn Học</th>
                      <th className="py-2.5 px-4 text-center">ĐTB Môn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'math', name: 'Toán học', defaultAvg: 8.5 },
                      { key: 'literature', name: 'Ngữ văn', defaultAvg: 8.0 },
                      { key: 'gdcd', name: 'GDCD / GDKT&PL', defaultAvg: 8.5 },
                      { key: 'history', name: 'Lịch sử', defaultAvg: 8.0 },
                      { key: 'geography', name: 'Địa lý', defaultAvg: 8.2 },
                      { key: 'english', name: 'Tiếng Anh', defaultAvg: 8.6 },
                      { key: 'physics', name: 'Vật lý', defaultAvg: 8.5 },
                      { key: 'chemistry', name: 'Hóa học', defaultAvg: 8.5 },
                      { key: 'biology', name: 'Sinh học', defaultAvg: 8.2 },
                    ].map((subject) => {
                      const grade = (formData.grades as any)[subject.key] || {
                        tx1: subject.defaultAvg,
                        tx2: subject.defaultAvg,
                        gk: subject.defaultAvg,
                        ck: subject.defaultAvg,
                        avg: subject.defaultAvg,
                      };
                      return (
                        <tr key={subject.key} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-[#003366]">
                            {editingSubjectKey === subject.key ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                <input
                                  type="text"
                                  list="subject-name-presets"
                                  value={editingSubjectName}
                                  onChange={(e) => setEditingSubjectName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveSubjectName(subject.key);
                                    if (e.key === 'Escape') setEditingSubjectKey(null);
                                  }}
                                  autoFocus
                                  placeholder="Nhập tên môn..."
                                  className="w-full px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveSubjectName(subject.key)}
                                  className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0"
                                  title="Lưu tên môn học"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSubjectKey(null)}
                                  className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer shrink-0"
                                  title="Hủy"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 group">
                                <span className="truncate">{subjectNames[subject.key] || subject.name}</span>
                                {isGVCN && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubjectKey(subject.key);
                                      setEditingSubjectName(subjectNames[subject.key] || subject.name);
                                    }}
                                    title="Nhấp để điều chỉnh tên môn học"
                                    className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {isEditingGrades && isGVCN ? (
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={grade.avg}
                                onChange={(e) => handleAvgGradeChange(subject.key as any, e.target.value)}
                                className="w-20 px-2 py-1 bg-white border border-blue-400 rounded-xl text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs mx-auto"
                              />
                            ) : (
                              <span className="text-sm font-black text-blue-700">{grade.avg}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isGVCN && onDeleteStudent && (
                <button
                  type="button"
                  id="btn-delete-student-modal"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Xoá Học Sinh</span>
                </button>
              )}

              {onOpenAiEvaluation && (
                <button
                  type="button"
                  id="btn-ai-evaluate-student"
                  onClick={() => {
                    onClose();
                    onOpenAiEvaluation(formData);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Viết Nhận Xét Sổ Học Bạ (AI)</span>
                </button>
              )}

              <button
                type="button"
                id="btn-zalo-parent-notice"
                onClick={() => {
                  const parentMsg = `Kính gửi Phụ huynh em ${formData.name} (THPT Trần Nguyên Hãn),\n\nThầy/Cô GVCN xin gửi thông báo kết quả học tập & nề nếp mới nhất:\n- Điểm Trung Bình (ĐTB): ${formData.grades?.gpa || 8.0} / 10.0\n- Hạnh kiểm: ${formData.conductRating || 'Tốt'} (${formData.conductScore || 95} điểm thi đua)\n- Sở trường: ${formData.strengths || 'Học tập chăm chỉ, tích cực'}\n- Định hướng Đại học: ${formData.careerAspiration || 'Đại học Bách Khoa Hà Nội'}\n\nRất mong Quý phụ huynh tiếp tục phối hợp với GVCN nhắc nhở em duy trì giờ tự học tối tại nhà. Trân trọng!`;
                  navigator.clipboard.writeText(parentMsg);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                  alert(`Đã sao chép tin nhắn Zalo gửi phụ huynh em ${formData.name} vào bộ nhớ tạm!\n\nNội dung:\n${parentMsg}`);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                title="Tự động tạo tin nhắn gửi riêng cho phụ huynh qua Zalo/SĐT"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Soạn Tin Zalo Phụ Huynh (AI)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>

              {isGVCN && (
                <button
                  type="submit"
                  id="btn-save-student-profile"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Hồ Sơ</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Confirm Delete Dialog */}
      {isConfirmDeleteOpen && onDeleteStudent && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={() => {
            onDeleteStudent(formData.id);
            setIsConfirmDeleteOpen(false);
            onClose();
          }}
          title="Xác Nhận Xoá Học Sinh"
          message={`Bạn có chắc chắn muốn xoá học sinh "${formData.name}" (Mã: ${formData.code}) khỏi hệ thống?`}
          confirmText="Xoá Học Sinh"
        />
      )}

      {/* Subject Name Presets Datalist */}
      <datalist id="subject-name-presets">
        <option value="Toán học (Khối A)" />
        <option value="Toán học (Khối A1)" />
        <option value="Toán học (Khối B)" />
        <option value="Vật lý (Khối A)" />
        <option value="Vật lý (Khối A1)" />
        <option value="Hóa học (Khối A)" />
        <option value="Hóa học (Khối B)" />
        <option value="Ngữ văn (Khối D)" />
        <option value="Ngữ văn (Khối C)" />
        <option value="Tiếng Anh (Khối D)" />
        <option value="Tiếng Anh (Khối A1)" />
        <option value="Lịch sử (Khối C)" />
        <option value="Địa lý (Khối C)" />
        <option value="Tin học" />
        <option value="Sinh học (Khối B)" />
      </datalist>
    </div>
  );
};
