import axios from 'axios';
import { metricsService } from './metrics.service';
import { logger } from '../utils/logger';

class VictoriaMetricsService {
  private url: string;
  private enabled: boolean;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.url = process.env.VICTORIAMETRICS_URL || 'http://localhost:8428/api/v1/import/prometheus';
    this.enabled = !!process.env.VICTORIAMETRICS_URL;
    
    if (this.enabled) {
      this.startPushing();
      logger.info('VictoriaMetrics service initialized', { url: this.url });
    } else {
      logger.info('VictoriaMetrics service disabled (no URL configured)');
    }
  }

  private async pushMetrics(): Promise<void> {
    try {
      const metrics = await metricsService.getMetrics();
      await axios.post(this.url, metrics, {
        headers: {
          'Content-Type': 'text/plain',
        },
        timeout: 5000,
      });
    } catch (error) {
      logger.error('Erreur lors du push des métriques vers VictoriaMetrics', { error });
    }
  }

  private startPushing(): void {
    // Push metrics every 15 seconds
    this.intervalId = setInterval(() => {
      this.pushMetrics();
    }, 15000);

    // Push immediately on startup
    this.pushMetrics();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const victoriaMetricsService = new VictoriaMetricsService();
