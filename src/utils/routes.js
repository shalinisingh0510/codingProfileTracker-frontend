export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem('token');

export const getStoredUsername = () => {
  const username = getStoredUser()?.username;
  return typeof username === 'string' && username.trim() ? username.trim() : '';
};

export const getDashboardPath = (username) =>
  username ? `/${username}/dashboard` : '/dashboard';

export const getProfilePath = (username) =>
  username ? `/${username}/profile` : '/profile';

export const getHomePath = () => {
  const token = getStoredToken();
  const username = getStoredUsername();

  if (!token) {
    return '/login';
  }

  return getDashboardPath(username);
};

export const isSameUsername = (left, right) =>
  String(left || '').toLowerCase() === String(right || '').toLowerCase();
