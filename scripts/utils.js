// scripts/utils.js

/** Single element */
export const $ = (sel, root = document) => root.querySelector(sel);

/** Multiple elements as array */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Get one query param; supports default value */
export function getParam(name, def = null, search = location.search) {
  const v = new URLSearchParams(search).get(name);
  return v ?? def;
}

/** Get all values for a repeated param (?tag=a&tag=b) */
export function getParamAll(name, search = location.search) {
  return new URLSearchParams(search).getAll(name);
}

/** Parse param as integer (returns def if missing/invalid) */
export function getParamInt(name, def = null, search = location.search) {
  const v = getParam(name, null, search);
  const n = v !== null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : def;
}

/** Parse param as boolean: 1/true/yes/on (case-insensitive) */
export function getParamBool(name, def = false, search = location.search) {
  const v = getParam(name, null, search);
  if (v === null) return def;
  return /^(1|true|yes|on)$/i.test(v);
}

/**
 * Debounce with cancel/flush and leading/trailing options.
 * Same default behavior as før (trailing=true).
 */
export function debounce(fn, wait = 300, { leading = false, trailing = true } = {}) {
  let t, lastArgs, lastThis;

  const invoke = () => {
    t = undefined;
    if (trailing && lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      return fn.apply(lastThis, args);
    }
  };

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const callNow = leading && !t;
    clearTimeout(t);
    t = setTimeout(invoke, wait);
    if (callNow) return fn.apply(this, args);
  }

  debounced.cancel = () => { clearTimeout(t); t = undefined; lastArgs = null; };
  debounced.flush  = () => { if (t) { clearTimeout(t); return invoke(); } };

  return debounced;
}

/** Small reusable helpers used flere steder */
export function escapeHTML(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
