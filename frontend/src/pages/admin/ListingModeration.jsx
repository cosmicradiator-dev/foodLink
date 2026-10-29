import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import ListingStatusBadge from '../../components/listings/ListingStatusBadge';
import axiosClient from '../../api/axiosClient';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function ListingModeration() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/listings');
      setListings(res.data.data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRemove = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing as inappropriate/expired?')) return;
    try {
      await axiosClient.delete(`/admin/listings/${listingId}`);
      toast.success('Listing removed successfully.');
      fetchListings();
    } catch (err) {
      toast.error('Failed to remove listing.');
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Listing Moderation</h1>
        <p style={{ color: '#64748b' }}>Monitor active, expired, and flagged food listings across campus</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>Dish / Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Donor</th>
                <th style={{ padding: '0.75rem 1rem' }}>Servings</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Expires At</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <strong>{l.food_type}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.veg_flag ? '🟢 Veg' : '🔴 Non-Veg'}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{l.donor_id?.name || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{l.servings}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><ListingStatusBadge status={l.status} /></td>
                  <td style={{ padding: '0.75rem 1rem' }}>{new Date(l.expires_at).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {l.status !== 'expired' && (
                      <Button variant="danger" size="sm" onClick={() => handleRemove(l._id)}>
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
