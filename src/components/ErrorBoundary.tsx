import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[VEXION AI Error Boundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] p-6 rounded-2xl bg-[#171717] border border-red-500/30 flex flex-col items-center justify-center text-center space-y-4 my-4">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'A temporary visual display issue occurred.'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1 leading-relaxed">
              VEXION AI has gracefully caught this exception to prevent any runtime crash. Your session data remains safe.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-red-300 mt-2 p-2 bg-black/40 rounded-lg max-w-sm mx-auto overflow-hidden text-ellipsis">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Workspace</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
