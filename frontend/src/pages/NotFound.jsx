import { Link } from 'react-router-dom';
import { FiTerminal, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-8 mb-6 font-mono">
          <div className="text-terminal-green text-sm mb-3">user@linuxlearn:~$</div>
          <div className="text-terminal-text text-sm mb-2">cd /this-page</div>
          <div className="text-terminal-red text-sm">
            bash: cd: /this-page: No such file or directory
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-terminal-green text-sm">user@linuxlearn:~$</span>
            <span className="animate-blink text-terminal-green font-bold">▋</span>
          </div>
        </div>

        <h1 className="text-6xl font-bold gradient-text mb-3">404</h1>
        <h2 className="text-xl font-bold text-terminal-text mb-2">Page not found</h2>
        <p className="text-terminal-muted mb-8">
          This path doesn't exist in the filesystem.
          Maybe it was moved or deleted.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-secondary flex items-center gap-2">
            <FiArrowLeft size={14} /> Go Home
          </Link>
          <Link to="/dashboard" className="btn-primary flex items-center gap-2">
            <FiTerminal size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
