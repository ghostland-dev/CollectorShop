import { Typography, Box } from '@mui/material';
import { Purchase } from '../../services/purchase.service';

interface PurchaseCardHeaderProps {
  purchase: Purchase;
  isSeller: boolean;
}

export function PurchaseCardHeader({ purchase, isSeller }: PurchaseCardHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          {purchase.announcement?.title || 'Annonce supprimée'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isSeller
            ? `Acheteur: ${purchase.buyer?.firstName || ''} ${purchase.buyer?.lastName || ''} (${purchase.buyer?.email})`
            : `Vendeur: ${purchase.announcement?.seller?.firstName || ''} ${purchase.announcement?.seller?.lastName || ''} (${purchase.announcement?.seller?.email})`}
        </Typography>
      </Box>
      <Typography variant="h6" color="primary" fontWeight="bold">
        {purchase.amount.toFixed(2)} €
      </Typography>
    </Box>
  );
}

