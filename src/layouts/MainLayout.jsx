import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../context/auth-context.js';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 transition-colors dark:bg-slate-950 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setSidebarOpen(true)} theme={theme} onThemeToggle={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))} />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
