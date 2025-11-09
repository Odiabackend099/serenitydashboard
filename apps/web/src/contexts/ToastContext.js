import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const showToast = useCallback((type, message, duration = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const toast = { id, type, message, duration };
        setToasts(prev => [...prev, toast]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);
    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircle, { className: "w-5 h-5" });
            case 'error':
                return _jsx(AlertCircle, { className: "w-5 h-5" });
            case 'warning':
                return _jsx(AlertTriangle, { className: "w-5 h-5" });
            case 'info':
                return _jsx(Info, { className: "w-5 h-5" });
        }
    };
    const getColors = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
        }
    };
    return (_jsxs(ToastContext.Provider, { value: { showToast }, children: [children, _jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-none", children: toasts.map(toast => (_jsxs("div", { className: `
              flex items-start gap-3 p-4 rounded-lg border shadow-lg
              ${getColors(toast.type)}
              animate-slideInFromRight pointer-events-auto
            `, children: [getIcon(toast.type), _jsx("p", { className: "flex-1 text-sm font-medium", children: toast.message }), _jsx("button", { onClick: () => removeToast(toast.id), className: "flex-shrink-0 hover:opacity-70 transition", "aria-label": "Close notification", children: _jsx(X, { className: "w-4 h-4" }) })] }, toast.id))) })] }));
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
