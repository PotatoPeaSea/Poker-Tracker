import React, { useContext, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AppContext } from '../context/AppContext';

export default function CashOut() {
  const { sessionId, gameId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, setState } = useContext(AppContext);

  // Find game nested inside session
  const session = (state.sessions || []).find(s => s.id === sessionId);
  const game = session?.games?.find(g => g.id === gameId);
  const isHost = !!game;

  // For Player View
  const [playerTotal, setPlayerTotal] = useState(0);
  const [chipCounts, setChipCounts] = useState({ white: 0, red: 0, blue: 0, green: 0, black: 0 });

  // For Host View
  const [hostSettlements, setHostSettlements] = useState({});

  useEffect(() => {
    if (isHost && game) {
      const initial = {};
      game.players.forEach(pid => {
        const existing = game.cashOuts.find(c => c.playerId === pid);
        initial[pid] = existing ? existing.amount : '';
      });
      setHostSettlements(initial);
    }
  }, [isHost, game]);

  const chipValues = isHost ? state.chipValues : {
    white: parseFloat(searchParams.get('white')) || 0,
    red: parseFloat(searchParams.get('red')) || 0,
    blue: parseFloat(searchParams.get('blue')) || 0,
    green: parseFloat(searchParams.get('green')) || 0,
    black: parseFloat(searchParams.get('black')) || 0,
  };

  const handleChipChange = (color, qty) => {
    const val = parseInt(qty) || 0;
    const newCounts = { ...chipCounts, [color]: val };
    setChipCounts(newCounts);
    let total = 0;
    Object.keys(newCounts).forEach(c => { total += newCounts[c] * chipValues[c]; });
    setPlayerTotal(total);
  };

  const handleHostSave = () => {
    const cashOuts = Object.entries(hostSettlements).map(([playerId, amount]) => ({
      playerId,
      amount: parseFloat(amount) || 0,
      timestamp: new Date().toISOString()
    }));
    setState(s => ({
      ...s,
      sessions: (s.sessions || []).map(ses =>
        ses.id === sessionId
          ? { ...ses, games: ses.games.map(g => g.id === gameId ? { ...g, cashOuts, status: 'closed' } : g) }
          : ses
      )
    }));
    alert("Game closed and settlements saved!");
  };

  if (!isHost) {
    // PLAYER VIEW
    return (
      <div className="flex-col container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2>Count Your Chips</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter the quantity of each chip color you have.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(chipValues).map(([color, value]) => {
            if (value === 0) return null;
            return (
              <div key={color} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `var(--chip-${color})`, border: color === 'white' ? '1px solid #ddd' : color === 'black' ? '1px solid #444' : 'none', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' }}></div>
                  <div>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, display: 'block' }}>{color}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>${value.toFixed(2)} ea</span>
                  </div>
                </div>
                <input type="number" className="input-field" style={{ width: '80px', textAlign: 'center' }} placeholder="Qty" value={chipCounts[color] || ''} onChange={(e) => handleChipChange(color, e.target.value)} />
              </div>
            );
          })}
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--gold)' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Your Total</p>
          <h1 style={{ color: 'var(--success)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>${playerTotal.toFixed(2)}</h1>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Show this screen to the host.
        </div>
      </div>
    );
  }

  // HOST VIEW
  const inGamePlayers = state.players.filter(p => game.players.includes(p.id));

  // Calculate Optimized Transfers if game is closed
  let transfers = [];
  if (game.status === 'closed') {
    const balances = inGamePlayers.map(p => {
      const playerBuyIn = game.buyIns.filter(b => b.playerId === p.id).reduce((sum, b) => sum + b.amount, 0);
      const rawCashOut = parseFloat(game.cashOuts.find(c => c.playerId === p.id)?.amount) || 0;
      return { id: p.id, name: p.name, net: rawCashOut - playerBuyIn };
    });
    let debtors = balances.filter(b => b.net < 0).sort((a, b) => a.net - b.net);
    let creditors = balances.filter(b => b.net > 0).sort((a, b) => b.net - a.net);
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const debt = -debtors[d].net;
      const credit = creditors[c].net;
      const amount = Math.min(debt, credit);
      if (amount > 0.01) transfers.push({ from: debtors[d].name, to: creditors[c].name, amount });
      debtors[d].net += amount;
      creditors[c].net -= amount;
      if (Math.abs(debtors[d].net) < 0.01) d++;
      if (Math.abs(creditors[c].net) < 0.01) c++;
    }
  }

  const qrUrl = new URL(window.location.href);
  Object.entries(chipValues).forEach(([color, val]) => qrUrl.searchParams.set(color, val));

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {game.status === 'active' && (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Cash Out</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Players can scan this code to calculate their chip totals on their own phones.</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px' }}>
            <QRCodeSVG value={qrUrl.toString()} size={200} />
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Final Settlements</h3>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {inGamePlayers.map(p => {
            const playerBuyIn = game.buyIns.filter(b => b.playerId === p.id).reduce((sum, b) => sum + b.amount, 0);
            const rawCashOut = parseFloat(hostSettlements[p.id]) || 0;
            const net = rawCashOut - playerBuyIn;
            return (
              <div key={p.id} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Final Chips: $</span>
                    <input type="number" className="input-field" style={{ width: '90px', padding: '0.5rem', textAlign: 'right' }} placeholder="0.00" value={hostSettlements[p.id]} onChange={(e) => setHostSettlements({...hostSettlements, [p.id]: e.target.value})} disabled={game.status === 'closed'} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-disabled)' }}>Buy In: ${playerBuyIn.toFixed(2)}</span>
                  <span style={{ color: net >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    Net: {net >= 0 ? '+' : ''}${net.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
          {game.status === 'active' && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleHostSave}>
              Close Game & Save
            </button>
          )}
          {game.status === 'closed' && transfers.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-gold)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>Optimized Payouts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {transfers.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7,61,29,0.4)', padding: '0.75rem', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{t.from}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>pays ➔</span>
                    <span style={{ fontWeight: 500 }}>{t.to}</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>${t.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {game.status === 'closed' && transfers.length === 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              All balanced! No transfers needed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
