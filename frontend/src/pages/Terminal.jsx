import { FiTerminal, FiInfo } from 'react-icons/fi';
import TerminalEmulator from '../components/terminal/TerminalEmulator';

const QUICK_COMMANDS = [
  { cmd: 'pwd', desc: 'Show current location' },
  { cmd: 'ls', desc: 'List files' },
  { cmd: 'tree', desc: 'Visual directory tree' },
  { cmd: 'mkdir test', desc: 'Create a folder' },
  { cmd: 'touch file.txt', desc: 'Create a file' },
  { cmd: 'help', desc: 'All commands' },
  { cmd: 'explain ls', desc: 'Explain a command' },
];

export default function Terminal() {
  return (
    <div className="p-6 lg:p-8 h-full flex flex-col max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-terminal-text flex items-center gap-2">
            <FiTerminal className="text-terminal-green" size={22} />
            Terminal
          </h1>
          <p className="text-terminal-muted text-sm mt-0.5">
            Free practice mode — explore commands freely
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-terminal-muted text-xs bg-terminal-surface border border-terminal-border rounded-lg px-3 py-1.5">
          <FiInfo size={12} />
          <span>Commands run here earn XP</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 flex-1">
        {/* Terminal — takes 3/4 */}
        <div className="lg:col-span-3">
          <TerminalEmulator className="h-full" />
        </div>

        {/* Sidebar — command reference */}
        <div className="space-y-3">
          <div className="card">
            <h3 className="text-terminal-text font-semibold text-sm mb-3">Quick Reference</h3>
            <div className="space-y-1.5">
              {QUICK_COMMANDS.map(({ cmd, desc }) => (
                <div key={cmd} className="group">
                  <div className="flex items-center gap-1.5">
                    <span className="text-terminal-green font-mono text-xs">$</span>
                    <code className="text-terminal-cyan text-xs font-mono">{cmd}</code>
                  </div>
                  <p className="text-terminal-muted text-xs ml-3.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-terminal-green/5 border-terminal-green/20">
            <p className="text-terminal-green text-xs font-semibold mb-1.5">💡 Pro tip</p>
            <p className="text-terminal-muted text-xs leading-relaxed">
              Press <kbd className="bg-terminal-border px-1 rounded text-terminal-text">↑</kbd> to cycle through command history.
              Type <code className="text-terminal-cyan">explain &lt;cmd&gt;</code> to learn about any command.
            </p>
          </div>

          <div className="card">
            <p className="text-terminal-muted text-xs font-semibold mb-2 uppercase tracking-wider">Keyboard</p>
            <div className="space-y-1.5 text-xs text-terminal-muted">
              <div className="flex justify-between">
                <span>Run command</span>
                <kbd className="bg-terminal-border px-1.5 rounded text-terminal-text">Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span>History up</span>
                <kbd className="bg-terminal-border px-1.5 rounded text-terminal-text">↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>Tab complete</span>
                <kbd className="bg-terminal-border px-1.5 rounded text-terminal-text">Tab</kbd>
              </div>
              <div className="flex justify-between">
                <span>Cancel input</span>
                <kbd className="bg-terminal-border px-1.5 rounded text-terminal-text">Ctrl+C</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
