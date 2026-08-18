/**
 * @file authGuard.jsx
 * @description Route protection wrapper for the SAMADHAN platform.
 * Validates the presence of a JWT token and ensures the user's role 
 * matches the required roles for the requested route.
 * Redirects unauthorized access to the appropriate portal.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AuthGuard = ({ allowedRoles }) => {
  const token = localStorage.getItem('user_token');
  const role = localStorage.getItem('user_role');

  if (!token) {
    // If not logged in, redirect to main portal
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in but does not have the required role, redirect to appropriate default page
    if (role === 'CITIZEN') {
      return <Navigate to="/citizen/file-report" replace />;
    } else if (role === 'MLA') {
      return <Navigate to="/mla/dashboard" replace />;
    } else if (role === 'MP') {
      return <Navigate to="/mp/overview" replace />;
    } else {
      return <Navigate to="/official/dashboard" replace />;
    }
  }

  return <Outlet />;
};
