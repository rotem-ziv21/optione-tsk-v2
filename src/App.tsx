import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { ProjectManagement } from './components/ProjectManagement';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show admin dashboard for admin users
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Show project management for regular users
  return user ? <ProjectManagement /> : <LoginPage />;
}

export default App;