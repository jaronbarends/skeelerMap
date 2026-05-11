# SkeelerMap

When you go inline skating, the quality of the road surface matters a lot — and there's nowhere to look that up. I built SkeelerMap to scratch my own itch 😊

Draw road segments on a map by placing control points; the app shows those as segments along actual roads and stores them. Each segment gets a 1–5 quality rating and is colour-coded on the map. You can also add markers for things like dangerous slopes.

I may very well be the only one using this app, but I wanted to have the option for other skaters to use it too, so I added the possibility to create accounts. Registered users can create, edit, and delete their own segments and markers.

## Tech stack

|                                    |                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 15 (App Router)            | Framework — chosen deliberately for learning purposes, rather than reach for a simpler SPA setup                                                                                  |
| TypeScript                         |                                                                                                                                                                                   |
| Leaflet (plain, not react-leaflet) | Map — the interactions are imperative by nature; the React wrapper added abstraction without benefit                                                                              |
| Supabase                           | Database + auth — Postgres + PostGIS for possibility of geo-aware queries (e.g. fetching only segments within the current map bounds), and built-in RLS for ownership enforcement |
| Vercel                             | Hosting                                                                                                                                                                           |

## Setup

Create `.env.local`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

```bash
npm run dev
```

### Testing on mobile

```bash
ngrok http 3000
```

[ngrok quickstart](https://ngrok.com/docs/getting-started)

---

Architecture decisions and tradeoffs: [ARCHITECTURE.md](./ARCHITECTURE.md)
