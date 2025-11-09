import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { logger } from '../lib/logger';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        logger.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-900", children: _jsxs("div", { className: "max-w-md bg-white rounded-lg shadow-xl p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-red-600 mb-4", children: "Something went wrong" }), _jsx("p", { className: "text-gray-700 mb-4", children: this.state.error?.message || 'An unexpected error occurred' }), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Reload Page" }), _jsxs("details", { className: "mt-4 text-left", children: [_jsx("summary", { className: "cursor-pointer text-sm text-gray-600", children: "Error Details" }), _jsx("pre", { className: "mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40", children: this.state.error?.stack })] })] }) }));
        }
        return this.props.children;
    }
}
