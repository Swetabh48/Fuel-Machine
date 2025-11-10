import { Request, Response } from 'express';
import { PoolingUseCases } from '../../../core/application/PoolingUseCases';

export class PoolingController {
  constructor(private poolingUseCases: PoolingUseCases) {}

  async createPool(req: Request, res: Response): Promise<void> {
    try {
      const { year, members } = req.body;

      if (!year || !members || !Array.isArray(members)) {
        res.status(400).json({
          error: 'year and members array are required',
        });
        return;
      }

      if (members.length === 0) {
        res.status(400).json({
          error: 'members array cannot be empty',
        });
        return;
      }

      // Validate member structure
      for (const member of members) {
        if (!member.shipId || member.cbBefore === undefined) {
          res.status(400).json({
            error: 'Each member must have shipId and cbBefore',
          });
          return;
        }
      }

      const pool = await this.poolingUseCases.createPool(year, members);

      res.status(201).json({
        message: 'Pool created successfully',
        pool: {
          id: pool.id,
          year: pool.year,
          totalCbBefore: pool.getTotalCbBefore(),
          totalCbAfter: pool.getTotalCbAfter(),
          members: pool.members.map((m) => m.toPersistence()),
        },
      });
    } catch (error: any) {
      console.error('Pool creation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getPoolsByYear(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;

      if (!year) {
        res.status(400).json({ error: 'year is required' });
        return;
      }

      const pools = await this.poolingUseCases.getPoolsByYear(Number(year));

      res.json(
        pools.map((p) => ({
          id: p.id,
          year: p.year,
          totalCbBefore: p.getTotalCbBefore(),
          totalCbAfter: p.getTotalCbAfter(),
          members: p.members.map((m) => m.toPersistence()),
          createdAt: p.createdAt,
        }))
      );
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPoolById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const pool = await this.poolingUseCases.getPoolById(Number(id));

      if (!pool) {
        res.status(404).json({ error: 'Pool not found' });
        return;
      }

      res.json({
        id: pool.id,
        year: pool.year,
        totalCbBefore: pool.getTotalCbBefore(),
        totalCbAfter: pool.getTotalCbAfter(),
        members: pool.members.map((m) => m.toPersistence()),
        createdAt: pool.createdAt,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}