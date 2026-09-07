import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  BookOpen,
  Save,
  Clock,
  Award,
  AlertCircle,
  Copy,
  Layers,
  ArrowRight,
  Upload,
  Zap,
} from 'lucide-react';
import { OnlineExam, OnlineExamQuestion, ClassInfo, TeacherInfo } from '../types';
import { AIDocumentExamGenerator } from './AIDocumentExamGenerator';

interface OnlineExamCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (exam: OnlineExam) => void;
  editingExam?: OnlineExam | null;
  initialExam?: OnlineExam | null;
  classInfo?: ClassInfo;
  teacherInfo?: TeacherInfo;
}

export const OnlineExamCreatorModal: React.FC<OnlineExamCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaveExam,
  editingExam: propEditingExam,
  initialExam,
  classInfo = {
    className: '12A1',
    schoolYear: '2025 - 2026',
    schoolName: 'THPT Trần Nguyên Hãn',
    homeroomTeacher: 'Nguyễn Văn Cừ',
    totalStudents: 35,
    groupCount: 4,
  },
  teacherInfo = {
    name: 'ThS. Nguyễn Văn Cừ',
    subject: 'Toán Học',
    phone: '0912.345.678',
    email: 'nguyenvancu.gvcn@thpt-trannguyenhan.edu.vn',
  },
}) => {
  const editingExam = propEditingExam || initialExam;
  const [activeTab, setActiveTab] = useState<'ai_generator' | 'builder' | 'quick_paste' | 'preset_bank'>('ai_generator');

  // Exam Meta Information
  const [title, setTitle] = useState(editingExam?.title || '');
  const [subject, setSubject] = useState<OnlineExam['subject']>(editingExam?.subject || 'Toán');
  const [durationMinutes, setDurationMinutes] = useState<number>(editingExam?.durationMinutes || 45);
  const [description, setDescription] = useState(editingExam?.description || '');
  const [targetGroup, setTargetGroup] = useState<OnlineExam['targetGroup']>(editingExam?.targetGroup || 'all');
  const [deadline, setDeadline] = useState(editingExam?.deadline || '2026-09-10 23:59');
  const [allowReviewAnswers, setAllowReviewAnswers] = useState<boolean>(
    editingExam ? editingExam.allowReviewAnswers : true
  );
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    editingExam ? !!editingExam.shuffleQuestions : false
  );

  // AI Notice State
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Question List State
  const [questions, setQuestions] = useState<OnlineExamQuestion[]>(
    editingExam?.questions || [
      {
        id: `q-${Date.now()}-1`,
        questionText: 'Cho hàm số f(x) liên tục trên R. Mệnh đề nào sau đây đúng?',
        options: [
          { key: 'A', text: '∫ f(x)dx = F(x) + C với F\'(x) = f(x)' },
          { key: 'B', text: '∫ f(x)dx = f\'(x) + C' },
          { key: 'C', text: '∫ f(x)dx = F\'(x) + C' },
          { key: 'D', text: '∫ f(x)dx = f(x) + C' },
        ],
        correctAnswer: 'A',
        explanation: 'Theo định nghĩa nguyên hàm, F(x) là nguyên hàm của f(x) nếu F\'(x) = f(x).',
        points: 1.0,
      },
    ]
  );

  // Quick text parser state
  const [quickText, setQuickText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessCount, setParseSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Add new blank question
  const handleAddQuestion = () => {
    const newQ: OnlineExamQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      questionText: `Câu hỏi số ${questions.length + 1}: `,
      options: [
        { key: 'A', text: 'Phương án A' },
        { key: 'B', text: 'Phương án B' },
        { key: 'C', text: 'Phương án C' },
        { key: 'D', text: 'Phương án D' },
      ],
      correctAnswer: 'A',
      explanation: '',
      points: 1.0,
    };
    setQuestions([...questions, newQ]);
  };

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Duplicate question
  const handleDuplicateQuestion = (index: number) => {
    const source = questions[index];
    const copy: OnlineExamQuestion = {
      ...source,
      id: `q-${Date.now()}-${Math.random()}`,
      questionText: `${source.questionText} (Bản sao)`,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, copy);
    setQuestions(updated);
  };

  // Update question field
  const handleUpdateQuestion = (index: number, field: keyof OnlineExamQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  // Update option text
  const handleUpdateOption = (qIndex: number, optKey: 'A' | 'B' | 'C' | 'D', text: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    q.options = q.options.map((opt) => (opt.key === optKey ? { ...opt, text } : opt));
    setQuestions(updated);
  };

  // Auto balance points to total 10.0
  const handleDistributePoints = () => {
    if (questions.length === 0) return;
    const pt = +(10 / questions.length).toFixed(2);
    setQuestions(
      questions.map((q) => ({
        ...q,
        points: pt,
      }))
    );
  };

  // Parse plain text format into questions
  const handleParseQuickText = () => {
    setParseError(null);
    setParseSuccessCount(null);
    if (!quickText.trim()) {
      setParseError('Vui lòng dán văn bản câu hỏi vào khung bên dưới.');
      return;
    }

    try {
      // Split by "Câu" or numbered blocks
      const rawBlocks = quickText.split(/(?=(?:Câu\s*\d+|Bài\s*\d+|\b\d+\.|\b\d+\:)\s*)/i).filter((b) => b.trim());
      if (rawBlocks.length === 0) {
        throw new Error('Không nhận diện được cấu trúc câu hỏi. Hãy bắt đầu bằng "Câu 1:", "Câu 2:"...');
      }

      const parsed: OnlineExamQuestion[] = [];

      rawBlocks.forEach((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        let qText = '';
        const optionsMap: Record<string, string> = { A: '', B: '', C: '', D: '' };
        let correct: 'A' | 'B' | 'C' | 'D' = 'A';
        let explanation = '';

        // Extract lines
        let readingSection: 'text' | 'options' | 'explanation' = 'text';

        lines.forEach((line) => {
          // Check for correct answer line: "Đáp án: A" or "Đáp án đúng: B" or "Key: C"
          const ansMatch = line.match(/(?:Đáp\s*án|Key|Answer|Chọn|ĐA)\s*(?:\:|\-|\=)?\s*([A-D])/i);
          if (ansMatch) {
            correct = ansMatch[1].toUpperCase() as any;
            return;
          }

          // Check for explanation line: "Giải thích: ..." or "Lời giải: ..." or "HD:"
          const expMatch = line.match(/(?:Giải\s*thích|Lời\s*giải|Hướng\s*dẫn|HD)\s*(?:\:|\-)?\s*(.*)/i);
          if (expMatch) {
            explanation = expMatch[1] || '';
            readingSection = 'explanation';
            return;
          }

          if (readingSection === 'explanation') {
            explanation += ' ' + line;
            return;
          }

          // Check for options: "A. text" or "A) text" or "A/ text"
          const optMatch = line.match(/^([A-D])[\.\)\/\:\-]\s*(.*)$/i);
          if (optMatch) {
            const k = optMatch[1].toUpperCase();
            optionsMap[k] = optMatch[2] || '';
            readingSection = 'options';
            return;
          }

          // Also check for multiple options in one single line (e.g., "A. 2   B. 4   C. 6   D. 8")
          const multiOptMatch = line.match(/A[\.\)]\s*(.*?)\s+B[\.\)]\s*(.*?)\s+C[\.\)]\s*(.*?)\s+D[\.\)]\s*(.*)/i);
          if (multiOptMatch) {
            optionsMap.A = multiOptMatch[1];
            optionsMap.B = multiOptMatch[2];
            optionsMap.C = multiOptMatch[3];
            optionsMap.D = multiOptMatch[4];
            readingSection = 'options';
            return;
          }

          // Otherwise, it is question text
          if (readingSection === 'text') {
            // Strip leading "Câu 1:" prefix
            const cleanLine = line.replace(/^(?:Câu\s*\d+|Bài\s*\d+|\b\d+[\.\:])\s*(?:\:|\-)?\s*/i, '');
            qText += (qText ? ' ' : '') + cleanLine;
          }
        });

        if (!qText) qText = `Câu hỏi trắc nghiệm số ${idx + 1}`;

        parsed.push({
          id: `q-quick-${Date.now()}-${idx + 1}`,
          questionText: qText,
          options: [
            { key: 'A', text: optionsMap.A || 'Phương án A' },
            { key: 'B', text: optionsMap.B || 'Phương án B' },
            { key: 'C', text: optionsMap.C || 'Phương án C' },
            { key: 'D', text: optionsMap.D || 'Phương án D' },
          ],
          correctAnswer: correct,
          explanation: explanation.trim() || 'Áp dụng công thức và kiến thức lý thuyết trọng tâm.',
          points: +(10 / rawBlocks.length).toFixed(2) || 1.0,
        });
      });

      if (parsed.length === 0) {
        throw new Error('Không phân tích được câu hỏi nào từ văn bản.');
      }

      setQuestions(parsed);
      setParseSuccessCount(parsed.length);
      setTimeout(() => {
        setActiveTab('builder');
      }, 800);
    } catch (err: any) {
      setParseError(err.message || 'Lỗi phân tích văn bản. Vui lòng kiểm tra định dạng.');
    }
  };

  // Sample templates bank
  const loadPresetTemplate = (type: 'math' | 'physics' | 'chemistry' | 'english') => {
    if (type === 'math') {
      setTitle('Đề Ôn Tập Trọng Tâm Giải Tích & Hình Không Gian Oxyz');
      setSubject('Toán');
      setDurationMinutes(45);
      setDescription('Hệ thống câu hỏi trắc nghiệm chuẩn cấu trúc đề thi THPT Quốc gia môn Toán.');
      setQuestions([
        {
          id: `q-p-${Date.now()}-1`,
          questionText: 'Tính tích phân I = ∫[0 đến π/2] sin(x) dx:',
          options: [
            { key: 'A', text: '1' },
            { key: 'B', text: '0' },
            { key: 'C', text: '-1' },
            { key: 'D', text: 'π/2' },
          ],
          correctAnswer: 'A',
          explanation: 'I = -cos(x)|[0->π/2] = -cos(π/2) - (-cos(0)) = 0 + 1 = 1.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-2`,
          questionText: 'Trong không gian Oxyz, phương trình mặt phẳng đi qua gốc tọa độ O và có VTPT n = (1; 2; -3) là:',
          options: [
            { key: 'A', text: 'x + 2y - 3z = 0' },
            { key: 'B', text: 'x + 2y - 3z + 1 = 0' },
            { key: 'C', text: 'x - 2y + 3z = 0' },
            { key: 'D', text: 'x + 2y + 3z = 0' },
          ],
          correctAnswer: 'A',
          explanation: 'Mặt phẳng đi qua O(0;0;0) và nhận n=(1;2;-3) làm VTPT có pt: 1(x-0) + 2(y-0) - 3(z-0) = 0 <=> x + 2y - 3z = 0.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-3`,
          questionText: 'Môđun của số phức z = (1 + 2i)(2 - i) là:',
          options: [
            { key: 'A', text: '5' },
            { key: 'B', text: '25' },
            { key: 'C', text: '√5' },
            { key: 'D', text: '10' },
          ],
          correctAnswer: 'A',
          explanation: '|z| = |1+2i| * |2-i| = √(1²+2²) * √(2²+(-1)²) = √5 * √5 = 5.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-4`,
          questionText: 'Cho hàm số y = f(x) có bảng biến thiên với f\'(x) đổi dấu từ dương sang âm tại x = 2. Điểm cực đại của đồ thị hàm số là:',
          options: [
            { key: 'A', text: 'x = 2' },
            { key: 'B', text: 'x = -2' },
            { key: 'C', text: 'y = 2' },
            { key: 'D', text: 'x = 0' },
          ],
          correctAnswer: 'A',
          explanation: 'Đạo hàm f\'(x) đổi dấu từ dương sang âm khi qua x = 2 nên hàm số đạt cực đại tại điểm x = 2.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-5`,
          questionText: 'Trong không gian Oxyz, khoảng cách giữa hai mặt phẳng song song (P): 2x - y + 2z - 6 = 0 và (Q): 2x - y + 2z + 3 = 0 là:',
          options: [
            { key: 'A', text: '3' },
            { key: 'B', text: '1' },
            { key: 'C', text: '9' },
            { key: 'D', text: '2' },
          ],
          correctAnswer: 'A',
          explanation: 'd(P, Q) = |D1 - D2| / √(A²+B²+C²) = |-6 - 3| / √(2² + (-1)² + 2²) = 9 / 3 = 3.',
          points: 2.0,
        },
      ]);
    } else if (type === 'physics') {
      setTitle('Kiểm Tra Trực Tuyến Vật Lý 12 - Sóng Ánh Sáng & Lượng Tử');
      setSubject('Vật Lý');
      setDurationMinutes(30);
      setDescription('Bộ 5 câu trắc nghiệm chuyên đề giao thoa ánh sáng và hiện tượng quang điện ngoài.');
      setQuestions([
        {
          id: `q-p-${Date.now()}-1`,
          questionText: 'Trong thí nghiệm Y-âng về giao thoa ánh sáng, khoảng vân i được tính bằng công thức:',
          options: [
            { key: 'A', text: 'i = λD / a' },
            { key: 'B', text: 'i = λa / D' },
            { key: 'C', text: 'i = aD / λ' },
            { key: 'D', text: 'i = λ / (aD)' },
          ],
          correctAnswer: 'A',
          explanation: 'Khoảng cách giữa hai vân sáng liên tiếp i = λD / a.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-2`,
          questionText: 'Hiện tượng quang điện ngoài là hiện tượng êlectron bứt ra khỏi bề mặt kim loại khi:',
          options: [
            { key: 'A', text: 'Chiếu vào kim loại ánh sáng có bước sóng thích hợp (λ ≤ λ0)' },
            { key: 'B', text: 'Đốt nóng kim loại đến nhiệt độ cao' },
            { key: 'C', text: 'Kim loại bị nhiễm điện do cọ xát' },
            { key: 'D', text: 'Cho dòng điện cường độ lớn chạy qua tấm kim loại' },
          ],
          correctAnswer: 'A',
          explanation: 'Theo định luật quang điện thứ nhất, ánh sáng kích thích phải có bước sóng nhỏ hơn hoặc bằng giới hạn quang điện λ0 của kim loại.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-3`,
          questionText: 'Quang phổ liên tục được phát ra bởi:',
          options: [
            { key: 'A', text: 'Các chất rắn, chất lỏng hoặc chất khí có áp suất lớn khi bị nung nóng' },
            { key: 'B', text: 'Các chất khí ở áp suất thấp khi bị kích thích phát sáng' },
            { key: 'C', text: 'Mọi vật thể ở nhiệt độ phòng' },
            { key: 'D', text: 'Chỉ riêng kim loại nóng chảy' },
          ],
          correctAnswer: 'A',
          explanation: 'Quang phổ liên tục phụ thuộc duy nhất vào nhiệt độ của nguồn phát.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-4`,
          questionText: 'Tia laze có đặc điểm nổi bật nào sau đây?',
          options: [
            { key: 'A', text: 'Tính đơn sắc cao, tính định hướng cao và cường độ lớn' },
            { key: 'B', text: 'Khả năng đâm xuyên mạnh qua chì dày 10cm' },
            { key: 'C', text: 'Là chùm hạt mang điện tích dương' },
            { key: 'D', text: 'Có thể bị lệch trong từ trường mạnh' },
          ],
          correctAnswer: 'A',
          explanation: 'Tia laze là nguồn sáng phát xạ cảm ứng có độ đơn sắc cao, độ kết hợp cao, định hướng cao và công suất lớn.',
          points: 2.0,
        },
        {
          id: `q-p-${Date.now()}-5`,
          questionText: 'Năng lượng của một phôtôn ánh sáng có bước sóng λ được xác định theo hệ thức:',
          options: [
            { key: 'A', text: 'ε = hc / λ' },
            { key: 'B', text: 'ε = hλ / c' },
            { key: 'C', text: 'ε = c / (hλ)' },
            { key: 'D', text: 'ε = h / (cλ)' },
          ],
          correctAnswer: 'A',
          explanation: 'Theo giả thuyết lượng tử Plăng: ε = hf = hc / λ.',
          points: 2.0,
        },
      ]);
    } else if (type === 'chemistry') {
      setTitle('Trắc Nghiệm Hóa Học 12 - Đại Cương Kim Loại & Hợp Chất');
      setSubject('Hóa Học');
      setDurationMinutes(30);
      setDescription('Đề luyện tập phản ứng oxi hóa khử và chuỗi phản ứng kim loại kiềm, kiềm thổ, nhôm.');
      setQuestions([
        {
          id: `q-p-${Date.now()}-1`,
          questionText: 'Kim loại có độ dẫn điện tốt nhất trong tất cả các kim loại là:',
          options: [
            { key: 'A', text: 'Bạc (Ag)' },
            { key: 'B', text: 'Đồng (Cu)' },
            { key: 'C', text: 'Vàng (Au)' },
            { key: 'D', text: 'Nhôm (Al)' },
          ],
          correctAnswer: 'A',
          explanation: 'Thứ tự dẫn điện giảm dần: Ag > Cu > Au > Al > Fe.',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-2`,
          questionText: 'Dung dịch nào sau đây không hòa tan được Al(OH)3?',
          options: [
            { key: 'A', text: 'Dung dịch NH3' },
            { key: 'B', text: 'Dung dịch NaOH' },
            { key: 'C', text: 'Dung dịch HCl' },
            { key: 'D', text: 'Dung dịch H2SO4' },
          ],
          correctAnswer: 'A',
          explanation: 'Al(OH)3 là hiđroxit lưỡng tính chỉ tan trong axit mạnh và bazơ mạnh (kiềm), không tan trong dung dịch bazơ yếu như NH3.',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-3`,
          questionText: 'Kim loại nào sau đây được điều chế bằng phương pháp nhiệt luyện với chất khử CO?',
          options: [
            { key: 'A', text: 'Sắt (Fe)' },
            { key: 'B', text: 'Natri (Na)' },
            { key: 'C', text: 'Nhôm (Al)' },
            { key: 'D', text: 'Magie (Mg)' },
          ],
          correctAnswer: 'A',
          explanation: 'Nhiệt luyện chỉ dùng để điều chế các kim loại đứng sau Al trong dãy hoạt động hóa học (Fe, Cu, Zn, Pb...).',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-4`,
          questionText: 'Chất làm mềm nước cứng có tính cứng vĩnh cửu là:',
          options: [
            { key: 'A', text: 'Na2CO3 hoặc Na3PO4' },
            { key: 'B', text: 'Ca(OH)2 vừa đủ' },
            { key: 'C', text: 'Đun sôi nước' },
            { key: 'D', text: 'Dung dịch NaCl' },
          ],
          correctAnswer: 'A',
          explanation: 'Na2CO3 và Na3PO4 tạo kết tủa CaCO3, MgCO3, Ca3(PO4)2 loại bỏ hoàn toàn Ca2+, Mg2+ trong nước cứng vĩnh cửu.',
          points: 2.5,
        },
      ]);
    } else {
      setTitle('Trắc Nghiệm Tiếng Anh 12 - Reading & Language Focus');
      setSubject('Tiếng Anh');
      setDurationMinutes(25);
      setDescription('Đề kiểm tra ngữ pháp câu điều kiện, mệnh đề quan hệ và ngữ âm.');
      setQuestions([
        {
          id: `q-p-${Date.now()}-1`,
          questionText: 'If we had known your arrival time, we _______ you at the airport.',
          options: [
            { key: 'A', text: 'would have met' },
            { key: 'B', text: 'will meet' },
            { key: 'C', text: 'would meet' },
            { key: 'D', text: 'had met' },
          ],
          correctAnswer: 'A',
          explanation: 'Conditional Type 3: If + S + had + P2, S + would/could + have + P2.',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-2`,
          questionText: 'The scientist _______ discovered the new compound received the Nobel Prize.',
          options: [
            { key: 'A', text: 'who' },
            { key: 'B', text: 'which' },
            { key: 'C', text: 'whom' },
            { key: 'D', text: 'whose' },
          ],
          correctAnswer: 'A',
          explanation: '"The scientist" là danh từ chỉ người làm chủ ngữ của mệnh đề quan hệ => dùng đại từ quan hệ "who".',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-3`,
          questionText: 'Mark the word whose underlined part differs from the other three in pronunciation:',
          options: [
            { key: 'A', text: 'polluted (/id/)' },
            { key: 'B', text: 'worked (/t/)' },
            { key: 'C', text: 'stopped (/t/)' },
            { key: 'D', text: 'laughed (/t/)' },
          ],
          correctAnswer: 'A',
          explanation: '"polluted" có đuôi -ed phát âm là /id/ (do tận cùng bằng âm /t/), các từ còn lại phát âm là /t/.',
          points: 2.5,
        },
        {
          id: `q-p-${Date.now()}-4`,
          questionText: 'Renewable energy sources are _______ because they do not emit greenhouse gases.',
          options: [
            { key: 'A', text: 'environmentally friendly' },
            { key: 'B', text: 'environmental friendly' },
            { key: 'C', text: 'friendly environmental' },
            { key: 'D', text: 'friendly environment' },
          ],
          correctAnswer: 'A',
          explanation: 'Trạng từ "environmentally" bổ nghĩa cho tính từ ghép "friendly" => "environmentally friendly" (thân thiện với môi trường).',
          points: 2.5,
        },
      ]);
    }
    setActiveTab('builder');
  };

  // Submit and save exam
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên đề thi.');
      return;
    }
    if (questions.length === 0) {
      alert('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }

    const newExam: OnlineExam = {
      id: editingExam?.id || `exam-${Date.now()}`,
      title: title.trim(),
      subject,
      durationMinutes: Number(durationMinutes) || 45,
      totalScore: 10,
      description: description.trim() || `Đề thi trắc nghiệm môn ${subject} - Lớp ${classInfo?.className || '12A1'}`,
      targetGroup,
      status: editingExam?.status || 'published',
      createdBy: editingExam?.createdBy || teacherInfo?.name || 'GVCN Lớp',
      createdAt: editingExam?.createdAt || new Date().toISOString().split('T')[0],
      deadline,
      questions,
      allowReviewAnswers,
      shuffleQuestions,
    };

    onSaveExam(newExam);
    onClose();
  };

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingExam ? 'Chỉnh Sửa Đề Thi Trắc Nghiệm Online' : 'Tạo Đề Thi Trắc Nghiệm Online Mới'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/25 font-normal text-white">
                  {classInfo?.className || 'Lớp 12A1'}
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Hệ thống kiểm tra trực tuyến, tự động chấm điểm tức thì & thống kê phổ điểm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai_generator')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ai_generator'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Tải Tài Liệu & AI Tạo Đề (Word / PDF / Ảnh)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-black uppercase tracking-wider shadow-xs">
              AI Gemini
            </span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'builder'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Soạn Trực Quan ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('quick_paste')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'quick_paste'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            Nhập Nhanh Văn Bản (Parser)
          </button>
          <button
            onClick={() => setActiveTab('preset_bank')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'preset_bank'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Kho Đề Mẫu KHTN Chuẩn
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: AI DOCUMENT & IMAGE EXAM GENERATOR */}
          {activeTab === 'ai_generator' && (
            <AIDocumentExamGenerator
              currentSubject={subject}
              className={classInfo?.className || '12A1'}
              onExamGenerated={(data) => {
                setTitle(data.title);
                setSubject(data.subject);
                setDurationMinutes(data.durationMinutes);
                setDescription(data.description);
                setQuestions(data.questions);
                setAiNotice(`✨ AI Gemini 3.7 Flash đã phân tích tài liệu và biên soạn thành công ${data.questions.length} câu hỏi trắc nghiệm! Bạn có thể kiểm tra hoặc chỉnh sửa trước khi xuất bản.`);
                setActiveTab('builder');
              }}
            />
          )}

          {/* Section 1: General Exam Settings (Shown for builder, quick_paste, preset_bank) */}
          {activeTab !== 'ai_generator' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                1. Thông Tin & Thiết Lập Đề Thi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Đề Thi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Khảo Sát Năng Lực Toán 12 - Tích Phân & Oxyz"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Môn Học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Toán">Toán Học</option>
                    <option value="Vật Lý">Vật Lý</option>
                    <option value="Hóa Học">Hóa Học</option>
                    <option value="Sinh Học">Sinh Học</option>
                    <option value="Ngữ Văn">Ngữ Văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời Gian Làm Bài (Phút)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hạn Chót Nộp Bài
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="2026-09-05 23:59"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân Tổ Áp Dụng
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) =>
                      setTargetGroup(e.target.value === 'all' ? 'all' : (Number(e.target.value) as any))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toàn Bộ Lớp (Cả 4 Tổ)</option>
                    <option value="1">Riêng Tổ 1</option>
                    <option value="2">Riêng Tổ 2</option>
                    <option value="3">Riêng Tổ 3</option>
                    <option value="4">Riêng Tổ 4</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mô Tả / Hướng Dẫn Làm Bài
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Đề kiểm tra định kỳ 45 phút, yêu cầu làm trung thực, không sử dụng tài liệu..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Toggles */}
                <div className="md:col-span-3 flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowReviewAnswers}
                      onChange={(e) => setAllowReviewAnswers(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Cho phép học sinh xem đáp án & lời giải chi tiết sau khi nộp bài</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Xáo trộn ngẫu nhiên thứ tự câu hỏi khi làm bài</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: INTERACTIVE BUILDER */}
          {activeTab === 'builder' && (
            <div className="space-y-4">
              {/* AI Generated Banner Notice */}
              {aiNotice && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Biên soạn hoàn tất từ tài liệu đính kèm!</p>
                      <p className="text-emerald-700 dark:text-emerald-300">{aiNotice}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiNotice(null)}
                    className="p-1 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. Danh Sách Câu Hỏi ({questions.length} câu)
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      Math.abs(totalPoints - 10) < 0.05
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Tổng điểm: {totalPoints.toFixed(1)} / 10.0
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai_generator')}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI Tạo Thêm Từ Tài Liệu
                  </button>
                  <button
                    type="button"
                    onClick={handleDistributePoints}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    ⚖️ Chia Đều Điểm Thang 10
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Câu Hỏi
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3 relative group transition-all hover:border-blue-400 dark:hover:border-blue-600"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {qIdx + 1}
                        </span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                            placeholder={`Nhập nội dung câu hỏi số ${qIdx + 1}...`}
                            className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-slate-500">Điểm:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={q.points}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'points', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-bold text-center rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(qIdx)}
                          title="Nhân bản câu hỏi"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          title="Xóa câu hỏi"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctAnswer === opt.key;
                        return (
                          <div
                            key={opt.key}
                            className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={isCorrect}
                                onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', opt.key)}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span
                                className={`ml-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {opt.key}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => handleUpdateOption(qIdx, opt.key, e.target.value)}
                              placeholder={`Phương án ${opt.key}...`}
                              className="flex-1 px-2.5 py-1 text-xs rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="pt-1 flex items-start space-x-2">
                      <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                        placeholder="Lời giải / Hướng dẫn giải chi tiết (hiển thị khi học sinh xem lại bài)..."
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 italic focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-6 py-2.5 text-sm font-semibold border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Câu Hỏi Số {questions.length + 1}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK TEXT PARSER */}
          {activeTab === 'quick_paste' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Hướng dẫn định dạng nhập đề nhanh từ văn bản:
                </div>
                <p>
                  Bạn có thể copy đề thi trắc nghiệm từ file Word, PDF hoặc prompt AI theo mẫu sau:
                </p>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800/40">
                  Câu 1: Hàm số nào sau đây đồng biến trên R?<br />
                  A. y = x³ + 2x<br />
                  B. y = x² + 1<br />
                  C. y = (x-1)/(x+2)<br />
                  D. y = -x³ + 4x<br />
                  Đáp án: A<br />
                  Giải thích: y' = 3x² + 2 &gt; 0 với mọi x thuộc R.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dán nội dung toàn bộ đề thi vào đây:
                </label>
                <textarea
                  rows={12}
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder={`Dán danh sách câu hỏi tại đây...\n\nCâu 1: ...\nA. ...\nB. ...\nC. ...\nD. ...\nĐáp án: A\nGiải thích: ...`}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {parseError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {parseError}
                </div>
              )}

              {parseSuccessCount !== null && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Phân tích thành công {parseSuccessCount} câu hỏi! Đang chuyển sang giao diện chỉnh sửa...
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setQuickText(`Câu 1: Cho hàm số y = f(x) có đạo hàm f'(x) = x(x-1)². Số điểm cực trị của hàm số là:
A. 1
B. 2
C. 3
D. 0
Đáp án: A
Giải thích: f'(x) đổi dấu khi qua nghiệm đơn x = 0, không đổi dấu khi qua nghiệm kép x = 1.

Câu 2: Trong không gian Oxyz, cho điểm M(2; -3; 5). Tọa độ hình chiếu của M lên trục Oz là:
A. (0; 0; 5)
B. (2; -3; 0)
C. (2; 0; 0)
D. (0; -3; 0)
Đáp án: A
Giải thích: Chiếu lên trục nào thì giữ nguyên tọa độ trục đó, các tọa độ còn lại bằng 0.

Câu 3: Họ nguyên hàm của hàm số f(x) = e^(2x) là:
A. (1/2)e^(2x) + C
B. 2e^(2x) + C
C. e^(2x) + C
D. (1/2)e^x + C
Đáp án: A
Giải thích: Áp dụng công thức ∫ e^(ax) dx = (1/a)e^(ax) + C với a = 2.`);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  📝 Dán Mẫu Đề Toán Thử Nghiệm
                </button>

                <button
                  type="button"
                  onClick={handleParseQuickText}
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Phân Tích & Tự Động Tạo Câu Hỏi
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRESET QUESTION BANK */}
          {activeTab === 'preset_bank' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn một trong các bộ đề mẫu chuẩn Khối Khoa Học Tự Nhiên để nạp sẵn nội dung câu hỏi và tinh chỉnh theo ý muốn:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Math Template */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Toán Học • 5 Câu
                      </span>
                      <span className="text-xs text-slate-400">45 Phút</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Đề Ôn Tập Trọng Tâm Giải Tích & Oxyz
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Tích phân từng phần, phương trình mặt phẳng Oxyz, số phức và cực trị hàm số.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('math')}
                    className="w-full py-2 text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Nạp Đề Mẫu Môn Toán
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Physics Template */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Vật Lý • 5 Câu
                      </span>
                      <span className="text-xs text-slate-400">30 Phút</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Kiểm Tra Sóng Ánh Sáng & Lượng Tử
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Giao thoa Y-âng, quang phổ liên tục, tia laze và hiện tượng quang điện ngoài.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('physics')}
                    className="w-full py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Nạp Đề Mẫu Môn Vật Lý
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chemistry Template */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Hóa Học • 4 Câu
                      </span>
                      <span className="text-xs text-slate-400">30 Phút</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Trắc Nghiệm Đại Cương Kim Loại & Hợp Chất
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Tính dẫn điện, nhiệt luyện, tính chất Al(OH)3 và làm mềm nước cứng vĩnh cửu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('chemistry')}
                    className="w-full py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Nạp Đề Mẫu Môn Hóa Học
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* English Template */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Tiếng Anh • 4 Câu
                      </span>
                      <span className="text-xs text-slate-400">25 Phút</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Reading & Language Focus Mastery
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      Câu điều kiện loại 3, mệnh đề quan hệ, phát âm đuôi -ed và collocation môi trường.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('english')}
                    className="w-full py-2 text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Nạp Đề Mẫu Môn Tiếng Anh
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Tổng số: <strong className="text-slate-800 dark:text-slate-200">{questions.length} câu</strong></span>
            <span>•</span>
            <span>Thời gian: <strong className="text-slate-800 dark:text-slate-200">{durationMinutes} phút</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              {editingExam ? 'Lưu Thay Đổi Đề Thi' : 'Xuất Bản & Mở Thi Trực Tuyến'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
