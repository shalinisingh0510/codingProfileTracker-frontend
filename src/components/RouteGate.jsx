import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import PublicDashboard from '../pages/PublicDashboard';
import {
  getDashboardPath,
  getHomePath,
  getProfilePath,
  getStoredToken,
  getStoredUsername,
  isSameUsername,
} from '../utils/routes';

export const HomeRedirect = () => <Navigate to={getHomePath()} replace />;

export const LegacyDashboardRedirect = () => {
  const token = getStoredToken();
  const username = getStoredUsername();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (username) {
    return <Navigate to={getDashboardPath(username)} replace />;
  }

  return <Dashboard />;
};

export const LegacyProfileRedirect = () => {
  const token = getStoredToken();
  const username = getStoredUsername();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (username) {
    return <Navigate to={getProfilePath(username)} replace />;
  }

  return <Profile />;
};

export const UsernameDashboardRoute = () => {
  const { username } = useParams();
  const token = getStoredToken();
  const storedUsername = getStoredUsername();

  if (token && storedUsername && isSameUsername(username, storedUsername)) {
    return <Dashboard />;
  }

  return <PublicDashboard />;
};

export const UsernameProfileRoute = () => {
  const { username } = useParams();
  const token = getStoredToken();
  const storedUsername = getStoredUsername();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (storedUsername && !isSameUsername(username, storedUsername)) {
    return <Navigate to={getProfilePath(storedUsername)} replace />;
  }

  return <Profile />;
};
