# QReports - Professional Frontend

Modern, production-grade frontend for QReports, built with Next.js 14+ (App Router), TypeScript, and Shadcn/UI.
Designed to be calm, legible, and optimized for heavy data workloads.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend running (see `backend/README.md` or root README)

### Installation
```bash
cd frontend
npm install
```

### Running Locally
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI (Radix Primitives)
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: React Context (for Auth) + Query Cache
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table (Headless)

## 🔗 Backend Integration
This frontend connects to the Express backend.
The backend was extended with the following endpoints to support the frontend:

- `POST /api/auth/login`: Authenticate users (JWT).
- `GET /api/definitions`: List reports.
- `POST /api/definitions`: Create report.
- `GET /api/definitions/:id`: Get report details.
- `PUT /api/definitions/:id`: Update report.
- `POST /api/reports/execute`: Execute report SQL.

## ⚙️ Environment Variables
Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📂 Project Structure
- `app/`: Next.js App Router pages and layouts.
  - `(auth)/`: Authentication routes (Login).
  - `(dashboard)/`: Protected routes (Main app).
- `components/`:
  - `ui/`: Shadcn atoms (Button, Input, etc.).
  - `reports/`: Domain components (ReportEditor, ResultsTable).
- `contexts/`: Global state (AuthContext).
- `lib/`: Utilities (API client, Query Client).

## ✨ Key Features
- **AppShell**: Responsive sidebar, mobile support.
- **Authentication**: Secure JWT auth with interceptors.
- **Report Builder**: Create/Edit SQL reports with metadata.
- **Report Runner**: Execute SQL and view results in a paginated table.
- **Data Visualization**: Clean, tabular data presentation.
