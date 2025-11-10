import { Request, Response } from 'express';
import { BankingUseCases } from '../../../core/application/BankingUseCases';

export class BankingController {
  constructor(private bankingUseCases: BankingUseCases) {}

  async getBankingRecords(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const records = await this.bankingUseCases.getBankingRecords(
        String(shipId),
        year ? Number(year) : undefined
      );

      res.json(records.map((r) => r.toPersistence()));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async bankSurplus(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year, amount } = req.body;

      if (!shipId || !year || !amount) {
        res
          .status(400)
          .json({ error: 'shipId, year, and amount are required' });
        return;
      }

      const entry = await this.bankingUseCases.bankSurplus(
        shipId,
        Number(year),
        Number(amount)
      );

      res.status(201).json({
        message: 'Surplus banked successfully',
        entry: entry.toPersistence(),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async applyBanked(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, amount } = req.body;

      if (!shipId || !amount) {
        res.status(400).json({ error: 'shipId and amount are required' });
        return;
      }

      const result = await this.bankingUseCases.applyBanked(
        shipId,
        Number(amount)
      );

      res.json({
        message: 'Banked surplus applied successfully',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTotalAvailable(req: Request, res: Response): Promise<void> {
    try {
      const { shipId } = req.query;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const total = await this.bankingUseCases.getTotalAvailable(
        String(shipId)
      );

      res.json({ shipId, totalAvailable: total });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}