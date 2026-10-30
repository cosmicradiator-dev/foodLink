import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FoodLinkProvider, useFoodLink } from './context/FoodLinkContext';
import Spinner from './components/ui/Spinner';

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

// Protected route wrapper - uses FoodLinkContext currentUser
function ProtectedRoute({ children, allowedRole }) {
  const { currentUser } = useFoodLink();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && currentUser.role !== allowedRole) {
    // Redirect to their correct dashboard
    if (currentUser.role === 'donor') return <Navigate to="/donor/create" replace />;
    if (currentUser.role === 'recipient') return <Navigate to="/recipient/map" replace />;
    if (currentUser.role === 'volunteer') return <Navigate to="/volunteer" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Landing defaultTab="login" />} />
        <Route path="/register" element={<Landing defaultTab="register" />} />

        {/* Donor routes */}
        <Route path="/donor" element={<ProtectedRoute allowedRole="donor"><Navigate to="/donor/create" replace /></ProtectedRoute>} />
        <Route path="/donor/create" element={<ProtectedRoute allowedRole="donor"><CreateListing /></ProtectedRoute>} />
        <Route path="/donor/listings" element={<ProtectedRoute allowedRole="donor"><CreateListing /></ProtectedRoute>} />
        <Route path="/donate" element={<Navigate to="/donor/create" replace />} />

        {/* Recipient routes */}
        <Route path="/recipient" element={<ProtectedRoute allowedRole="recipient"><Navigate to="/recipient/map" replace /></ProtectedRoute>} />
        <Route path="/recipient/map" element={<ProtectedRoute allowedRole="recipient"><NearbyMap /></ProtectedRoute>} />
        <Route path="/nearby" element={<Navigate to="/recipient/map" replace />} />
        <Route path="/recipient/claims" element={<ProtectedRoute allowedRole="recipient"><MyClaims /></ProtectedRoute>} />

        {/* Volunteer routes */}
        <Route path="/volunteer" element={<ProtectedRoute allowedRole="volunteer"><VolunteerDashboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Shared - accessible to all logged-in users */}
        <Route path="/dashboard" element={<ImpactDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <FoodLinkProvider>
      <AppRoutes />
    </FoodLinkProvider>
  );
}
