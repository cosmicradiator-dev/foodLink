# FoodLink – A Surplus Food Redistribution System

> **PSG COLLEGE OF TECHNOLOGY, COIMBATORE – 641 004**  
> **DEPARTMENT OF COMPUTER APPLICATIONS**  
> **Academic Year 2026–2027 | 26MX17 WEB APPLICATION DEVELOPMENT**

| Team No. & Name | Roll No. | Student Name | Faculty Guide |
|---|---|---|---|
| **Team 1** | 26MX128 | Yajat Dev | **Dr. A. Sankar** |
| | 26MX205 | Haresh S | |
| | 26MX101 | Agilesh N V | |

---

## 🌟 Overview

**FoodLink** is a web-based Surplus Food Redistribution System that connects donors who have extra edible food with people who can use it before the food spoils.

- **Donors** (hostel messes, canteens, fest/event organisers, restaurants) list surplus food with its quantity, food category (Veg/Non-veg), nature (Freshly cooked/Packaged), preparation time, expiration time, and pickup location.
- **Recipients & NGOs** see available food on an interactive map, claim it in real-time, and collect it using a **4-digit confirmation code**.
- **Student Volunteers** accept pickup-to-drop tasks to deliver surplus food.
- **Administrators** verify donor and NGO entities, handle safety reports, and moderate listings.
- **Live Impact Dashboard** displays total meals saved, kilograms diverted, weekly trends, top donors, and peak waste hours.

---

## 🚀 Key Functional Features (FR1 – FR15)

1. **Role-Based Authentication**: Custom workflows for Donor, Recipient/NGO, Volunteer, and Admin.
2. **Surplus Food Listing**: Donors specify servings, veg/non-veg flag, freshly cooked vs. packaged nature, prepared time, expiry window, pickup landmark, and photo.
3. **Smart Ranking**:
   $$\text{Score} = 0.4 \times \text{proximity} + 0.4 \times \text{urgency} + 0.2 \times \text{quantity fit}$$
4. **Interactive Leaflet Map**: Displays current user location and active surplus food pins with popup dish details.
5. **Atomic Claim Locking**: Guarantees that two recipients cannot claim the same food listing simultaneously.
6. **4-Digit Pickup Verification Code**: Generates a secure 4-digit code (e.g. `4 7 2 9`) presented to the donor upon handover.
7. **Automated Expiry & Demo Fast-Forward**: Listings past their expiration automatically transition to `expired`. Includes a `[ ▶ Fast-forward 3 hours ]` demo control.
8. **Volunteer Task Dispatch**: Open delivery requests connecting mess pickups to shelter drop points.
9. **Safety Moderation Console**: Admin approval and rejection workflow for donors and NGOs, with 1-click removal of reported listings.
10. **Dynamic Impact Dashboard**: Live metrics tracking meals saved, kg diverted, weekly trend bar chart, top donors, and peak waste hours.

---

## 🖥️ Screen Prototypes Recreated

- **Screen 1**: Login / Register (2-column layout with feature badges and role radio buttons)
- **Screen 2**: Donor: Add Surplus Food & My Listings with 4-digit verification and demo controls
- **Screen 3**: Recipient: Nearby Listings Map & Smart Ranked Food Cards
- **Screen 4**: Claim Details and 4-Digit Pickup Code Card (`[4] [7] [2] [9]`)
- **Screen 5**: Volunteer Tasks (Open Delivery Requests & In-Transit Status)
- **Screen 6**: Admin Moderation Console (Approve/Reject Donors & Remove Fake Listings)
- **Screen 7**: Live Impact Dashboard (Meals Saved, Kg Diverted, Weekly Bar Chart, Top Donors, Peak Hours)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Leaflet & React-Leaflet, Axios, React Toastify |
| **Backend** | Node.js, Express.js, Socket.io, JWT, bcryptjs, express-validator |
| **Database** | MongoDB with 2dsphere Geospatial Index (with zero-dependency fallback for standalone demos) |
| **Hosting** | Vercel (Frontend & SPA Rewrites) |

---

## ⚡ Deployment to Vercel

This repository is pre-configured with `vercel.json` for **1-click deployment** on Vercel:

### Option 1: Import via Vercel Dashboard (Recommended)
1. Push this repository to your GitHub account (`foodLink`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select the `foodLink` repository.
4. **Keep all default settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build --workspace=frontend` (automatically read from `vercel.json`)
   - **Output Directory**: `frontend/dist`
5. Click **Deploy**. Vercel will build and publish your app with working SPA routes!

### Option 2: Deploy using Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 💻 Running Locally

### 1. Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Start the Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. (Optional) Start the Express Backend Server
```bash
npm run start
```
Runs the Express API on port `5000` with health check at [http://localhost:5000/health](http://localhost:5000/health).

---

## 👥 Contributors

- **Yajat Dev** (26MX128)
- **Haresh S** (26MX205)
- **Agilesh N V** (26MX101)
- **Faculty Guide**: Dr. A. Sankar, Department of Computer Applications, PSG College of Technology

