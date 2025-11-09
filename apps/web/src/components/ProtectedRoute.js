import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export default function ProtectedRoute({ children }) {
    const { user, profile, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-900", children: _jsxs("div", { className: "text-white text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" }), _jsx("p", { children: "Loading..." })] }) }));
    }
    if (!user || !profile) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (!profile.active) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-900", children: _jsxs("div", { className: "max-w-md bg-white rounded-lg shadow-xl p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-red-600 mb-4", children: "Account Deactivated" }), _jsx("p", { className: "text-gray-700", children: "Your account has been deactivated. Please contact an administrator for assistance." })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
