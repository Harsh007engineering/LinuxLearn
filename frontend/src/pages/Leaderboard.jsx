import { useEffect, useState } from 'react';
import { FiBarChart2, FiZap, FiStar, FiBook, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TABS = [
  { key: 'xp', label: 'Top XP', icon: FiZap, color: 'text-terminal-yellow', endpoint: '/leaderboard/xp', field: 'xp', unit: 'XP' },
  { key: 'streak', label: 'Streak', icon: FiStar, color: 'text-terminal-orange', endpoint: '/leaderboard/streak', field: 'streak', unit: 'days' },
  { key: 'lessons', label: 'Lessons', icon: FiBook, color: 'text-terminal-cyan', endpoint: '/leaderboard/lessons', field: 'lessonsCompleted', unit: 'lessons' },
];

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
const RANK_BG = ['bg-yellow-400/10 border-yellow-400/20', 'bg-gray-400/10 border-gray-400/20', 'bg-orange-400/10 border-orange-400/20'];

function RankIcon({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-terminal-muted text-sm font-mono w-6 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('xp');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const tab = TABS.find(t => t.key === activeTab);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (data[activeTab]) return;
      setLoading(true);
      try {
        const { data: res } = await api.get(tab.endpoint);
        setData(prev => ({ ...prev, [activeTab]: res.leaderboard }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const list = data[activeTab] || [];
  const myRank = list.findIndex(u => u._id === user?._id) + 1;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-terminal-text flex items-center gap-2">
          <FiBarChart2 className="text-terminal-cyan" size={22} />
          Leaderboard
        </h1>
        <p className="text-terminal-muted text-sm mt-1">
          See how you compare with other learners
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-terminal-surface rounded-xl p-1 border border-terminal-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === t.key
                ? `bg-terminal-bg ${t.color} border border-terminal-border`
                : 'text-terminal-muted hover:text-terminal-text'}
            `}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Your rank */}
      {myRank > 0 && (
        <div className="card border-terminal-green/20 bg-terminal-green/5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-terminal-muted text-sm">Your rank</span>
            <span className="text-terminal-green font-bold text-lg">#{myRank}</span>
          </div>
          <div className="text-terminal-muted text-sm">
            {list.find(u => u._id === user?._id)?.[tab.field]?.toLocaleString()} {tab.unit}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-terminal-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <FiAward size={40} className="text-terminal-border mx-auto mb-3" />
          <p className="text-terminal-muted">No data yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry._id === user?._id;
            const isTop3 = rank <= 3;
            return (
              <div
                key={entry._id}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl border transition-all
                  ${isMe
                    ? 'bg-terminal-green/10 border-terminal-green/30'
                    : isTop3
                      ? `${RANK_BG[rank - 1]} border`
                      : 'bg-terminal-surface border-terminal-border'}
                `}
              >
                <div className="w-8 flex justify-center flex-shrink-0">
                  <RankIcon rank={rank} />
                </div>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${isMe ? 'bg-terminal-green text-terminal-bg' : 'bg-gradient-to-br from-terminal-cyan/30 to-terminal-purple/30 text-terminal-text'}`}>
                  {entry.username?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${isMe ? 'text-terminal-green' : 'text-terminal-text'}`}>
                      {entry.username}
                      {isMe && <span className="text-xs ml-1 text-terminal-green/70">(you)</span>}
                    </span>
                    <span className="text-terminal-muted text-xs">Lv.{entry.level}</span>
                  </div>
                </div>

                <div className={`font-mono font-semibold text-sm flex-shrink-0 ${tab.color}`}>
                  {entry[tab.field]?.toLocaleString()}
                  <span className="text-terminal-muted text-xs ml-1">{tab.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
