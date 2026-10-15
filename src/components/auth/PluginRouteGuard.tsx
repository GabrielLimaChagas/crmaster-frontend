import React, { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { usePlugin } from "../../hooks/usePlugin";

export interface PluginRouteGuardProps {
  plugin: string;
  redirectTo?: string;
  children?: ReactNode;
}

export const PluginRouteGuard: React.FC<PluginRouteGuardProps> = ({
  plugin,
  redirectTo = "/",
  children,
}) => {
  const { hasPlugin, isLoading } = usePlugin(plugin);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-neutral-500">
            Verificando permissões do módulo...
          </span>
        </div>
      </div>
    );
  }

  if (!hasPlugin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PluginRouteGuard;
