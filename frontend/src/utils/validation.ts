/**
 * Utilitaires de validation réutilisables
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Valide un formulaire de paiement
 */
export interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export function validatePaymentForm(formData: PaymentFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Validation du numéro de carte
  const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
  if (!cleanedCardNumber || cleanedCardNumber.length < 16) {
    errors.cardNumber = 'Numéro de carte invalide (16 chiffres requis)';
  }

  // Validation du titulaire
  if (!formData.cardHolder || formData.cardHolder.length < 3) {
    errors.cardHolder = 'Nom du titulaire requis (minimum 3 caractères)';
  }

  // Validation de la date d'expiration
  if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
    errors.expiryDate = 'Date d\'expiration invalide (MM/AA)';
  } else {
    const [month, year] = formData.expiryDate.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    if (month < 1 || month > 12 || year < currentYear) {
      errors.expiryDate = 'Date d\'expiration invalide';
    }
  }

  // Validation du CVV
  if (!formData.cvv || formData.cvv.length !== 3) {
    errors.cvv = 'CVV invalide (3 chiffres requis)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
