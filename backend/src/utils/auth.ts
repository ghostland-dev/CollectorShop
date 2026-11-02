import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// ⚠️ SECURITY: En production, les secrets DOIVENT être définis
// Le fail-fast est géré dans index.ts, mais on garde les fallbacks pour dev/test
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Avertissement si secrets par défaut utilisés (hors production)
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  if (JWT_SECRET === 'change-me-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET in development. Set JWT_SECRET env var for better security.');
  }
  if (JWT_REFRESH_SECRET === 'change-me-in-production-refresh') {
    console.warn('⚠️  WARNING: Using default JWT_REFRESH_SECRET in development. Set JWT_REFRESH_SECRET env var for better security.');
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (payload: JwtPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

// Middleware d'authentification
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token manquant' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware d'autorisation RBAC
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }

    next();
  };
};
