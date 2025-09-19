# Echoes 🌿

**Echoes** is a calm, minimal social feed where you share short thoughts, moments, and nature reflections.  
Built with **vanilla JavaScript** and **Tailwind CSS**, powered by the **Noroff Social API (v2)**.

---

## 📸 Screenshots

> Add your own in `resources/screenshots/` and update these paths.

- Feed: `./resources/screenshots/feed-page.png`
- Profile: `./resources/screenshots/profile-page.png`

---

## ✨ Features

- ✅ Register with **@noroff.no** or **@stud.noroff.no**
- ✅ Login with JWT + store token in `localStorage`
- ✅ **API Key** handling (auto-create, or paste manually)
- ✅ View **feed** of posts
- ✅ **Filter** feed (Newest/Oldest) and optional **tag filter**
- ✅ **Search** posts
- ✅ View **single post by ID**
- ✅ **Create** a post (title/body, optional image URL + tags)
- ✅ **Update** a post (on single-post page)
- ✅ **Delete** a post (on single-post page)
- ✅ Add/Delete **comments**

- ⏳ (Optional for later) follow/unfollow, reactions, edit profile media via API

---

## 🧰 Tech Stack

- HTML + Vanilla **JavaScript**
- **Tailwind CSS** (via CLI)
- **Noroff Social API v2** (JWT + API Key)
- Node.js tooling (Tailwind CLI, PostCSS, Autoprefixer)

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) **v20+** (includes npm)

---

## 🚀 Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Build or watch CSS

```bash
# Development (watch Tailwind)
npm run dev

# Production build (minified CSS)
npm run build
```

### 3) Run the app

Open `index.html` in a local web server (e.g. VS Code “Live Server” extension) or serve the repo with any static server.

---

## 🔐 Using the API (quick flow)

1. **Register** with a **@noroff.no** or **@stud.noroff.no** email (Register page).
2. **Login** (Login page). Your JWT is saved in `localStorage`.
3. Go to the **Feed** and start posting.

> Tokens and API key are stored in `localStorage` under `auth`.  
> Requests are sent via `scripts/apiClient.js` which attaches `Authorization` and `X-Noroff-API-Key` headers when present.

---

## 📜 Scripts

```json
{
  "dev": "tailwindcss -i ./styles/main.css -o ./styles/output.css --watch",
  "build": "tailwindcss -i ./styles/main.css -o ./styles/output.css --minify",
  "watch": "npm run dev"
}
```

---

## 🧹 .gitignore

- `node_modules/`
- `styles/output.css.map`
- any temp CSS like `styles/temp.css*`
- OS junk: `.DS_Store`, `Thumbs.db`

---

## 👤 Author

Lilly-yy
