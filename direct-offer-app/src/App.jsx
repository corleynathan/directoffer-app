import React, { useState, useEffect, useRef } from 'react';

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

  const tiers = [
    { id: 'entry', title: 'The Entry', price: '$499', type: 'Flat Fee', features: ['MLS Listing Access', 'DirectOffer Portal', 'Digital Document Storage'], color: '#34495E', calc: () => 499 },
    { id: 'hybrid', title: 'The Hybrid', price: '$2,499', type: 'Flat Fee', features: ['Professional Photos', 'Yard Signage', 'MLS Syndication', 'Offer Management'], color: '#27AE60', calc: () => 2499, popular: true },
    { id: 'full', title: 'Full Service', price: '1% + $1.5k', type: 'Hybrid', features: ['Dedicated Advisor', 'Contract Negotiation', 'Premier Marketing', 'Pro Photos'], color: '#2C3E50', calc: (val) => (val * 0.01) + 1500 }
  ];

  useEffect(() => {
    let autocomplete;
    if (view === 'tool' && inputRef.current && window.google) {
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ["address"], componentRestrictions: { country: "us" } });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
      });
      autoCompleteRef.current = autocomplete;
    }
    return () => { if (autocomplete && window.google) window.google.maps.event.clearInstanceListeners(autocomplete); };
  }, [view]);

  const cleanNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) || 0;
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/recent-listings`);
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) { setHistory([]); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleListHome = async () => {
    if (!address.trim()) return alert("Please enter an address.");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/list-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, price: homeValue })
      });
      const data = await response.json();
      setListingResult(data);
      setAddress("");
      fetchHistory();
    } catch (error) { alert("Backend is offline!"); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' }}>
      <style>{`
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .input-field { padding: 12px; width: 100%; border-radius: 6px; border: 2px solid #DCDFE6; box-sizing: border-box; margin-bottom: 15px; }
        .pac-container { z-index: 10000 !important; }
      `}</style>

      {view === 'landing' && (
        <div style={{ padding: '20px' }}><h1>Welcome to DirectOffer</h1></div>
      )}
      
      {view === 'tool' && (
        <div style={{ padding: '50px 20px', maxWidth: '600px', margin: '0 auto' }}>
          <input 
            type="text" 
            ref={inputRef} 
            className="input-focus input-field" 
            placeholder="Search address..." 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
          />
          <button onClick={handleListHome}>List My Home</button>
        </div>
      )}
    </div>
  );
}

export default App;