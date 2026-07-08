import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiArrowRight, FiZap, FiCheckCircle,
  FiTerminal, FiTarget, FiInfo, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';
import TerminalEmulator from '../components/terminal/TerminalEmulator';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMission, setCurrentMission] = useState(0);
  const [missionInput, setMissionInput] = useState('');
  const [missionResult, setMissionResult] = useState(null); // { correct, message, hint }
  const [allDone, setAllDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await api.get(`/lessons/${id}`);
        setLesson(data.lesson);
        setProgress(data.progress);
        if (data.progress?.completed) setAllDone(true);
      } catch {
        navigate('/learn');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, navigate]);

  const submitMission = async () => {
    if (!missionInput.trim()) return;
    const mission = lesson.missions[currentMission];
    try {
      const { data } = await api.post(`/lessons/${id}/mission`, {
        missionId: mission.id,
        command: missionInput.trim()
      });

      if (data.correct) {
        setMissionResult({ correct: true, message: data.successMessage, explanation: data.explanation });
        toast.success(`✅ ${data.successMessage} +${data.xpEarned} XP`);
        if (data.user) updateUser(data.user);

        setTimeout(() => {
          if (currentMission + 1 < lesson.missions.length) {
            setCurrentMission(prev => prev + 1);
            setMissionInput('');
            setMissionResult(null);
            setAttempts(0);
          } else {
            // All missions complete — mark lesson complete
            markLessonComplete();
          }
        }, 2000);
      } else {
        setAttempts(prev => prev + 1);
        setMissionResult({
          correct: false,
          message: attempts >= 1 ? `Hint: ${data.hint}` : 'Not quite right. Try again!',
        });
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const markLessonComplete = async () => {
    try {
      const { data } = await api.post(`/lessons/${id}/complete`);
      setAllDone(true);
      setShowConfetti(true);
      if (data.user) updateUser(data.user);
      toast.success(`🎉 Lesson complete! +${data.xpEarned} XP`);
      setTimeout(() => setShowConfetti(false), 5000);
      data.newAchievements?.forEach(a => {
        toast.success(`🏆 ${a.title} unlocked!`, { duration: 5000 });
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTerminalCommand = (cmd, result) => {
    // If terminal command matches current mission, auto-submit
    if (lesson?.missions[currentMission] && !allDone) {
      const mission = lesson.missions[currentMission];
      const normalize = s => s.trim().replace(/\s+/g, ' ').toLowerCase();
      if (normalize(cmd) === normalize(mission.expectedCommand)) {
        setMissionInput(cmd);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-terminal-border rounded w-64 mb-4" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-terminal-surface rounded-xl" />)}
          </div>
          <div className="h-80 bg-terminal-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const mission = lesson.missions[currentMission];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} colors={['#3fb950', '#79c0ff', '#d29922', '#bc8cff']} />}

      {/* Back nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/learn" className="btn-ghost flex items-center gap-1.5 text-sm">
          <FiArrowLeft size={14} /> Back to Lessons
        </Link>
        <span className="text-terminal-border">/</span>
        <span className="text-terminal-muted text-sm">Module {lesson.moduleId}</span>
        <span className="text-terminal-border">/</span>
        <span className="text-terminal-text text-sm font-medium truncate">{lesson.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: lesson content */}
        <div className="space-y-4">
          {/* Title card */}
          <div className="card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20">
                    Module {lesson.moduleId}
                  </span>
                  <span className="badge bg-terminal-yellow/10 text-terminal-yellow border border-terminal-yellow/20">
                    <FiZap size={10} /> {lesson.xpReward} XP
                  </span>
                </div>
                <h1 className="text-xl font-bold text-terminal-text">{lesson.title}</h1>
              </div>
              {allDone && <FiCheckCircle className="text-terminal-green flex-shrink-0" size={22} />}
            </div>
            <p className="text-terminal-muted text-sm leading-relaxed">{lesson.description}</p>
          </div>

          {/* Explanation */}
          <div className="card">
            <h3 className="text-terminal-text font-semibold mb-2 flex items-center gap-2">
              <FiInfo size={15} className="text-terminal-cyan" />
              What is <code className="text-terminal-green font-mono">{lesson.command}</code>?
            </h3>
            <p className="text-terminal-muted text-sm leading-relaxed">{lesson.explanation}</p>
            {lesson.syntax && (
              <div className="mt-3 bg-terminal-bg rounded-lg px-3 py-2 font-mono text-sm">
                <span className="text-terminal-muted text-xs uppercase tracking-wider">Syntax: </span>
                <span className="text-terminal-green">{lesson.syntax}</span>
              </div>
            )}
          </div>

          {/* Examples - collapsible */}
          {lesson.examples?.length > 0 && (
            <div className="card">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setShowExamples(!showExamples)}
              >
                <h3 className="text-terminal-text font-semibold flex items-center gap-2">
                  <FiTerminal size={15} className="text-terminal-green" />
                  Examples
                </h3>
                {showExamples ? <FiChevronUp size={15} className="text-terminal-muted" /> : <FiChevronDown size={15} className="text-terminal-muted" />}
              </button>
              {showExamples && (
                <div className="mt-3 space-y-2">
                  {lesson.examples.map((ex, i) => (
                    <div key={i} className="bg-terminal-bg rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-terminal-green">$</span>
                        <span className="text-terminal-text">{ex.command}</span>
                      </div>
                      <p className="text-terminal-muted text-xs mt-1 ml-4">{ex.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Common mistakes */}
          {lesson.commonMistakes?.length > 0 && (
            <div className="card border-terminal-red/20 bg-terminal-red/5">
              <h3 className="text-terminal-red text-sm font-semibold mb-2">⚠️ Common Mistakes</h3>
              <ul className="space-y-1">
                {lesson.commonMistakes.map((m, i) => (
                  <li key={i} className="text-terminal-muted text-xs flex gap-2">
                    <span>•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: terminal + mission */}
        <div className="space-y-4">
          {/* Terminal */}
          <TerminalEmulator
            onCommandRun={handleTerminalCommand}
            className="min-h-[280px]"
          />

          {/* Mission panel */}
          {lesson.missions?.length > 0 && !allDone && (
            <div className="card border-terminal-yellow/20 bg-terminal-yellow/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-terminal-yellow font-semibold flex items-center gap-2">
                  <FiTarget size={16} />
                  Mission {currentMission + 1} of {lesson.missions.length}
                </h3>
                <span className="badge bg-terminal-yellow/10 text-terminal-yellow border border-terminal-yellow/20">
                  +{mission.xpReward} XP
                </span>
              </div>

              <p className="text-terminal-text text-sm leading-relaxed mb-3">{mission.instruction}</p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-green font-mono text-sm">$</span>
                  <input
                    type="text"
                    className="input-field pl-7 font-mono"
                    placeholder="Type your command…"
                    value={missionInput}
                    onChange={e => setMissionInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitMission()}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button onClick={submitMission} className="btn-primary px-4">
                  Run
                </button>
              </div>

              {missionResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  missionResult.correct
                    ? 'bg-terminal-green/10 border border-terminal-green/20 text-terminal-green'
                    : 'bg-terminal-red/10 border border-terminal-red/20 text-terminal-red'
                }`}>
                  {missionResult.correct ? '✅ ' : '❌ '}
                  {missionResult.message}
                  {missionResult.explanation && (
                    <p className="text-terminal-muted text-xs mt-1">{missionResult.explanation}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lesson complete */}
          {allDone && (
            <div className="card border-terminal-green/30 bg-terminal-green/5 text-center py-6">
              <FiCheckCircle className="text-terminal-green mx-auto mb-3" size={36} />
              <h3 className="text-terminal-text font-bold text-lg mb-1">Lesson Complete! 🎉</h3>
              <p className="text-terminal-muted text-sm mb-4">
                You've mastered <code className="text-terminal-green">{lesson.command}</code>!
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/learn" className="btn-secondary flex items-center gap-1.5">
                  <FiArrowLeft size={14} /> All Lessons
                </Link>
                <Link to="/terminal" className="btn-primary flex items-center gap-1.5">
                  Practice More <FiTerminal size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
