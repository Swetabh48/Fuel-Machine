import { Request, Response } from 'express';
import { RouteUseCases } from '../../../core/application/RouteUseCases';

export class RouteController {
  constructor(private routeUseCases: RouteUseCases) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { vesselType, fuelType, year } = req.query;
      const filters: any = {};
      if (vesselType) filters.vesselType = String(vesselType);
      if (fuelType) filters.fuelType = String(fuelType);
      if (year) filters.year = Number(year);

      const routes =
        Object.keys(filters).length > 0
          ? await this.routeUseCases.getRoutesByFilters(filters)
          : await this.routeUseCases.getAllRoutes();

      res.json(routes.map((r) => r.toPersistence()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;
      await this.routeUseCases.setBaseline(routeId);
      res.json({ message: `Route ${routeId} set as baseline` });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const comparison = await this.routeUseCases.getComparison();
      res.json(comparison);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
