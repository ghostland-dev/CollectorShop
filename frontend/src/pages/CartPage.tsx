import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Grid, Card,
  IconButton, Divider, Alert, Chip, Stack,
} from '@mui/material';
import { Delete, ShoppingCart, Payment, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

function EmptyCart({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <Typography sx={{ fontSize: '4rem', mb: 2 }}>🛒</Typography>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Votre panier est vide
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Ajoutez des cartes Pokémon rares depuis le catalogue
      </Typography>
      <Button variant="contained" size="large" onClick={onNavigate} endIcon={<ArrowForward />}>
        Explorer le catalogue
      </Button>
    </Box>
  );
}

function CartItem({ item, onRemove }: {
  item: { announcementId: string; title: string; price: number; image?: string; sellerName?: string };
  onRemove: () => void;
}) {
  return (
    <Card sx={{ mb: 2, overflow: 'visible' }}>
      <Box sx={{ display: 'flex', gap: 0, overflow: 'hidden', borderRadius: '10px' }}>
        {item.image ? (
          <Box
            component="img"
            src={item.image}
            alt={item.title}
            sx={{
              width: 100,
              height: 130,
              objectFit: 'contain',
              bgcolor: '#0f172a',
              p: item.image.includes('pokemontcg') ? 1 : 0,
              flexShrink: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 100, height: 130,
              bgcolor: 'rgba(15,23,42,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShoppingCart sx={{ color: '#334155' }} />
          </Box>
        )}
        <Box sx={{ flex: 1, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 0.5 }}>
              {item.title}
            </Typography>
            {item.sellerName && (
              <Typography variant="caption" color="text.secondary">
                🏪 {item.sellerName}
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{ mt: 1, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#f59e0b' }}
            >
              {item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </Typography>
          </Box>
          <IconButton
            onClick={onRemove}
            size="small"
            sx={{
              color: '#64748b', border: '1px solid rgba(248,250,252,0.08)',
              '&:hover': { color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', bgcolor: 'rgba(239,68,68,0.08)' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}

function CartSummary({ items, isAuthenticated, onBuyAll, onLogin }: {
  items: Array<{ announcementId: string; price: number; title: string; image?: string }>;
  isAuthenticated: boolean;
  onBuyAll: () => void;
  onLogin: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, position: 'sticky', top: 80,
        border: '1px solid rgba(245,158,11,0.15)',
        background: 'rgba(245,158,11,0.03)',
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 2 }}>
        Récapitulatif
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1} sx={{ mb: 2 }}>
        {items.map((item) => (
          <Box key={item.announcementId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ pr: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </Typography>
            <Typography variant="caption" fontWeight={600} color="primary.main" sx={{ flexShrink: 0 }}>
              {item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Total ({items.length} carte{items.length > 1 ? 's' : ''})
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#f59e0b' }}
        >
          {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </Typography>
      </Box>

      {isAuthenticated ? (
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<Payment />}
          onClick={onBuyAll}
          sx={{ py: 1.5 }}
        >
          Procéder au paiement
        </Button>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
            Connectez-vous pour finaliser votre achat
          </Alert>
          <Button variant="contained" fullWidth size="large" onClick={onLogin} sx={{ py: 1.5 }}>
            Se connecter pour payer
          </Button>
        </>
      )}
    </Paper>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, clearCart } = useCartStore();

  const handleBuyAll = () => {
    navigate('/checkout', {
      state: {
        items: items.map((item) => ({
          announcementId: item.announcementId,
          title: item.title,
          price: item.price,
          image: item.image,
        })),
        total: items.reduce((sum, item) => sum + item.price, 0),
      },
    });
  };

  if (items.length === 0) {
    return <EmptyCart onNavigate={() => navigate('/catalog')} />;
  }

  return (
    <Box maxWidth="lg" mx="auto">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/catalog')}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            Continuer les achats
          </Button>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={clearCart}
          sx={{
            color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)',
            '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
          }}
        >
          Vider le panier
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Mon Panier
        </Typography>
        <Chip
          label={`${items.length} carte${items.length > 1 ? 's' : ''}`}
          size="small"
          sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 700 }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <CartItem
              key={item.announcementId}
              item={item}
              onRemove={() => removeItem(item.announcementId)}
            />
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <CartSummary
            items={items}
            isAuthenticated={isAuthenticated}
            onBuyAll={handleBuyAll}
            onLogin={() => navigate('/login')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
