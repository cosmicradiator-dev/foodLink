import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FoodLinkProvider } from './context/FoodLinkContext';
import Spinner from './components/ui/Spinner';

// Lazy-loaded pages matching the design document
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreateListing = lazy(() => import('./pages/donor/CreateListing'));
const MyListings = lazy(() => import('./pages/donor/MyListings'));
const NearbyMap = lazy(() => import('./pages/recipient/NearbyMap'));
const MyClaims = lazy(() => import('./pages/recipient/MyClaims'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ImpactDashboard = lazy(() => import('./pages/shared/ImpactDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <FoodLinkProvider>
      <Suspense
        fallback={
          <div className="full-page-center" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Screen 1: Figure 1 Login / Register */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Screen 2: Figure 2 Donor Create Listing */}
          <Route path="/donor" element={<Navigate to="/donor/create" replace />} />
          <Route path="/donor/create" element={<CreateListing />} />
          <Route path="/donor/listings" element={<CreateListing />} />
          <Route path="/donate" element={<Navigate to="/donor/create" replace />} />

          {/* Screen 3 & 4: Figure 3 & 4 Recipient Nearby Map and Claims */}
          <Route path="/recipient" element={<Navigate to="/recipient/map" replace />} />
          <Route path="/recipient/map" element={<NearbyMap />} />
          <Route path="/nearby" element={<Navigate to="/recipient/map" replace />} />
          <Route path="/recipient/claims" element={<MyClaims />} />

          {/* Screen 5: Figure 5 Volunteer Tasks */}
          <Route path="/volunteer" element={<VolunteerDashboard />} />

          {/* Screen 6: Figure 6 Admin Moderation */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Screen 7: Figure 7 Impact Dashboard */}
          <Route path="/dashboard" element={<ImpactDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </FoodLinkProvider>
  );
}
