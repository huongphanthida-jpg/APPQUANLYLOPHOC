import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileCode,
  Layers,
  Wand2,
  BookOpen,
  ArrowRight,
  Eye,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';
import { OnlineExamQuestion, OnlineExam } from '../types';

export interface UploadedExamFile {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  base64Data: string;
  previewUrl?: string;
}

interface AIDocumentExamGeneratorProps {
  currentSubject: OnlineExam['subject'];
  className: string;
  onExamGenerated: (data: {
    title: string;
    subject: OnlineExam['subject'];
    durationMinutes: number;
    description: string;
    questions: OnlineExamQuestion[];
  }) => void;
  onCancel?: () => void;
}

export const AIDocumentExamGenerator: React.FC<AIDocumentExamGeneratorProps> = ({
  currentSubject,
  className,
  onExamGenerated,
  onCancel,
}) => {
  const [files, setFiles] = useState<UploadedExamFile[]>([]);
  const [documentText, setDocumentText] = useState('');
  const [subject, setSubject] = useState<OnlineExam['subject']>(currentSubject || 'Toán');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [difficulty, setDifficulty] = useState<'balanced' | 'basic' | 'advanced'>('balanced');
  const [customPrompt, setCustomPrompt] = useState('');

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepText, setStepText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle files selected or dropped
  const processFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: UploadedExamFile[] = [];

    Array.from(fileList).forEach((file) => {
      // Validate format
      const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.md'];
      const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const isValidExt = validExtensions.includes(fileExt);

      if (!isValidExt && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrorMessage(`Tệp "${file.name}" không đúng định dạng hỗ trợ (Word, PDF, Ảnh, Text).`);
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage(`Tệp "${file.name}" vượt quá dung lượng cho phép (tối đa 25MB).`);
        return;
      }

      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1] || '';
          setFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: 'image',
              mimeType: file.type || 'image/jpeg',
              base64Data,
              previewUrl: result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf' || fileExt === '.pdf') {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1] || '';
          setFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: 'pdf',
              mimeType: 'application/pdf',
              base64Data,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else if (fileExt === '.docx' || fileExt === '.doc') {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1] || '';
          setFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: 'word',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              base64Data,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // Plain text / Markdown
        reader.onload = (e) => {
          const textContent = e.target?.result as string;
          const base64Data = btoa(unescape(encodeURIComponent(textContent)));
          setFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: 'text',
              mimeType: 'text/plain',
              base64Data,
            },
          ]);
        };
        reader.readAsText(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  // Sample Documents Quick Loader
  const loadSampleDocument = (type: 'math' | 'chemistry' | 'physics' | 'english') => {
    if (type === 'math') {
      setSubject('Toán');
      setQuestionCount(5);
      setDurationMinutes(45);
      setCustomPrompt('Tập trung trích xuất các dạng bài về Tích phân đổi biến số, Nguyên hàm từng phần và Hình học không gian Oxyz.');
      setDocumentText(`TÀI LIỆU ÔN TẬP TOÁN 12 - THPT TRẦN NGUYÊN HÃN
CHỦ ĐỀ: NGUYÊN HÀM - TÍCH PHÂN & HÌNH HỌC TỌA ĐỘ OXYZ

1. Bảng Nguyên hàm cơ bản & Mở rộng:
- ∫ x^a dx = x^(a+1)/(a+1) + C (a ≠ -1)
- ∫ 1/x dx = ln|x| + C
- ∫ e^x dx = e^x + C; ∫ a^x dx = a^x / ln(a) + C
- ∫ sin(x) dx = -cos(x) + C; ∫ cos(x) dx = sin(x) + C
- Phương pháp nguyên hàm từng phần: ∫ u dv = u.v - ∫ v du (Thứ tự ưu tiên đặt u: Nhất log, Nhì đa, Tam lượng, Tứ mũ).

2. Phương pháp đổi biến số trong tích phân:
- Đặt t = u(x) => dt = u'(x) dx. Cần đổi cận x -> t trước khi tính.

3. Hệ tọa độ Oxyz & Mặt cầu:
- Tọa độ vectơ: u = (x; y; z), v = (x'; y'; z'). Tích vô hướng u.v = x.x' + y.y' + z.z'.
- Phương trình mặt cầu tâm I(a; b; c) bán kính R: (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2.
- Phương trình tổng quát mặt cầu: x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0 với R = √(a^2 + b^2 + c^2 - d) > 0.`);
    } else if (type === 'chemistry') {
      setSubject('Hóa Học');
      setQuestionCount(5);
      setDurationMinutes(30);
      setCustomPrompt('Khai thác các câu hỏi lý thuyết este đa chức, xà phòng hóa chất béo và phân biệt cacbohiđrat.');
      setDocumentText(`TÀI LIỆU CHUYÊN ĐỀ HÓA HỌC 12: ESTE - LIPIT & CACBOHIĐRAT
1. Khái niệm & Danh pháp Este:
- Công thức tổng quát este no, đơn chức, mạch hở: CnH2nO2 (n ≥ 2).
- Tên este = Tên gốc hiđrocacbon R' + Tên gốc axit (đuôi at). Ví dụ: HCOOC2H5: etyl fomat; CH3COOCH3: metyl axetat; CH3COOCH=CH2: vinyl axetat.
- Phản ứng xà phòng hóa: RCOOR' + NaOH --t°--> RCOONa + R'OH (Phản ứng một chiều).

2. Chất béo (Triglixerit):
- Khái niệm: Trieste của glixerol với các axit béo (axit panmitic C15H31COOH, axit stearic C17H35COOH, axit oleic C17H33COOH).
- Công thức chung: (RCOO)3C3H5 + 3NaOH -> 3RCOONa (xà phòng) + C3H5(OH)3 (glixerol).

3. Cacbohiđrat trọng tâm:
- Monosaccarit: Glucozơ (C6H12O6, tráng bạc, khử Cu(OH)2), Fructozơ.
- Đisaccarit: Saccarozơ (C12H22O11, không tráng bạc nhưng thủy phân tạo Glucozơ + Fructozơ).
- Polisaccarit: Tinh bột, Xenlulozơ.`);
    } else if (type === 'physics') {
      setSubject('Vật Lý');
      setQuestionCount(5);
      setDurationMinutes(30);
      setCustomPrompt('Tạo các câu trắc nghiệm về mạch RLC nối tiếp, cộng hưởng điện và giao thoa sóng cơ.');
      setDocumentText(`TÀI LIỆU VẬT LÝ 12: DÒNG ĐIỆN XOAY CHIỀU & SÓNG CƠ
1. Mạch RLC nối tiếp:
- Tổng trở: Z = √[R^2 + (ZL - ZC)^2] với ZL = ωL, ZC = 1/(ωC).
- Độ lệch pha giữa u và i: tan(φ) = (ZL - ZC) / R.
- Hiện tượng cộng hưởng điện khi ZL = ZC <=> ω^2.L.C = 1. Khi đó Z_min = R, I_max = U/R, cos(φ) = 1.

2. Giao thoa sóng cơ học:
- Hai nguồn kết hợp S1, S2 cùng pha:
  + Cực đại giao thoa: d2 - d1 = k.λ (k ∈ Z).
  + Cực tiểu giao thoa: d2 - d1 = (k + 0,5)λ.
  + Khoảng cách giữa 2 cực đại liên tiếp trên đoạn S1S2 là λ/2.`);
    } else if (type === 'english') {
      setSubject('Tiếng Anh');
      setQuestionCount(5);
      setDurationMinutes(25);
      setCustomPrompt('Tạo bài trắc nghiệm về ngữ pháp câu điều kiện, mệnh đề quan hệ và ngữ âm chuẩn THPT.');
      setDocumentText(`ENGLISH 12 GRAMMAR & READING FOCUS
1. Conditional Sentences:
- Type 1 (Real in present/future): If + S + V(s/es), S + will/can + V_inf.
- Type 2 (Unreal in present): If + S + V_ed/V2 (were for all subjects), S + would/could + V_inf.
- Type 3 (Unreal in past): If + S + had + P2, S + would/could + have + P2.
- Mixed Conditional (Type 3 + Type 2): If + S + had + P2 (past condition), S + would + V_inf (present result).

2. Subjunctive Mood with Suggest / Demand / Insist:
- S + suggest / require / recommend + that + S + (should) + V_bare (bare infinitive).
Example: The teacher suggested that every student complete the revision paper.`);
    }
  };

  // Submit and call AI endpoint
  const handleGenerate = async () => {
    if (files.length === 0 && !documentText.trim()) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 tệp tài liệu (Word, PDF, Ảnh) hoặc dán nội dung văn bản đề cương.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentStep(1);
    setStepText('Đang quét và đọc dữ liệu từ tài liệu đính kèm (Word / PDF / Ảnh)...');

    try {
      // Step timer animations for realistic UX
      setTimeout(() => {
        setCurrentStep(2);
        setStepText('Gemini 3.7 Flash đang phân tích kiến thức trọng tâm & ma trận đề thi...');
      }, 1200);

      setTimeout(() => {
        setCurrentStep(3);
        setStepText('Đang tự động biên soạn câu hỏi trắc nghiệm, 4 đáp án A-B-C-D và lời giải chi tiết...');
      }, 2500);

      const userApiKey = localStorage.getItem('tnh_gvcn_gemini_api_key_v1') || '';
      const userModel = localStorage.getItem('tnh_gvcn_gemini_model_v1') || 'gemini-3-flash-preview';

      const response = await fetch('/api/gemini/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userApiKey,
          'x-gemini-model': userModel,
        },
        body: JSON.stringify({
          files: files.map((f) => ({
            name: f.name,
            mimeType: f.mimeType,
            base64Data: f.base64Data,
          })),
          documentText: documentText.trim(),
          subject,
          questionCount,
          durationMinutes,
          difficulty,
          customPrompt: customPrompt.trim(),
          className,
        }),
      });

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi lỗi: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        onExamGenerated({
          title: result.title || `Đề Khảo Sát ${subject} 12 - AI Tạo Từ Tư Liệu (${className})`,
          subject: (result.subject as OnlineExam['subject']) || subject,
          durationMinutes: Number(result.durationMinutes) || durationMinutes,
          description: result.description || `Đề thi trắc nghiệm khách quan được AI tổng hợp từ tài liệu học tập của lớp ${className}.`,
          questions: result.questions,
        });
      } else {
        throw new Error(result.error || 'Không nhận được câu hỏi hợp lệ từ AI.');
      }
    } catch (err: any) {
      console.error('AI Exam Generation Error:', err);
      setErrorMessage(err.message || 'Có lỗi xảy ra khi tạo đề thi bằng AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-blue-100">
                Trợ Lý Khảo Thí Thông Minh • Gemini 3.7 Flash
              </span>
              <span className="text-xs bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Đa phương thức (Multimodal)
              </span>
            </div>
            <h3 className="text-lg font-black text-white">
              Tải Tài Liệu (Word, PDF, Ảnh Chụp) & AI Tự Động Tạo Đề Thi
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-3xl">
              Hệ thống sử dụng AI đa phương thức để đọc hiểu tài liệu chuyên đề (Word .docx, PDF), hình ảnh chụp trang sách hoặc đề cương bài giảng; tự động trích xuất và sinh bộ câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) chuẩn GDPT 2018 kèm lời giải chi tiết.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Dropzone & Documents (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              1. Tải Lên Tài Liệu, Đề Cương Hoặc Ảnh Chụp
            </h4>
            <span className="text-xs text-slate-500">
              Đã tải: <strong className="text-blue-600">{files.length} tệp</strong>
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
              }
            }}
          />

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center -space-x-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shadow-sm border border-white dark:border-slate-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shadow-sm border border-white dark:border-slate-800">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shadow-sm border border-white dark:border-slate-800">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Kéo thả tệp hoặc nhấp vào đây để chọn tài liệu
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ Word (<strong>.docx, .doc</strong>), PDF (<strong>.pdf</strong>), Ảnh chụp (<strong>.png, .jpg, .webp</strong>), Text (<strong>.txt</strong>)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-600" /> Microsoft Word
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-red-100/80 text-red-800 dark:bg-red-950 dark:text-red-300 font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-red-600" /> Adobe PDF
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-emerald-600" /> Ảnh chụp đề thi
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Danh sách tệp tài liệu đã nạp ({files.length}):</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-red-600 hover:text-red-700 font-medium hover:underline text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa tất cả
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm group hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      {file.type === 'image' ? (
                        <div
                          onClick={() => setPreviewImage(file.previewUrl || null)}
                          className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 cursor-pointer relative group/img border border-slate-200 dark:border-slate-700"
                        >
                          <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      ) : file.type === 'pdf' ? (
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      ) : file.type === 'word' ? (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center flex-shrink-0">
                          <FileCode className="w-5 h-5" />
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatFileSize(file.size)} • {file.type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Xóa tệp này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Text & Outline Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                Nội dung văn bản đề cương / Ghi chú bài giảng bổ sung:
              </label>
              <span className="text-[11px] text-slate-400">
                {documentText.length > 0 ? `${documentText.length} ký tự` : 'Tùy chọn'}
              </span>
            </div>
            <textarea
              rows={4}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Dán nội dung lý thuyết, các công thức trọng tâm, tóm tắt bài giảng hoặc các câu hỏi cần AI biên soạn thành đề trắc nghiệm..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
            />
          </div>

          {/* Quick Preset Samples */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Nạp nhanh tài liệu mẫu chuẩn THPT (1-Click):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadSampleDocument('math')}
                className="p-2 text-left rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 transition-all text-xs font-medium text-blue-900 dark:text-blue-300"
              >
                📐 Toán: Tích phân & Oxyz
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('chemistry')}
                className="p-2 text-left rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 transition-all text-xs font-medium text-emerald-900 dark:text-emerald-300"
              >
                🧪 Hóa: Este - Lipit 12
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('physics')}
                className="p-2 text-left rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 transition-all text-xs font-medium text-indigo-900 dark:text-indigo-300"
              >
                ⚡ Lý: Mạch RLC & Sóng
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('english')}
                className="p-2 text-left rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/70 transition-all text-xs font-medium text-purple-900 dark:text-purple-300"
              >
                🇬🇧 Tiếng Anh: Reading 12
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Generation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            2. Cấu Hình & Tiêu Chuẩn Đề Thi AI
          </h4>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 space-y-4 shadow-sm">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Môn Học Trắc Nghiệm <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Toán">Toán Học (Khối 12)</option>
                <option value="Vật Lý">Vật Lý (Khối 12)</option>
                <option value="Hóa Học">Hóa Học (Khối 12)</option>
                <option value="Sinh Học">Sinh Học (Khối 12)</option>
                <option value="Ngữ Văn">Ngữ Văn (Khối 12)</option>
                <option value="Tiếng Anh">Tiếng Anh (Khối 12)</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số Lượng Câu Hỏi Trắc Nghiệm:
                </label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {questionCount} Câu ({(10 / questionCount).toFixed(2)} đ/câu)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} Câu
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thời Gian Làm Bài (Phút)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 45, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      durationMinutes === dur
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {dur} Phút
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Matrix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ma Trận Phân Bố Độ Khó
              </label>
              <div className="space-y-1.5">
                <label
                  onClick={() => setDifficulty('balanced')}
                  className={`flex items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                    difficulty === 'balanced'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === 'balanced'}
                    onChange={() => setDifficulty('balanced')}
                    className="mt-0.5 text-blue-600 mr-2"
                  />
                  <div>
                    <p className="text-xs font-bold">🎯 Chuẩn THPT (Cân đối 4 mức độ)</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDifficulty('advanced')}
                  className={`flex items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                    difficulty === 'advanced'
                      ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === 'advanced'}
                    onChange={() => setDifficulty('advanced')}
                    className="mt-0.5 text-purple-600 mr-2"
                  />
                  <div>
                    <p className="text-xs font-bold">🚀 Nâng cao & Phân loại điểm 8+</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tập trung 60% Vận dụng và Vận dụng cao, các dạng bài bẫy tư duy.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDifficulty('basic')}
                  className={`flex items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                    difficulty === 'basic'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === 'basic'}
                    onChange={() => setDifficulty('basic')}
                    className="mt-0.5 text-emerald-600 mr-2"
                  />
                  <div>
                    <p className="text-xs font-bold">📘 Nền tảng & Củng cố lý thuyết</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      70% Nhận biết và Thông hiểu, rèn luyện phản xạ công thức.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Prompt / Special Pedagogical Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yêu Cầu Sư Phạm Bổ Sung (Prompting)
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Bám sát câu hỏi trong ảnh chụp trang 2; Kèm lời giải chi tiết từng bước cho từng phương án; Thêm mẹo giải nhanh casio..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                isGenerating
                  ? 'bg-slate-400 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.99] shadow-blue-500/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang Khởi Tạo Đề Thi Với Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>AI Bắt Đầu Đọc Tài Liệu & Tạo {questionCount} Câu Trắc Nghiệm</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generation Progress Indicator Overlay */}
      {isGenerating && (
        <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-slate-900 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-spin">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Hệ Thống AI Đang Xử Lý & Biên Soạn Đề Thi
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  {stepText}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              Bước {currentStep}/3
            </span>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                currentStep >= 1
                  ? 'border-blue-500 bg-white dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 1 ? 'text-blue-600' : 'text-slate-300'}`} />
              <span>1. Đọc file tài liệu/ảnh</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                currentStep >= 2
                  ? 'border-indigo-500 bg-white dark:bg-slate-800 font-bold text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>2. Phân tích ma trận</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                currentStep >= 3
                  ? 'border-purple-500 bg-white dark:bg-slate-800 font-bold text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 3 ? 'text-purple-600' : 'text-slate-300'}`} />
              <span>3. Biên soạn câu hỏi & lời giải</span>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Xem Trước Ảnh Tư Liệu Đề Thi
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-xl p-2">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
