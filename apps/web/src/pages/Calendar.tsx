import { useEffect, useState } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

interface Appointment {
  id: string;
  patient_name: string | null;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string | null;
  reason: string | null;
  status: string;
}

type FCEvent = {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<FCEvent[]>([]);
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

      if (error) throw error;

      const mappedEvents: FCEvent[] = (data || []).map((appointment: Appointment) => {
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
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = document.getElementById('calendar');
    if (!el || loading) return;

    const isDark = resolvedTheme === 'dark';

    const cal = new FullCalendar(el as HTMLElement, {
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Appointment Calendar</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#52C41A]"></div>
            <span className="dark:text-gray-300">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#FAAD14]"></div>
            <span className="dark:text-gray-300">Pending</span>
          </div>
        </div>
      </div>
      <div
        id="calendar"
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
      ></div>
    </div>
  );
}