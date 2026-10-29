import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function RatingModal({ isOpen, onClose, claimId, toUserId, toUserName, onSubmitted }) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score < 1) {
      toast.warn('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosClient.post('/ratings', { claim_id: claimId, to_user: toUserId, score, comment });
      toast.success(`Rating submitted for ${toUserName}!`);
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate ${toUserName}`} size="sm">
      <div className="rating-modal">
        <p className="rating-prompt">How was your experience?</p>
        <div className="star-rating" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${(hovered || score) >= star ? 'star-btn--active' : ''}`}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
        {(hovered || score) > 0 && (
          <p className="star-label">{labels[hovered || score]}</p>
        )}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="rating-comment" className="form-label">Comment (optional)</label>
          <textarea
            id="rating-comment"
            className="form-input"
            rows={3}
            maxLength={300}
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="form-hint">{comment.length}/300</p>
        </div>
        <Button variant="primary" fullWidth isLoading={submitting} onClick={handleSubmit}>
          Submit Rating
        </Button>
      </div>
    </Modal>
  );
}

