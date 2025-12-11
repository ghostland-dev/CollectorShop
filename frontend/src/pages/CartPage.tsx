import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete, ShoppingCart, Payment } from '@mui/icons-material';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { purchaseService } from '../services/purchase.service';
import { useNotifications } from '../hooks/useNotifications';

// Helper component for empty cart
function EmptyCart({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 6, mt: 4, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Votre panier est vide
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ajoutez des articles depuis le catalogue pour les voir apparaître ici
        </Typography>
        <Button variant="contained" onClick={onNavigate}>
          Parcourir le catalogue
        </Button>
      </Paper>
    </Container>
  );
}

// Helper component for cart item
function CartItem({ item, isProcessing, isAuthenticated, onBuy, onRemove }: {
  item: { announcementId: string; title: string; price: number; image?: string; sellerName?: string };
  isProcessing: boolean;
  isAuthenticated: boolean;
  onBuy: () => void;
  onRemove: () => void;
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex' }}>
        {item.image ? (
          <CardMedia
            component="img"
            sx={{ width: 150, height: 150, objectFit: 'cover' }}
            image={item.image}
            alt={item.title}
          />
        ) : (
          <Box
            sx={{
              width: 150,
              height: 150,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart />
          </Box>
        )}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {item.title}
            </Typography>
            {item.sellerName && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Vendeur: {item.sellerName}
              </Typography>
            )}
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              {item.price.toFixed(2)} €
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={isProcessing ? <CircularProgress size={16} /> : <Payment />}
              onClick={onBuy}
              disabled={isProcessing || !isAuthenticated}
            >
              Acheter
            </Button>
            <IconButton
              color="error"
              onClick={onRemove}
              disabled={isProcessing}
            >
              <Delete />
            </IconButton>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}

// Helper component for cart summary
function CartSummary({ items, isAuthenticated, processingCount, onBuyAll, onLogin }: {
  items: Array<{ announcementId: string; price: number }>;
  isAuthenticated: boolean;
  processingCount: number;
  onBuyAll: () => void;
  onLogin: () => void;
}) {
  const getTotal = () => items.reduce((sum, item) => sum + item.price, 0);
  const total = getTotal();

  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom>
        Récapitulatif
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body1">Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</Typography>
        <Typography variant="body1" fontWeight="bold">
          {total.toFixed(2)} €
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {total.toFixed(2)} €
        </Typography>
      </Box>
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<Payment />}
        onClick={onBuyAll}
        disabled={!isAuthenticated || processingCount > 0}
        aria-label={`Acheter ${items.length} article${items.length > 1 ? 's' : ''}`}
      >
        Acheter tout ({items.length})
      </Button>
      {!isAuthenticated && (
        <Button
          variant="outlined"
          fullWidth
          size="medium"
          sx={{ mt: 2 }}
          onClick={onLogin}
        >
          Se connecter
        </Button>
      )}
    </Paper>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, removeItem, clearCart } = useCartStore();
  const { showSuccess, showError } = useNotifications();
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  const purchaseMutation = useMutation({
    mutationFn: (announcementId: string) => purchaseService.create({ announcementId }),
    onSuccess: (_, announcementId) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(announcementId);
        return next;
      });
      showSuccess('Achat créé avec succès !');
    },
    onError: (error: unknown, announcementId) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(announcementId);
        return next;
      });
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'achat';
      showError(message);
    },
  });

  const handleBuyItem = (announcementId: string) => {
    if (!isAuthenticated || (user?.role !== 'BUYER' && user?.role !== 'SELLER' && user?.role !== 'ADMIN')) {
      showError('Vous devez être connecté pour effectuer un achat');
      navigate('/login');
      return;
    }
    setProcessingItems((prev) => new Set(prev).add(announcementId));
    purchaseMutation.mutate(announcementId);
  };

  const handleBuyAll = () => {
    if (!isAuthenticated || (user?.role !== 'BUYER' && user?.role !== 'SELLER' && user?.role !== 'ADMIN')) {
      showError('Vous devez être connecté pour effectuer un achat');
      navigate('/login');
      return;
    }
    // Rediriger vers la page de checkout
    navigate('/checkout', {
      state: {
        items: items.map((item) => ({
          announcementId: item.announcementId,
          title: item.title,
          price: item.price,
        })),
        total: items.reduce((sum, item) => sum + item.price, 0),
      },
    });
  };

  if (items.length === 0) {
    return <EmptyCart onNavigate={() => navigate('/catalog')} />;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mon panier ({items.length})
          </Typography>
          <Button variant="outlined" color="error" onClick={clearCart} size="small">
            Vider le panier
          </Button>
        </Box>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Connectez-vous pour procéder à l'achat
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <CartItem
                key={item.announcementId}
                item={item}
                isProcessing={processingItems.has(item.announcementId)}
                isAuthenticated={isAuthenticated}
                onBuy={() => handleBuyItem(item.announcementId)}
                onRemove={() => removeItem(item.announcementId)}
              />
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <CartSummary
              items={items}
              isAuthenticated={isAuthenticated}
              processingCount={processingItems.size}
              onBuyAll={handleBuyAll}
              onLogin={() => navigate('/login')}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
