// scripts/singlePost.js
import { getPost, deletePost, updatePost, addComment, removeComment } from "./posts.js";
import { getAuth } from "./apiClient.js";
import { escapeHTML, isHttpUrl, getParam } from "./utils.js";

// Route guard
const { token } = getAuth();
if (!token) location.href = "../login.html"; // relativ path

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso || "";
  }
}

// DOM + params
const id = getParam("id");
const container = document.querySelector("#post");

if (!id) {
  if (container) container.innerHTML = `<p class="text-red-700">Missing post id.</p>`;
  throw new Error("No post id");
}

let current;

// Render post
function render(post) {
  current = post;
  const me = getAuth()?.profile?.name;
  const canEdit =
    post.author?.name && me && post.author.name.toLowerCase() === me.toLowerCase();

  const t = escapeHTML(post.title ?? "");
  const b = escapeHTML(post.body ?? "");
  const authorName = escapeHTML(post.author?.name ?? "unknown");
  const img = post.media?.url
    ? `<img src="${post.media.url}" alt="${escapeHTML(post.media.alt ?? "image")}" class="rounded-lg w-full max-h-[480px] object-cover" />`
    : "";

  container.innerHTML = `
    <article class="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto space-y-3">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">${t}</h1>
          <p class="text-sm text-gray-600">by ${authorName} • ${fmtDate(post.created)}</p>
        </div>
        ${canEdit ? `
          <div class="flex gap-2 shrink-0">
            <button id="editBtn" class="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Edit</button>
            <button id="deleteBtn" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        ` : ""}
      </div>

      ${img}
      <p class="whitespace-pre-line">${b}</p>
      <div class="text-sm text-gray-600">💬 ${post._count?.comments ?? 0} · ❤ ${post._count?.reactions ?? 0}</div>
    </article>

    <!-- Add Comment -->
    <form id="commentForm" class="max-w-3xl mx-auto mt-6 bg-white p-4 rounded-xl shadow space-y-3">
      <h3 class="font-semibold">Add a comment</h3>
      <textarea id="commentBody" class="w-full border rounded px-3 py-2 h-24" placeholder="Write something…"></textarea>
      <div class="flex items-center justify-between">
        <p id="commentMsg" class="text-sm"></p>
        <button class="bg-[#3D7D75] text-white px-4 py-2 rounded hover:bg-[#33665f]" type="submit">Comment</button>
      </div>
    </form>

    <!-- Comments list -->
    <section id="comments" class="max-w-3xl mx-auto mt-6 space-y-3"></section>
  `;

  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");

  // Wire edit/delete on post
  if (canEdit) {
    document.getElementById("deleteBtn")?.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deletePost(id);
        location.href = "./index.html"; // relativ redirect
      } catch (e) {
        alert(e.message || "Failed to delete.");
      }
    });

    document.getElementById("editBtn")?.addEventListener("click", () => showEditForm());
  }

  // Render comments
  renderComments(post.comments || []);

  // Add comment submit
  const form = document.getElementById("commentForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const msg = document.getElementById("commentMsg");
    const field = document.getElementById("commentBody");
    const text = field?.value?.trim();
    msg.textContent = "";
    msg.className = "text-sm";

    if (!text) {
      msg.textContent = "Write something first.";
      msg.classList.add("text-red-700");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Posting…";
    try {
      await addComment(id, text);
      if (field) field.value = "";
      await reload(); // refresh full post so counts & list update
      msg.textContent = "Comment posted!";
      msg.classList.add("text-green-700");
    } catch (err) {
      msg.textContent = err.message || "Failed to post comment.";
      msg.classList.add("text-red-700");
    } finally {
      btn.disabled = false;
      btn.textContent = "Comment";
    }
  });
}

// Render comments
function renderComments(comments) {
  const me = getAuth()?.profile?.name;
  const wrap = document.getElementById("comments");
  if (!wrap) return;

  if (!Array.isArray(comments) || comments.length === 0) {
    wrap.innerHTML = `<p class="text-gray-600">No comments yet.</p>`;
    return;
  }

  // Oldest first for readability
  const items = [...comments].sort(
    (a, b) => new Date(a.created) - new Date(b.created)
  );

  wrap.innerHTML = items
    .map((c) => {
      const mine = c.author?.name && me && c.author.name.toLowerCase() === me.toLowerCase();
      const name = escapeHTML(c.author?.name ?? "unknown");
      const text = escapeHTML(c.body ?? "");
      return `
        <article class="bg-white p-4 rounded-xl shadow">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              <span class="font-semibold">${name}</span> • ${fmtDate(c.created)}
            </div>
            ${mine ? `<button class="text-red-700 hover:underline" data-del="${c.id}">Delete</button>` : ""}
          </div>
          <p class="mt-2 whitespace-pre-line">${text}</p>
        </article>
      `;
    })
    .join("");

  wrap.setAttribute("role", "status");
  wrap.setAttribute("aria-live", "polite");

  // Delete handler (event delegation)
  wrap.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest("[data-del]");
      if (!btn) return;
      const commentId = btn.getAttribute("data-del");
      if (!confirm("Delete this comment? This will also delete its replies.")) return;
      btn.disabled = true;
      try {
        await removeComment(id, commentId);
        await reload();
      } catch (err) {
        alert(err.message || "Failed to delete comment.");
        btn.disabled = false;
      }
    },
    { once: true }
  );
}

// Edit form
function showEditForm() {
  if (document.getElementById("editForm")) return; // already open

  const form = document.createElement("form");
  form.id = "editForm";
  form.className = "max-w-3xl mx-auto mt-4 space-y-3 bg-white p-4 rounded-xl shadow";
  form.innerHTML = `
    <input name="title" class="w-full border rounded px-3 py-2" value="${escapeHTML(current.title ?? "")}" />
    <textarea name="body" class="w-full border rounded px-3 py-2 h-28">${escapeHTML(current.body ?? "")}</textarea>
    <input name="imageUrl" class="w-full border rounded px-3 py-2" value="${escapeHTML(current.media?.url ?? "")}" placeholder="Image URL (optional)" />
    <button class="bg-[#3D7D75] text-white px-4 py-2 rounded">Save</button>
  `;
  container.after(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      title: fd.get("title")?.toString().trim(),
      body: fd.get("body")?.toString().trim(),
    };

    const imageUrl = fd.get("imageUrl")?.toString().trim();
    if (imageUrl) {
      if (!isHttpUrl(imageUrl)) {
        return alert("Image URL must be a valid http(s) address.");
      }
      payload.media = { url: imageUrl, alt: payload.title || "post image" };
    }

    try {
      const updated = await updatePost(id, payload);
      form.remove();
      render(updated);
    } catch (err) {
      alert(err.message || "Failed to update.");
    }
  });
}

// Reload full post
async function reload() {
  const post = await getPost(id, {
    includeAuthor: true,
    includeComments: true,
    includeReactions: true,
  });
  render(post);
}

// Init
(async function init() {
  container.innerHTML = `<p class="text-gray-500 animate-pulse">Loading…</p>`;
  try {
    const post = await getPost(id, {
      includeAuthor: true,
      includeComments: true,
      includeReactions: true,
    });
    render(post);
  } catch (e) {
    container.innerHTML = `<p class="text-red-700">${escapeHTML(e.message)}</p>`;
  }
})();
