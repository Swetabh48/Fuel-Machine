# FuelEU Maritime Compliance Platform

> A full-stack TypeScript application implementing FuelEU Maritime compliance management with hexagonal architecture, including route management, compliance balance tracking, surplus banking, and pooling mechanisms.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0+-4169E1.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## 🎯 Overview

The FuelEU Maritime Compliance Platform helps shipping companies manage their GHG intensity compliance under the FuelEU Maritime regulation. The system tracks:

- **Routes**: Vessel routes with fuel consumption and GHG intensity data
- **Compliance Balance (CB)**: Calculation of surplus/deficit against target intensity
- **Banking**: Ability to bank surplus CB for future use
- **Pooling**: Share compliance balance among multiple vessels

### Key Compliance Concepts

- **GHG Intensity**: gCO₂eq/MJ - measure of greenhouse gas emissions per unit energy
- **Target Intensity**: Regulatory limit (89.3368 gCO₂eq/MJ for 2025)
- **Compliance Balance (CB)**: (Target - Actual) × Energy = Surplus/Deficit
- **Banking**: Store surplus CB for later years
- **Pooling**: Multiple ships share their CB to collectively meet targets

---

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture) principles:

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ React UI     │  │  REST API    │  │  Controllers │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                     APPLICATION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Use Cases   │  │   Services   │  │     DTOs     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                       DOMAIN LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Entities   │  │ Value Objects│  │Business Rules│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                    INFRASTRUCTURE LAYER                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Repositories │  │  PostgreSQL  │  │   Axios      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Why Hexagonal Architecture?

1. **Domain Independence**: Business logic doesn't depend on frameworks
2. **Testability**: Easy to mock dependencies and test in isolation
3. **Flexibility**: Swap infrastructure (DB, API) without changing business logic
4. **Maintainability**: Clear separation of concerns reduces coupling

### Layer Responsibilities

#### **Domain Layer** (`core/domain/`)
- Pure business entities (Route, Compliance, Banking, Pooling)
- Business rules and calculations
- No dependencies on external frameworks

#### **Application Layer** (`core/application/`)
- Use cases orchestrating business logic
- Application services
- DTOs for data transfer

#### **Ports** (`core/ports/`)
- Interfaces defining contracts
- Repository interfaces
- Service interfaces

#### **Adapters** (`adapters/`)
- **Inbound**: Controllers handling HTTP requests
- **Outbound**: Repository implementations for PostgreSQL
- **Infrastructure**: API clients, database connections

---

## ✨ Features

### 1. Route Management
- ✅ View all routes with filtering (vessel type, fuel type, year)
- ✅ Set baseline route for comparison
- ✅ Calculate GHG intensity and emissions
- ✅ Compare routes against baseline

### 2. Compliance Balance
- ✅ Calculate CB based on target intensity
- ✅ View surplus/deficit status
- ✅ Track CB history by ship and year
- ✅ Adjusted CB including banking effects

### 3. Banking Mechanism
- ✅ Bank surplus CB from compliant years
- ✅ Apply banked CB to deficit years
- ✅ FIFO (First-In-First-Out) application logic
- ✅ Track available banked balance
- ✅ Validation: only bank positive CB, only apply available balance

### 4. Pooling System
- ✅ Create pools with multiple ships
- ✅ Calculate pooled CB distribution
- ✅ Validate pool constraints:
  - Total CB before pooling ≥ 0
  - Deficit ships cannot exit worse
  - Surplus ships cannot exit negative
- ✅ View pool statistics and members

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Native `pg` driver (raw SQL)
- **Testing**: Jest
- **Validation**: Custom validators

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5.0+
- **Styling**: TailwindCSS 3+
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

### DevOps & Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Environment**: dotenv
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📁 Project Structure

```
fueleu-maritime/
├── backend/
│   ├── src/
│   │   ├── core/                      # Domain & Application layers
│   │   │   ├── domain/               # Business entities
│   │   │   │   ├── Route.ts
│   │   │   │   ├── Compliance.ts
│   │   │   │   ├── Banking.ts
│   │   │   │   └── Pooling.ts
│   │   │   ├── application/          # Use cases
│   │   │   │   ├── RouteUseCases.ts
│   │   │   │   ├── ComplianceUseCases.ts
│   │   │   │   ├── BankingUseCases.ts
│   │   │   │   └── PoolingUseCases.ts
│   │   │   └── ports/                # Interface contracts
│   │   │       ├── IRouteRepository.ts
│   │   │       ├── IComplianceRepository.ts
│   │   │       ├── IBankingRepository.ts
│   │   │       └── IPoolingRepository.ts
│   │   ├── adapters/                 # Infrastructure adapters
│   │   │   ├── inbound/
│   │   │   │   └── http/            # REST controllers
│   │   │   │       ├── RouteController.ts
│   │   │   │       ├── ComplianceController.ts
│   │   │   │       ├── BankingController.ts
│   │   │   │       └── PoolingController.ts
│   │   │   └── outbound/
│   │   │       └── postgres/        # Repository implementations
│   │   │           ├── RouteRepository.ts
│   │   │           ├── ComplianceRepository.ts
│   │   │           ├── BankingRepository.ts
│   │   │           └── PoolingRepository.ts
│   │   ├── infrastructure/          # Framework & tools
│   │   │   ├── db/
│   │   │   │   ├── client.ts       # PostgreSQL connection
│   │   │   │   ├── migrations/     # Database migrations
│   │   │   │   └── seeds/          # Seed data
│   │   │   └── server/
│   │   │       └── routes.ts       # Express routes
│   │   └── index.ts                # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── core/                    # Domain & Application layers
│   │   │   ├── domain/
│   │   │   │   └── models/
│   │   │   │       └── types.ts    # Domain types
│   │   │   ├── application/
│   │   │   │   └── use-cases/      # Frontend use cases
│   │   │   └── ports/              # Repository interfaces
│   │   ├── adapters/
│   │   │   ├── infrastructure/
│   │   │   │   ├── api/           # API clients
│   │   │   │   └── repositories/  # Repository implementations
│   │   │   └── ui/
│   │   │       ├── components/    # React components
│   │   │       ├── hooks/         # Custom hooks
│   │   │       └── pages/         # Page components
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── AGENT_WORKFLOW.md              # AI agent usage documentation
├── README.md                       # This file
└── REFLECTION.md                   # Development reflections
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js**: v18.0 or higher
- **PostgreSQL**: v15.0 or higher
- **npm**: v9.0 or higher
- **Git**: Latest version

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/fueleu-maritime.git
cd fueleu-maritime
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb fueleu_maritime

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**`.env` Configuration:**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fueleu_maritime
DB_USER=postgres
DB_PASSWORD=your_password

# Constants
TARGET_INTENSITY_2025=89.3368
ENERGY_PER_TON_MJ=41000
```

```bash
# Run migrations
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend should now be running on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with backend URL
nano .env
```

**`.env` Configuration:**
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

```bash
# Start development server
npm start
```

Frontend should now be running on `http://localhost:3000`

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
npx serve -s build
```

### Docker (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access application
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### **Routes**

**GET** `/routes`
```bash
# Get all routes
curl http://localhost:3001/api/routes

# Filter by vessel type
curl http://localhost:3001/api/routes?vesselType=Container

# Filter by fuel type and year
curl "http://localhost:3001/api/routes?fuelType=LNG&year=2024"
```

**POST** `/routes/:routeId/baseline`
```bash
# Set route as baseline
curl -X POST http://localhost:3001/api/routes/R001/baseline
```

**GET** `/routes/comparison`
```bash
# Get comparison with baseline
curl http://localhost:3001/api/routes/comparison
```

#### **Compliance**

**GET** `/compliance/cb`
```bash
# Get compliance balance
curl "http://localhost:3001/api/compliance/cb?shipId=R001&year=2024"

# Response:
{
  "shipId": "R001",
  "year": 2024,
  "cb": 102.5
}
```

**GET** `/compliance/adjusted-cb`
```bash
# Get adjusted CB (with banking effects)
curl "http://localhost:3001/api/compliance/adjusted-cb?shipId=R001&year=2024"

# Response:
{
  "shipId": "R001",
  "year": 2024,
  "cbBefore": 102.5,
  "applied": 50.0,
  "cbAfter": 152.5
}
```

**GET** `/compliance/all`
```bash
# Get all compliance records
curl http://localhost:3001/api/compliance/all
```

#### **Banking**

**GET** `/banking/records`
```bash
# Get banking records for a ship
curl "http://localhost:3001/api/banking/records?shipId=R001"

# Get records for specific year
curl "http://localhost:3001/api/banking/records?shipId=R001&year=2024"
```

**POST** `/banking/bank`
```bash
# Bank surplus CB
curl -X POST http://localhost:3001/api/banking/bank \
  -H "Content-Type: application/json" \
  -d '{
    "shipId": "R001",
    "year": 2024,
    "amount": 50.0
  }'

# Response:
{
  "message": "Surplus banked successfully",
  "entry": {
    "id": 1,
    "shipId": "R001",
    "year": 2024,
    "amountGco2eq": 50.0,
    "appliedAmount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**POST** `/banking/apply`
```bash
# Apply banked CB
curl -X POST http://localhost:3001/api/banking/apply \
  -H "Content-Type: application/json" \
  -d '{
    "shipId": "R001",
    "amount": 30.0
  }'

# Response:
{
  "message": "Banked surplus applied successfully",
  "cbBefore": -20.0,
  "applied": 30.0,
  "cbAfter": 10.0
}
```

**GET** `/banking/available`
```bash
# Get total available banked CB
curl "http://localhost:3001/api/banking/available?shipId=R001"

# Response:
{
  "shipId": "R001",
  "totalAvailable": 75.5
}
```

#### **Pooling**

**POST** `/pools`
```bash
# Create pool
curl -X POST http://localhost:3001/api/pools \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "members": [
      { "shipId": "R001", "cbBefore": 100.0, "cbAfter": 80.0 },
      { "shipId": "R002", "cbBefore": -50.0, "cbAfter": -30.0 }
    ]
  }'

# Response:
{
  "message": "Pool created successfully",
  "pool": {
    "id": 1,
    "year": 2024,
    "totalCbBefore": 50.0,
    "totalCbAfter": 50.0,
    "members": [...]
  }
}
```

**GET** `/pools`
```bash
# Get pools by year
curl "http://localhost:3001/api/pools?year=2024"
```

**GET** `/pools/:id`
```bash
# Get pool by ID
curl http://localhost:3001/api/pools/1
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- RouteUseCases.test.ts

# Run in watch mode
npm test -- --watch
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
backend/src/__tests__/
├── unit/
│   ├── RouteUseCases.test.ts
│   ├── BankingUseCases.test.ts
│   ├── ComplianceUseCases.test.ts
│   └── PoolingUseCases.test.ts
└── integration/
    ├── routes.integration.test.ts
    ├── banking.integration.test.ts
    └── pooling.integration.test.ts
```

### Example Test

```typescript
describe('RouteUseCases', () => {
  it('should calculate compliance balance correctly', async () => {
    const route = new RouteEntity(
      1, 'R001', 'Container', 'HFO', 2024,
      91.0, 5000, 12000, 4500, true
    );
    
    const targetIntensity = 89.3368;
    const cb = route.calculateComplianceBalance(targetIntensity);
    
    expect(cb).toBeCloseTo(-340.95, 2);
  });
});
```

---


## 🔧 Configuration

### Environment Variables

#### Backend `.env`
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `fueleu_maritime` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `TARGET_INTENSITY_2025` | FuelEU target | `89.3368` |
| `ENERGY_PER_TON_MJ` | Energy conversion | `41000` |

#### Frontend `.env`
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:3001/api` |



### Code Standards

- Follow hexagonal architecture principles
- Write unit tests for use cases
- Use TypeScript strict mode
- Follow ESLint configuration
- Document complex business logic

---


## 🙏 Acknowledgments

- FuelEU Maritime Regulation documentation
- Hexagonal Architecture principles by Alistair Cockburn
- Clean Architecture by Robert C. Martin
- TypeScript community

---
