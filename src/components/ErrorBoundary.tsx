import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
          <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-lg dark:border-rose-900 dark:bg-slate-900">
            <h2 className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              Có lỗi hiển thị xảy ra
            </h2>
            <p className="mt-2 break-words text-xs text-slate-600 dark:text-slate-300">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
