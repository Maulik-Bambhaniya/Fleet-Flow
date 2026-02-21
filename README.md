<p align="center">
  <img src="https://img.shields.io/badge/Fleet--Flow-v1.0.0-1a1a2e?style=for-the-badge&labelColor=16213e" alt="Version" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

# 🚛 Fleet-Flow

> **A modern, full-stack fleet management platform** built with the MERN stack (Mongo → PostgreSQL) that gives fleet managers and dispatchers real-time control over vehicles, drivers, trips, maintenance, expenses, and analytics — all from a single beautiful dashboard.

Fleet-Flow transforms fleet operations from spreadsheets into an intelligent command center. Whether you manage 5 vans or 500 trucks, Fleet-Flow gives you instant visibility into every vehicle, every driver, and every dollar spent.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🖼️ Application Pages](#️-application-pages)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Reference](#-api-reference)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [🌐 Frontend Routes](#-frontend-routes)
- [🧩 Component Architecture](#-component-architecture)
- [📜 Available Scripts](#-available-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🚀 Core Capabilities

| Feature | Description |
|---|---|
| **Command Center Dashboard** | Real-time KPIs — active fleet count, maintenance alerts, fleet utilization %, pending cargo orders, and weekly utilization charts |
| **Vehicle Registry** | Complete fleet inventory with status tracking (Available / On Trip / In Shop / Critical), odometer readings, capacity, and region assignments |
| **Trip Dispatcher** | Full dispatch workflow — create trips as drafts, dispatch with vehicle & driver assignment, complete or cancel. Paginated & filterable |
| **Maintenance Logs** | Schedule, track, and manage service records. Auto-syncs vehicle status when maintenance is active. CSV export support |
| **Expense & Fuel Tracker** | Track fuel costs, maintenance costs, distance, and liters per trip. Monthly stats and CSV export |
| **Driver Profiles** | Driver roster with license status, experience years, safety scores, and duty status tracking |
| **Analytics Dashboard** | Computed KPIs (total expenses, cost/mile, fuel cost, utilization), multi-period charts (30d / 90d / Year), fuel efficiency by vehicle type, ROI leaders, and monthly cost per vehicle |
| **Global Search** | Instant search across vehicles, drivers, trips, and maintenance — with debounced input and categorized results |

### 🔒 Security & Auth

- **JWT Authentication** — Secure token-based auth with 7-day expiry
- **Role-Based Access Control** — Manager & Dispatcher roles with middleware-enforced permissions
- **Password Hashing** — bcrypt with 12 salt rounds
- **Protected Routes** — Auth middleware on all sensitive endpoints

### 🎨 UI/UX Highlights

- Clean, minimal design with a fixed sidebar + header layout
- Breadcrumb navigation across all pages
- Responsive search bar with live categorized results dropdown
- Status badges with color-coded states
- Recharts-powered interactive graphs and charts
- CSV export for maintenance logs and expenses
- Landing page with feature showcase

---

## 🖼️ Application Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Public marketing page showcasing Fleet-Flow features |
| **Login** | `/login` | Email & password authentication with "Remember Me" |
| **Sign Up** | `/signup` | Registration with name, email, password, and role selection |
| **Command Center** | `/dashboard` | Main dashboard with KPI cards, fleet status donut, and weekly utilization chart |
| **Vehicle Registry** | `/vehicles` | Full vehicle inventory table with status filters and add-vehicle form |
| **Trip Dispatcher** | `/dispatch` | Trip management with create, dispatch, complete, and cancel workflows |
| **Maintenance Logs** | `/maintenance` | Service records with filters (vehicle, status, date range), search, and CSV export |
| **Expenses & Fuel** | `/expenses` | Expense tracking table with filters, monthly stats, and CSV export |
| **Driver Profiles** | `/drivers` | Driver roster with license info, safety scores, and status indicators |
| **Analytics** | `/analytics` | Business intelligence dashboard with computed KPIs, charts, and cost breakdowns |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (React 19 + Vite 7)                    │
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌─────────────────────┐ │
│  │  Pages   │  │  Components  │  │  Layout   │  │    UI Components    │ │
│  │ (10 views│  │  (Sidebar,   │  │ Dashboard │  │ (Button, Card,      │ │
│  │  + Auth) │  │   Search)    │  │  Layout   │  │  Table, Badge,      │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬─────┘  │  Avatar, Progress)  │ │
│       │               │               │         └─────────────────────┘ │
│       └───────────────┼───────────────┘                                  │
│                       │                                                  │
│              ┌────────▼────────┐                                         │
│              │  React Router   │                                         │
│              │  (BrowserRouter)│                                         │
│              └────────┬────────┘                                         │
│                       │                                                  │
│              ┌────────▼────────┐                                         │
│              │   Vite Proxy    │  (localhost:5173 → localhost:5000)       │
│              │   /api/* ──────►│                                         │
│              └────────┬────────┘                                         │
└───────────────────────┼──────────────────────────────────────────────────┘
                        │  HTTP (REST)
┌───────────────────────▼──────────────────────────────────────────────────┐
│                         SERVER (Express 4 + Node.js)                     │
│                                                                          │
│  ┌─────────────┐    ┌──────────────────────────────────────────────────┐ │
│  │ Middleware   │    │                   Routes                        │ │
│  │ ┌─────────┐ │    │  /api/auth/*        → Auth (register/login/me)  │ │
│  │ │  CORS   │ │    │  /api/dashboard/*   → KPI stats & charts        │ │
│  │ │  JSON   │ │    │  /api/vehicles/*    → Fleet CRUD                │ │
│  │ │  Auth   │ │    │  /api/drivers/*     → Driver listing            │ │
│  │ │  RBAC   │ │    │  /api/trips/*       → Trip dispatch workflow    │ │
│  │ └─────────┘ │    │  /api/maintenance/* → Service log CRUD + CSV    │ │
│  └─────────────┘    │  /api/expenses/*    → Cost tracking + CSV       │ │
│                     │  /api/analytics     → Computed business metrics  │ │
│                     │  /api/search        → Global cross-table search │ │
│                     │  /api/status        → Health check              │ │
│                     └──────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    Models (10 ORM-like wrappers)                     │ │
│  │  User · Vehicle · Driver · Trip · Expense · MaintenanceLog          │ │
│  │  Analytics · MaintenanceAlert · CargoOrder · VehicleUtilization      │ │
│  └───────────────────────────┬──────────────────────────────────────────┘ │
│                              │ pg (node-postgres)                        │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │  SQL over SSL
                    ┌──────────▼──────────┐
                    │   Supabase          │
                    │   (PostgreSQL 15)   │
                    │                     │
                    │  10 tables          │
                    │  Auto-created on    │
                    │  server startup     │
                    │  + Seed data        │
                    └─────────────────────┘
```

### Data Flow

1. **User** interacts with the React frontend (port `5173`)
2. **Vite proxy** forwards all `/api/*` requests to the Express server (port `5000`)
3. **Express middleware** validates JWT tokens and checks role permissions
4. **Route handlers** call Model methods which execute parameterized SQL queries
5. **PostgreSQL** (hosted on Supabase) stores and returns data over SSL
6. **Response** flows back through the same chain to the React UI

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI component library |
| **Vite** | 7.3 | Build tool & dev server with HMR |
| **React Router DOM** | 7.13 | Client-side routing |
| **TailwindCSS** | 3.4 | Utility-first CSS framework |
| **Recharts** | 3.7 | Charting library for analytics |
| **Lucide React** | 0.575 | Icon library |
| **Radix UI** | Latest | Headless accessible components (Slot) |
| **class-variance-authority** | 0.7 | Component variant management |
| **clsx + tailwind-merge** | Latest | Conditional & merged classnames |
| **ESLint** | 9.x | Code linting |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 18 | JavaScript runtime |
| **Express** | 4.21 | HTTP server framework |
| **pg** (node-postgres) | 8.13 | PostgreSQL client with connection pooling |
| **jsonwebtoken** | 9.0 | JWT generation & verification |
| **bcryptjs** | 3.0 | Password hashing (12 rounds) |
| **dotenv** | 16.4 | Environment variable management |
| **cors** | 2.8 | Cross-Origin Resource Sharing |
| **nodemon** | 3.1 | Dev server auto-restart |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Supabase** | Managed PostgreSQL database (free tier available) |
| **concurrently** | Run client + server simultaneously |

---

## 📁 Project Structure

```
Fleet-Flow/
├── .env                          # Root environment variables (PORT, DATABASE_URL)
├── .gitignore
├── package.json                  # Root — orchestrates client + server via concurrently
├── README.md
│
├── client/                       # ⚛️  React Frontend (Vite)
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite config (proxy, aliases)
│   ├── tailwind.config.js        # Tailwind configuration
│   ├── postcss.config.js         # PostCSS plugins
│   ├── eslint.config.js          # ESLint rules
│   │
│   ├── public/                   # Static assets
│   │
│   └── src/
│       ├── main.jsx              # App bootstrap (BrowserRouter)
│       ├── App.jsx               # Route definitions
│       ├── App.css               # Global styles
│       ├── index.css             # Tailwind directives
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx   # Main layout (sidebar + header + search)
│       │   │   └── Sidebar.jsx           # Navigation sidebar
│       │   │
│       │   └── ui/               # Reusable UI primitives
│       │       ├── avatar.jsx
│       │       ├── badge.jsx
│       │       ├── button.jsx
│       │       ├── card.jsx
│       │       ├── progress.jsx
│       │       ├── separator.jsx
│       │       └── table.jsx
│       │
│       ├── pages/
│       │   ├── Landing.jsx       # Public landing page
│       │   ├── Landing.css
│       │   ├── Login.jsx         # Authentication — login
│       │   ├── Signup.jsx        # Authentication — registration
│       │   ├── Auth.css          # Shared auth styles
│       │   ├── CommandCenter.jsx # Dashboard with KPIs & charts
│       │   ├── VehicleRegistry.jsx     # Fleet management
│       │   ├── VehicleRegistry.css
│       │   ├── TripDispatcher.jsx      # Trip dispatch workflow
│       │   ├── TripDispatcher.css
│       │   ├── MaintenanceLogs.jsx     # Service records
│       │   ├── MaintenanceLogs.css
│       │   ├── ExpensesFuel.jsx        # Cost tracking
│       │   ├── ExpensesFuel.css
│       │   ├── DriverProfiles.jsx      # Driver roster
│       │   └── Analytics.jsx           # Business intelligence
│       │       Analytics.css
│       │
│       ├── lib/                  # Utility functions
│       └── assets/               # Images, SVGs
│
├── server/                       # 🖥️  Express Backend
│   ├── index.js                  # Server entry — app setup, table creation, seeding
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Server-specific env vars
│   ├── .env.example              # Template for environment variables
│   ├── reset-seed.js             # Utility to reset seed data
│   │
│   ├── config/
│   │   ├── db.js                 # PostgreSQL connection pool (SSL)
│   │   └── seed.js               # Seed data orchestration
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT verification + role-based authorization
│   │
│   ├── models/                   # Data access layer (10 models)
│   │   ├── User.js               # Users with RBAC
│   │   ├── Vehicle.js            # Fleet vehicles
│   │   ├── Driver.js             # Drivers
│   │   ├── Trip.js               # Trip dispatch
│   │   ├── Expense.js            # Fuel & maintenance costs
│   │   ├── MaintenanceLog.js     # Service records
│   │   ├── Analytics.js          # Computed metrics (no stored data)
│   │   ├── MaintenanceAlert.js   # Maintenance alerts
│   │   ├── CargoOrder.js         # Cargo orders
│   │   └── VehicleUtilization.js # Daily utilization tracking
│   │
│   └── routes/                   # API route handlers (10 files)
│       ├── api.js                # Health check
│       ├── auth.js               # Register, login, me
│       ├── dashboard.js          # Dashboard stats & charts
│       ├── vehicles.js           # Vehicle CRUD
│       ├── drivers.js            # Driver listing
│       ├── trips.js              # Trip lifecycle
│       ├── maintenance.js        # Maintenance CRUD + CSV export
│       ├── expenses.js           # Expense CRUD + CSV export
│       ├── analytics.js          # Computed analytics
│       └── search.js             # Global search
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18 ([download](https://nodejs.org/))
- **npm** ≥ 9
- A free **Supabase** project → [supabase.com/dashboard](https://supabase.com/dashboard)

### 1. Clone the Repository

```bash
git clone https://github.com/Maulik-Bambhaniya/Fleet-Flow.git
cd Fleet-Flow
```

### 2. Install All Dependencies

```bash
npm run install-all
```

This single command installs dependencies for the root, server, and client.

### 3. Configure Environment Variables

Create a `.env` file in the **project root** (Fleet-Flow/):

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

> 💡 **Finding your Supabase connection string:**
> 1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Select your project → **Settings** → **Database**
> 3. Copy the **Connection string** (URI format)

Optionally, create `server/.env` with a custom JWT secret:

```env
JWT_SECRET=your_super_secret_key_here
```

### 4. Start the Application

```bash
npm run dev
```

This concurrently starts:

| Service | URL | Description |
|---|---|---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | React dev server with HMR |
| **Backend** | [http://localhost:5000](http://localhost:5000) | Express API server |

### 5. First-Time Setup

On first startup, the server **automatically**:

1. ✅ Creates all 10 database tables (in dependency order)
2. ✅ Seeds realistic development data (20 vehicles, 15 drivers, 25 trips, 22 expenses, maintenance logs, alerts, cargo orders)
3. ✅ Logs `Database tables verified` and `Seed data verified`

**Create your first account** by navigating to `/signup` and registering as a **Manager** or **Dispatcher**.

---

## ⚙️ Environment Variables

| Variable | Location | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Root `.env` | No | `5000` | Express server port |
| `DATABASE_URL` | Root `.env` | **Yes** | — | PostgreSQL connection string (Supabase) |
| `JWT_SECRET` | `server/.env` | No | `fleet-flow-secret-key-change-in-production` | Secret key for JWT signing |

---

## 🗄️ Database Schema

Fleet-Flow uses **10 PostgreSQL tables** with UUID primary keys, foreign key relationships, and automatic timestamps. All tables are **auto-created** on server startup via `CREATE TABLE IF NOT EXISTS`.

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password
        varchar role "manager | dispatcher"
        timestamptz created_at
        timestamptz updated_at
    }

    VEHICLES {
        uuid id PK
        varchar name
        varchar license_plate UK
        varchar type "Truck | Van"
        numeric max_capacity
        varchar region
        numeric odometer
        varchar status "Available | On Trip | In Shop | Critical"
        timestamptz created_at
        timestamptz updated_at
    }

    DRIVERS {
        uuid id PK
        varchar name
        varchar license_id
        varchar license_status "valid | expiring_soon | expired"
        integer experience_yrs
        integer safety_score
        varchar status "available | on_duty | resting | suspended"
        timestamptz created_at
        timestamptz updated_at
    }

    TRIPS {
        uuid id PK
        varchar trip_id UK "TR-YYYY-NNN"
        varchar origin
        varchar destination
        timestamptz scheduled_departure
        varchar cargo_type
        uuid vehicle_id FK
        varchar vehicle_name
        varchar driver_name
        text notes
        varchar status "draft | dispatched | completed | cancelled"
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    EXPENSES {
        uuid id PK
        varchar trip_id
        uuid vehicle_id FK
        varchar vehicle_name
        varchar vehicle_code
        varchar route_from
        varchar route_to
        date date_completed
        numeric fuel_cost
        numeric maintenance_cost
        numeric fuel_liters
        numeric distance_km
        text notes
        timestamptz created_at
    }

    MAINTENANCE_LOGS {
        uuid id PK
        uuid vehicle_id FK
        varchar service_type
        numeric cost
        date service_date
        varchar status "Scheduled | In Shop | Critical | Completed"
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    MAINTENANCE_ALERTS {
        uuid id PK
        uuid vehicle_id
        varchar vehicle_name
        varchar type
        text description
        varchar severity "info | warning | critical"
        varchar status "pending | completed"
        timestamptz created_at
    }

    CARGO_ORDERS {
        uuid id PK
        varchar order_number UK
        varchar status "pending | in_transit | delivered"
        varchar origin
        varchar destination
        uuid vehicle_id
        varchar vehicle_name
        varchar driver_name
        decimal weight_kg
        timestamptz created_at
    }

    VEHICLE_UTILIZATION {
        uuid id PK
        date date UK
        integer utilized_count
        integer total_count
        decimal utilization_percentage
        timestamptz created_at
    }

    ANALYTICS_DATA {
        varchar id PK
        jsonb data
        timestamptz updated_at
    }

    USERS ||--o{ TRIPS : "created_by"
    VEHICLES ||--o{ TRIPS : "vehicle_id"
    VEHICLES ||--o{ MAINTENANCE_LOGS : "vehicle_id"
    VEHICLES ||--o{ EXPENSES : "vehicle_id"
```

### Table Details

<details>
<summary><strong>users</strong> — Application users with RBAC</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `name` | VARCHAR(255) | NOT NULL | — |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | — |
| `password` | VARCHAR(255) | NOT NULL | — (bcrypt hash) |
| `role` | VARCHAR(50) | NOT NULL | `'dispatcher'` |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |
| `updated_at` | TIMESTAMPTZ | — | `NOW()` |

</details>

<details>
<summary><strong>vehicles</strong> — Fleet vehicle inventory</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `name` | VARCHAR(255) | NOT NULL | — |
| `license_plate` | VARCHAR(100) | UNIQUE, NOT NULL | — |
| `type` | VARCHAR(100) | NOT NULL | `'Truck'` |
| `max_capacity` | NUMERIC | — | `0` |
| `region` | VARCHAR(100) | — | `NULL` |
| `odometer` | NUMERIC | — | `0` |
| `status` | VARCHAR(50) | NOT NULL | `'Available'` |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |
| `updated_at` | TIMESTAMPTZ | — | `NOW()` |

**Statuses:** `Available` · `On Trip` · `In Shop` · `Critical` · `Out of Service`

</details>

<details>
<summary><strong>drivers</strong> — Driver profiles with safety metrics</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `name` | VARCHAR(255) | NOT NULL | — |
| `license_id` | VARCHAR(50) | — | — |
| `license_status` | VARCHAR(30) | — | `'valid'` |
| `experience_yrs` | INTEGER | — | `0` |
| `safety_score` | INTEGER | — | `100` |
| `status` | VARCHAR(30) | NOT NULL | `'available'` |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |
| `updated_at` | TIMESTAMPTZ | — | `NOW()` |

**Statuses:** `available` · `on_duty` · `resting` · `suspended`

</details>

<details>
<summary><strong>trips</strong> — Dispatch workflow with lifecycle tracking</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `trip_id` | VARCHAR(30) | UNIQUE, NOT NULL | Auto-generated `TR-YYYY-NNN` |
| `origin` | VARCHAR(255) | NOT NULL | — |
| `destination` | VARCHAR(255) | NOT NULL | — |
| `scheduled_departure` | TIMESTAMPTZ | — | — |
| `cargo_type` | VARCHAR(100) | NOT NULL | `'General Freight'` |
| `vehicle_id` | UUID | FK → vehicles(id) | — |
| `vehicle_name` | VARCHAR(255) | — | — |
| `driver_name` | VARCHAR(255) | — | — |
| `notes` | TEXT | — | — |
| `status` | VARCHAR(30) | NOT NULL | `'draft'` |
| `created_by` | UUID | FK → users(id) | — |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |
| `updated_at` | TIMESTAMPTZ | — | `NOW()` |

**Lifecycle:** `draft` → `dispatched` → `completed` · `cancelled`

</details>

<details>
<summary><strong>expenses</strong> — Fuel & maintenance cost tracking</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `trip_id` | VARCHAR(50) | — | — |
| `vehicle_id` | UUID | FK → vehicles(id) | — |
| `vehicle_name` | VARCHAR(255) | — | — |
| `vehicle_code` | VARCHAR(50) | — | — |
| `route_from` | VARCHAR(255) | — | — |
| `route_to` | VARCHAR(255) | — | — |
| `date_completed` | DATE | NOT NULL | `CURRENT_DATE` |
| `fuel_cost` | NUMERIC | — | `0` |
| `maintenance_cost` | NUMERIC | — | `0` |
| `fuel_liters` | NUMERIC | — | `0` |
| `distance_km` | NUMERIC | — | `0` |
| `notes` | TEXT | — | — |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |

</details>

<details>
<summary><strong>maintenance_logs</strong> — Vehicle service records</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `vehicle_id` | UUID | FK → vehicles(id), NOT NULL | — |
| `service_type` | VARCHAR(255) | NOT NULL | — |
| `cost` | NUMERIC | — | — |
| `service_date` | DATE | NOT NULL | `CURRENT_DATE` |
| `status` | VARCHAR(50) | NOT NULL | `'Scheduled'` |
| `notes` | TEXT | — | — |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |
| `updated_at` | TIMESTAMPTZ | — | `NOW()` |

**Auto-sync:** Creating a log with status `In Shop` or `Critical` automatically sets the vehicle status to `In Shop`. Completing all active logs restores the vehicle to `Available`.

</details>

<details>
<summary><strong>maintenance_alerts</strong> — Proactive maintenance warnings</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `vehicle_id` | UUID | — | — |
| `vehicle_name` | VARCHAR(255) | — | — |
| `type` | VARCHAR(255) | NOT NULL | — |
| `description` | TEXT | — | — |
| `severity` | VARCHAR(50) | — | `'warning'` |
| `status` | VARCHAR(50) | — | `'pending'` |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |

</details>

<details>
<summary><strong>cargo_orders</strong> — Cargo shipment tracking</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `order_number` | VARCHAR(100) | UNIQUE, NOT NULL | — |
| `status` | VARCHAR(50) | — | `'pending'` |
| `origin` | VARCHAR(255) | — | — |
| `destination` | VARCHAR(255) | — | — |
| `vehicle_id` | UUID | — | — |
| `vehicle_name` | VARCHAR(255) | — | — |
| `driver_name` | VARCHAR(255) | — | — |
| `weight_kg` | DECIMAL(10,2) | — | — |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |

</details>

<details>
<summary><strong>vehicle_utilization</strong> — Daily fleet utilization metrics</summary>

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `date` | DATE | UNIQUE, NOT NULL | — |
| `utilized_count` | INTEGER | — | `0` |
| `total_count` | INTEGER | — | `0` |
| `utilization_percentage` | DECIMAL(5,2) | — | `0` |
| `created_at` | TIMESTAMPTZ | — | `NOW()` |

</details>

---

## 🔌 API Reference

Base URL: `http://localhost:5000`

All responses are JSON. Protected routes require a `Bearer` token in the `Authorization` header.

### 🏥 Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/status` | ❌ | Server health check with DB connectivity test |

**Response:**
```json
{
  "status": "ok",
  "database": "postgresql (supabase)",
  "message": "Fleet-Flow API is running",
  "serverTime": "2026-02-21T11:25:08.000Z",
  "timestamp": "2026-02-21T11:25:08.000Z"
}
```

---

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Authenticate & receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user from token |

<details>
<summary><strong>POST /api/auth/register</strong></summary>

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@fleet.com",
  "password": "securepass123",
  "role": "manager"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": { "id": "uuid", "name": "John Doe", "email": "john@fleet.com", "role": "manager" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
</details>

<details>
<summary><strong>POST /api/auth/login</strong></summary>

**Request Body:**
```json
{
  "email": "john@fleet.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": "uuid", "name": "John Doe", "email": "john@fleet.com", "role": "manager" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
</details>

---

### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | ❌ | KPI summary (active fleet, alerts, utilization, cargo) |
| `GET` | `/api/dashboard/fleet-status` | ❌ | Vehicle count by status |
| `GET` | `/api/dashboard/weekly-utilization` | ❌ | 7-day utilization chart data |

<details>
<summary><strong>GET /api/dashboard/stats — Response</strong></summary>

```json
{
  "activeFleet": 18,
  "maintenanceAlerts": 3,
  "fleetUtilization": 85,
  "pendingCargoOrders": 3
}
```
</details>

<details>
<summary><strong>GET /api/dashboard/fleet-status — Response</strong></summary>

```json
{
  "total": 20,
  "available": 10,
  "onTrip": 4,
  "inShop": 4,
  "critical": 2
}
```
</details>

---

### 🚛 Vehicles — `/api/vehicles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | ❌ | List all vehicles |
| `GET` | `/api/vehicles/available` | ❌ | List only available vehicles (for dispatch) |
| `POST` | `/api/vehicles` | ✅ | Create a new vehicle |

<details>
<summary><strong>POST /api/vehicles — Request Body</strong></summary>

```json
{
  "name": "Tesla Semi - #001",
  "license_plate": "TS-001-CA",
  "type": "Truck",
  "max_capacity": 18000,
  "odometer": 0,
  "region": "West Coast"
}
```
</details>

---

### 👤 Drivers — `/api/drivers`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/drivers` | ❌ | List all drivers with their profiles |
| `GET` | `/api/drivers/available` | ❌ | List only available drivers (for dispatch) |

---

### 🗺️ Trips — `/api/trips`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/trips` | ❌ | List trips (supports `?status=all\|active\|drafts&page=1&limit=10`) |
| `POST` | `/api/trips` | ✅ | Create a new trip |
| `PATCH` | `/api/trips/:id/status` | ✅ | Update trip status (`draft` / `dispatched` / `completed` / `cancelled`) |
| `DELETE` | `/api/trips/:id` | ✅ | Cancel a trip (soft delete) |

<details>
<summary><strong>POST /api/trips — Request Body</strong></summary>

```json
{
  "origin": "Seattle, WA",
  "destination": "Portland, OR",
  "scheduled_departure": "2026-02-22T08:00:00Z",
  "cargo_type": "Electronics",
  "vehicle_id": "uuid-of-vehicle",
  "vehicle_name": "Volvo FH16 - #402",
  "driver_name": "Robert Jones",
  "notes": "Fragile cargo — handle with care",
  "status": "dispatched"
}
```
</details>

---

### 🔧 Maintenance — `/api/maintenance`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/maintenance/stats` | ✅ | KPI stats (YTD cost, in-shop count, critical, scheduled) |
| `GET` | `/api/maintenance` | ✅ | List logs with filters (`?vehicle_id=&status=&date_from=&date_to=&search=`) |
| `GET` | `/api/maintenance/export/csv` | ✅ | Download logs as CSV |
| `GET` | `/api/maintenance/:id` | ✅ | Single log detail |
| `POST` | `/api/maintenance` | ✅ | Create a maintenance log |
| `PUT` | `/api/maintenance/:id` | ✅ | Update a log |
| `DELETE` | `/api/maintenance/:id` | ✅ | Delete a log |

---

### 💰 Expenses — `/api/expenses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/expenses/stats` | ✅ | Monthly totals (cost, liters, km) |
| `GET` | `/api/expenses` | ✅ | List with filters (`?vehicle_id=&date_from=&date_to=&search=`) |
| `GET` | `/api/expenses/export/csv` | ✅ | Download expenses as CSV |
| `POST` | `/api/expenses` | ✅ | Create an expense record |
| `DELETE` | `/api/expenses/:id` | ✅ | Delete an expense |

---

### 📈 Analytics — `/api/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | ✅ | Full analytics dashboard (KPIs, charts, fuel efficiency, ROI, costs) |

<details>
<summary><strong>Response Structure</strong></summary>

```json
{
  "kpis": [
    { "label": "Total Expenses", "value": "$7,812", "change": "+8.2%", "type": "up", "icon": "💵" },
    { "label": "Avg. Cost / Mile", "value": "$1.42", "change": "-2.1%", "type": "up", "icon": "🪙" },
    { "label": "Total Fuel Cost", "value": "$6,018", "change": "+1.5%", "type": "neutral", "icon": "⛽" },
    { "label": "Active Utilization", "value": "100.0%", "change": "+700.0%", "type": "up", "icon": "⏱️" }
  ],
  "charts": {
    "30 Days": [{ "label": "Feb 04", "val": 55, "dot": 60 }],
    "90 Days": [...],
    "Year": [...]
  },
  "fuel_efficiency": [
    { "category": "Van / Light", "km_per_liter": "6.8" },
    { "category": "Standard Truck", "km_per_liter": "3.2" },
    { "category": "Diesel (Heavy)", "km_per_liter": "2.9" }
  ],
  "roi_leaders": [
    { "id": "V-VAN15", "percent": 122, "color": "#16a34a" }
  ],
  "monthly_costs": [
    { "v": "Freightliner Cascadia - #610", "cost": "$380", "maint": "$310" }
  ]
}
```
</details>

---

### 🔍 Global Search — `/api/search`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search?q=<query>` | ❌ | Search across vehicles, drivers, trips, maintenance (top 5 per category) |

**Minimum query length:** 2 characters

<details>
<summary><strong>Example Response</strong></summary>

```json
{
  "vehicles": [
    { "id": "uuid", "name": "Volvo FH16 - #402", "license_plate": "V78-992-KL", "type": "Truck", "status": "On Trip", "region": "North West" }
  ],
  "drivers": [
    { "id": "uuid", "name": "Robert Jones", "license_id": "DRV-7712", "status": "on_duty", "experience_yrs": 12, "safety_score": 99 }
  ],
  "trips": [
    { "id": "uuid", "trip_id": "TR-2026-001", "origin": "Seattle, WA", "destination": "Portland, OR", "status": "completed" }
  ],
  "maintenance": [
    { "id": "uuid", "service_type": "Engine Transmission Failure", "status": "Critical", "cost": "4250" }
  ]
}
```
</details>

---

## 🔐 Authentication & Authorization

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as PostgreSQL

    C->>S: POST /api/auth/register {name, email, password, role}
    S->>S: Validate input + hash password (bcrypt, 12 rounds)
    S->>DB: INSERT INTO users
    DB-->>S: User created
    S->>S: Sign JWT {id, email, role} (expires: 7d)
    S-->>C: 201 {user, token}

    Note over C: Store token in localStorage/sessionStorage

    C->>S: GET /api/maintenance (Authorization: Bearer <token>)
    S->>S: Verify JWT signature + expiry
    S->>S: Attach req.user = {id, email, role}
    S->>DB: SELECT * FROM maintenance_logs
    DB-->>S: Results
    S-->>C: 200 [logs...]
```

### Role-Based Access Control

| Role | Capabilities |
|---|---|
| **Manager** | Full access — create/edit/delete vehicles, trips, maintenance, expenses |
| **Dispatcher** | Full access — create/edit/delete vehicles, trips, maintenance, expenses |

The `authorize(...roles)` middleware supports restricting endpoints to specific roles (e.g., `authorize('manager')`), ready for expansion.

### Token Storage

- **"Remember Me" enabled** → `localStorage`
- **"Remember Me" disabled** → `sessionStorage`

---

## 🌐 Frontend Routes

| Path | Component | Auth | Description |
|---|---|---|---|
| `/` | `Landing` | ❌ | Public landing page |
| `/login` | `Login` | ❌ | Login form |
| `/signup` | `Signup` | ❌ | Registration form |
| `/dashboard` | `CommandCenter` | 🔓 | Main dashboard |
| `/vehicles` | `VehicleRegistry` | 🔓 | Fleet management |
| `/dispatch` | `TripDispatcher` | 🔓 | Trip dispatch |
| `/maintenance` | `MaintenanceLogs` | 🔓 | Service records |
| `/expenses` | `ExpensesFuel` | 🔓 | Cost tracking |
| `/drivers` | `DriverProfiles` | 🔓 | Driver roster |
| `/analytics` | `Analytics` | 🔓 | Business intelligence |
| `*` | → `/dashboard` | — | Catch-all redirect |

---

## 🧩 Component Architecture

### Layout Components

| Component | Path | Description |
|---|---|---|
| `DashboardLayout` | `components/layout/DashboardLayout.jsx` | Main app shell — sidebar, header with search, breadcrumbs, user profile dropdown, logout |
| `Sidebar` | `components/layout/Sidebar.jsx` | Fixed left navigation with links to all pages |

### UI Primitives

Reusable, composable components built with class-variance-authority and Tailwind:

| Component | Path | Description |
|---|---|---|
| `Button` | `components/ui/button.jsx` | Variant-based button (default, destructive, outline, secondary, ghost, link) |
| `Card` | `components/ui/card.jsx` | Card container with header, title, description, content, footer |
| `Table` | `components/ui/table.jsx` | Full table system (Table, Header, Body, Row, Head, Cell, Caption, Footer) |
| `Badge` | `components/ui/badge.jsx` | Status indicator with variants (default, secondary, destructive, outline) |
| `Avatar` | `components/ui/avatar.jsx` | User avatar with image + fallback |
| `Progress` | `components/ui/progress.jsx` | Progress bar |
| `Separator` | `components/ui/separator.jsx` | Horizontal/vertical divider |

### Key Frontend Features

- **Debounced Global Search** — 300ms debounce, categorized results across all entities
- **Vite Proxy** — All `/api/*` requests are proxied from `localhost:5173` → `localhost:5000`
- **Path Aliases** — `@/` maps to `src/` for clean imports
- **Auto Table Creation** — Server creates all tables on startup, no migrations needed
- **Seed Data** — 20 vehicles, 15 drivers, 25 trips, 22 expenses, 8 maintenance logs, 5 alerts, 5 cargo orders, and 7 days of utilization data are auto-seeded

---

## 📜 Available Scripts

### Root (Fleet-Flow/)

| Command | Description |
|---|---|
| `npm run dev` | Start both client & server concurrently |
| `npm run client` | Start only the React dev server (port 5173) |
| `npm run server` | Start only the Express API server (port 5000) |
| `npm run install-all` | Install dependencies for root + server + client |
| `npm run build` | Build the React app for production |

### Client (client/)

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build locally |

### Server (server/)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm start` | Start with Node.js (production) |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style

- Frontend: ESLint with React Hooks & React Refresh plugins
- Backend: CommonJS modules (`require` / `module.exports`)
- Database: Parameterized queries (`$1, $2, ...`) — no string concatenation

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ by the Fleet-Flow team</strong>
  <br />
  <sub>Making fleet management simpler, smarter, and more efficient.</sub>
</p>
