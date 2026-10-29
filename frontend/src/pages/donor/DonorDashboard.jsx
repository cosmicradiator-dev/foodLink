import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import ListingCard from '../../components/listings/ListingCard';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [impactRes, listingsRes] = await Promise.all([
        axiosClient.get('/dashboard/my-impact'),
        axiosClient.get('/listings/my'),
      ]);
      setStats(impactRes.data.data);
      setRecentListings(listingsRes.data.data.listings.slice(0, 4));
    } catch (err) {
      console.error('Error fetching donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome, {user?.name} 👋</h1>
          <p style={{ color: '#64748b' }}>Manage your surplus food donations & verify recipient pickups</p>
        </div>
        <Link to="/donor/create">
          <Button variant="primary" size="md">
            + Post Surplus Food
          </Button>
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
              <span className="stat-card__value">{stats?.mealsDonated || 0}</span>
              <span className="stat-card__label">Total Meals Donated</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats?.kgDiverted || 0} kg</span>
              <span className="stat-card__label">Food Diverted from Waste</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats?.listingCounts?.available || 0}</span>
              <span className="stat-card__label">Active Available Listings</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">⭐ {stats?.trustScore || 100}</span>
              <span className="stat-card__label">Donor Trust Score</span>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Listings</h2>
              <Link to="/donor/listings" style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                View All Listings →
              </Link>
            </div>

            {recentListings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>No surplus food listed yet.</p>
                <Link to="/donor/create">
                  <Button variant="primary" size="sm">Create First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="grid-listings">
                {recentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} onRefresh={fetchDashboardData} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
