import { CheckCircle, LocalShipping, Schedule, Cancel, Inventory } from '@mui/icons-material';
import { ReactElement } from 'react';

export type DeliveryStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'En attente',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédié',
  IN_TRANSIT: 'En transit',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé',
};

export function getDeliveryStatusIcon(status: DeliveryStatus): ReactElement {
  switch (status) {
    case 'DELIVERED':
      return <CheckCircle color="success" />;
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return <LocalShipping color="primary" />;
    case 'PREPARING':
      return <Inventory color="warning" />;
    case 'CANCELLED':
      return <Cancel color="error" />;
    default:
      return <Schedule color="disabled" />;
  }
}

export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  return DELIVERY_STATUS_LABELS[status] || status;
}

export function getDeliveryStatusColor(
  status: DeliveryStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return 'info';
    case 'PREPARING':
      return 'warning';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

