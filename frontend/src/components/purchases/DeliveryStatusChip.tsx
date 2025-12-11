import { Chip } from '@mui/material';
import { getDeliveryStatusIcon, getDeliveryStatusLabel, getDeliveryStatusColor, DeliveryStatus } from '../../utils/deliveryStatus';

interface DeliveryStatusChipProps {
  status: DeliveryStatus;
  showLabel?: boolean;
}

export function DeliveryStatusChip({ status, showLabel = true }: DeliveryStatusChipProps) {
  return (
    <Chip
      icon={getDeliveryStatusIcon(status)}
      label={showLabel ? `Livraison: ${getDeliveryStatusLabel(status)}` : getDeliveryStatusLabel(status)}
      color={getDeliveryStatusColor(status)}
      size="small"
    />
  );
}

