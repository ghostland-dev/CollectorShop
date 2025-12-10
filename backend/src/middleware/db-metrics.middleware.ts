import { PrismaClient } from '@prisma/client';
import { metricsService } from '../services/metrics.service';

// Wrapper pour mesurer les requêtes Prisma
export function withMetrics<T>(
  prisma: PrismaClient,
  operation: string,
  table: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  return query().finally(() => {
    const duration = Date.now() - startTime;
    metricsService.recordDatabaseQuery(operation, table, duration);
  });
}
