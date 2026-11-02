import * as Minio from 'minio';
import { logger } from '../utils/logger';

class MinioService {
  private client: Minio.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin123';

    this.bucketName = process.env.MINIO_BUCKET || 'collector-shop-images';
    // Pour les URLs publiques, utiliser localhost depuis le navigateur, pas le nom du service Docker
    this.publicUrl = process.env.MINIO_PUBLIC_URL || (endpoint === 'minio' ? 'http://localhost:9000' : `http://${endpoint}:${port}`);

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        // Définir la politique publique pour le bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        logger.info(`Bucket ${this.bucketName} créé avec succès`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation du bucket MinIO', { error });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'announcements'): Promise<string> {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const metaData = {
        'Content-Type': file.mimetype,
      };

      await this.client.putObject(this.bucketName, fileName, file.buffer, file.size, metaData);

      const url = `${this.publicUrl}/${this.bucketName}/${fileName}`;
      logger.info(`Fichier uploadé: ${fileName}`);

      return url;
    } catch (error) {
      logger.error('Erreur lors de l\'upload du fichier', { error });
      throw new Error('Erreur lors de l\'upload du fichier');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, fileName);
      logger.info(`Fichier supprimé: ${fileName}`);
    } catch (error) {
      logger.error('Erreur lors de la suppression du fichier', { error });
      throw new Error('Erreur lors de la suppression du fichier');
    }
  }

  getPublicUrl(fileName: string): string {
    return `${this.publicUrl}/${this.bucketName}/${fileName}`;
  }
}

export const minioService = new MinioService();
