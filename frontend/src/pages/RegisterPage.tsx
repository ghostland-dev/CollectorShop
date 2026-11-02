import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Link as MuiLink, InputAdornment,
} from '@mui/material';
import { Email, Lock, Person, PersonAdd } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { authService, registerSchema } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      showSuccess('Bienvenue sur Collector.shop ! 🃏');
      navigate('/');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.data?.error || error.data?.message || 'Erreur lors de l\'inscription';
      showError(message);
      setErrors({ general: message });
    },
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    registerMutation.mutate(formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: { xs: 4, md: 8 }, mb: 4 }}>
        {/* Logo header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
            }}
          >
            ✨
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 0.5 }}>
            Créer un compte
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rejoignez la communauté des collectionneurs Pokémon
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: '1px solid rgba(248,250,252,0.08)', borderRadius: 3 }}>
          {errors.general && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Typography variant="body2" color="error.main">{errors.general}</Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email"
              value={formData.email} onChange={handleChange('email')}
              error={!!errors.email} helperText={errors.email}
              margin="normal" required autoComplete="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment> }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth label="Prénom"
                value={formData.firstName} onChange={handleChange('firstName')}
                margin="normal" autoComplete="given-name"
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment> }}
              />
              <TextField
                fullWidth label="Nom"
                value={formData.lastName} onChange={handleChange('lastName')}
                margin="normal" autoComplete="family-name"
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment> }}
              />
            </Box>
            <TextField
              fullWidth label="Mot de passe" type="password"
              value={formData.password} onChange={handleChange('password')}
              error={!!errors.password} helperText={errors.password || 'Minimum 8 caractères'}
              margin="normal" required autoComplete="new-password"
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment> }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
              disabled={registerMutation.isPending}
              startIcon={<PersonAdd />}
            >
              {registerMutation.isPending ? 'Création...' : 'Créer mon compte'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Déjà un compte ?{' '}
              <MuiLink component={Link} to="/login" fontWeight={700} color="primary.main">
                Se connecter
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
