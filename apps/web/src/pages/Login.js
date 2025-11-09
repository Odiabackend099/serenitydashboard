import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }
        if (data.user) {
            // Check if user has a profile (staff member)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            if (profileError || !profile) {
                setError('You do not have access to this admin dashboard.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }
            if (!profile.active) {
                setError('Your account has been deactivated. Please contact an administrator.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }
            // Success - redirect to dashboard
            navigate('/');
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-900 p-4", children: _jsxs("div", { className: "max-w-5xl w-full bg-white rounded-lg shadow-xl overflow-hidden flex", children: [_jsx("div", { className: "hidden md:flex md:w-2/5 bg-gradient-to-br from-healthcare-primary to-healthcare-accent p-12 items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("img", { src: "/logo.png", alt: "Serenity Care", className: "w-48 h-48 mx-auto rounded-2xl shadow-2xl mb-6 border-4 border-white" }), _jsx("h2", { className: "text-3xl font-bold text-white mb-2", children: "Serenity Care AI" }), _jsx("p", { className: "text-white/90 text-lg", children: "Healthcare Communication Platform" })] }) }), _jsxs("div", { className: "w-full md:w-3/5 p-8", children: [_jsxs("div", { className: "text-center mb-8 md:hidden", children: [_jsx("img", { src: "/logo.png", alt: "Serenity Care", className: "w-20 h-20 mx-auto mb-4 rounded-lg" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Serenity Care AI" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Admin Dashboard" })] }), _jsxs("div", { className: "hidden md:block text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Welcome Back" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Sign in to access the admin dashboard" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-800 p-3 rounded", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "staff@hospital.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "mt-6 text-center text-sm text-gray-600", children: _jsx("p", { children: "Hospital staff only. Patient portal coming soon." }) })] })] }) }));
}
