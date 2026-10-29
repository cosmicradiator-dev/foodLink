import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function PickupCodeModal({ isOpen, onClose, claim, listing, onConfirmed }) {
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Donor: enter code to confirm
  const handleConfirm = async () => {
    if (code.trim().length !== 6) {
      setError('Please enter the 6-character pickup code.');
      return;
    }
    setError('');
    setConfirming(true);
    try {
      await axiosClient.post(`/claims/${claim._id}/confirm-pickup`, { pickupCode: code.trim() });
      toast.success('Pickup confirmed! 🎉 Please rate the recipient.');
      onConfirmed?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Confirmation failed.');
    } finally {
      setConfirming(false);
    }
  };

  const isRecipientView = !onConfirmed; // if no onConfirmed, we're showing the code to recipient

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pickup Code" size="sm">
      {isRecipientView ? (
        <div className="pickup-code-display">
          <p className="pickup-code-subtitle">Show this code to the donor at pickup:</p>
          <div className="pickup-code-value" aria-label={`Pickup code: ${claim?.pickup_code}`}>
            {claim?.pickup_code?.split('').map((char, i) => (
              <span key={i} className="pickup-code-char">{char}</span>
            ))}
          </div>
          <p className="pickup-code-hint">
            📍 Pickup at: <strong>{listing?.address}</strong>
          </p>
          <p className="pickup-code-hint">
            ⏱ Expires: <strong>{listing?.expires_at ? new Date(listing.expires_at).toLocaleString() : 'N/A'}</strong>
          </p>
        </div>
      ) : (
        <div className="pickup-code-confirm">
          <p className="pickup-code-subtitle">Enter the 6-character code given by the recipient:</p>
          <div className="form-group">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. A3X9KQ"
              className={`form-input pickup-code-input ${error ? 'form-input--error' : ''}`}
              autoFocus
              autoComplete="off"
            />
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
          <Button variant="primary" fullWidth isLoading={confirming} onClick={handleConfirm}>
            Confirm Pickup
          </Button>
        </div>
      )}
    </Modal>
  );
}

