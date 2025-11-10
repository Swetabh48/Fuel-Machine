import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './infrastructure/db/client';
import { createRoutes } from './infrastructure/server/routes';

// Repositories
import { RouteRepository } from './adapters/outbound/postgres/RouteRepository';
import { ComplianceRepository } from './adapters/outbound/postgres/ComplianceRepository';
import { BankingRepository } from './adapters/outbound/postgres/BankingRepository';
import { PoolingRepository } from './adapters/outbound/postgres/PoolingRepository';

// Use Cases
import { RouteUseCases } from './core/application/RouteUseCases';
import { ComplianceUseCases } from './core/application/ComplianceUseCases';
import { BankingUseCases } from './core/application/BankingUseCases';
import { PoolingUseCases } from './core/application/PoolingUseCases';

// Controllers
import { RouteController } from './adapters/inbound/http/RouteController';
import { ComplianceController } from './adapters/inbound/http/ComplianceController';
import { BankingController } from './adapters/inbound/http/BankingController';
import { PoolingController } from './adapters/inbound/http/PoolingController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize repositories
const routeRepository = new RouteRepository(db);
const complianceRepository = new ComplianceRepository(db);
const bankingRepository = new BankingRepository(db);
const poolingRepository = new PoolingRepository(db);

// Initialize use cases
const routeUseCases = new RouteUseCases(routeRepository);
const complianceUseCases = new ComplianceUseCases(
  complianceRepository,
  routeRepository,
  bankingRepository
);
const bankingUseCases = new BankingUseCases(
  bankingRepository,
  complianceRepository
);
const poolingUseCases = new PoolingUseCases(
  poolingRepository,
);

// Initialize controllers
const routeController = new RouteController(routeUseCases);
const complianceController = new ComplianceController(complianceUseCases);
const bankingController = new BankingController(bankingUseCases);
const poolingController = new PoolingController(poolingUseCases);

// Setup routes
const routes = createRoutes(
  routeController,
  complianceController,
  bankingController,
  poolingController
);

app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚢 FuelEU Maritime Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API base: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await db.close();
  process.exit(0);
});