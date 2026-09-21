import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getUserFromToken(token) {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return null;
  }

  const userId =
    payload.userId ||
    payload.sub ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload.nameid ||
    null;

  const email =
    payload.email ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    '';

  const displayName =
    payload.displayName ||
    payload.name ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    email ||
    (userId ? `User ${userId.substring(0, 8)}` : 'User');

  const rawRole =
    payload.role ||
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    [];
  const roles = Array.isArray(rawRole) ? rawRole : [rawRole].filter(Boolean);

  return {
    userId,
    email,
    displayName,
    roles,
    isAdmin: roles.includes('Admin'),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('accessToken');
    return getUserFromToken(savedToken);
  });
  const [loading, setLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(() => Boolean(localStorage.getItem('accessToken')));

  const fetchUserProfile = useCallback(async (tokenUser) => {
    if (!tokenUser?.userId) {
      setUser(null);
      return null;
    }
    try {
      const profile = await authApi.getMe();
      const isAdmin = Boolean(profile?.isAdmin || profile?.roles?.includes('Admin') || tokenUser?.isAdmin);
      const mergedUser = {
        ...tokenUser,
        ...profile,
        userId: profile?.userId || profile?.id || tokenUser.userId,
        email: profile?.email || tokenUser.email,
        displayName: profile?.displayName || tokenUser.displayName,
        roles: profile?.roles || tokenUser.roles || [],
        isAdmin,
      };
      setUser(mergedUser);
      return mergedUser;
    } catch (err) {
      console.warn('[AuthContext] Profile fetch error, keeping token claims:', err.message);
      return tokenUser;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Fetch user profile on initial load if token exists
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
        const tokenUser = getUserFromToken(savedToken);
        if (tokenUser?.userId) {
          setUser(tokenUser);
          await fetchUserProfile(tokenUser);
        } else {
          logout();
        }
      }
      if (isMounted) {
        setInitialLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile, logout]);

  // Listen for unauthorized events from client.js
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken } = response;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setToken(accessToken);
      const tokenUser = getUserFromToken(accessToken);
      let finalUser = tokenUser;
      if (tokenUser?.userId) {
        setUser(tokenUser);
        const profileUser = await fetchUserProfile(tokenUser);
        if (profileUser) {
          finalUser = profileUser;
        }
      }
      return { ...response, user: finalUser };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ displayName, email, password }) => {
    setLoading(true);
    try {
      return await authApi.register({ displayName, email, password });
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file) => {
    const result = await authApi.uploadAvatar(file);
    setUser((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl } : prev));
    return result;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    initialLoading,
    login,
    register,
    logout,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
