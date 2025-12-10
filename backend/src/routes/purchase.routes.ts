import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';
import '../types/express';

const router = Router();
const prisma = new PrismaClient();

const createPurchaseSchema = z.object({
  announcementId: z.string().uuid('ID d\'annonce invalide'),
});

// Helper function to validate announcement for purchase
async function validateAnnouncementForPurchase(announcementId: string, buyerId: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: { seller: true },
  });

  if (!announcement) {
    throw new Error('ANNOUNCEMENT_NOT_FOUND');
  }

  if (announcement.status !== 'PUBLISHED') {
    throw new Error('ANNOUNCEMENT_NOT_AVAILABLE');
  }

  if (announcement.sellerId === buyerId) {
    throw new Error('CANNOT_BUY_OWN_ANNOUNCEMENT');
  }

  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      announcementId,
      buyerId,
      status: 'PENDING',
    },
  });

  if (existingPurchase) {
    throw new Error('PURCHASE_ALREADY_EXISTS');
  }

  return announcement;
}

// Helper function to get purchase with full details
async function getPurchaseWithDetails(purchaseId: string) {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
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
}

// Créer un achat (BUYER uniquement)
router.post('/', authenticate, authorize('BUYER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
    const data = createPurchaseSchema.parse(req.body);

    const announcement = await validateAnnouncementForPurchase(data.announcementId, user.userId);

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
    if (error instanceof Error) {
      const errorMessages: Record<string, { status: number; message: string }> = {
        'ANNOUNCEMENT_NOT_FOUND': { status: 404, message: 'Annonce introuvable' },
        'ANNOUNCEMENT_NOT_AVAILABLE': { status: 400, message: 'Cette annonce n\'est plus disponible à la vente' },
        'CANNOT_BUY_OWN_ANNOUNCEMENT': { status: 400, message: 'Vous ne pouvez pas acheter votre propre annonce' },
        'PURCHASE_ALREADY_EXISTS': { status: 400, message: 'Vous avez déjà un achat en attente pour cette annonce' },
      };
      const errorInfo = errorMessages[error.message];
      if (errorInfo) {
        res.status(errorInfo.status).json({ error: errorInfo.message });
        return;
      }
    }
    logger.error('Erreur lors de la création de l\'achat', { error });
    res.status(500).json({ error: 'Erreur lors de la création de l\'achat' });
  }
});

// Confirmer un achat (simulation de paiement)
router.post('/:id/confirm', authenticate, authorize('BUYER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
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

    const updatedPurchase = await getPurchaseWithDetails(id);

    res.json({
      message: 'Achat confirmé avec succès',
      purchase: updatedPurchase,
    });
  } catch (error) {
    logger.error('Erreur lors de la confirmation de l\'achat', { error });
    res.status(500).json({ error: 'Erreur lors de la confirmation de l\'achat' });
  }
});

// Récupérer les achats de l'utilisateur connecté
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

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
