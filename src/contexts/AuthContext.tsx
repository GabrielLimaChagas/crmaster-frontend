import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { authService, type AuthUser } from "../services/auth";
import { companyService } from "../services/api";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";

export function normalizePluginName(plugin: string): string {
  const norm = (plugin || "").toLowerCase().trim();
  if (
    norm === "notifications" ||
    norm === "notificacoes" ||
    norm === "notifications_plugin" ||
    norm === "notificacoes_plugin"
  ) {
    return "notifications_plugin";
  }
  if (
    norm === "import_export" ||
    norm === "import_export_plugin" ||
    norm === "importacao_exportacao" ||
    norm === "importacao_exportacao_plugin"
  ) {
    return "import_export_plugin";
  }
  return norm;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activePlugins: string[];
  hasPlugin: (pluginName: string) => boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  refreshPlugins: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Carrega sessão salva no localStorage e sincroniza plugins na inicialização
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredSession();
      if (!storedUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(storedUser);

      // Garante sincronização de plugins com o backend caso haja company_id
      if (storedUser.company_id) {
        try {
          const company = await companyService.getById(storedUser.company_id);
          const rawPlugins =
            company.active_plugins ||
            (company.plugins ? company.plugins.map((p) => p.name) : []);
          const plugins = Array.isArray(rawPlugins) ? rawPlugins : [];
          const updatedUser: AuthUser = {
            ...storedUser,
            active_plugins: plugins,
            plugins,
          };
          authService.saveSession(updatedUser);
          setUser(updatedUser);
        } catch {
          // Mantém plugins já presentes em storedUser se houver falha de rede
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: AuthUser) => {
    const plugins = userData.active_plugins || userData.plugins || [];
    const normalizedUser = {
      ...userData,
      active_plugins: plugins,
      plugins,
    };
    authService.saveSession(normalizedUser);
    setUser(normalizedUser);
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    navigate(`/${NAVIGATION_ROUTES.LOGIN}`, { replace: true });
  };

  const activePlugins = user?.active_plugins || user?.plugins || [];

  const hasPlugin = (pluginName: string): boolean => {
    if (!user || !pluginName) return false;
    const target = normalizePluginName(pluginName);
    return activePlugins.some((p) => normalizePluginName(p) === target);
  };

  const refreshPlugins = async (): Promise<string[]> => {
    if (!user?.company_id) return [];
    try {
      const company = await companyService.getById(user.company_id);
      const rawPlugins =
        company.active_plugins ||
        (company.plugins ? company.plugins.map((p) => p.name) : []);
      const plugins = Array.isArray(rawPlugins) ? rawPlugins : [];
      const updatedUser: AuthUser = {
        ...user,
        active_plugins: plugins,
        plugins,
      };
      authService.saveSession(updatedUser);
      setUser(updatedUser);
      return plugins;
    } catch {
      return activePlugins;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    activePlugins,
    hasPlugin,
    login,
    logout,
    refreshPlugins,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;

