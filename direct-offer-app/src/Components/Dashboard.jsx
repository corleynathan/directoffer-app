import React from 'react';

function Dashboard({ listing, onViewChange }) {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Client Dashboard</h1>
      <button onClick={() => onViewChange('tool')}>Back to Tool</button>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h3>Saved Property</h3>
        <p>{listing ? listing.address : 'No listing saved yet.'}</p>
      </div>
    </div>
  );
}

export default Dashboard;