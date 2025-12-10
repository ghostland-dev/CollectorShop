import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

describe('Announcement Routes', () => {
  let sellerToken: string;
  let sellerId: string;

  beforeAll(async () => {
    // Créer un vendeur de test
    const passwordHash = await hashPassword('password123');
    const seller = await prisma.user.create({
      data: {
        email: 'seller@test.com',
        passwordHash,
        role: 'SELLER',
      }
    });
    sellerId = seller.id;

    // Se connecter pour obtenir le token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seller@test.com',
        password: 'password123',
      });
    sellerToken = loginResponse.body.accessToken;
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

  describe('GET /api/announcements', () => {
    beforeEach(async () => {
      // Créer quelques annonces de test
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
    });

    it('devrait retourner la liste des annonces publiées', async () => {
      const response = await request(app)
        .get('/api/announcements');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.announcements)).toBe(true);
    });

    it('devrait filtrer par catégorie', async () => {
      const response = await request(app)
        .get('/api/announcements?category=Philatélie');

      expect(response.status).toBe(200);
      expect(response.body.announcements.every((a: any) => a.category === 'Philatélie')).toBe(true);
    });

    it('devrait rechercher par mot-clé', async () => {
      const response = await request(app)
        .get('/api/announcements?search=timbre');

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
