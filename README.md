# Chess Blocker Extension

A browser extension designed to help reduce compulsive chess playing by tracking completed games on Chess.com and temporarily blocking access after a set limit.

---

## Project Purpose

This extension was built as a learning project to understand:

- Browser extension development
- Chrome Manifest V3
- Content scripts
- DOM manipulation
- MutationObserver
- Chrome storage APIs
- User behavior restriction systems

---

## Features

### Current Features

- Detects when a Chess.com game ends
- Tracks number of completed games
- Counts games in real time
- Blocks the user after 3 games
- Displays a full-screen overlay blocker
- Cooldown timer resets automatically after set duration

---

## How It Works

### Game Detection
The extension watches for changes in the Chess.com webpage using `MutationObserver`.

When the game-over modal appears:

- Game is counted once
- Duplicate counting is prevented
- Game count is stored locally

---

### Blocking Logic

After 3 games:

- User is blocked
- Overlay appears
- Cooldown timer starts

---

## Tech Stack

- JavaScript
- Chrome Extension Manifest V3
- Chrome Storage API
- DOM APIs
- MutationObserver

---

## Project Structure

```txt
chess-blocker-extension/
│
├── manifest.json       # Extension configuration
├── content.js          # Main logic for tracking + blocking
├── background.js       # Background service worker
└── README.md           # Project documentation