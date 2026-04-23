import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
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
            <>
              <Link
                to="/dashboard"
                className="btn-primary text-sm no-underline"
              >
                Go to Dashboard →
              </Link>
            </>
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
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 lg:pt-24 pb-20">
        {isAuthenticated && (
          <div className="mb-6 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium inline-flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Welcome back, {user?.username}!
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-text leading-tight max-w-4xl animate-fade-in-up">
          Manage Your
          <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Shop Smarter
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
              <span>📊</span> Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-4 no-underline shadow-xl shadow-primary/25 hover:shadow-primary/40"
              >
                Start for Free →
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
        <div className="mt-20 lg:mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl w-full">
          {[
            {
              icon: '📦',
              title: 'Inventory',
              desc: 'Track stock levels and products in real time',
              gradient: 'from-primary to-accent',
            },
            {
              icon: '🛒',
              title: 'POS Sales',
              desc: 'Fast, intuitive point-of-sale checkout',
              gradient: 'from-secondary to-primary',
            },
            {
              icon: '👥',
              title: 'Customers',
              desc: 'Manage customer profiles and history',
              gradient: 'from-accent to-primary',
            },
            {
              icon: '💳',
              title: 'Debt Tracking',
              desc: 'Monitor and collect outstanding debts',
              gradient: 'from-warning to-danger',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card group text-left hover:translate-y-[-4px] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-text mb-1">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-text-muted text-sm border-t border-primary/5">
        © {new Date().getFullYear()} SN Shops Management. Built with ❤️
      </footer>
    </div>
  );
}
