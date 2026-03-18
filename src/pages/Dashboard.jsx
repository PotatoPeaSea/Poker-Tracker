import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FolderPlus, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { state, actions } = useContext(AppContext);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const activeSessions = (state.sessions || []).filter(s => s.status === 'active');
  const pastSessions = (state.sessions || []).filter(s => s.status === 'closed');

  const handleCreateSession = (e) => {
    e.preventDefault();
    const newId = actions.createSession(sessionName.trim() || undefined);
    setSessionName('');
    setShowCreate(false);
    navigate(`/session/${newId}`);
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Active Sessions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>♠ Active Sessions</h3>
        
        {activeSessions.length > 0 ? (
          activeSessions.map(ses => (
            <div key={ses.id} className="glass-panel suit-watermark" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ses.name}</span>
                <span style={{ color: 'var(--success)', fontSize: '0.8125rem' }}>{ses.games.length} Games</span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Started {new Date(ses.date).toLocaleDateString()}
              </span>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/session/${ses.id}`)}>
                Open Session
              </button>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0.5rem 0' }}>No active sessions. Create one to start playing!</p>
          </div>
        )}

        {!showCreate ? (
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem' }} onClick={() => setShowCreate(true)}>
            <FolderPlus size={20} />
            Create New Session
          </button>
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                className="input-field"
                placeholder="Session name (e.g. Friday Night Poker)"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>♦ Past Sessions</h3>
        {pastSessions.length === 0 ? (
          <p style={{ color: 'var(--text-disabled)', textAlign: 'center', marginTop: '1rem' }}>No past sessions recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastSessions.slice(0, 10).map(ses => {
              const totalGames = ses.games.length;
              const totalPot = ses.games.reduce((sum, g) => sum + g.buyIns.reduce((s, b) => s + b.amount, 0), 0);
              return (
                <div key={ses.id} className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate(`/session/${ses.id}`)}>
                      <h4 style={{ margin: 0 }}>{ses.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8125rem' }}>{totalGames} Games • {new Date(ses.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gold-light)', fontFamily: 'var(--font-mono)' }}>
                        ${totalPot.toFixed(0)}
                      </span>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => { if (window.confirm(`Delete "${ses.name}"? This cannot be undone.`)) actions.deleteSession(ses.id); }} title="Delete Session">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
