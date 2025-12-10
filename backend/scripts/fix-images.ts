import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Images Pexels valides pour remplacer les placeholders
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

async function fixImages() {
  console.log('🔧 Correction des images...');

  const announcements = await prisma.announcement.findMany();

  for (const announcement of announcements) {
    const hasPlaceholder = announcement.images.some((img) => 
      img && (img.includes('via.placeholder.com') || img.includes('placeholder') || img.includes('minio:9000'))
    );

    if (hasPlaceholder) {
      let newImages: string[] = [];
      
      // Sélectionner des images selon la catégorie
      if (announcement.category === 'Philatélie') {
        newImages = [pexelsImages.philatelie[0]];
      } else if (announcement.category === 'Numismatique') {
        newImages = [pexelsImages.numismatique[0]];
      } else if (announcement.category === 'Cartes') {
        newImages = [pexelsImages.cartes[0]];
      } else {
        // Par défaut, utiliser une image de cartes
        newImages = [pexelsImages.cartes[0]];
      }

      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { images: newImages },
      });

      console.log(`✅ Annonce ${announcement.id} corrigée: ${announcement.title}`);
    }
  }

  console.log('✨ Correction terminée!');
}

fixImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
