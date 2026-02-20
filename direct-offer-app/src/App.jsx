import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [view, setView] = useState('landing');
  const [address, setAddress] = useState("");
  const [homeValue, setHomeValue] = useState(500000);
  const [listingResult, setListingResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [propertyOffers, setPropertyOffers] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    buyerName: "", offerPrice: 500000, earnestMoney: 5000,
    financingType: "Conventional", closingDate: "", contingencies: ""
  });

  const inputRef = useRef(null);
  const API_URL = 'https://directoffer-backend.onrender.com';

  const tiers = [
    { id: 'entry', title: 'The Entry', price: '$499', type: 'Flat Fee', features: ['MLS Access', 'Digital Docs'], color: '#34495E' },
    { id: 'hybrid', title: 'The Hybrid', price: '$2,499', type: 'Flat Fee', features: ['Photos', 'Yard Sign', 'Syndication'], color: '#27AE60' },
    { id: 'full', title: 'Full Service', price: '1% + $1.5k', type: 'Hybrid', features: ['Advisor', 'Negotiation', 'Marketing'], color: '#2C3E50' }
  ];

  // Google Maps Autocomplete
  useEffect(() => {
    if (view === 'tool' && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { 
        types: ["address"], componentRestrictions: { country: "us" } 
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
      });
    }
  }, [view]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/recent-listings`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleListHome = async () => {
    if (!address.trim()) return alert("Enter an address");
    const res = await fetch(`${API_URL}/list-property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, price: homeValue })
    });
    const data = await res.json();
    setListingResult(data);
    fetchHistory();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif', padding: '20px' }}>
      <style>{`
        .input-focus:focus { border-color: #3498DB !important; outline: none; }
        .input-field { padding: 12px; width: 100%; border-radius: 6px; border: 2px solid #DCDFE6; margin-bottom: 15px; }
        .pac-container { z-index: 10000 !important; }
      `}</style>

      {view === 'landing' && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Welcome to DirectOffer</h1>
          <button onClick={() => setView('tool')} style={{ padding: '15px 30px', fontSize: '18px' }}>Get Started</button>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
            {tiers.map(t => (
              <div key={t.id} style={{ border: `2px solid ${t.color}`, padding: '20px', borderRadius: '10px' }}>
                <h3>{t.title}</h3>
                <p><strong>{t.price}</strong></p>
                <ul>{t.features.map(f => <li key={f}>{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'tool' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Property Listing Tool</h2>
          <input ref={inputRef} className="input-field" placeholder="Search address..." value={address} onChange={(e) => setAddress(e.target.value)} />
          <button onClick={handleListHome} style={{ width: '100%', padding: '15px', background: '#3498DB', color: '#fff', border: 'none', borderRadius: '5px' }}>List My Home</button>
          
          <h3>Recent Activity</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '15px', background: '#fff', margin: '10px 0', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <strong>{h.address}</strong> - Savings: ${h.savings}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;