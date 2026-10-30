import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import FoodMap from '../../components/map/FoodMap';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function NearbyMap() {
  const { listings, claimListing, cancelClaim, requestVolunteer, currentUser } = useFoodLink();
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeClaimModal, setActiveClaimModal] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [natureFilter, setNatureFilter] = useState('all'); // all | cooked | packaged
  const [maxDistance, setMaxDistance] = useState(5.0); // km
  const [reportModalListing, setReportModalListing] = useState(null);
  const [reportReason, setReportReason] = useState('Suspicious or fake quantity');

  // Filter available listings
  const filteredListings = listings
    .filter((l) => l.status === 'available')
    .filter((l) => (!vegOnly ? true : l.veg_flag === true))
    .filter((l) => (natureFilter === 'all' ? true : l.food_nature === natureFilter))
    .filter((l) => (l.distanceKm || 0.5) <= maxDistance);

  // Smart Ranking Formula: 0.4 * proximity + 0.4 * urgency + 0.2 * quantity fit
  const rankedListings = [...filteredListings].sort((a, b) => {
    const proxA = Math.max(0, (10 - (a.distanceKm || 1)) / 10);
    const proxB = Math.max(0, (10 - (b.distanceKm || 1)) / 10);

    const urgA = Math.max(0, (6 - (a.expiryHoursLeft || 2)) / 6);
    const urgB = Math.max(0, (6 - (b.expiryHoursLeft || 2)) / 6);

    const qtyA = Math.min(1, (a.servings || 10) / 50);
    const qtyB = Math.min(1, (b.servings || 10) / 50);

    const scoreA = 0.4 * proxA + 0.4 * urgA + 0.2 * qtyA;
    const scoreB = 0.4 * proxB + 0.4 * urgB + 0.2 * qtyB;

    return scoreB - scoreA;
  });

  const handleClaim = (listing) => {
    try {
      const claim = claimListing(listing._id, currentUser?.name || 'Hope Shelter NGO');
      setActiveClaimModal(claim);
      toast.success('Food listing locked and claimed! Present your 4-digit pickup code at collection.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelClaimInModal = (listingId) => {
    cancelClaim(listingId);
    setActiveClaimModal(null);
    toast.info('Claim cancelled. Food listing released back to available.');
  };

  const handleRequestVolunteerInModal = (claimId) => {
    requestVolunteer(claimId);
    toast.success('Volunteer requested! Student volunteers notified.');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    toast.info('Report submitted to Admin moderation queue.');
    setReportModalListing(null);
  };

  return (
    <Layout>
      <style>{`
        .ranked-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .ranked-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
        }
        .claim-btn:hover {
          background: linear-gradient(135deg, #14532d, #15803d) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22,101,52,0.3);
        }
      `}</style>

      <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Recipient Profile Banner */}
        {currentUser && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              borderRadius: '16px',
              padding: '1.25rem 1.75rem',
              marginBottom: '1.75rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                {currentUser.avatar || '🏠'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  {currentUser.org} · Verified Recipient / Shelter
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { label: 'Meals Claimed', value: currentUser.totalMeals || 65, icon: '🍱' },
                { label: 'Trust Rating', value: `${currentUser.trustScore || 98}/100`, icon: '⭐' },
                { label: 'Campus Radius', value: `${maxDistance} km`, icon: '📍' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation & Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
              🗺️ Nearby Surplus Food
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Smart ranked by distance (40%), shelf-life urgency (40%), and quantity fit (20%).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/recipient/claims"
              style={{
                padding: '0.55rem 1.1rem',
                backgroundColor: '#ffffff',
                border: '1.5px solid #166534',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#166534',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              📦 My Claims
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Distance Filter Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Max Distance:
            </span>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              style={{ accentColor: '#166534', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', minWidth: '50px' }}>
              {maxDistance.toFixed(1)} km
            </span>
          </div>

          {/* Nature filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[
              { id: 'all', label: 'All Food' },
              { id: 'cooked', label: '🍳 Fresh Cooked' },
              { id: 'packaged', label: '📦 Packaged' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setNatureFilter(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: `1px solid ${natureFilter === tab.id ? '#166534' : '#e2e8f0'}`,
                  backgroundColor: natureFilter === tab.id ? '#f0fdf4' : '#ffffff',
                  color: natureFilter === tab.id ? '#166534' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Veg Only Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              style={{ accentColor: '#166534' }}
            />
            🌱 Veg Only
          </label>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.85rem', fontSize: '0.82rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            ● You (Hope Shelter / PSG Campus)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            ● Available Surplus Listings
          </span>
        </div>

        {/* 2-Column Split: Leaflet Map on Left, Ranked List on Right (Figure 3) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Map Container */}
          <div
            style={{
              height: '560px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <FoodMap
              listings={rankedListings}
              userLocation={[76.9360, 11.0247]}
              onSelectListing={(l) => setSelectedListing(l)}
            />
          </div>

          {/* Ranked List matching Figure 3 wireframe */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              maxHeight: '560px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Ranked List ({rankedListings.length} within {maxDistance} km)
              </div>
            </div>

            {rankedListings.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  No food within {maxDistance} km
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  Try increasing your distance slider or resetting your filters.
                </div>
              </div>
            ) : (
              rankedListings.map((listing, index) => {
                const hoursLeftText =
                  listing.expiryHoursLeft > 0
                    ? `${Math.floor(listing.expiryHoursLeft)}h ${Math.round((listing.expiryHoursLeft % 1) * 60)}m left`
                    : 'Expiring soon';

                const isSelected = selectedListing?._id === listing._id;

                return (
                  <div
                    key={listing._id}
                    className="ranked-card"
                    onClick={() => setSelectedListing(listing)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: isSelected ? '2px solid #166534' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      boxShadow: isSelected
                        ? '0 0 0 3px rgba(22,101,52,0.1), 0 2px 8px rgba(0,0,0,0.06)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: index === 0 ? '#166534' : '#e6f4ea',
                              color: index === 0 ? '#ffffff' : '#166534',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                            }}
                          >
                            {index + 1}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {listing.food_type}
                          </h3>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
                          <strong style={{ color: '#0f172a' }}>{listing.servings} meals</strong> · {listing.distanceKm} km away ·{' '}
                          <span style={{ color: listing.expiryHoursLeft < 2 ? '#b45309' : '#166534', fontWeight: 600 }}>
                            ⏱️ {hoursLeftText}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                          📍 {listing.donor_name} ({listing.location_name})
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: listing.veg_flag ? '#dcfce7' : '#fee2e2',
                            color: listing.veg_flag ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {listing.veg_flag ? '🌱 Veg' : '🍗 Non-veg'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {listing.food_nature === 'packaged' ? '📦 Packaged' : '🍳 Cooked'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportModalListing(listing);
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        ⚠️ Report
                      </button>

                      <button
                        type="button"
                        className="claim-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(listing);
                        }}
                        style={{
                          padding: '0.55rem 1.35rem',
                          background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        🔒 Lock & Claim
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Screen 4: Claim Details and Pickup Code Modal (Figure 4 wireframe) */}
        {activeClaimModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
              }}
            >
              {/* Status Header */}
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.05em',
                  }}
                >
                  STATUS: LOCKED & CLAIMED
                </span>
              </div>

              {/* Listing Details */}
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {activeClaimModal.listing?.food_type}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {activeClaimModal.listing?.donor_name} · {activeClaimModal.listing?.servings} meals ·{' '}
                {activeClaimModal.listing?.food_nature === 'packaged' ? 'Packaged' : 'Cooked'} · Expires{' '}
                {activeClaimModal.listing?.expires_at}
              </p>

              {/* Pickup Code Display matching Figure 4: 4 7 2 9 */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #86efac',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, marginBottom: '0.75rem' }}>
                  🔑 4-Digit Pickup Handover Code:
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem',
                  }}
                >
                  {(activeClaimModal.pickup_code || '4729').split('').map((char, i) => (
                    <div
                      key={i}
                      style={{
                        width: '52px',
                        height: '60px',
                        backgroundColor: '#ffffff',
                        border: '2.5px solid #166534',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.85rem',
                        fontWeight: 900,
                        color: '#166534',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.85rem' }}>
                  Present this 4-digit code to the donor upon collection to verify handover.
                </p>
              </div>

              {/* Actions matching Figure 4 */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleRequestVolunteerInModal(activeClaimModal._id)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    backgroundColor: '#ede9fe',
                    border: '1px solid #c4b5fd',
                    color: '#7c3aed',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🚴 Request Volunteer
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelClaimInModal(activeClaimModal.listing_id)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Claim
                </button>

                <button
                  type="button"
                  onClick={() => setActiveClaimModal(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Listing Modal */}
        {reportModalListing && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '440px',
                width: '100%',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Report Listing
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Help keep FoodLink safe and reliable.
              </p>

              <form onSubmit={handleReportSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Suspicious or fake quantity">Suspicious or fake quantity</option>
                    <option value="Spoiled or unsafe food">Spoiled or unsafe food</option>
                    <option value="Wrong location / unreachable donor">Wrong location / unreachable donor</option>
                    <option value="Other abuse">Other abuse</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setReportModalListing(null)}
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.25rem',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
