import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

// Helper functions to reduce complexity
async function createTestSeller(): Promise<{ id: string; token: string }> {
  const passwordHash = await hashPassword('password123');
  const seller = await prisma.user.create({
    data: {
      email: 'seller@test.com',
      passwordHash,
      role: 'SELLER',
    }
  });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'seller@test.com',
      password: 'password123',
    });

  return { id: seller.id, token: loginResponse.body.accessToken };
}

// Helper to setup test seller
async function setupTestSeller(): Promise<{ id: string; token: string }> {
  return createTestSeller();
}

describe('Announcement Routes', () => {
  let sellerToken: string;
  let sellerId: string;

  beforeAll(async () => {
    const seller = await setupTestSeller();
    sellerId = seller.id;
    sellerToken = seller.token;
  });

  afterAll(async () => {
    await prisma.announcement.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/announcements', () => {
    it('devrait créer une annonce pour un vendeur authentifié', async () => {
      const response = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Timbre rare 1950',
          description: 'Timbre en excellent état, collection privée',
          price: 150.00,
          category: 'Philatélie',
          images: ['https://example.com/image1.jpg'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('announcement');
      expect(response.body.announcement.title).toBe('Timbre rare 1950');
      expect(response.body.announcement.status).toBe('PUBLISHED');
    });

    it('devrait rejeter une annonce sans authentification', async () => {
      const response = await request(app)
        .post('/api/announcements')
        .send({
          title: 'Test',
          description: 'Test description',
          price: 100,
        });

      expect(response.status).toBe(401);
    });

    it('devrait rejeter une annonce avec des données invalides', async () => {
      const response = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'AB', // Trop court
          description: 'Short', // Trop court
          price: -10, // Prix négatif
        });

      expect(response.status).toBe(400);
    });
  });

  // Helper to create test announcements
  async function createTestAnnouncements(sellerId: string): Promise<void> {
    await prisma.announcement.createMany({
      data: [
        {
          title: 'Timbre 1950',
          description: 'Description timbre',
          price: 150,
          sellerId,
          status: 'PUBLISHED',
          category: 'Philatélie',
        },
        {
          title: 'Pièce de monnaie 1800',
          description: 'Description pièce',
          price: 200,
          sellerId,
          status: 'PUBLISHED',
          category: 'Numismatique',
        },
      ]
    });
  }

  describe('GET /api/announcements', () => {
    beforeEach(async () => {
      // Nettoyer les annonces existantes avant de créer de nouvelles
      await prisma.announcement.deleteMany();
      await createTestAnnouncements(sellerId);
    });

    it('devrait retourner la liste des annonces publiées', async () => {
      const response = await request(app)
        .get('/api/announcements');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.announcements)).toBe(true);
    });

    it('devrait filtrer par catégorie', async () => {
      const response = await request(app)
        .get('/api/announcements')
        .query({ category: 'Philatélie' });

      expect(response.status).toBe(200);
      interface Announcement {
        category: string;
      }
      expect(response.body.announcements.every((a: Announcement) => a.category === 'Philatélie')).toBe(true);
    });

    it('devrait rechercher par mot-clé', async () => {
      const response = await request(app)
        .get('/api/announcements')
        .query({ search: 'timbre' });

      expect(response.status).toBe(200);
      expect(response.body.announcements.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/announcements/:id', () => {
    let announcementId: string;

    beforeEach(async () => {
      const announcement = await prisma.announcement.create({
        data: {
          title: 'Test Announcement',
          description: 'Test description',
          price: 100,
          sellerId,
          status: 'PUBLISHED',
        }
      });
      announcementId = announcement.id;
    });

    it('devrait retourner une annonce par ID', async () => {
      const response = await request(app)
        .get(`/api/announcements/${announcementId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', announcementId);
      expect(response.body).toHaveProperty('seller');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const response = await request(app)
        .get('/api/announcements/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});
