import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Grid, Chip, IconButton, Divider, Stack,
} from '@mui/material';
import {
  ShoppingCart, Payment, Edit, Delete, ArrowBack,
  Store, Verified, LocalOffer,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService, Announcement } from '../services/announcement.service';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { ApiError } from '../services/api';

function AnnouncementImage({ announcement }: { announcement: Announcement }) {
  if (announcement.images.length > 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          background: '#0f172a',
          border: '1px solid rgba(248,250,252,0.08)',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src={announcement.images[0]}
          alt={announcement.title}
          sx={{
            maxWidth: '100%',
            maxHeight: 500,
            objectFit: 'contain',
            p: announcement.images[0].includes('pokemontcg') ? 3 : 0,
            display: 'block',
          }}
        />
        {announcement.status === 'SOLD' && (
          <Box
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                fontSize: '2.5rem', color: '#ef4444',
                border: '4px solid #ef4444', px: 3, py: 1, borderRadius: 2,
                transform: 'rotate(-15deg)', letterSpacing: '0.1em',
              }}
            >
              VENDU
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        height: 400, borderRadius: 3,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(248,250,252,0.08)',
      }}
    >
      <Typography color="text.secondary">Pas d'image</Typography>
    </Box>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.data?.error || error.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const { data: announcement, isLoading, error } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => announcementService.getById(id!),
    enabled: !!id,
  });

  const isOwner = announcement?.sellerId === user?.id;
  const canManage = isAdmin || isOwner;

  const deleteMutation = useMutation({
    mutationFn: () => announcementService.delete(id!),
    onSuccess: () => {
      showSuccess('Annonce supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['myAnnouncements'] });
      navigate('/catalog');
    },
    onError: (error: unknown) => {
      showError(getErrorMessage(error) || 'Erreur lors de la suppression');
    },
  });

  const handleAddToCart = () => {
    if (!announcement) return;
    addItem({
      announcementId: announcement.id,
      title: announcement.title,
      price: announcement.price,
      image: announcement.images[0],
      sellerName: announcement.seller
        ? `${announcement.seller.firstName} ${announcement.seller.lastName}`
        : undefined,
    });
    showSuccess('Article ajouté au panier !');
  };

  // "Acheter maintenant" = add to cart + navigate to checkout (consistent flow)
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      showError('Connectez-vous pour effectuer un achat');
      navigate('/login');
      return;
    }
    if (!announcement) return;
    addItem({
      announcementId: announcement.id,
      title: announcement.title,
      price: announcement.price,
      image: announcement.images[0],
      sellerName: announcement.seller
        ? `${announcement.seller.firstName} ${announcement.seller.lastName}`
        : undefined,
    });
    navigate('/checkout', {
      state: {
        items: [{
          announcementId: announcement.id,
          title: announcement.title,
          price: announcement.price,
          image: announcement.images[0],
        }],
        total: announcement.price,
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      deleteMutation.mutate();
    }
  };

  const canPurchase =
    isAuthenticated &&
    announcement?.status === 'PUBLISHED' &&
    !isOwner;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !announcement) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Annonce introuvable ou inaccessible
      </Alert>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto">
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Retour
        </Button>
        {canManage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color="primary"
              onClick={() => navigate(`/announcements/${id}/edit`)}
              disabled={announcement.status === 'SOLD' && !isAdmin}
              title="Modifier"
              sx={{ border: '1px solid rgba(245,158,11,0.3)', '&:hover': { bgcolor: 'rgba(245,158,11,0.08)' } }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              title="Supprimer"
              sx={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} md={6}>
          <AnnouncementImage announcement={announcement} />
        </Grid>

        {/* Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Category + status */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              {announcement.category && (
                <Chip
                  label={announcement.category}
                  size="small"
                  icon={<LocalOffer sx={{ fontSize: '0.75rem !important', color: '#f59e0b !important' }} />}
                  sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                />
              )}
              {announcement.status === 'PUBLISHED' && (
                <Chip
                  label="Disponible"
                  size="small"
                  icon={<Verified sx={{ fontSize: '0.75rem !important', color: '#10b981 !important' }} />}
                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                />
              )}
            </Stack>

            {/* Title */}
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              sx={{ mb: 1, fontFamily: 'Rajdhani, sans-serif', lineHeight: 1.2 }}
            >
              {announcement.title}
            </Typography>

            {/* Price */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                color: announcement.status === 'SOLD' ? '#64748b' : '#f59e0b',
                mb: 3, lineHeight: 1,
              }}
            >
              {announcement.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {announcement.description}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Seller info */}
            {announcement.seller && (
              <Box
                sx={{
                  p: 2.5, borderRadius: 2, mb: 3,
                  bgcolor: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Store sx={{ color: '#f59e0b', fontSize: '1.1rem' }} />
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {announcement.seller.shop?.name || `${announcement.seller.firstName} ${announcement.seller.lastName}`}
                  </Typography>
                </Box>
                {announcement.seller.shop?.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {announcement.seller.shop.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Vendeur : {announcement.seller.firstName} {announcement.seller.lastName}
                </Typography>
              </Box>
            )}

            {/* Purchase buttons */}
            {canPurchase && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  Ajouter au panier
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleBuyNow}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  Acheter maintenant
                </Button>
              </Stack>
            )}

            {/* Alerts */}
            {announcement.status === 'SOLD' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Cet article a déjà été vendu
              </Alert>
            )}
            {!isAuthenticated && (
              <Alert
                severity="info"
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                    Connexion
                  </Button>
                }
              >
                Connectez-vous pour acheter cette carte
              </Alert>
            )}
            {isOwner && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Vous êtes le vendeur de cette annonce
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
