# Reporting Platform Prototype

> Technical prototype of a full-stack reporting system.  
> Built for experimentation, architecture validation, and portfolio demonstration.

**Disclaimer**  
This repository represents a **technical prototype**.  
Product name, branding, licensing, and commercial availability are subject to change.  
This project may serve as the foundation for a future proprietary product.

---

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project is a self-hosted reporting platform prototype inspired by
enterprise reporting tools. It allows teams to execute SQL-based reports
and export them as PDF documents.

The main goal of this repository is to explore:

- Reporting system architecture
- Secure SQL execution
- PDF generation pipelines
- Modern full-stack development practices

---

## Features

### Current (v0.1.0)

- SQL query execution with validation
- PDF export (Puppeteer)
- Query results display
- Docker Compose setup
- TypeScript throughout
- Rate limiting and security

### Planned (v0.2.0+)

- Pagination and performance optimization
- JWT authentication
- Saved query templates
- Excel export
- Interactive charts
- Scheduled reports

---

## Tech Stack

### Backend

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript 5.3
- **Database:** MySQL 8.0
- **PDF:** Puppeteer 21
- **ORM:** mysql2 (native driver)

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 4
- **State:** React Hooks
- **HTTP:** Axios
- **Icons:** Lucide React

### Infrastructure

- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (planned)
- **CI/CD:** GitHub Actions (planned)
- **Monitoring:** Planned

---

## Getting Started

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/))
- Git ([Download](https://git-scm.com/))

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/reporting-platform-prototype.git
cd reporting-platform-prototype

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# MySQL:    localhost:3306
```

### Manual Setup (Alternative)

<details>
<summary>Click to expand</summary>

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp ../.env.example .env

# Run migrations (if applicable)
# npm run migrate

# Start development server
npm run dev

# Backend available at http://localhost:3000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev

# Frontend available at http://localhost:5173
```

#### Database Setup

```bash
# Start MySQL locally or use Docker
docker run -d \
  --name reporting-platform-prototype-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=relatorios \
  -p 3306:3306 \
  mysql:8.0

# Import schema (if exists)
# mysql -u root -p relatorios < schema.sql
```

</details>

---

## Project Structure

```
reporting-platform-prototype/
├── backend/                 # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Frontend UI (React + Vite)
│   ├── src/
│   │   ├── components/     # React components (planned)
│   │   ├── hooks/          # Custom hooks (planned)
│   │   ├── services/       # API services (planned)
│   │   ├── App.tsx         # Main component
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── .github/                 # GitHub Actions (planned)
│   └── workflows/
│
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root:

```bash
# Database
MYSQL_ROOT_PASSWORD=your-super-secret-password
DB_USER=app
DB_PASSWORD=your-app-password
DB_HOST=mysql
DB_NAME=relatorios

# Backend
PORT=3000
NODE_ENV=development

# Frontend (prefix with VITE_)
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

### Optional Variables

```bash
# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Feature Flags
VITE_ENABLE_EXPORT_PDF=true
VITE_ENABLE_SAVE_QUERIES=false
```

**Security Note:** Never commit `.env` to version control.

---

## Development

### Available Scripts

#### Backend

```bash
npm run dev      # Start with hot-reload (ts-node-dev)
npm run build    # Compile TypeScript
npm run start    # Start production build
npm test         # Run tests (planned)
```

#### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style

- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier (planned)
- **Commits:** Conventional Commits (enforced)

### Branching Strategy

```
main           → Production-ready code
develop        → Integration branch
feature/*      → New features
fix/*          → Bug fixes
hotfix/*       → Urgent production fixes
```

### Making Changes

```bash
# 1. Create feature branch
git checkout develop
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat(scope): description"

# 3. Push and create PR
git push -u origin feature/your-feature-name
```

---

## Docker

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
```

### Manage Containers

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p
```

### Data Persistence

MySQL data is persisted in a Docker volume:

```bash
# View volumes
docker volume ls

# Backup database
docker-compose exec mysql mysqldump -u root -p relatorios > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p relatorios < backup.sql
```

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong passwords (16+ chars)
- [ ] Enable HTTPS (Nginx + Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Setup monitoring (Sentry, DataDog)
- [ ] Configure backups
- [ ] Review security best practices

### Deployment Options

<details>
<summary>AWS (Recommended)</summary>

- **Compute:** ECS Fargate or EC2
- **Database:** RDS MySQL
- **Storage:** S3 for PDFs
- **CDN:** CloudFront
- **Monitoring:** CloudWatch

</details>

<details>
<summary>Google Cloud Platform</summary>

- **Compute:** Cloud Run or GKE
- **Database:** Cloud SQL
- **Storage:** Cloud Storage
- **CDN:** Cloud CDN

</details>

<details>
<summary>DigitalOcean</summary>

- **Compute:** Droplet or App Platform
- **Database:** Managed MySQL
- **Storage:** Spaces

</details>

---

## Contributing

Please follow these guidelines:

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: maintenance tasks
```

### Pull Request Process

1. Fork the repository
2. Create your feature branch
3. Make your changes with tests
4. Ensure CI passes
5. Update documentation
6. Submit PR with clear description

### Code Review

- All PRs require 1 approval
- Address review comments
- Keep PRs focused and small

---

## Technical Roadmap & Priority Planning

### Phase 1: Critical Security & Reliability (Immediate)

- [x] **SEC-05-15:** Implement AST-based SQL parsing for query validation
- [x] **SEC-05-19:** Move JWT storage from localStorage to `httpOnly` cookies
- [x] **SEC-05-18:** Enforce strict request payload size limits per endpoint
- [x] **SEC-05-16:** Implement CSRF protection
- [x] **INFRA-04-19:** Implement proper secrets management

### Phase 2: Performance & Scalability (High Priority)

- [x] **SCALE-06-20:** Implement Puppeteer browser pooling
- [x] **SCALE-06-16:** Extract in-memory caches to Redis
- [x] **SCALE-06-03:** Refactor PDF rendering to background workers
- [x] **SCALE-06-06:** Implement pagination for query results

### Phase 3: Testing & Maintainability (Medium Priority)

- [ ] **DEBT-07-10:** Add unit tests for business logic
- [ ] **DEBT-07-11:** Add integration tests for API endpoints
- [ ] **DEBT-07-07:** Standardize API response envelopes
- [ ] **INFRA-04-15:** Setup CI/CD pipelines (GitHub Actions)

### Phase 4: Production Readiness & Observability (Medium Term)

- [ ] **INFRA-04-11:** Setup Nginx reverse proxy with TLS
- [ ] **INFRA-04-20:** Automate database backups
- [ ] **DEBT-07-15:** Implement structured JSON logging
- [ ] **DEBT-07-17:** Export APM metrics (latency, pool utilization)

---

## License

This repository contains proprietary source code and is shared publicly
for demonstration and portfolio purposes only.

Unauthorized copying, distribution, or modification is prohibited.

Future licensing terms may change upon product officialization.

---

## Team

- **Developer:** Alexandre Cavalari ([@github](https://github.com/sherlocod3))
- **Contributors:** See [CONTRIBUTORS.md](./CONTRIBUTORS.md)

---

## Support

### Issues and Bugs

Report bugs via [GitHub Issues](https://github.com/sherlocod3/reporting-platform-prototype/issues)

### Questions

- Email: alexandre.cavalari@doqr.com.br

### Documentation

- [Wiki](https://github.com/YOUR-USERNAME/reporting-platform-prototype/wiki) (planned)
- [API Docs](https://api.notreadyyet.com/docs) (planned)

---

## Acknowledgments

- Inspired by Bold Reports
- Built with [Express](https://expressjs.com/)
- UI powered by [React](https://reactjs.org/)
- PDF generation by [Puppeteer](https://pptr.dev/)

---

## Stats

![GitHub last commit](https://img.shields.io/github/last-commit/sherlocod3/reporting-platform-prototype)
![GitHub issues](https://img.shields.io/github/issues/sherlocod3/reporting-platform-prototype)
![GitHub pull requests](https://img.shields.io/github/issues-pr/sherlocod3/reporting-platform-prototype)

---

**Made by Alexandre Cavalari - DoQR**
