import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: '#f87171' };
  if (score <= 3) return { score: 2, label: 'Medium', color: '#fbbf24' };
  return { score: 3, label: 'Strong', color: '#34d399' };
}

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register({ username: form.username, email: form.email, password: form.password });
      login({ username: data.username, role: data.role }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="glass-card w-full max-w-md relative z-10" style={{ border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl shadow-accent/30">
            S
          </div>
          <h1 className="text-2xl font-bold text-text">Create Account</h1>
          <p className="text-text-muted text-sm mt-1">Get started with SN Shops</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingRight: '2.75rem' }}
                placeholder="Create password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                  padding: '0.25rem', display: 'flex', opacity: 0.6,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {/* Password Strength */}
            {form.password && (
              <>
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <p className="password-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              minLength={6}
              required
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: 500 }}>
                Passwords do not match
              </p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:text-primary font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
