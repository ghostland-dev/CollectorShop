import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth';
import { logger } from '../utils/logger';
import { authenticate } from '../utils/auth';
import { logAuditSuccess, AuditAction, getAuditContext } from '../utils/audit-logger';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER']).optional().default('BUYER'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Helper function to create user payload
function createUserPayload(user: { id: string; email: string; role: string }): { userId: string; email: string; role: string } {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

// Helper function to handle user registration
async function handleUserRegistration(data: z.infer<typeof registerSchema>) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    }
  });

  const payload = createUserPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
}

// Inscription
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await handleUserRegistration(data);
    const context = getAuditContext(req);

    logger.info('Nouvel utilisateur créé', { userId: result.user.id, email: result.user.email });

    // 🔒 AUDIT LOG: Enregistrement d'un nouvel utilisateur
    logAuditSuccess(AuditAction.USER_REGISTER, result.user.id, {
      userEmail: result.user.email,
      userRole: result.user.role,
      resourceType: 'User',
      resourceId: result.user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      res.status(409).json({ error: 'Cet email est déjà utilisé' });
      return;
    }
    logger.error('Erreur lors de l\'inscription', { error });
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Helper function to handle user login
async function handleUserLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const payload = createUserPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  };
}

// Connexion
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await handleUserLogin(data.email, data.password);

    logger.info('Connexion réussie', { userId: result.user.id });

    res.json({
      message: 'Connexion réussie',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }
    logger.error('Erreur lors de la connexion', { error });
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Helper function to handle token refresh
async function handleTokenRefresh(refreshToken: string) {
  if (!refreshToken) {
    throw new Error('REFRESH_TOKEN_MISSING');
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    }
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const newPayload = createUserPayload(user);
  const accessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  };
}

// Renouveler le token d'accès avec le refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await handleTokenRefresh(refreshToken);

    logger.info('Token renouvelé', { userId: result.user.id });

    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'REFRESH_TOKEN_MISSING') {
        res.status(400).json({ error: 'Refresh token manquant' });
        return;
      }
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }
    }
    logger.error('Erreur lors du renouvellement du token', { error });
    res.status(401).json({ error: 'Refresh token invalide ou expiré' });
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      }
    });

    if (!userData) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json(userData);
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil', { error });
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

export default router;
