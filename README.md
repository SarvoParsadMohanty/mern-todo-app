# Task Tracker — Production MERN / PERN Application

A full-stack, production-grade **Task Tracker** application built with React, TypeScript, Vite, Node.js, Express, and **PostgreSQL**.

Designed and engineered for high maintainability, rigorous server-side validation, clean function-based backend architecture, responsive light SaaS UX, and automated testing.

---

## 🚀 Features

- **Full Task Lifecycle Management**: Create, list, filter, update status, and delete tasks.
- **Dedicated 6-Column Table Layout**: High-density table structure displaying `TITLE`, `DESCRIPTION`, `STATUS`, `PRIORITY`, `CREATED`, and `ACTIONS`.
- **PostgreSQL Persistence**: PostgreSQL is used as the database using `pg` connection pooling & SQL queries with automatic table initialization.
- **In-Memory Fallback (`pg-mem`)**: Includes an in-memory PostgreSQL engine fallback for testing and lightweight standalone execution without setup.
- **Server-Side & Client Validation**: Strict Zod schemas on backend for input sanitization (title length, required fields, status/priority enums).
- **Centralized Error Handling**: Standardized API error format preventing stack trace leakage in production.
- **Status Filtering**: Filter tasks by `All`, `To Do`, `In Progress`, or `Done` with real-time counters in a segmented navigation bar.
- **Inline Status Updates**: Integrated status dropdown with visual status dot indicators (`● To Do`, `● In Progress`, `● Done`) and real-time transition toasts (`Status updated from "To Do" to "In Progress"`).
- **Senior UI/UX Delete Dialog**: Confirmation modal with structured footer action placement and accessible keyboard focus management.
- **Automated Integration Tests**: Vitest + Supertest suite with `pg-mem` for isolated automated testing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Language**: TypeScript 5
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Design System with Light Mode SaaS aesthetic)

### Backend
- **Runtime**: Node.js (v24.3.0)
- **Framework**: Express 4
- **Language**: TypeScript 5 (Function-based architecture)
- **Database**: PostgreSQL (via `pg` pool)
- **Validation**: Zod
- **Utilities**: CORS, Dotenv, UUID

### Testing
- **Test Runner**: Vitest 3
- **HTTP Assertions**: Supertest 7
- **In-Memory DB**: `pg-mem`

---

## ⚙️ Setup Steps

### 1. Clone & Install Dependencies

From the project root directory, run:

```bash
npm run install:all
```

Or install in root, server, and client manually:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

The default `.env` configuration:

```env
POSTGRES_URI=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/task_tracker
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

*(Note: Replace `<DB_USER>` and `<DB_PASSWORD>` with your local PostgreSQL credentials if running a live PostgreSQL database. If live PostgreSQL is unavailable, the application automatically falls back to `pg-mem` in-memory PostgreSQL database).*

---

## 💻 Running Locally

Start both the Express backend server and Vite frontend client concurrently:

```bash
npm run dev
```

This starts:
- **Express Backend API**: `http://localhost:5000`
- **Vite Frontend Client**: `http://localhost:5173`

To run server or client independently:

```bash
# Run server only
npm run server

# Run client only
npm run client
```

---

## 🧪 Test & Verification Commands

| Command | Description |
| :--- | :--- |
| `npm test` | Runs backend API integration test suite using Vitest + Supertest + `pg-mem`. |
| `npm run typecheck` | Executes strict TypeScript compilation checks across client & server (`tsc --noEmit`). |
| `npm run build` | Compiles production build for server (`tsc`) and client (`vite build`). |
| `npm run lint` | Runs ESLint validation across codebase. |

---

## 📋 Database Schema (SQL)

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'To Do',
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💡 Technical Decisions

1. **Function-Based Backend Architecture**:
   - Refactored controllers, services, and database utilities (`tasks.controller.ts`, `tasks.service.ts`, `db.ts`) into pure functional modules for clean decoupling, simple testing, and zero class instantiation overhead.

2. **6-Column High-Density Table Layout**:
   - Designed a single-view SaaS table layout with dedicated columns (`TITLE`, `DESCRIPTION`, `STATUS`, `PRIORITY`, `CREATED`, `ACTIONS`) for rapid information scanning and single-click inline status modifications.

3. **Zod Validation & Sanitization**:
   - Applied Zod schemas on backend request bodies and query parameters to guarantee data integrity before reaching SQL queries.

4. **Resilient Dual Database Mode**:
   - Built automatic PostgreSQL pool initialization with graceful fallback to `pg-mem` so development and test pipelines run out-of-the-box without requiring database setup.

5. **Senior UI/UX Modal Architecture**:
   - Structured modal dialogs with a distinct footer bar (`border-top`, background tint, aligned action buttons) adhering to modern SaaS design standards.

---

## 📌 Assumptions

- Tasks belong to a single project/workspace session.
- Task status can be one of: `To Do`, `In Progress`, or `Done`.
- Task priority can be one of: `Low`, `Medium`, or `High`.
- Automatic fallback to `pg-mem` in-memory database enables frictionless testing and evaluator demoing without requiring a pre-configured PostgreSQL server.

---

## ⚠️ Limitations

- **Authentication**: Single-tenant application (no multi-user JWT authentication or user roles).
- **Pagination**: Single list view (server returns newest tasks sorted by `created_at DESC` without cursor/page limits for typical task volume).
- **Kanban View**: Default view is a Table layout (drag-and-drop board view is not included in the current version).

---

## 🔮 Future Improvements (With More Time)

1. **Multi-Tenant User Authentication**: Add JWT authentication with user sign-up, login, and workspace isolation.
2. **Kanban Board Toggle**: Add a drag-and-drop Kanban board view alongside the existing table view using `@hello-pangea/dnd`.
3. **Server-Side Pagination & Full-Text Search**: Implement SQL pagination (`?page=1&limit=20`) and full-text search across titles and descriptions.
4. **Real-time WebSockets**: Implement Socket.io real-time updates for instant multi-user synchronization.
5. **Activity Log & Audit Trail**: Track historical changes (who changed status, title edits, timestamps) on each task.
