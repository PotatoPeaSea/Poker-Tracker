import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { UserPlus, User, Mail, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Profiles() {
  const { state, actions } = useContext(AppContext);
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      actions.addPlayer({ name: newName.trim(), email: newEmail.trim() });
      setNewName('');
      setNewEmail('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditEmail(player.email || '');
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    actions.updatePlayer(editingId, { name: editName.trim(), email: editEmail.trim() });
    setEditingId(null);
    setEditName('');
    setEditEmail('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex-between">
        <h2>♥ Players</h2>
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
              <input className="input-field" placeholder="e.g. John Doe" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Interac Email (optional)</label>
              <input type="email" className="input-field" placeholder="john@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
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
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add a player to get started.</p>
          </div>
        ) : (
          state.players.map(player => (
            <div key={player.id} className="glass-panel" style={{ padding: '1.25rem' }}>
              {editingId === player.id ? (
                /* Editing Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input className="input-field" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" autoFocus />
                  <input className="input-field" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="E-transfer Email (optional)" />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleCancelEdit}><X size={16} /> Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit}><Check size={16} /> Save</button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate(`/player/${player.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <User size={16} color="var(--gold)" />
                      <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{player.name}</span>
                    </div>
                    {player.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Mail size={14} />
                        <span>{player.email}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--gold)' }} onClick={() => handleStartEdit(player)} title="Edit Player">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => actions.deletePlayer(player.id)} title="Delete Player">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
