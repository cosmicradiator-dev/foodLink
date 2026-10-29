import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon missing issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function FoodMap({
  center = [11.0247, 76.9360], // Default: Coimbatore / PSG Tech coordinates
  zoom = 14,
  listings = [],
  userLocation = [76.9360, 11.0247],
  onSelectListing = null,
  onLocationSelect = null,
  selectable = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = userLocation ? [userLocation[1], userLocation[0]] : center;
      const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (selectable && onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync user location pin & listing markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user marker
    if (userLocation && Array.isArray(userLocation)) {
      const userMarker = L.marker([userLocation[1], userLocation[0]], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>📍 You are here</strong>');
      markersRef.current.push(userMarker);
    }

    // Add listings markers
    listings.forEach((listing) => {
      const coords = listing.coordinates || listing.location?.coordinates;
      if (coords && Array.isArray(coords)) {
        const [lon, lat] = coords;
        const marker = L.marker([lat, lon], { icon: foodIcon }).addTo(map);

        const popupContent = `
          <div style="min-width: 160px; font-family: sans-serif;">
            <strong style="font-size: 13px; color: #166534;">${listing.food_type}</strong><br/>
            <span style="font-size: 12px; color: #334155;">🍽 ${listing.servings} meals · ${listing.veg_flag ? '🟢 Veg' : '🔴 Non-veg'}</span><br/>
            <span style="font-size: 11px; color: #64748b;">📍 ${listing.donor_name || listing.location_name || 'Campus'}</span>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectListing) {
          marker.on('click', () => onSelectListing(listing));
        }

        markersRef.current.push(marker);
      }
    });
  }, [listings, userLocation, onSelectListing]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '420px', borderRadius: '12px' }} />;
}
