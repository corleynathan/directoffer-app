import React from 'react';

const Dashboard = ({ listing, onViewChange }) => {
  // Mock status: logic will connect to backend later
  const status = "Active"; 

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header with quick navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>My Dashboard</h2>
        <button onClick={() => onViewChange('tool')} style={{ padding: '8px 12px' }}>Back to Tool</button>
      </div>

      {/* Status Card */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0 }}>{listing.address}</h4>
            <span style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>Listed on Feb 20, 2026</span>
          </div>
          <span style={{ background: '#DCFCE7', color: '#166534', padding: '5px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {status}
          </span>
        </div>
      </div>

      {/* Grid for Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <DashboardCard icon="📩" label="Offers (2)" />
        <DashboardCard icon="📄" label="Documents" />
        <DashboardCard icon="📈" label="Analytics" />
        <DashboardCard icon="⚙️" label="Settings" />
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, label }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
    <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{icon}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{label}</div>
  </div>
);

export default Dashboard;