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

  // --- GOOGLE AUTOCOMPLETE INITIALIZATION ---
  useEffect(() => {
    let autocomplete;

    if (view === 'tool' && inputRef.current && window.google) {
      console.log("Initializing Autocomplete on:", inputRef.current);
      
      autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"], componentRestrictions: { country: "us" } }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
      
      autoCompleteRef.current = autocomplete;
    }

    return () => {
      if (autocomplete && window.google) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [view]);

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
    } catch (error) {
      alert("Error: Backend is offline!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' }}>
      <style>{`
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .input-field { padding: 12px; width: 100%; border-radius: 6px; border: 2px solid #DCDFE6; box-sizing: border-box; margin-bottom: 15px; }
        .pac-container { z-index: 10000 !important; }
      `}</style>

      {/* Logic for View Rendering */}
      {view === 'landing' && (
        <div>Landing Page Placeholder - Click to start tool</div>
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