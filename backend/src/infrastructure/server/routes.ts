import { Router } from 'express';
import { RouteController } from '../../adapters/inbound/http/RouteController';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';
import { PoolingController } from '../../adapters/inbound/http/PoolingController';

export function createRoutes(
  routeController: RouteController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolingController: PoolingController
): Router {
  const router = Router();

  // Routes endpoints
  router.get('/routes', (req, res) => routeController.getAll(req, res));
  router.post('/routes/:routeId/baseline', (req, res) =>
    routeController.setBaseline(req, res)
  );
  router.get('/routes/comparison', (req, res) =>
    routeController.getComparison(req, res)
  );

  // Compliance endpoints
  router.get('/compliance/cb', (req, res) =>
    complianceController.getComplianceBalance(req, res)
  );
  router.get('/compliance/adjusted-cb', (req, res) =>
    complianceController.getAdjustedComplianceBalance(req, res)
  );
  router.get('/compliance/all', (req, res) =>
    complianceController.getAllCompliance(req, res)
  );

  // Banking endpoints
  router.get('/banking/records', (req, res) =>
    bankingController.getBankingRecords(req, res)
  );
  router.post('/banking/bank', (req, res) =>
    bankingController.bankSurplus(req, res)
  );
  router.post('/banking/apply', (req, res) =>
    bankingController.applyBanked(req, res)
  );
  router.get('/banking/available', (req, res) =>
    bankingController.getTotalAvailable(req, res)
  );

  // Pooling endpoints
  router.post('/pools', (req, res) => poolingController.createPool(req, res));
  router.get('/pools', (req, res) =>
    poolingController.getPoolsByYear(req, res)
  );
  router.get('/pools/:id', (req, res) =>
    poolingController.getPoolById(req, res)
  );

  return router;
}