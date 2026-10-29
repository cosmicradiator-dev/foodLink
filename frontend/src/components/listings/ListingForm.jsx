import React, { useState } from 'react';
import FoodMap from '../map/FoodMap';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function ListingForm({ initialData = {}, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    food_type: initialData.food_type || '',
    description: initialData.description || '',
    servings: initialData.servings || 10,
    veg_flag: initialData.veg_flag !== undefined ? initialData.veg_flag : true,
    prepared_at: initialData.prepared_at ? new Date(initialData.prepared_at).toISOString().slice(0, 16) : '',
    expires_at: initialData.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 16) : '',
    address: initialData.address || '',
    latitude: initialData.location?.coordinates?.[1] || 11.0247,
    longitude: initialData.location?.coordinates?.[0] || 76.9360,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData.photo_url || '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleMapLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });
    if (photo) {
      payload.append('photo', photo);
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Food Type / Dish Name"
          name="food_type"
          value={formData.food_type}
          onChange={handleChange}
          placeholder="e.g. Cooked Rice, Sambar & Poriyal"
          required
        />

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Detailed Description <span className="form-required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className="form-input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe containers, condition, spices, package details..."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Servings (Meals)"
            name="servings"
            type="number"
            min="1"
            value={formData.servings}
            onChange={handleChange}
            required
          />

          <div className="form-group">
            <label className="form-label">Food Category</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="veg_flag"
                  checked={formData.veg_flag === true}
                  onChange={() => setFormData((p) => ({ ...p, veg_flag: true }))}
                />
                🟢 Veg
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="veg_flag"
                  checked={formData.veg_flag === false}
                  onChange={() => setFormData((p) => ({ ...p, veg_flag: false }))}
                />
                🔴 Non-Veg
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Prepared At"
            name="prepared_at"
            type="datetime-local"
            value={formData.prepared_at}
            onChange={handleChange}
            required
          />
          <Input
            label="Expiry Window (Expires At)"
            name="expires_at"
            type="datetime-local"
            value={formData.expires_at}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Pickup Address / Landmark"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g. PSG Tech Boys Hostel D Block Mess Gate"
          required
        />

        <div className="form-group">
          <label className="form-label">Food Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Pick Location on Map</label>
          <p className="form-hint" style={{ marginBottom: '0.5rem' }}>
            Click anywhere on the map to place the accurate pickup coordinates.
          </p>
          <div style={{ height: '360px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <FoodMap
              center={[formData.latitude, formData.longitude]}
              zoom={15}
              selectable={true}
              onLocationSelect={handleMapLocationSelect}
              listings={[{
                food_type: formData.food_type || 'Selected Pickup Point',
                servings: formData.servings,
                expires_at: formData.expires_at || new Date().toISOString(),
                address: formData.address || 'Selected Spot',
                location: { coordinates: [formData.longitude, formData.latitude] }
              }]}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Lat: {Number(formData.latitude).toFixed(4)}</span>
            <span>Lng: {Number(formData.longitude).toFixed(4)}</span>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth style={{ marginTop: 'auto' }}>
          Publish Surplus Food Listing
        </Button>
      </div>
    </form>
  );
}
