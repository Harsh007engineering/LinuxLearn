# LinuxLearn 🐧

> Learn Linux by using Linux — an interactive browser-based Linux command learning platform.

![LinuxLearn](https://img.shields.io/badge/Stack-MERN-3fb950?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-79c0ff?style=flat-square)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-bc8cff?style=flat-square)

---

## Overview

LinuxLearn is a full-stack web application that lets users practice Linux commands directly in their browser — no installation, no VM, no WSL required. It features a realistic virtual filesystem, guided lessons, mission challenges, XP/leveling, achievements, and a leaderboard.

This is **not** a real Linux terminal. It is a simulated shell that interprets commands and maintains a per-user virtual filesystem in MongoDB.

---

## Features

- 🖥️ **Browser Terminal** — Realistic terminal with blinking cursor, command history (↑/↓), Tab completion, and ANSI color support
- 📚 **19 Lessons across 4 Modules** — From `pwd` and `ls` to `grep`, `find`, and `sort`
- 🎯 **Mission System** — Complete challenges by typing the correct command; hints after 2 failures
- ⚡ **XP & Levels** — Earn XP for every command and completed lesson; level up every 500 XP
- 🏆 **8 Achievements** — Unlock badges for milestones (first command, 7-day streak, 100 commands, etc.)
- 🔥 **Daily Login Streaks** — Scaling XP bonus for consecutive daily logins
- 📊 **Leaderboard** — Ranked by XP, streak, and lessons completed
- 🌳 **Virtual Filesystem** — Per-user `/home/user` with persistent directories and files stored in MongoDB
- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 🎊 **Confetti on completion** — Celebrate lesson completions
- 📱 **Fully responsive** — Works on desktop and mobile

---

## Supported Commands

| Command | Description |
|---------|-------------|
| `pwd` | Print working directory |
| `ls`, `ls -a` | List directory contents |
| `cd` | Change directory |
| `mkdir`, `mkdir -p` | Create directories |
| `touch` | Create empty files |
| `rm`, `rm -rf` | Delete files/directories |
| `cp` | Copy files |
| `mv` | Move/rename files |
| `cat` | Display file contents |
| `echo` | Print text / write to files |
| `tree` | Visual directory tree |
| `find` | Search for files |
| `grep` | Search text patterns |
| `head`, `tail` | View file start/end |
| `wc` | Count lines/words/chars |
| `sort` | Sort file lines |
| `date` | Current date/time |
| `whoami` | Current user |
| `hostname` | Machine name |
| `history` | Command history |
| `clear` | Clear terminal screen |
| `help` | List all commands |
| `explain <cmd>` | Learn about a command |

---

## Screenshots

> _Screenshots coming soon — add your own after deployment!_

| Landing Page | Dashboard | Terminal | Lessons |
|---|---|---|---|
| ![landing]() | ![dashboard]() | ![terminal]() | ![lessons]() |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| HTTP | Axios |
| UI | React Icons, React Hot Toast, React Confetti |
| Build | Vite |

---

## Folder Structure

```
linuxlearn/
├── backend/
│   ├── controllers/        # Route handlers (auth, terminal, lessons, etc.)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # JWT auth middleware
│   ├── services/           # Business logic (filesystem, achievements, lessons)
│   ├── server.js           # Entry point
│   ├── seed.js             # Database seeder
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/     # Layout, sidebar
    │   │   ├── terminal/   # TerminalEmulator component
    │   │   └── ui/         # LoadingScreen, etc.
    │   ├── context/        # AuthContext
    │   ├── pages/          # All page components
    │   ├── services/       # Axios API client
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── .env.example
```

---

## Installation & Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/linuxlearn.git
cd linuxlearn
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/linuxlearn
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

```bash
# Seed the database with lessons and achievements
node seed.js

# Start the dev server
npm run dev
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The app will be at `http://localhost:5173`.

---

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret for signing JWTs | ✅ Yes |
| `NODE_ENV` | `development` or `production` | No |
| `FRONTEND_URL` | Frontend URL for CORS in production | In prod |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes |

---

## Deployment

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist IP `0.0.0.0/0` (for Render) in Network Access
4. Copy the connection string

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add environment variables in the Render dashboard
7. After first deploy, run the seed script via Render Shell:
   ```bash
   node seed.js
   ```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com/api
   ```
6. Deploy

---

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/lessons` | Get all lessons | ✅ |
| GET | `/api/lessons/:id` | Get lesson + progress | ✅ |
| POST | `/api/lessons/:id/complete` | Mark lesson complete | ✅ |
| POST | `/api/lessons/:id/mission` | Submit mission answer | ✅ |
| POST | `/api/terminal/execute` | Execute a command | ✅ |
| GET | `/api/terminal/filesystem` | Get virtual filesystem | ✅ |
| DELETE | `/api/terminal/filesystem/reset` | Reset filesystem | ✅ |
| GET | `/api/achievements` | Get achievements | ✅ |
| GET | `/api/leaderboard/xp` | XP leaderboard | ✅ |
| GET | `/api/profile` | Get full profile | ✅ |
| PATCH | `/api/profile` | Update profile | ✅ |
| GET | `/api/history` | Command history | ✅ |

---

## Future Improvements

- [ ] Real-time multiplayer challenges (Socket.io)
- [ ] More modules: permissions, pipes, processes, shell scripting
- [ ] `man` command with full manual pages
- [ ] Pipe operator support (`ls | grep txt`)
- [ ] Dark/light theme toggle
- [ ] Social sharing of achievements
- [ ] Admin dashboard for managing lessons
- [ ] Mobile app (React Native)

---

## License

MIT © 2024 LinuxLearn
