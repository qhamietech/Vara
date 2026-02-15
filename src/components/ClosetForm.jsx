import React, { useState } from 'react';

export default function ClosetForm({ onAddItem }) {
  const [preview, setPreview] = useState(null);
  const [warmth, setWarmth] = useState(3);
  const [colorFamily, setColorFamily] = useState('Neutral');
  const [occasion, setOccasion] = useState('Casual');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preview) return alert("Please upload a photo!");

    onAddItem({
      id: Date.now(),
      image: preview,
      warmth: parseInt(warmth),
      colorFamily,
      occasion,
      isDirty: false // The "Life Sim" logic for laundry! 
    });
    
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ marginBottom: '15px', color: '#2D3436' }}>Add to Closet</h3>
      
      <div style={uploadBoxStyle}>
        {preview ? (
          <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <input type="file" onChange={handleFileChange} accept="image/*" />
        )}
      </div>

      <div style={tagRowStyle}>
        <label>Warmth: {warmth}</label>
        <input type="range" min="1" max="5" value={warmth} onChange={(e) => setWarmth(e.target.value)} />
      </div>

      <select value={colorFamily} onChange={(e) => setColorFamily(e.target.value)} style={selectStyle}>
        <option value="Neutral">Neutral (Black/White/Grey)</option>
        <option value="Warm">Warm (Red/Yellow/Orange)</option>
        <option value="Cool">Cool (Blue/Green/Purple)</option>
      </select>

      <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={selectStyle}>
        <option value="Casual">Casual</option>
        <option value="Professional">Professional</option>
        <option value="Formal">Formal</option>
        <option value="Active">Active</option>
      </select>

      <button type="submit" style={saveButtonStyle}>Add to Vara</button>
    </form>
  );
}

// Styling for the form
const formStyle = { background: 'white', padding: '20px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '300px', marginTop: '20px' };
const uploadBoxStyle = { height: '150px', border: '2px dashed #ddd', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' };
const tagRowStyle = { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' };
const selectStyle = { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '10px' };
const saveButtonStyle = { width: '100%', padding: '12px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };