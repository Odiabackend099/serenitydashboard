import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  MessageSquare,
  Mail,
  FolderOpen,
  UserCheck,
  Calendar,
  RefreshCw,
  TrendingUp,
  Activity,
  Phone,
  MessageCircle,
  Globe
} from 'lucide-react';

interface Analytics {
  total_conversations: number;
  total_messages: number;
  open_conversations: number;
  staff_handled_conversations: number;
  total_appointments: number;
  channel_breakdown: Record<string, number>;
}

interface Conversation {
  id: string;
  patient_ref: string;
  channel: string;
  status: string;
  created_at: string;
  taken_over_by: string | null;
}

// Skeleton Loading Component
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-32"></div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-64"></div>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-64"></div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
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

      const channelBreakdown: Record<string, number> = {};
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
    } catch (error) {
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
    } else {
      setRecentConversations(data || []);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'voice':
        return <Phone className="w-4 h-4" />;
      case 'webchat':
        return <Globe className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Activity className="w-7 h-7 text-healthcare-primary dark:text-healthcare-accent" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        <button
          onClick={() => {
            loadAnalytics();
            loadRecentConversations();
          }}
          className="px-4 py-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Conversations
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {analytics.total_conversations}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Messages
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {analytics.total_messages}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Open Conversations
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {analytics.open_conversations}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <FolderOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Staff Handled
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {analytics.staff_handled_conversations}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Appointments
                </p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {analytics.total_appointments}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-300">Loading analytics data...</p>
        </div>
      )}

      {/* Data Visualization */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Channel Distribution Pie Chart */}
          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-healthcare-primary dark:text-healthcare-accent" />
              Channel Distribution
            </h3>
            {Object.keys(analytics.channel_breakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.channel_breakdown).map(([name, value]) => ({
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(analytics.channel_breakdown).map((entry, index) => {
                      const COLORS = ['#0066CC', '#00A896', '#4A90E2', '#52C41A'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No channel data available yet</p>
              </div>
            )}
          </div>

          {/* Performance Metrics Bar Chart */}
          <div className="bg-white dark:bg-healthcare-dark-bg-elevated p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-healthcare-primary dark:text-healthcare-accent" />
              Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
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
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#0066CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Conversations */}
      <div className="bg-white dark:bg-healthcare-dark-bg-elevated rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-healthcare-primary dark:text-healthcare-accent" />
            Recent Conversations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-healthcare-dark-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium">No conversations yet</p>
                      <p className="text-xs">Start a conversation to see analytics here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    className="hover:bg-gray-50 dark:hover:bg-healthcare-dark-bg-secondary transition-colors cursor-pointer"
                    onClick={() => navigate('/', { state: { conversationId: conv.id } })}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {conv.patient_ref}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {getChannelIcon(conv.channel)}
                        <span className="capitalize">{conv.channel}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(conv.status)}`}>
                        {conv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {conv.taken_over_by ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-4 h-4" /> Staff
                        </span>
                      ) : (
                        'AI'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(conv.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
