import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import {
  GEMINI_MODELS,
  getStoredGeminiApiKey,
  saveStoredGeminiApiKey,
  getStoredGeminiModel,
  saveStoredGeminiModel,
} from '../utils/geminiApiKeyManager';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  isRequired?: boolean;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  isRequired = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiApiKey());
      setSelectedModel(getStoredGeminiModel());
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập API Key trước khi lưu!');
      return;
    }

    saveStoredGeminiApiKey(apiKey);
    saveStoredGeminiModel(selectedModel);
    setTestStatus('success');
    setTestMessage('Đã lưu cấu hình API Key & Model Gemini thành công!');

    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập API Key để kiểm tra!');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Đang kết nối thử nghiệm với Google Gemini API...');

    try {
      // Direct client-side fetch test to Google Gemini API
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello, respond with OK' }] }],
          }),
        }
      );

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('🎉 API Key hợp lệ và kết nối thành công với Google Gemini!');
      } else {
        const errorData = await res.json();
        const msg = errorData?.error?.message || `Lỗi kết nối (${res.status})`;
        setTestStatus('error');
        setTestMessage(`Không thể kết nối API Key: ${msg}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Lỗi mạng hoặc API Key không chính xác: ${err?.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Thiết Lập Model & Gemini API Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập key cá nhân để tự do sử dụng các tính năng AI không giới hạn
              </p>
            </div>
          </div>

          {!isRequired && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Instructions Red Link Card */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" />
              Lấy API Key Miễn Phí Từ Google AI Studio
            </span>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <span>Lấy API Key Ngay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
            Nhấp nút trên để truy cập <strong>aistudio.google.com/api-keys</strong>, tạo key miễn phí và dán vào ô bên dưới. Key của thầy/cô được bảo mật tuyệt đối và lưu trực tiếp trong trình duyệt cá nhân.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Gemini API Key Trình Duyệt:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán mã AIzaSy... vào đây"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Cards Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Chọn Model AI Ưu Tiên (Cards):
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {GEMINI_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-400/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="geminiModel"
                          checked={isSelected}
                          onChange={() => setSelectedModel(m.id)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                        {m.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-amber-400 text-slate-950">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 leading-snug">
                        {m.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      {m.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test status banner */}
          {testMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-blue-600 shrink-0 animate-bounce" />
              )}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestKey}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Kiểm Tra Kết Nối Key</span>
            </button>

            <div className="flex items-center gap-2">
              {!isRequired && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>Lưu API Key & Model</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
