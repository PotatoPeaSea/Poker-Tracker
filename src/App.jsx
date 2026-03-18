import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Settings as SettingsIcon } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import SessionDetail from './pages/SessionDetail';
import GameSession from './pages/GameSession';
import CashOut from './pages/CashOut';
import Profiles from './pages/Profiles';
import PlayerDetail from './pages/PlayerDetail';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      {/* Casino Header */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(42,26,14,0.95), rgba(30,18,8,0.9))',
        padding: '1rem',
        borderBottom: '2px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>♠</span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>POKER TRACKER</h2>
        <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>♣</span>
      </header>

      {/* Main Content Area */}
      <main className="container page-fade-in" style={{ paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/session/:sessionId" element={<SessionDetail />} />
          <Route path="/session/:sessionId/game/:gameId" element={<GameSession />} />
          <Route path="/session/:sessionId/cashout/:gameId" element={<CashOut />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/player/:playerId" element={<PlayerDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Casino Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 1rem',
        background: 'linear-gradient(0deg, rgba(42,26,14,0.98), rgba(30,18,8,0.95))',
        borderTop: '2px solid var(--border-gold)',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)'
      }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem', transition: 'color 0.2s' }}>
          <Home size={22} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</span>
        </Link>
        <Link to="/profiles" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem', transition: 'color 0.2s' }}>
          <Users size={22} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Players</span>
        </Link>
        <Link to="/settings" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem', transition: 'color 0.2s' }}>
          <SettingsIcon size={22} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</span>
        </Link>
      </nav>
    </BrowserRouter>
  );
}

export default App;
