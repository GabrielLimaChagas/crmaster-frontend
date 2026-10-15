import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { NAVIGATION_ROUTES } from "../../consts/navigationRoutes";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-neutral-600">Verificando sessão...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${NAVIGATION_ROUTES.LOGIN}`} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
