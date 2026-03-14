# Poker Tracker

A sophisticated, mobile-first web application for tracking home poker games, managing player profiles, tracking buy-ins, and optimizing cash-out settlements.

## Features

- **Offline-First Dashboard**: Local-storage powered games and player tracking.
- **Gmail Automation**: Automatically map and log incoming e-Transfers to player buy-ins via Gmail API.
- **QR Cash-out Calculator**: Hosts generate a visual QR code for players to scan. Players are served a stateless calculator matched to the game's chip value denominations.
- **Settlement Optimization**: On game close, a greedy debt-simplification algorithm routes all debts so everyone is paid correctly in the minimum number of transactions.

## Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   Create a `.env.local` file in the root directory and add your Google Cloud Client ID (this file is ignored by Git to protect your credentials).
   ```text
   VITE_GOOGLE_CLIENT_ID="your_google_client_id_here..."
   ```
   > Note: The Client ID must be configured in Google Cloud Console with the `gmail.readonly` scope and authorized JavaScript origins pointing to your localhost.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Stack
- Vite
- React
- React Router
- react-oauth/google
- Custom Glassmorphic CSS engine
