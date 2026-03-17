import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

const updateCollectionSchema = createCollectionSchema.partial();

// Get all collections for a shop
router.get('/shop/:shopId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopId } = req.params;

    const collections = await prisma.collection.findMany({
      where: { shopId },
      include: {
        announcements: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionsWithCount = collections.map(c => ({
      ...c,
      itemCount: c.announcements.length,
    }));

    res.json({ collections: collectionsWithCount });
  } catch (error) {
    logger.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get collection details with items
router.get('/:collectionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        announcements: {
          where: { status: 'PUBLISHED' },
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                shop: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.json(collection);
  } catch (error) {
    logger.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Get seller's collections
router.get('/seller/my', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const shop = await prisma.shop.findUnique({
      where: { userId: user.userId },
    });

    if (!shop) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    const collections = await prisma.collection.findMany({
      where: { shopId: shop.id },
      include: {
        announcements: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionsWithCount = collections.map(c => ({
      ...c,
      itemCount: c.announcements.length,
    }));

    res.json({ collections: collectionsWithCount });
  } catch (error) {
    logger.error('Error fetching seller collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Create collection (SELLER only)
router.post(
  '/',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const data = createCollectionSchema.parse(req.body);

      const shop = await prisma.shop.findUnique({
        where: { userId: user.userId },
      });

      if (!shop) {
        res.status(404).json({ error: 'Shop not found' });
        return;
      }

      const collection = await prisma.collection.create({
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          shopId: shop.id,
        },
      });

      logger.info('Collection created', { collectionId: collection.id, shopId: shop.id });
      res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid data', details: error.errors });
        return;
      }
      logger.error('Error creating collection:', error);
      res.status(500).json({ error: 'Failed to create collection' });
    }
  }
);

// Update collection (SELLER only - owner)
router.put(
  '/:collectionId',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { collectionId } = req.params;
      const data = updateCollectionSchema.parse(req.body);

      const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
        include: { shop: true },
      });

      if (!collection) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      // Check ownership
      if (collection.shop.userId !== user.userId && user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const updated = await prisma.collection.update({
        where: { id: collectionId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.image && { image: data.image }),
        },
      });

      logger.info('Collection updated', { collectionId });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid data', details: error.errors });
        return;
      }
      logger.error('Error updating collection:', error);
      res.status(500).json({ error: 'Failed to update collection' });
    }
  }
);

// Delete collection (SELLER only - owner)
router.delete(
  '/:collectionId',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { collectionId } = req.params;

      const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
        include: { shop: true },
      });

      if (!collection) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      // Check ownership
      if (collection.shop.userId !== user.userId && user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      // Unlink announcements from collection
      await prisma.announcement.updateMany({
        where: { collectionId },
        data: { collectionId: null },
      });

      await prisma.collection.delete({
        where: { id: collectionId },
      });

      logger.info('Collection deleted', { collectionId });
      res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
      logger.error('Error deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  }
);

export default router;
