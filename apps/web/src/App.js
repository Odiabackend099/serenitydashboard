import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes, NavLink } from 'react-router-dom';
import { MessageSquare, Calendar, BarChart3, Bot, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Conversations from './pages/Conversations';
import CalendarPage from './pages/Calendar';
import AgentConfig from './pages/AgentConfig';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
function Dashboard() {
    const { profile, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "h-screen w-screen flex bg-healthcare-bg-primary dark:bg-healthcare-dark-bg-primary", children: [_jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors", "aria-label": "Toggle menu", children: sidebarOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) }), sidebarOpen && (_jsx("div", { className: "md:hidden fixed inset-0 bg-black bg-opacity-50 z-30", onClick: () => setSidebarOpen(false) })), _jsxs("aside", { className: `
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 dark:bg-healthcare-dark-bg-elevated text-white p-4 flex flex-col border-r border-gray-800 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `, children: [_jsxs("div", { className: "mb-6 flex items-center gap-3", children: [_jsx("img", { src: "/logo.png", alt: "Serenity Care", className: "w-12 h-12 rounded-lg shadow-md" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold text-white", children: "Serenity Care AI" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Admin Dashboard" })] })] }), _jsxs("nav", { className: "flex-1 flex flex-col gap-1", children: [_jsxs(NavLink, { to: "/", onClick: () => setSidebarOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'}`, children: [_jsx(MessageSquare, { className: "w-5 h-5" }), _jsx("span", { children: "Conversations" })] }), _jsxs(NavLink, { to: "/calendar", onClick: () => setSidebarOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'}`, children: [_jsx(Calendar, { className: "w-5 h-5" }), _jsx("span", { children: "Calendar" })] }), _jsxs(NavLink, { to: "/analytics", onClick: () => setSidebarOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'}`, children: [_jsx(BarChart3, { className: "w-5 h-5" }), _jsx("span", { children: "Analytics" })] }), _jsxs(NavLink, { to: "/agent", onClick: () => setSidebarOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'}`, children: [_jsx(Bot, { className: "w-5 h-5" }), _jsx("span", { children: "Agent Config" })] }), _jsxs(NavLink, { to: "/settings", onClick: () => setSidebarOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'}`, children: [_jsx(SettingsIcon, { className: "w-5 h-5" }), _jsx("span", { children: "Settings" })] })] }), _jsxs("div", { className: "border-t border-gray-700 pt-4 mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-2", children: "Theme" }), _jsx(ThemeToggle, {})] }), profile && (_jsxs("div", { className: "pt-3 border-t border-gray-700", children: [_jsx("div", { className: "text-sm font-medium text-white", children: profile.name }), _jsx("div", { className: "text-xs text-gray-400 capitalize mt-0.5", children: profile.role.replace('_', ' ') })] })), _jsx("button", { onClick: signOut, className: "w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-sm font-medium shadow-sm", children: "Sign Out" })] })] }), _jsx("main", { className: "flex-1 p-4 md:p-6 bg-healthcare-bg-secondary dark:bg-healthcare-dark-bg-primary overflow-auto pt-16 md:pt-6", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Conversations, {}) }), _jsx(Route, { path: "/calendar", element: _jsx(CalendarPage, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "/agent", element: _jsx(AgentConfig, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) })] }) }), _jsx(ChatWidget, { disableVoice: true })] }));
}
export default function App() {
    // Serenity Royale Hospital Admin Dashboard ONLY
    // Removed srhcareai.odia.dev domain detection to eliminate confusion
    // This deployment is exclusively for the authenticated admin dashboard
    return (_jsx("div", { className: "h-screen w-screen", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/*", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) })] }) }));
}
