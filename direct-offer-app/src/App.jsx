import React, { useState, useEffect } from 'react';

function App() {
  const [homeValue, setHomeValue] = useState(500000);
  const [address, setAddress] = useState("");
  const [listingResult, setListingResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Your live Render URL
  const API_URL = 'https://directoffer-backend.onrender.com';

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/recent-listings`);
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Could not fetch history:", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (addressToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${addressToDelete}?`)) return;
    try {
      await fetch(`${API_URL}/delete-listing/${encodeURIComponent(addressToDelete)}`, {
        method: 'DELETE',
      });
      fetchHistory();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleListHome = async () => {
    if (!address.trim()) {
      alert("Please enter a valid property address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/list-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address, price: homeValue })
      });
      const data = await response.json();
      setListingResult(data);
      setAddress(""); 
      fetchHistory(); 
    } catch (error) {
      alert("Error: Backend is offline!");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW FEATURE: Calculate Lifetime Savings from history array
  const totalLifetimeSavings = history.reduce((sum, item) => sum + (item.savings || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
      
      <style>{`
        @media print { .no-print { display: none !important; } #printable-area { border: none !important; } }
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .btn-active:active { transform: scale(0.98); }
      `}</style>

      <header style={{ marginBottom: '40px', textAlign: 'center' }} className="no-print">
        <h1 style={{ color: '#2C3E50', fontSize: '2.5rem', marginBottom: '10px' }}>DirectOffer</h1>
        <p style={{ color: '#7F8C8D' }}>Professional Home Valuation & Savings Tracker</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' }}>
        <div className="no-print">
          <h3 style={{ color: '#34495E', marginTop: 0 }}>Create New Listing</h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2C3E50' }}>Property Address</label>
            <input 
              type="text" 
              className="input-focus"
              placeholder="e.g. 742 Evergreen Terrace" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              style={{ padding: '12px', width: '100%', borderRadius: '6px', border: '2px solid #DCDFE6', boxSizing: 'border-box', transition: 'all 0.3s' }} 
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 'bold', color: '#2C3E50' }}>Estimated Value</label>
              <span style={{ color: '#27AE60', fontWeight: 'bold', fontSize: '1.1rem' }}>${homeValue.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="100000" 
              max="2000000" 
              step="5000" 
              value={homeValue} 
              onChange={(e) => setHomeValue(Number(e.target.value))} 
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2C3E50' }} 
            />
          </div>

          <button 
            onClick={handleListHome} 
            disabled={isLoading || !address.trim()}
            className="btn-active"
            style={{ 
              width: '100%', 
              padding: '15px', 
              backgroundColor: address.trim() ? '#2C3E50' : '#BDC3C7', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: address.trim() ? 'pointer' : 'not-allowed', 
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'background-color 0.3s'
            }}
          >
            {isLoading ? "Saving to Database..." : "Save & Calculate Savings"}
          </button>
        </div>

        {listingResult && (
          <div id="printable-area" style={{ marginTop: '25px', padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <h4 style={{ color: '#166534', margin: '0 0 15px 0' }}>✅ Success! Listing Created</h4>
            <div style={{ fontSize: '0.9rem', color: '#1F2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Standard 6% Commission:</span>
                <span style={{ color: '#991B1B' }}>${listingResult.standard_comm}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>DirectOffer 3% Fee:</span>
                <span style={{ color: '#166534' }}>-${listingResult.direct_offer_fee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #BBF7D0', paddingTop: '10px' }}>
                <span>Total Savings:</span>
                <span style={{ color: '#166534' }}>${listingResult.savings}</span>
              </div>
            </div>
            <button className="no-print" onClick={() => window.print()} style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📄 Export PDF Report</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', width: '100%', maxWidth: '500px' }} className="no-print">
        {/* NEW FEATURE: Lifetime Savings Dashboard Card */}
        <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Client Savings to Date</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#27AE60' }}>
            ${totalLifetimeSavings.toLocaleString()}
          </div>
        </div>

        <h4 style={{ color: '#2C3E50', borderBottom: '2px solid #DCDFE6', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          Recent Activity <span>({history?.length || 0})</span>
        </h4>
        
        {(!history || history.length === 0) ? (
          <p style={{ color: '#BDC3C7', textAlign: 'center', marginTop: '20px' }}>Your database is currently empty.</p>
        ) : (
          history.map((item, index) => (
            <div key={index} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#34495E' }}>{item.address}</div>
                <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>Value: ${item.price?.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ color: '#27AE60', fontWeight: 'bold' }}>+${item.savings?.toLocaleString()}</div>
                <button onClick={() => handleDelete(item.address)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#E74C3C' }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;