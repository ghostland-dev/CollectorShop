import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  InputAdornment,
  Container,
} from '@mui/material';
import { Title, Description, Euro, Category, Add } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { announcementService, createAnnouncementSchema } from '../services/announcement.service';
import { useNotifications } from '../hooks/useNotifications';
import { ImageUpload } from '../components/ImageUpload';

export function CreateAnnouncementPage() {
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

  const createMutation = useMutation({
    mutationFn: announcementService.create,
    onSuccess: () => {
      showSuccess('Annonce créée avec succès !');
      navigate('/my-announcements');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      let message = 'Erreur lors de la création';
      if (error.response?.data) {
        if (error.response.data.code === 'USER_NOT_FOUND') {
          message = 'Votre session a expiré. Veuillez vous reconnecter.';
          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (error.response.data.details && Array.isArray(error.response.data.details)) {
          // Erreurs de validation Zod
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const zodErrors = error.response.data.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
          message = `Erreurs de validation: ${zodErrors}`;
        } else {
          message = error.response.data.error || error.response.data.message || message;
        }
      }
      showError(message);
      if (error.response?.data?.details) {
        const fieldErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.response.data.details.forEach((err: any) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: message });
      }
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

    // Filtrer les images vides avant validation
    const filteredImages = formData.images.filter(img => img && img.trim() !== '');

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      images: filteredImages,
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

    createMutation.mutate(validation.data);
  };

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
            Créer une annonce
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Partagez votre objet de collection avec la communauté
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
              disabled={createMutation.isPending}
              startIcon={<Add />}
              sx={{ flex: 1 }}
            >
              {createMutation.isPending ? 'Création...' : 'Créer l\'annonce'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/catalog')}
              disabled={createMutation.isPending}
            >
              Annuler
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
