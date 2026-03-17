import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Link as MuiLink, InputAdornment, Divider, Chip, Stack, Tooltip,
} from '@mui/material';
import { Email, Lock, Login, Person, Store, Bolt } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { authService, loginSchema } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';

const TEST_ACCOUNTS = [
  {
    label: 'Acheteur',
    email: 'acheteur1@collector.shop',
    password: 'password123',
    icon: <Person fontSize="small" />,
    color: '#38bdf8',
  },
  {
    label: 'Vendeur',
    email: 'vendeur1@collector.shop',
    password: 'password123',
    icon: <Store fontSize="small" />,
    color: '#f59e0b',
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
      const message = error.data?.error || error.data?.message || error.message || 'Erreur de connexion';
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
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleQuickLogin = (account: typeof TEST_ACCOUNTS[0]) => {
    setErrors({});
    loginMutation.mutate({ email: account.email, password: account.password });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: { xs: 4, md: 8 }, mb: 4 }}>
        {/* Logo header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
            }}
          >
            🃏
          </Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontFamily: 'Rajdhani, sans-serif', mb: 0.5 }}
          >
            Connexion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accédez à votre collection Pokémon TCG
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: '1px solid rgba(248,250,252,0.08)',
            borderRadius: 3,
          }}
        >
          {/* Demo accounts */}
          <Box
            sx={{
              mb: 3, p: 2.5, borderRadius: 2,
              background: 'rgba(245,158,11,0.05)',
              border: '1px solid rgba(245,158,11,0.15)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<Bolt sx={{ fontSize: '0.8rem !important' }} />}
                label="Accès démo"
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                Connexion instantanée pour le POC
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {TEST_ACCOUNTS.map((account) => (
                <Tooltip
                  key={account.email}
                  title={`${account.email} · password123`}
                  arrow
                  placement="top"
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={account.icon}
                    onClick={() => handleQuickLogin(account)}
                    disabled={loginMutation.isPending}
                    sx={{
                      bgcolor: `${account.color}20`,
                      color: account.color,
                      border: `1px solid ${account.color}40`,
                      fontWeight: 700,
                      '&:hover': { bgcolor: `${account.color}30`, boxShadow: `0 4px 12px ${account.color}30` },
                      '&:disabled': { opacity: 0.5 },
                    }}
                  >
                    {account.label}
                  </Button>
                </Tooltip>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              Mot de passe universel :{' '}
              <Box
                component="code"
                sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', px: 1, py: 0.2, borderRadius: 1, fontFamily: 'monospace' }}
              >
                password123
              </Box>
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">ou saisissez vos identifiants</Typography>
          </Divider>

          {errors.general && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Typography variant="body2" color="error.main">{errors.general}</Typography>
            </Box>
          )}

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
                    <Email sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
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
                    <Lock sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
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
              {loginMutation.isPending ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Pas encore de compte ?{' '}
              <MuiLink component={Link} to="/register" fontWeight={700} color="primary.main">
                S'inscrire gratuitement
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
