import React, { useState, useEffect, useRef } from 'react'; // Added useRef

function App() {
  // --- NAVIGATION & TIER STATE ---
  const [view, setView] = useState('landing');
  const [selectedTier, setSelectedTier] = useState(null);

  // --- CORE TOOL STATE ---
  const [homeValue, setHomeValue] = useState(500000);
  const [address, setAddress] = useState("");
  const [listingResult, setListingResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- REFS FOR GOOGLE MAPS ---
  const inputRef = useRef(null);
  const autoCompleteRef = useRef(null);

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

  // --- PRICING TIER DEFINITIONS ---
  const tiers = [
    { 
      id: 'entry', title: 'The Entry', price: '$499', type: 'Flat Fee', 
      features: ['MLS Listing Access', 'DirectOffer Portal', 'Digital Document Storage'], 
      color: '#34495E', calc: () => 499 
    },
    { 
      id: 'hybrid', title: 'The Hybrid', price: '$2,499', type: 'Flat Fee', 
      features: ['Professional Photos', 'Yard Signage', 'MLS Syndication', 'Offer Management'], 
      color: '#27AE60', calc: () => 2499, popular: true 
    },
    { 
      id: 'full', title: 'Full Service', price: '1% + $1.5k', type: 'Hybrid', 
      features: ['Dedicated Advisor', 'Contract Negotiation', 'Premier Marketing', 'Pro Photos'], 
      color: '#2C3E50', calc: (val) => (val * 0.01) + 1500 
    }
  ];

  // --- GOOGLE AUTOCOMPLETE INITIALIZATION ---
  useEffect(() => {
    // Only run if we are in tool view and the input element exists
    if (view === 'tool' && inputRef.current && window.google) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"], componentRestrictions: { country: "us" } }
      );

      autoCompleteRef.current.addListener("place_changed", async () => {
        const place = await autoCompleteRef.current.getPlace();
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
    }
  }, [view, listingResult]); // Re-run if we reset or change views

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

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setView('tool');
    window.scrollTo(0,0);
  };

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
      // Address is cleared after submission to reset the form
      setAddress(""); 
      fetchHistory(); 
    } catch (error) {
      alert("Error: Backend is offline!");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' }}>
      
      <style>{`
        @media print { 
          .no-print { display: none !important; } 
          body { background-color: white !important; margin: 0 !important; padding: 0 !important; display: block !important; }
          #printable-area { 
            border: 2px solid #166534 !important; 
            padding: 30px !important; 
            width: 90% !important; 
            margin: 20px auto !important; 
            background-color: white !important; 
            display: block !important;
          }
          .pdf-only-header { display: block !important; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; }
          table { width: 100% !important; border-collapse: collapse !important; }
        }
        .tier-card:hover { transform: translateY(-5px); transition: 0.3s ease; }
        .pdf-only-header { display: none; }
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .input-field { padding: 12px; width: 100%; border-radius: 6px; border: 2px solid #DCDFE6; box-sizing: border-box; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #BBF7D0; color: #166534; }
        td { padding: 12px; border-bottom: 1px solid #BBF7D0; }
        .pac-container { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: none; font-family: sans-serif; }
      `}</style>

      {/* --- LANDING PAGE VIEW --- */}
      {view === 'landing' && (
        <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <header style={{ marginBottom: '50px' }}>
            <h1 style={{ fontSize: '3.5rem', color: '#2C3E50', marginBottom: '20px', fontWeight: 'bold' }}>
              Sell Your Home. <br/><span style={{color: '#27AE60'}}>Keep Your Equity.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#7F8C8D', maxWidth: '700px', margin: '0 auto' }}>
              Real estate commissions are broken. Choose a plan that fits your goals and stop paying 6% to sell your home.
            </p>
          </header>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center', marginBottom: '60px' }}>
            {tiers.map((t) => (
              <div key={t.id} className="tier-card" style={{ 
                backgroundColor: 'white', padding: '35px', borderRadius: '12px', width: '280px', 
                boxShadow: t.popular ? '0 15px 35px rgba(39,174,96,0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
                border: t.popular ? '2px solid #27AE60' : '1px solid #eee', position: 'relative',
                display: 'flex', flexDirection: 'column'
              }}>
                {t.popular && <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#27AE60', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>MOST POPULAR</div>}
                <h3 style={{ color: t.color, marginBottom: '10px', marginTop: 0 }}>{t.title}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>{t.price}</div>
                <div style={{ fontSize: '0.8rem', color: '#7F8C8D', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.type}</div>
                <ul style={{ textAlign: 'left', fontSize: '0.9rem', color: '#34495E', marginBottom: '30px', paddingLeft: '15px', flexGrow: 1 }}>
                  {t.features.map((f, i) => <li key={i} style={{ marginBottom: '10px' }}>{f}</li>)}
                </ul>
                <button onClick={() => handleTierSelect(t)} style={{ width: '100%', padding: '14px', backgroundColor: t.color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  Select {t.title}
                </button>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ opacity: 0.8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Verified Client Savings to Date</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#27AE60' }}>${totalLifetimeSavings.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* --- CORE TOOL VIEW --- */}
      {view === 'tool' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
          
          <header style={{ marginBottom: '30px', textAlign: 'center' }} className="no-print">
            <button onClick={() => setView('landing')} style={{ marginBottom: '15px', background: 'none', border: 'none', color: '#3498DB', cursor: 'pointer', fontWeight: 'bold' }}>← Switch Pricing Plan</button>
            <h1 style={{ color: '#2C3E50', fontSize: '2rem', marginBottom: '5px' }}>DirectOffer</h1>
            <p style={{ color: '#7F8C8D' }}>Analysis Mode: <strong>{selectedTier.title}</strong></p>
          </header>

          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' }}>
            
            {/* TOOL VIEW 1: THE INPUT FORM */}
            {!listingResult && (
              <div className="no-print">
                <h3 style={{ color: '#34495E', marginTop: 0 }}>Create New Listing</h3>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2C3E50' }}>Property Address</label>
                  <input 
                    type="text" 
                    ref={inputRef} // Bind the Google Ref here
                    className="input-focus input-field" 
                    placeholder="Search address..." 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontWeight: 'bold', color: '#2C3E50' }}>Estimated Value</label>
                    <span style={{ color: '#27AE60', fontWeight: 'bold', fontSize: '1.1rem' }}>${homeValue.toLocaleString()}</span>
                  </div>
                  <input type="range" min="100000" max="2000000" step="5000" value={homeValue} onChange={(e) => setHomeValue(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: selectedTier.color }} />
                </div>
                <button onClick={handleListHome} disabled={isLoading || !address.trim()} style={{ width: '100%', padding: '15px', backgroundColor: address.trim() ? selectedTier.color : '#BDC3C7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                  {isLoading ? "Saving..." : `Generate ${selectedTier.title} Comparison`}
                </button>
              </div>
            )}

            {/* TOOL VIEW 2: THE NET SHEET */}
            {listingResult && !showOfferForm && (
              <div id="printable-area">
                <div className="pdf-only-header">
                  <h1 style={{ color: '#2C3E50', margin: 0 }}>DirectOffer Report</h1>
                  <p style={{ color: '#7F8C8D' }}>Plan: {selectedTier.title} | Verified Savings Analysis</p>
                </div>

                <h3 style={{ color: '#166534', margin: '0 0 5px 0' }}>Seller Net Sheet Comparison</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#374151' }}>Property: <strong>{listingResult.address}</strong></p>
                
                {(() => {
                  const priceVal = cleanNum(listingResult.price);
                  const tradComm = priceVal * 0.06;
                  const doFee = selectedTier.calc(priceVal); 
                  const savingsVal = tradComm - doFee;

                  return (
                    <>
                      <table>
                        <thead>
                          <tr><th>Description</th><th>Traditional (6%)</th><th>DirectOffer ({selectedTier.title})</th></tr>
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

                <div className="no-print" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => window.print()} style={{ flex: 1, padding: '14px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      💾 Download PDF
                    </button>
                    <button onClick={() => setShowOfferForm(true)} style={{ flex: 1, padding: '14px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      📩 Submit Offer
                    </button>
                  </div>
                  <button onClick={() => setListingResult(null)} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#7F8C8D', border: '1px solid #DCDFE6', borderRadius: '6px', cursor: 'pointer' }}>
                    Reset Analysis
                  </button>
                </div>
              </div>
            )}

            {/* TOOL VIEW 3: OFFER FORM */}
            {listingResult && showOfferForm && (
              <div className="no-print">
                <h3 style={{ color: '#2C3E50', marginTop: 0 }}>Digital Offer Submission</h3>
                <p style={{ fontSize: '0.8rem', color: '#7F8C8D', marginBottom: '20px' }}>Submitting for: {listingResult.address}</p>
                <input type="text" className="input-field" placeholder="Buyer Full Name" onChange={(e) => setOfferData({...offerData, buyerName: e.target.value})} />
                <div style={{display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}><label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Offer Price</label><input type="number" className="input-field" value={offerData.offerPrice} onChange={(e) => setOfferData({...offerData, offerPrice: e.target.value})} /></div>
                  <div style={{flex:1}}><label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Earnest Money</label><input type="number" className="input-field" value={offerData.earnestMoney} onChange={(e) => setOfferData({...offerData, earnestMoney: e.target.value})} /></div>
                </div>
                <select className="input-field" onChange={(e) => setOfferData({...offerData, financingType: e.target.value})}>
                  <option value="Conventional">Conventional Financing</option>
                  <option value="Cash">Cash Offer</option>
                  <option value="FHA">FHA Financing</option>
                  <option value="VA">VA Financing</option>
                </select>
                <label style={{fontSize:'0.7rem', fontWeight:'bold'}}>Target Closing Date</label>
                <input type="date" className="input-field" onChange={(e) => setOfferData({...offerData, closingDate: e.target.value})} />
                <textarea className="input-field" placeholder="Contingencies..." onChange={(e) => setOfferData({...offerData, contingencies: e.target.value})} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSubmitOffer} style={{ flex: 1, padding: '12px', backgroundColor: '#2C3E50', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Offer</button>
                  <button onClick={() => setShowOfferForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#ECF0F1', color: '#7F8C8D', border: 'none', borderRadius: '6px' }}>Back</button>
                </div>
              </div>
            )}
          </div>

          {/* DASHBOARD & HISTORY */}
          <div style={{ marginTop: '40px', width: '100%', maxWidth: '600px' }} className="no-print">
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
                    {propertyOffers.length === 0 ? <p style={{fontSize:'0.7rem'}}>No offers yet.</p> : propertyOffers.map((o, i) => (
                      <div key={i} style={{fontSize:'0.8rem', backgroundColor:'#F8F9F9', padding:'8px', borderRadius:'4px', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
                        <span><strong>{o.buyerName}</strong>: ${cleanNum(o.offerPrice).toLocaleString()}</span>
                        <span style={{color:'#27AE60'}}>{o.status}</span>
                      </div>
                    ))}
                    <button onClick={() => setViewingOffersFor(null)} style={{fontSize:'0.7rem', color:'#3498DB', background:'none', border:'none', cursor:'pointer'}}>Close</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;