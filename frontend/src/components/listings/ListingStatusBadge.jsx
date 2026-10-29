import React from 'react';

const STATUS_CONFIG = {
  available: { label: 'Available', variant: 'success' },
  claimed: { label: 'Claimed', variant: 'warning' },
  picked_up: { label: 'Picked Up', variant: 'info' },
  expired: { label: 'Expired', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

export default function ListingStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'neutral' };
  return (
    <span className={`status-badge status-badge--${config.variant}`}>
      {config.label}
    </span>
  );
}

