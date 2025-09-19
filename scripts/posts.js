// scripts/posts.js
import { fetchJson } from "./apiClient.js";
import { ensureApiKey } from "./auth.js";

const BASE = "/social/posts";

/** Retry helper: if a call fails with 403/Forbidden (usually missing API key),
 * try to create the key and retry once. */
async function withKeyRetry(run) {
  try {
    return await run();
  } catch (e) {
    const msg = String(e?.message || "");
    const looksForbidden = /403|forbidden/i.test(msg);
    if (looksForbidden) {
      try { await ensureApiKey({ retries: 1, delayMs: 800 }); } catch {}
      return await run(); // one retry
    }
    throw e;
  }
}

/** Build query string for optional flags/params */
function qs(params = {}) {
  const u = new URLSearchParams();
  if (params.includeAuthor)    u.set("_author", "true");
  if (params.includeComments)  u.set("_comments", "true");
  if (params.includeReactions) u.set("_reactions", "true");
  if (params.tag)              u.set("_tag", params.tag);
  if (params.page)             u.set("page", params.page);
  if (params.limit)            u.set("limit", params.limit);
  // (If your API supports sort, add it here.)
  const s = u.toString();
  return s ? `?${s}` : "";
}

/**
 * Get a page of posts.
 * @param {Object} [params]
 * @param {boolean} [params.includeAuthor]    Include author
 * @param {boolean} [params.includeComments]  Include comments
 * @param {boolean} [params.includeReactions] Include reactions
 * @param {string}  [params.tag]              Filter by single tag
 * @param {number}  [params.page]
 * @param {number}  [params.limit]
 * @returns {Promise<Array>} Posts
 */
export async function listPosts(params) {
  return withKeyRetry(() =>
    fetchJson(`${BASE}${qs(params)}`, { method: "GET" })
  );
}

/**
 * Search posts by title/body.
 * @param {string} query
 * @param {Object} [params] same flags as listPosts
 */
export async function searchPosts(query, params) {
  const u = new URLSearchParams({ q: query || "" });
  if (params?.includeAuthor)    u.set("_author", "true");
  if (params?.includeComments)  u.set("_comments", "true");
  if (params?.includeReactions) u.set("_reactions", "true");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/search?${u.toString()}`, { method: "GET" })
  );
}

/** Get a single post by id. */
export async function getPost(id, params) {
  if (!id) throw new Error("Missing post id");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/${id}${qs(params)}`, { method: "GET" })
  );
}

/** Create a new post. `payload` can include { title, body, tags, media }. */
export async function createPost(payload) {
  if (!payload?.title) throw new Error("Title is required");
  return withKeyRetry(() =>
    fetchJson(`${BASE}`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}

/** Update a post by id. */
export async function updatePost(id, payload) {
  if (!id) throw new Error("Missing post id");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  );
}

/** Delete a post by id. */
export async function deletePost(id) {
  if (!id) throw new Error("Missing post id");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/${id}`, { method: "DELETE" })
  );
}

/** Add a comment to a post. */
export async function addComment(postId, text, replyToId) {
  if (!postId) throw new Error("Missing post id");
  if (!text)   throw new Error("Comment text is required");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify(replyToId ? { body: text, replyToId } : { body: text }),
    })
  );
}

/** Delete a comment by id from a post. */
export async function removeComment(postId, commentId) {
  if (!postId || !commentId) throw new Error("Missing postId or commentId");
  return withKeyRetry(() =>
    fetchJson(`${BASE}/${postId}/comment/${commentId}`, { method: "DELETE" })
  );
}
