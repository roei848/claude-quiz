# Claude Quiz

A real-time, multiplayer Kahoot-style quiz platform themed around the Claude Code Bootcamp. Host a quiz on a big screen, let players join from their phones, and compete with live scoring.

## Features

- **Host Mode** - Display the quiz on a large screen with a room code and QR code for players to join
- **Client Mode** - Join a room from your phone and answer questions in real time
- **Solo Mode** - Play locally without multiplayer
- **Live Leaderboard** - Real-time scoring with speed bonus (faster answers = more points)
- **15 Questions** - Claude Code, Agentic Loop, models, and engineering best practices

## Tech Stack

**Frontend:** React, TypeScript, React Router, Socket.IO Client, Vite

**Backend:** Node.js, Express, Socket.IO, TypeScript

## Getting Started

```bash
npm install
npm run dev
```

This starts both the Vite dev server and the WebSocket server (port 3001) concurrently.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run client + server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | WebSocket server only |
| `npm run build` | TypeScript compile + Vite build |
| `npm run preview` | Preview production build |

## How It Works

1. **Host** creates a room and displays the room code / QR code on a shared screen
2. **Players** join by entering the room code and a nickname on their phones
3. Each question has a 20-second timer with multiple choice answers (A/B/C/D)
4. Points: 1000 base + up to 500 speed bonus per correct answer
5. Leaderboard updates after every question, with a final ranking at the end
