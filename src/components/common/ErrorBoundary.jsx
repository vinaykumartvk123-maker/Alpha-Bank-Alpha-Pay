import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            An unexpected error occurred in this section. Your data is safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-amber-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
