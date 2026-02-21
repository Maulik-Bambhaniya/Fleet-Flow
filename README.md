# Fleet-Flow 🚀

A modern full-stack MERN application with a separate **server/** (backend) and **client/** (frontend) folder structure.

## Tech Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Frontend | React 19 + Vite 7       |
| Backend  | Node.js + Express 4     |
| Database | MongoDB + Mongoose 8    |

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally on `mongodb://localhost:27017` (or update `server/.env`)

## Quick Start

```bash
# 1. Install all dependencies (root + server + client)
npm run install-all

# 2. Start both servers with a single command
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
│   ├── config/      # DB connection
│   ├── models/      # Mongoose models
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
