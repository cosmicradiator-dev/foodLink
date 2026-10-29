import React, { createContext, useContext, useState, useEffect } from 'react';

const FoodLinkContext = createContext(null);

const INITIAL_LISTINGS = [
  {
    _id: 'lst-1',
    food_type: 'Cooked rice, sambar & curry',
    donor_name: 'Hostel Mess',
    servings: 50,
    status: 'available', // available | claimed | picked_up | expired
    veg_flag: true,
    food_nature: 'cooked', // 'cooked' | 'packaged'
    prepared_at: '13:39',
    expires_at: '16:39',
    expiryHoursLeft: 1.68, // ~1h 41m left
    location_name: 'Hostel Mess',
    coordinates: [76.9360, 11.0247],
    distanceKm: 0.4,
    claim: null,
  },
  {
    _id: 'lst-2',
    food_type: 'Packaged snack boxes',
    donor_name: 'Main Canteen',
    servings: 20,
    status: 'available',
    veg_flag: true,
    food_nature: 'packaged',
    prepared_at: '12:00',
    expires_at: '18:41',
    expiryHoursLeft: 3.68, // ~3h 41m left
    location_name: 'Main Canteen',
    coordinates: [76.9385, 11.0255],
    distanceKm: 1.1,
    claim: null,
  },
  {
    _id: 'lst-3',
    food_type: 'Chicken biryani',
    donor_name: 'Fest Committee',
    servings: 35,
    status: 'available',
    veg_flag: false,
    food_nature: 'cooked',
    prepared_at: '14:00',
    expires_at: '16:11',
    expiryHoursLeft: 1.18, // ~1h 11m left
    location_name: 'Fest Committee',
    coordinates: [76.9340, 11.0230],
    distanceKm: 0.7,
    claim: null,
  },
  {
    _id: 'lst-4',
    food_type: 'Sandwiches & juice',
    donor_name: 'Department Event',
    servings: 15,
    status: 'available',
    veg_flag: true,
    food_nature: 'cooked',
    prepared_at: '11:30',
    expires_at: '19:41',
    expiryHoursLeft: 4.68, // ~4h 41m left
    location_name: 'Department Event',
    coordinates: [76.9372, 11.0268],
    distanceKm: 0.9,
    claim: null,
  },
];

const INITIAL_IMPACT = {
  mealsSaved: 1250,
  kgDiverted: 410,
  claimedRate: 82,
  weeklyTrend: [
    { label: 'W1', value: 120 },
    { label: 'W2', value: 180 },
    { label: 'W3', value: 150 },
    { label: 'W4', value: 210 },
    { label: 'W5', value: 260 },
    { label: 'This wk', value: 330 },
  ],
  topDonors: [
    { name: 'Hostel Mess', count: 520, max: 600 },
    { name: 'Main Canteen', count: 310, max: 600 },
    { name: 'Fest Committee', count: 240, max: 600 },
    { name: 'Department Event', count: 180, max: 600 },
  ],
  peakHours: [
    { label: '8–10 PM', count: 90, max: 100 },
    { label: '1–3 PM', count: 70, max: 100 },
    { label: '4–6 PM', count: 45, max: 100 },
    { label: '7–9 AM', count: 30, max: 100 },
  ],
};

const INITIAL_MODERATION_ITEMS = [
  {
    id: 'mod-1',
    item: 'Green Leaf Restaurant',
    type: 'Donor verification',
    status: 'pending',
  },
  {
    id: 'mod-2',
    item: 'Hope Shelter',
    type: 'NGO verification',
    status: 'pending',
  },
  {
    id: 'mod-3',
    item: '"Free biryani 200 meals" (reported 3×)',
    type: 'Reported listing',
    status: 'pending',
  },
];

const INITIAL_VOLUNTEER_TASKS = [
  {
    id: 'vol-1',
    pickup: 'Hostel Mess',
    drop: 'Shelter',
    distance: '2.3 km',
    servings: 50,
    status: 'open', // open | assigned | completed
  },
  {
    id: 'vol-2',
    pickup: 'Canteen',
    drop: 'NGO',
    distance: '1.0 km',
    servings: 20,
    status: 'open',
  },
];

export function FoodLinkProvider({ children }) {
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('foodlink_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [impact, setImpact] = useState(() => {
    const saved = localStorage.getItem('foodlink_impact');
    return saved ? JSON.parse(saved) : INITIAL_IMPACT;
  });

  const [moderationItems, setModerationItems] = useState(() => {
    const saved = localStorage.getItem('foodlink_moderation');
    return saved ? JSON.parse(saved) : INITIAL_MODERATION_ITEMS;
  });

  const [volunteerTasks, setVolunteerTasks] = useState(() => {
    const saved = localStorage.getItem('foodlink_volunteer_tasks');
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEER_TASKS;
  });

  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('foodlink_claims');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('foodlink_role') || 'donor';
  });

  const [timeOffsetHours, setTimeOffsetHours] = useState(() => {
    return Number(localStorage.getItem('foodlink_time_offset') || 0);
  });

  useEffect(() => {
    localStorage.setItem('foodlink_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('foodlink_impact', JSON.stringify(impact));
  }, [impact]);

  useEffect(() => {
    localStorage.setItem('foodlink_moderation', JSON.stringify(moderationItems));
  }, [moderationItems]);

  useEffect(() => {
    localStorage.setItem('foodlink_volunteer_tasks', JSON.stringify(volunteerTasks));
  }, [volunteerTasks]);

  useEffect(() => {
    localStorage.setItem('foodlink_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('foodlink_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('foodlink_time_offset', timeOffsetHours);
  }, [timeOffsetHours]);

  // Fast forward 3 hours (FR12 Auto-Expiry test)
  const fastForwardHours = (hours = 3) => {
    const newOffset = timeOffsetHours + hours;
    setTimeOffsetHours(newOffset);

    setListings((prev) =>
      prev.map((item) => {
        const remaining = (item.expiryHoursLeft || 2) - hours;
        if (remaining <= 0 && item.status === 'available') {
          return {
            ...item,
            expiryHoursLeft: 0,
            status: 'expired',
          };
        }
        return {
          ...item,
          expiryHoursLeft: Math.max(0, Number(remaining.toFixed(2))),
        };
      })
    );
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setListings(INITIAL_LISTINGS);
    setImpact(INITIAL_IMPACT);
    setModerationItems(INITIAL_MODERATION_ITEMS);
    setVolunteerTasks(INITIAL_VOLUNTEER_TASKS);
    setClaims([]);
    setTimeOffsetHours(0);
    localStorage.removeItem('foodlink_listings');
    localStorage.removeItem('foodlink_impact');
    localStorage.removeItem('foodlink_moderation');
    localStorage.removeItem('foodlink_volunteer_tasks');
    localStorage.removeItem('foodlink_claims');
    localStorage.removeItem('foodlink_time_offset');
  };

  // Create Listing
  const addListing = (newListing) => {
    const listingId = `lst-${Date.now()}`;
    const entry = {
      _id: listingId,
      food_type: newListing.food_type,
      donor_name: newListing.donor_name || 'Hostel Mess',
      servings: Number(newListing.servings) || 10,
      status: 'available',
      veg_flag: Boolean(newListing.veg_flag),
      food_nature: newListing.food_nature || 'cooked',
      prepared_at: newListing.prepared_at || '13:00',
      expires_at: newListing.expires_at || '16:00',
      expiryHoursLeft: 3.0,
      location_name: newListing.location_name || newListing.address || 'Campus Mess',
      coordinates: [76.9360 + (Math.random() - 0.5) * 0.01, 11.0247 + (Math.random() - 0.5) * 0.01],
      distanceKm: 0.5,
      photo_url: newListing.photo_url || '',
      claim: null,
    };

    setListings((prev) => [entry, ...prev]);
    return entry;
  };

  // Claim Listing (FR7 Claim Locking & FR8 Pickup Code Generation)
  const claimListing = (listingId, recipientName = 'Recipient / NGO') => {
    let generatedClaim = null;

    setListings((prev) =>
      prev.map((item) => {
        if (item._id === listingId) {
          if (item.status !== 'available') {
            throw new Error('This food listing is no longer available!');
          }
          // 4-digit code matching the reference screenshot wireframe: 4 7 2 9
          const digits = Math.floor(1000 + Math.random() * 9000).toString();
          generatedClaim = {
            _id: `clm-${Date.now()}`,
            listing_id: item._id,
            listing: { ...item },
            pickup_code: digits,
            recipient_name: recipientName,
            status: 'claimed',
            claimed_at: new Date().toISOString(),
          };
          return {
            ...item,
            status: 'claimed',
            claim: generatedClaim,
          };
        }
        return item;
      })
    );

    if (generatedClaim) {
      setClaims((prev) => [generatedClaim, ...prev]);
    }
    return generatedClaim;
  };

  // Verify Pickup Code (FR8 & FR9 Handover Confirmation)
  const verifyPickupCode = (listingId, enteredCode) => {
    let matched = false;
    let servingsAdded = 0;
    let donorName = '';

    setListings((prev) =>
      prev.map((item) => {
        if (item._id === listingId) {
          if (!item.claim) {
            throw new Error('No active claim on this listing.');
          }
          if (item.claim.pickup_code.trim() !== enteredCode.trim()) {
            throw new Error('Invalid 4-digit pickup code. Please check recipient code.');
          }
          matched = true;
          servingsAdded = item.servings;
          donorName = item.donor_name;

          const updatedClaim = {
            ...item.claim,
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
          };

          return {
            ...item,
            status: 'picked_up',
            claim: updatedClaim,
          };
        }
        return item;
      })
    );

    if (!matched) {
      throw new Error('Pickup verification failed.');
    }

    // Update claim records
    setClaims((prev) =>
      prev.map((c) =>
        c.listing_id === listingId
          ? { ...c, status: 'picked_up', picked_up_at: new Date().toISOString() }
          : c
      )
    );

    // Live Impact Dashboard Update (FR15)
    setImpact((prev) => {
      const newMealsSaved = prev.mealsSaved + servingsAdded;
      const newKgDiverted = Number((prev.kgDiverted + servingsAdded * 0.35).toFixed(1));
      const updatedTopDonors = prev.topDonors.map((d) =>
        d.name.toLowerCase() === donorName.toLowerCase()
          ? { ...d, count: d.count + servingsAdded }
          : d
      );

      return {
        ...prev,
        mealsSaved: newMealsSaved,
        kgDiverted: newKgDiverted,
        topDonors: updatedTopDonors,
      };
    });

    return true;
  };

  // Cancel Claim (Release Lock)
  const cancelClaim = (listingId) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item._id === listingId) {
          return {
            ...item,
            status: item.expiryHoursLeft > 0 ? 'available' : 'expired',
            claim: null,
          };
        }
        return item;
      })
    );

    setClaims((prev) =>
      prev.map((c) =>
        c.listing_id === listingId ? { ...c, status: 'cancelled' } : c
      )
    );
  };

  // Request Volunteer Delivery
  const requestVolunteer = (claimId) => {
    const claim = claims.find((c) => c._id === claimId);
    if (!claim) return;

    const newTask = {
      id: `vol-${Date.now()}`,
      pickup: claim.listing?.donor_name || 'Campus Mess',
      drop: claim.recipient_name || 'Local Shelter',
      distance: `${(claim.listing?.distanceKm || 1.5).toFixed(1)} km`,
      servings: claim.listing?.servings || 20,
      status: 'open',
      claimId,
    };

    setVolunteerTasks((prev) => [newTask, ...prev]);
  };

  // Accept Volunteer Task
  const acceptVolunteerTask = (taskId) => {
    setVolunteerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'assigned' } : t))
    );
  };

  // Admin Moderation Actions (Figure 6)
  const handleModerationAction = (id, action) => {
    setModerationItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // Rate Experience (FR13)
  const submitRating = (claimId, score, review) => {
    setClaims((prev) =>
      prev.map((c) =>
        c._id === claimId ? { ...c, rated: true, score, review } : c
      )
    );
  };

  return (
    <FoodLinkContext.Provider
      value={{
        listings,
        impact,
        moderationItems,
        volunteerTasks,
        claims,
        currentRole,
        setCurrentRole,
        timeOffsetHours,
        fastForwardHours,
        resetDemoData,
        addListing,
        claimListing,
        verifyPickupCode,
        cancelClaim,
        requestVolunteer,
        acceptVolunteerTask,
        handleModerationAction,
        submitRating,
      }}
    >
      {children}
    </FoodLinkContext.Provider>
  );
}

export function useFoodLink() {
  const context = useContext(FoodLinkContext);
  if (!context) {
    throw new Error('useFoodLink must be used within a FoodLinkProvider');
  }
  return context;
}

