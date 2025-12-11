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

// Helper function to create purchase with seller info
async function createPurchaseWithSeller(announcementId: string, buyerId: string, amount: number) {
  return prisma.purchase.create({
    data: {
      announcementId,
      buyerId,
      amount,
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
}

// Helper function to handle fraud detection result
function handleFraudDetectionResult(
  fraudResult: { action: string; reasons: string[]; riskScore: number },
  buyerId: string,
  announcementId: string,
  res: Response
): boolean {
  if (fraudResult.action === 'BLOCK') {
    logger.warn('Achat bloqué par la détection de fraude', {
      buyerId,
      announcementId,
      reasons: fraudResult.reasons,
      riskScore: fraudResult.riskScore,
    });
    res.status(403).json({
      error: 'Achat bloqué par la détection de fraude',
      reasons: fraudResult.reasons,
      riskScore: fraudResult.riskScore,
    });
    return false;
  }

  if (fraudResult.action === 'REVIEW') {
    logger.warn('Achat nécessite une révision', {
      buyerId,
      announcementId,
      reasons: fraudResult.reasons,
      riskScore: fraudResult.riskScore,
    });
  }
  return true;
}

// Helper function to handle purchase creation errors
function handlePurchaseCreationError(error: unknown, res: Response): void {
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

// Créer un achat (BUYER, SELLER ou ADMIN)
router.post('/', authenticate, authorize('BUYER', 'SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
    const data = createPurchaseSchema.parse(req.body);
    const announcement = await validateAnnouncementForPurchase(data.announcementId, user.userId);

    // Détection de fraude
    const { detectFraudForPurchase } = await import('../services/fraud-detection.service');
    const fraudResult = await detectFraudForPurchase(user.userId, data.announcementId, announcement.price);

    if (!handleFraudDetectionResult(fraudResult, user.userId, data.announcementId, res)) {
      return;
    }

    const purchase = await createPurchaseWithSeller(data.announcementId, user.userId, announcement.price);

    logger.info('Achat créé', {
      purchaseId: purchase.id,
      announcementId: data.announcementId,
      buyerId: user.userId,
      fraudRiskScore: fraudResult.riskScore,
    });
    res.status(201).json({ message: 'Achat créé avec succès', purchase });
  } catch (error) {
    handlePurchaseCreationError(error, res);
  }
});

// Helper function to validate purchase confirmation
function validatePurchaseConfirmation(purchase: { buyerId: string; status: string }, userId: string): string | null {
  if (purchase.buyerId !== userId) {
    return 'Vous n\'êtes pas autorisé à confirmer cet achat';
  }
  if (purchase.status !== 'PENDING') {
    return 'Cet achat a déjà été traité';
  }
  return null;
}

// Helper function to complete purchase transaction
async function completePurchaseTransaction(purchaseId: string, announcementId: string) {
  return prisma.$transaction([
    prisma.purchase.update({
      where: { id: purchaseId },
      data: { 
        status: 'COMPLETED',
        deliveryStatus: 'PREPARING',
      },
    }),
    prisma.announcement.update({
      where: { id: announcementId },
      data: { status: 'SOLD' },
    }),
  ]);
}

// Confirmer un achat (simulation de paiement) - BUYER, SELLER ou ADMIN
router.post('/:id/confirm', authenticate, authorize('BUYER', 'SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
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

    const validationError = validatePurchaseConfirmation(purchase, user.userId);
    if (validationError) {
      res.status(validationError.includes('autorisé') ? 403 : 400).json({ error: validationError });
      return;
    }

    await completePurchaseTransaction(id, purchase.announcementId);
    logger.info('Achat confirmé', { purchaseId: id, buyerId: user.userId });

    const updatedPurchase = await getPurchaseWithDetails(id);
    res.json({ message: 'Achat confirmé avec succès', purchase: updatedPurchase });
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

// Helper function to validate delivery status
function validateDeliveryStatus(deliveryStatus: unknown): string | null {
  const validStatuses = ['PENDING', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  if (!deliveryStatus || typeof deliveryStatus !== 'string' || !validStatuses.includes(deliveryStatus)) {
    return 'Statut de livraison invalide';
  }
  return null;
}

// Helper function to check seller authorization
function checkSellerAuthorization(purchase: { announcement: { sellerId: string } }, userId: string, userRole: string): string | null {
  if (purchase.announcement.sellerId !== userId && userRole !== 'ADMIN') {
    return 'Vous n\'êtes pas autorisé à modifier le statut de livraison de cet achat';
  }
  return null;
}

// Helper function to build delivery status update data
function buildDeliveryStatusUpdateData(
  deliveryStatus: string,
  trackingNumber?: string,
  existingShippedAt?: Date | null
): {
  deliveryStatus: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
} {
  const updateData: {
    deliveryStatus: string;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  } = {
    deliveryStatus,
  };

  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber;
  }

  if (deliveryStatus === 'SHIPPED' || deliveryStatus === 'IN_TRANSIT') {
    updateData.shippedAt = new Date();
  }

  if (deliveryStatus === 'DELIVERED') {
    updateData.deliveredAt = new Date();
    if (!existingShippedAt) {
      updateData.shippedAt = new Date();
    }
  }

  return updateData;
}

// Helper function to build purchase include for delivery status update
function buildPurchaseIncludeForDeliveryStatus() {
  return {
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
    buyer: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },
  };
}

// Mettre à jour le statut de livraison (SELLER ou ADMIN uniquement)
router.patch('/:id/delivery-status', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { id } = req.params;
    const { deliveryStatus, trackingNumber } = req.body;

    const statusError = validateDeliveryStatus(deliveryStatus);
    if (statusError) {
      res.status(400).json({ error: statusError });
      return;
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { announcement: true },
    });

    if (!purchase) {
      res.status(404).json({ error: 'Achat introuvable' });
      return;
    }

    const authError = checkSellerAuthorization(purchase, user.userId, user.role);
    if (authError) {
      res.status(403).json({ error: authError });
      return;
    }

    const updateData = buildDeliveryStatusUpdateData(deliveryStatus, trackingNumber, purchase.shippedAt);

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: updateData,
      include: buildPurchaseIncludeForDeliveryStatus(),
    });

    logger.info('Statut de livraison mis à jour', {
      purchaseId: id,
      deliveryStatus,
      updatedBy: user.userId,
    });

    res.json({ message: 'Statut de livraison mis à jour avec succès', purchase: updatedPurchase });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut de livraison', { error });
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de livraison' });
  }
});

// Récupérer les ventes de l'utilisateur connecté (pour les vendeurs)
router.get('/sales', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        announcement: {
          sellerId: user.userId,
        },
      },
      include: {
        announcement: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases });
  } catch (error) {
    logger.error('Erreur lors de la récupération des ventes', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
  }
});

export default router;
