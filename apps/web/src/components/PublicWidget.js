import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ChatWidget from './ChatWidget';
/**
 * PublicWidget - Standalone chat widget for public website embedding
 *
 * This component is designed to be embedded on https://srhcareai.odia.dev
 * for lead capture, FAQ answering, and initial patient engagement.
 *
 * Features:
 * - No authentication required
 * - Simple, clean interface
 * - Embeddable on any website
 * - Focuses on conversational AI for lead generation
 */
export default function PublicWidget() {
    return (_jsx("div", { className: "h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-4xl w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "SRH Care AI" }), _jsx("p", { className: "text-lg text-gray-600", children: "Your 24/7 Healthcare Assistant" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Get instant answers to your healthcare questions, book appointments, and connect with our team." })] }), _jsx("div", { className: "bg-white rounded-2xl shadow-2xl overflow-hidden", style: { height: '600px' }, children: _jsx(ChatWidget, { mode: "public", showWelcomeMessage: true, initialOpen: true }) }), _jsxs("div", { className: "text-center mt-6 text-sm text-gray-500", children: [_jsx("p", { children: "Powered by Advanced AI Technology" }), _jsx("p", { className: "mt-1", children: "Your privacy is important to us. All conversations are secure and confidential." })] })] }) }));
}
