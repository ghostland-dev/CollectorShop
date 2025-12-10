import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Container,
  IconButton,
} from '@mui/material';
import { ShoppingCart, Payment, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '../services/announcement.service';
import { purchaseService } from '../services/purchase.service';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';

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

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseService.create({ announcementId: id! }),
    onSuccess: () => {
      showSuccess('Achat créé avec succès !');
      navigate('/purchases');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'achat';
      showError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => announcementService.delete(id!),
    onSuccess: () => {
      showSuccess('Annonce supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['myAnnouncements'] });
      navigate('/catalog');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression';
      showError(message);
    },
  });

  const handleAddToCart = () => {
    if (!announcement) return;
    addItem({
      announcementId: announcement.id,
      title: announcement.title,
      price: announcement.price,
      image: announcement.images[0],
      sellerName: announcement.seller ? `${announcement.seller.firstName} ${announcement.seller.lastName}` : undefined,
    });
    showSuccess('Article ajouté au panier !');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated || user?.role !== 'BUYER') {
      showError('Vous devez être connecté en tant qu\'acheteur pour effectuer un achat');
      navigate('/login');
      return;
    }
    purchaseMutation.mutate();
  };

  const canPurchase = isAuthenticated && user?.role === 'BUYER' && announcement?.status === 'PUBLISHED';
  const canManage = isAdmin || isOwner;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !announcement) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Annonce introuvable
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button onClick={() => navigate(-1)}>
            ← Retour
          </Button>
          {canManage && (
            <Box>
              <IconButton
                color="primary"
                onClick={() => navigate(`/announcements/${id}/edit`)}
                disabled={announcement.status === 'SOLD' && !isAdmin}
                title={isAdmin ? 'Modifier (Admin)' : 'Modifier'}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                title={isAdmin ? 'Supprimer (Admin)' : 'Supprimer'}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {announcement.images.length > 0 ? (
              <Box
                component="img"
                src={announcement.images[0]}
                alt={announcement.title}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">Pas d'image</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {announcement.title}
            </Typography>
            {announcement.category && (
              <Chip label={announcement.category} sx={{ mb: 2 }} />
            )}
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              {announcement.price.toFixed(2)} €
            </Typography>
            <Typography variant="body1" paragraph>
              {announcement.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Statut: {announcement.status}
            </Typography>
            {announcement.seller && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vendeur: {announcement.seller.firstName} {announcement.seller.lastName} (
                {announcement.seller.email})
              </Typography>
            )}
            {canPurchase && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  sx={{ flex: 1 }}
                >
                  Ajouter au panier
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleBuyNow}
                  disabled={purchaseMutation.isPending}
                  sx={{ flex: 1 }}
                >
                  {purchaseMutation.isPending ? 'Traitement...' : 'Acheter maintenant'}
                </Button>
              </Box>
            )}
            {announcement.status === 'SOLD' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Cet article a déjà été vendu
              </Alert>
            )}
            {!isAuthenticated && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Connectez-vous pour ajouter cet article au panier ou l'acheter
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
