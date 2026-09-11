const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type User = { id: number; email: string; full_name: string | null };
export type Account = {
  id: number;
  name: string;
  account_type: string;
  currency: string;
  balance: number;
  created_at: string;
};
export type Transaction = {
  id: number;
  account_id: number;
  category_id: number | null;
  amount: number;
  kind: string;
  description: string | null;
  occurred_on: string;
  created_at: string;
};
export type Category = { id: number; name: string; kind: string };
export type Summary = {
  total_balance: number;
  month_income: number;
  month_expense: number;
  accounts_count: number;
};

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
export function setToken(t: string) {
  localStorage.setItem("token", t);
}
export function clearToken() {
  localStorage.removeItem("token");
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (opts.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function register(email: string, password: string, full_name?: string) {
  return req<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  return req<User>("/auth/me");
}
export async function listAccounts() {
  return req<Account[]>("/accounts/");
}
export async function createAccount(data: {
  name: string;
  account_type?: string;
  balance?: number;
}) {
  return req<Account>("/accounts/", { method: "POST", body: JSON.stringify(data) });
}
export async function listTransactions() {
  return req<Transaction[]>("/transactions/");
}
export async function createTransaction(data: {
  account_id: number;
  amount: number;
  kind: string;
  category_id?: number;
  description?: string;
  occurred_on: string;
}) {
  return req<Transaction>("/transactions/", { method: "POST", body: JSON.stringify(data) });
}
export async function listCategories() {
  return req<Category[]>("/categories/");
}
export async function getSummary() {
  return req<Summary>("/reports/summary");
}
