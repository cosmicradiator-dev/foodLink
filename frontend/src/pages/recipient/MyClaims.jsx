import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function MyClaims() {
  const { claims, cancelClaim, requestVolunteer, submitRating } = useFoodLink();
  const [ratingClaimId, setRatingClaimId] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);

  const handleRate = (claimId) => {
    submitRating(claimId, ratingScore, 'Great fresh food, smooth pickup!');
    toast.success('Thank you for submitting your rating! Donor trust score updated.');
    setRatingClaimId(null);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          My Food Claims
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Show your 4-digit pickup verification code to the donor upon collection.
        </p>

        {claims.length === 0 ? (
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
            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>You have not claimed any surplus food yet.</p>
            <a
              href="/recipient/map"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.25rem',
                backgroundColor: '#166534',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore Nearby Food Map
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {claims.map((claim) => {
              const isPickedUp = claim.status === 'picked_up';
              return (
                <div
                  key={claim._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: isPickedUp ? '#dcfce7' : '#fef3c7',
                          color: isPickedUp ? '#15803d' : '#b45309',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          marginBottom: '0.65rem',
                        }}
                      >
                        Status: {claim.status.toUpperCase()}
                      </span>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {claim.listing?.food_type}
                      </h3>
                      <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {claim.listing?.donor_name}, {claim.listing?.servings} meals,{' '}
                        {claim.listing?.food_nature === 'packaged' ? 'Packaged' : 'Cooked'}, Expires{' '}
                        {claim.listing?.expires_at}
                      </p>
                    </div>

                    {/* 4-digit code display (Figure 4) */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '0.75rem 1.25rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Pickup Code
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', letterSpacing: '0.2em' }}>
                        {claim.pickup_code}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1.5rem',
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
                            toast.success('Volunteer requested for this claim!');
                          }}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #166534',
                            color: '#166534',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Request Volunteer
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            cancelClaim(claim.listing_id);
                            toast.info('Claim cancelled.');
                          }}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #dc2626',
                            color: '#dc2626',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel Claim
                        </button>
                      </div>
                    ) : (
                      <div>
                        {claim.rated ? (
                          <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                            ⭐ Rated {claim.score}/5 stars – Thank you!
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                              Rate Donor:
                            </span>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setRatingScore(s)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  fontSize: '1.25rem',
                                  cursor: 'pointer',
                                  opacity: s <= ratingScore ? 1 : 0.3,
                                }}
                              >
                                ⭐
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleRate(claim._id)}
                              style={{
                                marginLeft: '0.5rem',
                                padding: '0.35rem 0.75rem',
                                backgroundColor: '#166534',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Submit Rating
                            </button>
                          </div>
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
