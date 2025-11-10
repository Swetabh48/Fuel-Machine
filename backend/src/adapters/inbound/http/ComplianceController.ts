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
    res.status(400).json({ error: error.message });
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
      res.status(400).json({ error: error.message });
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
  async getBalance(req: Request, res: Response): Promise<void> {
  try {
    const { shipId, year } = req.query;
    
    if (!shipId || !year) {
      res.status(400).json({ error: 'shipId and year are required' });
      return;
    }
    
    const compliance = await this.complianceUseCases.getComplianceBalance(
      String(shipId),
      Number(year)
    );
    
    res.json({
      shipId: compliance.shipId,
      year: compliance.year,
      balance: compliance.cbGco2eq,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

}