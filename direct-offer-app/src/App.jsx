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

    // Cleanup to prevent memory leaks or duplicate listeners
    return () => {
      if (autocomplete && window.google) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [view]);

  // --- DATA FETCHING & HELPERS ---
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
        .input-focus:focus { border-color: #3498DB !important; outline: none; box-shadow: 0 0 5px rgba(52,152,219,0.3); }
        .input-field { padding: 12px; width: 100%; border-radius: 6px; border: 2px solid #DCDFE6; box-sizing: border-box; margin-bottom: 15px; }
        .pac-container { z-index: 10000 !important; }
      `}</style>

      {/* Logic for View Rendering remains unchanged */}
      {view === 'landing' && ( /* Landing Page Content */ )}
      {view === 'tool' && (
        <div style={{ padding: '50px 20px', maxWidth: '600px', margin: '0 auto' }}>
          {/* ... */}
          <input 
            type="text" 
            ref={inputRef} 
            className="input-focus input-field" 
            placeholder="Search address..." 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
          />
          {/* ... */}
        </div>
      )}
    </div>
  );
}

export default App;