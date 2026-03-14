import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { UserPlus, User, Mail, Trash2 } from 'lucide-react';

export default function Profiles() {
  const { state, actions } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      actions.addPlayer({ name: newName.trim(), email: newEmail.trim() });
      setNewName('');
      setNewEmail('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex-between">
        <h2>Players</h2>
        {!isAdding && (
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setIsAdding(true)}>
            <UserPlus size={18} />
            Add
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Player</h3>
          <form onSubmit={handleAddSubmit}>
            <div className="input-group">
              <label className="input-label">Name</label>
              <input 
                className="input-field" 
                placeholder="e.g. John Doe"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Interac Email</label>
              <input 
                type="email"
                className="input-field" 
                placeholder="john@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {state.players.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p>No players added yet.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add a player to map their e-transfers.</p>
          </div>
        ) : (
          state.players.map(player => (
            <div key={player.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <User size={16} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{player.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Mail size={14} />
                  <span>{player.email}</span>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => actions.deletePlayer(player.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
