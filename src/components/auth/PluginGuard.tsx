import React, { type ReactNode } from "react";
import { usePlugin } from "../../hooks/usePlugin";

export interface PluginGuardProps {
  plugin: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PluginGuard: React.FC<PluginGuardProps> = ({
  plugin,
  fallback = null,
  children,
}) => {
  const { hasPlugin, isLoading } = usePlugin(plugin);

  // Evita flashes visuais durante carregamento da sessão/empresa
  if (isLoading) {
    return null;
  }

  if (!hasPlugin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PluginGuard;
