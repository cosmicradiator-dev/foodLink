import React from 'react';

export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: '1rem', md: '1.5rem', lg: '2.5rem', xl: '4rem' };
  const dim = sizes[size] || sizes.md;

  return (
    <div
      className={`spinner spinner--${color}`}
      style={{ width: dim, height: dim }}
      role="status"
      aria-label="Loading"
    />
  );
}

