import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white p-4">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-black/50 p-6 rounded-lg border border-red-500/30 max-w-2xl w-full overflow-auto">
                        <p className="text-red-300 font-mono text-sm mb-2">{this.state.error?.message}</p>
                        <pre className="text-xs text-zinc-500">{this.state.error?.stack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                        Go Back Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
