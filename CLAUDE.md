# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start both Vite client (port 5173) and WebSocket server (port 3001) concurrently
npm run dev:client    # Vite dev server only
npm run dev:server    # WebSocket server only (tsx watch server/index.ts)
npm run build         # tsc + vite build (output to dist/)
npm run start         # Run production server (serves dist/ + WebSocket)
npm run preview       # Preview the production build
```

No test runner is configured.

## Architecture

This is a real-time multiplayer Kahoot-style quiz app. The frontend and backend share types via `shared/types.ts`.

### Frontend (React + Vite, `src/`)

Routing in [src/App.tsx](src/App.tsx):
- `/` → `ModeSelect` (choose host / play / solo)
- `/host` → `HostApp` (big-screen host view)
- `/play` → `ClientApp` (player phone view)
- `/solo` → `SoloApp` (offline single-player)

The singleton Socket.IO client lives in [src/socket.ts](src/socket.ts) (`autoConnect: false`). Components manually call `socket.connect()` when needed.

**Host flow** (`src/components/host/`): `HostApp` manages state and renders sub-components based on game phase — `HostLobby` → `HostQuestion` → `HostReveal` → `HostLeaderboard` → `HostFinal`.

**Client flow** (`src/components/client/`): `ClientApp` manages state — `ClientJoin` → `ClientWaiting` → `ClientAnswer` → `ClientFeedback` → `ClientFinal`. On page refresh, the client attempts `client:rejoin` using nickname stored in sessionStorage.

### Backend (`server/`)

**[server/index.ts](server/index.ts)**: Express + Socket.IO server. Manages a `Map<roomCode, Room>` and a `Map<socketId, roomCode>`. In production it also serves the React `dist/` build.

**[server/Room.ts](server/Room.ts)**: All game logic lives in the `Room` class. Tracks players, timers, scoring, and phases. Game phases: `lobby → question → reveal → leaderboard → (repeat or) finished`.

Scoring: 1000 base points + up to 500 speed bonus based on answer time relative to the 20-second limit.

Reconnect: players have a 30-second grace period (`REJOIN_GRACE_MS`) after disconnect before being permanently removed.

### Shared (`shared/types.ts`)

Single source of truth for all TypeScript types used by both client and server — `Question`, `GamePhase`, socket event payloads, etc. `src/types.ts` simply re-exports from here.

### Socket Events

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client→Server | `host:create` | Create room (optional `limit` to cap question count) |
| Client→Server | `host:start` | Start quiz |
| Client→Server | `host:next` | Advance from reveal→leaderboard or leaderboard→next question |
| Client→Server | `client:join` | Join room with nickname |
| Client→Server | `client:answer` | Submit answer |
| Client→Server | `client:rejoin` | Reconnect after page refresh |
| Server→Host | `room:created`, `room:playerJoined`, `room:question`, `room:tick`, `room:reveal`, `room:leaderboard`, `room:finished`, `room:state` | Game state updates |
| Server→Client | `client:joined`, `client:rejoined`, `client:questionStart`, `client:tick`, `client:feedback`, `client:phase`, `client:finished` | Player-specific events |

### Questions

Questions are in [questions.json](questions.json) (also copied to `public/questions.json` for the frontend). Add `?q=N` to the host URL to limit to N questions during testing (passed as `limit` in `host:create`).
