import React, { useState, useEffect } from 'react';

function App() {
  const [homeValue, setHomeValue] = useState(500000);
  const [address, setAddress] = useState("");
  const [listingResult, setListingResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- OFFER STATE ---
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [viewingOffersFor, setViewingOffersFor] = useState(null);
  const [propertyOffers, setPropertyOffers] = useState([]);
  const [offerData, setOfferData] = useState({
    buyerName: "",
    offerPrice: 500000,
    earnestMoney: 5000,
    financingType: "Conventional",
    closingDate: "",
    contingencies: ""
  });

  const API_URL = 'https://directoffer-backend.onrender.com';

  const cleanNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const cleaned = val.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
  };

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

  useEffect(() => { fetchHistory(); }, []);

  // --- FETCH OFFERS ---
  const fetchOffers = async (addr) => {
    try {
      const response = await fetch(`${API_URL}/offers/${encodeURIComponent(addr)}`);
      const data = await response.json();
      setPropertyOffers(data);
      setViewingOffersFor(addr);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

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
      setOfferData({ ...offerData, offerPrice: homeValue });
      setAddress(""); 
      fetchHistory(); 
    } catch (error) {
      alert("Error: Backend is offline!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUBMIT OFFER ---
  const handleSubmitOffer = async () => {
    if (!offerData.buyerName) { alert("Please enter a Buyer Name."); return; }
    try {
      const response = await fetch(`${API_URL}/submit-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offerData,
          listingAddress: listingResult.address
        })
      });
      if (response.ok) {
        alert("Success! Your offer has been submitted.");
        setShowOfferForm(false);
      }
    } catch (error) {
      alert("Error submitting offer.");
    }
  };

  const totalLifetimeSavings = history.reduce((sum, item) => sum + cleanNum(item.savings), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
      
      <style>{`
        @media print { 
          .no-print { display: none !important; } 
          #printable-area { border: 2px solid #166534 !important; padding: 40px !important; width: 100% !important; background-color: white !important; }
          body { background-color: white !important; }
          .pdf-only-header { display: block !important; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        }
        .pdf-only-header { display: none; }
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .input-field { padding: 12px; width: 100%; borderRadius: 6px; border: 2px solid #DCDFE6; boxSizing: border-box; marginBottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #BBF7D0; color: #166534; }
        td { padding: 12px; border-bottom: 1px solid #BBF7D0; }
      `}</style>

      <header style={{ marginBottom: '40px', textAlign: 'center' }} className="no-print">
        <h1 style={{ color: '#2C3E50', fontSize: '2.5rem', marginBottom: '10px' }}>DirectOffer</h1>
        <p style={{ color: '#7F8C8D' }}>Professional Home Valuation & Savings Tracker</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' }}>
        
        {/* VIEW 1: THE INPUT FORM */}
        {!listingResult && (
          <div className="no-print">
            <h3 style={{ color: '#34495E', marginTop: 0 }}>Create New Listing</h3>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2C3E50' }}>Property Address</label>
              <input type="text" className="input-focus input-field" placeholder="e.g. 123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} style={{marginBottom: 0}} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold', color: '#2C3E50' }}>Estimated Value</label>
                <span style={{ color: '#27AE60', fontWeight: 'bold', fontSize: '1.1rem' }}>${homeValue.toLocaleString()}</span>
              </div>
              <input type="range" min="100000" max="2000000" step="5000" value={homeValue} onChange={(e) => setHomeValue(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#2C3E50' }} />
            </div>
            <button onClick={handleListHome} disabled={isLoading || !address.trim()} style={{ width: '100%', padding: '15px', backgroundColor: address.trim() ? '#2C3E50' : '#BDC3C7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              {isLoading ? "Saving..." : "Generate Comparison"}
            </button>
          </div>
        )}

        {/* VIEW 2: THE NET SHEET & OFFER FORM TRIGGER */}
        {listingResult && !showOfferForm && (
          <div id="printable-area">
            {/* PDF ONLY HEADER */}
            <div className="pdf-only-header">
              <h1 style={{ color: '#2C3E50', margin: 0 }}>DirectOffer Report</h1>
              <p style={{ color: '#7F8C8D' }}>Verified Savings & Equity Analysis</p>
            </div>

            <h3 style={{ color: '#166534', margin: '0 0 5px 0' }}>Seller Net Sheet Comparison</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#374151' }}>Property: <strong>{listingResult.address}</strong></p>
            
            {(() => {
              const priceVal = cleanNum(listingResult.price);
              const tradComm = priceVal * 0.06;
              const doFee = priceVal * 0.03;
              const savingsVal = tradComm - doFee;

              return (
                <>
                  <table>
                    <thead>
                      <tr><th>Description</th><th>Traditional (6%)</th><th>DirectOffer (3%)</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Sale Price</td>
                        <td>${priceVal.toLocaleString()}</td>
                        <td>${priceVal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Brokerage Fee</td>
                        <td style={{ color: '#991B1B' }}>-${tradComm.toLocaleString()}</td>
                        <td style={{ color: '#166534', fontWeight: 'bold' }}>-${doFee.toLocaleString()}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#DCFCE7', fontWeight: 'bold' }}>
                        <td>ESTIMATED NET</td>
                        <td>${(priceVal - tradComm).toLocaleString()}</td>
                        <td style={{ color: '#15803D' }}>${(priceVal - doFee).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#15803D', color: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>Additional Equity Gained:</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${savingsVal.toLocaleString()}</div>
                  </div>
                </>
              );
            })()}

            <div className="no-print" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Download PDF</button>
              <button onClick={() => setShowOfferForm(true)} style={{ flex: 1.5, padding: '12px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📩 Submit Digital Offer</button>
              <button onClick={() => setListingResult(null)} style={{ width: '100%', padding: '12px', backgroundColor: '#ECF0F1', color: '#7F8C8D', border: 'none', borderRadius: '6px' }}>Reset</button>
            </div>
          </div>
        )}

        {/* VIEW 3: THE DIGITAL OFFER FORM */}
        {listingResult && showOfferForm && (
          <div className="no-print">
            <h3 style={{ color: '#2C3E50', marginTop: 0 }}>Digital Offer Submission</h3>
            <p style={{ fontSize: '0.8rem', color: '#7F8C8D', marginBottom: '20px' }}>Submitting for: {listingResult.address}</p>
            
            <input type="text" className="input-field" placeholder="Buyer Full Name" onChange={(e) => setOfferData({...offerData, buyerName: e.target.value})} />
            <div style={{display:'flex', gap:'10px'}}>
              <div style={{flex:1}}>
                <label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Offer Price</label>
                <input type="number" className="input-field" value={offerData.offerPrice} onChange={(e) => setOfferData({...offerData, offerPrice: e.target.value})} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Earnest Money</label>
                <input type="number" className="input-field" value={offerData.earnestMoney} onChange={(e) => setOfferData({...offerData, earnestMoney: e.target.value})} />
              </div>
            </div>
            <select className="input-field" onChange={(e) => setOfferData({...offerData, financingType: e.target.value})}>
              <option value="Conventional">Conventional Financing</option>
              <option value="Cash">Cash Offer</option>
              <option value="FHA">FHA Financing</option>
              <option value="VA">VA Financing</option>
            </select>
            <label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Target Closing Date</label>
            <input type="date" className="input-field" onChange={(e) => setOfferData({...offerData, closingDate: e.target.value})} />
            <textarea className="input-field" placeholder="Contingencies (e.g., Inspection, Appraisal)" onChange={(e) => setOfferData({...offerData, contingencies: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmitOffer} style={{ flex: 1, padding: '12px', backgroundColor: '#2C3E50', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Offer</button>
              <button onClick={() => setShowOfferForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#ECF0F1', color: '#7F8C8D', border: 'none', borderRadius: '6px' }}>Back to Net Sheet</button>
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD & HISTORY */}
      <div style={{ marginTop: '40px', width: '100%', maxWidth: '600px' }} className="no-print">
        <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '5px', textTransform: 'uppercase' }}>Total Client Savings to Date</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#27AE60' }}>${totalLifetimeSavings.toLocaleString()}</div>
        </div>

        <h4 style={{ color: '#2C3E50', borderBottom: '2px solid #DCDFE6', paddingBottom: '10px' }}>Active Listings</h4>
        
        {history.map((item, index) => (
          <div key={index} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#34495E' }}>{item.address}</div>
                <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>Value: ${cleanNum(item.price).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => fetchOffers(item.address)} style={{ fontSize: '0.7rem', padding: '5px 10px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Offers</button>
                <button onClick={() => handleDelete(item.address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }}>🗑️</button>
              </div>
            </div>
            
            {viewingOffersFor === item.address && (
              <div style={{marginTop:'15px', paddingTop:'10px', borderTop:'1px dashed #DCDFE6'}}>
                <div style={{fontSize:'0.8rem', fontWeight:'bold', marginBottom:'10px'}}>Incoming Offers:</div>
                {propertyOffers.length === 0 ? <p style={{fontSize:'0.7rem', color:'#95a5a6'}}>No offers yet.</p> : (
                  propertyOffers.map((o, i) => (
                    <div key={i} style={{fontSize:'0.8rem', backgroundColor:'#F8F9F9', padding:'8px', borderRadius:'4px', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
                      <span><strong>{o.buyerName}</strong>: ${cleanNum(o.offerPrice).toLocaleString()} ({o.financingType})</span>
                      <span style={{color:'#27AE60', fontWeight:'bold'}}>{o.status}</span>
                    </div>
                  ))
                )}
                <button onClick={() => setViewingOffersFor(null)} style={{fontSize:'0.7rem', color:'#3498DB', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:'5px'}}>Close</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;