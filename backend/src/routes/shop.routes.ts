import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get all shops
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.shop.count(),
    ]);

    res.json({
      shops,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    logger.error('Error fetching shops:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get shop by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!shop) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    res.json(shop);
  } catch (error) {
    logger.error('Error fetching shop:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Get shop by user ID
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const shop = await prisma.shop.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!shop) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    res.json(shop);
  } catch (error) {
    logger.error('Error fetching shop by user:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Update shop (only owner or admin)
router.put(
  '/:id',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, logo, bannerImage } = req.body;
      const userId = (req as any).user?.userId;

      // Get the shop to check ownership
      const shop = await prisma.shop.findUnique({
        where: { id },
      });

      if (!shop) {
        res.status(404).json({ error: 'Shop not found' });
        return;
      }

      // Check if user is owner or admin
      if (shop.userId !== userId && (req as any).user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const updatedShop = await prisma.shop.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(logo && { logo }),
          ...(bannerImage && { bannerImage }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(updatedShop);
    } catch (error) {
      logger.error('Error updating shop:', error);
      res.status(500).json({ error: 'Failed to update shop' });
    }
  }
);

export default router;
