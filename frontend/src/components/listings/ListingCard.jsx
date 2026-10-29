import React, { useState, useEffect } from 'react';
import ListingStatusBadge from './ListingStatusBadge';
import Button from '../ui/Button';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

function formatTimeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function ListingCard({ listing, onClaim, onRefresh }) {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(listing.expires_at));

  // Live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(listing.expires_at));
    }, 30000);
    return () => clearInterval(interval);
  }, [listing.expires_at]);

  const handleClaim = async () => {
    if (!window.confirm(`Claim "${listing.food_type}" (${listing.servings} servings)?`)) return;
    setClaiming(true);
    try {
      await axiosClient.post(`/claims/${listing._id}`);
      toast.success('Food claimed! Check your pickup code in My Claims.');
      onRefresh?.();
      onClaim?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim listing.');
    } finally {
      setClaiming(false);
    }
  };

  const urgencyColor = () => {
    const ms = new Date(listing.expires_at) - Date.now();
    if (ms < 3600000) return '#ef4444'; // < 1h: red
    if (ms < 7200000) return '#f97316'; // < 2h: orange
    return '#16a34a'; // green
  };

  return (
    <div className="listing-card" role="article">
      <div className="listing-card__image">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.food_type} loading="lazy" />
        ) : (
          <div className="listing-card__image-placeholder">🍱</div>
        )}
        <div className="listing-card__status">
          <ListingStatusBadge status={listing.status} />
        </div>
        <div className="listing-card__veg">
          <span className={`veg-badge ${listing.veg_flag ? 'veg-badge--veg' : 'veg-badge--nonveg'}`}>
            {listing.veg_flag ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>
      </div>

      <div className="listing-card__body">
        <h3 className="listing-card__title">{listing.food_type}</h3>
        <p className="listing-card__description">{listing.description}</p>

        <div className="listing-card__meta">
          <span className="listing-card__servings">🍽 {listing.servings} servings</span>
          {listing.distanceKm !== undefined && listing.distanceKm !== null && (
            <span className="listing-card__distance">📍 {listing.distanceKm} km away</span>
          )}
          <span className="listing-card__time" style={{ color: urgencyColor() }}>
            ⏱ {timeLeft}
          </span>
        </div>

        <div className="listing-card__donor">
          <span className="listing-card__donor-name">
            By {listing.donor_id?.organisation_name || listing.donor_id?.name || 'Donor'}
          </span>
          {listing.donor_id?.trust_score !== undefined && (
            <span className="trust-score" title="Trust Score">
              ⭐ {listing.donor_id.trust_score}
            </span>
          )}
        </div>

        <p className="listing-card__address">📍 {listing.address}</p>

        {listing.rankScore !== undefined && (
          <div className="listing-card__rank">
            <div className="rank-bar">
              <div className="rank-bar__fill" style={{ width: `${Math.round(listing.rankScore * 100)}%` }} />
            </div>
            <span className="rank-bar__label">Match score: {Math.round(listing.rankScore * 100)}%</span>
          </div>
        )}

        {user?.role === 'recipient' && listing.status === 'available' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            isLoading={claiming}
            onClick={handleClaim}
            style={{ marginTop: '0.75rem' }}
          >
            Claim This Food
          </Button>
        )}
      </div>
    </div>
  );
}

