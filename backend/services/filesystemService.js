const Filesystem = require('../models/Filesystem');

// Helper: navigate the tree to a given path
function resolvePath(tree, pathStr) {
  if (pathStr === '/') return tree;
  const parts = pathStr.replace(/^\//, '').split('/').filter(Boolean);
  let node = tree;
  for (const part of parts) {
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

// Helper: get parent node and target name from path
function getParentAndName(pathStr) {
  const parts = pathStr.replace(/^\//, '').split('/').filter(Boolean);
  const name = parts.pop();
  const parentPath = '/' + parts.join('/');
  return { parentPath: parentPath || '/', name };
}

// Resolve relative or absolute path to absolute
function absolutePath(currentPath, target) {
  if (!target || target === '~') return '/home/user';
  if (target.startsWith('/')) return normalizePath(target);
  return normalizePath(currentPath + '/' + target);
}

function normalizePath(p) {
  const parts = p.split('/').filter(Boolean);
  const stack = [];
  for (const part of parts) {
    if (part === '..') { stack.pop(); }
    else if (part !== '.') { stack.push(part); }
  }
  return '/' + stack.join('/');
}

// ─── Command Executor ────────────────────────────────────────────────────────

async function executeCommand(userId, rawCommand, history = []) {
  const fs = await Filesystem.findOne({ userId });
  if (!fs) throw new Error('Filesystem not found');

  const trimmed = rawCommand.trim();
  if (!trimmed) return { output: '', newPath: fs.currentPath, xpEarned: 0 };

  const [cmd, ...args] = trimmed.split(/\s+/);
  let output = '';
  let xpEarned = 0;
  let newPath = fs.currentPath;
  let filesystemChanged = false;

  try {
    switch (cmd) {
      case 'pwd':
        output = fs.currentPath;
        xpEarned = 2;
        break;

      case 'ls': {
        const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const targetArg = args.find(a => !a.startsWith('-')) || null;
        const targetPath = targetArg ? absolutePath(fs.currentPath, targetArg) : fs.currentPath;
        const node = resolvePath(fs.tree, targetPath);
        if (!node) { output = `ls: cannot access '${targetArg}': No such file or directory`; break; }
        if (node.type === 'file') { output = node.name; break; }
        const entries = Object.keys(node.children || {});
        const hidden = ['.', '..', '.bashrc', '.profile', '.bash_history'];
        const all = showHidden ? [...hidden, ...entries] : entries;
        // Color output: dirs are cyan, files are white
        output = all.map(e => {
          const child = node.children?.[e];
          if (!child || child.type === 'dir') return `\x1b[36m${e}\x1b[0m`;
          return e;
        }).join('  ');
        xpEarned = 2;
        break;
      }

      case 'cd': {
        const target = args[0] || '/home/user';
        const newAbsPath = absolutePath(fs.currentPath, target);
        const node = resolvePath(fs.tree, newAbsPath);
        if (!node) { output = `bash: cd: ${target}: No such file or directory`; break; }
        if (node.type === 'file') { output = `bash: cd: ${target}: Not a directory`; break; }
        newPath = newAbsPath;
        fs.currentPath = newAbsPath;
        filesystemChanged = true;
        xpEarned = 2;
        break;
      }

      case 'mkdir': {
        if (!args[0]) { output = 'mkdir: missing operand'; break; }
        const pFlag = args.includes('-p');
        const dirName = args.find(a => !a.startsWith('-'));
        if (!dirName) { output = 'mkdir: missing operand'; break; }

        const targetPath = absolutePath(fs.currentPath, dirName);
        const { parentPath, name } = getParentAndName(targetPath);
        const parentNode = resolvePath(fs.tree, parentPath);
        if (!parentNode && !pFlag) { output = `mkdir: cannot create directory '${dirName}': No such file or directory`; break; }
        if (!parentNode && pFlag) {
          // Create intermediate dirs
          const parts = targetPath.replace(/^\//, '').split('/');
          let node = fs.tree;
          for (const part of parts) {
            if (!node.children[part]) {
              node.children[part] = { type: 'dir', name: part, children: {} };
            }
            node = node.children[part];
          }
        } else {
          if (parentNode.children[name]) { output = `mkdir: cannot create directory '${dirName}': File exists`; break; }
          parentNode.children[name] = { type: 'dir', name, children: {} };
        }
        filesystemChanged = true;
        xpEarned = 5;
        break;
      }

      case 'touch': {
        if (!args[0]) { output = 'touch: missing file operand'; break; }
        const fileName = args[0];
        const targetPath = absolutePath(fs.currentPath, fileName);
        const { parentPath, name } = getParentAndName(targetPath);
        const parentNode = resolvePath(fs.tree, parentPath);
        if (!parentNode) { output = `touch: cannot touch '${fileName}': No such file or directory`; break; }
        if (!parentNode.children[name]) {
          parentNode.children[name] = { type: 'file', name, content: '', createdAt: new Date().toISOString() };
        } else {
          parentNode.children[name].updatedAt = new Date().toISOString();
        }
        filesystemChanged = true;
        xpEarned = 5;
        break;
      }

      case 'rm': {
        if (!args[0]) { output = 'rm: missing operand'; break; }
        const rfFlag = args.includes('-rf') || args.includes('-r') || args.includes('-f');
        const target = args.find(a => !a.startsWith('-'));
        if (!target) { output = 'rm: missing operand'; break; }
        const targetPath = absolutePath(fs.currentPath, target);
        const { parentPath, name } = getParentAndName(targetPath);
        const parentNode = resolvePath(fs.tree, parentPath);
        const targetNode = parentNode?.children?.[name];
        if (!targetNode) { output = `rm: cannot remove '${target}': No such file or directory`; break; }
        if (targetNode.type === 'dir' && !rfFlag) {
          output = `rm: cannot remove '${target}': Is a directory. Use -r to remove directories.`;
          break;
        }
        delete parentNode.children[name];
        filesystemChanged = true;
        xpEarned = 5;
        break;
      }

      case 'cp': {
        if (args.length < 2) { output = 'cp: missing destination file operand'; break; }
        const src = args.find(a => !a.startsWith('-'));
        const dest = args[args.length - 1];
        const srcPath = absolutePath(fs.currentPath, src);
        const srcNode = resolvePath(fs.tree, srcPath);
        if (!srcNode) { output = `cp: cannot stat '${src}': No such file or directory`; break; }
        const destPath = absolutePath(fs.currentPath, dest);
        const { parentPath: destParent, name: destName } = getParentAndName(destPath);
        const destParentNode = resolvePath(fs.tree, destParent);
        if (!destParentNode) { output = `cp: cannot create '${dest}': No such file or directory`; break; }
        destParentNode.children[destName] = JSON.parse(JSON.stringify(srcNode));
        destParentNode.children[destName].name = destName;
        filesystemChanged = true;
        xpEarned = 5;
        break;
      }

      case 'mv': {
        if (args.length < 2) { output = 'mv: missing destination file operand'; break; }
        const src = args[0];
        const dest = args[1];
        const srcPath = absolutePath(fs.currentPath, src);
        const { parentPath: srcParent, name: srcName } = getParentAndName(srcPath);
        const srcParentNode = resolvePath(fs.tree, srcParent);
        const srcNode = srcParentNode?.children?.[srcName];
        if (!srcNode) { output = `mv: cannot stat '${src}': No such file or directory`; break; }
        const destPath = absolutePath(fs.currentPath, dest);
        const { parentPath: destParent, name: destName } = getParentAndName(destPath);
        const destParentNode = resolvePath(fs.tree, destParent);
        if (!destParentNode) { output = `mv: cannot move '${src}': No such file or directory`; break; }
        destParentNode.children[destName] = { ...srcNode, name: destName };
        delete srcParentNode.children[srcName];
        filesystemChanged = true;
        xpEarned = 5;
        break;
      }

      case 'cat': {
        if (!args[0]) { output = 'cat: missing operand'; break; }
        const targetPath = absolutePath(fs.currentPath, args[0]);
        const node = resolvePath(fs.tree, targetPath);
        if (!node) { output = `cat: ${args[0]}: No such file or directory`; break; }
        if (node.type === 'dir') { output = `cat: ${args[0]}: Is a directory`; break; }
        output = node.content || '(empty file)';
        xpEarned = 3;
        break;
      }

      case 'echo': {
        const redirectIdx = args.indexOf('>');
        if (redirectIdx !== -1) {
          const content = args.slice(0, redirectIdx).join(' ').replace(/^['"]|['"]$/g, '');
          const fileName = args[redirectIdx + 1];
          if (!fileName) { output = 'bash: syntax error near unexpected token'; break; }
          const targetPath = absolutePath(fs.currentPath, fileName);
          const { parentPath, name } = getParentAndName(targetPath);
          const parentNode = resolvePath(fs.tree, parentPath);
          if (!parentNode) { output = `bash: ${fileName}: No such file or directory`; break; }
          if (parentNode.children[name]) {
            parentNode.children[name].content = content;
          } else {
            parentNode.children[name] = { type: 'file', name, content, createdAt: new Date().toISOString() };
          }
          filesystemChanged = true;
        } else {
          output = args.join(' ').replace(/^['"]|['"]$/g, '');
        }
        xpEarned = 2;
        break;
      }

      case 'tree': {
        const targetPath = args[0] ? absolutePath(fs.currentPath, args[0]) : fs.currentPath;
        const node = resolvePath(fs.tree, targetPath);
        if (!node) { output = `${args[0]}\n[error opening dir]`; break; }
        output = buildTree(node, '', true);
        xpEarned = 3;
        break;
      }

      case 'find': {
        const startPath = args[0] && !args[0].startsWith('-') ? absolutePath(fs.currentPath, args[0]) : fs.currentPath;
        const nameIdx = args.indexOf('-name');
        const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null;
        const node = resolvePath(fs.tree, startPath);
        if (!node) { output = `find: '${args[0]}': No such file or directory`; break; }
        const results = findFiles(node, startPath, namePattern);
        output = results.join('\n') || '(no results)';
        xpEarned = 5;
        break;
      }

      case 'grep': {
        if (args.length < 2) { output = 'grep: missing arguments'; break; }
        const pattern = args[0].replace(/^['"]|['"]$/g, '');
        const fileName = args[1];
        const targetPath = absolutePath(fs.currentPath, fileName);
        const node = resolvePath(fs.tree, targetPath);
        if (!node) { output = `grep: ${fileName}: No such file or directory`; break; }
        if (node.type === 'dir') { output = `grep: ${fileName}: Is a directory`; break; }
        const lines = (node.content || '').split('\n');
        const matches = lines.filter(l => l.includes(pattern));
        output = matches.length > 0 ? matches.join('\n') : '';
        xpEarned = 5;
        break;
      }

      case 'head': {
        const nIdx = args.indexOf('-n');
        const n = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const fileName = args.find(a => !a.startsWith('-'));
        if (!fileName) { output = 'head: missing operand'; break; }
        const node = resolvePath(fs.tree, absolutePath(fs.currentPath, fileName));
        if (!node) { output = `head: cannot open '${fileName}': No such file or directory`; break; }
        output = (node.content || '').split('\n').slice(0, n).join('\n');
        xpEarned = 3;
        break;
      }

      case 'tail': {
        const nIdx = args.indexOf('-n');
        const n = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const fileName = args.find(a => !a.startsWith('-'));
        if (!fileName) { output = 'tail: missing operand'; break; }
        const node = resolvePath(fs.tree, absolutePath(fs.currentPath, fileName));
        if (!node) { output = `tail: cannot open '${fileName}': No such file or directory`; break; }
        const lines = (node.content || '').split('\n');
        output = lines.slice(-n).join('\n');
        xpEarned = 3;
        break;
      }

      case 'wc': {
        const fileName = args.find(a => !a.startsWith('-'));
        if (!fileName) { output = 'wc: missing operand'; break; }
        const node = resolvePath(fs.tree, absolutePath(fs.currentPath, fileName));
        if (!node) { output = `wc: ${fileName}: No such file or directory`; break; }
        const content = node.content || '';
        const lines = content.split('\n').length;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const chars = content.length;
        output = `  ${lines}  ${words}  ${chars} ${fileName}`;
        xpEarned = 3;
        break;
      }

      case 'sort': {
        const fileName = args.find(a => !a.startsWith('-'));
        if (!fileName) { output = 'sort: missing operand'; break; }
        const node = resolvePath(fs.tree, absolutePath(fs.currentPath, fileName));
        if (!node) { output = `sort: cannot read: ${fileName}: No such file or directory`; break; }
        const lines = (node.content || '').split('\n');
        const reverse = args.includes('-r');
        lines.sort();
        if (reverse) lines.reverse();
        output = lines.join('\n');
        xpEarned = 3;
        break;
      }

      case 'date':
        output = new Date().toString();
        xpEarned = 1;
        break;

      case 'whoami':
        output = 'user';
        xpEarned = 1;
        break;

      case 'hostname':
        output = 'linuxlearn';
        xpEarned = 1;
        break;

      case 'clear':
        output = '__CLEAR__';
        break;

      case 'history': {
        const recentHistory = history.slice(-20);
        output = recentHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
        xpEarned = 1;
        break;
      }

      case 'help':
        output = `Available commands:
  Navigation:   pwd, cd, ls, ls -a, tree
  Files:        touch, cat, echo, head, tail, wc, sort
  Directories:  mkdir, mkdir -p, rmdir
  Copy/Move:    cp, mv, rm, rm -rf
  Search:       find, grep
  Info:         date, whoami, hostname, history
  Learning:     explain <command>, help
  Terminal:     clear

Type 'explain <command>' to learn about any command.`;
        xpEarned = 1;
        break;

      case 'explain': {
        const cmdToExplain = args[0];
        output = getCommandExplanation(cmdToExplain);
        xpEarned = 5;
        break;
      }

      default:
        output = `bash: ${cmd}: command not found\nType 'help' to see available commands.`;
    }
  } catch (err) {
    output = `bash: ${cmd}: unexpected error`;
    console.error('Command execution error:', err);
  }

  if (filesystemChanged) {
    fs.markModified('tree');
    fs.markModified('currentPath');
    await fs.save();
  } else if (newPath !== fs.currentPath) {
    fs.currentPath = newPath;
    await fs.save();
  }

  return { output, newPath: fs.currentPath, xpEarned, command: rawCommand };
}

// Build tree output recursively
function buildTree(node, prefix, isLast) {
  let result = node.name + '\n';
  const children = Object.values(node.children || {});
  children.forEach((child, i) => {
    const isLastChild = i === children.length - 1;
    const connector = isLastChild ? '└── ' : '├── ';
    const newPrefix = prefix + (isLastChild ? '    ' : '│   ');
    result += prefix + connector;
    if (child.type === 'dir') {
      result += buildTree(child, newPrefix, isLastChild);
    } else {
      result += child.name + '\n';
    }
  });
  return result;
}

// Find files recursively
function findFiles(node, currentPath, namePattern) {
  let results = [currentPath];
  if (node.type === 'dir') {
    for (const [name, child] of Object.entries(node.children || {})) {
      const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      if (!namePattern || matchGlob(name, namePattern)) {
        results.push(childPath);
      }
      if (child.type === 'dir') {
        results = results.concat(findFiles(child, childPath, namePattern));
      }
    }
  }
  return results;
}

function matchGlob(name, pattern) {
  const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return regex.test(name);
}

// Command explanations
function getCommandExplanation(cmd) {
  const explanations = {
    pwd: `\x1b[33mpwd\x1b[0m — Print Working Directory

PURPOSE: Shows the full path of your current directory.
SYNTAX: pwd

EXAMPLE:
  $ pwd
  /home/user/Documents

BEST PRACTICES:
  • Use pwd to orient yourself when navigating the filesystem
  • Combine with cd to verify your location after moving`,

    ls: `\x1b[33mls\x1b[0m — List Directory Contents

PURPOSE: Shows files and directories in the current (or specified) directory.
SYNTAX: ls [options] [directory]

OPTIONS:
  -a    Show hidden files (starting with .)
  -l    Long format with permissions, size, date
  -la   Both hidden and long format

EXAMPLES:
  $ ls              # list current directory
  $ ls -a           # include hidden files
  $ ls Documents    # list a specific folder`,

    cd: `\x1b[33mcd\x1b[0m — Change Directory

PURPOSE: Moves you into a different directory.
SYNTAX: cd [directory]

EXAMPLES:
  $ cd Documents       # go into Documents
  $ cd ..              # go up one level
  $ cd /home/user      # go to absolute path
  $ cd ~               # go to home directory
  $ cd -               # go to previous directory

COMMON MISTAKES:
  • Forgetting to use quotes for paths with spaces`,

    mkdir: `\x1b[33mmkdir\x1b[0m — Make Directory

PURPOSE: Creates a new directory (folder).
SYNTAX: mkdir [options] <directory-name>

OPTIONS:
  -p    Create parent directories as needed (no error if exists)

EXAMPLES:
  $ mkdir Projects          # create single directory
  $ mkdir -p a/b/c          # create nested directories

COMMON MISTAKES:
  • Forgetting -p when creating nested directories`,

    touch: `\x1b[33mtouch\x1b[0m — Create File / Update Timestamp

PURPOSE: Creates an empty file, or updates the access/modification time.
SYNTAX: touch <filename>

EXAMPLES:
  $ touch notes.txt         # create empty file
  $ touch file1 file2       # create multiple files`,

    rm: `\x1b[33mrm\x1b[0m — Remove Files or Directories

PURPOSE: Deletes files and directories. This is permanent!
SYNTAX: rm [options] <file>

OPTIONS:
  -r    Recursively delete directories
  -f    Force delete without confirmation
  -rf   Force-delete directory and all contents

EXAMPLES:
  $ rm file.txt
  $ rm -rf Projects/

WARNING: There is no trash in Linux. rm is permanent.`,

    cp: `\x1b[33mcp\x1b[0m — Copy Files or Directories

PURPOSE: Copies a file or directory to a new location.
SYNTAX: cp [options] <source> <destination>

OPTIONS:
  -r    Copy directories recursively

EXAMPLES:
  $ cp file.txt backup.txt
  $ cp -r Projects/ Projects_backup/`,

    mv: `\x1b[33mmv\x1b[0m — Move or Rename Files

PURPOSE: Moves files/directories or renames them.
SYNTAX: mv <source> <destination>

EXAMPLES:
  $ mv old.txt new.txt         # rename
  $ mv file.txt Documents/     # move to folder`,

    cat: `\x1b[33mcat\x1b[0m — Concatenate and Print Files

PURPOSE: Displays the content of a file in the terminal.
SYNTAX: cat [file]

EXAMPLES:
  $ cat notes.txt
  $ cat file1 file2    # print multiple files`,

    echo: `\x1b[33mecho\x1b[0m — Print Text or Write to File

PURPOSE: Outputs text to the terminal or writes it to a file.
SYNTAX: echo [text] [> file]

EXAMPLES:
  $ echo "Hello, World!"
  $ echo "some text" > file.txt    # write to file`,

    grep: `\x1b[33mgrep\x1b[0m — Search Text Patterns

PURPOSE: Searches for patterns within files and prints matching lines.
SYNTAX: grep [pattern] [file]

OPTIONS:
  -i    Case-insensitive
  -r    Recursive search

EXAMPLES:
  $ grep "error" log.txt
  $ grep -i "hello" notes.txt`,

    find: `\x1b[33mfind\x1b[0m — Find Files and Directories

PURPOSE: Searches for files/directories by name, type, or other criteria.
SYNTAX: find [path] [options]

OPTIONS:
  -name   Search by filename (supports wildcards)
  -type   f for files, d for directories

EXAMPLES:
  $ find . -name "*.txt"
  $ find /home -name "notes*"`,
  };

  if (!cmd) return 'Usage: explain <command>\nExample: explain mkdir';
  return explanations[cmd] || `No explanation available for '${cmd}'.\nType 'help' to see all commands.`;
}

module.exports = { executeCommand };
