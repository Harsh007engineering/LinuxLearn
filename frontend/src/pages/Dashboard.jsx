import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap, FiBook, FiAward, FiTerminal, FiTrendingUp,
  FiArrowRight, FiClock, FiTarget, FiStar
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-current/10`}
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <Icon className={color} size={18} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-terminal-text text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-terminal-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="w-9 h-9 bg-terminal-border rounded-lg mb-3" />
      <div className="h-7 bg-terminal-border rounded w-16 mb-1" />
      <div className="h-4 bg-terminal-border rounded w-24" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, historyRes, lessonsRes] = await Promise.all([
          api.get('/lessons/progress/all'),
          api.get('/history?limit=5'),
          api.get('/lessons')
        ]);
        setProgress(progressRes.data.progress);
        setRecentHistory(historyRes.data.history);
        setModules(lessonsRes.data.modules);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const xpInLevel = (user?.xp || 0) % 500;
  const xpPercent = Math.floor((xpInLevel / 500) * 100);
  const completedLessons = progress.filter(p => p.completed).length;

  // Find first incomplete lesson for "Continue" CTA
  const findNextLesson = () => {
    if (!modules.length) return null;
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        const p = progress.find(pr => pr.lessonId?._id === lesson._id);
        if (!p?.completed) return lesson;
      }
    }
    return null;
  };
  const nextLesson = findNextLesson();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-terminal-text">
          Good to see you, <span className="text-terminal-green">{user?.username}</span> 👋
        </h1>
        <p className="text-terminal-muted text-sm mt-1">
          Level {user?.level} · {user?.xp?.toLocaleString()} XP total
        </p>
      </div>

      {/* XP progress bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-terminal-green" size={16} />
            <span className="text-terminal-text text-sm font-medium">Level {user?.level} Progress</span>
          </div>
          <span className="text-terminal-muted text-xs font-mono">{xpInLevel} / 500 XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <p className="text-terminal-muted text-xs mt-1.5">
          {500 - xpInLevel} XP to Level {(user?.level || 1) + 1}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={FiZap}
              label="Total XP"
              value={user?.xp?.toLocaleString() || 0}
              color="text-terminal-yellow"
              sub={`Level ${user?.level}`}
            />
            <StatCard
              icon={FiBook}
              label="Lessons Done"
              value={completedLessons}
              color="text-terminal-cyan"
              sub="Keep going!"
            />
            <StatCard
              icon={FiTarget}
              label="Commands Run"
              value={user?.commandsUsed?.toLocaleString() || 0}
              color="text-terminal-green"
            />
            <StatCard
              icon={FiStar}
              label="Day Streak"
              value={`${user?.streak || 0}🔥`}
              color="text-terminal-orange"
              sub="Login daily"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning CTA */}
        <div className="lg:col-span-2 space-y-4">
          {nextLesson && (
            <div className="card border-terminal-green/30 bg-terminal-green/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-terminal-green text-xs font-medium uppercase tracking-wider mb-1">
                    Continue Learning
                  </p>
                  <h3 className="text-terminal-text font-semibold text-lg">{nextLesson.title}</h3>
                  <p className="text-terminal-muted text-sm mt-1 line-clamp-2">{nextLesson.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="badge bg-terminal-green/10 text-terminal-green border border-terminal-green/20">
                      Module {nextLesson.moduleId}
                    </span>
                    <span className="badge bg-terminal-yellow/10 text-terminal-yellow border border-terminal-yellow/20">
                      +{nextLesson.xpReward} XP
                    </span>
                  </div>
                </div>
                <Link
                  to={`/learn/${nextLesson._id}`}
                  className="btn-primary flex-shrink-0 flex items-center gap-2"
                >
                  Continue <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Module progress */}
          <div className="card">
            <h3 className="text-terminal-text font-semibold mb-4 flex items-center gap-2">
              <FiBook size={16} className="text-terminal-cyan" />
              Module Progress
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-terminal-border rounded w-32 mb-1.5" />
                    <div className="h-2 bg-terminal-border rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map(mod => {
                  const total = mod.lessons.length;
                  const done = mod.lessons.filter(l =>
                    progress.find(p => p.lessonId?._id === l._id && p.completed)
                  ).length;
                  const pct = total > 0 ? Math.floor((done / total) * 100) : 0;
                  const moduleNames = {
                    1: 'Introduction',
                    2: 'Navigation & Files',
                    3: 'File Operations',
                    4: 'Text Processing'
                  };
                  return (
                    <div key={mod.moduleId}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-terminal-text text-sm">
                          Module {mod.moduleId} — {moduleNames[mod.moduleId] || `Module ${mod.moduleId}`}
                        </span>
                        <span className="text-terminal-muted text-xs font-mono">{done}/{total}</span>
                      </div>
                      <div className="xp-bar">
                        <div
                          className="xp-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/learn" className="btn-secondary mt-4 w-full flex items-center justify-center gap-2">
              View All Lessons <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card">
            <h3 className="text-terminal-text font-semibold mb-3 flex items-center gap-2">
              <FiTerminal size={16} className="text-terminal-green" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to="/terminal" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-terminal-border/30 transition-colors group">
                <div className="w-8 h-8 bg-terminal-green/10 rounded-lg flex items-center justify-center">
                  <FiTerminal size={15} className="text-terminal-green" />
                </div>
                <div>
                  <p className="text-terminal-text text-sm font-medium">Open Terminal</p>
                  <p className="text-terminal-muted text-xs">Free practice mode</p>
                </div>
                <FiArrowRight size={14} className="text-terminal-muted ml-auto group-hover:text-terminal-text transition-colors" />
              </Link>
              <Link to="/achievements" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-terminal-border/30 transition-colors group">
                <div className="w-8 h-8 bg-terminal-purple/10 rounded-lg flex items-center justify-center">
                  <FiAward size={15} className="text-terminal-purple" />
                </div>
                <div>
                  <p className="text-terminal-text text-sm font-medium">Achievements</p>
                  <p className="text-terminal-muted text-xs">View your badges</p>
                </div>
                <FiArrowRight size={14} className="text-terminal-muted ml-auto group-hover:text-terminal-text transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent commands */}
          <div className="card">
            <h3 className="text-terminal-text font-semibold mb-3 flex items-center gap-2">
              <FiClock size={16} className="text-terminal-muted" />
              Recent Commands
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-5 bg-terminal-border rounded animate-pulse" />
                ))}
              </div>
            ) : recentHistory.length === 0 ? (
              <div className="text-center py-4">
                <FiTerminal size={24} className="text-terminal-border mx-auto mb-2" />
                <p className="text-terminal-muted text-sm">No commands yet.</p>
                <Link to="/terminal" className="text-terminal-green text-xs hover:underline mt-1 inline-block">
                  Open the terminal →
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-terminal-green font-mono text-xs flex-shrink-0">$</span>
                    <span className="text-terminal-text font-mono text-xs truncate">{h.command}</span>
                    {h.xpEarned > 0 && (
                      <span className="text-terminal-yellow text-xs flex-shrink-0">+{h.xpEarned}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
