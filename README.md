# Handly

Handly is a hyperlocal service marketplace. Customers search for nearby service providers on a map and book them, and providers list themselves, toggle live availability and manage incoming bookings.

This repository contains the **frontend** (Next.js). The REST API lives in a separate repository: **[handly-backend](https://github.com/jobanvohra/handly-backend)**.

**Live demo:** [handly-service-finder.vercel.app](https://handly-service-finder.vercel.app)

> The backend runs on a free Render instance, so the first request after a period of inactivity can take 30-50 seconds while it wakes up.

## Features

**For customers**
- Search providers by category, radius and location, with location autocomplete
- Interactive map view of nearby providers, which recenters when the location changes
- Public provider profiles, so browsing and search need no login
- Booking flow with a map-based service-location picker and a check that the location falls inside the provider's service area
- Booking history and review submission after a completed job

**For providers**
- Create and edit a provider profile
- Toggle live "available now" status
- Dashboard to accept, decline and complete booking requests

**General**
- Cookie-based JWT authentication with route protection in Next.js middleware
- Server-rendered public pages for provider listings and profiles
- Form validation with React Hook Form and Zod

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Forms and validation | React Hook Form, Zod, `@hookform/resolvers` |
| Maps | Leaflet, React Leaflet, OpenStreetMap Nominatim (geocoding) |
| Auth | JWT in an HTTP-only cookie, verified with `jose` |
| Icons | lucide-react |
| Deployment | Vercel |

**Backend (separate repo):** Node.js, Express, TypeScript, MongoDB Atlas (geospatial queries), Redis on Upstash (live availability and search caching), deployed on Render.

## Architecture

The browser only talks to the Vercel domain. A rewrite in `next.config.ts` proxies every `/api/*` request to the backend, so the auth cookie is first-party and works in browsers that block third-party cookies.

```
Browser  ->  Next.js (Vercel)  --/api/* rewrite-->  Express API (Render)
                                                        |-- MongoDB Atlas
                                                        |-- Redis (Upstash)
```

Route protection happens in the Next.js proxy/middleware, which verifies the JWT with `jose`. Public pages (`/search`, `/providers/[id]`) are open to everyone, and only booking, dashboards and profile management require a login.

## Routes

| Route | Access | Description |
|---|---|---|
| `/search` | Public | Search providers by category, radius and location |
| `/providers/[id]` | Public | Provider profile and reviews |
| `/providers/[id]/book` | Logged in | Booking form with location picker |
| `/login`, `/register` | Public | Authentication |
| `/bookings` | Logged in | Booking list |
| `/bookings/[id]/review` | Logged in | Leave a review for a completed booking |
| `/dashboard/customer` | Customer | Booking history |
| `/dashboard/provider` | Provider | Availability toggle and booking requests |
| `/dashboard/provider/profile` | Provider | Create or edit provider profile |
| `/profile` | Logged in | Account page |

## Getting Started

### Prerequisites
- Node.js 20 or newer
- The [backend](https://github.com/jobanvohra/handly-backend) running locally, or the URL of a deployed instance

### Installation

```bash
git clone https://github.com/jobanvohra/handly-frontend.git
cd handly-frontend
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
# URL of the Express backend (no trailing slash)
BACKEND_URL=http://localhost:5000

# Must be identical to the backend's JWT_SECRET
JWT_SECRET=your_jwt_secret
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Deployment

The frontend is deployed on Vercel.

1. Import the repository in Vercel.
2. Set `BACKEND_URL` (the full backend URL, including `https://`) and `JWT_SECRET` before the first build. `BACKEND_URL` is read at build time by the rewrite in `next.config.ts`.
3. Deploy, then set the backend's `CLIENT_URL` to the Vercel URL.


## License

This project is for learning and portfolio purposes.
