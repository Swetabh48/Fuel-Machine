import { Request, Response } from 'express';
import { ComplianceUseCases } from '../../../core/application/ComplianceUseCases';

export class ComplianceController {
  constructor(private complianceUseCases: ComplianceUseCases) {}

  async getComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      console.log(`Fetching compliance for shipId=${shipId}, year=${year}`);

      const compliance = await this.complianceUseCases.getComplianceBalance(
        String(shipId),
        Number(year)
      );

      res.json({
        shipId: compliance.shipId,
        year: compliance.year,
        cb: compliance.cbGco2eq,
      });
    } catch (error: any) {
      console.error('ComplianceBalance Error:', error.message, error.stack);
      
      // Better error handling
      if (error.message.includes('No route found')) {
        res.status(404).json({ 
          error: `No route/compliance data found for ship ${req.query.shipId} in year ${req.query.year}. Please ensure the route exists in the database.` 
        });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async getAdjustedComplianceBalance(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const result =
        await this.complianceUseCases.getAdjustedComplianceBalance(
          String(shipId),
          Number(year)
        );

      res.json({
        shipId: String(shipId),
        year: Number(year),
        ...result,
      });
    } catch (error: any) {
      console.error('AdjustedComplianceBalance Error:', error.message);
      
      if (error.message.includes('No route found')) {
        res.status(404).json({ 
          error: `No route/compliance data found for ship ${req.query.shipId} in year ${req.query.year}` 
        });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async getAllCompliance(req: Request, res: Response): Promise<void> {
    try {
      const compliance = await this.complianceUseCases.getAllCompliance();
      res.json(compliance.map((c) => c.toPersistence()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}