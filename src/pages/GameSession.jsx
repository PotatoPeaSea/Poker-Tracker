import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { fetchRecentETransfers } from '../utils/gmail';
import { Plus, RefreshCw, DollarSign, QrCode, Edit2, Check, X } from 'lucide-react';

export default function GameSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useContext(AppContext);
  
  const game = state.games.find(g => g.id === id);
  const isActive = game?.status === 'active';

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [editingBuyInId, setEditingBuyInId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  if (!game) return <div className="container"><h2>Game not found</h2></div>;

  const inGamePlayers = state.players.filter(p => game.players.includes(p.id));
  const availableToAdd = state.players.filter(p => !game.players.includes(p.id));

  // Totals
  const totalPot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);

  const handleAddPlayer = (playerId) => {
    setState(s => ({
      ...s,
      games: s.games.map(g => g.id === id ? { ...g, players: [...g.players, playerId] } : g)
    }));
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

    setState(s => ({
      ...s,
      games: s.games.map(g => g.id === id ? { ...g, buyIns: [newBuyIn, ...g.buyIns] } : g)
    }));
    setManualAmount('');
  };

  const handleStartEdit = (buyIn) => {
    setEditingBuyInId(buyIn.id);
    setEditAmount(buyIn.amount.toString());
  };

  const handleCancelEdit = () => {
    setEditingBuyInId(null);
    setEditAmount('');
  };

  const handleSaveEdit = (buyInId) => {
    const amount = parseFloat(editAmount);
    if (amount <= 0 || isNaN(amount)) return;

    setState(s => ({
      ...s,
      games: s.games.map(g => g.id === id ? { 
        ...g, 
        buyIns: g.buyIns.map(b => b.id === buyInId ? { ...b, amount } : b)
      } : g)
    }));
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

    // Attempt to map transfers to players
    for (const t of transfers) {
      // Very simple fuzzy matching: if the transfer name contains the player's name
      const matchedPlayer = state.players.find(p => 
        t.rawName.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(t.rawName.toLowerCase())
      );

      // Verify it wasn't already logged recently (deduplication by approximate timestamp or exact ID if we had persistent msg IDs)
      // For MVP, we check if there's already an auto buy-in of exact same amount for that player in the last 10 mins
      if (matchedPlayer) {
        const isDuplicate = game.buyIns.some(b => 
          b.type === 'auto' && 
          b.playerId === matchedPlayer.id && 
          b.amount === t.amount &&
          (new Date(t.timestamp).getTime() - new Date(b.timestamp).getTime() < 600000)
        );

        if (!isDuplicate) {
          newBuyIns.push({
            id: t.id,
            playerId: matchedPlayer.id,
            amount: t.amount,
            timestamp: t.timestamp,
            type: 'auto'
          });
          addedCount++;
          
          // Auto add player to game if they aren't already
          if (!game.players.includes(matchedPlayer.id)) {
            handleAddPlayer(matchedPlayer.id);
          }
        }
      }
    }

    if (newBuyIns.length > 0) {
      setState(s => ({
        ...s,
        games: s.games.map(g => g.id === id ? { ...g, buyIns: [...newBuyIns, ...g.buyIns] } : g)
      }));
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
          <h2 style={{ color: 'var(--success)', margin: 0 }}>${totalPot.toFixed(2)}</h2>
        </div>
      </div>

      {isActive && (
        <>
          {/* Quick Add Player */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="input-field" style={{ flex: 1 }} onChange={e => handleAddPlayer(e.target.value)} value="">
                <option value="" disabled>+ Add Player to Session</option>
                {availableToAdd.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleAutoDetect} disabled={isDetecting}>
              <RefreshCw size={18} className={isDetecting ? 'pulse' : ''} />
              {isDetecting ? 'Scanning...' : 'Auto-Detect emails'}
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/cashout/${id}`)}>
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
                <div key={b.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: b.type === 'auto' ? '4px solid var(--accent-primary)' : '4px solid var(--border-light)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{p ? p.name : 'Unknown'}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(b.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {b.type === 'auto' ? 'Auto-detected' : 'Manual'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {editingBuyInId === b.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input 
                          type="number" 
                          className="input-field" 
                          style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '1rem', textAlign: 'right' }} 
                          value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)}
                          autoFocus
                        />
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
