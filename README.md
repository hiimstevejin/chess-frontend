_________ .__                           .___        _____       
\_   ___ \|  |__   ____   ______ ______ |   | _____/ ____\____  
/    \  \/|  |  \_/ __ \ /  ___//  ___/ |   |/    \   __\/  _ \ 
\     \___|   Y  \  ___/ \___ \ \___ \  |   |   |  \  | (  <_> )
 \______  /___|  /\___  >____  >____  > |___|___|  /__|  \____/ 
        \/     \/     \/     \/     \/           \/             

## Overview

Chess Info is a Next.js frontend for real-time chess play. It provides a landing page to create or join a game, a board page for live play, and WebSocket integration for either human-vs-human games or games against a backend engine.

The frontend owns the board UI and local move validation through `chess.js`. The backend is responsible for room coordination, color assignment, relaying moves, and engine responses in bot mode.

## Features

- Create a new game against another player or against a bot.
- Generate a unique game room ID with `uuid`.
- Join an existing player game by entering its room ID.
- Randomize the creator's starting color and orient the board automatically.
- Play in real time over WebSockets.
- Validate legal moves locally with `chess.js`.
- Show move history in paired turns.
- Highlight legal destination squares on click.
- Support pawn promotion with an in-board promotion picker.
- Detect checkmate, draw, and stalemate locally.
- Show connection state: `connecting`, `connected`, `disconnected`, or `error`.
- Reset the game from the frontend and notify the backend.
- Render animated decorative chessboards on the home page background.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand for client state
- `chess.js` for move validation and game-state rules
- `react-chessboard` for board rendering
- Native browser WebSockets for real-time communication

## Project Structure

```text
app/
  page.tsx              Home page
  board/[id]/page.tsx   Game route
components/
  board/                Game UI components
  home/                 Landing page UI
hooks/
  useChessSocket.ts     WebSocket lifecycle and message handling
store/
  useChessStore.ts      Board state, move logic, and game status
```

## How It Works

### Home page

The home page lets the user:

- start a new player-vs-player game
- start a new player-vs-bot game
- join an existing player room by ID

When a new game is created, the frontend generates a UUID and redirects to:

```text
/board/<game-id>?mode=player&color=w
/board/<game-id>?mode=bot&color=b
```

The `color` query param is randomized on creation. If a user joins an existing room manually, no color is passed and the backend assigns one after the socket connects.

### Board page

The board route loads `ChessGame`, which:

- resets local store state for the new game ID
- applies any initial color passed from the URL
- opens a WebSocket connection to the backend
- renders the board, status badge, move list, promotion UI, and game-over overlay

### Move handling

Moves are validated locally with `chess.js`. On a valid move, the frontend:

1. updates FEN and move history in Zustand
2. sends the move and current FEN to the backend
3. checks whether the game has ended

Promotion is detected before the move is made. If needed, the UI pauses the move and asks the player to choose `q`, `r`, `n`, or `b`.

### Real-time sync

The frontend connects to:

```text
ws://127.0.0.1:8000/ws/game/<game-id>?mode=<mode>&color=<color>
```

Expected backend behavior:

- `mode=player`: relay moves between both clients in the same room
- `mode=bot`: receive player moves and respond with engine moves
- assign colors and send a `COLOR_ASSIGNED` message immediately after connect
- accept a `RESET` message when the user restarts the game

Supported inbound messages currently include:

- `COLOR_ASSIGNED`
- `ENGINE_MOVE`
- bare move payloads like `{ "move": "e7e5", "fen": "..." }`
- `ERROR`

If the human is black in bot mode, the frontend sends:

```json
{
  "type": "ANNOUNCE_COLOR",
  "color": "b"
}
```

so the backend engine can make the first white move.

## Setup

### Requirements

- Node.js 20+ recommended
- `pnpm` installed globally
- a backend WebSocket server running on `ws://127.0.0.1:8000`

This repository already includes a `pnpm-lock.yaml`, so `pnpm` is the intended package manager.

### Install dependencies

```bash
pnpm install
```

### Start the frontend

```bash
pnpm dev
```

The app will run at:

```text
http://localhost:3000
```

### Build for production

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

## Backend Contract

The frontend assumes a backend with these behaviors:

- WebSocket endpoint: `/ws/game/{game_id}`
- query params:
  - `mode=player` or `mode=bot`
  - optional `color=w|b`
- color assignment message:

```json
{
  "type": "COLOR_ASSIGNED",
  "color": "w"
}
```

- move payload sent by frontend:

```json
{
  "move": "e2e4",
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
}
```

- engine response payload:

```json
{
  "type": "ENGINE_MOVE",
  "move": "e7e5"
}
```

- reset payload:

```json
{
  "type": "RESET"
}
```

Without a compatible backend, the board UI will load, but live synchronization and bot play will not function.

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
