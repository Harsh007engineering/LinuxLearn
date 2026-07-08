import { useEffect, useState } from 'react';
import {
  FiUser, FiZap, FiBook, FiTerminal, FiAward,
  FiCalendar, FiEdit2, FiCheck, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        setProfile(data);
        setNewUsername(data.user?.username || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setEditingUsername(false);
      return;
    }
    try {
      const { data } = await api.patch('/profile', { username: newUsername });
      updateUser({ username: data.user.username });
      toast.success('Username updated!');
      setEditingUsername(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update username.');
    }
  };

  const xpInLevel = (user?.xp || 0) % 500;
  const xpPercent = Math.floor((xpInLevel / 500) * 100);

  const joinDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-pulse">
        <div className="h-32 bg-terminal-surface rounded-xl mb-4" />
        <div className="grid lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-terminal-surface rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Profile header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-terminal-green to-terminal-cyan flex items-center justify-center text-terminal-bg font-bold text-2xl flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Username + edit */}
            <div className="flex items-center gap-2 mb-1">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') setEditingUsername(false); }}
                    className="input-field py-1 text-lg font-bold w-48"
                    autoFocus
                  />
                  <button onClick={saveUsername} className="text-terminal-green hover:text-terminal-green/80 p-1">
                    <FiCheck size={16} />
                  </button>
                  <button onClick={() => setEditingUsername(false)} className="text-terminal-muted hover:text-terminal-text p-1">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-terminal-text">{user?.username}</h1>
                  <button
                    onClick={() => { setEditingUsername(true); setNewUsername(user?.username || ''); }}
                    className="text-terminal-muted hover:text-terminal-text transition-colors p-1"
                    title="Edit username"
                  >
                    <FiEdit2 size={13} />
                  </button>
                </>
              )}
            </div>
            <p className="text-terminal-muted text-sm">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1 text-terminal-muted text-xs">
              <FiCalendar size={11} />
              Joined {joinDate}
            </div>
          </div>

          {/* Level badge */}
          <div className="text-center flex-shrink-0">
            <div className="w-14 h-14 rounded-full border-2 border-terminal-green flex items-center justify-center">
              <div>
                <div className="text-terminal-green font-bold text-lg leading-none">{user?.level}</div>
                <div className="text-terminal-muted text-xs">LVL</div>
              </div>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-terminal-muted mb-1">
            <span>Level {user?.level} → {(user?.level || 1) + 1}</span>
            <span>{xpInLevel} / 500 XP</span>
          </div>
          <div className="xp-bar h-2.5">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: FiZap, label: 'Total XP', value: user?.xp?.toLocaleString() || 0, color: 'text-terminal-yellow' },
          { icon: FiBook, label: 'Lessons Done', value: user?.lessonsCompleted || 0, color: 'text-terminal-cyan' },
          { icon: FiTerminal, label: 'Commands', value: user?.commandsUsed?.toLocaleString() || 0, color: 'text-terminal-green' },
          { icon: FiAward, label: 'Day Streak', value: `${user?.streak || 0} 🔥`, color: 'text-terminal-orange' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon className={`${color} mx-auto mb-2`} size={20} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-terminal-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Earned achievements */}
        <div className="card">
          <h3 className="text-terminal-text font-semibold mb-4 flex items-center gap-2">
            <FiAward size={16} className="text-terminal-purple" />
            Achievements
          </h3>
          {profile?.user?.achievements?.length === 0 ? (
            <p className="text-terminal-muted text-sm text-center py-4">No achievements yet. Keep learning!</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(profile?.user?.achievements || []).slice(0, 9).map((a, i) => (
                <div key={i} title={a.title} className="text-center p-2 bg-terminal-bg rounded-lg">
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <p className="text-terminal-muted text-xs truncate">{a.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent commands */}
        <div className="card">
          <h3 className="text-terminal-text font-semibold mb-4 flex items-center gap-2">
            <FiTerminal size={16} className="text-terminal-green" />
            Recent Activity
          </h3>
          {profile?.recentHistory?.length === 0 ? (
            <p className="text-terminal-muted text-sm text-center py-4">No commands yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {(profile?.recentHistory || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-terminal-green font-mono flex-shrink-0">$</span>
                  <span className="text-terminal-text font-mono truncate flex-1">{h.command}</span>
                  {h.xpEarned > 0 && (
                    <span className="text-terminal-yellow flex-shrink-0">+{h.xpEarned}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
