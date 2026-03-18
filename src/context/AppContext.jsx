import React, { createContext, useState, useEffect } from 'react';

// Default App State Structure
const DEFAULT_STATE = {
  players: [], // { id, name, email }
  sessions: [], // { id, name, date, status: 'active'|'closed', games: [{ id, date, status, players, buyIns, cashOuts }] }
  chipValues: {
    white: 0.25,
    red: 0.50,
    blue: 1.00,
    green: 5.00,
    black: 10.00
  }
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('poker_tracker_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        let merged = { ...DEFAULT_STATE, ...parsed };

        // Migration: if old flat games[] exist, wrap them in a legacy session
        if (merged.games && merged.games.length > 0 && (!merged.sessions || merged.sessions.length === 0)) {
          merged.sessions = [{
            id: 'legacy_' + Date.now(),
            name: 'Imported Session',
            date: merged.games[0]?.date || new Date().toISOString(),
            status: 'closed',
            games: merged.games
          }];
          delete merged.games;
        } else {
          delete merged.games; // Clean up old key
        }
        return merged;
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    return DEFAULT_STATE;
  });

  // Persist state to localStorage on every change
  useEffect(() => {
    localStorage.setItem('poker_tracker_state', JSON.stringify(state));
  }, [state]);

  // ── Player Actions ──
  const addPlayer = (player) => {
    const newId = Date.now().toString();
    setState(s => ({
      ...s,
      players: [...(s.players || []), { ...player, id: newId }]
    }));
    return newId;
  };

  const updatePlayer = (id, updates) => {
    setState(s => ({
      ...s,
      players: s.players.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deletePlayer = (id) => {
    setState(s => ({
      ...s,
      players: (s.players || []).filter(p => p.id !== id)
    }));
  };

  // ── Session Actions ──
  const createSession = (name) => {
    const newSession = {
      id: Date.now().toString(),
      name: name || `Session ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: 'active',
      games: []
    };
    setState(s => ({
      ...s,
      sessions: [newSession, ...(s.sessions || [])]
    }));
    return newSession.id;
  };

  const closeSession = (sessionId) => {
    setState(s => ({
      ...s,
      sessions: (s.sessions || []).map(ses =>
        ses.id === sessionId ? { ...ses, status: 'closed' } : ses
      )
    }));
  };

  const deleteSession = (sessionId) => {
    setState(s => ({
      ...s,
      sessions: (s.sessions || []).filter(ses => ses.id !== sessionId)
    }));
  };

  // ── Game Actions (nested inside sessions) ──
  const startGame = (sessionId, playerIds = []) => {
    const newGame = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'active',
      players: playerIds,
      buyIns: [],
      cashOuts: []
    };
    setState(s => ({
      ...s,
      sessions: (s.sessions || []).map(ses =>
        ses.id === sessionId
          ? { ...ses, games: [newGame, ...ses.games] }
          : ses
      )
    }));
    return newGame.id;
  };

  return (
    <AppContext.Provider value={{
      state,
      setState,
      actions: {
        addPlayer,
        updatePlayer,
        deletePlayer,
        createSession,
        closeSession,
        deleteSession,
        startGame
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};
