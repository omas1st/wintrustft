import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { me, logout, loginUser, registerUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyRegistered, setNewlyRegistered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const refreshInterval = useRef(null);
  const lastRefreshTime = useRef(Date.now());

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('wintrust_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await me();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const handleUnauthorized = () => {
      localStorage.removeItem('wintrust_token');
      setUser(null);
      setNewlyRegistered(false);
      navigate('/');
      toast.error('Session expired. Please login again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  // Refresh user on route change (dashboard, withdraw, etc.)
  useEffect(() => {
    const refreshOnNavigation = async () => {
      const token = localStorage.getItem('wintrust_token');
      if (!token || !user) return;
      // Throttle: only refresh if last refresh > 5 seconds ago
      const now = Date.now();
      if (now - lastRefreshTime.current < 5000) return;
      try {
        const data = await me();
        if (data.success && data.user) {
          const updated = data.user;
          // Check for important changes
          if (
            user.isLocked !== updated.isLocked ||
            user.hasPaidTax !== updated.hasPaidTax ||
            user.hasPaidUnfreeze !== updated.hasPaidUnfreeze ||
            user.isFrozen !== updated.isFrozen ||
            user.balance !== updated.balance
          ) {
            setUser(updated);
            lastRefreshTime.current = now;
          }
        }
      } catch (err) {
        // ignore
      }
    };
    refreshOnNavigation();
  }, [location.pathname, user]);

  // Poll for user updates every 10 seconds (faster)
  useEffect(() => {
    if (!user) return;
    refreshInterval.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('wintrust_token');
        if (!token) return;
        const data = await me();
        if (data.success && data.user) {
          const updated = data.user;
          if (
            user.isLocked !== updated.isLocked ||
            user.hasPaidTax !== updated.hasPaidTax ||
            user.hasPaidUnfreeze !== updated.hasPaidUnfreeze ||
            user.isFrozen !== updated.isFrozen ||
            user.balance !== updated.balance
          ) {
            setUser(updated);
          }
        }
      } catch (err) {
        // ignore
      }
    }, 10000); // 10 seconds

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [user]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = async () => {
      const token = localStorage.getItem('wintrust_token');
      if (!token || !user) return;
      try {
        const data = await me();
        if (data.success && data.user) {
          const updated = data.user;
          if (
            user.isLocked !== updated.isLocked ||
            user.hasPaidTax !== updated.hasPaidTax ||
            user.hasPaidUnfreeze !== updated.hasPaidUnfreeze ||
            user.isFrozen !== updated.isFrozen ||
            user.balance !== updated.balance
          ) {
            setUser(updated);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('wintrust_token');
      if (!token) return null;
      const data = await me();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const data = await loginUser(identifier, password);
      if (data.success && data.user) {
        localStorage.setItem('wintrust_token', data.token);
        setUser(data.user);
        setNewlyRegistered(false);
        return data.user;
      }
      throw new Error(data.error || 'Login failed');
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const data = await registerUser(userData);
      if (data.success && data.user) {
        localStorage.setItem('wintrust_token', data.token);
        setUser(data.user);
        setNewlyRegistered(true);
        return data.user;
      }
      throw new Error(data.error || 'Registration failed');
    } catch (err) {
      throw err;
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('wintrust_token');
      setUser(null);
      setNewlyRegistered(false);
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      navigate('/');
      toast.success('Logged out successfully');
    }
  }, [navigate]);

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout: logoutUser,
    refreshUser,
    newlyRegistered,
    setNewlyRegistered,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};