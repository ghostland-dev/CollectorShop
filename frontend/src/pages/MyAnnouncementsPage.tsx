import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
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
      <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 2 }}>
        <Typography color="error.main">Erreur lors du chargement de vos annonces</Typography>
      </Box>
    );
  }

  const announcements = data?.announcements || [];

  return (
    <Box maxWidth="lg" mx="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Mes annonces
            </Typography>
            <Chip
              label={`${announcements.length} carte${announcements.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Gérez vos cartes Pokémon en vente
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/announcements/create')}
          size="large"
        >
          Nouvelle annonce
        </Button>
      </Box>

      {announcements.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'rgba(248,250,252,0.02)', border: '1px dashed rgba(248,250,252,0.1)', borderRadius: 3 }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🃏</Typography>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Aucune annonce pour l'instant
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Mettez vos cartes Pokémon rares en vente dès maintenant
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/announcements/create')}>
            Créer ma première annonce
          </Button>
        </Box>
      ) : (
        <AnnouncementsGrid
          announcements={announcements}
          isAdmin={isAdmin}
          navigate={navigate}
          onDeleteClick={handleDeleteClick}
          deleteMutation={deleteMutation}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { background: '#1e293b', border: '1px solid rgba(248,250,252,0.08)' },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
          Supprimer l'annonce
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Annuler</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
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
  const statusConfig: Record<string, { label: string; color: string }> = {
    PUBLISHED: { label: 'En vente', color: '#10b981' },
    SOLD: { label: 'Vendu', color: '#64748b' },
    DRAFT: { label: 'Brouillon', color: '#f59e0b' },
  };
  const status = statusConfig[announcement.status] || statusConfig.DRAFT;

  return (
    <Grid item xs={12} sm={6} md={4} key={announcement.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#0f172a', borderRadius: '10px 10px 0 0' }}>
          {announcement.images && announcement.images.length > 0 ? (
            <Box
              component="img"
              src={announcement.images[0]}
              alt={announcement.title}
              sx={{
                width: '100%', height: 200, objectFit: 'contain', display: 'block',
                p: announcement.images[0].includes('pokemontcg') ? 1 : 0,
              }}
            />
          ) : (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '3rem' }}>🃏</Typography>
            </Box>
          )}
          <Chip
            label={status.label}
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: `${status.color}20`, color: status.color,
              border: `1px solid ${status.color}40`, fontWeight: 700, fontSize: '0.7rem',
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="subtitle1" component="h2" fontWeight={700} noWrap sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 0.5 }}>
            {announcement.title}
          </Typography>
          {announcement.category && (
            <Chip
              label={announcement.category}
              size="small"
              sx={{ mb: 1, bgcolor: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.68rem', height: 20 }}
            />
          )}
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#f59e0b' }}
          >
            {announcement.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </Typography>
          {isAdmin && announcement.seller && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {announcement.seller.firstName} {announcement.seller.lastName}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => navigate(`/announcements/${announcement.id}`)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            Voir
          </Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
              disabled={announcement.status === 'SOLD' && !isAdmin}
              sx={{ border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', '&:hover': { bgcolor: 'rgba(245,158,11,0.08)' } }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDeleteClick(announcement.id)}
              disabled={deleteMutation.isPending}
              sx={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
            >
              <Delete fontSize="small" />
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
