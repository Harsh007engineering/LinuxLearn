import { FiTerminal } from 'react-icons/fi';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 bg-terminal-green/20 rounded-xl flex items-center justify-center mx-auto mb-4 animate-glow">
          <FiTerminal className="text-terminal-green" size={26} />
        </div>
        <p className="text-terminal-muted text-sm font-mono">Initializing terminal...</p>
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-terminal-green"
              style={{ animation: `blink 1s step-end ${i * 0.3}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
