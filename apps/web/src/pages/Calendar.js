import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    useEffect(() => {
        loadAppointments();
        // Subscribe to realtime changes
        const subscription = supabase
            .channel('appointments-changes')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'appointments'
        }, () => {
            loadAppointments();
        })
            .subscribe();
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    const loadAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true });
            if (error)
                throw error;
            const mappedEvents = (data || []).map((appointment) => {
                const displayName = appointment.patient_name || appointment.patient_phone;
                const time = appointment.appointment_time || '09:00:00';
                const dateTime = `${appointment.appointment_date}T${time}`;
                return {
                    title: `${displayName} - ${appointment.reason || 'Appointment'}`,
                    start: dateTime,
                    backgroundColor: appointment.status === 'confirmed' ? '#52C41A' : '#FAAD14',
                    borderColor: appointment.status === 'confirmed' ? '#52C41A' : '#FAAD14',
                    textColor: '#FFFFFF'
                };
            });
            setEvents(mappedEvents);
        }
        catch (error) {
            console.error('Error loading appointments:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const el = document.getElementById('calendar');
        if (!el || loading)
            return;
        const isDark = resolvedTheme === 'dark';
        const cal = new FullCalendar(el, {
            plugins: [dayGridPlugin, timeGridPlugin],
            initialView: 'dayGridMonth',
            height: 'auto',
            events,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            // Dark mode styling
            ...(isDark && {
                // Custom styling for dark mode
                dayCellClassNames: 'dark:bg-gray-800 dark:border-gray-700',
            }),
            // Custom styling via CSS variables
            themeSystem: 'standard',
            eventDisplay: 'block',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
        });
        cal.render();
        return () => cal.destroy();
    }, [events, loading, resolvedTheme]);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold dark:text-white", children: "Appointment Calendar" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 rounded bg-[#52C41A]" }), _jsx("span", { className: "dark:text-gray-300", children: "Confirmed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 rounded bg-[#FAAD14]" }), _jsx("span", { className: "dark:text-gray-300", children: "Pending" })] })] })] }), _jsx("div", { id: "calendar", className: "w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm" })] }));
}
