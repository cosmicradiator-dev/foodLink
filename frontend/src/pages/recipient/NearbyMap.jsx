import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import FoodMap from '../../components/map/FoodMap';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function NearbyMap() {
  const { listings, claimListing, cancelClaim, requestVolunteer } = useFoodLink();
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeClaimModal, setActiveClaimModal] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [reportModalListing, setReportModalListing] = useState(null);
  const [reportReason, setReportReason] = useState('Suspicious or fake quantity');

  // Filter available listings
  const availableListings = listings
    .filter((l) => l.status === 'available')
    .filter((l) => (!vegOnly ? true : l.veg_flag === true));

  // Smart Ranking Formula: 0.4 * proximity + 0.4 * urgency + 0.2 * quantity fit
  const rankedListings = [...availableListings].sort((a, b) => {
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
      const claim = claimListing(listing._id, 'PSG Student Recipient / Shelter');
      setActiveClaimModal(claim);
      toast.success('Food listing locked and claimed! Present your 4-digit pickup code at collection.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelClaimInModal = (listingId) => {
    cancelClaim(listingId);
    setActiveClaimModal(null);
    toast.info('Claim cancelled. Food listing has been released back to available.');
  };

  const handleRequestVolunteerInModal = (claimId) => {
    requestVolunteer(claimId);
    toast.success('Delivery assistance requested! Local student volunteers have been notified.');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    toast.info('Report submitted to Admin moderation queue.');
    setReportModalListing(null);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Navigation / Header matching Figure 3 */}
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Nearby Surplus Food
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Ranked by distance, remaining shelf-life, and quantity match. Real-time claim locking prevents duplicate pickups.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                style={{ accentColor: '#166534' }}
              />
              Show Veg Only 🟢
            </label>

            <Link
              to="/recipient/claims"
              style={{
                padding: '0.45rem 0.9rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#1e293b',
                textDecoration: 'none',
              }}
            >
              My Claims
            </Link>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            ● You (PSG Tech)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            ● Surplus Listings
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
              height: '540px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
              gap: '1rem',
              maxHeight: '540px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Ranked list ({rankedListings.length} available)
            </div>

            {rankedListings.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                No available surplus food currently nearby. Fast-forward or check back soon!
              </div>
            ) : (
              rankedListings.map((listing, index) => {
                const hoursLeftText =
                  listing.expiryHoursLeft > 0
                    ? `${Math.floor(listing.expiryHoursLeft)}h ${Math.round((listing.expiryHoursLeft % 1) * 60)}m left`
                    : 'Expiring soon';

                return (
                  <div
                    key={listing._id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: selectedListing?._id === listing._id ? '2px solid #166534' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#e6f4ea',
                              color: '#166534',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                            {listing.food_type}
                          </h3>
                        </div>

                        <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem' }}>
                          <strong>{listing.servings} meals</strong> · {listing.distanceKm} km · {hoursLeftText}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                          📍 {listing.donor_name} ({listing.location_name})
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: listing.veg_flag ? '#dcfce7' : '#fee2e2',
                            color: listing.veg_flag ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {listing.veg_flag ? 'Veg' : 'Non-veg'}
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
                          {listing.food_nature === 'packaged' ? 'Packaged' : 'Cooked'}
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
                        onClick={() => setReportModalListing(listing)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Report
                      </button>

                      <button
                        type="button"
                        onClick={() => handleClaim(listing)}
                        style={{
                          padding: '0.5rem 1.25rem',
                          backgroundColor: '#166534',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Claim
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
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
              }}
            >
              {/* Status Header */}
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#b45309',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.05em',
                  }}
                >
                  Status: CLAIMED
                </span>
              </div>

              {/* Listing Details */}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {activeClaimModal.listing?.food_type}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                {activeClaimModal.listing?.donor_name}, {activeClaimModal.listing?.servings} meals,{' '}
                {activeClaimModal.listing?.food_nature === 'packaged' ? 'Packaged' : 'Cooked'}, Expires{' '}
                {activeClaimModal.listing?.expires_at}
              </p>

              {/* Pickup Code Display matching Figure 4: 4 7 2 9 */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.65rem' }}>
                  Pickup code:
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
                        width: '48px',
                        height: '56px',
                        backgroundColor: '#ffffff',
                        border: '2px solid #166534',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#166534',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.75rem' }}>
                  Show this 4-digit code to the donor at collection for handover confirmation.
                </p>
              </div>

              {/* Actions matching Figure 4 */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleRequestVolunteerInModal(activeClaimModal._id)}
                  style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #166534',
                    color: '#166534',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Request Volunteer
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelClaimInModal(activeClaimModal.listing_id)}
                  style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dc2626',
                    color: '#dc2626',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Claim
                </button>

                <button
                  type="button"
                  onClick={() => setActiveClaimModal(null)}
                  style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
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
                Flagging: <strong>{reportModalListing.food_type}</strong>
              </p>

              <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Reason for reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Suspicious or fake quantity">Suspicious or fake quantity</option>
                    <option value="Food safety or hygiene concern">Food safety or hygiene concern</option>
                    <option value="Inaccurate location or contact">Inaccurate location or contact</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setReportModalListing(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #cbd5e1',
                      background: 'transparent',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
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
