import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../lib/database.types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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
        .single() as { data: Database['public']['Tables']['profiles']['Row'] | null; error: any };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-xl overflow-hidden flex">
        {/* Logo Section - Right side as requested */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-healthcare-primary to-healthcare-accent p-12 items-center justify-center">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="Serenity Care"
              className="w-48 h-48 mx-auto rounded-2xl shadow-2xl mb-6 border-4 border-white"
            />
            <h2 className="text-3xl font-bold text-white mb-2">Serenity Care AI</h2>
            <p className="text-white/90 text-lg">Healthcare Communication Platform</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-3/5 p-8">
          <div className="text-center mb-8 md:hidden">
            <img src="/logo.png" alt="Serenity Care" className="w-20 h-20 mx-auto mb-4 rounded-lg" />
            <h1 className="text-3xl font-bold text-gray-900">Serenity Care AI</h1>
            <p className="text-gray-600 mt-2">Admin Dashboard</p>
          </div>

          <div className="hidden md:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="staff@hospital.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Hospital staff only. Patient portal coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
