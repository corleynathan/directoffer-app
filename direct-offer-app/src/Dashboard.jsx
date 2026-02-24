import React from 'react';

// StatsSummary component included within for simplicity during development
const StatsSummary = ({ listing }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>List Price</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          ${listing ? Number(listing.price).toLocaleString() : '0'}
        </div>
      </div>
      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Est. Savings</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27AE60' }}>$12,500</div>
      </div>
      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Status</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Active</div>
      </div>
    </div>
  );
};

function Dashboard({ listing, onViewChange }) {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => onViewChange('tool')} 
        style={{ background: 'none', border: 'none', color: '#3498DB', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
      >
        ← Return to Analysis Tool
      </button>

      <h1 style={{ color: '#2C3E50', marginBottom: '30px' }}>Property Dashboard</h1>
      
      {/* Stats Section */}
      <StatsSummary listing={listing} />

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Document Section */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Document Vault</h3>
          <p style={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Securely manage your listing documents here.</p>
          <div style={{ height: '100px', border: '2px dashed #DCDFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95A5A6', borderRadius: '8px' }}>
            Drag & Drop Files Here
          </div>
        </div>

        {/* Property Info Section */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Property Info</h3>
          <div style={{ fontSize: '0.9rem', color: '#34495E' }}>
            <p><strong>Address:</strong><br/>{listing ? listing.address : 'N/A'}</p>
            <p><strong>Plan Selected:</strong><br/>Hybrid Service</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;