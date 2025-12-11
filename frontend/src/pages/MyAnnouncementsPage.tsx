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
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '../services/announcement.service';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthStore } from '../stores/authStore';

export function MyAnnouncementsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['myAnnouncements'],
    queryFn: announcementService.getMyAnnouncements,
  });

  const deleteMutation = useMutation({
    mutationFn: announcementService.delete,
    onSuccess: () => {
      showSuccess('Annonce supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['myAnnouncements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      showError(message);
    },
  });

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Erreur lors du chargement de vos annonces
        </Alert>
      </Container>
    );
  }

  const announcements = data?.announcements || [];

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isAdmin ? 'Toutes les annonces' : 'Mes annonces'} ({announcements.length})
          </Typography>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/announcements/create')}
            >
              Créer une annonce
            </Button>
          )}
        </Box>

        {announcements.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {isAdmin ? 'Aucune annonce dans le système' : 'Vous n\'avez pas encore créé d\'annonce'}
            </Typography>
            {!isAdmin && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/announcements/create')}
                sx={{ mt: 2 }}
              >
                Créer votre première annonce
              </Button>
            )}
          </Box>
        ) : (
          <AnnouncementsGrid announcements={announcements} isAdmin={isAdmin} navigate={navigate} onDeleteClick={handleDeleteClick} deleteMutation={deleteMutation} />
        )}
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer l'annonce</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Helper component for single announcement card in grid
function AnnouncementGridCard({ announcement, isAdmin, navigate, onDeleteClick, deleteMutation }: {
  announcement: { id: string; images?: string[]; title: string; description: string; price: number; status: string; category?: string; seller?: { firstName?: string; lastName?: string; email: string } };
  isAdmin: boolean;
  navigate: (path: string) => void;
  onDeleteClick: (id: string) => void;
  deleteMutation: { isPending: boolean };
}) {
  const getStatusColor = (status: string) => {
    if (status === 'PUBLISHED') return 'success';
    if (status === 'SOLD') return 'default';
    return 'warning';
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={announcement.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {announcement.images && announcement.images.length > 0 ? (
          <CardMedia
            component="img"
            height="200"
            image={announcement.images[0]}
            alt={announcement.title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">Pas d'image</Typography>
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom noWrap>
            {announcement.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
            {announcement.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" color="primary">
              {announcement.price.toFixed(2)} €
            </Typography>
            <Chip
              label={announcement.status}
              size="small"
              color={getStatusColor(announcement.status)}
            />
          </Box>
          {announcement.category && (
            <Chip label={announcement.category} size="small" sx={{ mt: 1 }} />
          )}
          {isAdmin && announcement.seller && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Vendeur: {announcement.seller.firstName || ''} {announcement.seller.lastName || ''} ({announcement.seller.email})
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => navigate(`/announcements/${announcement.id}`)}
          >
            Voir
          </Button>
          <Box>
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
              disabled={announcement.status === 'SOLD' && !isAdmin}
              title={isAdmin ? 'Modifier (Admin)' : 'Modifier'}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteClick(announcement.id)}
              disabled={deleteMutation.isPending}
              title={isAdmin ? 'Supprimer (Admin)' : 'Supprimer'}
            >
              <Delete />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    </Grid>
  );
}

// Helper component for announcements grid
function AnnouncementsGrid({ announcements, isAdmin, navigate, onDeleteClick, deleteMutation }: {
  announcements: Array<{ id: string; images?: string[]; title: string; description: string; price: number; status: string; category?: string; seller?: { firstName?: string; lastName?: string; email: string } }>;
  isAdmin: boolean;
  navigate: (path: string) => void;
  onDeleteClick: (id: string) => void;
  deleteMutation: { isPending: boolean };
}) {
  return (
    <Grid container spacing={3}>
      {announcements.map((announcement) => (
        <AnnouncementGridCard
          key={announcement.id}
          announcement={announcement}
          isAdmin={isAdmin}
          navigate={navigate}
          onDeleteClick={onDeleteClick}
          deleteMutation={deleteMutation}
        />
      ))}
    </Grid>
  );
}

