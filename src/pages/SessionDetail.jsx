import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Play, Trophy, Lock, UserPlus } from 'lucide-react';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useContext(AppContext);

  const session = (state.sessions || []).find(s => s.id === sessionId);
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  if (!session) return <div className="container"><h2>Session not found</h2></div>;

  const isActive = session.status === 'active';

  // Leaderboard: compute net winnings per player across all games in this session
  const playerStats = {};
  session.games.forEach(game => {
    game.players.forEach(pid => {
      if (!playerStats[pid]) playerStats[pid] = { buyIn: 0, cashOut: 0, gamesPlayed: 0 };
      playerStats[pid].gamesPlayed += 1;
      const buyIn = game.buyIns.filter(b => b.playerId === pid).reduce((sum, b) => sum + b.amount, 0);
      const cashOut = (game.cashOuts || []).find(c => c.playerId === pid);
      playerStats[pid].buyIn += buyIn;
      playerStats[pid].cashOut += cashOut ? parseFloat(cashOut.amount) || 0 : 0;
    });
  });

  const leaderboard = Object.entries(playerStats)
    .map(([pid, stats]) => {
      const player = state.players.find(p => p.id === pid);
      return {
        id: pid,
        name: player ? player.name : 'Unknown',
        net: stats.cashOut - stats.buyIn,
        buyIn: stats.buyIn,
        cashOut: stats.cashOut,
        gamesPlayed: stats.gamesPlayed
      };
    })
    .sort((a, b) => b.net - a.net);

  const handleStartGame = () => {
    const gameId = actions.startGame(sessionId, []);
    navigate(`/session/${sessionId}/game/${gameId}`);
  };

  const handleCloseSession = () => {
    const openGames = session.games.filter(g => g.status === 'active');
    if (openGames.length > 0) {
      alert(`Close all ${openGames.length} active game(s) first before closing the session.`);
      return;
    }
    actions.closeSession(sessionId);
  };

  const handleAddNewPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    actions.addPlayer({ name: newPlayerName.trim(), email: newPlayerEmail.trim() });
    setNewPlayerName('');
    setNewPlayerEmail('');
    setShowNewPlayer(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Session Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{session.name}</h2>
            <span style={{ fontSize: '0.8125rem', color: isActive ? 'var(--success)' : 'var(--text-disabled)' }}>
              {isActive ? '● Active' : 'Closed'} • {new Date(session.date).toLocaleDateString()}
            </span>
          </div>
          {isActive && (
            <button className="btn btn-danger" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }} onClick={handleCloseSession}>
              <Lock size={14} /> Close Session
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}><Trophy size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Leaderboard</h3>
        {leaderboard.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p>No games played yet. Start a game to see the leaderboard!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.id}
                className="glass-panel"
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                onClick={() => navigate(`/player/${entry.id}`)}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: idx === 0 ? 'var(--gradient-gold)' : idx === 1 ? 'linear-gradient(135deg, #c0c0c0, #888)' : idx === 2 ? 'linear-gradient(135deg, #cd7f32, #a06020)' : 'var(--bg-rail-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', color: idx < 3 ? '#1a1a1e' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)', flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{entry.name}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''} • Bought in ${entry.buyIn.toFixed(0)}
                  </div>
                </div>
                <span style={{
                  fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
                  color: entry.net >= 0 ? 'var(--success)' : 'var(--danger)'
                }}>
                  {entry.net >= 0 ? '+' : ''}${entry.net.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Games List */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>♣ Games</h3>
        {session.games.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p>No games yet. Deal one in!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {session.games.map((game, idx) => {
              const pot = game.buyIns.reduce((s, b) => s + b.amount, 0);
              return (
                <div
                  key={game.id}
                  className="glass-panel"
                  style={{ padding: '1rem', cursor: 'pointer' }}
                  onClick={() => navigate(`/session/${sessionId}/game/${game.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Game #{session.games.length - idx}</h4>
                      <span style={{ fontSize: '0.75rem', color: game.status === 'active' ? 'var(--success)' : 'var(--text-disabled)' }}>
                        {game.status === 'active' ? '● Active' : 'Closed'} • {game.players.length} players
                      </span>
                    </div>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)' }}>
                      ${pot.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem' }} onClick={handleStartGame}>
            <Play size={20} /> Deal a New Game
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowNewPlayer(!showNewPlayer)}>
            <UserPlus size={18} /> Add New Player
          </button>
          {showNewPlayer && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddNewPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input className="input-field" placeholder="Player Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required autoFocus />
                <input className="input-field" placeholder="E-transfer Email (optional)" value={newPlayerEmail} onChange={e => setNewPlayerEmail(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowNewPlayer(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Player</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
