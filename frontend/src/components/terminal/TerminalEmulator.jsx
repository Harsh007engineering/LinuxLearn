import { useState, useRef, useEffect, useCallback } from 'react';
import { FiTerminal, FiRotateCcw, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ANSI_COLORS = {
  '\x1b[33m': '<span class="text-yellow-400">',
  '\x1b[36m': '<span class="text-cyan-400">',
  '\x1b[32m': '<span class="text-green-400">',
  '\x1b[31m': '<span class="text-red-400">',
  '\x1b[0m': '</span>',
  '\x1b[1m': '<strong>',
  '\x1b[m': '</span>'
};

function ansiToHtml(text) {
  if (!text) return '';
  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  Object.entries(ANSI_COLORS).forEach(([code, html]) => {
    result = result.split(code).join(html);
  });
  return result;
}

const INITIAL_BANNER = `LinuxLearn Terminal v1.0.0
Type 'help' to see available commands.
Type 'explain <command>' to learn about any command.
─────────────────────────────────────────`;

export default function TerminalEmulator({ missionMode = false, onCommandRun = null, className = '' }) {
  const { user, updateUser } = useAuth();
  const [lines, setLines] = useState([{ type: 'banner', text: INITIAL_BANNER }]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Load filesystem state on mount
  useEffect(() => {
    api.get('/terminal/filesystem').then(({ data }) => {
      setCurrentPath(data.currentPath);
    }).catch(() => {});
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Focus input when clicking terminal
  const focusInput = () => inputRef.current?.focus();

  const getPrompt = () => {
    const displayPath = currentPath.replace('/home/user', '~');
    return `${user?.username || 'user'}@linuxlearn:${displayPath}$`;
  };

  const addLine = useCallback((type, text, extra = {}) => {
    setLines(prev => [...prev, { type, text, id: Date.now() + Math.random(), ...extra }]);
  }, []);

  const runCommand = useCallback(async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add the command line to display
    addLine('input', trimmed, { prompt: getPrompt() });

    // Update history
    const newHistory = [trimmed, ...history.slice(0, 49)];
    setHistory(newHistory);
    setHistoryIndex(-1);

    // Handle clear client-side immediately
    if (trimmed === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/terminal/execute', {
        command: trimmed,
        history: history.slice(0, 20)
      });

      if (data.output === '__CLEAR__') {
        setLines([]);
      } else if (data.output) {
        addLine('output', data.output);
      }

      if (data.newPath) setCurrentPath(data.newPath);

      // XP feedback
      if (data.xpEarned > 0) {
        addLine('xp', `+${data.xpEarned} XP`);
        if (data.user) updateUser(data.user);
      }

      // New achievements
      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach(a => {
          toast.success(`🏆 Achievement unlocked: ${a.title}`, { duration: 5000 });
          addLine('achievement', `🏆 Achievement unlocked: ${a.title} (+${a.xpReward} XP)`);
        });
      }

      // Notify parent if in mission mode
      if (onCommandRun) {
        onCommandRun(trimmed, data);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Connection error. Is the server running?';
      addLine('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [history, currentPath, addLine, updateUser, onCommandRun, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIdx);
      setInput(history[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion for common commands
      const commands = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'echo', 'clear', 'help', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'sort', 'date', 'whoami', 'hostname', 'explain'];
      const matches = commands.filter(c => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
    } else if (e.key === 'c' && e.ctrlKey) {
      setInput('');
      addLine('input', '^C', { prompt: getPrompt() });
    }
  };

  const resetFilesystem = async () => {
    try {
      await api.delete('/terminal/filesystem/reset');
      setCurrentPath('/home/user');
      setLines([{ type: 'banner', text: INITIAL_BANNER }]);
      toast.success('Filesystem reset to defaults.');
    } catch {
      toast.error('Failed to reset filesystem.');
    }
  };

  return (
    <div className={`
      flex flex-col bg-terminal-bg border border-terminal-border rounded-xl overflow-hidden
      ${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}
      ${className}
    `}>
      {/* Terminal header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c2128] border-b border-terminal-border">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-terminal-muted text-xs font-mono ml-2">
            {user?.username}@linuxlearn: {currentPath.replace('/home/user', '~')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetFilesystem}
            title="Reset filesystem"
            className="text-terminal-muted hover:text-terminal-text p-1.5 rounded hover:bg-terminal-border/40 transition-colors"
          >
            <FiRotateCcw size={13} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="text-terminal-muted hover:text-terminal-text p-1.5 rounded hover:bg-terminal-border/40 transition-colors"
          >
            {isFullscreen ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div
        className="flex-1 overflow-y-auto p-4 cursor-text font-mono text-sm"
        onClick={focusInput}
        style={{ minHeight: missionMode ? '250px' : '400px', maxHeight: isFullscreen ? undefined : '65vh' }}
      >
        {lines.map((line, i) => (
          <div key={line.id || i} className="terminal-line-enter leading-relaxed">
            {line.type === 'banner' && (
              <div className="text-terminal-green/80 whitespace-pre mb-2 text-xs">{line.text}</div>
            )}
            {line.type === 'input' && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-terminal-green font-medium flex-shrink-0">{line.prompt}</span>
                <span className="text-terminal-text">{line.text}</span>
              </div>
            )}
            {line.type === 'output' && (
              <div
                className="text-terminal-text/90 whitespace-pre-wrap ml-0 mb-0.5"
                dangerouslySetInnerHTML={{ __html: ansiToHtml(line.text) }}
              />
            )}
            {line.type === 'error' && (
              <div className="text-terminal-red whitespace-pre-wrap">{line.text}</div>
            )}
            {line.type === 'xp' && (
              <div className="text-terminal-yellow text-xs font-medium">{line.text}</div>
            )}
            {line.type === 'achievement' && (
              <div className="text-terminal-purple text-xs font-medium bg-terminal-purple/10 px-2 py-1 rounded mt-1">{line.text}</div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex gap-1 py-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-terminal-muted inline-block"
                style={{ animation: `blink 1s step-end ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        )}

        {/* Current input line */}
        {!isLoading && (
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-terminal-green font-medium flex-shrink-0">{getPrompt()}</span>
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-terminal-text">{input}</span>
              <span className="animate-blink text-terminal-green font-bold ml-px">▋</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="sr-only"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Terminal input"
        autoFocus
      />
    </div>
  );
}
