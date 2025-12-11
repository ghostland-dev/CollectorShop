import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Box,
} from '@mui/material';
import { Purchase } from '../../services/purchase.service';
import { DeliveryStatusChip } from './DeliveryStatusChip';
import { PurchaseStatusChip } from './PurchaseStatusChip';
import { PurchaseCardHeader } from './PurchaseCardHeader';
import { PurchaseCardDates } from './PurchaseCardDates';
import { PurchaseCardActions } from './PurchaseCardActions';

interface PurchaseCardProps {
  purchase: Purchase;
  isSeller: boolean;
  onUpdateStatus?: (purchase: Purchase) => void;
}

export function PurchaseCard({ purchase, isSeller, onUpdateStatus }: PurchaseCardProps) {
  const hasImages = purchase.announcement?.images && purchase.announcement.images.length > 0;
  const gridSize = hasImages ? 9 : 12;
  const announcement = purchase.announcement;

  return (
    <Card sx={{ mb: 2 }}>
      <Grid container>
        {hasImages && announcement && (
          <Grid item xs={12} sm={3}>
            <CardMedia
              component="img"
              height="200"
              image={announcement.images[0]}
              alt={announcement.title}
              sx={{ objectFit: 'cover' }}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={gridSize}>
          <CardContent>
            <PurchaseCardHeader purchase={purchase} isSeller={isSeller} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <PurchaseStatusChip status={purchase.status as 'PENDING' | 'COMPLETED' | 'CANCELLED'} />
              <DeliveryStatusChip status={purchase.deliveryStatus} />
              {purchase.trackingNumber && (
                <Chip
                  label={`Suivi: ${purchase.trackingNumber}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <PurchaseCardDates purchase={purchase} />
          </CardContent>
          <PurchaseCardActions
            purchase={purchase}
            isSeller={isSeller}
            onUpdateStatus={onUpdateStatus}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

