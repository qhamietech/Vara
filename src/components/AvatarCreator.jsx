import React, { useState } from 'react';

// I'm defining a set of seeds that change the avatar's look instantly
const SKIN_TONES = ['fbd38d', 'e53e3e', '718096', '2d3748'];
const HAIR_STYLES = ['long', 'short', 'bob', 'curly', 'pixie'];

export default function AvatarCreator({ onSave }) {
  // I'm using local state to track the user's design choices
  const [skin, setSkin] = useState(SKIN_TONES[0]);
  const [hair, setHair] = useState(HAIR_STYLES[0]);

  // I'm constructing the DiceBear URL based on your choices [cite: 73]
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?backgroundColor=${skin}&top=${hair}`;

  return (
    <div className="avatar-card" style={{
      background: 'white',
      padding: '30px',
      borderRadius: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '350px'
    }}>
      <h3 style={{ color: '#2D3436', marginBottom: '20px' }}>Design Your Vara</h3>
      
      {/* PREVIEW: The Digital Twin [cite: 20] */}
      <div style={{
        width: '150px',
        height: '150px',
        margin: '0 auto 30px',
        background: '#F7F9FB',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid #4ECDC4'
      }}>
        <img src={avatarUrl} alt="Your Avatar" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* SKIN SELECTOR [cite: 53] */}
      <p style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#b2bec3', textAlign: 'left' }}>Skin Tone</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {SKIN_TONES.map(color => (
          <button 
            key={color}
            onClick={() => setSkin(color)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: `#${color}`,
              border: skin === color ? '3px solid #FF6B6B' : 'none',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      <button 
        onClick={() => onSave(avatarUrl)}
        style={{
          width: '100%',
          padding: '15px',
          background: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Save Identity
      </button>
    </div>
  );
}