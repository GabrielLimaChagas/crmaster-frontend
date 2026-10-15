/**
 * Serviço de Autenticação do CRMaster.
 * Gerencia comunicação de login/logout e persistência no localStorage.
 */

import { userService, companyService, type UserItem } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export interface AuthUser {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  company_id?: number;
  role: string;
  plugins?: string[];
  active_plugins?: string[];
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

const STORAGE_KEYS = {
  USER_ID: "user_id",
  NAME: "name",
  EMAIL: "email",
  COMPANY_ID: "company_id",
  ROLE: "role",
  USER_DATA: "crmaster_user",
  ACTIVE_PLUGINS: "active_plugins",
  LEGACY_COMPANY_ID: "companyId",
};

export const authService = {
  /**
   * Realiza login no backend e retorna os dados do usuário.
   * Suporta busca por /api/auth/login, /api/users/login ou fallback para listagem de usuários.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const identifier = (credentials.username || credentials.email || "").trim();
    const password = (credentials.password || "").trim();

    if (!identifier || !password) {
      throw new Error("Usuário ou senha inválidos.");
    }

    // 1. Tenta endpoint primário: /api/auth/login
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, email: identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        const rawPlugins = user.active_plugins || user.plugins || [];
        const plugins = Array.isArray(rawPlugins) ? rawPlugins : [];
        return {
          id: Number(user.id || user.user_id),
          user_id: Number(user.id || user.user_id),
          name: String(user.name || identifier),
          email: String(user.email || identifier),
          company_id: user.company_id ? Number(user.company_id) : undefined,
          role: String(user.role || "EMPLOYEE"),
          active_plugins: plugins,
          plugins,
        };
      }

      if (response.status === 401) {
        throw new Error("Usuário ou senha inválidos.");
      }
    } catch (err: any) {
      if (err.message === "Usuário ou senha inválidos.") {
        throw err;
      }
      // Se não for erro 401, continua para os fallbacks
    }

    // 2. Tenta endpoint alternativo: /api/users/login
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, email: identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        const rawPlugins = user.active_plugins || user.plugins || [];
        const plugins = Array.isArray(rawPlugins) ? rawPlugins : [];
        return {
          id: Number(user.id || user.user_id),
          user_id: Number(user.id || user.user_id),
          name: String(user.name || identifier),
          email: String(user.email || identifier),
          company_id: user.company_id ? Number(user.company_id) : undefined,
          role: String(user.role || "EMPLOYEE"),
          active_plugins: plugins,
          plugins,
        };
      }

      if (response.status === 401) {
        throw new Error("Usuário ou senha inválidos.");
      }
    } catch (err: any) {
      if (err.message === "Usuário ou senha inválidos.") {
        throw err;
      }
    }

    // 3. Fallback: Validação via lista de usuários cadastrados
    try {
      const users = await userService.getAll();
      const matched = users.find(
        (u: UserItem) =>
          u.email.toLowerCase() === identifier.toLowerCase() ||
          u.name.toLowerCase() === identifier.toLowerCase()
      );

      if (!matched) {
        throw new Error("Usuário ou senha inválidos.");
      }

      let activePlugins: string[] = matched.active_plugins || matched.plugins || [];
      if (activePlugins.length === 0 && matched.company_id) {
        try {
          const comp = await companyService.getById(matched.company_id);
          activePlugins = comp.active_plugins || (comp.plugins ? comp.plugins.map(p => p.name) : []);
        } catch {
          // Mantém vazio se falhar
        }
      }

      // Se encontrado na lista de usuários cadastrados
      return {
        id: matched.id,
        user_id: matched.id,
        name: matched.name,
        email: matched.email,
        company_id: matched.company_id,
        role: matched.role || "EMPLOYEE",
        active_plugins: activePlugins,
        plugins: activePlugins,
      };
    } catch (err: any) {
      if (err.message === "Usuário ou senha inválidos.") {
        throw err;
      }
      throw new Error("Não foi possível concluir a ação. Tente novamente.");
    }
  },

  /**
   * Salva os dados do usuário no localStorage.
   */
  saveSession(user: AuthUser): void {
    const userId = String(user.id ?? user.user_id ?? "");
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    localStorage.setItem(STORAGE_KEYS.NAME, user.name || "");
    localStorage.setItem(STORAGE_KEYS.EMAIL, user.email || "");
    if (user.company_id !== undefined && user.company_id !== null) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_ID, String(user.company_id));
      localStorage.setItem(STORAGE_KEYS.LEGACY_COMPANY_ID, String(user.company_id));
    }
    localStorage.setItem(STORAGE_KEYS.ROLE, user.role || "EMPLOYEE");
    const plugins = user.active_plugins || user.plugins || [];
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLUGINS, JSON.stringify(plugins));
    localStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify({
        ...user,
        active_plugins: plugins,
        plugins,
      })
    );
  },

  /**
   * Remove todos os dados de autenticação do localStorage.
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.NAME);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_ID);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_COMPANY_ID);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLUGINS);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // Notifica backend de logout em segundo plano (se suportado)
    fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" }).catch(() => {});
  },

  /**
   * Recupera a sessão atual armazenada no localStorage.
   */
  getStoredSession(): AuthUser | null {
    let fallbackPlugins: string[] = [];
    const storedPlugins = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLUGINS);
    if (storedPlugins) {
      try {
        const parsed = JSON.parse(storedPlugins);
        if (Array.isArray(parsed)) fallbackPlugins = parsed;
      } catch {}
    }

    const rawUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (rawUserData) {
      try {
        const parsed = JSON.parse(rawUserData);
        if (parsed && (parsed.id || parsed.user_id || parsed.email)) {
          const plugins = parsed.active_plugins || parsed.plugins || fallbackPlugins;
          return {
            id: Number(parsed.id || parsed.user_id),
            user_id: Number(parsed.id || parsed.user_id),
            name: parsed.name || "",
            email: parsed.email || "",
            company_id: parsed.company_id ? Number(parsed.company_id) : undefined,
            role: parsed.role || "EMPLOYEE",
            active_plugins: Array.isArray(plugins) ? plugins : [],
            plugins: Array.isArray(plugins) ? plugins : [],
          };
        }
      } catch {
        // Ignora erro de parse
      }
    }

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
    const name = localStorage.getItem(STORAGE_KEYS.NAME);
    const companyId = localStorage.getItem(STORAGE_KEYS.COMPANY_ID);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (userId || email) {
      return {
        id: userId ? Number(userId) : 0,
        user_id: userId ? Number(userId) : 0,
        name: name || "",
        email: email || "",
        company_id: companyId && !isNaN(Number(companyId)) ? Number(companyId) : undefined,
        role: role || "EMPLOYEE",
        active_plugins: fallbackPlugins,
        plugins: fallbackPlugins,
      };
    }

    return null;
  },

  /**
   * Verifica se há sessão ativa salva.
   */
  isAuthenticated(): boolean {
    const session = this.getStoredSession();
    return Boolean(session && (session.id || session.user_id || session.email));
  },
};
