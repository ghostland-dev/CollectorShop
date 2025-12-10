import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  InputAdornment,
} from '@mui/material';
import { Email, Lock, Person, PersonAdd } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService, registerSchema } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      showSuccess('Inscription réussie ! Bienvenue sur Collector.shop');
      navigate('/');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'inscription';
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

    const validation = registerSchema.safeParse(formData);
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

    registerMutation.mutate(formData);
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: { xs: 4, md: 8 },
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Inscription
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez votre compte pour commencer à vendre ou acheter
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Prénom"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            margin="normal"
            autoComplete="given-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Nom"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            margin="normal"
            autoComplete="family-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            helperText={errors.password || 'Minimum 8 caractères'}
            margin="normal"
            required
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={registerMutation.isPending}
            startIcon={<PersonAdd />}
          >
            {registerMutation.isPending ? 'Inscription...' : 'S\'inscrire'}
          </Button>
          <Typography variant="body2" align="center">
            Déjà un compte ?{' '}
            <MuiLink component={Link} to="/login" fontWeight="bold">
              Se connecter
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
