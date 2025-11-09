import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (_jsxs("div", { className: "flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg", children: [_jsx("button", { onClick: () => setTheme('light'), className: `p-2 rounded transition-all ${theme === 'light'
                    ? 'bg-white dark:bg-gray-700 shadow text-healthcare-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`, "aria-label": "Light mode", title: "Light mode", children: _jsx(Sun, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setTheme('dark'), className: `p-2 rounded transition-all ${theme === 'dark'
                    ? 'bg-white dark:bg-gray-700 shadow text-healthcare-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`, "aria-label": "Dark mode", title: "Dark mode", children: _jsx(Moon, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setTheme('system'), className: `p-2 rounded transition-all ${theme === 'system'
                    ? 'bg-white dark:bg-gray-700 shadow text-healthcare-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`, "aria-label": "System theme", title: "System theme", children: _jsx(Monitor, { className: "w-4 h-4" }) })] }));
}
