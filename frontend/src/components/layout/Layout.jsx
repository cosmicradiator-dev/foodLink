import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children, hideFooter = false }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 1.5rem', width: '100%', maxWidth: '1150px', margin: '0 auto' }}>
        {children}
      </main>
      {!hideFooter && (
        <footer
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.85rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          Food Link – A Surplus Food Redistribution System · Demo prototype
        </footer>
      )}
    </div>
  );
}
