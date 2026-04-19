# Real Estate CRM API 🏠💼

A robust, production-ready NestJS backend for managing real estate operations, featuring JWT authentication, role-based access control (RBAC), and a comprehensive set of APIs for properties, leads, deals, tasks, and communications.

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeORM](https://img.shields.io/badge/typeorm-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)

## 🚀 Key Features

- **🔐 Secure Authentication**: JWT-based login/register with password hashing via `bcrypt`.
- **🛡️ Role-Based Access Control**: Granular permissions for `Admin` and `Agent` roles.
- **🏗️ Property Management**: Full CRUD operations for property listings with detailed metadata.
- **📊 Lead & Deal Tracking**: Comprehensive pipeline management from initial lead contact to closed deals.
- **📅 Task Management**: Interactive task tracking with polymorphic relationships (linked to Properties, Leads, or Deals).
- **💬 Internal Chat**: Real-time messaging system with conversations and read receipts.
- **📈 Analytics Engine**: Dedicated service for dashboard statistics and performance metrics.
- **📖 Auto-generated API Docs**: Interactive Swagger documentation available at `/api`.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Passport.js & JWT
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rahulp772/backend-real-estate-crm.git
   cd backend-real-estate-crm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your PostgreSQL credentials and JWT secret
   ```

4. Start the application:
   ```bash
   # development mode
   pnpm run start:dev
   ```

## 📖 API Documentation

Once the server is running, visit:
`http://localhost:3001/api`

This interactive playground allows you to explore and test all available endpoints.

## 📁 Project Structure

```text
src/
├── analytics/    # Dashboard stats aggregation
├── auth/         # JWT, Strategies, Guards
├── chat/         # Conversations & Messages
├── deals/        # Deal pipeline management
├── leads/        # Lead tracking
├── properties/   # Property listings
├── tasks/        # Activity & Task management
├── users/        # User profile & RBAC
└── main.ts       # Entry point
```

## 📜 License

This project is [UNLICENSED](LICENSE).
