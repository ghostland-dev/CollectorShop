import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

// Mock MinIO pour éviter les tentatives de connexion en environnement de test
jest.mock('../services/minio.service', () => ({
  minioService: {
    uploadFile: jest.fn().mockResolvedValue('https://mock-minio/test-image.jpg'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn().mockReturnValue('https://mock-minio/test-image.jpg'),
  },
}));

// Timeout global étendu pour les environnements CI (bcrypt + DB + HTTP)
jest.setTimeout(30000);

const prisma = new PrismaClient();

// Helper to create test user
async function createTestUser(email: string, password: string) {
  return request(app)
    .post('/api/auth/register')
    .send({ email, password });
}

// Helper to setup test database
async function setupTestDatabase(): Promise<void> {
  await prisma.user.deleteMany();
}

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'BUYER',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'short',
        });

      expect(response.status).toBe(400);
    });

    it('devrait rejeter un email déjà utilisé', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });
  });

// Helper to setup login test user
async function setupLoginTestUser(): Promise<void> {
  await createTestUser('login@example.com', 'password123');
}

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await setupLoginTestUser();
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('devrait rejeter un email inexistant', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      await createTestUser('me@example.com', 'password123');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'me@example.com');
    });

    it('devrait rejeter une requête sans token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
