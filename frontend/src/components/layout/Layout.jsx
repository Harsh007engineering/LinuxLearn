import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiTerminal, FiBook, FiGrid, FiUser, FiAward, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiZap
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/learn', icon: FiBook, label: 'Learn' },
  { to: '/terminal', icon: FiTerminal, label: 'Terminal' },
  { to: '/achievements', icon: FiAward, label: 'Achievements' },
  { to: '/leaderboard', icon: FiBarChart2, label: 'Leaderboard' },
  { to: '/profile', icon: FiUser, label: 'Profile' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const xpPercent = Math.floor((user?.xp % 500) / 500 * 100);

  return (
    <div className="flex min-h-screen bg-terminal-bg">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-terminal-surface border-r border-terminal-border 
        flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-terminal-border">
          <div className="w-8 h-8 bg-terminal-green/20 rounded-lg flex items-center justify-center">
            <FiTerminal className="text-terminal-green" size={18} />
          </div>
          <span className="font-bold text-terminal-text text-lg tracking-tight">
            Linux<span className="text-terminal-green">Learn</span>
          </span>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-terminal-border">
          <div className="bg-terminal-bg rounded-lg p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terminal-green to-terminal-cyan flex items-center justify-center text-terminal-bg font-bold text-sm">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-terminal-text text-sm font-semibold truncate">{user?.username}</p>
                <p className="text-terminal-muted text-xs">Level {user?.level}</p>
              </div>
            </div>
            {/* XP bar */}
            <div className="flex items-center gap-2">
              <FiZap size={10} className="text-terminal-yellow flex-shrink-0" />
              <div className="flex-1 xp-bar">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <span className="text-terminal-muted text-xs">{user?.xp % 500}/500</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-terminal-green/10 text-terminal-green border border-terminal-green/20'
                  : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-border/30'}
              `}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-terminal-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium 
                       text-terminal-muted hover:text-terminal-red hover:bg-terminal-red/10 
                       transition-all duration-150 w-full"
          >
            <FiLogOut size={17} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-terminal-surface border-b border-terminal-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <FiTerminal className="text-terminal-green" size={18} />
            <span className="font-bold text-terminal-text">Linux<span className="text-terminal-green">Learn</span></span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-terminal-muted hover:text-terminal-text p-1"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
