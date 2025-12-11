import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../utils/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createMessageSchema = z.object({
  receiverId: z.string().uuid('ID de destinataire invalide'),
  announcementId: z.string().uuid('ID d\'annonce invalide').optional(),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long (max 2000 caractères)'),
});

// Créer ou récupérer une conversation
router.get('/conversations', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: user.userId },
          { user2Id: user.userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
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
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    res.json({ conversations });
  } catch (error) {
    logger.error('Erreur lors de la récupération des conversations', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// Récupérer ou créer une conversation avec un utilisateur
router.post('/conversations', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { receiverId, announcementId } = req.body;

    if (!receiverId || receiverId === user.userId) {
      res.status(400).json({ error: 'ID de destinataire invalide' });
      return;
    }

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Destinataire introuvable' });
      return;
    }

    // Chercher une conversation existante
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: user.userId,
            user2Id: receiverId,
            announcementId: announcementId || null,
          },
          {
            user1Id: receiverId,
            user2Id: user.userId,
            announcementId: announcementId || null,
          },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
    });

    if (existingConversation) {
      res.json({ conversation: existingConversation });
      return;
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: user.userId,
        user2Id: receiverId,
        announcementId: announcementId || null,
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
    });

    res.status(201).json({ conversation });
  } catch (error) {
    logger.error('Erreur lors de la création de la conversation', { error });
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
});

// Récupérer les messages d'une conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { conversationId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation introuvable' });
      return;
    }

    if (conversation.user1Id !== user.userId && conversation.user2Id !== user.userId) {
      res.status(403).json({ error: 'Vous n\'êtes pas autorisé à accéder à cette conversation' });
      return;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Marquer les messages comme lus si l'utilisateur est le destinataire
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.userId,
        read: false,
      },
      data: { read: true },
    });

    res.json({
      messages: messages.reverse(), // Inverser pour avoir les plus anciens en premier
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des messages', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Envoyer un message
router.post('/messages', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const data = createMessageSchema.parse(req.body);

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Destinataire introuvable' });
      return;
    }

    if (data.receiverId === user.userId) {
      res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer un message à vous-même' });
      return;
    }

    // Récupérer ou créer la conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: user.userId,
            user2Id: data.receiverId,
            announcementId: data.announcementId || null,
          },
          {
            user1Id: data.receiverId,
            user2Id: user.userId,
            announcementId: data.announcementId || null,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: user.userId,
          user2Id: data.receiverId,
          announcementId: data.announcementId || null,
        },
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.userId,
        receiverId: data.receiverId,
        content: data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Mettre à jour la date du dernier message de la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    logger.info('Message créé', { messageId: message.id, conversationId: conversation.id, senderId: user.userId });
    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    logger.error('Erreur lors de la création du message', { error });
    res.status(500).json({ error: 'Erreur lors de la création du message' });
  }
});

// Compter les messages non lus
router.get('/messages/unread-count', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.userId,
        read: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    logger.error('Erreur lors du comptage des messages non lus', { error });
    res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
  }
});

export default router;

