# Edits Made

## Rebranding
- Renamed project from "Moon Rider" to "Aurora Beat".
- Updated `index.html` title and meta tags.
- Updated `README.md`.

## Bug Fixes
- **Pause/Resume**: Fixed an issue where the game would not resume correctly after pausing.
- **OpenSSL**: Added `NODE_OPTIONS=--openssl-legacy-provider` to build scripts to support Node.js v17+.
- **Loading**: Fixed "stuck loading" issues by adding error handling in `touch-beat.js` and `multiplayer.js`.
- **Performance**: Fixed Expert+ lag and disappearing notes by capping `timeDelta` in `beat.js` and extending road curve in `supercurve.js`.
- **Keyboard**: 
    - Fixed crash when typing (`TypeError: Cannot read properties of null`).
    - Fixed visual transparency issues by disabling `depthTest` on keyboard materials.

## Features
- **Safety**: Added an "Out of Bounds" warning system.
- **Input**: Added `keyboard-input` component for better accessibility.
- **Touch Mode**:
    - Re-implemented Touch Mode logic.
    - Fixed invisible blocks by forcing 'dot' type (Punch blocks).
    - Added click/touch interaction support to beats.
    - Removed walls in Touch Mode for better playability.
- **Multiplayer**:
    - Implemented Node.js server with Socket.io (`server/multiplayer.js`).
    - Created client-side component (`src/components/multiplayer.js`).
    - Added "Multiplayer" mode to the main menu.
    - Enabled Multiplayer mode for Web/Non-VR users.
    - Implemented player synchronization (Head, Hands, Score, Combo).
    - Added Room support (Create/Join Private Rooms).
    - Added Mode selection within Multiplayer (Classic/Punch/Touch).
    - Consolidated build/run commands into `npm start`.

## Configuration
- **Dependencies**: Added `express`, `socket.io`, `socket.io-client`.
- **Build**: Updated `package.json` scripts to streamline development and production runs.
- **Cleanup**: Removed duplicate dependency entries in `package.json` and consolidated the `server` script into `start`.
- **Refactor**: Renamed `server/index.js` to `server/multiplayer.js` for clarity.
