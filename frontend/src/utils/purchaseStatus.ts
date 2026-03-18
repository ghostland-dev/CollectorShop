/**
 * Utilitaires pour les statuts d'achat
 */

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Complété',
  CANCELLED: 'Annulé',
};

export function getPurchaseStatusLabel(status: PurchaseStatus): string {
  return PURCHASE_STATUS_LABELS[status] || status;
}

export function getPurchaseStatusColor(
  status: PurchaseStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}
