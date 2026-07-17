import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, userService } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth states from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          
          // Optionally sync profile from backend to ensure data integrity
          const profile = await userService.getMe();
          if (profile.success && profile.data) {
            setUser(profile.data);
            localStorage.setItem('user', JSON.stringify(profile.data));
          }
        } catch (err) {
          console.warn("Could not sync user profile or initialize auth on startup", err);
          // Clear potentially corrupt data to recover gracefully
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { accessToken, user: userData } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        toast.success(`Welcome back, ${userData.firstName}!`);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      if (res.success && res.data) {
        const { accessToken, user: userData } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        toast.success(`Welcome to Home4Pet, ${userData.firstName}!`);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check details.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Successfully logged out.');
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    hasRole,
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
