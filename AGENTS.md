# 🤖 Real Estate CRM: Full-Stack Architecture Documentation

This document provides a comprehensive overview of the Real Estate CRM project, designed for developers and AI agents to understand the system's architecture, data models, and implementation patterns.

---

## 🏗️ System Overview
The Real Estate CRM is a full-stack application designed to streamline property management, lead tracking, and deal closure for real estate agencies.

- **Frontend**: Next.js 15 (React) with a premium "Platinum Elite" design system.
- **Backend**: NestJS (Node.js) with TypeORM and PostgreSQL.
- **Authentication**: JWT-based with Dynamic Roles & Permissions (Multi-Tenant).

---

## 🏢 Multi-Tenant Architecture

### Tenant Isolation
- Each tenant has isolated data through `tenantId` foreign key on all domain entities.
- Superadmin users (`isSuperAdmin: true`) can access data across all tenants.
- Regular users are filtered to only see data within their `tenantId`.

### Key Entities

#### 1. Tenant
- `id`, `name`, `domain`, `createdAt`, `updatedAt`
- One-to-Many with: User, Property, Lead, Deal, Task, Role

#### 2. Role (Dynamic)
- `id`, `name`, `tenantId`, `permissions` (JSONB array), `isSystem`, `level` (int)
- `tenantId` is nullable for global/system roles
- `level` = 100 (Admin), 80 (Manager), 50 (Team Lead), 10 (Agent), 200 (Super Admin)
- One-to-Many with: User

#### 3. User
- `id`, `email`, `password`, `name`, `status`
- `tenantId` (foreign key to Tenant)
- `roleId` (foreign key to Role)
- `isSuperAdmin` (boolean - full system access)
- `permissions` (dynamically loaded from Role)

---

## 💾 Permissions System

### Base Permissions
```
'leads:read', 'leads:write',
'deals:read', 'deals:write',
'properties:read', 'properties:write',
'tasks:read', 'tasks:write',
'reports:read',
'settings:write',
'users:read', 'users:write',
'roles:write'
```

### Usage (Backend)
```typescript
@Controller('leads')
@RequirePermissions('leads:read')
@UseGuards(PermissionsGuard)
export class LeadsController { }
```

### Usage (Frontend)
```typescript
import { HasPermission } from '@/components/auth/has-permission';

<HasPermission required="reports:read">
  <ReportsWidget />
</HasPermission>
```

---

## 📊 Role Level Hierarchy

The system implements a strict visibility hierarchy for data access. This is primarily used for **Task visibility** but can be extended to other entities.

### Level Definitions
| Level | Role | Description |
|-------|------|-------------|
| 200 | Super Admin | System-wide access across all tenants |
| 100 | Admin | Full access within a tenant |
| 80 | Manager | Can view tasks assigned to users with lower levels |
| 50 | Team Lead | Can view tasks assigned to users with lower levels |
| 10 | Agent | Can only see own tasks and tasks they created |

### Task Visibility Rules
A user can view a task if ANY of these conditions are met:
1. **Task is assigned to them**: `task.assignedToId === user.id`
2. **Task was created by them**: `task.createdById === user.id`
3. **Assignee is lower in hierarchy**: `assignee.role.level < currentUser.role.level` (same tenant)

### Implementation (Backend)
```typescript
// In TasksService.findAll()
const currentLevel = userWithRole.role.level || 0;
const subQuery = userRepository
  .createQueryBuilder('user')
  .select('user.id')
  .leftJoin('user.role', 'role')
  .where('user.tenantId = :tenantId', { tenantId })
  .andWhere('role.level < :level', { level: currentLevel });

// Query returns tasks where:
// - assignedToId = currentUser OR
// - createdById = currentUser OR
// - assignedToId IN (users with lower role level)
```

### Seeded Roles (Default)
Each tenant gets these roles by default:
- **Admin** (Level 100): Full access, all permissions
- **Manager** (Level 80): Manage agents, most permissions
- **Team Lead** (Level 50): Lead team tasks
- **Agent** (Level 10): Basic access, own work only

---

## 💾 Data Entities & Relationships

### 1. User (Agent/Admin)
The core actor in the system.
- **Fields**: `tenantId`, `roleId`, `isSuperAdmin`, `permissions`
- **Relationships**:
  - `Many-to-One` with **Tenant**
  - `Many-to-One` with **Role**
  - `One-to-Many` with **Properties** (as listing agent).
  - `One-to-Many` with **Leads** (as assigned agent).
  - `One-to-Many` with **Deals** (as deal owner).
  - `One-to-Many` with **Tasks** (as assignee).
  - `Many-to-Many` with **Conversations**.

### 2. Property
Real estate listings.
- **Status**: `available`, `pending`, `sold`, `off_market`.
- **Fields**: `tenantId`, price, address, specs (beds/baths/sqft), images, features.
- **Relationships**:
  - `Many-to-One` with **User** (Agent).
  - `Many-to-One` with **Tenant**.
  - `One-to-Many` with **Deals** (A property can be part of multiple deal attempts).

### 3. Lead
Potential clients or prospects.
- **Status**: `new`, `contacted`, `qualified`, `lost`.
- **Sources**: `website`, `referral`, `social`, etc.
- **Relationships**:
  - `Many-to-One` with **User** (Assigned To).
  - `Many-to-One` with **Tenant**.

### 4. Deal
Active transactions in the pipeline.
- **Stages**: `lead`, `negotiation`, `under_contract`, `closed`.
- **Relationships**:
  - `Many-to-One` with **User** (Agent).
  - `Many-to-One` with **Property** (The subject of the deal).
  - `Many-to-One` with **Tenant**.

### 5. Task
Activity tracking linked to other entities.
- **Polymorphism**: Uses `relatedToId` and `relatedToType` (`deal`, `property`, `lead`).
- **Relationships**:
  - `Many-to-One` with **User** (Assignee).
  - `Many-to-One` with **User** (Creator - `createdById`).
  - `Many-to-One` with **Tenant**.

### 6. Chat (Conversation & Message)
Internal and client communication.
- **Conversation**: Groups `participants` (Users), `tenantId`, and `messages`.
- **Message**: Individual entries with `sender`, `tenantId`, and `read` status.

---

## 🎨 Frontend Architecture (Next.js)

### Design System: "Platinum Elite"
- **Palette**: Navy Blue (`#0A192F`) and Champagne Gold (`#D4AF37`).
- **Components**: Built on [Shadcn UI](https://ui.shadcn.com/) and Radix UI.
- **Animations**: Subtle micro-animations using Framer Motion.

### Key Patterns
- **App Router**: Organized under `(dashboard)` groups for layout persistence.
- **Authentication**: JWT-based auth with custom `AuthContext` containing:
  - `user` with tenant/role/permissions
  - `hasPermission(permission: string)` method for RBAC
- **State Management**: Uses **TanStack Query** (React Query) for server-state management and caching.
- **API Client**: Centralized Axios instance with request/response interceptors for automatic JWT injection and 401 handling.
- **Server vs Client Components**: Data fetching strategy leverages Next.js server components where possible, with client-side state for interactive filters.

---

## ⚙️ Backend Architecture (NestJS)

### Modular Design
Each domain (Leads, Properties, etc.) is encapsulated in its own module containing:
- **Entity**: TypeORM schema definition.
- **Controller**: REST endpoint definitions with Swagger decorators.
- **Service**: Business logic with tenant isolation.
- **DTO**: Request validation schemas using `class-validator`.

### Security Patterns
- **JWT Authentication**: Passport-based strategy for stateless auth.
- **Dynamic Permissions**: `@RequirePermissions()` decorator and `PermissionsGuard` for endpoint protection.
- **Tenant Isolation**: All services filter by `tenantId` (except Superadmin).
- **Validation**: Global `ValidationPipe` with `whitelist: true` to strip unknown properties.

### Database Patterns
- **TypeORM**: Used for object-relational mapping.
- **Tenant Filtering**: Services accept `User` and filter data based on `user.tenantId`.
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
3.  **Multi-Tenancy**:
    - All domain entities have `tenantId` for data isolation.
    - Services automatically filter by tenant (except Superadmin).
    - Frontend components can use `HasPermission` for conditional rendering.
4.  **Environment Isolation**:
    - Configuration managed via `@nestjs/config` and `.env` files.
5.  **Error Handling**:
    - Centralized exception handling via NestJS built-in filters (Backend).
    - Global interceptors for API error handling (Frontend).

---

## 🛠️ Developer Workflow

- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3001/api`

### Running the Full Stack
1. Ensure PostgreSQL is running.
2. Backend: `pnpm --filter backend-real-estate-crm run start:dev`
3. Frontend: `pnpm --filter crm run dev`

### Creating a Tenant (via API)
```bash
POST /tenants
{ "name": "Acme Realty" }
```

### Creating a Role (via API)
```bash
POST /roles
{
  "name": "Junior Agent",
  "tenantId": "<tenant-id>",
  "permissions": ["leads:read", "properties:read", "tasks:read"]
}
```

### Creating a User with Tenant
```bash
POST /auth/register
{
  "email": "agent@acme.com",
  "password": "securepassword",
  "name": "John Agent",
  "tenantId": "<tenant-id>",
  "roleId": "<role-id>"
}
```

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
