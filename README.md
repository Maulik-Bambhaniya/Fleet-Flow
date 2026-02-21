# Fleet-Flow 🚀

A modern full-stack application with a separate **server/** (backend) and **client/** (frontend) folder structure, powered by **Supabase** (PostgreSQL).

## Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | React 19 + Vite 7            |
| Backend  | Node.js + Express 4          |
| Database | Supabase (PostgreSQL)        |

## Prerequisites

- **Node.js** ≥ 18
- A free **Supabase** project → [supabase.com/dashboard](https://supabase.com/dashboard)

## Quick Start

```bash
# 1. Install all dependencies (root + server + client)
npm run install-all

# 2. Configure Supabase — edit server/.env:
#    SUPABASE_URL=https://your-project.supabase.co
#    SUPABASE_ANON_KEY=your-anon-key

# 3. Create the users table in Supabase SQL Editor:
#    (see server/models/User.js for the SQL)

# 4. Start both servers
npm run dev
```

- **Frontend** → [http://localhost:5173](http://localhost:5173)
- **Backend API** → [http://localhost:5000](http://localhost:5000)

## Project Structure

```
Fleet-Flow/
├── client/          # React frontend (Vite)
│   ├── src/
│   └── package.json
├── server/          # Express backend
│   ├── config/      # Supabase client
│   ├── models/      # Table query helpers
│   ├── routes/      # API routes
│   └── package.json
├── package.json     # Root — runs both via concurrently
└── README.md
```

## Available Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start both client & server             |
| `npm run client`     | Start only the React dev server        |
| `npm run server`     | Start only the Express API server      |
| `npm run install-all`| Install deps for root, server & client |
| `npm run build`      | Build the React app for production     |
