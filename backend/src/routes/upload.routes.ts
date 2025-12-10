import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../utils/auth';
import { minioService } from '../services/minio.service';
import { logger } from '../utils/logger';
import '../types/express';

const router = Router();

// Configuration multer pour les uploads en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou GIF.'));
    }
  },
});

// Upload d'une image (SELLER/ADMIN uniquement)
router.post(
  '/image',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Aucun fichier fourni' });
        return;
      }

      const url = await minioService.uploadFile(req.file, 'announcements');
      
      logger.info('Image uploadée avec succès', { url, userId: (req as any).user?.userId });

      res.json({
        message: 'Image uploadée avec succès',
        url,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'upload de l\'image', { error });
      res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
    }
  }
);

// Upload de plusieurs images
router.post(
  '/images',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  upload.array('images', 5), // Maximum 5 images
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({ error: 'Aucun fichier fourni' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const urls = await Promise.all(
        files.map((file) => minioService.uploadFile(file, 'announcements'))
      );

      logger.info('Images uploadées avec succès', { count: urls.length, userId: req.user?.userId });

      res.json({
        message: 'Images uploadées avec succès',
        urls,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'upload des images', { error });
      res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
    }
  }
);

export default router;
