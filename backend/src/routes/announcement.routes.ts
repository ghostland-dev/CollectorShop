import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../utils/auth';
import { logger } from '../utils/logger';
import '../types/express';

const router = Router();
const prisma = new PrismaClient();

interface AnnouncementQuery {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}

// Helper function to build where clause for announcement filtering
function buildAnnouncementWhereClause(query: AnnouncementQuery): Prisma.AnnouncementWhereInput {
  const where: Prisma.AnnouncementWhereInput = {
    status: 'PUBLISHED',
  };

  if (query.category) {
    where.category = query.category;
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) {
      where.price.gte = parseFloat(query.minPrice);
    }
    if (query.maxPrice) {
      where.price.lte = parseFloat(query.maxPrice);
    }
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

// Helper function to filter and validate image URLs
function filterValidImageUrls(images: string[]): string[] {
  return images.filter((img: string) => {
    if (!img || typeof img !== 'string' || img.trim() === '') return false;
    try {
      new URL(img);
      return true;
    } catch {
      return false;
    }
  });
}

const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(5000),
  price: z.number().positive('Le prix doit être positif'),
  category: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

// Helper function to create announcement data
async function createAnnouncementData(userId: string, data: z.infer<typeof createAnnouncementSchema>): Promise<{
  title: string;
  description: string;
  price: number;
  category?: string | null;
  images: string[];
  sellerId: string;
  status: 'PUBLISHED';
}> {
  const seller = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!seller) {
    throw new Error('USER_NOT_FOUND');
  }

  const validImages = filterValidImageUrls(data.images || []);

  return {
    title: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    images: validImages,
    sellerId: userId,
    status: 'PUBLISHED' as const,
  };
}

// Helper function to handle Zod errors
function handleZodError(error: z.ZodError, res: Response): boolean {
  res.status(400).json({ error: 'Données invalides', details: error.errors });
  return true;
}

// Helper function to handle user not found error
function handleUserNotFoundError(res: Response): boolean {
  res.status(404).json({ error: 'Utilisateur non trouvé' });
  return true;
}

// Helper function to handle Prisma P2003 error
function handlePrismaP2003Error(error: { code: string; meta?: unknown }, userId: string, res: Response): boolean {
  logger.error('Erreur de référence: utilisateur invalide', { 
    userId,
    error: error.meta
  });
  res.status(400).json({ 
    error: 'Erreur de référence: votre compte utilisateur n\'existe plus. Veuillez vous reconnecter.',
    code: 'USER_NOT_FOUND'
  });
  return true;
}

// Helper function to handle generic errors
function handleGenericError(error: unknown, userId: string, res: Response): void {
  logger.error('Erreur lors de la création de l\'annonce', { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId
  });
  res.status(500).json({ 
    error: 'Erreur lors de la création de l\'annonce',
    message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
  });
}

// Helper function to handle announcement creation errors
function handleAnnouncementCreationError(error: unknown, userId: string | undefined, res: Response): void {
  const userIdValue = userId || 'unknown';
  
  if (error instanceof z.ZodError) {
    handleZodError(error, res);
    return;
  }
  if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
    handleUserNotFoundError(res);
    return;
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
    const prismaError = error as { code: string; meta?: unknown };
    handlePrismaP2003Error(prismaError, userIdValue, res);
    return;
  }
  handleGenericError(error, userIdValue, res);
}

// Helper function to create announcement with seller info
async function createAnnouncementWithSeller(
  data: Awaited<ReturnType<typeof createAnnouncementData>>
) {
  return prisma.announcement.create({
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
}

// Créer une annonce (SELLER uniquement)
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
    const data = createAnnouncementSchema.parse(req.body);
    const announcementData = await createAnnouncementData(user.userId, data);
    const announcement = await createAnnouncementWithSeller(announcementData);

    logger.info('Annonce créée', { announcementId: announcement.id, sellerId: user.userId });
    res.status(201).json({ message: 'Annonce créée avec succès', announcement });
  } catch (error) {
    handleAnnouncementCreationError(error, req.user?.userId, res);
  }
});

// Helper function to fetch announcements with pagination
async function fetchAnnouncementsWithPagination(where: Prisma.AnnouncementWhereInput, skip: number, take: number) {
  return Promise.all([
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
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where }),
  ]);
}

// Lister les annonces (public, avec filtres)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, minPrice, maxPrice, search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = buildAnnouncementWhereClause({
      category: category as string | undefined,
      minPrice: minPrice as string | undefined,
      maxPrice: maxPrice as string | undefined,
      search: search as string | undefined,
    });

    const [announcements, total] = await fetchAnnouncementsWithPagination(where, skip, limitNum);

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
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

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

// Helper function to check announcement ownership
function canUserEditAnnouncement(existingAnnouncement: { sellerId: string }, user: { userId: string; role: string }): boolean {
  return existingAnnouncement.sellerId === user.userId || user.role === 'ADMIN';
}

// Helper function to update announcement with seller info
async function updateAnnouncementWithSeller(id: string, data: z.infer<typeof updateAnnouncementSchema>) {
  return prisma.announcement.update({
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
}

// Mettre à jour une annonce (propriétaire uniquement)
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }
    const data = updateAnnouncementSchema.parse(req.body);

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      res.status(404).json({ error: 'Annonce non trouvée' });
      return;
    }

    if (!canUserEditAnnouncement(existingAnnouncement, user)) {
      res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette annonce' });
      return;
    }

    const announcement = await updateAnnouncementWithSeller(id, data);

    logger.info('Annonce mise à jour', { announcementId: id });
    res.json({ message: 'Annonce mise à jour avec succès', announcement });
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
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

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
