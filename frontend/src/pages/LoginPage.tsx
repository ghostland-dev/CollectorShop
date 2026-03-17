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
  Divider,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { Email, Lock, Login, Person, Store } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService, loginSchema } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { CollectorLogo } from '../components/CollectorLogo';

const TEST_ACCOUNTS = [
  {
    label: 'Acheteur',
    email: 'acheteur1@collector.shop',
    password: 'password123',
    icon: <Person fontSize="small" />,
    role: 'BUYER',
    color: '#059669' as const,
  },
  {
    label: 'Vendeur',
    email: 'vendeur1@collector.shop',
    password: 'password123',
    icon: <Store fontSize="small" />,
    role: 'SELLER',
    color: '#047857' as const,
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showSuccess, showError } = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      showSuccess('Connexion réussie !');
      navigate('/');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Erreur de connexion';
      showError(message);
      setErrors({ general: message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
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

    loginMutation.mutate({ email, password });
  };

  const handleAutoFill = (account: typeof TEST_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  };

  const handleQuickLogin = (account: typeof TEST_ACCOUNTS[0]) => {
    setErrors({});
    loginMutation.mutate({ email: account.email, password: account.password });
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: { xs: 4, md: 8 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(5, 150, 105, 0.15)',
        }}
      >
        {/* Header avec logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CollectorLogo size={48} showText={false} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.dark">
            Connexion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connectez-vous pour accéder à votre compte
          </Typography>
        </Box>

        {/* Comptes de démonstration */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid',
            borderColor: 'rgba(5, 150, 105, 0.25)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label="Comptes de démo"
              size="small"
              sx={{
                bgcolor: '#059669',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Cliquez pour remplir ou connexion directe
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {TEST_ACCOUNTS.map((account) => (
              <Box key={account.email} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Tooltip title={`Email: ${account.email} | Mot de passe: ${account.password}`} arrow>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={account.icon}
                    onClick={() => handleAutoFill(account)}
                    sx={{
                      borderColor: account.color,
                      color: account.color,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: account.color,
                        bgcolor: `${account.color}12`,
                      },
                    }}
                  >
                    {account.label}
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleQuickLogin(account)}
                  disabled={loginMutation.isPending}
                  sx={{
                    bgcolor: account.color,
                    fontSize: '0.7rem',
                    py: 0.3,
                    minHeight: 'unset',
                    '&:hover': { bgcolor: '#047857' },
                  }}
                >
                  ⚡ Connexion rapide
                </Button>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Mot de passe universel :</strong>{' '}
              <code style={{
                background: 'rgba(5,150,105,0.1)',
                padding: '1px 6px',
                borderRadius: 4,
                fontFamily: 'monospace',
                color: '#047857',
              }}>
                password123
              </code>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">ou saisissez vos identifiants</Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#059669' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#059669' }} />
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
            disabled={loginMutation.isPending}
            startIcon={<Login />}
          >
            {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
          </Button>
          <Typography variant="body2" align="center">
            Pas encore de compte ?{' '}
            <MuiLink component={Link} to="/register" fontWeight="bold" sx={{ color: '#059669' }}>
              S'inscrire
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
