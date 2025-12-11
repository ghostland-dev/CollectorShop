import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Purchase } from '../../services/purchase.service';
import { DeliveryStatusChip } from './DeliveryStatusChip';
import { PurchaseStatusChip } from './PurchaseStatusChip';

interface PurchaseCardProps {
  purchase: Purchase;
  isSeller: boolean;
  onUpdateStatus?: (purchase: Purchase) => void;
}

export function PurchaseCard({ purchase, isSeller, onUpdateStatus }: PurchaseCardProps) {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 2 }}>
      <Grid container>
        {purchase.announcement?.images && purchase.announcement.images.length > 0 && (
          <Grid item xs={12} sm={3}>
            <CardMedia
              component="img"
              height="200"
              image={purchase.announcement.images[0]}
              alt={purchase.announcement.title}
              sx={{ objectFit: 'cover' }}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={purchase.announcement?.images && purchase.announcement.images.length > 0 ? 9 : 12}>
          <CardContent>
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
          </CardContent>
          <CardActions>
            <Button
              size="small"
              onClick={() => navigate(`/announcements/${purchase.announcementId}`)}
            >
              Voir l'annonce
            </Button>
            {isSeller &&
              purchase.status === 'COMPLETED' &&
              purchase.deliveryStatus !== 'DELIVERED' &&
              purchase.deliveryStatus !== 'CANCELLED' &&
              onUpdateStatus && (
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => onUpdateStatus(purchase)}
                >
                  Mettre à jour la livraison
                </Button>
              )}
          </CardActions>
        </Grid>
      </Grid>
    </Card>
  );
}

