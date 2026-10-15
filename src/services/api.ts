/**
 * Centralização de configuração e clientes de integração com a API Backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

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
    const errorMessage = errorBody?.error || `Erro HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

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
  email?: string;
  notes?: string;
}

export interface ProductItem {
  id: string | number;
  name: string;
  price: number | string;
  raw_price?: string;
  description?: string;
}

export interface ProductFormData {
  name: string;
  price: string;
  description?: string;
}

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
};
