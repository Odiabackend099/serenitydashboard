import { Route, Routes, NavLink } from 'react-router-dom';
import { MessageSquare, Calendar, BarChart3, Bot, Settings as SettingsIcon, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Conversations from './pages/Conversations';
import CalendarPage from './pages/Calendar';
import AgentConfig from './pages/AgentConfig';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
import { WhatsAppConversations } from './components/WhatsAppConversations';
import { WhatsAppAnalytics } from './components/WhatsAppAnalytics';

function Dashboard() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-healthcare-bg-primary dark:bg-healthcare-dark-bg-primary">
      {/* Mobile hamburger menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 dark:bg-healthcare-dark-bg-elevated text-white p-4 flex flex-col border-r border-gray-800 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.png" alt="Serenity Care" className="w-12 h-12 rounded-lg shadow-md" />
          <div>
            <h1 className="text-xl font-semibold text-white">Serenity Care AI</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span>Conversations</span>
          </NavLink>
          <NavLink
            to="/calendar"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`
            }
          >
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </NavLink>
          <NavLink
            to="/analytics"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </NavLink>
          <NavLink
            to="/agent"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`
            }
          >
            <Bot className="w-5 h-5" />
            <span>Agent Config</span>
          </NavLink>

          {/* WhatsApp Section */}
          <div className="pt-2 mt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 px-3 mb-2">WhatsApp</p>
            <NavLink
              to="/whatsapp/conversations"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`
              }
            >
              <MessageCircle className="w-5 h-5" />
              <span>Conversations</span>
            </NavLink>
            <NavLink
              to="/whatsapp/analytics"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </NavLink>
          </div>

          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-healthcare-primary text-white font-medium shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`
            }
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="border-t border-gray-700 pt-4 mt-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-2">Theme</p>
            <ThemeToggle />
          </div>

          {profile && (
            <div className="pt-3 border-t border-gray-700">
              <div className="text-sm font-medium text-white">{profile.name}</div>
              <div className="text-xs text-gray-400 capitalize mt-0.5">
                {profile.role.replace('_', ' ')}
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-sm font-medium shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 bg-healthcare-bg-secondary dark:bg-healthcare-dark-bg-primary overflow-auto pt-16 md:pt-6">
        <Routes>
          <Route path="/" element={<Conversations />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/agent" element={<AgentConfig />} />
          <Route path="/whatsapp/conversations" element={<WhatsAppConversations />} />
          <Route path="/whatsapp/analytics" element={<WhatsAppAnalytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Admin AI Assistant - Text only, business management focused */}
      <ChatWidget disableVoice={true} />
    </div>
  );
}

export default function App() {
  // Serenity Royale Hospital Admin Dashboard ONLY
  // Removed srhcareai.odia.dev domain detection to eliminate confusion
  // This deployment is exclusively for the authenticated admin dashboard
  return (
    <div className="h-screen w-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}