# collaborative-canvas

A real-time multiplayer whiteboard. Create a room, share the link, and draw together — pen, rectangle, and circle tools, live cursors from every participant, and full persistence to Postgres.

## Stack

- **Frontend** — React, TypeScript, Canvas API, Zustand, Socket.IO client, Vite
- **Backend** — NestJS, Socket.IO, PostgreSQL, Kysely

## Project layout

```
backend/   NestJS API + WebSocket gateway + Kysely/Postgres persistence
frontend/  React app (home page, room page, canvas, toolbar)
```

## Getting started

Requires Node 20+ and Docker.

```bash
npm install                       # installs both workspaces
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

npm run db:up                     # starts Postgres in Docker (port 5433)
npm run migrate --workspace backend

npm run dev:backend               # http://localhost:3001
npm run dev:frontend              # http://localhost:5173
```

Open http://localhost:5173, create a room, and share the URL to collaborate.

## How it works

- **Rooms** are created via `POST /rooms` and identified by UUID; the room URL itself is the invite link.
- **Drawing** streams over Socket.IO: `element:start` / `element:update` while a stroke is in progress (so peers see it drawn live), then `element:end` persists the finished element to Postgres and broadcasts it to the room.
- **Undo** removes the most recently created element in the room; **Clear** wipes every element in the room. Both are broadcast so all clients stay in sync.
- **Joining a room** loads existing elements from the database (`room:init`) before any new drawing events are applied.

## Implementation

### Data model

Two Postgres tables, managed with Kysely migrations:

```
rooms      id, name, created_at
elements   id, room_id, type, color, stroke_width, data, timestamps
```

`data` holds either `{ points: [{x,y}, ...] }` for pen strokes or `{ x, y, width, height }` for shape bounding boxes. 

### REST APIs

| Route | Purpose |
|---|---|
| `POST /rooms` | Create a room, returns `{ id, name, createdAt }` |
| `GET /rooms/:id` | Look up a room (used to validate a pasted join link before opening a socket) |

### WebSocket contract 

| Client → Server | Server → Client | Effect |
|---|---|---|
| `room:join` | `room:init`, `room:users` | Joins the Socket.IO room, sends back all persisted elements + current presence list |
| `room:leave` | `room:users` | Removes the user from the in-memory presence map for that room |
| `element:start` / `element:update` | relayed as-is | Live in-progress stroke/shape, not yet persisted — this is what makes drawing feel real-time for peers |
| `element:end` | `element:end` Persists the finished element via `ElementsService.create`, then broadcasts the canonical row to everyone including the sender |
| `board:undo` | `board:undo { id }` | Deletes the most recently created element in the room (`ORDER BY created_at DESC LIMIT 1`) |
| `board:clear` | `board:clear` | Deletes every element for the room |

Presence (`roomUsers: Map<roomId, Map<socketId, RoomUser>>`) is kept in gateway memory, not the database —
it's inherently ephemeral and rebuilt from live socket connections on every join/disconnect.

### Frontend

- **State** — a single Zustand store holds `elements` (persisted,
  finalized) and `liveElements` (in-progress, keyed by id, both local and remote) separately, plus tool/color/
  stroke-width UI state. Keeping "live" and "final" elements apart means an in-progress remote stroke never gets treated as done, and `element:end` can replace a live entry in place (avoiding a z-order flicker when
  the server's persisted copy arrives).
- **Rendering** — `Canvas.tsx` owns a single `<canvas>`, resized via `ResizeObserver` and scaled for `devicePixelRatio`. It re-renders on every store change by redrawing `elements` then `liveElements` on top
  (`utils/draw.ts`).
- **Local drawing** is optimistic: on pointer-up the finished element is written straight into `elements` (not just cleared from `liveElements`), so the artist sees their stroke settle instantly instead of waiting on a round trip; the server's `element:end` echo then reconciles it by id.
- **Identity** — `userId` is a UUID persisted in `localStorage` (`utils/id.ts`), and each user's avatar/cursor color is deterministically derived from that id (`utils/color.ts`), so a refresh keeps the same identity and color within a room.
