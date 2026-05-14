# CausalFunnel Analytics Assignment

## Overview
A full-stack user analytics application that tracks user interactions (`page_view` and `click` events), stores them in MongoDB, and visualizes them through a React dashboard.

## Tech Stack
- **Frontend:** React, Vite, TypeScript, CSS
- **Backend:** Node.js, TypeScript, `mimi.js` (equivalent to Express)
- **Database:** MongoDB (using Mongoose for schemas and data modeling)

## Setup Steps
1. **Prerequisites:** Ensure you have Node.js and MongoDB installed and running locally.
2. **Environment Variables:** Ensure your `.env` file contains your MongoDB URI:
   ```env
   MONGO_URI=mongodb://localhost:27017/analytics
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
   This will run `tsx watch server.ts` and start both the Node.js backend and the Vite frontend concurrently on `http://localhost:3000`.

## Using the Application
1. **Open the Demo Page:** Navigate to [http://localhost:3000/demo.html](http://localhost:3000/demo.html)
2. **Generate Traffic:** Click around the demo page to generate events. The tracking script (`tracker.js`) batches events and sends them to the backend API every 5 seconds (or upon page exit).
3. **Open the Dashboard:** Navigate to [http://localhost:3000/](http://localhost:3000/) to view the generated sessions, dive into individual session timelines, and generate URL heatmaps.

## Architecture & Scalability
Check out `architecture.md` (created in this directory) for an in-depth explanation of the scalability optimizations.

## Assumptions & Trade-offs
- **Batching:** The client script uses a 5-second polling interval or `navigator.sendBeacon` to batch requests. This trades immediate real-time dashboard updates for significantly improved backend scalability and reduced network overhead.
- **Heatmap Visualization:** The heatmap is currently a simplified 1000x800px container plotting absolute `x` and `y` coordinates. In a production environment, resolving viewport differences, scroll offsets, and responsive layouts would require more complex coordinate normalization (e.g. tracking viewport size or element-relative coordinates).
- **Authentication:** For the sake of this assignment, the tracking endpoints and dashboard APIs are unauthenticated.
- **`mimi.js` Interaction with Vite:** Due to how the `mimi.js` router prioritizes middleware execution before route handlers, a custom bypass had to be written in `server.ts` to allow `vite.middlewares` to coexist with `/api/*` endpoints.
