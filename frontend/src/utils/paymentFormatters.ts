/**
 * Utilitaires pour le formatage des données de paiement
 */

/**
 * Formate un numéro de carte bancaire avec des espaces tous les 4 chiffres
 * @param value - Numéro de carte brut
 * @returns Numéro de carte formaté (ex: "1234 5678 9012 3456")
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ').substring(0, 19);
}

/**
 * Formate une date d'expiration au format MM/AA
 * @param value - Date brute
 * @returns Date formatée (ex: "12/25")
 */
export function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
}

/**
 * Valide un numéro de carte bancaire
 * @param cardNumber - Numéro de carte (peut contenir des espaces)
 * @returns true si valide
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length >= 16 && /^\d+$/.test(cleaned);
}

/**
 * Valide une date d'expiration au format MM/AA
 * @param expiryDate - Date d'expiration
 * @returns true si valide
 */
export function isValidExpiryDate(expiryDate: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (month < 1 || month > 12) {
    return false;
  }

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Valide un code CVV
 * @param cvv - Code CVV
 * @returns true si valide (3 ou 4 chiffres)
 */
export function isValidCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

