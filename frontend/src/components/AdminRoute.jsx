import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('ADMIN')) {
    toast.error('Access Denied. Administrator privileges required.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
