import React, { useState } from 'react';
import ListingStatusBadge from '../listings/ListingStatusBadge';
import Button from '../ui/Button';
import PickupCodeModal from './PickupCodeModal';
import RatingModal from '../ratings/RatingModal';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function ClaimCard({ claim, onRefresh, isDonor = false }) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const listing = claim.listing_id || {};
  const recipient = claim.recipient_id || {};
  const volunteer = claim.volunteer_id || null;

  const handleCancelClaim = async () => {
    if (!window.confirm('Are you sure you want to cancel this claim?')) return;
    setCancelling(true);
    try {
      await axiosClient.post(`/claims/${claim._id}/cancel`);
      toast.success('Claim cancelled. The food has been returned to available.');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel claim.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{listing.food_type || 'Food Listing'}</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🍽 {listing.servings} servings | {listing.veg_flag ? '🟢 Veg' : '🔴 Non-Veg'}</p>
        </div>
        <ListingStatusBadge status={claim.status} />
      </div>

      <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <p><strong>Pickup Address:</strong> {listing.address || 'Address provided upon claim'}</p>
        {isDonor ? (
          <p><strong>Claimed by:</strong> {recipient.name} ({recipient.organisation_name || 'Individual'}) - Trust Score: {recipient.trust_score || 100}⭐</p>
        ) : (
          <p><strong>Donor Contact:</strong> {listing.donor_id?.name || 'Donor'} ({listing.donor_id?.organisation_name || 'Hostel/Mess'})</p>
        )}
        {volunteer && (
          <p style={{ color: '#16a34a', fontWeight: 600 }}>🚴 Volunteer Assigned: {volunteer.name} (Contact unlocked)</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {claim.status === 'claimed' && !isDonor && (
          <Button variant="primary" size="sm" onClick={() => setShowCodeModal(true)}>
            View Pickup Code
          </Button>
        )}

        {claim.status === 'claimed' && isDonor && (
          <Button variant="primary" size="sm" onClick={() => setShowCodeModal(true)}>
            Verify Recipient Code
          </Button>
        )}

        {claim.status === 'claimed' && (
          <Button variant="outline" size="sm" isLoading={cancelling} onClick={handleCancelClaim}>
            Cancel Claim
          </Button>
        )}

        {claim.status === 'picked_up' && (
          <Button variant="secondary" size="sm" onClick={() => setShowRatingModal(true)}>
            ⭐ Rate Transaction
          </Button>
        )}
      </div>

      <PickupCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        claim={claim}
        listing={listing}
        onConfirmed={onRefresh}
      />

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        claimId={claim._id}
        toUserId={isDonor ? recipient._id : listing.donor_id?._id}
        toUserName={isDonor ? recipient.name : listing.donor_id?.name || 'Partner'}
        onSubmitted={onRefresh}
      />
    </div>
  );
}
