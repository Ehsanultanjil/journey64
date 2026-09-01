import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#111111] border border-red-500/30 p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-stone-400 mt-2 font-light font-mono">
                {this.state.error?.message || 'An unexpected error occurred while rendering.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#10B981]/25"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-stone-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset Local Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
