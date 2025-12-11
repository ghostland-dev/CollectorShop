import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import announcementRoutes from './routes/announcement.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import purchaseRoutes from './routes/purchase.routes';
import chatRoutes from './routes/chat.routes';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { metricsService } from './services/metrics.service';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});

app.use('/api/', limiter);

// Metrics middleware (before routes)
app.use(metricsMiddleware);

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint (Prometheus format)
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await metricsService.getMetrics();
    res.send(metrics);
  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques', { error });
    res.status(500).send('Erreur lors de la récupération des métriques');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/chat', chatRoutes);

// Middleware de gestion d'erreurs
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Erreur non gérée', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Initialize VictoriaMetrics service (starts pushing metrics)
import('./services/victoriametrics.service').catch((err) => {
  logger.warn('VictoriaMetrics service non disponible', { error: err });
});

// Démarrage du serveur uniquement si on n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM reçu, arrêt gracieux...');
    server.close(async () => {
      prisma.$disconnect();
      // Stop VictoriaMetrics push
      try {
        const { victoriaMetricsService } = await import('./services/victoriametrics.service');
        victoriaMetricsService.stop();
      } catch (err) {
        // Ignore if service not loaded
      }
      process.exit(0);
    });
  });
}

export default app;
