import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import ListingCard from '../../components/listings/ListingCard';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [nearbyCount, setNearbyCount] = useState(0);
  const [activeClaims, setActiveClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nearbyRes, claimsRes] = await Promise.all([
        axiosClient.get('/listings/nearby'),
        axiosClient.get('/claims/my'),
      ]);
      setNearbyCount(nearbyRes.data.count || 0);
      setActiveClaims(claimsRes.data.data.claims.filter((c) => c.status === 'claimed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome, {user?.name}</h1>
          <p style={{ color: '#64748b' }}>Search and claim available surplus food across campus and local communities</p>
        </div>
        <Link to="/recipient/map">
          <Button variant="primary" size="md">🗺 Open Live Map</Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card__value">{nearbyCount}</span>
              <span className="stat-card__label">Active Available Food Listings</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{activeClaims.length}</span>
              <span className="stat-card__label">Pending Pickups</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">⭐ {user?.trust_score || 100}</span>
              <span className="stat-card__label">Recipient Trust Score</span>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Active Claims Waiting for Pickup</h2>
            {activeClaims.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                <p>You have no active claims pending pickup.</p>
                <Link to="/recipient/map" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  <Button variant="outline" size="sm">Explore Nearby Food Map</Button>
                </Link>
              </div>
            ) : (
              <div className="grid-listings">
                {activeClaims.map((claim) => (
                  <div key={claim._id} className="card">
                    <h3 style={{ fontWeight: 700 }}>{claim.listing_id?.food_type}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🍽 {claim.listing_id?.servings} servings</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>📍 {claim.listing_id?.address}</p>
                    <Link to="/recipient/claims" style={{ display: 'inline-block', marginTop: '1rem' }}>
                      <Button variant="primary" size="sm" fullWidth>View Pickup Code</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
