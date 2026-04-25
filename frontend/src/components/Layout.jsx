import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { capitalize } from '../utils/helpers';

const navItems = [
  {
    path: '/dashboard', label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    path: '/pos', label: 'POS / Sales',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  },
  {
    path: '/products', label: 'Products',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  },
  {
    path: '/customers', label: 'Customers',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    path: '/debts', label: 'Debts',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>,
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen ${collapsed ? 'w-[4.5rem]' : 'w-64'} bg-surface/80 backdrop-blur-xl border-r border-primary/10 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Logo */}
        <div className={`${collapsed ? 'p-4 flex justify-center' : 'p-6'} border-b border-primary/10`}>
          <Link to="/" className="flex items-center gap-3 no-underline" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 flex-shrink-0">
              S
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-text tracking-tight">SN Shops</h1>
                <p className="text-[0.65rem] text-text-muted uppercase tracking-widest">Management</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/15 text-primary-light border border-primary/20 shadow-sm shadow-primary/10'
                    : 'text-text-muted hover:bg-primary/5 hover:text-text border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-primary/10`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{capitalize(user?.username)}</p>
                <p className="text-xs text-text-muted">Shop Owner</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-signout"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-primary/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-primary/10 text-primary-light border border-primary/20 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-text">SN Shops</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
