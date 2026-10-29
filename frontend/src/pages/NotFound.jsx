import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#166534', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    </Layout>
  );
}

