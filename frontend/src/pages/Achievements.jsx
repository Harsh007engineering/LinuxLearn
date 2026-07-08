import { useEffect, useState } from 'react';
import { FiAward, FiLock } from 'react-icons/fi';
import api from '../services/api';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/achievements')
      .then(({ data }) => setAchievements(data.achievements))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-terminal-text flex items-center gap-2">
          <FiAward className="text-terminal-purple" size={22} />
          Achievements
        </h1>
        <p className="text-terminal-muted text-sm mt-1">
          {earned.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-terminal-text font-medium">Overall Progress</span>
          <span className="text-terminal-muted">{earned.length}/{achievements.length}</span>
        </div>
        <div className="xp-bar h-3">
          <div
            className="xp-fill"
            style={{ width: `${achievements.length ? (earned.length / achievements.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-12 h-12 bg-terminal-border rounded-xl mb-3" />
              <div className="h-5 bg-terminal-border rounded w-32 mb-2" />
              <div className="h-4 bg-terminal-border rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Earned */}
          {earned.length > 0 && (
            <div className="mb-6">
              <h2 className="text-terminal-green text-sm font-semibold uppercase tracking-wider mb-3">
                ✅ Unlocked ({earned.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {earned.map(a => (
                  <div key={a._id} className="card-hover border-terminal-green/20 bg-terminal-green/5 animate-fade-in">
                    <div className="text-4xl mb-3">{a.icon}</div>
                    <h3 className="text-terminal-text font-semibold mb-1">{a.title}</h3>
                    <p className="text-terminal-muted text-sm leading-relaxed mb-3">{a.description}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-terminal-yellow text-xs">⚡</span>
                      <span className="text-terminal-yellow text-xs font-mono">+{a.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <h2 className="text-terminal-muted text-sm font-semibold uppercase tracking-wider mb-3">
                🔒 Locked ({locked.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locked.map(a => (
                  <div key={a._id} className="card opacity-60">
                    <div className="text-4xl mb-3 grayscale opacity-40">{a.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <FiLock size={13} className="text-terminal-muted" />
                      <h3 className="text-terminal-muted font-semibold">{a.title}</h3>
                    </div>
                    <p className="text-terminal-muted/70 text-sm leading-relaxed mb-3">{a.description}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-terminal-border text-xs">⚡</span>
                      <span className="text-terminal-border text-xs font-mono">+{a.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
