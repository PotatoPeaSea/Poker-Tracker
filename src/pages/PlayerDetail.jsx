import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export default function PlayerDetail() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(AppContext);

  const player = state.players.find(p => p.id === playerId);
  if (!player) return <div className="container"><h2>Player not found</h2></div>;

  // Aggregate stats across ALL sessions and games
  let totalBuyIn = 0;
  let totalCashOut = 0;
  let gamesPlayed = 0;
  const sessionBreakdown = [];

  (state.sessions || []).forEach(session => {
    let sesBuyIn = 0;
    let sesCashOut = 0;
    let sesGames = 0;

    session.games.forEach(game => {
      if (!game.players.includes(playerId)) return;
      sesGames++;
      const buyIn = game.buyIns.filter(b => b.playerId === playerId).reduce((s, b) => s + b.amount, 0);
      const cashOut = (game.cashOuts || []).find(c => c.playerId === playerId);
      const cashOutAmt = cashOut ? parseFloat(cashOut.amount) || 0 : 0;
      sesBuyIn += buyIn;
      sesCashOut += cashOutAmt;
    });

    if (sesGames > 0) {
      totalBuyIn += sesBuyIn;
      totalCashOut += sesCashOut;
      gamesPlayed += sesGames;
      sessionBreakdown.push({
        id: session.id,
        name: session.name,
        date: session.date,
        gamesPlayed: sesGames,
        buyIn: sesBuyIn,
        cashOut: sesCashOut,
        net: sesCashOut - sesBuyIn
      });
    }
  });

  const netProfit = totalCashOut - totalBuyIn;
  const grossWinnings = sessionBreakdown.reduce((sum, s) => sum + (s.net > 0 ? s.net : 0), 0);
  const grossLosses = sessionBreakdown.reduce((sum, s) => sum + (s.net < 0 ? Math.abs(s.net) : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Back Button */}
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '0.5rem 0', gap: '0.25rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Player Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--gradient-gold)', margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#1a1a1e'
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ marginBottom: '0.25rem' }}>{player.name}</h2>
        {player.email && <p style={{ fontSize: '0.8125rem' }}>{player.email}</p>}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Games Played</p>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>{gamesPlayed}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Net Profit</p>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Buy-In</p>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>${totalBuyIn.toFixed(2)}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Cash Out</p>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>${totalCashOut.toFixed(2)}</h2>
        </div>
      </div>

      {/* Gross Win/Loss */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Gross Winnings</p>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--success)' }}>+${grossWinnings.toFixed(2)}</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-gold)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Gross Losses</p>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--danger)' }}>-${grossLosses.toFixed(2)}</span>
        </div>
      </div>

      {/* Session Breakdown */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>♥ Session History</h3>
        {sessionBreakdown.length === 0 ? (
          <p style={{ color: 'var(--text-disabled)', textAlign: 'center' }}>No sessions recorded for this player.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessionBreakdown.map(ses => (
              <div key={ses.id} className="glass-panel" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/session/${ses.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{ses.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {ses.gamesPlayed} game{ses.gamesPlayed !== 1 ? 's' : ''} • Buy-in ${ses.buyIn.toFixed(0)}
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: ses.net >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {ses.net >= 0 ? '+' : ''}${ses.net.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
