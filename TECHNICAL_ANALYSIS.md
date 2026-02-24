# Technical System Analysis

> Version: v0.2.0
> Last updated: 2026-02-24
> Scope: Full-stack reporting platform prototype

---

<!-- CHANGE TRACKING RULES
  Section IDs:   SECTION-<DOMAIN>-<NN>
  Item IDs:      <DOMAIN>-<NN>-ITEM-<NN>
  - Do not renumber existing items.
  - Do not reuse IDs.
  - New items append the next sequential number.
  - Removed items are marked Status: Deprecated (never deleted).
  - Each item may include: Impact Level, Risk Category, Status.

  UPDATE MODE:
  - Only modify the affected section.
  - Append new items using the next available ID.
  - Never regenerate the entire document.
  - Keep identifiers unchanged for existing entries.
  - Maintain consistency in terminology.
-->

---

## SECTION-ARCH-01: System Architecture Overview

### Current State

- **ARCH-01-ITEM-01:** Architectural style -- Monorepo with two independent workspaces (`backend/`, `frontend/`), containerized via Docker Compose, layered backend (controllers -> services -> repositories)
- **ARCH-01-ITEM-02:** Frontend/backend separation -- Fully decoupled; Next.js 16 frontend communicates with Express backend exclusively via REST API over HTTP
- **ARCH-01-ITEM-03:** API communication -- JSON over REST; Axios client with interceptors for auth token injection and 401 auto-redirect; no API versioning
- **ARCH-01-ITEM-04:** Deployment strategy -- Docker Compose orchestration with three services (`mysql`, `backend`, `frontend`); bind-mount volumes for development hot-reload; production Dockerfile compiles TypeScript to `dist/`
- **ARCH-01-ITEM-05:** Multi-tenant model -- Central auth database (`qreports_auth`) stores client/tenant metadata; each client references an external database (`db_host`, `db_port`, `db_name`); connection pools are created dynamically per tenant and cached in-memory

### Architectural Strengths

- **ARCH-01-ITEM-06:** Clean separation between auth database and client report databases
- **ARCH-01-ITEM-07:** Dynamic per-tenant connection pooling with in-memory cache and TTL expiration
- **ARCH-01-ITEM-08:** Role-based credential selection (read-only vs read-write) at the middleware level
- **ARCH-01-ITEM-09:** Consistent error handling via `AppError` / `ErrorFactory` pattern across the backend
- **ARCH-01-ITEM-10:** Two distinct report composition models: free-form canvas editor and section-based vertical composer (Bold Reports-inspired)
- **ARCH-01-ITEM-11:** Zod schema validation shared conceptually between frontend (server actions) and backend (request validation)
- **ARCH-01-ITEM-12:** Feature flags via environment variables (`VITE_ENABLE_*`)

### Architectural Limitations

- **ARCH-01-ITEM-13:** No API versioning (`/api/reports` instead of `/api/v1/reports`)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **ARCH-01-ITEM-14:** Dual configuration systems coexist: `env.config.ts` (strict, throws on missing vars) and `unifiedConfig.ts` (lenient, uses defaults) -- potential source of inconsistency
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **ARCH-01-ITEM-15:** Duplicate route registration: `reportRoutes.ts` re-registers `/execute` and `/export-pdf` alongside the new CRUD routes, overlapping with `report.routes.ts`
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **ARCH-01-ITEM-16:** No shared type package between frontend and backend; types are duplicated (e.g., `QueryResult`, `LoginResponse`)
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Done

- **ARCH-01-ITEM-17:** No API contract enforcement (no OpenAPI/Swagger spec)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **ARCH-01-ITEM-18:** Frontend port mismatch: Docker Compose exposes `5173` (Vite convention) but frontend is Next.js (default `3000`)
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

---

## SECTION-BE-02: Backend Design Analysis

### Current State

- **BE-02-ITEM-01:** Layer structure
  - `config/` -- Database pools, env loading, Puppeteer config, security constants
  - `controllers/` -- Request handling; mix of class-based (`BaseController`, `ReportController`) and functional (`report.controller.ts`, `report-def.controller.ts`)
  - `services/` -- Business logic (`auth.service.ts`, `query.service.ts`, `pdf.service.ts`, `db.service.ts`, `validation.service.ts`)
  - `repositories/` -- Data access (`auth.repository.ts`, `ReportRepository.ts`)
  - `middlewares/` -- Auth, rate limiting, error handling, request logging
  - `validators/` -- Zod schemas for report payloads
  - `types/` -- TypeScript interfaces and Express augmentation
  - `utils/` -- `asyncErrorWrapper` for promise-based route handlers

- **BE-02-ITEM-02:** Responsibility separation -- Controllers delegate to services; services delegate to repositories for data access; auth middleware handles JWT verification and tenant-specific pool injection into `req.db`

- **BE-02-ITEM-03:** SQL execution strategy -- User-submitted SQL is validated via `validation.service.ts` (SELECT/WITH-only whitelist, forbidden keyword blacklist, length limit); executed against the tenant's database pool with a 30s `Promise.race` timeout; result rows capped at 50,000

- **BE-02-ITEM-04:** Security mechanisms
  - JWT authentication with bcrypt password hashing (salt rounds: 10)
  - Rate limiting: 10 queries/min on execution endpoints, 60 req/min general
  - SQL validation: SELECT-only enforcement, forbidden DML keyword detection
  - Role-based DB credential selection (`pickDbCredential`), currently forced to read-only
  - Soft-delete pattern for user deactivation

- **BE-02-ITEM-05:** Validation approach -- Zod schemas for report CRUD payloads; manual validation in auth routes; SQL validation via custom service

### Strengths

- **BE-02-ITEM-06:** Repository pattern with dependency injection in `reportRoutes.ts` (composition root)
- **BE-02-ITEM-07:** `BaseController` abstract class standardizes HTTP response codes
- **BE-02-ITEM-08:** Custom `AppError` hierarchy with `isOperational` flag for distinguishing expected vs unexpected errors
- **BE-02-ITEM-09:** Connection pool caching with composite key (`host:port:db:user`) prevents pool proliferation
- **BE-02-ITEM-10:** Client connection metadata cached with 60s TTL to reduce auth DB queries
- **BE-02-ITEM-11:** Parameterized queries (`execute` with `?` placeholders) in all repository methods

### Current Technical Constraints

- **BE-02-ITEM-12:** `validation.service.ts` line 9: logic bug -- `||` operator instead of `&&` caused SELECT-only check to always pass
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

- **BE-02-ITEM-13:** `ErrorFactory.notFound` incorrectly formats the message string (wraps entire string including status code in the message parameter)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **BE-02-ITEM-14:** Puppeteer launches a new browser instance per PDF export (`launchBrowser` + `browser.close()`); no browser pool or reuse
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

- **BE-02-ITEM-15:** `report-def.controller.ts` calls `ensureTableExists()` on every `list` and `create` request -- DDL on every read
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Done

- **BE-02-ITEM-16:** No request body size validation beyond Express's 50MB JSON limit
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **BE-02-ITEM-17:** `requestLogger` is minimal (method + URL only); no correlation IDs, no response time tracking
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **BE-02-ITEM-18:** Mixed controller patterns (class-based and functional) reduce consistency
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **BE-02-ITEM-19:** `unifiedConfig.ts` defaults to `"default_secret_dont_use_in_prod"` for JWT secret -- risk if env var is missing
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

---

## SECTION-FE-03: Frontend Architecture Analysis

### Current State

- **FE-03-ITEM-01:** Framework -- Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS 4
- **FE-03-ITEM-02:** Component library -- shadcn/ui (New York style) with Radix UI primitives
- **FE-03-ITEM-03:** Structure
  - `app/(auth)/` -- Login page (route group)
  - `app/(dashboard)/` -- Protected layout with sidebar, dashboard, reports, users, settings
  - `components/` -- Shared UI (`ui/`), domain components (`reports/`, `database/`, `sql/`, `users/`)
  - `features/report-composer/` -- Self-contained feature module with barrel export, types, hooks, components
  - `hooks/` -- `use-auth`, `use-database`, `use-sql-execution`, `use-report-editor`, `use-mobile`
  - `contexts/` -- `DatabaseContext` for global DB connection state
  - `services/` -- API service layers (`auth/`, `reports/`, `users/`)
  - `utils/` -- Axios instance with interceptors, constants
  - `actions/` -- Next.js server actions (login validation)

- **FE-03-ITEM-04:** State management
  - React Context for auth state (`AuthContext`) and database connection state (`DatabaseContext`)
  - `useReducer` for complex editor state (`useReportEditor`, `useReportComposer`) with undo/redo history
  - TanStack React Query for server state caching (1min stale time, single retry)
  - Local component state via `useState` for execution state (`useSqlExecution`)

- **FE-03-ITEM-05:** API communication -- Centralized Axios instance (`utils/api.ts`) with request interceptor (Bearer token injection from localStorage) and response interceptor (401 auto-logout/redirect)

### Scalability Considerations

- **FE-03-ITEM-06:** TanStack React Query provides cache invalidation and deduplication foundation
- **FE-03-ITEM-07:** `@tanstack/react-virtual` dependency present for virtualized table rendering of large datasets
- **FE-03-ITEM-08:** `@tanstack/react-table` for headless table logic
- **FE-03-ITEM-09:** Monaco Editor integration (`@monaco-editor/react`) for SQL editing
- **FE-03-ITEM-10:** Resizable panels (`react-resizable-panels`) for flexible layout

### UI Architecture Maturity

- **FE-03-ITEM-11:** Two report editing paradigms coexist
  - **Canvas editor** (`components/reports/`): Free-form drag-and-drop with x/y positioning, alignment guides, resize handles, properties panel
  - **Section composer** (`features/report-composer/`): Vertical stack model with typed sections (header, text, table, page-break), SQL bindings, page config
- **FE-03-ITEM-12:** Feature module pattern (`features/report-composer/`) with barrel exports demonstrates evolving toward feature-sliced architecture
- **FE-03-ITEM-13:** shadcn/ui provides consistent design system with theme support (dark/light via `next-themes`)
- **FE-03-ITEM-14:** Dashboard layout uses sidebar with collapsible state, URL-driven modals (datasources)

### Identified Improvement Areas

- **FE-03-ITEM-15:** Auth state stored in `localStorage` without token expiry validation on the client side; relies solely on server-side JWT verification
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Done

- **FE-03-ITEM-16:** `AuthContext` parses stored JSON on mount without try/catch -- corrupted localStorage will crash the app
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **FE-03-ITEM-17:** `constants.ts` defines `API_URL` with port `3001` while `api.ts` defaults to port `3000` -- inconsistency
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Done

- **FE-03-ITEM-18:** No error boundary components for graceful failure handling
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **FE-03-ITEM-19:** No loading skeletons or suspense boundaries beyond the dashboard layout loader
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **FE-03-ITEM-20:** Server actions (`actions/auth.ts`) validate login input but the result is not consumed by the login flow in `AuthContext`
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **FE-03-ITEM-21:** `DatabaseProvider` auto-fetch is commented out; status polling disabled -- manual refresh only
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **FE-03-ITEM-22:** No frontend test files exist
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

---

## SECTION-INFRA-04: Infrastructure & DevOps Strategy

### Current State

- **INFRA-04-ITEM-01:** Docker orchestration -- Three-service `docker-compose.yml` (MySQL 8.0, backend, frontend) on a shared bridge network (`qreports-network`)
- **INFRA-04-ITEM-02:** Health checks -- MySQL service has `mysqladmin ping` health check with 5s interval, 3s timeout, 10 retries; backend depends on MySQL health
- **INFRA-04-ITEM-03:** Init script -- `docker/mysql/init.sh` creates read-only (`powerbi`) and read-write (`admin`) MySQL users, grants scoped permissions
- **INFRA-04-ITEM-04:** Environment handling -- Root `.env` file with `docker-compose.yml` variable interpolation; backend loads from both `../.env` and local `.env` via dotenv
- **INFRA-04-ITEM-05:** Volume strategy
  - Bind mounts for source code (`./backend:/app`, `./frontend:/app`) with anonymous volume for `node_modules`
  - Named volume `mysql-data` declared but not referenced in the MySQL service definition

### Service Isolation

- **INFRA-04-ITEM-06:** All services on a single Docker network; no network segmentation between frontend and database
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **INFRA-04-ITEM-07:** Backend connects to MySQL via internal Docker DNS (`mysql` hostname)

- **INFRA-04-ITEM-08:** Frontend container exposed on port `5173` (Vite convention, but runs Next.js)
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

### Production Readiness Assessment

- **INFRA-04-ITEM-09:** Bind-mount volumes are development-only; production needs built images with `COPY`
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **INFRA-04-ITEM-10:** No multi-stage Docker builds for frontend
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **INFRA-04-ITEM-11:** No Nginx reverse proxy or TLS termination
  - Impact Level: High
  - Risk Category: Security
  - Status: Open

- **INFRA-04-ITEM-12:** No Docker health check on backend or frontend services
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **INFRA-04-ITEM-13:** `mysql-data` volume declared but not mounted -- database data is not persisted across container restarts
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Done

- **INFRA-04-ITEM-14:** Backend Dockerfile runs `npm run build` but compose overrides with bind mount, negating the build step in dev
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

### Missing DevOps Elements

- **INFRA-04-ITEM-15:** No CI/CD pipeline (GitHub Actions planned but absent)
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **INFRA-04-ITEM-16:** No container image registry configuration
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **INFRA-04-ITEM-17:** No Dockerfile for frontend (or not referenced in compose)
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **INFRA-04-ITEM-18:** No log aggregation or structured logging
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **INFRA-04-ITEM-19:** No secrets management (plain text in `.env`)
  - Impact Level: High
  - Risk Category: Security
  - Status: Open

- **INFRA-04-ITEM-20:** No backup automation for MySQL
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **INFRA-04-ITEM-21:** No resource limits (CPU/memory) on containers
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **INFRA-04-ITEM-22:** No Docker Compose profiles for dev vs production
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

---

## SECTION-SEC-05: Security Assessment

### Current State

- **SEC-05-ITEM-01:** SQL injection mitigation
  - Parameterized queries (`?` placeholders) in all repository methods for auth and report CRUD
  - User-submitted SQL for report execution passes through `validation.service.ts`: SELECT/WITH-only whitelist, DML keyword blacklist (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `TRUNCATE`, `INSERT`), 35K character limit
  - Read-only database credentials enforced at middleware level for report execution

- **SEC-05-ITEM-02:** Rate limiting
  - `express-rate-limit` on query execution: 10 req/min per IP
  - General rate limit: 60 req/min per IP
  - Standard rate limit headers returned (`RateLimit-*`)

- **SEC-05-ITEM-03:** Authentication
  - JWT-based with bcrypt password hashing
  - Token injected via `Authorization: Bearer` header
  - Role-based access control: `admin`, `user`, `viewer`
  - Admin-only routes for user management (checked inline in route handlers)

- **SEC-05-ITEM-04:** Environment isolation
  - Separate database pools for auth (`authPool`) and tenant data (dynamic pools)
  - Credential separation: read-only vs read-write users at the MySQL level
  - Docker network isolation (single bridge network)

### Identified Vulnerabilities

- **SEC-05-ITEM-05:** SQL validation logic bug (`||` instead of `&&` in `validation.service.ts`) meant the SELECT-only check was effectively bypassed
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

- **SEC-05-ITEM-06:** Forbidden keyword check uses simple `includes()` on normalized string -- can be bypassed with comments (`/*DELETE*/`), string literals (`'DELETE'`), or substrings in identifiers (`UPDATED_AT`)
  - Impact Level: High
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-07:** `unifiedConfig.ts` falls back to `"default_secret_dont_use_in_prod"` for JWT secret if env var is missing -- tokens signed with a known secret
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

- **SEC-05-ITEM-08:** No CSRF protection on state-changing endpoints
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-09:** `express.json({ limit: '50mb' })` allows large payloads without content validation -- potential for memory exhaustion
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-10:** JWT tokens stored in `localStorage` -- vulnerable to XSS
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-11:** No token refresh mechanism; tokens valid for 4-8 hours with no revocation capability
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-12:** CORS configured with single origin (`FRONTEND_URL` or `localhost:5173`); no origin validation for production
  - Impact Level: Low
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-13:** Error handler exposes full error details in non-production environments
  - Impact Level: Low
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-14:** `--no-sandbox` flag on Puppeteer reduces Chrome isolation
  - Impact Level: Low
  - Risk Category: Security
  - Status: Open

### Recommended Improvements

- **SEC-05-ITEM-15:** Implement SQL parsing (AST-based) instead of string matching for effective injection prevention
  - Impact Level: High
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-16:** Add CSRF tokens or SameSite cookie-based auth
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-17:** Implement token refresh rotation
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-18:** Add request payload size limits per endpoint
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-19:** Move JWT storage to httpOnly cookies
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-20:** Add IP-based login attempt throttling
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-21:** Implement audit logging for sensitive operations
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SEC-05-ITEM-22:** Add Content Security Policy headers
  - Impact Level: Low
  - Risk Category: Security
  - Status: Open

---

## SECTION-SCALE-06: Scalability Assessment

### Current Bottlenecks

- **SCALE-06-ITEM-01:** Puppeteer per-request -- Each PDF export launches a full Chromium instance, consumes ~100-300MB RAM, and blocks until rendering completes
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-02:** In-memory pool cache -- `poolCache` and `clientConnCache` in `auth.middleware.ts` are process-local; no eviction policy beyond TTL, no max size limit -- unbounded memory growth with many tenants
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-03:** Single-process Node.js -- No clustering or worker threads; CPU-bound PDF rendering blocks the event loop
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-04:** No connection pool cleanup -- Dynamic tenant pools are created but never destroyed; long-running server accumulates idle connections
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

### Performance Risks

- **SCALE-06-ITEM-05:** 50,000 row result limit with full JSON serialization can produce 5-10MB responses
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-06:** No pagination on query execution endpoint; entire result set loaded into memory
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-07:** `ensureTableExists()` DDL executed on every list/create request to `report-def.controller.ts`
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Done

- **SCALE-06-ITEM-08:** No query result caching; identical queries re-execute against the database
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-09:** TanStack React Query stale time is 1 minute -- frequent refetches for unchanged data
  - Impact Level: Low
  - Risk Category: Performance
  - Status: Open

### Database Scaling Considerations

- **SCALE-06-ITEM-10:** Connection pool limit: 10 per tenant per credential type; with many concurrent tenants, MySQL `max_connections` may be exhausted
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-11:** No read replica support; all queries hit the primary
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-12:** No query plan analysis or slow query logging
  - Impact Level: Low
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-13:** No database connection pooling proxy (e.g., ProxySQL)
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

### Horizontal vs Vertical Scaling Strategy

- **SCALE-06-ITEM-14:** Current -- Vertical only (single container per service)
- **SCALE-06-ITEM-15:** Horizontal blockers -- In-memory caches (pool cache, client connection cache) are not shared across instances; no external session store; no sticky sessions
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-16:** Path to horizontal -- Extract caches to Redis; use external connection pooler; stateless backend behind load balancer
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

### Caching Possibilities

- **SCALE-06-ITEM-17:** Redis for JWT blacklist/revocation
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Open

- **SCALE-06-ITEM-18:** Redis for tenant connection metadata (replace in-memory `clientConnCache`)
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-19:** Query result caching with TTL for frequently-run reports
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-20:** Puppeteer browser pool (warm instances) to amortize startup cost
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

- **SCALE-06-ITEM-21:** CDN for static frontend assets
  - Impact Level: Low
  - Risk Category: Performance
  - Status: Open

### Multi-Tenant Evolution Path

- **SCALE-06-ITEM-22:** Current -- Shared auth DB + per-tenant external DB references
- **SCALE-06-ITEM-23:** Next -- Tenant-scoped resource quotas (connection limits, query timeouts, rate limits)
  - Impact Level: Medium
  - Risk Category: Scalability
  - Status: Open

- **SCALE-06-ITEM-24:** Future -- Tenant isolation levels (shared pool -> dedicated pool -> dedicated instance)
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

---

## SECTION-DEBT-07: Technical Debt & Improvement Areas

### Refactoring Opportunities

- **DEBT-07-ITEM-01:** Unify configuration -- Consolidate `env.config.ts` and `unifiedConfig.ts` into a single validated config module
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **DEBT-07-ITEM-02:** Unify controller patterns -- Migrate functional controllers to class-based (`BaseController`) or vice versa; eliminate mixed patterns
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-03:** Resolve route duplication -- `reportRoutes.ts` and `report.routes.ts` both register `/execute` and `/export-pdf`; consolidate into one
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **DEBT-07-ITEM-04:** Extract auth checks -- Inline `req.user?.role !== 'admin'` checks in route handlers should be extracted to a role-guard middleware
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-05:** Fix `ErrorFactory.notFound` -- Status code 500 and malformed message string
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **DEBT-07-ITEM-06:** Remove `ensureTableExists` from request path -- Run DDL in migration scripts, not on every API call
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Done

- **DEBT-07-ITEM-07:** Standardize API response envelope -- Some endpoints return `{ success, data }`, others return raw arrays
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-08:** Align port conventions -- Frontend Docker config, constants, and API defaults reference different ports
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

### Missing Test Coverage

- **DEBT-07-ITEM-09:** Zero test files in both backend and frontend
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Done

- **DEBT-07-ITEM-10:** No unit tests for services, repositories, or validators
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-11:** No integration tests for API endpoints
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-12:** No E2E tests for critical flows (login, query execution, PDF export)
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-13:** `test:api` script exists but is a manual script, not a test framework
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

### Observability Gaps

- **DEBT-07-ITEM-14:** `requestLogger` logs method and URL only; no request ID, duration, status code, or user context
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-15:** No structured logging (JSON format) for log aggregation
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-16:** No distributed tracing
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-17:** No metrics collection (request latency, error rates, pool utilization)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-18:** Console-based logging only; no log levels or transports
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

### Monitoring Requirements

- **DEBT-07-ITEM-19:** Application health endpoint exists (`/api/health`) but returns minimal data
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-20:** No database pool health metrics exposed
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-21:** No Puppeteer process monitoring
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Open

- **DEBT-07-ITEM-22:** No alerting configuration
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-23:** No uptime monitoring
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

### Documentation Gaps

- **DEBT-07-ITEM-24:** No API documentation (Swagger/OpenAPI)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-25:** No architecture decision records (ADRs)
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-26:** No database schema migration history
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-27:** No runbook for common operations
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

- **DEBT-07-ITEM-28:** `README.md` project structure section is outdated (references Vite instead of Next.js)
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

---

## SECTION-ROADMAP-08: Suggested Technical Evolution Roadmap

### Short Term (v0.2.0)

- **ROADMAP-08-ITEM-01:** Fix SQL validation logic bug in `validation.service.ts` (critical security fix)
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

- **ROADMAP-08-ITEM-02:** Fix `ErrorFactory.notFound` status code and message formatting
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **ROADMAP-08-ITEM-03:** Consolidate `env.config.ts` and `unifiedConfig.ts` into single config module
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **ROADMAP-08-ITEM-04:** Remove `ensureTableExists()` from request handlers; move to startup migration
  - Impact Level: Medium
  - Risk Category: Performance
  - Status: Done

- **ROADMAP-08-ITEM-05:** Add try/catch around `localStorage` JSON parsing in `AuthContext`
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Done

- **ROADMAP-08-ITEM-06:** Mount `mysql-data` volume in `docker-compose.yml` to persist database data
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Done

- **ROADMAP-08-ITEM-07:** Add unit tests for `validation.service.ts`, `auth.service.ts`, and `query.service.ts`
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **ROADMAP-08-ITEM-08:** Standardize API response envelope across all endpoints
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **ROADMAP-08-ITEM-09:** Align port configuration across Docker, constants, and API defaults
  - Impact Level: Low
  - Risk Category: Maintainability
  - Status: Open

### Phase 1: Critical Security & Reliability (High Priority)

- **ROADMAP-08-ITEM-10:** Implement AST-based SQL parsing for query validation
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

- **ROADMAP-08-ITEM-11:** Move JWT storage from localStorage to httpOnly cookies
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Done

- **ROADMAP-08-ITEM-12:** Enforce strict request payload size limits per endpoint
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Done

- **ROADMAP-08-ITEM-13:** Implement CSRF protection mechanisms
  - Impact Level: Medium
  - Risk Category: Security
  - Status: Done

- **ROADMAP-08-ITEM-14:** Implement proper secrets management
  - Impact Level: High
  - Risk Category: Security
  - Status: Done

### Phase 2: Performance & Scalability (Medium Priority)

- **ROADMAP-08-ITEM-15:** Implement Puppeteer browser pooling (warm instances)
  - Impact Level: High
  - Risk Category: Performance
  - Status: Done

- **ROADMAP-08-ITEM-16:** Extract in-memory caches (pool, client) to Redis
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Done

- **ROADMAP-08-ITEM-17:** Implement clustering or separate worker processes for PDF rendering
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **ROADMAP-08-ITEM-18:** Implement pagination for query execution results
  - Impact Level: High
  - Risk Category: Performance
  - Status: Open

### Phase 3: Testing & Maintainability (Medium Priority)

- **ROADMAP-08-ITEM-19:** Add unit test coverage for services, repositories, and validators
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **ROADMAP-08-ITEM-20:** Implement integration tests for critical API endpoints
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

- **ROADMAP-08-ITEM-21:** Standardize API response envelopes
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open

- **ROADMAP-08-ITEM-22:** Setup CI/CD pipelines (GitHub Actions)
  - Impact Level: High
  - Risk Category: Maintainability
  - Status: Open

### Phase 4: Production Readiness & Observability (Long Term)

- **ROADMAP-08-ITEM-23:** Setup Nginx reverse proxy with TLS termination
  - Impact Level: High
  - Risk Category: Security
  - Status: Open

- **ROADMAP-08-ITEM-24:** Automate MySQL database backups
  - Impact Level: High
  - Risk Category: Scalability
  - Status: Open

- **ROADMAP-08-ITEM-25:** Implement structured JSON logging (Winston/Pino)
  - Impact Level: Medium
  - Risk Category: Maintainability
  - Status: Open
