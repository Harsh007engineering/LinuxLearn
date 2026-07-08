import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTerminal, FiZap, FiAward, FiBarChart2, FiBook, FiArrowRight, FiGithub } from 'react-icons/fi';

const TERMINAL_DEMO = [
  { delay: 500, type: 'prompt', text: 'user@linuxlearn:~$ ' },
  { delay: 800, type: 'typed', text: 'ls', prompt: 'user@linuxlearn:~$ ' },
  { delay: 1200, type: 'output', text: '\x1b[36mDocuments\x1b[0m  \x1b[36mDownloads\x1b[0m  \x1b[36mProjects\x1b[0m  notes.txt' },
  { delay: 500, type: 'prompt', text: 'user@linuxlearn:~$ ' },
  { delay: 900, type: 'typed', text: 'mkdir MyProject', prompt: 'user@linuxlearn:~$ ' },
  { delay: 600, type: 'xp', text: '+5 XP — Great job! mkdir creates a new directory.' },
  { delay: 500, type: 'prompt', text: 'user@linuxlearn:~$ ' },
  { delay: 1000, type: 'typed', text: 'cd MyProject', prompt: 'user@linuxlearn:~$ ' },
  { delay: 600, type: 'prompt', text: 'user@linuxlearn:~/MyProject$ ' },
  { delay: 800, type: 'typed', text: 'touch index.html', prompt: 'user@linuxlearn:~/MyProject$ ' },
  { delay: 600, type: 'xp', text: '+5 XP — File created with touch!' },
];

function AnimatedTerminal() {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout;
    let lineIdx = 0;

    const run = (idx) => {
      if (idx >= TERMINAL_DEMO.length) {
        // Reset and replay
        timeout = setTimeout(() => {
          setDisplayedLines([]);
          setCurrentTyping('');
          setStep(0);
          run(0);
        }, 3000);
        return;
      }

      const item = TERMINAL_DEMO[idx];
      timeout = setTimeout(() => {
        if (item.type === 'typed') {
          // Animate typing
          let charIdx = 0;
          const typeChar = () => {
            setCurrentTyping(item.text.slice(0, charIdx + 1));
            charIdx++;
            if (charIdx < item.text.length) {
              timeout = setTimeout(typeChar, 60 + Math.random() * 40);
            } else {
              // Commit line
              setTimeout(() => {
                setDisplayedLines(prev => [...prev, { type: 'input', prompt: item.prompt, text: item.text }]);
                setCurrentTyping('');
                run(idx + 1);
              }, 200);
            }
          };
          typeChar();
        } else if (item.type === 'output') {
          setDisplayedLines(prev => [...prev, { type: 'output', text: item.text }]);
          run(idx + 1);
        } else if (item.type === 'xp') {
          setDisplayedLines(prev => [...prev, { type: 'xp', text: item.text }]);
          run(idx + 1);
        } else if (item.type === 'prompt') {
          run(idx + 1);
        }
      }, item.delay);
    };

    run(0);
    return () => clearTimeout(timeout);
  }, []);

  function renderText(text) {
    return text
      .replace('\x1b[36m', '<span style="color:#79c0ff">')
      .replace('\x1b[0m', '</span>');
  }

  return (
    <div className="bg-terminal-bg border border-terminal-border rounded-xl overflow-hidden shadow-2xl shadow-black/50 font-mono text-sm">
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#1c2128] border-b border-terminal-border">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-terminal-muted text-xs">LinuxLearn Terminal</span>
      </div>

      <div className="p-4 h-64 overflow-hidden">
        <div className="text-terminal-green/70 text-xs mb-3">
          Welcome to LinuxLearn! Type 'help' to begin.
        </div>
        {displayedLines.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line.type === 'input' && (
              <div className="flex gap-2">
                <span className="text-terminal-green">{line.prompt}</span>
                <span className="text-terminal-text">{line.text}</span>
              </div>
            )}
            {line.type === 'output' && (
              <div
                className="text-terminal-text/80 whitespace-pre"
                dangerouslySetInnerHTML={{ __html: renderText(line.text) }}
              />
            )}
            {line.type === 'xp' && (
              <div className="text-terminal-yellow text-xs">{line.text}</div>
            )}
          </div>
        ))}
        {currentTyping !== undefined && (
          <div className="flex gap-2">
            <span className="text-terminal-green">user@linuxlearn:~$ </span>
            <span className="text-terminal-text">{currentTyping}</span>
            <span className="animate-blink text-terminal-green">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}

const features = [
  {
    icon: FiTerminal,
    title: 'Browser Terminal',
    description: 'A realistic Linux terminal simulation directly in your browser. No downloads, no VM.',
    color: 'text-terminal-green'
  },
  {
    icon: FiBook,
    title: 'Guided Lessons',
    description: '19 structured lessons across 4 modules — from pwd and ls to grep and sort.',
    color: 'text-terminal-cyan'
  },
  {
    icon: FiZap,
    title: 'XP & Levels',
    description: 'Earn XP for every command you run correctly. Level up as you progress.',
    color: 'text-terminal-yellow'
  },
  {
    icon: FiAward,
    title: 'Achievements',
    description: 'Unlock badges for milestones like first command, 7-day streak, and more.',
    color: 'text-terminal-purple'
  },
  {
    icon: FiBarChart2,
    title: 'Leaderboard',
    description: 'Compete with other learners by XP, streak, and lessons completed.',
    color: 'text-terminal-orange'
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-terminal-border/50">
        <div className="flex items-center gap-2">
          <FiTerminal className="text-terminal-green" size={20} />
          <span className="font-bold text-terminal-text text-lg">Linux<span className="text-terminal-green">Learn</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Log In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-20 lg:py-28 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="badge bg-terminal-green/10 text-terminal-green border border-terminal-green/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
              Browser-based Linux Practice
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-terminal-text leading-tight mb-6">
              Learn Linux by
              <br />
              <span className="gradient-text">Using Linux.</span>
            </h1>
            <p className="text-terminal-muted text-lg leading-relaxed mb-8 max-w-md">
              Practice Linux commands interactively without installing Linux.
              A real terminal experience, right in your browser.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                Start Learning <FiArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                I Have an Account
              </Link>
            </div>
            <p className="text-terminal-muted text-sm mt-4">
              Free to use. No credit card. No Linux required.
            </p>
          </div>

          <div className="animate-slide-up">
            <AnimatedTerminal />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-terminal-border/30">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-terminal-text mb-3">
            Everything you need to master the terminal
          </h2>
          <p className="text-terminal-muted text-base">
            Structured learning meets hands-on practice
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="card-hover group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color} bg-current/10`} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Icon className={color} size={20} />
              </div>
              <h3 className="font-semibold text-terminal-text mb-2">{title}</h3>
              <p className="text-terminal-muted text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Command showcase */}
      <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-terminal-border/30">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-terminal-text mb-4">
              20+ commands with real behavior
            </h2>
            <p className="text-terminal-muted mb-6 leading-relaxed">
              Every command behaves like real Linux — proper error messages,
              virtual filesystem, arrow key history, and Tab completion.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Try the Terminal <FiArrowRight size={15} />
            </Link>
          </div>
          <div className="bg-terminal-surface border border-terminal-border rounded-xl p-5 font-mono text-sm space-y-1.5">
            {['pwd', 'ls', 'ls -a', 'cd Documents', 'mkdir Projects', 'touch notes.txt', 'echo "Hello" > file.txt', 'cat file.txt', 'cp file.txt backup.txt', 'grep "text" file.txt', 'find . -name "*.txt"', 'tree', 'explain mkdir'].map(cmd => (
              <div key={cmd} className="flex gap-3">
                <span className="text-terminal-green flex-shrink-0">$</span>
                <span className="text-terminal-text">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-terminal-text mb-4">
            Ready to open the terminal?
          </h2>
          <p className="text-terminal-muted mb-8">
            Join LinuxLearn and go from zero to confident in the Linux command line.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Create Free Account <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-terminal-border px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-terminal-muted text-sm">
            <FiTerminal size={15} />
            <span>LinuxLearn — Practice Linux safely in your browser</span>
          </div>
          <div className="flex items-center gap-4 text-terminal-muted text-sm">
            <Link to="/login" className="hover:text-terminal-text transition-colors">Login</Link>
            <Link to="/register" className="hover:text-terminal-text transition-colors">Register</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terminal-text transition-colors flex items-center gap-1"
            >
              <FiGithub size={14} /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
