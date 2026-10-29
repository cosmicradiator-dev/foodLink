import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import ListingCard from '../../components/listings/ListingCard';
import PickupCodeModal from '../../components/claims/PickupCodeModal';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';
import Spinner from '../../components/ui/Spinner';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeVerifyClaim, setActiveVerifyClaim] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/listings/my');
      setListings(res.data.data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Food Listings</h1>
          <p style={{ color: '#64748b' }}>Manage your active, claimed, and historical donations</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'available', 'claimed', 'picked_up', 'expired'].map((status) => (
            <button
              key={status}
              className={`btn btn--sm ${filter === status ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setFilter(status)}
              style={{ textTransform: 'capitalize' }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          No listings found under this filter.
        </div>
      ) : (
        <div className="grid-listings">
          {filteredListings.map((listing) => (
            <div key={listing._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ListingCard listing={listing} onRefresh={fetchListings} />
              {listing.status === 'claimed' && listing.claim && (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => setActiveVerifyClaim({ claim: listing.claim, listing })}
                >
                  Verify Recipient Pickup Code
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeVerifyClaim && (
        <PickupCodeModal
          isOpen={true}
          onClose={() => setActiveVerifyClaim(null)}
          claim={activeVerifyClaim.claim}
          listing={activeVerifyClaim.listing}
          onConfirmed={fetchListings}
        />
      )}
    </Layout>
  );
}
