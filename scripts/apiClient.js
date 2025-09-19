// scripts/apiClient.js
const API_BASE = "https://v2.api.noroff.dev";

export function getAuth() {
  return JSON.parse(localStorage.getItem("auth") || "{}");
}

export function saveAuth(partial) {
  const cur = getAuth();
  localStorage.setItem("auth", JSON.stringify({ ...cur, ...partial }));
}

export function authHeaders() {
  const { token, apiKey } = getAuth();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers["X-Noroff-API-Key"] = apiKey;
  return headers;
}

export async function fetchJson(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });

  const text = await res.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    console.error("API error", res.status, payload);
    const msg = payload?.errors?.[0]?.message || payload?.message || `HTTP ${res.status}`;
    throw new Error(`${res.status} ${msg}`);
  }

  return payload?.data ?? payload ?? null;
}
