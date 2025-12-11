import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { Purchase } from '../../services/purchase.service';
import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '../../utils/deliveryStatus';

interface DeliveryStatusDialogProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onSubmit: (data: { deliveryStatus: string; trackingNumber?: string }) => void;
  isSubmitting?: boolean;
}

export function DeliveryStatusDialog({
  open,
  purchase,
  onClose,
  onSubmit,
  isSubmitting = false,
}: DeliveryStatusDialogProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('PENDING');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (purchase) {
      setDeliveryStatus(purchase.deliveryStatus);
      setTrackingNumber(purchase.trackingNumber || '');
    }
  }, [purchase]);

  const handleSubmit = () => {
    onSubmit({
      deliveryStatus,
      trackingNumber: trackingNumber || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mettre à jour le statut de livraison</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Statut de livraison"
          value={deliveryStatus}
          onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
          sx={{ mt: 2 }}
        >
          {Object.entries(DELIVERY_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Numéro de suivi (optionnel)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          sx={{ mt: 2 }}
          placeholder="Ex: TRACK123456789"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

