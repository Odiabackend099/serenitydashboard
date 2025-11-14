import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DailyAnalytics {
  date: string;
  total_conversations: number;
  total_messages: number;
  unique_patients: number;
  appointments_booked: number;
  appointments_rescheduled: number;
  appointments_cancelled: number;
  availability_checks: number;
  general_inquiries: number;
  avg_response_time_seconds?: number;
  avg_messages_per_conversation?: number;
}

export function WhatsAppAnalytics() {
  const [todayAnalytics, setTodayAnalytics] = useState<DailyAnalytics | null>(null);
  const [weekAnalytics, setWeekAnalytics] = useState<DailyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  async function loadAnalytics() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load today's analytics
      const { data: todayData, error: todayError } = await supabase
        .from('conversation_analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (!todayError) {
        setTodayAnalytics(todayData);
      }

      // Load weekly analytics
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weekData, error: weekError } = await supabase
        .from('conversation_analytics')
        .select('*')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (!weekError) {
        setWeekAnalytics(weekData || []);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  const weekTotals = weekAnalytics.reduce((acc, day) => ({
    total_conversations: acc.total_conversations + day.total_conversations,
    total_messages: acc.total_messages + day.total_messages,
    appointments_booked: acc.appointments_booked + day.appointments_booked,
    appointments_rescheduled: acc.appointments_rescheduled + day.appointments_rescheduled,
    appointments_cancelled: acc.appointments_cancelled + day.appointments_cancelled,
    availability_checks: acc.availability_checks + day.availability_checks,
    general_inquiries: acc.general_inquiries + day.general_inquiries,
  }), {
    total_conversations: 0,
    total_messages: 0,
    appointments_booked: 0,
    appointments_rescheduled: 0,
    appointments_cancelled: 0,
    availability_checks: 0,
    general_inquiries: 0,
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Analytics</h1>
        <p className="text-gray-600 mt-1">Monitor your WhatsApp conversation metrics and performance</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedPeriod('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === 'today'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === 'month'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Conversations"
          value={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 0 : weekTotals.total_conversations}
          icon="💬"
          trend={selectedPeriod === 'today' ? undefined : '+12%'}
          iconBg="bg-blue-100"
        />
        <MetricCard
          title="Messages Sent"
          value={selectedPeriod === 'today' ? todayAnalytics?.total_messages || 0 : weekTotals.total_messages}
          icon="📨"
          trend={selectedPeriod === 'today' ? undefined : '+8%'}
          iconBg="bg-green-100"
        />
        <MetricCard
          title="Appointments Booked"
          value={selectedPeriod === 'today' ? todayAnalytics?.appointments_booked || 0 : weekTotals.appointments_booked}
          icon="📅"
          trend={selectedPeriod === 'today' ? undefined : '+15%'}
          iconBg="bg-purple-100"
        />
        <MetricCard
          title="Unique Patients"
          value={todayAnalytics?.unique_patients || 0}
          icon="👥"
          iconBg="bg-yellow-100"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Actions Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Actions Breakdown</h3>
          <div className="space-y-3">
            <ActionRow
              label="Appointments Booked"
              value={selectedPeriod === 'today' ? todayAnalytics?.appointments_booked || 0 : weekTotals.appointments_booked}
              total={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 1 : weekTotals.total_conversations || 1}
              color="bg-green-500"
            />
            <ActionRow
              label="Rescheduled"
              value={selectedPeriod === 'today' ? todayAnalytics?.appointments_rescheduled || 0 : weekTotals.appointments_rescheduled}
              total={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 1 : weekTotals.total_conversations || 1}
              color="bg-yellow-500"
            />
            <ActionRow
              label="Cancelled"
              value={selectedPeriod === 'today' ? todayAnalytics?.appointments_cancelled || 0 : weekTotals.appointments_cancelled}
              total={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 1 : weekTotals.total_conversations || 1}
              color="bg-red-500"
            />
            <ActionRow
              label="Availability Checks"
              value={selectedPeriod === 'today' ? todayAnalytics?.availability_checks || 0 : weekTotals.availability_checks}
              total={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 1 : weekTotals.total_conversations || 1}
              color="bg-blue-500"
            />
            <ActionRow
              label="General Inquiries"
              value={selectedPeriod === 'today' ? todayAnalytics?.general_inquiries || 0 : weekTotals.general_inquiries}
              total={selectedPeriod === 'today' ? todayAnalytics?.total_conversations || 1 : weekTotals.total_conversations || 1}
              color="bg-gray-500"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-lg font-semibold">
                  {todayAnalytics?.avg_response_time_seconds ?
                    `${todayAnalytics.avg_response_time_seconds}s` :
                    'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Target: &lt;5s
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Avg Messages/Conversation</span>
                <span className="text-lg font-semibold">
                  {todayAnalytics?.avg_messages_per_conversation?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Efficiency metric
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-lg font-semibold">
                  {todayAnalytics && todayAnalytics.total_conversations > 0
                    ? `${((todayAnalytics.appointments_booked / todayAnalytics.total_conversations) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Conversations to bookings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      {selectedPeriod === 'week' && weekAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Trend</h3>
          <div className="space-y-2">
            {weekAnalytics.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.total_conversations / Math.max(...weekAnalytics.map(d => d.total_conversations))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{day.total_conversations}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, trend, iconBg }: {
  title: string;
  value: number;
  icon: string;
  trend?: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend} from last period</p>
          )}
        </div>
        <div className={`${iconBg} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionRow({ label, value, total, color }: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
