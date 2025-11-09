import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';
const qc = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}
createRoot(rootElement).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { children: _jsx(ToastProvider, { children: _jsx(QueryClientProvider, { client: qc, children: _jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }) }) }) }) }) }));
