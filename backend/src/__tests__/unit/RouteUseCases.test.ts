import { RouteUseCases } from '../../core/application/RouteUseCases';
import { IRouteRepository } from '../../core/ports/IRouteRepository';
import { RouteEntity } from '../../core/domain/Route';

describe('RouteUseCases', () => {
  let routeUseCases: RouteUseCases;
  let mockRepository: jest.Mocked<IRouteRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByRouteId: jest.fn(),
      findBaseline: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      setBaseline: jest.fn(),
      findByFilters: jest.fn(),
    };

    routeUseCases = new RouteUseCases(mockRepository);
  });

  describe('getComparison', () => {
    it('should calculate comparison correctly', async () => {
      const baseline = new RouteEntity(
        1,
        'R001',
        'Container',
        'HFO',
        2024,
        91.0,
        5000,
        12000,
        4500,
        true
      );

      const route2 = new RouteEntity(
        2,
        'R002',
        'BulkCarrier',
        'LNG',
        2024,
        88.0,
        4800,
        11500,
        4200,
        false
      );

      mockRepository.findBaseline.mockResolvedValue(baseline);
      mockRepository.findAll.mockResolvedValue([baseline, route2]);

      const result = await routeUseCases.getComparison();

      expect(result).toHaveLength(2);
      expect(result[0].routeId).toBe('R001');
      expect(result[1].routeId).toBe('R002');
      expect(result[1].compliant).toBe(true);
      expect(result[1].percentDiff).toBeCloseTo(-3.3, 1);
    });

    it('should throw error when no baseline is set', async () => {
      mockRepository.findBaseline.mockResolvedValue(null);

      await expect(routeUseCases.getComparison()).rejects.toThrow(
        'No baseline route set'
      );
    });
  });

  describe('setBaseline', () => {
    it('should set baseline for existing route', async () => {
      const route = new RouteEntity(
        1,
        'R001',
        'Container',
        'HFO',
        2024,
        91.0,
        5000,
        12000,
        4500,
        false
      );

      mockRepository.findByRouteId.mockResolvedValue(route);
      mockRepository.setBaseline.mockResolvedValue(undefined);

      await routeUseCases.setBaseline('R001');

      expect(mockRepository.setBaseline).toHaveBeenCalledWith(1);
    });

    it('should throw error for non-existent route', async () => {
      mockRepository.findByRouteId.mockResolvedValue(null);

      await expect(routeUseCases.setBaseline('R999')).rejects.toThrow(
        'Route R999 not found'
      );
    });
  });
});