/**
 * Centralização de configuração e clientes de integração com a API Backend.
 * Backend URL: http://127.0.0.1:5000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export function sanitizeUserMessage(msg?: string): string {
  if (!msg) return "Não foi possível concluir a ação. Tente novamente.";
  if (msg.includes("Venda finalizada via Facade") || msg.includes("SaleCheckoutFacade")) {
    return "Venda concluída com sucesso!";
  }
  if (msg.includes("Empresa provisionada via CompanyOnboardingFacade") || msg.includes("CompanyOnboardingFacade")) {
    return "Empresa cadastrada com sucesso!";
  }
  if (msg.includes("Template Method executado") || msg.includes("Template Method")) {
    return "Arquivo importado/exportado com sucesso.";
  }
  if (
    msg.includes("/api") ||
    msg.includes("HTTP ") ||
    msg.includes("Erro HTTP") ||
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError")
  ) {
    return "Não foi possível concluir a ação. Tente novamente.";
  }
  return msg;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const rawError = errorBody?.error || errorBody?.message || "";
    const errorMessage = sanitizeUserMessage(rawError);
    throw new Error(errorMessage);
  }

  return response.json();
}

export interface ImportReport {
  success: boolean;
  total_read?: number;
  imported_count?: number;
  failed_count?: number;
  errors?: Array<{ row?: number | null; error: string; data?: any }>;
  error?: string;
  message?: string;
}

async function uploadFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const rawError = errorBody?.error || errorBody?.message || "";
    const errorMessage = sanitizeUserMessage(rawError);
    throw new Error(errorMessage);
  }

  return response.json();
}

async function downloadFileBlob(endpoint: string, defaultFilename: string): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const rawError = errorBody?.error || errorBody?.message || "";
    const errorMessage = sanitizeUserMessage(rawError);
    throw new Error(errorMessage);
  }

  const disposition = response.headers.get("Content-Disposition");
  let filename = defaultFilename;
  if (disposition) {
    const filenameMatch = disposition.match(/filename=["']?([^"';]+)["']?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].trim();
    }
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

/* ==========================================================================
   Enums & Constants
   ========================================================================== */

export const PIPELINE_STEPS = [
  { value: "PROPSECTING", label: "Prospecção" },
  { value: "PREPARATION", label: "Preparação" },
  { value: "APPROACH", label: "Abordagem" },
  { value: "PRESENTATION", label: "Apresentação" },
  { value: "HANDLING_OBJECTIONS", label: "Negociação de Objeções" },
  { value: "CLOSING", label: "Fechamento / Ganho" },
  { value: "FOLLOW_UP", label: "Pós-Venda / Acompanhamento" },
] as const;

export type PipelineStepValue = typeof PIPELINE_STEPS[number]["value"];

/* ==========================================================================
   Customers
   ========================================================================== */

export interface CustomerItem {
  id: string | number;
  name: string;
  birth?: string;
  phone?: string;
  cel?: string;
  email?: string;
  notes?: string;
  address?: string;
  company_id?: number;
  pipelinesCount?: number;
}

export interface CustomerFormData {
  name: string;
  birth?: string;
  phone?: string;
  cel?: string;
  email?: string;
  notes?: string;
  address?: string;
  company_id?: number;
}

export const importCustomers = async (
  file: File,
  companyId: number
): Promise<ImportReport> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company_id", String(companyId));
  return uploadFormData<ImportReport>("/customers/import", formData);
};

export const exportCustomers = async (
  format: "csv" | "json",
  companyId: number
): Promise<void> => {
  return downloadFileBlob(
    `/customers/export?format=${format}&company_id=${companyId}`,
    `clientes.${format}`
  );
};

export const customerService = {
  getAll: () => request<CustomerItem[]>("/customers"),
  getById: (id: string | number) => request<CustomerItem>(`/customers/${id}`),
  create: (data: CustomerFormData) =>
    request<{ success: boolean; customer: CustomerItem }>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: CustomerFormData) =>
    request<{ success: boolean; customer: CustomerItem }>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<{ success: boolean; message?: string }>(`/customers/${id}`, {
      method: "DELETE",
    }),
  import: (file: File, companyId: number) => importCustomers(file, companyId),
  export: (format: "csv" | "json", companyId: number) =>
    exportCustomers(format, companyId),
};

/* ==========================================================================
   Products
   ========================================================================== */

export interface ProductItem {
  id: string | number;
  name: string;
  price: number | string;
  numeric_price?: number;
  raw_price?: string;
  description?: string;
}

export interface ProductFormData {
  name: string;
  price: string;
  description?: string;
}

export const importProducts = async (
  file: File
): Promise<ImportReport> => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFormData<ImportReport>("/products/import", formData);
};

export const exportProducts = async (
  format: "csv" | "json"
): Promise<void> => {
  return downloadFileBlob(
    `/products/export?format=${format}`,
    `produtos.${format}`
  );
};

export const productService = {
  getAll: () => request<ProductItem[]>("/products"),
  getById: (id: string | number) => request<ProductItem>(`/products/${id}`),
  create: (data: ProductFormData) =>
    request<{ success: boolean; product: ProductItem }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: ProductFormData) =>
    request<{ success: boolean; product: ProductItem }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    request<{ success: boolean; message?: string }>(`/products/${id}`, {
      method: "DELETE",
    }),
  import: (file: File) => importProducts(file),
  export: (format: "csv" | "json") => exportProducts(format),
};

/* ==========================================================================
   Users / Colaboradores
   ========================================================================== */

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id?: number;
}

export const userService = {
  getAll: (company_id?: number) =>
    request<UserItem[]>(company_id ? `/users?company_id=${company_id}` : "/users"),
  getById: (id: number | string) => request<UserItem>(`/users/${id}`),
  update: (id: number | string, data: Partial<UserItem>) =>
    request<{ success: boolean; user: UserItem }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ==========================================================================
   Plugins
   ========================================================================== */

export interface PluginItem {
  id: number;
  name: string;
}

export const pluginService = {
  getAll: () => request<PluginItem[]>("/plugins"),
};

/* ==========================================================================
   Companies & Onboarding
   ========================================================================== */

export interface CompanyItem {
  id: number;
  name: string;
  cnpj: string;
  campany_id?: number | null;
  plugins?: PluginItem[];
  plugin_ids?: number[];
}

export interface OnboardingPayload {
  company_name: string;
  cnpj: string;
  user_name: string;
  user_email: string;
  password: string;
  plugin_ids: number[];
}

export const companyService = {
  getAll: () => request<CompanyItem[]>("/companies"),
  getById: (id: number | string) => request<CompanyItem>(`/companies/${id}`),
  update: (id: number | string, data: { name?: string; company_name?: string; cnpj?: string }) =>
    request<{ success: boolean; company: CompanyItem }>(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPlugins: (id: number | string) => request<PluginItem[]>(`/companies/${id}/plugins`),
  onboard: (payload: OnboardingPayload) =>
    request<{ success: boolean; company: any; user: any; plugins: string[] }>("/companies/onboard", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

/* ==========================================================================
   Notifications
   ========================================================================== */

export interface NotificationItem {
  id: string | number;
  company_id?: number;
  recipient?: string;
  title?: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
}

export interface NotificationFormData {
  title?: string;
  content: string;
  createdAt?: string;
  recipient?: string;
  company_id?: number;
}

export const notificationService = {
  getAll: (company_id?: number | string) =>
    request<NotificationItem[]>(
      company_id ? `/notifications?company_id=${company_id}` : "/notifications"
    ),
  getById: (id: string | number) =>
    request<NotificationItem>(`/notifications/${id}`),
  create: (data: NotificationFormData) =>
    request<{ success: boolean; notification: NotificationItem }>(
      "/notifications",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  delete: (id: string | number) =>
    request<{ success: boolean; message?: string }>(`/notifications/${id}`, {
      method: "DELETE",
    }),
  clearAll: (companyId?: number | string) =>
    request<{ success: boolean; message?: string }>(
      companyId ? `/notifications?company_id=${companyId}` : "/notifications/clear",
      {
        method: "DELETE",
      }
    ),
  clearCompany: (companyId: number | string) =>
    request<{ success: boolean; message?: string }>(
      `/notifications?company_id=${companyId}`,
      {
        method: "DELETE",
      }
    ),
};

export const getNotifications = (companyId?: number | string) =>
  notificationService.getAll(companyId);

export const deleteNotification = (id: number | string) =>
  notificationService.delete(id);

export const clearCompanyNotifications = (companyId: number | string) =>
  notificationService.clearCompany(companyId);

/* ==========================================================================
   Pipelines (Orçamentos / Funil de Vendas / Vendas)
   ========================================================================== */

export interface PipelineProductItem {
  id?: string | number;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  price?: number | string;
  quantidade: number;
  subtotal?: number | string;
}

export interface PipelineItem {
  id: string | number;
  customer_id?: string | number | null;
  customer_name?: string;
  client?: string;
  customer?: CustomerItem | null;
  employee_id?: string | number | null;
  employee_name?: string;
  employee?: UserItem | null;
  step: string;
  date?: string;
  note?: string;
  total?: number;
  productsCount?: number;
  products_count?: number;
  items?: PipelineProductItem[];
  sale_products?: PipelineProductItem[];
}

export interface PipelineFormData {
  customer_id?: string | number | null;
  employee_id?: string | number | null;
  step?: string;
  date?: string;
  note?: string;
  notes?: string;
  client?: string;
  products?: { product_id?: string | number; id?: string | number; quantidade: number }[];
}

export const pipelineService = {
  getAll: (params?: { step?: string; status?: string }) => {
    let endpoint = "/pipelines";
    if (params?.step || params?.status) {
      const q = params.step || params.status;
      endpoint += `?step=${encodeURIComponent(q!)}`;
    }
    return request<PipelineItem[]>(endpoint);
  },
  getById: (id: string | number) => request<PipelineItem>(`/pipelines/${id}`),
  create: (data: PipelineFormData) =>
    request<{ success: boolean; pipeline: PipelineItem }>("/pipelines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: PipelineFormData) =>
    request<{ success: boolean; pipeline: PipelineItem }>(`/pipelines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  close: (id: string | number, note?: string) =>
    request<{ success: boolean; message: string; pipeline_id: number }>(`/pipelines/${id}/close`, {
      method: "POST",
      body: JSON.stringify({ note: note || "Fechamento realizado pela interface" }),
    }),
  delete: (id: string | number) =>
    request<{ success: boolean; message?: string }>(`/pipelines/${id}`, {
      method: "DELETE",
    }),
};

// Aliases para compatibilidade total
export const preSaleService = pipelineService;
export type PreSaleItem = PipelineItem;
export type PreSaleFormData = PipelineFormData;
export type PreSaleProductItem = PipelineProductItem;

export const saleService = pipelineService;
export type SaleItem = PipelineItem;
export type SaleFormData = PipelineFormData;
export type SaleProductItem = PipelineProductItem;

export const budgetService = pipelineService;
export type BudgetItem = PipelineItem;
export type BudgetFormData = PipelineFormData;

/* ==========================================================================
   Profile
   ========================================================================== */

export interface ProfileData {
  userName: string;
  companyName: string;
  email?: string;
  cnpj?: string;
  userId?: number;
  companyId?: number;
  plugins?: PluginItem[];
}

export const profileService = {
  get: async (): Promise<ProfileData> => {
    // Busca dados reais de empresas e usuários do backend
    const [companies, users] = await Promise.all([
      companyService.getAll().catch(() => []),
      userService.getAll().catch(() => []),
    ]);

    const company = companies[0] || { id: 1, name: "CRMaster", cnpj: "00.000.000/0001-00", plugins: [] };
    const user = users[0] || { id: 1, name: "Usuário Admin", email: "admin@crmaster.com", role: "COMPANY" };

    return {
      userName: user.name,
      companyName: company.name,
      email: user.email,
      cnpj: company.cnpj,
      userId: user.id,
      companyId: company.id,
      plugins: company.plugins || [],
    };
  },
  update: async (data: Partial<ProfileData>): Promise<{ success: boolean }> => {
    const promises: Promise<any>[] = [];
    if (data.userId && (data.userName || data.email)) {
      promises.push(
        userService.update(data.userId, {
          name: data.userName,
          email: data.email,
        })
      );
    }
    if (data.companyId && (data.companyName || data.cnpj)) {
      promises.push(
        companyService.update(data.companyId, {
          company_name: data.companyName,
          cnpj: data.cnpj,
        })
      );
    }
    await Promise.all(promises);
    return { success: true };
  },
};
