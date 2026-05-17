import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import {
  HomeRedirect,
  LegacyDashboardRedirect,
  LegacyProfileRedirect,
  UsernameDashboardRoute,
  UsernameProfileRoute,
} from './components/RouteGate';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<LegacyDashboardRedirect />} />
        <Route path="/profile" element={<LegacyProfileRedirect />} />
        <Route 
          path="/:username/profile" 
          element={
            <ProtectedRoute>
              <UsernameProfileRoute />
            </ProtectedRoute>
          } 
        />
        <Route path="/:username/dashboard" element={<UsernameDashboardRoute />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
