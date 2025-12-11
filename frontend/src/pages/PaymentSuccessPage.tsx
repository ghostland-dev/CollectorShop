import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Alert,
} from '@mui/material';
import { CheckCircle, ShoppingBag, Home } from '@mui/icons-material';
export function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger après 10 secondes si l'utilisateur ne fait rien
    const timer = setTimeout(() => {
      navigate('/catalog');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }} role="alert" aria-live="polite">
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} aria-hidden="true" />
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" id="success-title">
          Paiement réussi !
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }} aria-describedby="success-title">
          Votre commande a été traitée avec succès
        </Typography>

        <Alert severity="success" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body1" gutterBottom>
            <strong>Merci pour votre achat !</strong>
          </Typography>
          <Typography variant="body2">
            Vous recevrez un email de confirmation sous peu. Votre commande est en cours de traitement.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/catalog')}
            aria-label="Continuer vos achats"
          >
            Continuer vos achats
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            aria-label="Retour à l'accueil"
          >
            Retour à l'accueil
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          Vous serez redirigé automatiquement dans quelques secondes...
        </Typography>
      </Paper>
    </Container>
  );
}

