const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getStoredUser(): { id: number; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: { id: number; email: string }): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem("user");
}

function parseApiError(error: Record<string, unknown>): string {
  if (typeof error.detail === "string") return error.detail;

  const messages: string[] = [];
  for (const value of Object.values(error)) {
    if (typeof value === "string") {
      messages.push(value);
    } else if (Array.isArray(value)) {
      messages.push(...value.map(String));
    }
  }

  return messages[0] || "Something went wrong";
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401 && authenticated) {
      clearTokens();
      clearStoredUser();
    }
    throw new Error(parseApiError(error));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  register: (email: string, password: string) =>
    request<import("./types").AuthResponse>(
      "/auth/register/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ),

  login: (email: string, password: string) =>
    request<import("./types").AuthResponse>(
      "/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ),

  getCategories: () =>
    request<import("./types").Category[]>("/categories/"),

  getNotes: (categoryId?: number) => {
    const params = categoryId ? `?category=${categoryId}` : "";
    return request<import("./types").Note[]>(`/notes${params}`);
  },

  getNote: (id: number) =>
    request<import("./types").Note>(`/notes/${id}/`),

  createNote: (categoryId?: number) =>
    request<import("./types").Note>("/notes/", {
      method: "POST",
      body: JSON.stringify(categoryId ? { category_id: categoryId } : {}),
    }),

  updateNote: (
    id: number,
    data: Partial<{ title: string; content: string; category_id: number }>
  ) =>
    request<import("./types").Note>(`/notes/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
