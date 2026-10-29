import React, { useState } from 'react';
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
  } = useFoodLink();

  // Form State matching Figure 2
  const [donorName, setDonorName] = useState('Hostel Mess');
  const [foodType, setFoodType] = useState('');
  const [servings, setServings] = useState('50');
  const [pickupLocation, setPickupLocation] = useState('Hostel Mess');
  const [customLocation, setCustomLocation] = useState('');
  const [foodCategory, setFoodCategory] = useState('veg'); // 'veg' | 'non-veg'
  const [foodNature, setFoodNature] = useState('cooked'); // 'cooked' | 'packaged'
  const [preparedAt, setPreparedAt] = useState('13:39');
  const [expiresAt, setExpiresAt] = useState('16:39');
  const [photoName, setPhotoName] = useState('');

  // Code verification state
  const [selectedListingForVerify, setSelectedListingForVerify] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodType.trim()) {
      toast.error('Please enter food type / dish name.');
      return;
    }

    const newListing = addListing({
      food_type: foodType,
      donor_name: donorName,
      servings: Number(servings) || 10,
      veg_flag: foodCategory === 'veg',
      food_nature: foodNature,
      prepared_at: preparedAt,
      expires_at: expiresAt,
      location_name: pickupLocation === 'Other' ? customLocation : pickupLocation,
    });

    toast.success(`"${newListing.food_type}" posted successfully!`);
    setFoodType('');
  };

  const handleVerifyCodeSubmit = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setVerifyMessage({ type: 'error', text: 'Please enter the 4-digit code.' });
      return;
    }

    // Find listing to verify
    const targetListingId =
      selectedListingForVerify ||
      listings.find((l) => l.status === 'claimed')?._id;

    if (!targetListingId) {
      setVerifyMessage({
        type: 'error',
        text: 'No claimed listing found to verify. Please claim a listing first on the Nearby Map.',
      });
      return;
    }

    try {
      verifyPickupCode(targetListingId, verificationCode);
      setVerifyMessage({
        type: 'success',
        text: '✅ Pickup confirmed! Meals saved count and kg diverted updated live on the Impact Dashboard.',
      });
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

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Add Surplus Food
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Expiry and prepared time are mandatory – they are always shown to recipients.
        </p>

        {/* 2-Column Grid matching Figure 2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Form Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Donor name
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Hostel Mess"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Food type
                </label>
                <input
                  type="text"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  placeholder="e.g. Veg meals – rice, sambar"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              {/* Servings and Pickup Location Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Servings (meals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Pickup location
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      backgroundColor: '#ffffff',
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
                <div>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Enter landmark or mess gate"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              )}

              {/* Food Category: Veg / Non-veg */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Food category
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="foodCategory"
                      value="veg"
                      checked={foodCategory === 'veg'}
                      onChange={() => setFoodCategory('veg')}
                      style={{ accentColor: '#166534' }}
                    />
                    Veg
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="foodCategory"
                      value="non-veg"
                      checked={foodCategory === 'non-veg'}
                      onChange={() => setFoodCategory('non-veg')}
                      style={{ accentColor: '#166534' }}
                    />
                    Non-veg
                  </label>
                </div>
              </div>

              {/* Packaged or Cooked (FR4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Packaged or cooked
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="foodNature"
                      value="cooked"
                      checked={foodNature === 'cooked'}
                      onChange={() => setFoodNature('cooked')}
                      style={{ accentColor: '#166534' }}
                    />
                    Freshly cooked
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="foodNature"
                      value="packaged"
                      checked={foodNature === 'packaged'}
                      onChange={() => setFoodNature('packaged')}
                      style={{ accentColor: '#166534' }}
                    />
                    Packaged
                  </label>
                </div>
              </div>

              {/* Prepared At and Expires At Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Prepared at
                  </label>
                  <input
                    type="time"
                    value={preparedAt}
                    onChange={(e) => setPreparedAt(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Expires at
                  </label>
                  <input
                    type="time"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Photo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'inline-block',
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setPhotoName(e.target.files[0]?.name || '')}
                    />
                  </label>
                  <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                    {photoName || 'No file chosen'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1e6b37',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                Post Listing
              </button>
            </form>
          </div>

          {/* Right Column: My Listings Card matching Figure 2 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              My Listings
            </h2>

            {/* Listings Table matching Figure 2 */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                <span>FOOD</span>
                <span style={{ textAlign: 'center' }}>MEALS</span>
                <span style={{ textAlign: 'right' }}>STATUS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {listings.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                        {item.food_type}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {item.donor_name} · {formatHoursLeft(item.expiryHoursLeft)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                      {item.servings}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor:
                            item.status === 'available'
                              ? '#dcfce7'
                              : item.status === 'claimed'
                              ? '#fef3c7'
                              : item.status === 'picked_up'
                              ? '#e0e7ff'
                              : '#fee2e2',
                          color:
                            item.status === 'available'
                              ? '#15803d'
                              : item.status === 'claimed'
                              ? '#b45309'
                              : item.status === 'picked_up'
                              ? '#4338ca'
                              : '#b91c1c',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Handover Code Verification Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                When a recipient claims a listing, ask for their 4-digit pickup code and verify it here.
              </p>

              <form onSubmit={handleVerifyCodeSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="4-digit code (e.g. 4729)"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Verify Code
                </button>
              </form>

              {verifyMessage && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    backgroundColor: verifyMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: verifyMessage.type === 'success' ? '#15803d' : '#b91c1c',
                  }}
                >
                  {verifyMessage.text}
                </div>
              )}
            </div>

            {/* Demo Controls Section matching Figure 2 */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Demo controls
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fastForwardHours(3)}
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #0284c7',
                    color: '#0284c7',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  ▶ Fast-forward 3 hours (test auto-expiry)
                </button>

                <button
                  type="button"
                  onClick={resetDemoData}
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #dc2626',
                    color: '#dc2626',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset demo data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
