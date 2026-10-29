const cron = require('node-cron');
const Listing = require('../models/Listing');
const notificationService = require('./notification.service');

/**
 * Initializes the automated food listing expiration cron job.
 * Scans every 5 minutes (or as configured) for listings that have passed
 * their `expires_at` timestamp and automatically updates their status to `expired`.
 */
const initExpiryCron = () => {
  const cronSchedule = process.env.CRON_EXPIRY_INTERVAL || '*/5 * * * *';

  console.log(`[Expiry Service] Initializing auto-expiry cron job (${cronSchedule})...`);

  cron.schedule(cronSchedule, async () => {
    try {
      const now = new Date();

      // Find all available listings whose expiry timestamp has passed
      const expiredListings = await Listing.find({
        status: 'available',
        expires_at: { $lte: now },
      });

      if (expiredListings.length > 0) {
        console.log(`[Expiry Service] Found ${expiredListings.length} expired listing(s). Processing...`);

        const expiredIds = expiredListings.map((l) => l._id);

        await Listing.updateMany(
          { _id: { $in: expiredIds } },
          { $set: { status: 'expired' } }
        );

        for (const listing of expiredListings) {
          notificationService.broadcastListingStatusChange(
            listing._id,
            'expired',
            { ...listing.toObject(), status: 'expired' }
          );

          notificationService.notifyDonor(listing.donor_id, 'listing:expired', {
            message: `Your food listing "${listing.food_type}" has expired without being claimed.`,
            listingId: listing._id,
          });
        }

        console.log(`[Expiry Service] Successfully marked ${expiredListings.length} listing(s) as expired.`);
      }
    } catch (error) {
      console.error(`[Expiry Service] Error running auto-expiry task:`, error.message);
    }
  });
};

module.exports = {
  startExpiryJob: initExpiryCron,
  initExpiryCron,
};
