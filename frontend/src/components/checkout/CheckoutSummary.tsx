import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Payment } from '@mui/icons-material';

interface CheckoutSummaryProps {
  items: Array<{
    title: string;
    price: number;
  }>;
  total: number;
  isProcessing: boolean;
  onSubmit: () => void;
}

export function CheckoutSummary({ items, total, isProcessing, onSubmit }: CheckoutSummaryProps) {
  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 20 }} role="complementary" aria-label="Récapitulatif de commande">
      <Typography variant="h6" gutterBottom>
        Récapitulatif
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {item.price.toFixed(2)} €
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {total.toFixed(2)} €
        </Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        startIcon={isProcessing ? <CircularProgress size={20} /> : <Payment />}
        onClick={onSubmit}
        disabled={isProcessing}
        aria-label="Confirmer le paiement"
      >
        {isProcessing ? 'Traitement...' : `Payer ${total.toFixed(2)} €`}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
        En cliquant sur "Payer", vous acceptez nos conditions générales de vente
      </Typography>
    </Paper>
  );
}

