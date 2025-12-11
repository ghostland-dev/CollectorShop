import { Typography, Box } from '@mui/material';
import { Purchase } from '../../services/purchase.service';

interface PurchaseCardDatesProps {
  purchase: Purchase;
}

export function PurchaseCardDates({ purchase }: PurchaseCardDatesProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', fontSize: '0.875rem', color: 'text.secondary' }}>
      <Typography variant="body2">
        Commandé le: {new Date(purchase.createdAt).toLocaleDateString('fr-FR')}
      </Typography>
      {purchase.shippedAt && (
        <Typography variant="body2">
          Expédié le: {new Date(purchase.shippedAt).toLocaleDateString('fr-FR')}
        </Typography>
      )}
      {purchase.deliveredAt && (
        <Typography variant="body2" color="success.main">
          Livré le: {new Date(purchase.deliveredAt).toLocaleDateString('fr-FR')}
        </Typography>
      )}
    </Box>
  );
}

