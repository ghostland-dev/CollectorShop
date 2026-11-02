import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, LinearProgress } from '@mui/material';
import { CheckCircle, ShoppingBag, Home, Receipt } from '@mui/icons-material';
import { useCartStore } from '../stores/cartStore';

const REDIRECT_DELAY = 10;

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  useEffect(() => {
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/catalog');
      return;
    }
    const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown, navigate]);

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh',
      }}
      role="alert"
      aria-live="polite"
    >
      <Box
        sx={{
          maxWidth: 520, width: '100%', textAlign: 'center',
          p: { xs: 4, md: 6 },
          bgcolor: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 4,
        }}
      >
        {/* Success icon */}
        <Box
          sx={{
            width: 96, height: 96, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
            border: '2px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckCircle sx={{ fontSize: 52, color: '#10b981' }} />
        </Box>

        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 1, color: '#10b981' }}
        >
          Paiement réussi !
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Votre commande a été traitée avec succès.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, opacity: 0.7 }}>
          Vous recevrez une confirmation sous peu.
        </Typography>

        {/* Countdown */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Redirection automatique dans {countdown}s…
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(1 - countdown / REDIRECT_DELAY) * 100}
            sx={{
              height: 4, borderRadius: 2,
              bgcolor: 'rgba(16,185,129,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 },
            }}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<Receipt />}
            onClick={() => navigate('/my-purchases')}
            sx={{ py: 1.5, px: 3 }}
          >
            Mes achats
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/catalog')}
            sx={{ py: 1.5, px: 3 }}
          >
            Continuer
          </Button>
          <Button
            variant="text"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ py: 1.5, color: 'text.secondary' }}
          >
            Accueil
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
