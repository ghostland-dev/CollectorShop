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

// Helper function to build conversation include
function buildConversationInclude() {
  return {
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
  };
}

// Helper function to find existing conversation
async function findExistingConversation(userId: string, receiverId: string, announcementId?: string | null) {
  return prisma.conversation.findFirst({
    where: {
      OR: [
        {
          user1Id: userId,
          user2Id: receiverId,
          announcementId: announcementId || null,
        },
        {
          user1Id: receiverId,
          user2Id: userId,
          announcementId: announcementId || null,
        },
      ],
    },
    include: buildConversationInclude(),
  });
}

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
        ...buildConversationInclude(),
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

// Helper function to validate receiver
async function validateReceiver(receiverId: string): Promise<{ valid: boolean; error?: string }> {
  if (!receiverId) {
    return { valid: false, error: 'ID de destinataire invalide' };
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    return { valid: false, error: 'Destinataire introuvable' };
  }

  return { valid: true };
}

// Helper function to create conversation
async function createConversation(userId: string, receiverId: string, announcementId?: string | null) {
  return prisma.conversation.create({
    data: {
      user1Id: userId,
      user2Id: receiverId,
      announcementId: announcementId || null,
    },
    include: buildConversationInclude(),
  });
}

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

    const receiverValidation = await validateReceiver(receiverId);
    if (!receiverValidation.valid) {
      res.status(404).json({ error: receiverValidation.error });
      return;
    }

    const existingConversation = await findExistingConversation(user.userId, receiverId, announcementId);
    if (existingConversation) {
      res.json({ conversation: existingConversation });
      return;
    }

    const conversation = await createConversation(user.userId, receiverId, announcementId);
    res.status(201).json({ conversation });
  } catch (error) {
    logger.error('Erreur lors de la création de la conversation', { error });
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
});

// Helper function to check conversation access
async function checkConversationAccess(conversationId: string, userId: string): Promise<{ allowed: boolean; error?: string }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return { allowed: false, error: 'Conversation introuvable' };
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    return { allowed: false, error: 'Vous n\'êtes pas autorisé à accéder à cette conversation' };
  }

  return { allowed: true };
}

// Helper function to build message include
function buildMessageInclude() {
  return {
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
  };
}

// Helper function to parse pagination params
function parsePaginationParams(page: unknown, limit: unknown): { pageNum: number; limitNum: number; skip: number } {
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
}

// Helper function to fetch messages with pagination
async function fetchMessagesWithPagination(conversationId: string, limitNum: number, skip: number) {
  return Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: buildMessageInclude(),
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);
}

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

    const accessCheck = await checkConversationAccess(conversationId, user.userId);
    if (!accessCheck.allowed) {
      res.status(accessCheck.error?.includes('introuvable') ? 404 : 403).json({ error: accessCheck.error });
      return;
    }

    const { pageNum, limitNum, skip } = parsePaginationParams(page, limit);
    const [messages, total] = await fetchMessagesWithPagination(conversationId, limitNum, skip);

    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.userId,
        read: false,
      },
      data: { read: true },
    });

    res.json({
      messages: messages.reverse(),
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des messages', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Helper function to get or create conversation for message
async function getOrCreateConversationForMessage(
  userId: string,
  receiverId: string,
  announcementId?: string | null
) {
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        {
          user1Id: userId,
          user2Id: receiverId,
          announcementId: announcementId || null,
        },
        {
          user1Id: receiverId,
          user2Id: userId,
          announcementId: announcementId || null,
        },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user1Id: userId,
        user2Id: receiverId,
        announcementId: announcementId || null,
      },
    });
  }

  return conversation;
}

// Helper function to validate message sender
function validateMessageSender(receiverId: string, userId: string, res: Response): boolean {
  if (receiverId === userId) {
    res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer un message à vous-même' });
    return false;
  }
  return true;
}

// Helper function to create message and update conversation
async function createMessageAndUpdateConversation(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
) {
  const [message] = await Promise.all([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
      },
      include: buildMessageInclude(),
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
  return message;
}

// Envoyer un message
router.post('/messages', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const data = createMessageSchema.parse(req.body);

    if (!validateMessageSender(data.receiverId, user.userId, res)) {
      return;
    }

    const receiverValidation = await validateReceiver(data.receiverId);
    if (!receiverValidation.valid) {
      res.status(404).json({ error: receiverValidation.error });
      return;
    }

    const conversation = await getOrCreateConversationForMessage(
      user.userId,
      data.receiverId,
      data.announcementId
    );

    const message = await createMessageAndUpdateConversation(
      conversation.id,
      user.userId,
      data.receiverId,
      data.content
    );

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
