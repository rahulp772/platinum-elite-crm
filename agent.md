# 🤖 Real Estate CRM: Full-Stack Architecture Documentation

This document provides a comprehensive overview of the Real Estate CRM project, designed for developers and AI agents to understand the system's architecture, data models, and implementation patterns.

---

## 🏗️ System Overview
The Real Estate CRM is a full-stack application designed to streamline property management, lead tracking, and deal closure for real estate agencies.

- **Frontend**: Next.js 15 (React) with a premium "Platinum Elite" design system.
- **Backend**: NestJS (Node.js) with TypeORM and PostgreSQL.
- **Authentication**: JWT-based with Role-Based Access Control (RBAC).

---

## 💾 Data Entities & Relationships

### 1. User (Agent/Admin)
The core actor in the system.
- **Roles**: `admin`, `agent`.
- **Relationships**:
  - `One-to-Many` with **Properties** (as listing agent).
  - `One-to-Many` with **Leads** (as assigned agent).
  - `One-to-Many` with **Deals** (as deal owner).
  - `One-to-Many` with **Tasks** (as assignee).
  - `Many-to-Many` with **Conversations**.

### 2. Property
Real estate listings.
- **Status**: `available`, `pending`, `sold`, `off_market`.
- **Fields**: Price, address, specs (beds/baths/sqft), images, features.
- **Relationships**:
  - `Many-to-One` with **User** (Agent).
  - `One-to-Many` with **Deals** (A property can be part of multiple deal attempts).

### 3. Lead
Potential clients or prospects.
- **Status**: `new`, `contacted`, `qualified`, `lost`.
- **Sources**: `website`, `referral`, `social`, etc.
- **Relationships**:
  - `Many-to-One` with **User** (Assigned To).

### 4. Deal
Active transactions in the pipeline.
- **Stages**: `lead`, `negotiation`, `under_contract`, `closed`.
- **Relationships**:
  - `Many-to-One` with **User** (Agent).
  - `Many-to-One` with **Property** (The subject of the deal).

### 5. Task
Activity tracking linked to other entities.
- **Polymorphism**: Uses `relatedToId` and `relatedToType` (`deal`, `property`, `lead`).
- **Relationships**:
  - `Many-to-One` with **User** (Assignee).

### 6. Chat (Conversation & Message)
Internal and client communication.
- **Conversation**: Groups `participants` (Users) and `messages`.
- **Message**: Individual entries with `sender` and `read` status.

---

## 🎨 Frontend Architecture (Next.js)

### Design System: "Platinum Elite"
- **Palette**: Navy Blue (`#0A192F`) and Champagne Gold (`#D4AF37`).
- **Components**: Built on [Shadcn UI](https://ui.shadcn.com/) and Radix UI.
- **Animations**: Subtle micro-animations using Framer Motion.

### Key Patterns
- **App Router**: Organized under `(dashboard)` groups for layout persistence.
- **Server vs Client Components**: Data fetching strategy leverages Next.js server components where possible, with client-side state for interactive filters.
- **Responsive Design**: Mobile-first approach using Tailwind's utility classes.

---

## ⚙️ Backend Architecture (NestJS)

### Modular Design
Each domain (Leads, Properties, etc.) is encapsulated in its own module containing:
- **Entity**: TypeORM schema definition.
- **Controller**: REST endpoint definitions with Swagger decorators.
- **Service**: Business logic and repository interaction.
- **DTO**: Request validation schemas using `class-validator`.

### Security Patterns
- **JWT Authentication**: Passport-based strategy for stateless auth.
- **RBAC**: Custom `@Roles()` decorator and `RolesGuard` for endpoint protection.
- **Validation**: Global `ValidationPipe` with `whitelist: true` to strip unknown properties.

### Database Patterns
- **TypeORM**: Used for object-relational mapping.
- **Strict Null Checks**: Services handle `null` results from the database to prevent runtime errors.
- **Aggregations**: `AnalyticsService` uses TypeORM Query Builder for complex dashboard metrics.

---

## 🚀 Best Practices Implemented

1.  **Code Quality**:
    - TypeScript everywhere with strict typing.
    - Standardized response formats.
    - Explicit DTOs for every mutation.
2.  **API Standards**:
    - RESTful naming conventions.
    - Comprehensive Swagger/OpenAPI documentation.
    - Proper HTTP status codes usage.
3.  **Environment Isolation**:
    - Configuration managed via `@nestjs/config` and `.env` files.
4.  **Error Handling**:
    - Centralized exception handling via NestJS built-in filters.

---

## 🛠️ Developer Workflow

- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3001/api`

### Running the Full Stack
1. Ensure PostgreSQL is running.
2. Backend: `pnpm run start:dev`
3. Frontend: `npm run dev`
