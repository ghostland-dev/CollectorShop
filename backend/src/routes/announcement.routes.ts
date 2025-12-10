import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(5000),
  price: z.number().positive('Le prix doit être positif'),
  category: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

// Créer une annonce (SELLER uniquement)
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const data = createAnnouncementSchema.parse(req.body);

    // Vérifier que l'utilisateur existe
    const seller = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!seller) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Filtrer les images vides et valider les URLs
    const validImages = (data.images || []).filter((img: string) => {
      if (!img || typeof img !== 'string' || img.trim() === '') return false;
      try {
        new URL(img);
        return true;
      } catch {
        // Si ce n'est pas une URL valide, on l'ignore
        return false;
      }
    });

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        images: validImages,
        sellerId: user.userId,
        status: 'PUBLISHED',
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    logger.info('Annonce créée', { announcementId: announcement.id, sellerId: user.userId });

    res.status(201).json({
      message: 'Annonce créée avec succès',
      announcement
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    if ((error as any).code === 'P2003') {
      logger.error('Erreur de référence: utilisateur invalide', { 
        userId: user.userId,
        error: (error as any).meta
      });
      res.status(400).json({ 
        error: 'Erreur de référence: votre compte utilisateur n\'existe plus. Veuillez vous reconnecter.',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    logger.error('Erreur lors de la création de l\'annonce', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.userId
    });
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'annonce',
      message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Lister les annonces (public, avec filtres)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, minPrice, maxPrice, search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.announcement.count({ where }),
    ]);

    res.json({
      announcements,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des annonces', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des annonces',
      message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Récupérer les annonces de l'utilisateur connecté (ou toutes pour ADMIN)
// IMPORTANT: Cette route doit être AVANT /:id sinon Express interprète "me" comme un ID
router.get('/me', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    // Admin voit toutes les annonces, SELLER voit seulement les siennes
    const where = user.role === 'ADMIN' ? {} : { sellerId: user.userId };

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ announcements });
  } catch (error) {
    logger.error('Erreur lors de la récupération des annonces de l\'utilisateur', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
});

// Récupérer une annonce par ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!announcement) {
      res.status(404).json({ error: 'Annonce non trouvée' });
      return;
    }

    res.json(announcement);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'annonce', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'annonce' });
  }
});

// Mettre à jour une annonce (propriétaire uniquement)
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const data = updateAnnouncementSchema.parse(req.body);

    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      res.status(404).json({ error: 'Annonce non trouvée' });
      return;
    }

    if (existingAnnouncement.sellerId !== user.userId && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette annonce' });
      return;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    logger.info('Annonce mise à jour', { announcementId: id });

    res.json({
      message: 'Annonce mise à jour avec succès',
      announcement
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    logger.error('Erreur lors de la mise à jour de l\'annonce', { error });
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce' });
  }
});

// Supprimer une annonce (propriétaire uniquement)
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      res.status(404).json({ error: 'Annonce non trouvée' });
      return;
    }

    if (existingAnnouncement.sellerId !== user.userId && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette annonce' });
      return;
    }

    await prisma.announcement.delete({
      where: { id }
    });

    logger.info('Annonce supprimée', { announcementId: id });

    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'annonce', { error });
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce' });
  }
});

export default router;
