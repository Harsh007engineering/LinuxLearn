const Lesson = require('../models/Lesson');

const LESSONS = [
  // ── Module 1: Introduction ─────────────────────────────────────────────────
  {
    moduleId: 1,
    lessonId: 1,
    title: 'Where Am I? — pwd',
    description: 'Learn to print your current directory location.',
    command: 'pwd',
    explanation: 'pwd stands for "Print Working Directory". It shows you the full path of the directory you are currently in. Think of it as asking "where am I?" in the filesystem.',
    syntax: 'pwd',
    examples: [
      { command: 'pwd', description: 'Print current directory path' }
    ],
    commonMistakes: ['Confusing pwd with ls — ls lists contents, pwd shows location.'],
    bestPractices: ['Run pwd after cd to confirm you moved to the right directory.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Print your current working directory.',
        expectedCommand: 'pwd',
        hint: 'This command prints where you are. It has 3 letters.',
        successMessage: 'You found your location!',
        xpReward: 20,
        explanation: 'pwd outputs your current path in the filesystem.'
      }
    ],
    xpReward: 50,
    difficulty: 'beginner',
    tags: ['navigation', 'basics'],
    order: 1
  },
  {
    moduleId: 1,
    lessonId: 2,
    title: 'What\'s Here? — ls',
    description: 'List files and directories in your current location.',
    command: 'ls',
    explanation: 'ls lists the contents of a directory. Without arguments it shows the current directory. You can also use ls -a to show hidden files.',
    syntax: 'ls [options] [directory]',
    examples: [
      { command: 'ls', description: 'List current directory' },
      { command: 'ls -a', description: 'Include hidden files' },
      { command: 'ls Documents', description: 'List a specific folder' }
    ],
    commonMistakes: ['Forgetting -a hides files starting with a dot.'],
    bestPractices: ['Use ls after mkdir or touch to confirm files were created.'],
    missions: [
      {
        id: 'm1',
        instruction: 'List all files in your current directory.',
        expectedCommand: 'ls',
        hint: 'The command to list files is only 2 letters.',
        successMessage: 'You can see what\'s in your directory!',
        xpReward: 20,
        explanation: 'ls shows every file and folder in the current directory.'
      },
      {
        id: 'm2',
        instruction: 'List files including hidden ones.',
        expectedCommand: 'ls -a',
        hint: 'Add -a flag to ls to see hidden files.',
        successMessage: 'Hidden files revealed!',
        xpReward: 25,
        explanation: 'ls -a shows files that start with a dot, which are normally hidden.'
      }
    ],
    xpReward: 60,
    difficulty: 'beginner',
    tags: ['navigation', 'listing'],
    order: 2
  },
  {
    moduleId: 1,
    lessonId: 3,
    title: 'Clear the Screen — clear',
    description: 'Keep your terminal tidy by clearing the screen.',
    command: 'clear',
    explanation: 'clear wipes the terminal screen so you have a fresh view. It does not delete your command history — just moves it off screen.',
    syntax: 'clear',
    examples: [
      { command: 'clear', description: 'Clear the terminal screen' }
    ],
    commonMistakes: ['Thinking clear deletes your files — it only clears the visual screen.'],
    bestPractices: ['Use clear when the terminal is cluttered and hard to read.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Clear the terminal screen.',
        expectedCommand: 'clear',
        hint: 'The command is literally the word for removing clutter.',
        successMessage: 'Fresh terminal!',
        xpReward: 15,
        explanation: 'clear removes visual clutter without affecting your files.'
      }
    ],
    xpReward: 30,
    difficulty: 'beginner',
    tags: ['terminal', 'basics'],
    order: 3
  },
  {
    moduleId: 1,
    lessonId: 4,
    title: 'Get Help — help',
    description: 'Discover all available commands with the help command.',
    command: 'help',
    explanation: 'Typing help shows you a list of all available commands in LinuxLearn. On a real Linux system, you can also use man <command> for manual pages.',
    syntax: 'help',
    examples: [
      { command: 'help', description: 'Show all available commands' },
      { command: 'explain pwd', description: 'Get a detailed explanation of pwd' }
    ],
    commonMistakes: ['Looking for commands that are not listed — try explain first.'],
    bestPractices: ['When unsure, type help first. It\'s always safe.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Show all available commands.',
        expectedCommand: 'help',
        hint: 'The command that shows other commands is 4 letters.',
        successMessage: 'Now you know all the tools at your disposal!',
        xpReward: 15,
        explanation: 'help lists every supported command with a brief description.'
      }
    ],
    xpReward: 30,
    difficulty: 'beginner',
    tags: ['terminal', 'reference'],
    order: 4
  },

  // ── Module 2: Navigation ───────────────────────────────────────────────────
  {
    moduleId: 2,
    lessonId: 1,
    title: 'Move Around — cd',
    description: 'Navigate the filesystem by changing directories.',
    command: 'cd',
    explanation: 'cd stands for Change Directory. It lets you move between folders. Use cd .. to go up, cd ~ to go home, and cd /path for absolute paths.',
    syntax: 'cd [directory]',
    examples: [
      { command: 'cd Documents', description: 'Move into Documents folder' },
      { command: 'cd ..', description: 'Go up one directory level' },
      { command: 'cd ~', description: 'Go to home directory' },
      { command: 'cd /home/user', description: 'Go to absolute path' }
    ],
    commonMistakes: [
      'Using cd on a file instead of a directory.',
      'Forgetting .. means parent directory.'
    ],
    bestPractices: ['Combine cd with pwd and ls to navigate confidently.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Move into the Documents folder.',
        expectedCommand: 'cd Documents',
        hint: 'Use cd followed by the folder name.',
        successMessage: 'You\'re inside Documents!',
        xpReward: 25,
        explanation: 'cd <dirname> moves you into that directory.'
      },
      {
        id: 'm2',
        instruction: 'Go back to the parent directory.',
        expectedCommand: 'cd ..',
        hint: 'Two dots means the folder above you.',
        successMessage: 'You went up one level!',
        xpReward: 25,
        explanation: 'cd .. moves you up to the parent directory.'
      }
    ],
    xpReward: 70,
    difficulty: 'beginner',
    tags: ['navigation'],
    order: 5
  },
  {
    moduleId: 2,
    lessonId: 2,
    title: 'Create Folders — mkdir',
    description: 'Make new directories to organize your files.',
    command: 'mkdir',
    explanation: 'mkdir (make directory) creates new folders. Use mkdir -p to create nested directories all at once.',
    syntax: 'mkdir [options] <directory>',
    examples: [
      { command: 'mkdir Projects', description: 'Create a Projects folder' },
      { command: 'mkdir -p a/b/c', description: 'Create nested directories at once' }
    ],
    commonMistakes: [
      'Forgetting -p when creating nested paths.',
      'Using spaces in directory names without quotes.'
    ],
    bestPractices: ['Use descriptive names. Avoid spaces — use underscores or hyphens.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Create a folder named Projects.',
        expectedCommand: 'mkdir Projects',
        hint: 'mk = make, dir = directory. Type the folder name after.',
        successMessage: 'Projects folder created! +20 XP',
        xpReward: 20,
        explanation: 'mkdir creates a new empty directory at the specified location.'
      },
      {
        id: 'm2',
        instruction: 'Move into the Projects folder.',
        expectedCommand: 'cd Projects',
        hint: 'You know how to change directories now!',
        successMessage: 'Inside Projects!',
        xpReward: 20,
        explanation: 'After creating a folder, you can cd into it immediately.'
      }
    ],
    xpReward: 70,
    difficulty: 'beginner',
    tags: ['files', 'directories'],
    order: 6
  },
  {
    moduleId: 2,
    lessonId: 3,
    title: 'Create Files — touch',
    description: 'Create empty files quickly with touch.',
    command: 'touch',
    explanation: 'touch creates an empty file if it does not exist, or updates the timestamp if it does. It\'s the fastest way to create placeholder files.',
    syntax: 'touch <filename>',
    examples: [
      { command: 'touch notes.txt', description: 'Create an empty text file' },
      { command: 'touch file1 file2', description: 'Create multiple files at once' }
    ],
    commonMistakes: ['Using touch on a directory — it only works for files.'],
    bestPractices: ['Include file extensions like .txt, .py, .js for clarity.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Create an empty file named notes.txt.',
        expectedCommand: 'touch notes.txt',
        hint: 'The command is the same as the gentle action of pressing something.',
        successMessage: 'File created!',
        xpReward: 20,
        explanation: 'touch creates an empty file ready to be written to.'
      }
    ],
    xpReward: 60,
    difficulty: 'beginner',
    tags: ['files'],
    order: 7
  },
  {
    moduleId: 2,
    lessonId: 4,
    title: 'View Directory Tree — tree',
    description: 'See your full directory structure at a glance.',
    command: 'tree',
    explanation: 'tree displays the directory structure recursively in a visual tree format. Great for understanding how files are organized.',
    syntax: 'tree [directory]',
    examples: [
      { command: 'tree', description: 'Show tree of current directory' },
      { command: 'tree Documents', description: 'Show tree of a specific folder' }
    ],
    commonMistakes: ['Running tree in a large directory — it can be overwhelming.'],
    bestPractices: ['Use tree on small project directories to get a quick overview.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Show the tree structure of the current directory.',
        expectedCommand: 'tree',
        hint: 'The command is named after a plant with branches.',
        successMessage: 'You can see the full structure!',
        xpReward: 20,
        explanation: 'tree recursively shows all files and directories as a visual tree.'
      }
    ],
    xpReward: 60,
    difficulty: 'beginner',
    tags: ['navigation', 'visualization'],
    order: 8
  },

  // ── Module 3: File Operations ──────────────────────────────────────────────
  {
    moduleId: 3,
    lessonId: 1,
    title: 'Copy Files — cp',
    description: 'Duplicate files and directories with cp.',
    command: 'cp',
    explanation: 'cp copies files from one location to another. Use -r to copy entire directories.',
    syntax: 'cp [options] <source> <destination>',
    examples: [
      { command: 'cp file.txt backup.txt', description: 'Copy file with new name' },
      { command: 'cp -r Projects Projects_backup', description: 'Copy an entire directory' }
    ],
    commonMistakes: ['Forgetting -r when copying directories.'],
    bestPractices: ['Always verify the copy worked with ls after cp.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Create a file called original.txt, then copy it to backup.txt.',
        expectedCommand: 'cp original.txt backup.txt',
        hint: 'First create original.txt with touch, then cp source destination.',
        successMessage: 'File copied!',
        xpReward: 30,
        explanation: 'cp duplicates a file at a new path without removing the original.'
      }
    ],
    xpReward: 80,
    difficulty: 'intermediate',
    tags: ['files', 'copy'],
    order: 9
  },
  {
    moduleId: 3,
    lessonId: 2,
    title: 'Move & Rename — mv',
    description: 'Move files to new locations or rename them.',
    command: 'mv',
    explanation: 'mv moves files or directories. If the destination is in the same directory, it renames the file.',
    syntax: 'mv <source> <destination>',
    examples: [
      { command: 'mv old.txt new.txt', description: 'Rename a file' },
      { command: 'mv file.txt Documents/', description: 'Move file to Documents' }
    ],
    commonMistakes: ['Accidentally overwriting a file at the destination.'],
    bestPractices: ['Check for existing files at the destination before moving.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Rename notes.txt to mynotes.txt.',
        expectedCommand: 'mv notes.txt mynotes.txt',
        hint: 'mv is used for both moving and renaming.',
        successMessage: 'File renamed!',
        xpReward: 30,
        explanation: 'mv renames a file when source and destination are in the same directory.'
      }
    ],
    xpReward: 80,
    difficulty: 'intermediate',
    tags: ['files', 'move'],
    order: 10
  },
  {
    moduleId: 3,
    lessonId: 3,
    title: 'Delete Files — rm',
    description: 'Remove files and directories permanently.',
    command: 'rm',
    explanation: 'rm deletes files permanently. There\'s no recycle bin. Use -r for directories and -f to force without prompts.',
    syntax: 'rm [options] <file>',
    examples: [
      { command: 'rm file.txt', description: 'Delete a single file' },
      { command: 'rm -rf folder/', description: 'Delete a directory and all its contents' }
    ],
    commonMistakes: ['Using rm -rf in the wrong directory — it is permanent!'],
    bestPractices: ['Double-check the path before running rm -rf. Always.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Create a file called temp.txt, then delete it.',
        expectedCommand: 'rm temp.txt',
        hint: 'rm stands for remove.',
        successMessage: 'File deleted!',
        xpReward: 25,
        explanation: 'rm permanently deletes files with no undo.'
      }
    ],
    xpReward: 70,
    difficulty: 'intermediate',
    tags: ['files', 'delete'],
    order: 11
  },
  {
    moduleId: 3,
    lessonId: 4,
    title: 'Read Files — cat',
    description: 'Print file contents directly in the terminal.',
    command: 'cat',
    explanation: 'cat reads and displays file contents. It can also concatenate multiple files.',
    syntax: 'cat [file]',
    examples: [
      { command: 'cat notes.txt', description: 'Display file contents' },
      { command: 'cat file1 file2', description: 'Display two files in sequence' }
    ],
    commonMistakes: ['Using cat on a large file — use head or tail instead.'],
    bestPractices: ['Use cat for small files. Use less or head for large ones.'],
    missions: [
      {
        id: 'm1',
        instruction: 'First write "Hello Linux" to a file, then read it with cat.\nUse: echo "Hello Linux" > hello.txt, then cat hello.txt',
        expectedCommand: 'cat hello.txt',
        hint: 'cat + filename prints the file contents.',
        successMessage: 'You read your file!',
        xpReward: 25,
        explanation: 'cat prints every line in the file to the terminal.'
      }
    ],
    xpReward: 70,
    difficulty: 'intermediate',
    tags: ['files', 'reading'],
    order: 12
  },
  {
    moduleId: 3,
    lessonId: 5,
    title: 'Write to Files — echo',
    description: 'Print text and redirect it into files.',
    command: 'echo',
    explanation: 'echo prints text to the terminal. Use > to redirect output to a file.',
    syntax: 'echo [text] [> file]',
    examples: [
      { command: 'echo "Hello World"', description: 'Print to terminal' },
      { command: 'echo "My content" > file.txt', description: 'Write to file' },
      { command: 'echo "More" >> file.txt', description: 'Append to file' }
    ],
    commonMistakes: ['Using > instead of >> accidentally overwrites the file.'],
    bestPractices: ['Use >> to append and > to overwrite.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Write "I am learning Linux" into a file called progress.txt.',
        expectedCommand: 'echo "I am learning Linux" > progress.txt',
        hint: 'echo text > filename creates/overwrites a file with that text.',
        successMessage: 'Written to file!',
        xpReward: 30,
        explanation: 'The > operator redirects output from echo into a file.'
      }
    ],
    xpReward: 70,
    difficulty: 'intermediate',
    tags: ['files', 'writing'],
    order: 13
  },

  // ── Module 4: Text Processing ──────────────────────────────────────────────
  {
    moduleId: 4,
    lessonId: 1,
    title: 'Search Text — grep',
    description: 'Find lines matching patterns inside files.',
    command: 'grep',
    explanation: 'grep searches files for lines that match a pattern. It\'s one of the most used Linux commands.',
    syntax: 'grep [pattern] [file]',
    examples: [
      { command: 'grep "error" log.txt', description: 'Find lines with "error"' },
      { command: 'grep -i "hello" notes.txt', description: 'Case-insensitive search' },
      { command: 'grep -r "text" folder/', description: 'Recursive search' }
    ],
    commonMistakes: ['Forgetting quotes around patterns with spaces.'],
    bestPractices: ['Use -i for case-insensitive matching when unsure of casing.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Search for "Linux" in a file.\nFirst create: echo "I love Linux" > test.txt\nThen: grep "Linux" test.txt',
        expectedCommand: 'grep "Linux" test.txt',
        hint: 'grep pattern filename searches for the pattern.',
        successMessage: 'Pattern found!',
        xpReward: 35,
        explanation: 'grep prints every line that contains the search pattern.'
      }
    ],
    xpReward: 90,
    difficulty: 'intermediate',
    tags: ['text', 'search'],
    order: 14
  },
  {
    moduleId: 4,
    lessonId: 2,
    title: 'Find Files — find',
    description: 'Locate files and directories by name or type.',
    command: 'find',
    explanation: 'find searches for files/directories recursively. Very powerful with -name and -type flags.',
    syntax: 'find [path] [options]',
    examples: [
      { command: 'find . -name "*.txt"', description: 'Find all .txt files' },
      { command: 'find /home -name "notes*"', description: 'Find files starting with notes' }
    ],
    commonMistakes: ['Forgetting to quote patterns with wildcards.'],
    bestPractices: ['Use . for the current directory as the starting path.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Find all files named notes.txt starting from the current directory.',
        expectedCommand: 'find . -name "notes.txt"',
        hint: 'find . -name "filename" searches from current dir.',
        successMessage: 'Files found!',
        xpReward: 35,
        explanation: 'find traverses directories recursively looking for matching files.'
      }
    ],
    xpReward: 90,
    difficulty: 'intermediate',
    tags: ['search', 'files'],
    order: 15
  },
  {
    moduleId: 4,
    lessonId: 3,
    title: 'First Lines — head',
    description: 'View the beginning of a file.',
    command: 'head',
    explanation: 'head prints the first N lines of a file (default: 10). Useful for previewing large files.',
    syntax: 'head [-n count] <file>',
    examples: [
      { command: 'head file.txt', description: 'Print first 10 lines' },
      { command: 'head -n 5 file.txt', description: 'Print first 5 lines' }
    ],
    commonMistakes: ['Confusing head and tail — head = first, tail = last.'],
    bestPractices: ['Use head -n 1 to quickly check the first line of a CSV.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Print the first 5 lines of any file.\nFirst create a file with content.',
        expectedCommand: 'head -n 5 notes.txt',
        hint: 'head -n <count> <file> prints that many lines from the top.',
        successMessage: 'Top lines printed!',
        xpReward: 30,
        explanation: 'head is great for previewing large log files.'
      }
    ],
    xpReward: 70,
    difficulty: 'intermediate',
    tags: ['text', 'reading'],
    order: 16
  },
  {
    moduleId: 4,
    lessonId: 4,
    title: 'Last Lines — tail',
    description: 'View the end of a file.',
    command: 'tail',
    explanation: 'tail prints the last N lines of a file. Perfect for checking recent log entries.',
    syntax: 'tail [-n count] <file>',
    examples: [
      { command: 'tail file.txt', description: 'Print last 10 lines' },
      { command: 'tail -n 20 log.txt', description: 'Print last 20 lines' }
    ],
    commonMistakes: [],
    bestPractices: ['tail -f on real Linux watches files for live updates.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Print the last 3 lines of a file.',
        expectedCommand: 'tail -n 3 notes.txt',
        hint: 'tail -n <count> <file> — the opposite of head.',
        successMessage: 'Bottom of file shown!',
        xpReward: 30,
        explanation: 'tail shows the most recent content — invaluable for log files.'
      }
    ],
    xpReward: 70,
    difficulty: 'intermediate',
    tags: ['text', 'reading'],
    order: 17
  },
  {
    moduleId: 4,
    lessonId: 5,
    title: 'Count Content — wc',
    description: 'Count words, lines, and characters in files.',
    command: 'wc',
    explanation: 'wc (word count) counts lines, words, and characters in a file.',
    syntax: 'wc [file]',
    examples: [
      { command: 'wc notes.txt', description: 'Count lines, words, chars' },
      { command: 'wc -l notes.txt', description: 'Count only lines' }
    ],
    commonMistakes: ['The output order is: lines words characters.'],
    bestPractices: ['Use wc -l to quickly count lines in a log file.'],
    missions: [
      {
        id: 'm1',
        instruction: 'Count the words and lines in a file.',
        expectedCommand: 'wc notes.txt',
        hint: 'wc stands for word count.',
        successMessage: 'File statistics shown!',
        xpReward: 25,
        explanation: 'wc gives you lines, words, and byte counts in one command.'
      }
    ],
    xpReward: 70,
    difficulty: 'advanced',
    tags: ['text', 'analysis'],
    order: 18
  },
  {
    moduleId: 4,
    lessonId: 6,
    title: 'Sort Lines — sort',
    description: 'Alphabetically sort lines in a file.',
    command: 'sort',
    explanation: 'sort organizes lines alphabetically or numerically. Use -r for reverse order.',
    syntax: 'sort [options] <file>',
    examples: [
      { command: 'sort list.txt', description: 'Sort alphabetically' },
      { command: 'sort -r list.txt', description: 'Reverse alphabetical order' }
    ],
    commonMistakes: ['sort does not modify the original file, it only outputs.'],
    bestPractices: ['Combine with > to save sorted output: sort file.txt > sorted.txt'],
    missions: [
      {
        id: 'm1',
        instruction: 'Sort a file named list.txt alphabetically.',
        expectedCommand: 'sort list.txt',
        hint: 'The command is named after what it does.',
        successMessage: 'Lines sorted!',
        xpReward: 25,
        explanation: 'sort reads lines and outputs them in alphabetical order.'
      }
    ],
    xpReward: 70,
    difficulty: 'advanced',
    tags: ['text', 'processing'],
    order: 19
  }
];

async function seedLessons() {
  for (const lesson of LESSONS) {
    await Lesson.findOneAndUpdate(
      { moduleId: lesson.moduleId, lessonId: lesson.lessonId },
      lesson,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Lessons seeded');
}

module.exports = { seedLessons, LESSONS };
