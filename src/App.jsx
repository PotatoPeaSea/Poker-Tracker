import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Settings as SettingsIcon } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import GameSession from './pages/GameSession';
import CashOut from './pages/CashOut';
import Profiles from './pages/Profiles';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      {/* Top Banner/Header */}
      <header className="glass-panel" style={{ padding: '1rem', borderRadius: '0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ margin: 0, textShadow: 'var(--shadow-glow)' }}>Poker Tracker</h2>
      </header>

      {/* Main Content Area */}
      <main className="container page-fade-in" style={{ paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/game/:id" element={<GameSession />} />
          <Route path="/cashout/:id" element={<CashOut />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Bottom Navigation Shell for Host */}
      <nav className="glass-panel" style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '1rem', borderRadius: '24px 24px 0 0',
        zIndex: 100
      }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem' }}>
          <Home size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Home</span>
        </Link>
        <Link to="/profiles" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem' }}>
          <Users size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Players</span>
        </Link>
        <Link to="/settings" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '0.25rem' }}>
          <SettingsIcon size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Settings</span>
        </Link>
      </nav>
    </BrowserRouter>
  );
}

export default App;
