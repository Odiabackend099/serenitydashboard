import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Phone, MessageCircle, Globe, MessageSquare, User, Bot, UserCheck, Send, Filter, X, Clock, CheckCircle } from 'lucide-react';
export default function Conversations() {
    const { user } = useAuth();
    const location = useLocation();
    const [convs, setConvs] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [filter, setFilter] = useState('active');
    const [channelFilter, setChannelFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);
    const searchInputRef = useRef(null);
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
            // Escape to close search
            if (e.key === 'Escape' && showSearch) {
                setShowSearch(false);
                setSearchQuery('');
            }
            // Ctrl+T or Cmd+T for take over
            if ((e.ctrlKey || e.metaKey) && e.key === 't' && selected && !selected.taken_over_by) {
                e.preventDefault();
                handleTakeOver();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSearch, selected]);
    // Fetch all conversations on load
    useEffect(() => {
        loadConversations();
        // Subscribe to new conversations
        const channel = supabase
            .channel('conversations-channel')
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations'
        }, (payload) => {
            setConvs(prev => [payload.new, ...prev]);
        })
            .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations'
        }, (payload) => {
            setConvs(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [filter, channelFilter]);
    // Handle navigation from Analytics - auto-select conversation
    useEffect(() => {
        const state = location.state;
        if (state?.conversationId && convs.length > 0) {
            const conv = convs.find(c => c.id === state.conversationId);
            if (conv) {
                setSelected(conv);
            }
            else {
                // Conversation not in current filter - switch to "all" to show it
                setFilter('all');
            }
        }
    }, [location.state, convs]);
    const loadMessages = async (conversationId) => {
        setLoadingMessages(true);
        console.log('Loading messages for conversation:', conversationId);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error) {
            console.error('Error loading messages:', error);
            setLoadingMessages(false);
            return;
        }
        console.log('Messages loaded:', data?.length || 0);
        setMessages(data || []);
        setLoadingMessages(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    // Load messages when conversation is selected
    useEffect(() => {
        if (!selected) {
            setMessages([]);
            return;
        }
        loadMessages(selected.id);
        // Subscribe to new messages in this conversation
        const channel = supabase
            .channel(`conversation:${selected.id}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selected.id}`
        }, (payload) => {
            setMessages(prev => [...prev, payload.new]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [selected]);
    const loadConversations = async () => {
        let query = supabase
            .from('conversations')
            .select('*')
            .order('created_at', { ascending: false });
        if (filter === 'active') {
            query = query.eq('status', 'open').is('taken_over_by', null);
        }
        else if (filter === 'taken_over') {
            query = query.not('taken_over_by', 'is', null);
        }
        if (channelFilter !== 'all') {
            query = query.eq('channel', channelFilter);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error loading conversations:', error);
            return;
        }
        setConvs(data || []);
    };
    const handleTakeOver = async () => {
        if (!selected || !user)
            return;
        const updateData = {
            taken_over_by: user.id,
            taken_over_at: new Date().toISOString(),
            status: 'taken_over'
        };
        const { error } = await supabase
            .from('conversations')
            .update(updateData)
            .eq('id', selected.id);
        if (error) {
            console.error('Error taking over conversation:', error);
            alert('Failed to take over conversation. Please try again.');
        }
    };
    const handleSendMessage = async () => {
        if (!selected || !messageInput.trim())
            return;
        const insertData = {
            conversation_id: selected.id,
            from_type: 'staff',
            body: messageInput.trim()
        };
        const { error } = await supabase
            .from('messages')
            .insert(insertData);
        if (error) {
            console.error('Error sending message:', error);
            return;
        }
        setMessageInput('');
    };
    // Format phone number for display
    const formatPhoneNumber = (phoneOrRef) => {
        // If it starts with +1, format as US number
        const cleaned = phoneOrRef.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            const areaCode = cleaned.slice(1, 4);
            const prefix = cleaned.slice(4, 7);
            const line = cleaned.slice(7);
            return `+1 (${areaCode}) ${prefix}-${line}`;
        }
        // If it's exactly 10 digits, assume US without +1
        if (cleaned.length === 10) {
            const areaCode = cleaned.slice(0, 3);
            const prefix = cleaned.slice(3, 6);
            const line = cleaned.slice(6);
            return `+1 (${areaCode}) ${prefix}-${line}`;
        }
        return phoneOrRef;
    };
    // Filter conversations by search query
    const filteredConvs = convs.filter((conv) => {
        if (!searchQuery)
            return true;
        const query = searchQuery.toLowerCase();
        const ref = conv.patient_ref.toLowerCase();
        const formatted = formatPhoneNumber(conv.patient_ref).toLowerCase();
        return ref.includes(query) || formatted.includes(query) || conv.id.toLowerCase().includes(query);
    });
    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'whatsapp':
                return _jsx(MessageCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400" });
            case 'voice':
                return _jsx(Phone, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" });
            case 'webchat':
                return _jsx(Globe, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" });
            default:
                return _jsx(MessageSquare, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" });
        }
    };
    const getStatusBadge = (conv) => {
        if (conv.taken_over_by) {
            return (_jsxs("span", { className: "px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800 flex items-center gap-1", children: [_jsx(UserCheck, { className: "w-3 h-3" }), " Staff"] }));
        }
        if (conv.status === 'open') {
            return (_jsxs("span", { className: "px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800 flex items-center gap-1", children: [_jsx(Bot, { className: "w-3 h-3" }), " AI Active"] }));
        }
        if (conv.status === 'closed') {
            return (_jsxs("span", { className: "px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), " Closed"] }));
        }
        return (_jsx("span", { className: "px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800", children: conv.status }));
    };
    return (_jsxs("div", { className: "h-screen flex flex-col p-2 md:p-6 overflow-hidden", children: [_jsxs("div", { className: "flex-shrink-0 mb-2 md:mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2 md:mb-3", children: [_jsx("h1", { className: "text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Conversations" }), _jsx("div", { className: "flex items-center gap-2", children: !showSearch ? (_jsxs("button", { onClick: () => {
                                        setShowSearch(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 100);
                                    }, className: "px-2 md:px-3 py-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Search (Ctrl+K)" })] })) : (_jsxs("div", { className: "relative flex items-center", children: [_jsx(Search, { className: "absolute left-3 w-4 h-4 text-gray-400" }), _jsx("input", { ref: searchInputRef, type: "text", placeholder: "Search...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-healthcare-dark-bg-secondary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent w-40 md:w-80 text-sm" }), _jsx("button", { onClick: () => {
                                                setShowSearch(false);
                                                setSearchQuery('');
                                            }, className: "absolute right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded", children: _jsx(X, { className: "w-4 h-4 text-gray-400" }) })] })) })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex flex-wrap gap-1 md:gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-1 md:gap-2 mr-1 md:mr-2", children: [_jsx(Filter, { className: "w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" }), _jsx("span", { className: "font-medium text-xs md:text-sm text-gray-600 dark:text-gray-400", children: "Status:" })] }), _jsx("button", { onClick: () => setFilter('all'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${filter === 'all'
                                            ? 'bg-healthcare-primary dark:bg-healthcare-accent text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: "All" }), _jsx("button", { onClick: () => setFilter('active'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${filter === 'active'
                                            ? 'bg-healthcare-primary dark:bg-healthcare-accent text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: "AI" }), _jsx("button", { onClick: () => setFilter('taken_over'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${filter === 'taken_over'
                                            ? 'bg-healthcare-primary dark:bg-healthcare-accent text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: "Staff" })] }), _jsxs("div", { className: "flex flex-wrap gap-1 md:gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-1 md:gap-2 mr-1 md:mr-2", children: [_jsx(Filter, { className: "w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" }), _jsx("span", { className: "font-medium text-xs md:text-sm text-gray-600 dark:text-gray-400", children: "Channel:" })] }), _jsx("button", { onClick: () => setChannelFilter('all'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 ${channelFilter === 'all'
                                            ? 'bg-healthcare-secondary dark:bg-healthcare-secondary text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: "All" }), _jsxs("button", { onClick: () => setChannelFilter('whatsapp'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 ${channelFilter === 'whatsapp'
                                            ? 'bg-healthcare-secondary dark:bg-healthcare-secondary text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: [_jsx(MessageCircle, { className: "w-3 h-3 md:w-4 md:h-4" }), " ", _jsx("span", { className: "hidden sm:inline", children: "WhatsApp" }), _jsx("span", { className: "sm:hidden", children: "WA" })] }), _jsxs("button", { onClick: () => setChannelFilter('voice'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 ${channelFilter === 'voice'
                                            ? 'bg-healthcare-secondary dark:bg-healthcare-secondary text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: [_jsx(Phone, { className: "w-3 h-3 md:w-4 md:h-4" }), " Voice"] }), _jsxs("button", { onClick: () => setChannelFilter('webchat'), className: `px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 ${channelFilter === 'webchat'
                                            ? 'bg-healthcare-secondary dark:bg-healthcare-secondary text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`, children: [_jsx(Globe, { className: "w-3 h-3 md:w-4 md:h-4" }), " ", _jsx("span", { className: "hidden sm:inline", children: "Web Chat" }), _jsx("span", { className: "sm:hidden", children: "Web" })] })] })] })] }), _jsxs("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 overflow-hidden min-h-0", children: [_jsxs("div", { className: `col-span-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-healthcare-dark-bg-elevated shadow-sm flex flex-col min-h-0 ${selected ? 'hidden md:flex' : 'flex'}`, children: [_jsxs("h2", { className: "p-4 font-semibold border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-healthcare-primary dark:text-healthcare-accent" }), "Conversations (", filteredConvs.length, ")"] }), _jsx("ul", { className: "flex-1 overflow-y-auto", children: filteredConvs.length === 0 ? (_jsx("li", { className: "p-8 text-gray-500 dark:text-gray-400 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(MessageSquare, { className: "w-12 h-12 text-gray-300 dark:text-gray-600" }), _jsx("p", { className: "text-sm font-medium", children: "No conversations found" }), searchQuery && _jsx("p", { className: "text-xs", children: "Try adjusting your search" })] }) })) : (filteredConvs.map((c) => (_jsxs("li", { className: `p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-healthcare-dark-bg-secondary cursor-pointer transition ${selected?.id === c.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-healthcare-primary dark:border-l-healthcare-accent'
                                        : ''}`, onClick: () => setSelected(c), children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getChannelIcon(c.channel), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [c.channel === 'voice' && _jsx(Phone, { className: "w-3 h-3" }), formatPhoneNumber(c.patient_ref)] }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: c.channel.charAt(0).toUpperCase() + c.channel.slice(1) })] })] }), getStatusBadge(c)] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2", children: [_jsx(Clock, { className: "w-3 h-3" }), new Date(c.created_at).toLocaleString()] }), c.ai_confidence !== null && (_jsxs("div", { className: "text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1", children: [_jsx(Bot, { className: "w-3 h-3" }), "AI Confidence: ", (c.ai_confidence * 100).toFixed(0), "%"] }))] }, c.id)))) })] }), _jsx("div", { className: `col-span-1 md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-healthcare-dark-bg-elevated shadow-sm flex flex-col min-h-0 ${selected ? 'flex' : 'hidden md:flex'}`, children: selected ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-2 md:p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-healthcare-dark-bg-secondary rounded-t-lg", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [_jsx("button", { onClick: () => setSelected(null), className: "md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0", title: "Back to conversations", children: _jsx(X, { className: "w-5 h-5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "font-semibold text-sm md:text-lg flex items-center gap-1 md:gap-2 text-gray-900 dark:text-gray-100 truncate", children: [getChannelIcon(selected.channel), _jsxs("span", { className: "flex items-center gap-1 md:gap-2 truncate", children: [selected.channel === 'voice' && _jsx(Phone, { className: "w-3 h-3 md:w-4 md:h-4" }), _jsx("span", { className: "truncate", children: formatPhoneNumber(selected.patient_ref) })] })] }), _jsxs("div", { className: "text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 md:gap-2 mt-0.5 md:mt-1 truncate", children: [_jsx("span", { className: "truncate", children: selected.channel.charAt(0).toUpperCase() + selected.channel.slice(1) }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-500 hidden sm:inline", children: "\u2022" }), _jsxs("span", { className: "text-xs hidden sm:inline", children: ["ID: ", selected.id.slice(0, 8)] })] })] })] }), !selected.taken_over_by && (_jsxs("button", { onClick: handleTakeOver, className: "hidden md:flex px-4 py-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all shadow-sm items-center gap-2 flex-shrink-0", title: "Take over this conversation (Ctrl+T)", children: [_jsx(UserCheck, { className: "w-4 h-4" }), _jsx("span", { className: "hidden lg:inline", children: "Take Over (Ctrl+T)" }), _jsx("span", { className: "lg:hidden", children: "Take Over" })] })), !selected.taken_over_by && (_jsx("button", { onClick: handleTakeOver, className: "md:hidden p-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all flex-shrink-0", title: "Take over", children: _jsx(UserCheck, { className: "w-5 h-5" }) }))] }), _jsxs("div", { className: "flex-1 p-2 md:p-4 space-y-2 md:space-y-3 overflow-y-auto bg-gray-50 dark:bg-healthcare-dark-bg-primary", children: [loadingMessages ? (_jsxs("div", { className: "text-gray-500 dark:text-gray-400 text-center py-12", children: [_jsx("div", { className: "animate-spin w-12 h-12 border-4 border-healthcare-primary dark:border-healthcare-accent border-t-transparent rounded-full mx-auto mb-3" }), _jsx("p", { className: "font-medium text-sm md:text-base", children: "Loading messages..." })] })) : messages.length === 0 ? (_jsxs("div", { className: "text-gray-500 dark:text-gray-400 text-center py-12", children: [_jsx(MessageSquare, { className: "w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" }), _jsx("p", { className: "font-medium text-sm md:text-base", children: "No messages yet" }), _jsx("p", { className: "text-xs md:text-sm mt-1", children: "Start the conversation" })] })) : (messages.map((m) => (_jsxs("div", { className: `p-2 md:p-3 rounded-lg shadow-sm border animate-slideIn text-sm md:text-base ${m.from_type === 'patient'
                                                ? 'bg-white dark:bg-healthcare-dark-bg-secondary border-gray-200 dark:border-gray-700 ml-0 mr-8 md:mr-12'
                                                : m.from_type === 'ai'
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-8 md:ml-12 mr-0'
                                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ml-8 md:ml-12 mr-0'}`, children: [_jsxs("div", { className: "flex items-center gap-1 md:gap-2 mb-1 md:mb-2", children: [m.from_type === 'patient' ? (_jsxs(_Fragment, { children: [_jsx(User, { className: "w-3 h-3 md:w-4 md:h-4 text-gray-600 dark:text-gray-400" }), _jsx("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300", children: "Patient" })] })) : m.from_type === 'ai' ? (_jsxs(_Fragment, { children: [_jsx(Bot, { className: "w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" }), _jsx("span", { className: "text-xs font-semibold text-blue-700 dark:text-blue-300", children: "AI" })] })) : (_jsxs(_Fragment, { children: [_jsx(UserCheck, { className: "w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" }), _jsx("span", { className: "text-xs font-semibold text-green-700 dark:text-green-300", children: "Staff" })] })), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-500 ml-auto", children: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), _jsx("div", { className: "text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm md:text-base leading-relaxed", children: m.body }), m.media_url && (_jsx("a", { href: m.media_url, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-healthcare-primary dark:text-healthcare-accent underline mt-1 md:mt-2 block hover:text-healthcare-accent dark:hover:text-healthcare-primary", children: "View Media" }))] }, m.id)))), _jsx("div", { ref: messagesEndRef })] }), selected.taken_over_by && (_jsxs("div", { className: "p-2 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-healthcare-dark-bg-secondary flex gap-1 md:gap-2 rounded-b-lg", children: [_jsx("input", { className: "border border-gray-300 dark:border-gray-600 flex-1 p-2 md:p-3 rounded-lg bg-white dark:bg-healthcare-dark-bg-elevated text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent text-sm md:text-base", placeholder: "Type a message...", value: messageInput, onChange: (e) => setMessageInput(e.target.value), onKeyDown: (e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            } }), _jsxs("button", { onClick: handleSendMessage, className: "px-3 md:px-6 py-2 md:py-3 bg-healthcare-success text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-sm flex items-center justify-center gap-1 md:gap-2 min-w-[44px] md:min-w-fit", title: "Send message", children: [_jsx(Send, { className: "w-4 h-4" }), _jsx("span", { className: "hidden md:inline", children: "Send" })] })] }))] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400", children: [_jsx(MessageSquare, { className: "w-20 h-20 mb-4 text-gray-300 dark:text-gray-600" }), _jsx("p", { className: "text-lg font-medium", children: "Select a conversation" }), _jsx("p", { className: "text-sm mt-1", children: "Choose a conversation from the list to view messages" })] })) })] })] }));
}
