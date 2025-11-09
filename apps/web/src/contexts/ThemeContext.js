import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('theme');
        return stored || 'system';
    });
    const [resolvedTheme, setResolvedTheme] = useState('light');
    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
            const handler = (e) => {
                setResolvedTheme(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
        else {
            setResolvedTheme(theme);
        }
    }, [theme]);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme, resolvedTheme }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
