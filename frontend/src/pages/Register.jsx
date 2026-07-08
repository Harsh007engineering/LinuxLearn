import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTerminal, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to LinuxLearn 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-terminal-red', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-terminal-yellow', width: '50%' };
    if (p.length < 12) return { label: 'Good', color: 'bg-terminal-cyan', width: '75%' };
    return { label: 'Strong', color: 'bg-terminal-green', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4 py-10">
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
          <h1 className="text-2xl font-bold text-terminal-text">Create your account</h1>
          <p className="text-terminal-muted text-sm mt-1">Start your Linux journey today — it's free</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-terminal-text text-sm font-medium mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" size={15} />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="linuxhero"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <p className="text-terminal-muted text-xs mt-1">Letters, numbers, underscores only. 3–20 chars.</p>
            </div>

            <div>
              <label className="block text-terminal-text text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" size={15} />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-terminal-text text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-terminal-muted text-xs mt-1">Password strength: {strength.label}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-terminal-bg/30 border-t-terminal-bg rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-terminal-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-terminal-green hover:text-terminal-green/80 font-medium transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
