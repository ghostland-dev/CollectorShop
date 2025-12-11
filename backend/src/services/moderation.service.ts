/**
 * Service de modération automatique des annonces
 * Version 1 - Règles basiques de détection
 */

interface ModerationResult {
  approved: boolean;
  reasons: string[];
  score: number; // Score de risque (0-100, plus élevé = plus risqué)
}

/**
 * Détecte les mots-clés suspects dans le texte
 */
function detectSuspiciousKeywords(text: string): string[] {
  const suspiciousKeywords = [
    'gratuit',
    'urgent',
    'vite',
    'rapide',
    'cliquez ici',
    'offre limitée',
    'ne manquez pas',
    'incroyable',
    'fabuleux',
    'miraculeux',
  ];

  const lowerText = text.toLowerCase();
  const found: string[] = [];

  suspiciousKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      found.push(keyword);
    }
  });

  return found;
}

/**
 * Détecte les prix suspects (trop bas ou trop élevé)
 */
function detectSuspiciousPrice(price: number, _category?: string | null): boolean {
  // Prix trop bas (< 1€) ou trop élevé (> 100000€)
  if (price < 1 || price > 100000) {
    return true;
  }

  // Prix rond suspect (ex: 1000, 5000, 10000) - pourrait être un placeholder
  if (price % 1000 === 0 && price >= 1000) {
    return true;
  }

  return false;
}

/**
 * Détecte les descriptions trop courtes ou trop longues
 */
function detectSuspiciousDescription(description: string): boolean {
  // Description trop courte (< 20 caractères) ou trop longue (> 10000 caractères)
  return description.length < 20 || description.length > 10000;
}

/**
 * Détecte les titres suspects
 */
function detectSuspiciousTitle(title: string): boolean {
  // Titre trop court (< 5 caractères) ou trop long (> 200 caractères)
  if (title.length < 5 || title.length > 200) {
    return true;
  }

  // Titre en majuscules (spam)
  if (title === title.toUpperCase() && title.length > 10) {
    return true;
  }

  // Trop de caractères spéciaux
  const specialCharCount = (title.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
  if (specialCharCount > title.length * 0.3) {
    return true;
  }

  return false;
}

/**
 * Détecte les doublons potentiels (basique - comparaison de titre)
 */
function detectPotentialDuplicates(title: string, existingTitles: string[]): boolean {
  const normalizedTitle = title.toLowerCase().trim();
  return existingTitles.some((existing) => {
    const normalizedExisting = existing.toLowerCase().trim();
    // Similarité basique (même titre à 80% près)
    return (
      normalizedTitle === normalizedExisting ||
      (normalizedTitle.length > 10 &&
        normalizedExisting.length > 10 &&
        (normalizedTitle.includes(normalizedExisting.substring(0, Math.floor(normalizedExisting.length * 0.8))) ||
          normalizedExisting.includes(normalizedTitle.substring(0, Math.floor(normalizedTitle.length * 0.8)))))
    );
  });
}

/**
 * Modère une annonce selon les règles définies
 */
export async function moderateAnnouncement(data: {
  title: string;
  description: string;
  price: number;
  category?: string | null;
  existingTitles?: string[];
}): Promise<ModerationResult> {
  const reasons: string[] = [];
  let score = 0;

  // Vérification du titre
  if (detectSuspiciousTitle(data.title)) {
    reasons.push('Titre suspect (trop court, trop long, ou format suspect)');
    score += 30;
  }

  // Vérification de la description
  if (detectSuspiciousDescription(data.description)) {
    reasons.push('Description suspecte (trop courte ou trop longue)');
    score += 25;
  }

  // Vérification des mots-clés suspects
  const suspiciousKeywords = detectSuspiciousKeywords(data.title + ' ' + data.description);
  if (suspiciousKeywords.length > 0) {
    reasons.push(`Mots-clés suspects détectés: ${suspiciousKeywords.join(', ')}`);
    score += suspiciousKeywords.length * 10;
  }

  // Vérification du prix
  if (detectSuspiciousPrice(data.price, data.category)) {
    reasons.push('Prix suspect (trop bas ou trop élevé)');
    score += 20;
  }

  // Vérification des doublons
  if (data.existingTitles && detectPotentialDuplicates(data.title, data.existingTitles)) {
    reasons.push('Annonce potentiellement dupliquée');
    score += 15;
  }

  // Seuil d'approbation : score < 50 = approuvé, score >= 50 = rejeté
  const approved = score < 50;

  return {
    approved,
    reasons,
    score,
  };
}

/**
 * Valide les images (vérification basique des URLs)
 */
export function validateImages(images: string[]): { valid: boolean; invalidUrls: string[] } {
  const invalidUrls: string[] = [];

  images.forEach((url) => {
    try {
      const urlObj = new URL(url);
      // Vérifier que c'est une URL HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        invalidUrls.push(url);
      }
    } catch {
      invalidUrls.push(url);
    }
  });

  return {
    valid: invalidUrls.length === 0,
    invalidUrls,
  };
}

