// scripts/feed.js
import { listPosts, searchPosts, createPost } from "./posts.js";
import { getAuth } from "./apiClient.js";
import { ensureApiKey } from "./auth.js";
import { debounce, escapeHTML, isHttpUrl } from "./utils.js";

/* ---------------- Avatar  ---------------- */
const selectedAvatar = localStorage.getItem("selectedAvatar");
const avatarImg = document.getElementById("avatarIcon");
if (avatarImg) {
  avatarImg.src = selectedAvatar
    ? `../resources/avatars/${selectedAvatar}`
    : "../resources/avatars/noavatar.png";
}

/* ---------------- Route guard + background API key ---------------- */
const { token, apiKey } = getAuth();
if (!token) location.href = "../login.html";

(async () => {
  if (!apiKey) {
    try { await ensureApiKey({ retries: 2, delayMs: 1200 }); }
    catch (e) { console.warn("Still no API key after retries:", e.message); }
  }
})();

/* ---------------- DOM refs ---------------- */
const postsEl  = document.querySelector("#posts");
const searchEl = document.querySelector("#search");
const tagEl    = document.querySelector("#tagFilter");   
const sortEl   = document.querySelector("#sortOrder");   
const form     = document.querySelector("#createPostForm");
const msg      = document.querySelector("#createMsg");

postsEl?.setAttribute("role", "status");
postsEl?.setAttribute("aria-live", "polite");
msg?.setAttribute("role", "status");
msg?.setAttribute("aria-live", "polite");

/* ---------------- Render helpers ---------------- */
function render(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) {
    if (postsEl) postsEl.innerHTML = `<p class="text-gray-600">No posts yet.</p>`;
    return;
  }

  postsEl.innerHTML = posts.map(({ id, title, body, media, tags, _count }) => {
    const comments  = _count?.comments ?? 0;
    const reactions = _count?.reactions ?? 0;
    const t   = escapeHTML(title ?? "");
    const b   = escapeHTML(body ?? "");
    const link = `./post.html?id=${encodeURIComponent(id)}`;

    const img = media?.url
      ? `<img src="${media.url}" alt="${escapeHTML(media.alt ?? "post image")}" class="rounded-lg mb-3 w-full object-cover max-h-80" />`
      : "";

    const tagsHtml = Array.isArray(tags) && tags.length
      ? `<ul class="flex flex-wrap gap-2 mt-3">
           ${tags.slice(0, 8).map(tag =>
             `<li class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">#${escapeHTML(tag)}</li>`
           ).join("")}
           ${tags.length > 8 ? `<li class="text-xs text-gray-500">+${tags.length - 8} more</li>` : ""}
         </ul>`
      : "";

    return `
      <article class="bg-white p-4 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2">${t}</h3>
        ${img}
        <p class="mb-2">${b}</p>
        <div class="text-sm text-gray-600">💬 ${comments} · ❤ ${reactions}</div>
        ${tagsHtml}
        <div class="mt-4">
          <a href="${link}"
             class="inline-block bg-[#3D7D75] text-white px-3 py-1 rounded hover:bg-[#33665f]"
             aria-label="View post">
            View
          </a>
        </div>
      </article>
    `;
  }).join("");
}

// Hold last list for client-side sorting
let lastList = [];
let currentSort = "newest";

function sortPosts(arr, order = currentSort) {
  const copy = [...(arr || [])];
  copy.sort((a, b) => {
    const da = new Date(a.created).getTime();
    const db = new Date(b.created).getTime();
    return order === "oldest" ? da - db : db - da;
  });
  return copy;
}

/* ---------------- Load & search ---------------- */
export async function loadFeed({ tag } = {}) {
  if (postsEl) postsEl.innerHTML = `<p class="text-gray-500 animate-pulse">Loading…</p>`;
  try {
    const posts = tag ? await listPosts({ tag }) : await listPosts();
    lastList = posts;
    render(sortPosts(lastList));
  } catch (e) {
    if (postsEl) postsEl.innerHTML = `<p class="text-red-700">${escapeHTML(e.message)}</p>`;
  }
}

let searchSeq = 0;
searchEl?.addEventListener("input", debounce(async (e) => {
  const seq = ++searchSeq;
  const q   = e.target.value.trim();
  const tag = tagEl?.value?.trim();
  try {
    const posts = q
      ? await searchPosts(q)
      : (tag ? await listPosts({ tag }) : await listPosts());

    if (seq !== searchSeq) return;
    lastList = posts;
    render(sortPosts(lastList));
  } catch (err) {
    if (seq !== searchSeq) return;
    if (postsEl) postsEl.innerHTML = `<p class="text-red-700">${escapeHTML(err.message)}</p>`;
  }
}, 300));

tagEl?.addEventListener("input", debounce(async (e) => {
  const tag = e.target.value.trim();
  if (searchEl) searchEl.value = "";
  await loadFeed({ tag: tag || undefined });
}, 300));

sortEl?.addEventListener("change", () => {
  currentSort = sortEl.value || "newest";
  render(sortPosts(lastList));
});

/* ---------------- Create post ---------------- */
function setCreateMsg(text, ok = false) {
  if (!msg) return;
  msg.textContent = text;
  msg.className = `text-sm ${ok ? "text-green-700" : "text-red-700"}`;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setCreateMsg("");

  const fd       = new FormData(form);
  const title    = fd.get("title")?.toString().trim();
  const body     = fd.get("body")?.toString().trim();
  const imageUrl = fd.get("imageUrl")?.toString().trim();
  const tagsRaw  = fd.get("tags")?.toString().trim();

  if (!title || !body) return setCreateMsg("Please fill in both title and body.");

  const payload = { title, body };
  if (tagsRaw)  payload.tags  = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
  if (imageUrl) {
    if (!isHttpUrl(imageUrl)) return setCreateMsg("Image URL must be a valid http(s) address.");
    payload.media = { url: imageUrl, alt: title || "post image" };
  }

  const btn = form.querySelector('button[type="submit"]');
  const prev = btn.textContent;
  btn.disabled = true; btn.textContent = "Posting…";

  try {
    await createPost(payload);
    setCreateMsg("Your echo was released!", true);
    form.reset();
    await loadFeed();
  } catch (err) {
    setCreateMsg(err.message || "Failed to create post.");
  } finally {
    btn.disabled = false; btn.textContent = prev;
  }
});

/* ---------------- Initial load ---------------- */
loadFeed();
