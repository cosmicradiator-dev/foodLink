import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function CreateListing() {
  const {
    listings,
    addListing,
    fastForwardHours,
    resetDemoData,
    verifyPickupCode,
    currentUser,
  } = useFoodLink();

  const myListings = listings.filter(
    (l) => !currentUser || l.donor_id === currentUser?.id
  );

  const totalMeals = myListings.reduce((s, l) => s + (l.servings || 0), 0);
  const kgDiverted = (totalMeals * 0.35).toFixed(1);

  const [donorName, setDonorName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [servings, setServings] = useState('50');
  const [pickupLocation, setPickupLocation] = useState('Hostel Mess');
  const [customLocation, setCustomLocation] = useState('');
  const [foodCategory, setFoodCategory] = useState('veg');
  const [foodNature, setFoodNature] = useState('cooked');
  const [preparedAt, setPreparedAt] = useState('13:39');
  const [expiresAt, setExpiresAt] = useState('16:39');
  const [photoName, setPhotoName] = useState('');
  const [selectedListingForVerify, setSelectedListingForVerify] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Pre-fill from currentUser
  useEffect(() => {
    if (currentUser?.org) {
      setDonorName(currentUser.org);
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodType.trim()) {
      toast.error('Please enter food type / dish name.');
      return;
    }

    const newListing = addListing({
      food_type: foodType,
      donor_name: donorName || currentUser?.org || 'Hostel Mess',
      servings: Number(servings) || 10,
      veg_flag: foodCategory === 'veg',
      food_nature: foodNature,
      prepared_at: preparedAt,
      expires_at: expiresAt,
      location_name: pickupLocation === 'Other' ? customLocation : pickupLocation,
    });

    toast.success(`"${newListing.food_type}" posted successfully! 🎉`);
    setFoodType('');
  };

  const handleVerifyCodeSubmit = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setVerifyMessage({ type: 'error', text: 'Please enter the 4-digit code.' });
      return;
    }
    const targetListingId = selectedListingForVerify || listings.find((l) => l.status === 'claimed')?._id;
    if (!targetListingId) {
      setVerifyMessage({ type: 'error', text: 'No claimed listing found to verify.' });
      return;
    }
    try {
      verifyPickupCode(targetListingId, verificationCode);
      setVerifyMessage({ type: 'success', text: '✅ Pickup confirmed! Impact dashboard updated live.' });
      setVerificationCode('');
      toast.success('Pickup verified and recorded successfully!');
    } catch (err) {
      setVerifyMessage({ type: 'error', text: err.message });
      toast.error(err.message);
    }
  };

  const formatHoursLeft = (hours) => {
    if (hours <= 0) return 'Expired';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m left`;
  };

  const getUrgencyColor = (hours) => {
    if (hours <= 0) return { bg: '#fee2e2', color: '#b91c1c' };
    if (hours < 1) return { bg: '#fef3c7', color: '#b45309' };
    return { bg: '#dcfce7', color: '#15803d' };
  };

  const claimedListings = myListings.filter((l) => l.status === 'claimed');

  return (
    <Layout>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        .listing-row:hover { background-color: #f8fafc; }
        .form-input:focus { border-color: #166534 !important; box-shadow: 0 0 0 3px rgba(22,101,52,0.1) !important; outline: none !important; }
        .post-btn:hover { background: linear-gradient(135deg, #14532d, #15803d) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,101,52,0.3); }
        .verify-btn:hover { background-color: #14532d !important; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* Donor Stats Strip */}
        {currentUser && (
          <div
            style={{
              background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
              borderRadius: '16px',
              padding: '1.25rem 1.75rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                {currentUser.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>{currentUser.org}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { label: 'Total Meals Listed', value: totalMeals, icon: '🍱' },
                { label: 'Food Diverted', value: `${kgDiverted} kg`, icon: '♻️' },
                { label: 'Trust Score', value: `${currentUser.trustScore}/100 ⭐`, icon: '🏆' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          Add Surplus Food
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Expiry and prepared time are mandatory – they are always shown to recipients.
        </p>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '1.75rem', alignItems: 'start' }}>

          {/* Left: Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📝 New Listing
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Donor name
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Hostel Mess D"
                  required
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                    transition: 'all 0.15s', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Food type / dish name
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  placeholder="e.g. Veg meals – rice, sambar"
                  required
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                    transition: 'all 0.15s', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Servings (meals)
                  </label>
                  <input
                    className="form-input"
                    type="number" min="1"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                      transition: 'all 0.15s', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Pickup location
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                      backgroundColor: '#ffffff', boxSizing: 'border-box',
                    }}
                  >
                    <option value="Hostel Mess">Hostel Mess</option>
                    <option value="Main Canteen">Main Canteen</option>
                    <option value="Fest Committee">Fest Committee</option>
                    <option value="Department Event">Department Event</option>
                    <option value="Other">Other Location</option>
                  </select>
                </div>
              </div>

              {pickupLocation === 'Other' && (
                <input
                  className="form-input"
                  type="text" value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter landmark or mess gate" required
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box',
                  }}
                />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    Food category
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['veg', 'non-veg'].map((cat) => (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" name="foodCategory" value={cat} checked={foodCategory === cat}
                          onChange={() => setFoodCategory(cat)} style={{ accentColor: '#166534' }} />
                        {cat === 'veg' ? '🌱 Veg' : '🍗 Non-veg'}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    Type
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {[{ id: 'cooked', label: '🍳 Cooked' }, { id: 'packaged', label: '📦 Packaged' }].map((n) => (
                      <label key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" name="foodNature" value={n.id} checked={foodNature === n.id}
                          onChange={() => setFoodNature(n.id)} style={{ accentColor: '#166534' }} />
                        {n.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    🕐 Prepared at
                  </label>
                  <input className="form-input" type="time" value={preparedAt} onChange={(e) => setPreparedAt(e.target.value)} required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    ⏰ Expires at
                  </label>
                  <input className="form-input" type="time" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  📷 Photo (optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{
                    display: 'inline-block', padding: '0.45rem 0.85rem',
                    backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
                    borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer',
                  }}>
                    Choose File
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => setPhotoName(e.target.files[0]?.name || '')} />
                  </label>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{photoName || 'No file chosen'}</span>
                </div>
              </div>

              <button
                className="post-btn"
                type="submit"
                style={{
                  width: '100%', padding: '0.8rem',
                  background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
                  color: '#ffffff', border: 'none', borderRadius: '10px',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                  marginTop: '0.25rem', transition: 'all 0.15s ease',
                  letterSpacing: '0.01em',
                }}
              >
                🚀 Post Listing
              </button>
            </form>
          </div>

          {/* Right: My Listings + Verify + Demo Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* My Listings Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  📋 My Listings
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {myListings.length} total
                </span>
              </div>

              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr',
                fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8',
                letterSpacing: '0.05em', marginBottom: '0.75rem',
                paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9',
              }}>
                <span>FOOD</span>
                <span style={{ textAlign: 'center' }}>MEALS</span>
                <span style={{ textAlign: 'right' }}>STATUS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '320px', overflowY: 'auto' }}>
                {myListings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.9rem' }}>
                    No listings yet. Post your first surplus food above! 🍱
                  </div>
                ) : (
                  myListings.map((item) => {
                    const urgency = getUrgencyColor(item.expiryHoursLeft);
                    return (
                      <div
                        key={item._id}
                        className="listing-row"
                        style={{
                          display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr',
                          alignItems: 'center', padding: '0.6rem 0.5rem',
                          borderRadius: '8px', transition: 'background-color 0.15s',
                          cursor: 'default',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {item.veg_flag ? '🌱' : '🍗'} {item.food_type}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              style={{
                                display: 'inline-block', width: '6px', height: '6px',
                                borderRadius: '50%', backgroundColor: urgency.color,
                                animation: item.status === 'available' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                              }}
                            />
                            {formatHoursLeft(item.expiryHoursLeft)}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          {item.servings}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block', padding: '0.2rem 0.6rem',
                              borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                              backgroundColor:
                                item.status === 'available' ? '#dcfce7'
                                  : item.status === 'claimed' ? '#fef3c7'
                                  : item.status === 'picked_up' ? '#e0e7ff'
                                  : '#fee2e2',
                              color:
                                item.status === 'available' ? '#15803d'
                                  : item.status === 'claimed' ? '#b45309'
                                  : item.status === 'picked_up' ? '#4338ca'
                                  : '#b91c1c',
                            }}
                          >
                            {item.status === 'available' ? '● available' : item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Handover Code Verification Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🔐 Verify Handover Code
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                When a recipient arrives, ask for their 4-digit pickup code to confirm handover.
              </p>

              {claimedListings.length > 0 && (
                <select
                  value={selectedListingForVerify}
                  onChange={(e) => setSelectedListingForVerify(e.target.value)}
                  style={{
                    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.88rem',
                    marginBottom: '0.75rem', backgroundColor: '#ffffff', boxSizing: 'border-box',
                  }}
                >
                  <option value="">— Select claimed listing —</option>
                  {claimedListings.map((l) => (
                    <option key={l._id} value={l._id}>{l.food_type} ({l.servings} meals)</option>
                  ))}
                </select>
              )}

              <form onSubmit={handleVerifyCodeSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  type="text" maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="4-digit code  e.g. 4729"
                  style={{
                    flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '1rem',
                    letterSpacing: '0.2em', fontWeight: 700, boxSizing: 'border-box',
                    transition: 'all 0.15s',
                  }}
                />
                <button
                  className="verify-btn"
                  type="submit"
                  style={{
                    padding: '0.6rem 1.1rem', backgroundColor: '#166534',
                    color: '#ffffff', border: 'none', borderRadius: '8px',
                    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.15s',
                  }}
                >
                  ✓ Verify
                </button>
              </form>

              {verifyMessage && (
                <div
                  style={{
                    marginTop: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: '8px',
                    fontSize: '0.82rem',
                    backgroundColor: verifyMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: verifyMessage.type === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${verifyMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
                  }}
                >
                  {verifyMessage.text}
                </div>
              )}
            </div>

            {/* Demo Controls Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🎮 Demo controls
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fastForwardHours(3)}
                  style={{
                    padding: '0.5rem 0.9rem', backgroundColor: 'transparent',
                    border: '1px solid #0284c7', color: '#0284c7',
                    borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  ▶ Fast-forward 3h (auto-expiry test)
                </button>
                <button
                  type="button"
                  onClick={resetDemoData}
                  style={{
                    padding: '0.5rem 0.9rem', backgroundColor: 'transparent',
                    border: '1px solid #dc2626', color: '#dc2626',
                    borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔄 Reset demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
