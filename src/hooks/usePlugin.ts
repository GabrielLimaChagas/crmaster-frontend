/**
 * Hook para verificação de disponibilidade de plugins contratados pela empresa.
 */
import { useAuth } from "../contexts/AuthContext";

export interface UsePluginResult {
  hasPlugin: boolean;
  isLoading: boolean;
}

export const usePlugin = (pluginName: string): UsePluginResult => {
  const { hasPlugin, isLoading } = useAuth();

  return {
    hasPlugin: hasPlugin(pluginName),
    isLoading,
  };
};

export default usePlugin;
