import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { GoogleLogin, useGoogleLogin, googleLogout } from '@react-oauth/google';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { state, setState } = useContext(AppContext);
  const { chipValues } = state;

  // We save the Google OAuth access token into Context to use for fetching emails later
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Login Success:', codeResponse);
      setState(s => ({ ...s, hostToken: codeResponse.access_token }));
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });

  const handleLogout = () => {
    googleLogout();
    setState(s => {
      const { hostToken, ...rest } = s;
      return rest;
    });
  };

  const handleChipChange = (color, value) => {
    setState(s => ({
      ...s,
      chipValues: {
        ...s.chipValues,
        [color]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Auth Section */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Host Integration</h2>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {state.hostToken ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <span style={{ fontWeight: 600 }}>Gmail API Connected</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>Auto-detection of incoming e-Transfers is active.</p>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: '0.5rem' }}>
                <LogOut size={16} /> Disconnect
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
              <p>Connect your Google account to auto-detect incoming e-transfers via your email receipts.</p>
              <button className="btn btn-primary" onClick={() => login()}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px' }} />
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chips Configuration Section */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Chip Denominations</h2>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(chipValues).map(([color, val]) => (
            <div key={color} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  background: `var(--chip-${color})`,
                  border: color === 'white' ? '1px solid #ddd' : color === 'black' ? '1px solid #444' : 'none',
                  boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
                }}></div>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{color}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>$</span>
                <input 
                  type="number" 
                  className="input-field" 
                  style={{ width: '80px', padding: '0.5rem', textAlign: 'right' }}
                  value={val}
                  onChange={(e) => handleChipChange(color, e.target.value)}
                  step="0.25"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
