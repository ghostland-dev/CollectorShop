import { Router, Request, Response } from 'express';
import { authenticate } from '../utils/auth';

const router = Router();

// Récupérer les annonces d'un utilisateur (ses propres annonces)
router.get('/me/announcements', authenticate, async (_req: Request, res: Response): Promise<void> => {
  // Cette route sera implémentée dans le contrôleur
  res.json({ message: 'Route en cours de développement' });
});

// Récupérer les achats d'un utilisateur
router.get('/me/purchases', authenticate, async (_req: Request, res: Response): Promise<void> => {
  // Cette route sera implémentée dans le contrôleur
  res.json({ message: 'Route en cours de développement' });
});

export default router;
