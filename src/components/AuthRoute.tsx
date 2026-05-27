import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="app-surface flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-soft">
        <Loader2 size={18} className="animate-spin" />
        Checking session...
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { isReady, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <AuthLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return <AuthLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
