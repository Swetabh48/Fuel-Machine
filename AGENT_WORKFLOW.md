# AI Agent Workflow Log

## Project Overview
This document tracks the use of AI agents (Claude, GitHub Copilot, Cursor) in developing the FuelEU Maritime Compliance Platform, a full-stack application implementing hexagonal architecture with TypeScript, React, Node.js, and PostgreSQL.

---

## Agents Used

### Primary Agent: Claude (Anthropic)
- **Version**: Claude Sonnet 4.5
- **Use Cases**: Architecture design, code generation, refactoring, debugging, documentation
- **Integration**: Web interface with artifact creation capabilities

### Secondary Tools
- **GitHub Copilot**: Inline code completions and boilerplate generation
- **Cursor Agent**: AI-assisted coding with context awareness
- **TypeScript Language Server**: Type checking and IntelliSense

---

## Prompts & Outputs

### Example 1: Domain Entity Creation

**Prompt:**
```
Create a RouteEntity domain class following hexagonal architecture principles. 
It should:
- Calculate compliance balance (CB) based on target GHG intensity
- Calculate energy in scope using fuel consumption
- Support baseline designation
- Include factory methods for persistence mapping
```

**Generated Output:**
```typescript
export class RouteEntity {
  constructor(
    public readonly id: number,
    public readonly routeId: string,
    public readonly vesselType: string,
    public readonly fuelType: string,
    public readonly year: number,
    public readonly ghgIntensity: number,
    public readonly fuelConsumption: number,
    public readonly distance: number,
    public readonly totalEmissions: number,
    public isBaseline: boolean
  ) {}

  setAsBaseline(): void {
    this.isBaseline = true;
  }

  calculateEnergyInScope(): number {
    const ENERGY_PER_TON_MJ = Number(process.env.ENERGY_PER_TON_MJ) || 41000;
    return this.fuelConsumption * ENERGY_PER_TON_MJ;
  }

  calculateComplianceBalance(targetIntensity: number): number {
    const energyInScope = this.calculateEnergyInScope();
    const cbMJ = (targetIntensity - this.ghgIntensity) * energyInScope;
    return cbMJ / 1_000_000; // Convert to tCO2eq
  }

  static fromPersistence(data: Route): RouteEntity {
    return new RouteEntity(
      data.id,
      data.routeId,
      data.vesselType,
      data.fuelType,
      data.year,
      data.ghgIntensity,
      data.fuelConsumption,
      data.distance,
      data.totalEmissions,
      data.isBaseline
    );
  }

  toPersistence(): Route {
    return {
      id: this.id,
      routeId: this.routeId,
      vesselType: this.vesselType,
      fuelType: this.fuelType,
      year: this.year,
      ghgIntensity: this.ghgIntensity,
      fuelConsumption: this.fuelConsumption,
      distance: this.distance,
      totalEmissions: this.totalEmissions,
      isBaseline: this.isBaseline,
    };
  }
}
```

---

### Example 2: Repository Implementation with PostgreSQL

**Prompt:**
```
Implement RouteRepository that implements IRouteRepository port.
Use PostgreSQL client for data access.
Include:
- CRUD operations
- Filtering by vessel type, fuel type, year
- Baseline management (set baseline, find baseline)
- Transaction support for baseline updates
- Snake case to camelCase mapping
```

**Generated Output:**
```typescript
export class RouteRepository implements IRouteRepository {
  constructor(private db: DatabaseClient) {}

  async findAll(): Promise<RouteEntity[]> {
    const result = await this.db.query<Route>(
      'SELECT * FROM routes ORDER BY year, id'
    );
    return result.rows.map((row) => RouteEntity.fromPersistence(this.mapRow(row)));
  }

  async setBaseline(id: number): Promise<void> {
    await this.db.transaction(async (client) => {
      await client.query('UPDATE routes SET is_baseline = false');
      await client.query('UPDATE routes SET is_baseline = true WHERE id = $1', [id]);
    });
  }

  private mapRow(row: any): Route {
    return {
      id: row.id,
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: row.year,
      ghgIntensity: Number(row.ghg_intensity),
      fuelConsumption: Number(row.fuel_consumption),
      distance: Number(row.distance),
      totalEmissions: Number(row.total_emissions),
      isBaseline: row.is_baseline,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
```

---

### Example 3: Banking Use Case with Business Logic

**Prompt:**
```
Create BankingUseCases that handles:
1. Banking surplus CB (validation: CB must be positive, amount <= available CB)
2. Applying banked CB to deficit years (FIFO order, validation: amount <= total banked)
3. Getting banking records and total available

Include proper error handling and business rule validation.
```

**Generated Output:**
```typescript
export class BankingUseCases {
  constructor(
    private bankingRepository: IBankingRepository,
    private complianceRepository: IComplianceRepository
  ) {}

  async bankSurplus(
    shipId: string,
    year: number,
    amount: number
  ): Promise<BankingEntity> {
    const compliance = await this.complianceRepository.findByShipAndYear(
      shipId,
      year
    );
    if (!compliance) {
      throw new Error(`No compliance record for ship ${shipId} year ${year}`);
    }
    if (compliance.cbGco2eq <= 0) {
      throw new Error(
        `Cannot bank negative or zero CB. Current CB: ${compliance.cbGco2eq}`
      );
    }
    if (amount > compliance.cbGco2eq) {
      throw new Error(
        `Amount ${amount} exceeds available CB ${compliance.cbGco2eq}`
      );
    }
    return this.bankingRepository.create({
      shipId,
      year,
      amountGco2eq: amount,
      appliedAmount: 0,
    });
  }

  async applyBanked(
    shipId: string,
    amount: number
  ): Promise<{ cbBefore: number; applied: number; cbAfter: number }> {
    const totalAvailable = await this.bankingRepository.getTotalAvailable(shipId);
    if (amount > totalAvailable) {
      throw new Error(
        `Amount ${amount} exceeds available banked ${totalAvailable}`
      );
    }
    const entries = await this.bankingRepository.findAvailableByShip(shipId);
    let remaining = amount;
    for (const entry of entries) {
      if (remaining <= 0) break;
      const available = entry.getAvailableAmount();
      const toApply = Math.min(available, remaining);
      entry.applyAmount(toApply);
      await this.bankingRepository.update(entry.id, {
        appliedAmount: entry.appliedAmount,
      });
      remaining -= toApply;
    }
    // Calculate result
    const latestCompliance = await this.complianceRepository.findAll();
    const shipCompliance = latestCompliance.find((c) => c.shipId === shipId);
    const cbBefore = shipCompliance?.cbGco2eq || 0;
    const cbAfter = cbBefore + amount;
    return {
      cbBefore: Number(cbBefore.toFixed(2)),
      applied: Number(amount.toFixed(2)),
      cbAfter: Number(cbAfter.toFixed(2)),
    };
  }
}
```

---

### Example 4: React Hook with Repository Pattern

**Prompt:**
```
Create useRoutes custom hook that:
- Fetches routes with optional filters (vesselType, fuelType, year)
- Uses IRouteRepository port (not direct API calls)
- Manages loading and error states
- Provides setBaseline function
- Refetches after baseline change
```

**Generated Output:**
```typescript
export const useRoutes = (filters?: { 
  vesselType?: string; 
  fuelType?: string; 
  year?: number 
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository: IRouteRepository = routeRepository;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repository.getAll(filters);
        setRoutes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [filters?.vesselType, filters?.fuelType, filters?.year]);

  const setBaseline = async (routeId: string) => {
    try {
      await repository.setBaseline(routeId);
      const data = await repository.getAll(filters);
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to set baseline');
    }
  };

  return { routes, loading, error, setBaseline };
};
```

---

### Example 5: Database Migration Script

**Prompt:**
```
Create initial schema migration with:
- routes table (vessel info, GHG intensity, fuel consumption, baseline flag)
- ship_compliance table (CB calculations per ship/year)
- bank_entries table (banked surplus with applied amounts)
- pools and pool_members tables (pooling mechanism)

Include proper indexes and foreign key constraints.
```

**Generated Output:**
```typescript
export async function up(db: DatabaseClient): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      route_id VARCHAR(50) UNIQUE NOT NULL,
      vessel_type VARCHAR(100) NOT NULL,
      fuel_type VARCHAR(50) NOT NULL,
      year INTEGER NOT NULL,
      ghg_intensity DECIMAL(10, 4) NOT NULL,
      fuel_consumption DECIMAL(12, 2) NOT NULL,
      distance DECIMAL(12, 2) NOT NULL,
      total_emissions DECIMAL(12, 2) NOT NULL,
      is_baseline BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_routes_year ON routes(year);
    CREATE INDEX IF NOT EXISTS idx_routes_vessel_type ON routes(vessel_type);
    CREATE INDEX IF NOT EXISTS idx_routes_baseline ON routes(is_baseline);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ship_compliance (
      id SERIAL PRIMARY KEY,
      ship_id VARCHAR(50) NOT NULL,
      year INTEGER NOT NULL,
      cb_gco2eq DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ship_id, year)
    );
  `);

  // Additional tables...
}
```

---

## Validation / Corrections

### Issue 1: Banking Apply Endpoint Parameter Mismatch

**Agent Generated:**
```typescript
// Frontend was passing year parameter
await bankingApiClient.applyBanked({ shipId, year, amount });
```

**Problem:** Backend endpoint `/banking/apply` doesn't accept `year` parameter, causing 400 errors.

**Correction Applied:**
```typescript
// Fixed frontend to match backend API contract
await bankingApiClient.applyBanked({ shipId, amount });
```

**Validation Method:**
1. Reviewed backend controller signature
2. Checked API route definition
3. Updated frontend to remove year parameter
4. Tested with Postman to verify fix

---

### Issue 2: TypeScript Type Inference in Repository Pattern

**Agent Generated:**
```typescript
const repository = routeRepository; // Type not inferred
```

**Problem:** TypeScript couldn't infer the interface type, reducing IDE support.

**Correction Applied:**
```typescript
const repository: IRouteRepository = routeRepository;
```

**Validation Method:**
1. Added explicit type annotation
2. Verified IntelliSense now shows interface methods
3. Confirmed type checking catches contract violations

---

### Issue 3: Compliance Balance Response Mapping

**Agent Generated:**
```typescript
const cbValue = cbResponse.cb || 0; // Property 'cb' doesn't exist
```

**Problem:** API returns `cbGco2eq`, not `cb`, causing runtime errors.

**Correction Applied:**
```typescript
const cbValue = cbResponse.cbGco2eq || cbResponse.cb || 0;
// Fallback chain for different API versions
```

**Validation Method:**
1. Console logged actual API response structure
2. Updated mapping to handle both field names
3. Added debugging info display in UI

---

### Issue 4: Pooling Validation Logic

**Agent Initially Missed:**
Pool validation wasn't checking if deficit ships exit in worse position.

**Correction Applied:**
```typescript
for (const member of poolMembers) {
  // Deficit ship cannot exit worse
  if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
    errors.push(`Ship ${member.shipId} deficit worsened`);
  }
  // Surplus ship cannot exit negative
  if (member.cbBefore > 0 && member.cbAfter < 0) {
    errors.push(`Ship ${member.shipId} surplus became negative`);
  }
}
```

**Validation Method:**
1. Wrote unit tests for edge cases
2. Tested with manual pool creation scenarios
3. Verified business rules match FuelEU regulations

---

## Observations

### Where Agents Saved Time (80% time reduction)

1. **Boilerplate Code Generation**
   - Repository implementations with CRUD operations
   - Controller route handlers with validation
   - TypeScript interfaces and type definitions
   - **Estimated Time Saved**: 4-6 hours

2. **Database Schema & Migrations**
   - Generated SQL DDL with proper indexes
   - Created seed data scripts
   - Built transaction-safe migration system
   - **Estimated Time Saved**: 2-3 hours

3. **React Component Structure**
   - Tab-based dashboard layout
   - Form components with validation
   - Loading and error state management
   - **Estimated Time Saved**: 3-4 hours

4. **Architecture Setup**
   - Hexagonal architecture folder structure
   - Port/adapter interfaces
   - Dependency injection setup
   - **Estimated Time Saved**: 2-3 hours

### Where Agents Failed or Hallucinated

1. **API Contract Mismatches**
   - Generated frontend code with parameters not in backend API
   - Required manual verification of endpoint signatures
   - **Mitigation**: Cross-reference generated code with actual API docs

2. **Business Logic Edge Cases**
   - Pooling validation initially missed regulatory constraints
   - Banking FIFO logic needed refinement
   - **Mitigation**: Write explicit test cases, review domain rules

3. **Type System Complexities**
   - Sometimes used `any` instead of proper types
   - Missed optional vs required field distinctions
   - **Mitigation**: Enable strict TypeScript mode, manual review

4. **Database Query Optimization**
   - Generated N+1 queries in some cases
   - Missed opportunities for JOIN optimization
   - **Mitigation**: Use EXPLAIN ANALYZE, review query plans

### How Tools Were Combined Effectively

1. **Claude for Architecture**: High-level design decisions, interface definitions
2. **Copilot for Implementation**: Method bodies, boilerplate, repetitive code
3. **TypeScript LSP for Validation**: Type checking, refactoring support
4. **Manual Review**: Business logic, edge cases, performance optimization

**Workflow Pattern:**
```
Claude (Design) → Copilot (Implementation) → TypeScript (Validation) → Manual (Review)
```

---

## Best Practices Followed

### 1. Hexagonal Architecture Enforcement
- Always define port interfaces before implementations
- Keep domain logic independent of infrastructure
- Use dependency injection for loose coupling

### 2. Type Safety First
```typescript
// Good: Explicit interface contracts
interface IRouteRepository {
  findAll(): Promise<RouteEntity[]>;
}

// Avoid: Implicit any types
function process(data: any) { } // ❌
```

### 3. Error Handling Standards
```typescript
// Consistent error handling pattern
try {
  const result = await operation();
  return result;
} catch (err: any) {
  throw new Error(`Operation failed: ${err.message}`);
}
```

### 4. Agent Prompt Engineering

**Effective Prompts:**
- ✅ "Create X following hexagonal architecture with Y constraints"
- ✅ "Implement IRepository using PostgreSQL with transaction support"
- ✅ "Generate migration for schema with indexes on columns A, B, C"

**Ineffective Prompts:**
- ❌ "Make this better"
- ❌ "Fix the bug"
- ❌ "Add features"

### 5. Incremental Validation
- Generate small components
- Test each piece before integration
- Validate against requirements incrementally

### 6. Documentation Alongside Code
- Used agent to generate JSDoc comments
- Created inline documentation for complex logic
- Maintained README with setup instructions

### 7. Test-Driven Development Support
```typescript
// Generated test structure first
describe('BankingUseCases', () => {
  it('should validate surplus before banking', async () => {
    // Then implemented to pass tests
  });
});
```

---

## Metrics & Efficiency Gains

| Task | Manual Estimate | With AI | Time Saved | Quality |
|------|----------------|---------|------------|---------|
| Domain Entities | 4h | 1h | 75% | ⭐⭐⭐⭐⭐ |
| Repositories | 6h | 1.5h | 75% | ⭐⭐⭐⭐ |
| Controllers | 3h | 0.5h | 83% | ⭐⭐⭐⭐⭐ |
| Use Cases | 5h | 2h | 60% | ⭐⭐⭐⭐ |
| React Components | 8h | 2h | 75% | ⭐⭐⭐⭐ |
| Database Schema | 3h | 0.5h | 83% | ⭐⭐⭐⭐⭐ |
| Tests | 4h | 1h | 75% | ⭐⭐⭐⭐ |
| **Total** | **33h** | **8.5h** | **74%** | **⭐⭐⭐⭐** |

---

## Lessons Learned

1. **Agent Specialization**: Claude excels at architecture and interfaces, Copilot at implementation details
2. **Trust but Verify**: Always validate generated code against requirements
3. **Iterative Refinement**: Better to generate small pieces and refine than large chunks
4. **Context Matters**: Provide agents with architecture docs, examples, constraints
5. **Human Oversight**: AI is a powerful assistant, not a replacement for engineering judgment

---

## Future Improvements

1. **Better Prompts**: Create a library of proven prompt templates
2. **Automated Testing**: Use agents to generate more comprehensive test suites
3. **Performance Profiling**: Let agents suggest optimization strategies
4. **Documentation Generation**: Auto-generate API docs from code
5. **Code Review Automation**: Use agents for initial review pass before human review

---

*This workflow was documented in real-time during development. Total development time: ~8.5 hours vs estimated 33 hours manual.*