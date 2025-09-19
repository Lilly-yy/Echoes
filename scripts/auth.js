// scripts/auth.js
import { fetchJson, saveAuth, getAuth } from "./apiClient.js";

const REGISTER_PATH = "/auth/register";
const LOGIN_PATH    = "/auth/login";
const API_KEY_PATH  = "/auth/create-api-key";

/* ---------------- Email validation ---------------- */
export function isNoroffEmail(email) {
  return /@(?:stud\.)?noroff\.no$/i.test(String(email || "").trim());
}

/* ---------------- Register ---------------- */
export async function register({ name, email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!isNoroffEmail(cleanEmail)) {
    throw new Error("Use @noroff.no or @stud.noroff.no");
  }

  try {
    return await fetchJson(REGISTER_PATH, {
      method: "POST",
      body: JSON.stringify({ name, email: cleanEmail, password }),
    });
  } catch (e) {
    if (/409|exists|taken/i.test(e.message)) {
      throw new Error("That email is already registered.");
    }
    throw e;
  }
}

/* ---------------- Login ---------------- */
export async function login({ email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  const data = await fetchJson(LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify({ email: cleanEmail, password }),
  });

  const token = data?.accessToken ?? data?.token;
  if (!token) throw new Error("Login succeeded but no token returned");

  // Keep existing apiKey if already saved
  const cur = getAuth();
  saveAuth({ ...cur, token, profile: data });

  return { token, profile: data, apiKey: cur.apiKey };
}

/* ---------------- API Key helpers ---------------- */
export function setApiKey(key) {
  if (!key) throw new Error("Missing API Key");
  const cur = getAuth();
  saveAuth({ ...cur, apiKey: key });
}

/** Create a new API key and save it */
export async function createApiKey() {
  const res = await fetchJson(API_KEY_PATH, { method: "POST" });
  const key = res?.key || res?.apiKey;
  if (!key) throw new Error("No API key in response");
  setApiKey(key);
  return key;
}

/** Ensure an API key exists; retry if needed */
export async function ensureApiKey({ retries = 1, delayMs = 1000 } = {}) {
  const { apiKey } = getAuth();
  if (apiKey) return apiKey;

  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await createApiKey();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/* ---------------- Logout ---------------- */
export function logout() {
  saveAuth({ token: null, apiKey: null, profile: null });
  localStorage.removeItem("auth");
}
