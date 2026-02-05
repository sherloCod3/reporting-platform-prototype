# 📊 QReports

> **Note:** This is a **technical portfolio project** created for learning and demonstration purposes only.  
> It is **not** an official product, is **not used in production**, and contains **no proprietary logic, data, or internal workflows** from any company.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 🎯 Project Overview

QReports is a robust, self-hosted reporting platform engineered to bridge the gap between raw SQL data and professional-grade PDF reports. 

Key technical goals of this project:
- **Performance**: Optimized rendering and efficient data fetching using React Query.
- **Scalability**: Containerized architecture (Docker) with separation of concerns.
- **UX/UI**: A modern, IDE-like interface with Dark Mode support, built with Shadcn UI and TailwindCSS v4.
- **Type Safety**: End-to-end type safety with TypeScript, Zod validation, and strictly typed DTOs.

## 🛠️ Tech Stack

### Frontend (Modern React Ecosystem)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **State/Data Fetching**: TanStack Query (React Query)
- **Styling**: TailwindCSS v4, Shadcn UI, Lucide Icons
- **Forms**: React Hook Form + Zod
- **Editor**: Monaco Editor (for SQL input)

### Backend (Robust API)
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MySQL 8.0 (using `mysql2` driver)
- **PDF Generation**: Puppeteer (Headless Chrome)
- **Security**: JWT Authentication, bcrypt, Express Rate Limit
- **Validation**: Zod

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Environment**: Strictly typed environment variables

## ✨ Key Features

- **SQL Query Editor**: Full-featured SQL editor with syntax highlighting to compose report data sources.
- **Dynamic Report Rendering**: Real-time preview of query results.
- **PDF Export**: Pixel-perfect PDF generation using headless browser rendering.
- **Secure Authentication**: Complete login system with JWT session management.
- **Dark Mode**: First-class dark mode support for creating reports in any lighting.
- **Responsive Design**: Fully responsive dashboard for managing reports on the go.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qreports.git
   cd qreports
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update .env with your local credentials if needed
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000` (or configured port)
   - Backend: `http://localhost:5000`

## 🧩 Engineering Highlights

This project focuses on **Clean Code** principles:

- **Component Composition**: Small, reusable UI components.
- **Custom Hooks**: Logic extracted into clear, testable custom hooks.
- **Service Layer**: Backend business logic separated from controller routing.
- **DTOs**: Explicit Data Transfer Objects for clear API contracts.

## ⚖️ Legal & Attribution

This repository is a **personal technical project** and is not affiliated with any specific company or commercial product. Code structure and logic are original work demonstrating software engineering skills. Data used in demos is generic/mock functionality.
Data, schemas, and queries used in this project are entirely synthetic.  
Any resemblance to real systems is coincidental and unintentional.