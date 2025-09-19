// scripts/profile.js
import { getAuth, fetchJson } from "../scripts/apiClient.js";
import { createPost } from "../scripts/posts.js";
import { logout } from "../scripts/auth.js";
import { escapeHTML, isHttpUrl } from "../scripts/utils.js";

// ---- Elements
const avatarDisplay = document.getElementById("currentAvatar");
const avatarModal   = document.getElementById("avatarModal");
const avatarOptions = document.getElementById("avatarOptions");
const closeModal    = document.getElementById("closeModal");
const avatarIcon    = document.getElementById("avatarIcon");

const usernameEl    = document.getElementById("username");
const followersEl   = document.getElementById("followersCount");
const followingEl   = document.getElementById("followingCount");
const postsWrap     = document.getElementById("userPosts");

const createForm    = document.getElementById("createOnProfile");
const createMsg     = document.getElementById("createMsg");
const logoutBtn     = document.getElementById("logoutBtn");

// ---- Auth / current user
const auth = getAuth();
const me   = auth?.profile?.name;

// Basic guard (head har også en guard)
if (!auth?.token) location.href = "../login.html";

// ---- Avatar state
const selectedAvatar = localStorage.getItem("selectedAvatar") || "noavatar.png";
const setAvatar = (filename) => {
  const url = `../resources/avatars/${filename}`;
  if (avatarDisplay) avatarDisplay.src = url;
  if (avatarIcon)    avatarIcon.src    = url;
  localStorage.setItem("selectedAvatar", filename);
};
setAvatar(selectedAvatar);

// Open/close modal
avatarDisplay?.addEventListener("click", () => avatarModal?.classList.remove("hidden"));
closeModal?.addEventListener("click", () => avatarModal?.classList.add("hidden"));
window.addEventListener("click", (e) => { if (e.target === avatarModal) avatarModal?.classList.add("hidden"); });

// Generate avatar choices
(function buildAvatarChoices(){
  const files = ["noavatar.png"];
  for (let i = 1; i <= 16; i++) files.push(`avatar${i}.png`);
  files.forEach((filename) => {
    const img = document.createElement("img");
    img.src = `../resources/avatars/${filename}`;
    img.alt = filename;
    img.className = "w-16 h-16 rounded-full object-cover border border-gray-300 hover:border-blue-500 cursor-pointer transition";
    img.addEventListener("click", () => { setAvatar(filename); avatarModal?.classList.add("hidden"); });
    avatarOptions?.appendChild(img);
  });
})();

// ---- Load profile info + posts
async function loadProfile() {
  usernameEl.textContent = me ? `@${me}` : "@user";

  // Followers/following
  try {
    const prof = await fetchJson(`/social/profiles/${encodeURIComponent(me)}?_followers=true&_following=true`);
    const followers = prof?._count?.followers ?? prof?.followers?.length ?? 0;
    const following = prof?._count?.following ?? prof?.following?.length ?? 0;
    followersEl.textContent = followers;
    followingEl.textContent = following;
  } catch {
    // Still show zeros if fetching counts fails
  }
}

function renderPosts(list = []) {
  if (!postsWrap) return;
  if (!Array.isArray(list) || list.length === 0) {
    postsWrap.innerHTML = `<p class="text-gray-600">You haven't released any echoes yet.</p>`;
    return;
  }

  postsWrap.innerHTML = list.map(p => {
    const t = escapeHTML(p.title ?? "");
    const b = escapeHTML(p.body ?? "");
    const img = p.media?.url
      ? `<img src="${p.media.url}" alt="${escapeHTML(p.media.alt ?? "post image")}" class="rounded-lg mb-4 mx-auto w-full max-w-2xl max-h-[600px] object-cover" />`
      : "";

    return `
      <article class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2">${t}</h3>
        ${p.media?.url ? img : ""}
        <p>${b}</p>
      </article>
    `;
  }).join("");
}

async function loadMyPosts() {
  if (postsWrap) postsWrap.innerHTML = `<p class="text-gray-500 animate-pulse">Loading…</p>`;
  try {
    // Noroff v2: hent poster for profil
    const posts = await fetchJson(`/social/profiles/${encodeURIComponent(me)}/posts?_author=true&_comments=true&_reactions=true`);
    renderPosts(posts);
  } catch (e) {
    postsWrap.innerHTML = `<p class="text-red-700">${escapeHTML(e.message || "Failed to load posts.")}</p>`;
  }
}

// ---- Create post on profile (samme flyt som i feed)
function setCreateMsg(text, ok = false) {
  if (!createMsg) return;
  createMsg.textContent = text;
  createMsg.className = `text-sm ${ok ? "text-green-700" : "text-red-700"}`;
}

createForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setCreateMsg("");

  const fd       = new FormData(createForm);
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

  const btn = createForm.querySelector('button[type="submit"]');
  const prev = btn.textContent;
  btn.disabled = true; btn.textContent = "Posting…";

  try {
    await createPost(payload);
    setCreateMsg("Your echo was released!", true);
    createForm.reset();
    await loadMyPosts();
  } catch (err) {
    setCreateMsg(err.message || "Failed to create post.");
  } finally {
    btn.disabled = false; btn.textContent = prev;
  }
});

// ---- Logout
logoutBtn?.addEventListener("click", () => {
  logout();
  location.href = "../../index.html"; // tilbake til rot
});

// ---- Init
(async function init() {
  await loadProfile();
  await loadMyPosts();
})();
