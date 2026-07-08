import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTerminal, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message || 'Welcome back!');
      if (data.streakBonus > 0) {
        toast.success(`🔥 Daily streak bonus: +${data.streakBonus} XP`, { duration: 4000 });
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-terminal-green/20 rounded-xl flex items-center justify-center">
              <FiTerminal className="text-terminal-green" size={20} />
            </div>
            <span className="font-bold text-xl text-terminal-text">
              Linux<span className="text-terminal-green">Learn</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-terminal-text">Welcome back</h1>
          <p className="text-terminal-muted text-sm mt-1">Log in to continue your Linux journey</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-terminal-text text-sm font-medium mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" size={15} />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-terminal-text text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-terminal-bg/30 border-t-terminal-bg rounded-full animate-spin" />
                  Logging in...
                </>
              ) : 'Log In'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-terminal-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-terminal-green hover:text-terminal-green/80 font-medium transition-colors">
              Create one free
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 text-center">
          <p className="text-terminal-muted text-xs">
            No account? <Link to="/register" className="text-terminal-cyan hover:underline">Register in seconds</Link> — it's free.
          </p>
        </div>
      </div>
    </div>
  );
}
