// scripts/register.js
// Brukes på register-siden: registrer → logg inn → sørg for API key → redirect til feed.
import { register, login, ensureApiKey, isNoroffEmail } from "./auth.js";

const $ = (id) => document.getElementById(id);
const setMsg = (el, msg, ok = false) => {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("hidden", !msg);
  el.className = `text-sm ${ok ? "text-green-700" : "text-red-700"}`;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
};
const setBusy = (btn, text) => {
  if (!btn) return () => {};
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = text;
  return () => { btn.disabled = false; btn.textContent = prev; };
};

const form = $("registerForm");
const msg  = $("registerMsg");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(msg, "");

  const name = $("registerName")?.value?.trim();
  const email = $("registerEmail")?.value?.trim();
  const password = $("registerPassword")?.value ?? "";

  // Tidlig validering for bedre UX (auth.register validerer også)
  if (!isNoroffEmail(email)) {
    return setMsg(msg, "Use @noroff.no or @stud.noroff.no email.");
  }

  const done = setBusy(form.querySelector('button[type="submit"]'), "Creating account…");

  try {
    await register({ name, email, password });  // lager bruker
    await login({ email, password });           // auto-login
    try { await ensureApiKey({ retries: 2 }); } catch { /* best-effort */ }
    location.href = "feed/index.html";          // relativ path
  } catch (err) {
    setMsg(msg, err?.message || "Registration failed.");
  } finally {
    done();
  }
});
