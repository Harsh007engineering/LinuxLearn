import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCheckCircle, FiCircle, FiLock, FiArrowRight, FiZap } from 'react-icons/fi';
import api from '../services/api';

const MODULE_META = {
  1: { name: 'Introduction', desc: 'Your first steps in the Linux terminal.', color: 'text-terminal-green', bg: 'bg-terminal-green/10', border: 'border-terminal-green/20' },
  2: { name: 'Navigation & Files', desc: 'Move around and create files like a pro.', color: 'text-terminal-cyan', bg: 'bg-terminal-cyan/10', border: 'border-terminal-cyan/20' },
  3: { name: 'File Operations', desc: 'Copy, move, delete, read and write files.', color: 'text-terminal-yellow', bg: 'bg-terminal-yellow/10', border: 'border-terminal-yellow/20' },
  4: { name: 'Text Processing', desc: 'Search, filter, sort and analyze text files.', color: 'text-terminal-purple', bg: 'bg-terminal-purple/10', border: 'border-terminal-purple/20' },
};

const DIFFICULTY_BADGE = {
  beginner: 'bg-terminal-green/10 text-terminal-green border-terminal-green/20',
  intermediate: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/20',
  advanced: 'bg-terminal-red/10 text-terminal-red border-terminal-red/20',
};

export default function Learn() {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          api.get('/lessons'),
          api.get('/lessons/progress/all'),
        ]);
        setModules(lessonsRes.data.modules);
        setProgress(progressRes.data.progress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isCompleted = (lessonId) =>
    progress.some(p => p.lessonId?._id === lessonId && p.completed);

  const isLocked = (lesson, modLessons) => {
    const idx = modLessons.findIndex(l => l._id === lesson._id);
    if (idx === 0) return false;
    return !isCompleted(modLessons[idx - 1]._id);
  };

  const currentModule = modules.find(m => m.moduleId === activeModule);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-terminal-border rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-terminal-surface rounded-xl" />)}
          </div>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-terminal-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-terminal-text flex items-center gap-2">
          <FiBook className="text-terminal-cyan" size={22} />
          Lessons
        </h1>
        <p className="text-terminal-muted text-sm mt-1">
          {progress.filter(p => p.completed).length} of {modules.reduce((a, m) => a + m.lessons.length, 0)} lessons completed
        </p>
      </div>

      {/* Module tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {modules.map(mod => {
          const meta = MODULE_META[mod.moduleId] || {};
          const done = mod.lessons.filter(l => isCompleted(l._id)).length;
          const pct = Math.floor((done / mod.lessons.length) * 100);
          const isActive = activeModule === mod.moduleId;
          return (
            <button
              key={mod.moduleId}
              onClick={() => setActiveModule(mod.moduleId)}
              className={`
                text-left p-3.5 rounded-xl border transition-all duration-200
                ${isActive
                  ? `${meta.bg} ${meta.border} border`
                  : 'bg-terminal-surface border-terminal-border hover:border-terminal-muted/40'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? meta.color : 'text-terminal-muted'}`}>
                  Module {mod.moduleId}
                </span>
                <span className={`text-xs font-mono ${isActive ? meta.color : 'text-terminal-muted'}`}>
                  {done}/{mod.lessons.length}
                </span>
              </div>
              <p className={`text-sm font-medium ${isActive ? 'text-terminal-text' : 'text-terminal-muted'}`}>
                {meta.name}
              </p>
              <div className="mt-2 h-1 bg-terminal-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isActive ? meta.color.replace('text-', 'bg-') : 'bg-terminal-muted'}`}
                  style={{ width: `${pct}%`, opacity: isActive ? 1 : 0.5 }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson list */}
      {currentModule && (
        <div className="animate-fade-in">
          <div className="mb-4">
            <h2 className={`text-lg font-bold ${MODULE_META[activeModule]?.color}`}>
              {MODULE_META[activeModule]?.name}
            </h2>
            <p className="text-terminal-muted text-sm">{MODULE_META[activeModule]?.desc}</p>
          </div>

          <div className="space-y-2">
            {currentModule.lessons.map((lesson, idx) => {
              const done = isCompleted(lesson._id);
              const locked = isLocked(lesson, currentModule.lessons);

              return (
                <div
                  key={lesson._id}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                    ${done
                      ? 'bg-terminal-green/5 border-terminal-green/20'
                      : locked
                        ? 'bg-terminal-surface border-terminal-border opacity-60'
                        : 'bg-terminal-surface border-terminal-border hover:border-terminal-muted/50 hover:bg-terminal-border/20'}
                  `}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {done ? (
                      <FiCheckCircle className="text-terminal-green" size={20} />
                    ) : locked ? (
                      <FiLock className="text-terminal-border" size={18} />
                    ) : (
                      <FiCircle className="text-terminal-muted" size={20} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className={`font-medium text-sm ${locked ? 'text-terminal-muted' : 'text-terminal-text'}`}>
                        {lesson.title}
                      </h3>
                      <span className={`badge border ${DIFFICULTY_BADGE[lesson.difficulty]}`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                    <p className="text-terminal-muted text-xs truncate">{lesson.description}</p>
                  </div>

                  {/* XP badge */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <FiZap size={12} className="text-terminal-yellow" />
                    <span className="text-terminal-yellow text-xs font-mono">{lesson.xpReward}</span>
                  </div>

                  {/* Action */}
                  {!locked && (
                    <Link
                      to={`/learn/${lesson._id}`}
                      className={`
                        flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                        ${done
                          ? 'text-terminal-green hover:bg-terminal-green/10 border border-terminal-green/20'
                          : 'btn-primary'}
                      `}
                    >
                      {done ? 'Review' : 'Start'} <FiArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
