/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 * @param {number} lat1 Latitude 1
 * @param {number} lon1 Longitude 1
 * @param {number} lat2 Latitude 2
 * @param {number} lon2 Longitude 2
 * @returns {number} Distance in km
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Smart ranking algorithm for food listings.
 * Formula: Score = 0.4 * proximity + 0.4 * urgency + 0.2 * quantityFit
 * 
 * @param {Array} listings Array of Listing documents or plain objects
 * @param {Array<number>} userCoords [longitude, latitude] of the user
 * @param {number} maxDistanceKm Maximum matching radius in km (default 10km)
 * @returns {Array} Listings with attached distanceKm, rankScore, sorted descending by rankScore
 */
const rankListings = (listings, userCoords = [0, 0], maxDistanceKm = 10) => {
  const now = Date.now();
  const [userLon, userLat] = userCoords;
  const hasUserCoords = userLon !== 0 || userLat !== 0;

  const scoredListings = listings.map((listing) => {
    const listingObj = listing.toObject ? listing.toObject() : { ...listing };

    // 1. Proximity score (0 to 1)
    let distanceKm = 0;
    let proximity = 1;

    if (hasUserCoords && listingObj.location && listingObj.location.coordinates) {
      const [listLon, listLat] = listingObj.location.coordinates;
      distanceKm = calculateDistanceKm(userLat, userLon, listLat, listLon);
      proximity = Math.max(0, 1 - distanceKm / maxDistanceKm);
    }

    // 2. Urgency score (0 to 1, higher = more urgent = expiring sooner)
    const expiresAtMs = new Date(listingObj.expires_at).getTime();
    const preparedAtMs = new Date(listingObj.prepared_at).getTime();
    const totalWindowMs = Math.max(1, expiresAtMs - preparedAtMs);
    const timeLeftMs = Math.max(0, expiresAtMs - now);

    // Fraction of lifetime remaining
    const urgency = Math.min(1, Math.max(0, 1 - timeLeftMs / totalWindowMs));

    // 3. Quantity fit score (0 to 1, normalized to 50 servings)
    const servings = Number(listingObj.servings) || 1;
    const quantityFit = Math.min(servings, 50) / 50;

    // Smart composite score (0 to 100)
    const score = 0.4 * proximity + 0.4 * urgency + 0.2 * quantityFit;

    listingObj.distanceKm = Number(distanceKm.toFixed(2));
    listingObj.proximityScore = Number(proximity.toFixed(3));
    listingObj.urgencyScore = Number(urgency.toFixed(3));
    listingObj.quantityFitScore = Number(quantityFit.toFixed(3));
    listingObj.rankScore = Number((score * 100).toFixed(1)); // 0 - 100 scale

    return listingObj;
  });

  // Sort descending by rank score
  return scoredListings.sort((a, b) => b.rankScore - a.rankScore);
};

module.exports = {
  calculateDistanceKm,
  rankListings,
};
