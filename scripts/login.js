
import { login, register, ensureApiKey } from "./auth.js";

/* ---------------- Dom helpers ---------------- */
const $ = (id) => document.getElementById(id);
const setError = (el, msg) => {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("hidden", !msg);
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
};
const setBusy = (btn, textWhenBusy) => {
  if (!btn) return () => {};
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = textWhenBusy;
  return () => { btn.disabled = false; btn.textContent = prev; };
};
const show = (el) => el && el.classList.remove("hidden");
const hide = (el) => el && el.classList.add("hidden");

/* ---------------- Grab elements safely ---------------- */
const loginForm = $("loginForm");
const loginError = $("loginError");
const registerForm = $("registerForm");
const registerError = $("registerError");

const showRegisterLink = $("showRegister");
const showLoginLink = $("showLogin");
const loginSection = loginForm?.closest("section") || $("loginSection");
const registerSection = registerForm?.closest("section") || $("registerSection");

/* ---------------- Toggle between forms ---------------- */
function toLoginView() {
  if (registerSection) hide(registerSection);
  if (loginSection) show(loginSection);
  $("loginEmail")?.focus();
}
function toRegisterView() {
  if (loginSection) hide(loginSection);
  if (registerSection) show(registerSection);
  $("registerName")?.focus();
}

showRegisterLink?.addEventListener("click", (e) => { e.preventDefault(); toRegisterView(); });
showLoginLink?.addEventListener("click", (e) => { e.preventDefault(); toLoginView(); });

const params = new URLSearchParams(location.search);
if (params.get("register") === "1" || location.hash.replace("#","") === "register") {
  toRegisterView();
}

/* ---------------- LOGIN ---------------- */
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(loginError, "");

  const email = $("loginEmail")?.value?.trim();
  const password = $("loginPassword")?.value ?? "";

  const done = setBusy(loginForm.querySelector('button[type="submit"]'), "Signing in…");

  try {
    await login({ email, password });     
    try { await ensureApiKey({ retries: 2 }); } catch {  }
    location.href = "feed/index.html";    
  } catch (err) {
    setError(loginError, err?.message || "Login failed.");
  } finally {
    done();
  }
});

/* ---------------- REGISTER ---------------- */
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(registerError, "");

  const name = $("registerName")?.value?.trim();
  const email = $("registerEmail")?.value?.trim();
  const password = $("registerPassword")?.value ?? "";

  const done = setBusy(registerForm.querySelector('button[type="submit"]'), "Creating account…");

  try {
    await register({ name, email, password }); 
    await login({ email, password });         
    try { await ensureApiKey({ retries: 2 }); } catch {  }
    location.href = "feed/index.html";
  } catch (err) {
    
    if (registerError) setError(registerError, err?.message || "Registration failed.");
    else alert(err?.message || "Registration failed.");
  } finally {
    done();
  }
});
