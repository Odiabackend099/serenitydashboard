/**
 * Conditional Logger Utility
 * Only logs in development mode, silent in production
 */
const isDev = import.meta.env.DEV;
export const logger = {
    log: (...args) => {
        if (isDev)
            console.log(...args);
    },
    warn: (...args) => {
        if (isDev)
            console.warn(...args);
    },
    error: (...args) => {
        // Always log errors but sanitize sensitive data
        if (isDev) {
            console.error(...args);
        }
        else {
            // In production, only log error message, not full stack with potential sensitive data
            console.error('[Error]', args[0]);
        }
    },
    info: (...args) => {
        if (isDev)
            console.info(...args);
    },
};
