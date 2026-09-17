import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold border border-rose-500/30">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Đã Xảy Ra Lỗi Khởi Chạy</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống phát hiện lỗi dữ liệu bộ nhớ tạm trên trình duyệt. Vui lòng nhấn bên dưới để tự động làm sạch và khởi chạy lại.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32 border border-slate-800">
                {this.state.error.toString()}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Đặt Lại Bộ Nhớ Tạm & Tải Lại Trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
