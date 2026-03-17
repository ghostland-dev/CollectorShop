// ensure environment variables from `.env` are loaded when running the seeder
// (Prisma client itself doesn't automatically read the file at runtime)
import dotenv from 'dotenv';
dotenv.config();

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

  // Créer des boutiques pour chaque utilisateur
  console.log('🏪 Création des boutiques...');

  await prisma.shop.create({
    data: {
      name: 'Admin Shop',
      description: 'Boutique officielle de Collector.shop',
      userId: admin.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Jean\'s Collectors',
      description: 'Collection spécialisée en timbres rares et philatélie',
      userId: seller1.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Marie\'s Numismatic Vault',
      description: 'Pièces de monnaie anciennes et collectibles',
      userId: seller2.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Pierre\'s Card Paradise',
      description: 'Cartes à collectionner premium et éditions limitées',
      userId: seller3.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Sophie\'s Collection Corner',
      description: 'Acheteur passionné cherchant des pièces rares',
      userId: buyer1.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Thomas\'s Trading Post',
      description: 'Échange et achat de collections intéressantes',
      userId: buyer2.id,
    },
  });

  console.log('✅ 6 boutiques créées');

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

  // Récupérer les annonces créées pour les assigner aux collections
  const createdAnnouncements = await prisma.announcement.findMany();

  // Créer les boutiques pour récupérer les IDs
  const shops = await prisma.shop.findMany();
  const seller1Shop = shops.find(s => s.userId === seller1.id);
  const seller2Shop = shops.find(s => s.userId === seller2.id);
  const seller3Shop = shops.find(s => s.userId === seller3.id);

  // Créer des collections
  console.log('📚 Création des collections...');

  // Collections pour Jean (Philatélie)
  if (seller1Shop) {
    const rareStampsCollection = await prisma.collection.create({
      data: {
        name: 'Timbres Rares',
        description: 'Collection de timbres rares et recherchés pour les collectionneurs de philatélie',
        image: 'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller1Shop.id,
      },
    });

    const vintagStampsCollection = await prisma.collection.create({
      data: {
        name: 'Timbres Vintage (1950-1970)',
        description: 'Timbres authentiques des années 1950 à 1970, période dorée de la philatélie',
        image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller1Shop.id,
      },
    });

    const internationalCollection = await prisma.collection.create({
      data: {
        name: 'Timbres Internationaux',
        description: 'Sélection variée de timbres du monde entier',
        image: 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller1Shop.id,
      },
    });

    // Assigner les annonces de seller1 aux collections
    const seller1Announcements = createdAnnouncements.filter(a => a.sellerId === seller1.id);
    
    for (const ann of seller1Announcements) {
      if (ann.category === 'Philatélie') {
        if (ann.title.includes('1950') || ann.title.includes('années 60')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: vintagStampsCollection.id },
          });
        } else if (ann.title.includes('rare') || ann.title.includes('JO')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: rareStampsCollection.id },
          });
        } else {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: internationalCollection.id },
          });
        }
      }
    }

    console.log('✅ 3 collections créées pour Jean');
  }

  // Collections pour Marie (Numismatique)
  if (seller2Shop) {
    const ancientCoinsCollection = await prisma.collection.create({
      data: {
        name: 'Pièces Anciennes (1800-1900)',
        description: 'Collection de pièces françaises authentiques du 19ème siècle',
        image: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller2Shop.id,
      },
    });

    const commemorativeCollection = await prisma.collection.create({
      data: {
        name: 'Pièces Commémoratives',
        description: 'Pièces spéciales et éditions limitées de différentes périodes',
        image: 'https://images.pexels.com/photos/259249/pexels-photo-259249.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller2Shop.id,
      },
    });

    const goldCoinsCollection = await prisma.collection.create({
      data: {
        name: 'Pièces d\'Or',
        description: 'Sélection premium de pièces d\'or authentiques et certificatées',
        image: 'https://images.pexels.com/photos/259201/pexels-photo-259201.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller2Shop.id,
      },
    });

    // Assigner les annonces de seller2 aux collections
    const seller2Announcements = createdAnnouncements.filter(a => a.sellerId === seller2.id);
    
    for (const ann of seller2Announcements) {
      if (ann.category === 'Numismatique') {
        if (ann.title.includes('Napoléon') || ann.title.includes('or')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: goldCoinsCollection.id },
          });
        } else if (ann.title.includes('1800') || ann.title.includes('ancien')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: ancientCoinsCollection.id },
          });
        } else {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: commemorativeCollection.id },
          });
        }
      }
    }

    console.log('✅ 3 collections créées pour Marie');
  }

  // Collections pour Pierre (Cartes)
  if (seller3Shop) {
    const pokemonCollection = await prisma.collection.create({
      data: {
        name: 'Cartes Pokémon',
        description: 'Cartes Pokémon rares et premières éditions pour les collectionneurs passionnés',
        image: 'https://images.pexels.com/photos/163117/board-game-cards-game-playing-cards-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller3Shop.id,
      },
    });

    const magicCollection = await prisma.collection.create({
      data: {
        name: 'Magic: The Gathering',
        description: 'Cartes rares et mythiques de Magic pour les joueurs et collectionneurs',
        image: 'https://images.pexels.com/photos/163118/board-game-cards-game-playing-cards-163118.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller3Shop.id,
      },
    });

    const otherCardGamesCollection = await prisma.collection.create({
      data: {
        name: 'Autres Jeux de Cartes',
        description: 'Sélection variée d\'autres jeux de cartes à collectionner',
        image: 'https://images.pexels.com/photos/163119/board-game-cards-game-playing-cards-163119.jpeg?auto=compress&cs=tinysrgb&w=800',
        shopId: seller3Shop.id,
      },
    });

    // Assigner les annonces de seller3 aux collections
    const seller3Announcements = createdAnnouncements.filter(a => a.sellerId === seller3.id);
    
    for (const ann of seller3Announcements) {
      if (ann.category === 'Cartes') {
        if (ann.title.includes('Pokémon')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: pokemonCollection.id },
          });
        } else if (ann.title.includes('Magic')) {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: magicCollection.id },
          });
        } else {
          await prisma.announcement.update({
            where: { id: ann.id },
            data: { collectionId: otherCardGamesCollection.id },
          });
        }
      }
    }

    console.log('✅ 3 collections créées pour Pierre');
  }

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

  // Créer une conversation de test avec un message
  console.log('💬 Création d\'une conversation de test...');

  if (firstAnnouncement) {
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: buyer1.id,
        user2Id: seller1.id,
        announcementId: firstAnnouncement.id,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyer1.id,
        receiverId: seller1.id,
        content: 'Bonjour ! Je suis très intéressé par cette annonce. Pouvez-vous me donner plus de détails sur l\'état de l\'article ?',
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: seller1.id,
        receiverId: buyer1.id,
        content: 'Bonjour ! L\'article est en excellent état, comme décrit dans l\'annonce. Je peux envoyer des photos supplémentaires si vous le souhaitez.',
      },
    });

    console.log('✅ Conversation et messages créés');
  }

  console.log('✨ Seed terminé avec succès!');
  console.log('\n📋 Comptes de test créés:');
  console.log('   Admin: admin@collector.shop / password123');
  console.log('   Vendeur 1: vendeur1@collector.shop / password123 (Timbres - 3 collections)');
  console.log('   Vendeur 2: vendeur2@collector.shop / password123 (Pièces - 3 collections)');
  console.log('   Vendeur 3: vendeur3@collector.shop / password123 (Cartes - 3 collections)');
  console.log('   Acheteur 1: acheteur1@collector.shop / password123');
  console.log('   Acheteur 2: acheteur2@collector.shop / password123');
  console.log('\n📚 Collections créées: 9 collections (3 par vendeur) avec articles assignés');
  console.log('💬 Messagerie test: Une conversation a été créée entre acheteur1 et vendeur1');
  console.log('\n🔗 Routes disponibles:');
  console.log('   GET  /api/collections/shop/:shopId         - Lister les collections d\'une boutique');
  console.log('   GET  /api/collections/:collectionId        - Détails d\'une collection avec articles');
  console.log('   POST /api/collections                      - Créer une collection (vendeur)');
  console.log('   PUT  /api/collections/:collectionId        - Modifier une collection (propriétaire)');
  console.log('   DELETE /api/collections/:collectionId      - Supprimer une collection (propriétaire)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
