import { useNavigate } from 'react-router-dom';
import { CardActions, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Purchase } from '../../services/purchase.service';

interface PurchaseCardActionsProps {
  purchase: Purchase;
  isSeller: boolean;
  onUpdateStatus?: (purchase: Purchase) => void;
}

export function PurchaseCardActions({ purchase, isSeller, onUpdateStatus }: PurchaseCardActionsProps) {
  const navigate = useNavigate();

  const canUpdateDelivery = isSeller &&
    purchase.status === 'COMPLETED' &&
    purchase.deliveryStatus !== 'DELIVERED' &&
    purchase.deliveryStatus !== 'CANCELLED' &&
    onUpdateStatus;

  return (
    <CardActions>
      <Button
        size="small"
        onClick={() => navigate(`/announcements/${purchase.announcementId}`)}
      >
        Voir l'annonce
      </Button>
      {canUpdateDelivery && (
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => onUpdateStatus(purchase)}
        >
          Mettre à jour la livraison
        </Button>
      )}
    </CardActions>
  );
}
