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
      name: 'Collector.shop Admin',
      description: 'Boutique officielle de Collector.shop — cartes Pokémon certifiées',
      userId: admin.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Jean\'s Pokémon Paradise',
      description: 'Spécialiste cartes Pokémon Base Set et Fossil — toutes les cartes sont en pochette protectrice depuis l\'achat',
      userId: seller1.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Marie\'s Rare Cards Vault',
      description: 'Cartes holographiques et ultra-rares des sets Neo Genesis et Neo Discovery',
      userId: seller2.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Pierre\'s TCG Treasure',
      description: 'Cartes Pokémon EX, GX et V ultra-rares — première édition et éditions limitées',
      userId: seller3.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Sophie\'s Pokémon Hunt',
      description: 'Collectionneuse passionnée à la recherche de cartes rares',
      userId: buyer1.id,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'Thomas\'s Card Exchange',
      description: 'Échange et achat de cartes Pokémon rares',
      userId: buyer2.id,
    },
  });

  console.log('✅ 6 boutiques créées');

  // Créer des annonces
  console.log('📦 Création des annonces...');

  // ─── Images cartes Pokémon rares (CDN officiel PokéTCG) ───────────────────
  // Base Set (1999) — Holographiques rares
  const charizardBase    = 'https://images.pokemontcg.io/base1/4_hires.png';
  const blastoiseBase    = 'https://images.pokemontcg.io/base1/2_hires.png';
  const venusaurBase     = 'https://images.pokemontcg.io/base1/15_hires.png';
  const pikachuBase      = 'https://images.pokemontcg.io/base1/58_hires.png';
  const mewtwoBase       = 'https://images.pokemontcg.io/base1/10_hires.png';
  const lugiaNeo         = 'https://images.pokemontcg.io/neo1/9_hires.png';
  const hoOhNeo          = 'https://images.pokemontcg.io/neo4/22_hires.png';
  // EX / GX / V rares
  const charizardGX      = 'https://images.pokemontcg.io/sm12/21_hires.png';
  const pikachuVmax      = 'https://images.pokemontcg.io/swsh45/14_hires.png';
  const mewtwoGX         = 'https://images.pokemontcg.io/sm5/31_hires.png';
  const rayquazaEx       = 'https://images.pokemontcg.io/exy/60_hires.png';
  const umbreonGX        = 'https://images.pokemontcg.io/sm3/80_hires.png';

  const announcements = [
    // ─── Jean : Base Set & Neo (holographiques 1999-2000) ─────────────────
    {
      title: 'Charizard Holographique — Base Set 1ère Édition (1999)',
      description: 'Charizard Holo 1ère édition, set de base 1999. Note PSA estimée 8/10. Carte en pochette rigide depuis l\'achat. L\'une des cartes les plus recherchées au monde. Certificat d\'authenticité inclus.',
      price: 8500.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [charizardBase],
    },
    {
      title: 'Blastoise Holographique — Base Set 1ère Édition (1999)',
      description: 'Blastoise Holo 1ère édition, set de base 1999. Très bon état, coins légèrement arrondis. Conservée en sleeve depuis 2001. Idéale pour compléter le trio de starters holographiques.',
      price: 2200.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [blastoiseBase],
    },
    {
      title: 'Mewtwo Holographique — Base Set Unlimited',
      description: 'Mewtwo Holo Base Set édition illimitée. Légendaire des jeux Game Boy, désormais pièce de collection incontournable. État Near Mint.',
      price: 320.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [mewtwoBase],
    },
    {
      title: 'Lugia Holographique — Neo Genesis 1ère Édition (2000)',
      description: 'Lugia Holo 1ère édition Neo Genesis, la carte emblématique du film Pokémon 2000. État Excellent, dorures brillantes intactes. Très rare en première édition.',
      price: 4800.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller1.id,
      images: [lugiaNeo],
    },
    // ─── Marie : EX / GX ultra-rares ──────────────────────────────────────
    {
      title: 'Charizard-GX Full Art — SM Burning Shadows (2017)',
      description: 'Charizard GX Full Art hyper rare, set Burning Shadows 2017. Note PSA 9. Illustration spectaculaire sur fond noir. Pièce maîtresse pour tout collectionneur moderne.',
      price: 1850.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [charizardGX],
    },
    {
      title: 'Mewtwo-GX Full Art — SM Shining Legends (2017)',
      description: 'Mewtwo GX Full Art ultra-rare, édition Shining Legends. Tirage limité en booster spécial. Parfaite condition, jamais jouée. Sleeve premium depuis l\'ouverture.',
      price: 680.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [mewtwoGX],
    },
    {
      title: 'Umbreon-GX Full Art — SM Hidden Fates (2019)',
      description: 'Umbreon GX Full Art Hidden Fates, set extrêmement rare avec tirage limité. Art signé par l\'illustrateur. État Near Mint, encapsulation possible.',
      price: 950.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [umbreonGX],
    },
    {
      title: 'Rayquaza-EX Full Art — XY Black Star Promo (2015)',
      description: 'Rayquaza EX Full Art promo exclusive XY. Dorures du dragon vert parfaitement conservées. L\'une des cartes EX les plus appréciées pour son artwork.',
      price: 420.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller2.id,
      images: [rayquazaEx],
    },
    // ─── Pierre : VMAX / Vintage rares ────────────────────────────────────
    {
      title: 'Pikachu VMAX Rainbow — SWSH Vivid Voltage (2020)',
      description: 'Pikachu VMAX Rainbow Rare, set Vivid Voltage 2020. La carte la plus iconique de la série Sword & Shield. Notée PSA 10 Gem Mint. Investissement sûr.',
      price: 3200.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pikachuVmax],
    },
    {
      title: 'Pikachu Illustrateur Promo — 1998 (réimpression certifiée)',
      description: 'Réimpression officielle certifiée du légendaire Pikachu Illustrateur (1998), la carte la plus rare au monde. Certificat d\'authenticité numéroté. Idéal comme pièce de musée.',
      price: 12000.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [pikachuBase],
    },
    {
      title: 'Vénusaure Holographique — Base Set 1ère Édition (1999)',
      description: 'Vénusaure Holo 1ère édition, set de base 1999. Complète le trio légendaire avec Charizard et Blastoise. État Very Good, légères marques de jeu en coin.',
      price: 1600.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [venusaurBase],
    },
    {
      title: 'Ho-Oh Holographique — Neo Destiny 1ère Édition (2002)',
      description: 'Ho-Oh Holo rare 1ère édition Neo Destiny, ultime set de la série Neo. Carte très difficile à trouver en première édition. État Excellent-Mint.',
      price: 2100.0,
      category: 'Cartes Pokémon',
      status: 'PUBLISHED' as const,
      sellerId: seller3.id,
      images: [hoOhNeo],
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

  // Collections pour Jean (Base Set & Neo)
  if (seller1Shop) {
    const baseSetCollection = await prisma.collection.create({
      data: {
        name: 'Base Set 1ère Édition (1999)',
        description: 'Les cartes holographiques originales du premier set Pokémon — les plus recherchées au monde',
        image: charizardBase,
        shopId: seller1Shop.id,
      },
    });

    const neoCollection = await prisma.collection.create({
      data: {
        name: 'Série Neo Genesis & Neo Destiny',
        description: 'Cartes holographiques des sets Neo (2000-2002), incluant Lugia et Ho-Oh légendaires',
        image: lugiaNeo,
        shopId: seller1Shop.id,
      },
    });

    const unlimitedCollection = await prisma.collection.create({
      data: {
        name: 'Base Set Unlimited',
        description: 'Cartes holographiques du Base Set édition illimitée — état Near Mint',
        image: mewtwoBase,
        shopId: seller1Shop.id,
      },
    });

    const seller1Announcements = createdAnnouncements.filter(a => a.sellerId === seller1.id);

    for (const ann of seller1Announcements) {
      if (ann.title.includes('1ère Édition') && (ann.title.includes('Charizard') || ann.title.includes('Blastoise'))) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: baseSetCollection.id } });
      } else if (ann.title.includes('Lugia') || ann.title.includes('Neo')) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: neoCollection.id } });
      } else {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: unlimitedCollection.id } });
      }
    }

    console.log('✅ 3 collections créées pour Jean');
  }

  // Collections pour Marie (EX / GX)
  if (seller2Shop) {
    const gxCollection = await prisma.collection.create({
      data: {
        name: 'Cartes GX Full Art (2016-2019)',
        description: 'Cartes GX Full Art ultra-rares de la série Sun & Moon — illustrations spectaculaires',
        image: charizardGX,
        shopId: seller2Shop.id,
      },
    });

    const hiddenFatesCollection = await prisma.collection.create({
      data: {
        name: 'Hidden Fates — Tirage Limité (2019)',
        description: 'Le set le plus rare de la série Shiny Vault — tirage extrêmement limité',
        image: umbreonGX,
        shopId: seller2Shop.id,
      },
    });

    const promoCollection = await prisma.collection.create({
      data: {
        name: 'Cartes Promo & EX Rares',
        description: 'Cartes promotionnelles exclusives et EX Full Art recherchées',
        image: rayquazaEx,
        shopId: seller2Shop.id,
      },
    });

    const seller2Announcements = createdAnnouncements.filter(a => a.sellerId === seller2.id);

    for (const ann of seller2Announcements) {
      if (ann.title.includes('Hidden Fates') || ann.title.includes('Umbreon')) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: hiddenFatesCollection.id } });
      } else if (ann.title.includes('GX')) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: gxCollection.id } });
      } else {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: promoCollection.id } });
      }
    }

    console.log('✅ 3 collections créées pour Marie');
  }

  // Collections pour Pierre (VMAX / Vintage rares)
  if (seller3Shop) {
    const vmaxCollection = await prisma.collection.create({
      data: {
        name: 'Cartes VMAX Rainbow Rare (2020-2022)',
        description: 'Les cartes Rainbow Rare VMAX de la série Sword & Shield — investissements sûrs',
        image: pikachuVmax,
        shopId: seller3Shop.id,
      },
    });

    const illustrateurCollection = await prisma.collection.create({
      data: {
        name: 'Éditions Spéciales & Illustrateur',
        description: 'Cartes promotionnelles exceptionnelles et réimpressions certifiées des cartes légendaires',
        image: pikachuBase,
        shopId: seller3Shop.id,
      },
    });

    const vintage1erEdCollection = await prisma.collection.create({
      data: {
        name: 'Vintage 1ère Édition — Starters Holo',
        description: 'Les trois starters holographiques 1ère édition 1999 — trio légendaire complet',
        image: venusaurBase,
        shopId: seller3Shop.id,
      },
    });

    const seller3Announcements = createdAnnouncements.filter(a => a.sellerId === seller3.id);

    for (const ann of seller3Announcements) {
      if (ann.title.includes('VMAX') || ann.title.includes('Rainbow')) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: vmaxCollection.id } });
      } else if (ann.title.includes('Illustrateur') || ann.title.includes('Pikachu')) {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: illustrateurCollection.id } });
      } else {
        await prisma.announcement.update({ where: { id: ann.id }, data: { collectionId: vintage1erEdCollection.id } });
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
        content: 'Bonjour ! Je suis très intéressé par votre Charizard Holographique 1ère édition. Est-ce que la carte a été gradée PSA ? Et est-il possible d\'avoir des photos supplémentaires sous différents angles ?',
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: seller1.id,
        receiverId: buyer1.id,
        content: 'Bonjour Sophie ! La carte n\'a pas encore été gradée PSA mais elle est en excellent état Near Mint. Centering 60/40 environ, pas de rayures sur le holo. Je vous envoie des photos macro ce soir. Le prix est ferme étant donné la rareté.',
      },
    });

    console.log('✅ Conversation et messages créés');
  }

  console.log('✨ Seed terminé avec succès!');
  console.log('\n📋 Comptes de test créés:');
  console.log('   Admin: admin@collector.shop / password123');
  console.log('   Vendeur 1: vendeur1@collector.shop / password123 (Base Set & Neo - 3 collections)');
  console.log('   Vendeur 2: vendeur2@collector.shop / password123 (GX / EX Full Art - 3 collections)');
  console.log('   Vendeur 3: vendeur3@collector.shop / password123 (VMAX / Vintage 1ère Éd. - 3 collections)');
  console.log('   Acheteur 1: acheteur1@collector.shop / password123');
  console.log('   Acheteur 2: acheteur2@collector.shop / password123');
  console.log('\n🃏 12 cartes Pokémon rares créées (images CDN officiel PokéTCG)');
  console.log('📚 9 collections créées (3 par vendeur) avec cartes assignées');
  console.log('💬 Messagerie test: Conversation entre Sophie et Jean à propos du Charizard 1ère édition');
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
