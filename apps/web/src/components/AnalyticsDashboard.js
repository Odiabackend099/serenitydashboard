import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Mail, FolderOpen, UserCheck, Calendar, RefreshCw, TrendingUp, Activity, Phone, MessageCircle, Globe } from 'lucide-react';
// Skeleton Loading Component
function AnalyticsSkeleton() {
    return (_jsxs("div", { className: "space-y-6 animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-32" }, i))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-64" }), _jsx("div", { className: "bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-64" })] })] }));
}
export default function AnalyticsDashboard() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [recentConversations, setRecentConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadAnalytics();
        loadRecentConversations();
        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            loadAnalytics();
            loadRecentConversations();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    const loadAnalytics = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            // Get total conversations
            const { count: totalConversations } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true });
            // Get total messages
            const { count: totalMessages } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true });
            // Get open conversations
            const { count: openConversations } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'open');
            // Get staff handled conversations
            const { count: staffHandled } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .not('taken_over_by', 'is', null);
            // Get total appointments
            const { count: totalAppointments } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true });
            // Get channel breakdown
            const { data: conversations } = await supabase
                .from('conversations')
                .select('channel');
            const channelBreakdown = {};
            conversations?.forEach((conv) => {
                channelBreakdown[conv.channel] = (channelBreakdown[conv.channel] || 0) + 1;
            });
            setAnalytics({
                total_conversations: totalConversations || 0,
                total_messages: totalMessages || 0,
                open_conversations: openConversations || 0,
                staff_handled_conversations: staffHandled || 0,
                total_appointments: totalAppointments || 0,
                channel_breakdown: channelBreakdown,
            });
        }
        catch (error) {
            console.error('Error loading analytics:', error);
        }
        setLoading(false);
    };
    const loadRecentConversations = async () => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) {
            console.error('Error loading recent conversations:', error);
        }
        else {
            setRecentConversations(data || []);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800';
            case 'closed':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
            case 'escalated':
                return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        }
    };
    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'whatsapp':
                return _jsx(MessageCircle, { className: "w-4 h-4" });
            case 'voice':
                return _jsx(Phone, { className: "w-4 h-4" });
            case 'webchat':
                return _jsx(Globe, { className: "w-4 h-4" });
            default:
                return _jsx(MessageSquare, { className: "w-4 h-4" });
        }
    };
    if (loading) {
        return _jsx(AnalyticsSkeleton, {});
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(Activity, { className: "w-7 h-7 text-healthcare-primary dark:text-healthcare-accent" }), "Analytics Dashboard"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Real-time insights and performance metrics" })] }), _jsxs("button", { onClick: () => {
                            loadAnalytics();
                            loadRecentConversations();
                        }, className: "px-4 py-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all flex items-center gap-2 shadow-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Refresh"] })] }), analytics ? (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Total Conversations" }), _jsx("p", { className: "text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100", children: analytics.total_conversations })] }), _jsx("div", { className: "p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg", children: _jsx(MessageSquare, { className: "w-8 h-8 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Total Messages" }), _jsx("p", { className: "text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100", children: analytics.total_messages })] }), _jsx("div", { className: "p-3 bg-green-100 dark:bg-green-900/20 rounded-lg", children: _jsx(Mail, { className: "w-8 h-8 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Open Conversations" }), _jsx("p", { className: "text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100", children: analytics.open_conversations })] }), _jsx("div", { className: "p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg", children: _jsx(FolderOpen, { className: "w-8 h-8 text-yellow-600 dark:text-yellow-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Staff Handled" }), _jsx("p", { className: "text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100", children: analytics.staff_handled_conversations })] }), _jsx("div", { className: "p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg", children: _jsx(UserCheck, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Appointments" }), _jsx("p", { className: "text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100", children: analytics.total_appointments })] }), _jsx("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg", children: _jsx(Calendar, { className: "w-8 h-8 text-indigo-600 dark:text-indigo-400" }) })] }) })] })) : (_jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4", children: _jsx("p", { className: "text-yellow-800 dark:text-yellow-300", children: "Loading analytics data..." }) })), analytics && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-healthcare-primary dark:text-healthcare-accent" }), "Channel Distribution"] }), Object.keys(analytics.channel_breakdown).length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: Object.entries(analytics.channel_breakdown).map(([name, value]) => ({
                                                name: name.charAt(0).toUpperCase() + name.slice(1),
                                                value
                                            })), cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: Object.keys(analytics.channel_breakdown).map((entry, index) => {
                                                const COLORS = ['#0066CC', '#00A896', '#4A90E2', '#52C41A'];
                                                return _jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`);
                                            }) }), _jsx(Tooltip, { contentStyle: { backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E5E7EB', borderRadius: '8px' } })] }) })) : (_jsx("div", { className: "h-64 flex items-center justify-center text-gray-500 dark:text-gray-400", children: _jsx("p", { className: "text-sm", children: "No channel data available yet" }) }))] }), _jsxs("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5 text-healthcare-primary dark:text-healthcare-accent" }), "Performance Metrics"] }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: [
                                        {
                                            name: 'Avg Msgs/Conv',
                                            value: analytics.total_conversations > 0
                                                ? parseFloat((analytics.total_messages / analytics.total_conversations).toFixed(1))
                                                : 0
                                        },
                                        {
                                            name: 'Staff Takeover %',
                                            value: analytics.total_conversations > 0
                                                ? parseFloat(((analytics.staff_handled_conversations / analytics.total_conversations) * 100).toFixed(1))
                                                : 0
                                        },
                                        {
                                            name: 'Open Rate %',
                                            value: analytics.total_conversations > 0
                                                ? parseFloat(((analytics.open_conversations / analytics.total_conversations) * 100).toFixed(1))
                                                : 0
                                        }
                                    ], margin: { top: 5, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB" }), _jsx(XAxis, { dataKey: "name", stroke: "#6B7280", fontSize: 12 }), _jsx(YAxis, { stroke: "#6B7280", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px'
                                            } }), _jsx(Bar, { dataKey: "value", fill: "#0066CC", radius: [8, 8, 0, 0] })] }) })] })] })), _jsxs("div", { className: "bg-white dark:bg-healthcare-dark-bg-elevated rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-6 h-6 text-healthcare-primary dark:text-healthcare-accent" }), "Recent Conversations"] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-healthcare-dark-bg-secondary", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Patient" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Channel" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Assigned To" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Created" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: recentConversations.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(MessageSquare, { className: "w-12 h-12 text-gray-300 dark:text-gray-600" }), _jsx("p", { className: "text-sm font-medium", children: "No conversations yet" }), _jsx("p", { className: "text-xs", children: "Start a conversation to see analytics here" })] }) }) })) : (recentConversations.map((conv) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-healthcare-dark-bg-secondary transition-colors cursor-pointer", onClick: () => navigate('/', { state: { conversationId: conv.id } }), children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: conv.patient_ref }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: "flex items-center gap-2 text-gray-700 dark:text-gray-300", children: [getChannelIcon(conv.channel), _jsx("span", { className: "capitalize", children: conv.channel })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(conv.status)}`, children: conv.status.toUpperCase() }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: conv.taken_over_by ? (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(UserCheck, { className: "w-4 h-4" }), " Staff"] })) : ('AI') }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: new Date(conv.created_at).toLocaleString() })] }, conv.id)))) })] }) })] })] }));
}
