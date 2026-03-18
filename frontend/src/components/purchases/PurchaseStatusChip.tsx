import { Chip } from '@mui/material';
import { getPurchaseStatusLabel, getPurchaseStatusColor, PurchaseStatus } from '../../utils/purchaseStatus';

interface PurchaseStatusChipProps {
  status: PurchaseStatus;
  showLabel?: boolean;
}

export function PurchaseStatusChip({ status, showLabel = true }: PurchaseStatusChipProps) {
  return (
    <Chip
      label={showLabel ? `Statut: ${getPurchaseStatusLabel(status)}` : getPurchaseStatusLabel(status)}
      color={getPurchaseStatusColor(status)}
      size="small"
    />
  );
}
