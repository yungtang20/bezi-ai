import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: 'chunk_load' | 'runtime' | null;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorType: null,
      errorMessage: '',
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    const message = error.message || '';
    const isChunkLoadFail = 
      message.includes('Failed to fetch') || 
      message.includes('dynamically imported') || 
      message.includes('loading chunk') || 
      message.includes('Loading CSS chunk');

    return {
      hasError: true,
      errorType: isChunkLoadFail ? 'chunk_load' : 'runtime',
      errorMessage: message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zen-bg text-zen-text flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zen-card border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-zen-accent/10 text-zen-accent rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-white">
                {this.state.errorType === 'chunk_load' ? '系統檢測到版本更新' : '系統暫時出現異常'}
              </h1>
              <p className="text-sm text-zinc-400">
                {this.state.errorType === 'chunk_load' 
                  ? '為了載入最新的系統功能與排盤特性，請重新整理頁面。' 
                  : '排盤模組或介面元件載入時遭遇問題，您可以嘗試重新整理或重設快取。'}
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-left max-h-32 overflow-y-auto hidden-scrollbar">
                <code className="text-xs text-rose-300 font-mono break-all leading-normal">
                  {this.state.errorMessage}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-5 rounded-xl bg-zen-text text-zen-bg text-sm font-bold hover:opacity-90 transition-opacity"
              >
                重新整理頁面
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium hover:text-white hover:bg-white/10 transition-colors"
                title="清除瀏覽快取與設定值，回復預設狀態"
              >
                清除快取重置
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
