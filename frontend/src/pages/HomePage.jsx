import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { capitalize } from '../utils/helpers';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-accent/8 rounded-full blur-[140px] animate-blob-delayed" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[120px] animate-blob-slow" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
            S
          </div>
          <div>
            <span className="text-lg font-bold text-text tracking-tight">SN Shops</span>
            <span className="hidden sm:inline text-[0.65rem] text-text-muted uppercase tracking-widest ml-2">Management</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-primary text-sm no-underline"
            >
              Go to Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-light hover:bg-primary/10 transition-all duration-200 no-underline border border-transparent hover:border-primary/20"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm no-underline"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 lg:pt-24 pb-12">
        {isAuthenticated && (
          <div className="mb-6 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium inline-flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Welcome back, {capitalize(user?.username)}!
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-text leading-tight max-w-4xl animate-fade-in-up">
          Manage Your Shop{' '}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Smarter
          </span>
        </h1>

        <p className="mt-6 text-text-muted text-lg sm:text-xl max-w-2xl leading-relaxed animate-fade-in-up-delayed">
          Track inventory, process sales, manage customers, and handle debt — all from one powerful, beautiful dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up-delayed-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-primary text-base px-8 py-4 no-underline shadow-xl shadow-primary/25 hover:shadow-primary/40"
            >
              Open Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-4 no-underline shadow-xl shadow-primary/25 hover:shadow-primary/40"
              >
                Start for Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-base px-8 py-4 no-underline"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl w-full">
          {[
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
              title: 'Inventory',
              desc: 'Track stock levels and products in real time',
              gradient: 'from-primary to-accent',
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
              title: 'POS Sales',
              desc: 'Fast, intuitive point-of-sale checkout',
              gradient: 'from-secondary to-primary',
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
              title: 'Customers',
              desc: 'Manage customer profiles and history',
              gradient: 'from-accent to-primary',
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>,
              title: 'Debt Tracking',
              desc: 'Monitor and collect outstanding debts',
              gradient: 'from-warning to-danger',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card group text-left hover:translate-y-[-4px] transition-all duration-300 cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-text mb-1">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-3">{feature.desc}</p>
              <span className="text-xs font-semibold text-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                Learn more
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-primary/5">
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 lg:px-12 gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} SN Shops Management. Built with ❤️
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-muted text-sm hover:text-text transition no-underline">Privacy</a>
            <a href="#" className="text-text-muted text-sm hover:text-text transition no-underline">Terms</a>
            <a href="#" className="text-text-muted text-sm hover:text-text transition no-underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
