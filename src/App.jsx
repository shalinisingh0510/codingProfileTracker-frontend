import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import AiReportPage from './pages/AiReportPage';
import LatestAiReportPage from './pages/LatestAiReportPage';
import LibraryPage from './pages/LibraryPage';
import TcsNqtGuidePage from './pages/TcsNqtGuidePage';
import TcsNqtTopicPage from './pages/TcsNqtTopicPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
      <div className="flex flex-col min-h-screen">
        <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:slug" element={<ResourceDetailPage />} />
        <Route path="/exam-guide/tcs-nqt" element={<TcsNqtGuidePage />} />
        <Route path="/exam-guide/tcs-nqt/:sectionSlug/:topicSlug" element={<TcsNqtTopicPage />} />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-report/latest"
          element={
            <ProtectedRoute>
              <LatestAiReportPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ai-report/:id" 
          element={
            <ProtectedRoute>
              <AiReportPage />
            </ProtectedRoute>
          } 
        />
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
      <Footer />
      </div>
    </Router>
  );
}

export default App;
