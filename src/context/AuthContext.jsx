import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, logout, loginUser, registerUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyRegistered, setNewlyRegistered] = useState(false);
  const navigate = useNavigate();

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

    // Listen for unauthorized events from axios interceptor
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