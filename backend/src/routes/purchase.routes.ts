import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createPurchaseSchema = z.object({
  announcementId: z.string().uuid('ID d\'annonce invalide'),
});

// Créer un achat (BUYER uniquement)
router.post('/', authenticate, authorize('BUYER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const data = createPurchaseSchema.parse(req.body);

    // Vérifier que l'annonce existe et est disponible
    const announcement = await prisma.announcement.findUnique({
      where: { id: data.announcementId },
      include: { seller: true },
    });

    if (!announcement) {
      res.status(404).json({ error: 'Annonce introuvable' });
      return;
    }

    if (announcement.status !== 'PUBLISHED') {
      res.status(400).json({ error: 'Cette annonce n\'est plus disponible à la vente' });
      return;
    }

    if (announcement.sellerId === user.userId) {
      res.status(400).json({ error: 'Vous ne pouvez pas acheter votre propre annonce' });
      return;
    }

    // Vérifier si un achat en attente existe déjà
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        announcementId: data.announcementId,
        buyerId: user.userId,
        status: 'PENDING',
      },
    });

    if (existingPurchase) {
      res.status(400).json({ error: 'Vous avez déjà un achat en attente pour cette annonce' });
      return;
    }

    // Créer l'achat
    const purchase = await prisma.purchase.create({
      data: {
        announcementId: data.announcementId,
        buyerId: user.userId,
        amount: announcement.price,
        status: 'PENDING',
      },
      include: {
        announcement: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    logger.info('Achat créé', { purchaseId: purchase.id, announcementId: data.announcementId, buyerId: user.userId });

    res.status(201).json({
      message: 'Achat créé avec succès',
      purchase,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    logger.error('Erreur lors de la création de l\'achat', { error });
    res.status(500).json({ error: 'Erreur lors de la création de l\'achat' });
  }
});

// Confirmer un achat (simulation de paiement)
router.post('/:id/confirm', authenticate, authorize('BUYER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { announcement: true },
    });

    if (!purchase) {
      res.status(404).json({ error: 'Achat introuvable' });
      return;
    }

    if (purchase.buyerId !== user.userId) {
      res.status(403).json({ error: 'Vous n\'êtes pas autorisé à confirmer cet achat' });
      return;
    }

    if (purchase.status !== 'PENDING') {
      res.status(400).json({ error: 'Cet achat a déjà été traité' });
      return;
    }

    // Mettre à jour le statut de l'achat et de l'annonce
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id },
        data: { status: 'COMPLETED' },
      }),
      prisma.announcement.update({
        where: { id: purchase.announcementId },
        data: { status: 'SOLD' },
      }),
    ]);

    logger.info('Achat confirmé', { purchaseId: id, buyerId: user.userId });

    res.json({
      message: 'Achat confirmé avec succès',
      purchase: await prisma.purchase.findUnique({
        where: { id },
        include: {
          announcement: {
            include: {
              seller: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    });
  } catch (error) {
    logger.error('Erreur lors de la confirmation de l\'achat', { error });
    res.status(500).json({ error: 'Erreur lors de la confirmation de l\'achat' });
  }
});

// Récupérer les achats de l'utilisateur connecté
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    const purchases = await prisma.purchase.findMany({
      where: { buyerId: user.userId },
      include: {
        announcement: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases });
  } catch (error) {
    logger.error('Erreur lors de la récupération des achats', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
  }
});

export default router;
