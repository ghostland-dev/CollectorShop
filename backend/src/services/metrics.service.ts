import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { logger } from '../utils/logger';

class MetricsService {
  private register: Registry;
  private httpRequestDuration!: Histogram<string>;
  private httpRequestTotal!: Counter<string>;
  private httpErrorsTotal!: Counter<string>;
  private activeConnections!: Gauge<string>;
  private databaseQueryDuration!: Histogram<string>;
  private cacheHits!: Counter<string>;
  private cacheMisses!: Counter<string>;

  private initializeHttpMetrics(): void {
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpErrorsTotal = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });
  }

  private initializeConnectionMetrics(): void {
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.register],
    });
  }

  private initializeDatabaseMetrics(): void {
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });
  }

  private initializeCacheMetrics(): void {
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.register],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.register],
    });
  }

  constructor() {
    this.register = new Registry();
    
    this.register.setDefaultLabels({
      app: 'collector-shop-api',
    });

    this.initializeHttpMetrics();
    this.initializeConnectionMetrics();
    this.initializeDatabaseMetrics();
    this.initializeCacheMetrics();

    logger.info('Metrics service initialized');
  }

  // HTTP Metrics
  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    this.httpRequestTotal.inc({ method, route, status });
    this.httpRequestDuration.observe({ method, route, status }, duration / 1000);

    if (status >= 400) {
      this.httpErrorsTotal.inc({ method, route, status });
    }
  }

  // Connection Metrics
  incrementActiveConnections(): void {
    this.activeConnections.inc();
  }

  decrementActiveConnections(): void {
    this.activeConnections.dec();
  }

  // Database Metrics
  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.databaseQueryDuration.observe({ operation, table }, duration / 1000);
  }

  // Cache Metrics
  recordCacheHit(cacheType: string = 'redis'): void {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType: string = 'redis'): void {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  // Get metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Get registry for custom metrics
  getRegister(): Registry {
    return this.register;
  }
}

export const metricsService = new MetricsService();
