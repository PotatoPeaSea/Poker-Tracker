import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { state, actions } = useContext(AppContext);
  const navigate = useNavigate();

  const activeGames = state.games.filter(g => g.status === 'active');
  const pastGames = state.games.filter(g => g.status === 'closed');

  const handleStartSession = () => {
    actions.startGame([]); 
    navigate('/game/' + (state.games.length > 0 ? Date.now().toString() : 'new')); 
  };

  const handleGoToActive = (id) => {
    navigate(`/game/${id}`);
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Active Game Banners */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Active Sessions</h3>
        </div>
        
        {activeGames.length > 0 ? (
          activeGames.map(game => (
            <div key={game.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Session {new Date(game.date).toLocaleDateString()}</span>
                <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>{game.players.length} Players</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleGoToActive(game.id)}>
                Go to Game
              </button>
            </div>
          ))
        ) : (
          <div className="glass-panel pulse" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0.5rem 0 1rem' }}>No active games running.</p>
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleStartSession}>
          <Play size={20} />
          Start New Session
        </button>
      </div>

      {/* Recent History */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Sessions</h3>
        {pastGames.length === 0 ? (
          <p style={{ color: 'var(--text-disabled)', textAlign: 'center', marginTop: '2rem' }}>No past games recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastGames.slice(0, 5).map(game => {
              const totalPot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);
              return (
                <div key={game.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Session {new Date(game.date).toLocaleDateString()}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{game.players.length} Players</p>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                    Total Pot: ${totalPot}
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
