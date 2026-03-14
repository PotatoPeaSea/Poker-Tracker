import React, { createContext, useState, useEffect } from 'react';

// Default App State Structure
const DEFAULT_STATE = {
  players: [], // { id, name, email }
  games: [], // { id, date, status: 'active' | 'closed', players: [id1, id2], buyIns: [{ playerId, amount, timestamp, type: 'manual'|'auto' }], cashOuts: [{ playerId, amount, timestamp }] }
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
        return { ...DEFAULT_STATE, ...parsed };
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

  // Actions
  const addPlayer = (player) => {
    setState(s => ({
      ...s,
      players: [...(s.players || []), { ...player, id: Date.now().toString() }]
    }));
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

  const startGame = (playerIds) => {
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
      games: [newGame, ...(s.games || [])]
    }));
  };



  return (
    <AppContext.Provider value={{
      state,
      setState, /* Expose direct setState cautiously for advanced mutations if needed, or build out actions */
      actions: {
        addPlayer,
        updatePlayer,
        deletePlayer,
        startGame
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};
