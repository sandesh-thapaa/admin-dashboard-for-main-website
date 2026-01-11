import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertCircle, RefreshCcw, Home, ChevronDown } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log this to an external service like Sentry later
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl shadow-slate-200/60 p-10 border border-slate-100 text-center">
            <div className="size-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-black text-[#102359] mb-3 uppercase tracking-tight">
              System Hiccup
            </h1>

            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Something unexpected happened while rendering this component.
              Don't worry, your progress is likely safe.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-[#3AE39E] text-[#102359] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#3AE39E]/20"
              >
                <RefreshCcw size={18} />
                RETRY ACTION
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-slate-50 text-[#102359] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
              >
                <Home size={18} />
                BACK TO DASHBOARD
              </button>
            </div>

            {this.state.error && (
              <details className="mt-8 text-left group">
                <summary className="cursor-pointer list-none flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                  <span>Technical Log</span>
                  <ChevronDown
                    size={14}
                    className="group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="mt-4 p-4 bg-slate-900 rounded-2xl overflow-x-auto">
                  <code className="text-[11px] text-pink-400 font-mono leading-normal">
                    {this.state.error.stack || this.state.error.toString()}
                  </code>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
