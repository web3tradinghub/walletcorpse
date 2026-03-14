# WalletCorpse - Compromised Crypto Wallet Defense System

## Overview
WalletCorpse is a specialized defense system designed to protect and manage compromised cryptocurrency wallets. It provides advanced defense mechanisms like "Scorched Earth," "Ghost Redirect," and "Gas Trap" to thwart attackers and recover assets from compromised accounts.

## Project Structure
- `src/app`: Next.js App Router for file-based routing.
  - `dashboard/page.tsx`: The main Security Operations Dashboard with staggered animations.
- `src/components`: Reusable UI components.
  - `dashboard`: Components for the main defense dashboard.
  - `CustomCursor.tsx`: Custom green crosshair cursor for the entire app.
- `src/lib`: Core logic and utilities.
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript definitions.

## Design & Animations
- **Global Themes**:
  - **Custom Cursor**: A green crosshair tracking the mouse.
  - **Global Scanlines**: CRT-style overlay on all pages.
  - **Button/Link Hover**: Glow spread effects and animated underlines.
- **Hero Animations**:
  - **Floating Astronaut**: Up-down loop (3s ease).
  - **Pulsing Orb**: Slow scale pulse (4s loop).
  - **Swirling Circles**: Continuous 360deg rotation (8s linear).
  - **Particle Float**: Static-pre-generated random floating dots.
- **Dashboard Animations**:
  - **Page Load**: Staggered fade-in/up (0.1s delay between children).
  - **Metric Cards**: Dynamic count-up numbers on mount.
  - **Status Alert Bar**: Left-to-right scan line wipe animation.
  - **Activity Log**: Staggered slide-in from left (0.05s stagger).

## Progress Tracking
- [x] Create folder structure and base types.
- [x] Implement `WalletCorpse.sol` smart contract.
- [x] Build high-fidelity Hero and Dashboard layouts.
- [x] Create `useCompromisedWallet` hook.
- [x] Apply "Dark Web3" theme and advanced animations.
- [x] Verify code quality with linting.