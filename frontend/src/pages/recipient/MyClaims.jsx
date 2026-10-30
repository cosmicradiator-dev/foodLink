import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function MyClaims() {
  const { claims, cancelClaim, requestVolunteer, submitRating, currentUser } = useFoodLink();
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [ratingClaimId, setRatingClaimId] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const filteredClaims = claims.filter((c) => {
    if (filter === 'active') return c.status === 'claimed';
    if (filter === 'completed') return c.status === 'picked_up';
    return true;
  });

  const activeClaimsCount = claims.filter((c) => c.status === 'claimed').length;
  const completedClaimsCount = claims.filter((c) => c.status === 'picked_up').length;

  const handleRate = (claimId) => {
    submitRating(claimId, ratingScore, ratingComment || 'Fresh food delivered on time!');
    toast.success('Thank you for rating! ⭐ Donor trust score updated.');
    setRatingClaimId(null);
    setRatingComment('');
  };

  return (
    <Layout>
      <style>{`
        .claim-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .claim-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
        }
        .star-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .star-btn:hover {
          transform: scale(1.2);
        }
      `}</style>

      <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '3rem' }}>
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
                { label: 'Active Claims', value: activeClaimsCount, icon: '⏳' },
                { label: 'Completed Deliveries', value: completedClaimsCount, icon: '✅' },
                { label: 'Trust Score', value: `${currentUser.trustScore || 98}/100`, icon: '⭐' },
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
              📦 My Food Claims
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Present your 4-digit pickup code to the donor upon collection.
            </p>
          </div>

          <Link
            to="/recipient/map"
            style={{
              padding: '0.55rem 1.1rem',
              backgroundColor: '#166534',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            🗺️ Explore Nearby Food
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'all', label: `All Claims (${claims.length})` },
            { id: 'active', label: `⏳ Awaiting Pickup (${activeClaimsCount})` },
            { id: 'completed', label: `✅ Picked Up (${completedClaimsCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: `1.5px solid ${filter === tab.id ? '#1d4ed8' : '#e2e8f0'}`,
                backgroundColor: filter === tab.id ? '#1d4ed8' : '#ffffff',
                color: filter === tab.id ? '#ffffff' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredClaims.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍱</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              No claims in this category
            </p>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Explore campus messes and canteens with surplus food ready for immediate pickup.
            </p>
            <Link
              to="/recipient/map"
              style={{
                display: 'inline-block',
                padding: '0.65rem 1.35rem',
                backgroundColor: '#166534',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Find Surplus Food Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredClaims.map((claim) => {
              const isPickedUp = claim.status === 'picked_up';
              return (
                <div
                  key={claim._id}
                  className="claim-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${isPickedUp ? '#16a34a' : '#f59e0b'}`,
                    borderRadius: '16px',
                    padding: '1.75rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: isPickedUp ? '#dcfce7' : '#fef3c7',
                            color: isPickedUp ? '#15803d' : '#b45309',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {isPickedUp ? '● PICKED UP / COMPLETED' : '● AWAITING PICKUP'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Claimed {new Date(claim.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                        {claim.listing?.food_type}
                      </h3>
                      <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
                        📍 {claim.listing?.donor_name} · <strong>{claim.listing?.servings} meals</strong> ·{' '}
                        {claim.listing?.food_nature === 'packaged' ? '📦 Packaged' : '🍳 Cooked'} · Location: {claim.listing?.location_name || 'Campus Gate'}
                      </p>
                    </div>

                    {/* 4-digit code display (Figure 4) */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.75rem 1.25rem',
                        textAlign: 'center',
                        minWidth: '150px',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        Pickup Code
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {(claim.pickup_code || '4729').split('').map((ch, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '34px',
                              backgroundColor: '#ffffff',
                              border: '1.5px solid #166534',
                              borderRadius: '6px',
                              fontSize: '1.15rem',
                              fontWeight: 900,
                              color: '#166534',
                            }}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Rating */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    {!isPickedUp ? (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            requestVolunteer(claim._id);
                            toast.success('🚴 Volunteer requested for this delivery!');
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ede9fe',
                            border: '1px solid #c4b5fd',
                            color: '#7c3aed',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🚴 Request Volunteer Delivery
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            cancelClaim(claim.listing_id);
                            toast.info('Claim cancelled and released.');
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#b91c1c',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel Claim
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: '100%' }}>
                        {claim.rated ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#15803d', fontWeight: 700 }}>
                            <span>⭐⭐⭐⭐⭐</span>
                            <span>Rated {claim.score}/5 stars</span>
                            {claim.review && <span style={{ color: '#64748b', fontWeight: 400 }}>— "{claim.review}"</span>}
                          </div>
                        ) : ratingClaimId === claim._id ? (
                          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                              Rate your experience with {claim.listing?.donor_name}:
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className="star-btn"
                                  onClick={() => setRatingScore(s)}
                                  style={{ opacity: s <= ratingScore ? 1 : 0.3 }}
                                >
                                  ⭐
                                </button>
                              ))}
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginLeft: '0.5rem' }}>
                                {ratingScore} of 5 stars
                              </span>
                            </div>
                            <input
                              type="text"
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              placeholder="Leave a short note (e.g. fresh food, smooth pickup)"
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                marginBottom: '0.75rem',
                                boxSizing: 'border-box',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleRate(claim._id)}
                                style={{
                                  padding: '0.45rem 1rem',
                                  backgroundColor: '#166534',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Submit Rating
                              </button>
                              <button
                                type="button"
                                onClick={() => setRatingClaimId(null)}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRatingClaimId(claim._id)}
                            style={{
                              padding: '0.45rem 0.9rem',
                              backgroundColor: '#fef3c7',
                              border: '1px solid #fcd34d',
                              color: '#b45309',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ⭐ Rate Donor Experience
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
