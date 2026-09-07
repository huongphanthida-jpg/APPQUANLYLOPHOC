import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  TrendingUp,
  Award,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Compass,
  Edit3,
  Save,
  Users,
  HeartHandshake,
  Shield,
  BookOpen,
  Sliders,
} from 'lucide-react';
import { HomeroomBookPlan, UserRole } from '../../types';
import { EditHomeroomPlanModal } from './EditHomeroomPlanModal';

interface HomeroomBookPlanSectionProps {
  plan: HomeroomBookPlan;
  academicYear: string;
  role: UserRole;
  onUpdatePlan?: (updatedPlan: HomeroomBookPlan) => void;
}

export const HomeroomBookPlanSection: React.FC<HomeroomBookPlanSectionProps> = ({
  plan,
  academicYear,
  role,
  onUpdatePlan,
}) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const canEdit = role === 'gvcn';

  const handleSavePlan = (updatedPlan: HomeroomBookPlan) => {
    if (onUpdatePlan) {
      onUpdatePlan(updatedPlan);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-[#003366]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                PHẦN 1: KẾ HOẠCH NĂM HỌC & ĐẶC ĐIỂM TÌNH HÌNH LỚP
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Khung định hướng sư phạm, chỉ tiêu giáo dục và hệ thống giải pháp trọng tâm {academicYear}
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div>
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sliders className="w-4 h-4 text-amber-300" />
              <span>Chỉnh Sửa Kế Hoạch & Chỉ Tiêu</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Sĩ số & Cơ cấu Đầu năm */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          1. Số Liệu Thống Kê Cơ Cấu Học Sinh Đầu Năm Học
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="text-[11px] font-bold text-slate-500 block">Tổng Sĩ Số</span>
            <span className="text-xl font-black text-[#003366]">{plan.totalStudentsStart}</span>
            <span className="text-[10px] text-blue-600 block font-semibold">100% Học sinh</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[11px] font-bold text-slate-500 block">Học Sinh Nam</span>
            <span className="text-xl font-black text-indigo-700">{plan.maleCount}</span>
            <span className="text-[10px] text-indigo-600 block font-semibold">50.0%</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[11px] font-bold text-slate-500 block">Học Sinh Nữ</span>
            <span className="text-xl font-black text-rose-600">{plan.femaleCount}</span>
            <span className="text-[10px] text-rose-600 block font-semibold">50.0%</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50/70 border border-red-100">
            <span className="text-[11px] font-bold text-slate-500 block">Đoàn Viên</span>
            <span className="text-xl font-black text-red-600">{plan.unionMembersCount}</span>
            <span className="text-[10px] text-red-600 block font-semibold">100% Chi đoàn</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-slate-500 block">Dân Tộc T.Số</span>
            <span className="text-xl font-black text-emerald-700">{plan.ethnicMinorityCount}</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">1 em (Mường)</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-bold text-slate-500 block">Con Chính Sách</span>
            <span className="text-xl font-black text-amber-700">{plan.policyBeneficiaryCount}</span>
            <span className="text-[10px] text-amber-600 block font-semibold">2 em (TB-LS)</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[11px] font-bold text-slate-500 block">Hộ Cận Nghèo</span>
            <span className="text-xl font-black text-purple-700">{plan.poorHouseholdCount}</span>
            <span className="text-[10px] text-purple-600 block font-semibold">Đã cấp học bổng</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100">
            <span className="text-[11px] font-bold text-slate-500 block">Lưu Ý Sức Khỏe</span>
            <span className="text-xl font-black text-teal-700">{plan.specialHealthCount}</span>
            <span className="text-[10px] text-teal-600 block font-semibold">Cận / Hen suyễn</span>
          </div>
        </div>
      </div>

      {/* 2. Đặc điểm tình hình: Thuận lợi & Khó khăn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thuận lợi */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wide">
              Thuận Lợi Căn Bản
            </h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {(plan?.advantages || []).map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Khó khăn */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide">
              Khó Khăn & Thách Thức
            </h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {(plan?.difficulties || []).map((diff, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Chỉ Tiêu Phấn Đấu Năm Học */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          2. Hệ Thống Chỉ Tiêu Phấn Đấu Năm Học {academicYear}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Học lực */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Kết Quả Học Tập</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-emerald-700">Xuất sắc & Giỏi:</span>
                <span className="font-bold text-slate-900">{plan.academicTargets?.excellent || 75}%</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700">Khá:</span>
                <span className="font-bold text-slate-900">{plan.academicTargets?.good || 25}%</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-400">
                <span>Đạt / Chưa đạt:</span>
                <span>0.0% (0 HS)</span>
              </div>
            </div>
          </div>

          {/* Rèn luyện */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Kết Quả Rèn Luyện</span>
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-emerald-700">Hạnh kiểm Tốt:</span>
                <span className="font-bold text-slate-900">{plan.conductTargets?.good || 97.2}%</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700">Hạnh kiểm Khá:</span>
                <span className="font-bold text-slate-900">{plan.conductTargets?.fair || 2.8}%</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-400">
                <span>Đạt / Chưa đạt:</span>
                <span>0.0% (0 HS)</span>
              </div>
            </div>
          </div>

          {/* Tốt nghiệp & Đại học */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Thi TN & Đại Học</span>
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Tốt nghiệp THPT:</span>
                <span className="font-bold text-emerald-700">{plan.graduationTargetPercent || 100}% (36/36 HS)</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Đỗ ĐH NV1:</span>
                <span className="font-bold text-blue-700">≥ {plan.universityAdmissionTargetPercent || 91.7}% (33+ HS)</span>
              </div>
              <div className="flex justify-between font-semibold text-purple-700">
                <span>HSG Tỉnh:</span>
                <span className="font-bold">≥ 3 Giải</span>
              </div>
            </div>
          </div>

          {/* Danh hiệu thi đua */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Danh Hiệu Tập Thể</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <span className="font-black text-amber-900 block text-xs">
                  {plan.classEmulationTitleTarget || 'TẬP THỂ LỚP XUẤT SẮC'}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Cờ thi đua dẫn đầu Khối 12</span>
              </div>
              <p className="text-[10px] text-slate-500 text-center pt-0.5">
                Chi đoàn vững mạnh xuất sắc cấp Tỉnh Đoàn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Giải Pháp Trọng Tâm */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          3. Hệ Thống Các Biện Pháp Sư Phạm Trọng Tâm
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#003366] flex items-center justify-center font-black">
                A
              </span>
              <span>Giáo dục Đạo đức, Tư tưởng & Nề nếp Kỷ luật</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-8">
              {plan.keyMeasures?.morality || 'Phát huy tính tự giác, nêu gương của cán sự lớp...'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                B
              </span>
              <span>Nâng cao Chất lượng Học tập & Ôn thi Tốt nghiệp THPT - ĐH</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-8">
              {plan.keyMeasures?.studyQuality || 'Tổ chức ôn tập phân hóa, phong trào Đôi bạn cùng tiến...'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {isPlanModalOpen && (
        <EditHomeroomPlanModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          plan={plan}
          academicYear={academicYear}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
};
