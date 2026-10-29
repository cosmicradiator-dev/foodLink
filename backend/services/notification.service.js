let io = null;

/**
 * Initialize Socket.io instance for the notification service
 * @param {object} ioInstance Socket.io server instance
 */
const initNotificationService = (ioInstance) => {
  io = ioInstance;
};

/**
 * Get the current Socket.io instance
 */
const getIO = () => io;

/**
 * Notify recipients and volunteers about a new food listing
 * @param {object} listing Created listing object
 */
const notifyNearbyRecipients = (listing) => {
  if (!io) return;
  io.to('role:recipient').to('role:volunteer').emit('listing:created', {
    message: `New surplus food available: ${listing.food_type} (${listing.servings} servings)`,
    listing,
  });
};

/**
 * Notify a specific donor
 * @param {string} donorId 
 * @param {string} event 
 * @param {object} data 
 */
const notifyDonor = (donorId, event, data) => {
  if (!io) return;
  io.to(`user:${donorId.toString()}`).emit(event, data);
};

/**
 * Notify a specific recipient
 * @param {string} recipientId 
 * @param {string} event 
 * @param {object} data 
 */
const notifyRecipient = (recipientId, event, data) => {
  if (!io) return;
  io.to(`user:${recipientId.toString()}`).emit(event, data);
};

/**
 * Notify a specific volunteer
 * @param {string} volunteerId 
 * @param {string} event 
 * @param {object} data 
 */
const notifyVolunteer = (volunteerId, event, data) => {
  if (!io) return;
  io.to(`user:${volunteerId.toString()}`).emit(event, data);
};

/**
 * Broadcast live impact statistics update to all connected clients
 * @param {object} stats Updated metrics
 */
const broadcastDashboardUpdate = (stats) => {
  if (!io) return;
  io.emit('dashboard:updated', stats);
};

/**
 * Broadcast when a listing status changes (claimed, picked_up, expired)
 * @param {string} listingId 
 * @param {string} status 
 * @param {object} listing 
 */
const broadcastListingStatusChange = (listingId, status, listing) => {
  if (!io) return;
  io.emit('listing:status_changed', {
    listingId,
    status,
    listing,
  });
};

module.exports = {
  init: initNotificationService,
  initNotificationService,
  getIO,
  notifyNearbyRecipients,
  notifyDonor,
  notifyRecipient,
  notifyVolunteer,
  broadcastDashboardUpdate,
  broadcastListingStatusChange,
};
