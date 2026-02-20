import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [view, setView] = useState('landing');
  const [address, setAddress] = useState("");
  const [homeValue, setHomeValue] = useState(500000);
  const [history, setHistory] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    buyerName: "", offerPrice: 500000, earnestMoney: 5000,
    financingType: "Conventional", closingDate: "", contingencies: ""
  });

  const inputRef = useRef(null);
  const API_URL = 'https://directoffer-backend.onrender.com';

  // --- PRICING TIERS ---
  const tiers = [
    { id: 'entry', title: 'The Entry', price: '$499', features: ['MLS Access', 'Digital Docs'] },
    { id: 'hybrid', title: 'The Hybrid', price: '$2,499', features: ['Photos', 'Yard Sign', 'Syndication'] },
    { id: 'full', title: 'Full Service', price: '1% + $1.5k', features: ['Advisor', 'Negotiation', 'Marketing'] }
  ];

  // --- GOOGLE AUTOCOMPLETE ---
  useEffect(() => {
    if (view === 'tool' && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ["address"] });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
      });
    }
  }, [view]);

  // --- DATA METHODS ---
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
    await fetch(`${API_URL}/list-property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, price: homeValue })
    });
    fetchHistory();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px' }}>
      <style>{`.pac-container { z-index: 10000 !important; }`}</style>

      {view === 'landing' && (
        <div style={{ textAlign: 'center' }}>
          <h1>DirectOffer</h1>
          <button onClick={() => setView('tool')}>Get Started</button>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
            {tiers.map(t => (
              <div key={t.id} style={{ border: '1px solid #ccc', padding: '15px' }}>
                <h3>{t.title}</h3>
                <p>{t.price}</p>
                <ul>{t.features.map(f => <li key={f}>{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'tool' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>List Your Property</h2>
          <input ref={inputRef} placeholder="Search address..." value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px' }} />
          <button onClick={handleListHome}>List My Home</button>
          
          <h3>Recent Listings</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '10px', margin: '5px 0', background: '#fff' }}>
              {h.address} - Savings: ${h.savings}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;