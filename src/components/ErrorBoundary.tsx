import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare state: State;
  declare props: Props;
  declare setState: (state: State | Partial<State>, callback?: () => void) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-2">Oops! Something went wrong</h2>
              <p className="text-slate-400 text-center mb-4 text-sm">
                Our team has been notified. Try refreshing the page or going back home.
              </p>
              
              {this.state.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 max-h-24 overflow-y-auto text-xs text-red-200/70 font-mono">
                  {this.state.error.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Go Home
                </button>
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-white/10 text-white font-bold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
