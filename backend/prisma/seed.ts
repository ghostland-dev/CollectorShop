import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Nettoyer les données existantes (si les tables existent)
  console.log('🧹 Nettoyage des données existantes...');
  try {
    await prisma.purchase.deleteMany();
  } catch (error: any) {
    if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
  }
  try {
    await prisma.announcement.deleteMany();
  } catch (error: any) {
    if (error.code !== 'P2021') throw error;
  }
  try {
    await prisma.user.deleteMany();
  } catch (error: any) {
    if (error.code !== 'P2021') throw error;
  }

  // Créer des utilisateurs
  console.log('👥 Création des utilisateurs...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Collector',
      role: 'ADMIN',
    },
  });

  // Vendeurs
  const seller1 = await prisma.user.create({
    data: {
      email: 'vendeur1@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'SELLER',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'vendeur2@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'SELLER',
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'vendeur3@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Bernard',
      role: 'SELLER',
    },
  });

  // Acheteurs
  const buyer1 = await prisma.user.create({
    data: {
      email: 'acheteur1@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Sophie',
      lastName: 'Lefebvre',
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'acheteur2@collector.shop',
      passwordHash: hashedPassword,
      firstName: 'Thomas',
      lastName: 'Moreau',
      role: 'BUYER',
    },
  });

  console.log(`✅ ${6} utilisateurs créés`);

  // Créer des annonces
  console.log('📦 Création des annonces...');

  // Images Pexels pour les annonces (URLs valides et variées)
  const pexelsImages = {
    philatelie: [
      'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    numismatique: [
      'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/259249/pexels-photo-259249.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/259201/pexels-photo-259201.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    cartes: [
      'https://images.pexels.com/photos/163117/board-game-cards-game-playing-cards-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/163118/board-game-cards-game-playing-cards-163118.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/163119/board-game-cards-game-playing-cards-163119.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  };

  const announcements = [
    {
      title: 'Timbre rare France 1950 - Marianne',
      description: 'Timbre postal français de 1950 en excellent état, série Marianne. Parfait pour collectionneurs de philatélie. Conservé dans un album depuis l\'achat.',
      price: 150.0,
      category: 'Philatélie',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [pexelsImages.philatelie[0]],
    },
    {
      title: 'Collection complète de timbres années 60',
      description: 'Collection complète de timbres français des années 1960. Plus de 200 timbres différents, tous en très bon état. Album inclus.',
      price: 450.0,
      category: 'Philatélie',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [pexelsImages.philatelie[1]],
    },
    {
      title: 'Pièce de 2€ commémorative 2004',
      description: 'Pièce de 2 euros commémorative française de 2004, édition limitée. État neuf, jamais utilisée. Parfaite pour collectionneurs numismates.',
      price: 25.0,
      category: 'Numismatique',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [pexelsImages.numismatique[0]],
    },
    {
      title: 'Collection de pièces anciennes (1800-1900)',
      description: 'Collection de 15 pièces françaises anciennes datant de 1800 à 1900. Toutes authentifiées. Provenance garantie.',
      price: 850.0,
      category: 'Numismatique',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [pexelsImages.numismatique[1]],
    },
    {
      title: 'Carte Pokémon première édition - Charizard',
      description: 'Carte Pokémon Charizard première édition en excellent état. Carte rare et recherchée par les collectionneurs. Protégée depuis l\'achat.',
      price: 1200.0,
      category: 'Cartes',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pexelsImages.cartes[0]],
    },
    {
      title: 'Lot de cartes Magic: The Gathering',
      description: 'Lot de 50 cartes Magic: The Gathering rares et mythiques. Mélange de différentes éditions. Parfait pour débuter ou compléter une collection.',
      price: 180.0,
      category: 'Cartes',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pexelsImages.cartes[1]],
    },
    {
      title: 'Timbre commémoratif JO 1968',
      description: 'Timbre commémoratif des Jeux Olympiques de 1968. État impeccable, dentelure parfaite. Rare et recherché.',
      price: 75.0,
      category: 'Philatélie',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [pexelsImages.philatelie[2]],
    },
    {
      title: 'Pièce d\'or Napoléon III',
      description: 'Pièce d\'or de 20 francs Napoléon III, année 1867. Authentifiée par un expert. Très bon état de conservation.',
      price: 3200.0,
      category: 'Numismatique',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [pexelsImages.numismatique[2]],
    },
    {
      title: 'Carte Yu-Gi-Oh! Blue Eyes White Dragon',
      description: 'Carte Yu-Gi-Oh! Blue Eyes White Dragon première édition, édition limitée. Carte emblématique en excellent état.',
      price: 350.0,
      category: 'Cartes',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pexelsImages.cartes[2]],
    },
    {
      title: 'Collection de timbres internationaux',
      description: 'Collection variée de timbres internationaux (Europe, Asie, Amériques). Plus de 300 timbres différents, tous en bon état.',
      price: 280.0,
      category: 'Philatélie',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [pexelsImages.philatelie[0]],
    },
    {
      title: 'Ancien billet de banque français',
      description: 'Billet de 100 francs français des années 1950. État correct, quelques plis mais lisible. Pièce historique intéressante.',
      price: 120.0,
      category: 'Numismatique',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [pexelsImages.numismatique[0]],
    },
    {
      title: 'Carte à collectionner Star Wars',
      description: 'Collection de cartes à collectionner Star Wars des années 80. Lot de 30 cartes en très bon état. Nostalgie garantie.',
      price: 95.0,
      category: 'Cartes',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pexelsImages.cartes[0]],
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement,
    });
  }

  console.log(`✅ ${announcements.length} annonces créées`);

  // Créer quelques achats (optionnel)
  console.log('🛒 Création d\'achats de test...');

  const firstAnnouncement = await prisma.announcement.findFirst({
    where: { sellerId: seller1.id },
  });

  if (firstAnnouncement) {
    await prisma.purchase.create({
      data: {
        announcementId: firstAnnouncement.id,
        buyerId: buyer1.id,
        amount: firstAnnouncement.price,
        status: 'COMPLETED',
      },
    });

    // Marquer l'annonce comme vendue
    await prisma.announcement.update({
      where: { id: firstAnnouncement.id },
      data: { status: 'SOLD' },
    });

    console.log('✅ 1 achat créé');
  }

  console.log('✨ Seed terminé avec succès!');
  console.log('\n📋 Comptes de test créés:');
  console.log('   Admin: admin@collector.shop / password123');
  console.log('   Vendeur 1: vendeur1@collector.shop / password123');
  console.log('   Vendeur 2: vendeur2@collector.shop / password123');
  console.log('   Vendeur 3: vendeur3@collector.shop / password123');
  console.log('   Acheteur 1: acheteur1@collector.shop / password123');
  console.log('   Acheteur 2: acheteur2@collector.shop / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
