# Setup Requirements

This document outlines the prerequisites, skills, and step-by-step instructions to set up and run the MakeitCRM project.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v18 or higher
- **pnpm**: v10.33.0 (as specified in `package.json`)
- **PostgreSQL**: Any recent version (v12+ recommended)
- **Git**: For cloning the repository

---

## Skills Installation

This project benefits from the following agent skills. Install them to enhance your development experience.

### 1. nestjs-best-practices

NestJS best practices and architecture patterns for building production-ready applications.

**Location**: `.agents/skills/nestjs-best-practices/SKILL.md`

**Install**:
```powershell
# The skill is already available in .agents/skills/
# No installation needed - it's auto-discovered when needed
```

**When to use**: Writing, reviewing, or refactoring NestJS code to ensure proper patterns for modules, dependency injection, security, and performance.

---

### 2. vercel-react-best-practices

React and Next.js performance optimization guidelines from Vercel Engineering.

**Location**: `.agents/skills/vercel-react-best-practices/SKILL.md`

**Install**:
```powershell
# The skill is already available in .agents/skills/
# No installation needed - it's auto-discovered when needed
```

**When to use**: Writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.

---

### 3. graphify-windows

Knowledge graph for understanding codebase relationships and architecture.

**Location**: `.claude/skills/graphify/SKILL.md`

**Install**:
```powershell
# The skill is already available in .claude/skills/
# No installation needed - it's auto-discovered when needed
```

**When to use**: Understanding how code modules relate to each other, exploring architecture, and traversing knowledge graph for "how does X relate to Y" questions.

---

### 4. find-skills

Discover and install additional agent skills when needed.

**Location**: `.agents/skills/find-skills/SKILL.md`

**Install**:
```powershell
# The skill is already available in .agents/skills/
# No installation needed - it's auto-discovered when needed
```

**When to use**: Finding new skills for specific tasks like "how do I do X", "find a skill for X", or "is there a skill that can...".

---

## Project Setup

Follow these steps to set up the project on a new machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd platinum-elite-crm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=makeitcrm

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_min_32_chars

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 4. Start PostgreSQL

Ensure your PostgreSQL server is running and the database exists:

```sql
CREATE DATABASE makeitcrm;
```

---

## Running the Application

### Start the Backend

```bash
pnpm --filter backend-real-estate-crm run start:dev
```

- **URL**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api

### Start the Frontend

```bash
pnpm --filter makeitcrm run dev
```

- **URL**: http://localhost:3000

### Start Both (Development)

```bash
pnpm dev
```

---

## Demo Data Management

The project includes demo data management scripts for testing.

### Create Demo Data

```bash
pnpm demo:create
```

### Refresh Demo Data

```bash
pnpm demo:refresh
```

### Delete Demo Data

```bash
pnpm demo:delete
```

### Check Demo Status

```bash
pnpm demo:status
```

---

## Troubleshooting

### Port Conflicts

If you encounter port conflicts (3000, 3001), identify the process using the port:

```bash
# Windows
netstat -ano | findstr :3000
```

Then terminate the process or change the port in `.env`.

### JWT Secret Issues

Ensure `JWT_SECRET` in `.env` is at least 32 characters long. For development, you can generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### PostgreSQL Connection Errors

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-16
   ```

2. Check credentials in `.env` match your PostgreSQL configuration.

3. Ensure the database exists:
   ```sql
   CREATE DATABASE makeitcrm;
   ```

### Dependency Issues

If you encounter dependency issues, clear the cache:

```bash
pnpm store prune
pnpm install
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm lint` | Run linting on all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm --filter makeitcrm run build` | Build frontend only |
| `pnpm --filter backend-real-estate-crm run build` | Build backend only |

---

## Additional Resources

- **Frontend README**: `apps/frontend/README.md`
- **Backend README**: `apps/backend/README.md`
- **Architecture Docs**: `AGENTS.md`
- **Swagger API Docs**: http://localhost:3001/api (when backend is running)