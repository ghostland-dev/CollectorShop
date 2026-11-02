import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  InputAdornment,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Title, Description, Euro, Category, Save } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { announcementService, createAnnouncementSchema } from '../services/announcement.service';
import { useNotifications } from '../hooks/useNotifications';
import { ImageUpload } from '../components/ImageUpload';

export function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: announcement, isLoading, error } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => announcementService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        description: announcement.description,
        price: announcement.price.toString(),
        category: announcement.category || '',
        images: announcement.images || [],
      });
    }
  }, [announcement]);

  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => announcementService.update(id!, data),
    onSuccess: () => {
      showSuccess('Annonce modifiée avec succès !');
      navigate('/my-announcements');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la modification';
      showError(message);
      setErrors({ general: message });
    },
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      images: formData.images,
    };

    const validation = createAnnouncementSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    updateMutation.mutate(validation.data);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !announcement) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Annonce introuvable ou erreur lors du chargement
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Modifier l'annonce
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modifiez les informations de votre annonce
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Titre"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title || 'Donnez un titre accrocheur à votre annonce'}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Title />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            error={!!errors.description}
            helperText={errors.description || 'Décrivez votre objet en détail'}
            margin="normal"
            multiline
            rows={4}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <Description />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Prix"
            type="number"
            value={formData.price}
            onChange={handleChange('price')}
            error={!!errors.price}
            helperText={errors.price}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            select
            label="Catégorie"
            value={formData.category}
            onChange={handleChange('category')}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Aucune</MenuItem>
            <MenuItem value="Philatélie">Philatélie</MenuItem>
            <MenuItem value="Numismatique">Numismatique</MenuItem>
            <MenuItem value="Cartes">Cartes</MenuItem>
            <MenuItem value="Autres">Autres</MenuItem>
          </TextField>
          <Box sx={{ mt: 3, mb: 2 }}>
            <ImageUpload
              images={formData.images}
              onImagesChange={(urls) => setFormData((prev) => ({ ...prev, images: urls }))}
              maxImages={5}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updateMutation.isPending}
              startIcon={<Save />}
              sx={{ flex: 1 }}
            >
              {updateMutation.isPending ? 'Modification...' : 'Enregistrer les modifications'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/my-announcements')}
              disabled={updateMutation.isPending}
            >
              Annuler
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
