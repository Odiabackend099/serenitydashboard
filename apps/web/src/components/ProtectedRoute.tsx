import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!profile.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Account Deactivated</h2>
          <p className="text-gray-700">
            Your account has been deactivated. Please contact an administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
