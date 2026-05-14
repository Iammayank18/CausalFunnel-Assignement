# CausalFunnel Analytics Assignment

## Overview
A full-stack user analytics application that tracks user interactions (`page_view` and `click` events), stores them in MongoDB, and visualizes them through a React dashboard.

## Tech Stack
- **Frontend:** React, Vite, TypeScript, TailwindCSS v4
- **Backend:** Node.js, TypeScript, `mimi.js` (equivalent to Express)
- **Database:** MongoDB (Mongoose via Atlas)

## Setup Steps
1. **Prerequisites:** Node.js and a MongoDB instance (local or Atlas).
2. **Environment Variables:** Copy `.env.example` to `.env` and set your MongoDB URI:
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/analytics
   PORT=3000
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Runs `tsx watch server.ts`, starting both the backend and the Vite frontend on `http://localhost:3000`.

## Using the Application
1. **Generate Traffic:** Open [http://localhost:3000/demo.html](http://localhost:3000/demo.html) and click around to generate events.
2. **View Dashboard:** Open [http://localhost:3000/](http://localhost:3000/) to see sessions, session timelines, and URL heatmaps.

## Deployment (Vercel)
Both the frontend SPA and the API run on Vercel as a single project.

### Required Steps
1. Push the repository to GitHub and import it into Vercel.
2. In the Vercel dashboard, set the **`MONGO_URI`** environment variable to your MongoDB Atlas connection string.
3. Deploy — Vercel will:
   - Build the frontend with `vite build` → outputs to `dist/`
   - Compile `api/index.ts` as a serverless function at the `/api` route
   - Route all `/api/*` requests to the serverless function
   - Route everything else to `index.html` (SPA routing)

The frontend makes API calls to the same origin (`/api/sessions`, `/api/urls`, etc.), so no `VITE_API_URL` is needed.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns `{ status: 'ok' }` |
| `POST` | `/api/events` | Accepts `{ events: [...] }` array of tracked events |
| `GET` | `/api/sessions?page=1&limit=20` | Paginated session list |
| `GET` | `/api/sessions/:sessionId/events` | All events for a session |
| `GET` | `/api/heatmap?url=<encoded_url>` | Click data for a specific page URL |
| `GET` | `/api/urls` | List of tracked URLs with click counts |

## Embedding the Tracker
To track a website, include the tracker script:
```html
<script src="https://your-domain.vercel.app/tracker.js" defer></script>
```
The script automatically batches `page_view` and `click` events and sends them to the API every 5 seconds (or on page exit via `navigator.sendBeacon`).

## Assumptions & Trade-offs
- **Batching:** The client script uses a 5-second polling interval or `navigator.sendBeacon` to batch requests. This trades immediate real-time dashboard updates for significantly improved backend scalability and reduced network overhead.
- **Heatmap Visualization:** The heatmap is currently a simplified 1000x800px container plotting absolute `x` and `y` coordinates. In a production environment, resolving viewport differences, scroll offsets, and responsive layouts would require more complex coordinate normalization (e.g. tracking viewport size or element-relative coordinates).
- **Authentication:** For the sake of this assignment, the tracking endpoints and dashboard APIs are unauthenticated.
- **`mimi.js` Interaction with Vite:** Due to how the `mimi.js` router prioritizes middleware execution before route handlers, a custom bypass had to be written in `server.ts` to allow `vite.middlewares` to coexist with `/api/*` endpoints.
