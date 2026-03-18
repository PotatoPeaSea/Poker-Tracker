import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { fetchRecentETransfers } from '../utils/gmail';
import { Plus, RefreshCw, DollarSign, QrCode, Edit2, Check, X, UserPlus } from 'lucide-react';

export default function GameSession() {
  const { sessionId, gameId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useContext(AppContext);

  // Find the session and game
  const session = (state.sessions || []).find(s => s.id === sessionId);
  const game = session?.games?.find(g => g.id === gameId);
  const isActive = game?.status === 'active';

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [editingBuyInId, setEditingBuyInId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  if (!session) return <div className="container"><h2>Session not found</h2></div>;
  if (!game) return <div className="container"><h2>Game not found</h2></div>;

  const inGamePlayers = state.players.filter(p => game.players.includes(p.id));
  const availableToAdd = state.players.filter(p => !game.players.includes(p.id));
  const totalPot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);

  // Helper: update a game inside a session
  const updateGame = (updater) => {
    setState(s => ({
      ...s,
      sessions: (s.sessions || []).map(ses =>
        ses.id === sessionId
          ? { ...ses, games: ses.games.map(g => g.id === gameId ? updater(g) : g) }
          : ses
      )
    }));
  };

  const handleAddPlayer = (playerId) => {
    updateGame(g => ({ ...g, players: [...g.players, playerId] }));
  };

  const handleCreateAndAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newId = Date.now().toString();
    setState(s => ({
      ...s,
      players: [...(s.players || []), { id: newId, name: newPlayerName.trim(), email: newPlayerEmail.trim() }],
      sessions: (s.sessions || []).map(ses =>
        ses.id === sessionId
          ? { ...ses, games: ses.games.map(g => g.id === gameId ? { ...g, players: [...g.players, newId] } : g) }
          : ses
      )
    }));
    setNewPlayerName('');
    setNewPlayerEmail('');
    setShowNewPlayer(false);
  };

  const handleLogManualBuyIn = (e) => {
    e.preventDefault();
    if (!selectedPlayerId || !manualAmount) return;
    const amount = parseFloat(manualAmount);
    if (amount <= 0) return;
    const newBuyIn = {
      id: Date.now().toString(),
      playerId: selectedPlayerId,
      amount,
      timestamp: new Date().toISOString(),
      type: 'manual'
    };
    updateGame(g => ({ ...g, buyIns: [newBuyIn, ...g.buyIns] }));
    setManualAmount('');
  };

  const handleStartEdit = (buyIn) => { setEditingBuyInId(buyIn.id); setEditAmount(buyIn.amount.toString()); };
  const handleCancelEdit = () => { setEditingBuyInId(null); setEditAmount(''); };
  const handleSaveEdit = (buyInId) => {
    const amount = parseFloat(editAmount);
    if (amount <= 0 || isNaN(amount)) return;
    updateGame(g => ({ ...g, buyIns: g.buyIns.map(b => b.id === buyInId ? { ...b, amount } : b) }));
    setEditingBuyInId(null);
    setEditAmount('');
  };

  const handleAutoDetect = async () => {
    if (!state.hostToken) {
      alert("Please connect your Google Account in Settings first.");
      return;
    }
    setIsDetecting(true);
    const transfers = await fetchRecentETransfers(state.hostToken);
    let addedCount = 0;
    const newBuyIns = [];
    for (const t of transfers) {
      const matchedPlayer = state.players.find(p =>
        t.rawName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(t.rawName.toLowerCase())
      );
      if (matchedPlayer) {
        const isDuplicate = game.buyIns.some(b =>
          b.type === 'auto' && b.playerId === matchedPlayer.id && b.amount === t.amount &&
          (new Date(t.timestamp).getTime() - new Date(b.timestamp).getTime() < 600000)
        );
        if (!isDuplicate) {
          newBuyIns.push({ id: t.id, playerId: matchedPlayer.id, amount: t.amount, timestamp: t.timestamp, type: 'auto' });
          addedCount++;
          if (!game.players.includes(matchedPlayer.id)) handleAddPlayer(matchedPlayer.id);
        }
      }
    }
    if (newBuyIns.length > 0) {
      updateGame(g => ({ ...g, buyIns: [...newBuyIns, ...g.buyIns] }));
    }
    setIsDetecting(false);
    alert(`Detected and logged ${addedCount} new e-transfers.`);
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="flex-between">
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Game Session</h2>
          <span style={{ fontSize: '0.875rem', color: isActive ? 'var(--success)' : 'var(--text-disabled)' }}>
            {isActive ? '● Active Now' : 'Closed'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Pot</span>
          <h2 style={{ color: 'var(--success)', margin: 0, fontFamily: 'var(--font-mono)' }}>${totalPot.toFixed(2)}</h2>
        </div>
      </div>

      {isActive && (
        <>
          {/* Quick Add Player */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="input-field" style={{ flex: 1 }} onChange={e => handleAddPlayer(e.target.value)} value="">
                <option value="" disabled>+ Add Existing Player</option>
                {availableToAdd.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button className="btn btn-secondary" style={{ padding: '0.75rem' }} onClick={() => setShowNewPlayer(!showNewPlayer)} title="Create New Player">
                <UserPlus size={20} />
              </button>
            </div>
            {showNewPlayer && (
              <form onSubmit={handleCreateAndAddPlayer} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input className="input-field" placeholder="Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required />
                <input className="input-field" placeholder="E-transfer Email (optional)" value={newPlayerEmail} onChange={e => setNewPlayerEmail(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowNewPlayer(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add to Game</button>
                </div>
              </form>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleAutoDetect} disabled={isDetecting}>
              <RefreshCw size={18} className={isDetecting ? 'pulse' : ''} />
              {isDetecting ? 'Scanning...' : 'Auto-Detect'}
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/session/${sessionId}/cashout/${gameId}`)}>
              <QrCode size={18} />
              Cash Out
            </button>
          </div>

          {/* Manual Buy In Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Log Manual Buy-in</h3>
            <form onSubmit={handleLogManualBuyIn} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Player</label>
                <select className="input-field" style={{ width: '100%' }} value={selectedPlayerId} onChange={e => setSelectedPlayerId(e.target.value)} required>
                  <option value="" disabled>Select...</option>
                  {inGamePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Amount</label>
                <input type="number" className="input-field" style={{ width: '100%' }} placeholder="$0.00" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem' }}><Plus size={20}/></button>
            </form>
          </div>
        </>
      )}

      {/* Payment Log */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Buy-in Log</h3>
        {game.buyIns.length === 0 ? (
          <p style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: '1rem 0' }}>No buy-ins logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {game.buyIns.map(b => {
              const p = state.players.find(x => x.id === b.playerId);
              return (
                <div key={b.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: b.type === 'auto' ? '4px solid var(--gold)' : '4px solid var(--border-gold)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{p ? p.name : 'Unknown'}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(b.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {b.type === 'auto' ? 'Auto-detected' : 'Manual'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                    {editingBuyInId === b.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input type="number" className="input-field" style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '1rem', textAlign: 'right' }} value={editAmount} onChange={(e) => setEditAmount(e.target.value)} autoFocus />
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--success)' }} onClick={() => handleSaveEdit(b.id)}><Check size={16}/></button>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={handleCancelEdit}><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        +${b.amount.toFixed(2)}
                        {isActive && (
                          <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => handleStartEdit(b)} title="Edit Amount">
                            <Edit2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
