import React, { ReactNode } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Avatar,
  Menu, MenuItem, IconButton, Badge, Divider, Chip,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Logout, Add, ShoppingCart, ShoppingBag, GridView, Chat,
  Store, Person, AdminPanelSettings, ViewList,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  children: ReactNode;
}

function NavLink({ to, children, icon }: { to: string; children: ReactNode; icon?: ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Button
      color="inherit"
      component={Link}
      to={to}
      startIcon={icon}
      sx={{
        fontSize: '0.875rem',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? 'primary.main' : 'text.secondary',
        borderRadius: 2,
        px: 1.5,
        '&:hover': { color: 'primary.main', bgcolor: 'rgba(245,158,11,0.08)' },
        display: { xs: 'none', sm: 'flex' },
      }}
    >
      {children}
    </Button>
  );
}

function UserMenu({ anchorEl, user, onClose, onLogout }: {
  anchorEl: HTMLElement | null;
  user: { firstName?: string; lastName?: string; email?: string; role?: string } | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  const roleConfig: Record<string, { label: string; color: string; icon: ReactNode }> = {
    BUYER: { label: 'Acheteur', color: '#38bdf8', icon: <Person fontSize="small" /> },
    SELLER: { label: 'Vendeur', color: '#f59e0b', icon: <Store fontSize="small" /> },
    ADMIN: { label: 'Admin', color: '#ef4444', icon: <AdminPanelSettings fontSize="small" /> },
  };
  const role = roleConfig[user?.role || ''] || roleConfig.BUYER;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5, minWidth: 220,
            background: '#1e293b',
            border: '1px solid rgba(245,158,11,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Chip
            icon={role.icon as React.ReactElement}
            label={role.label}
            size="small"
            sx={{ bgcolor: `${role.color}20`, color: role.color, border: `1px solid ${role.color}40`, height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>
      <Divider />
      <MenuItem component={Link} to="/my-purchases" onClick={onClose} sx={{ gap: 1.5, py: 1.2 }}>
        <ShoppingBag fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2">Mes achats</Typography>
      </MenuItem>
      <MenuItem onClick={onLogout} sx={{ gap: 1.5, py: 1.2, color: '#ef4444' }}>
        <Logout fontSize="small" />
        <Typography variant="body2">Déconnexion</Typography>
      </MenuItem>
    </Menu>
  );
}

function AuthenticatedMenu({ user, cartItemCount, onMenuClick, anchorEl, onCloseMenu, onLogout }: {
  user: { role: string; firstName?: string; lastName?: string; email?: string } | null;
  cartItemCount: number;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null;
  onCloseMenu: () => void;
  onLogout: () => void;
}) {
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <>
      <NavLink to="/catalog" icon={<GridView fontSize="small" />}>Catalogue</NavLink>
      <NavLink to="/chat" icon={<Chat fontSize="small" />}>Messages</NavLink>
      {isSeller && (
        <>
          <NavLink to="/my-announcements" icon={<ViewList fontSize="small" />}>Mes annonces</NavLink>
          <Button
            variant="contained"
            size="small"
            component={Link}
            to="/announcements/create"
            startIcon={<Add />}
            sx={{ ml: 1, display: { xs: 'none', sm: 'flex' } }}
          >
            Vendre
          </Button>
        </>
      )}
      <IconButton
        color="inherit"
        component={Link}
        to="/cart"
        sx={{
          ml: 1,
          color: cartItemCount > 0 ? 'primary.main' : 'text.secondary',
          '&:hover': { color: 'primary.main' },
        }}
        aria-label={`Panier (${cartItemCount} articles)`}
      >
        <Badge badgeContent={cartItemCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16, bgcolor: '#f59e0b', color: '#0f172a' } }}>
          <ShoppingCart fontSize="small" />
        </Badge>
      </IconButton>
      <IconButton
        size="medium"
        onClick={onMenuClick}
        sx={{ ml: 0.5 }}
        aria-label="Menu utilisateur"
        aria-haspopup="true"
        aria-expanded={!!anchorEl}
      >
        <Avatar
          sx={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#0f172a',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          {initials}
        </Avatar>
      </IconButton>
      <UserMenu anchorEl={anchorEl} user={user} onClose={onCloseMenu} onLogout={onLogout} />
    </>
  );
}

function UnauthenticatedMenu() {
  return (
    <>
      <NavLink to="/catalog" icon={<GridView fontSize="small" />}>Catalogue</NavLink>
      <Button
        color="inherit"
        component={Link}
        to="/login"
        sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        Connexion
      </Button>
      <Button
        variant="contained"
        size="small"
        component={Link}
        to="/register"
        sx={{ ml: 1 }}
      >
        S'inscrire
      </Button>
    </>
  );
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { showSuccess } = useNotifications();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    showSuccess('Déconnexion réussie');
    navigate('/');
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <a href="#main-content" style={{ position: 'absolute', left: -9999, top: 0 }}>
        Aller au contenu principal
      </a>

      <AppBar position="sticky" role="banner" elevation={0}>
        <Toolbar sx={{ gap: 0.5, minHeight: { xs: 60, sm: 64 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 0 12px rgba(245,158,11,0.4)',
                flexShrink: 0,
              }}
            >
              🃏
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '1.3rem',
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.02em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Collector<Box component="span" sx={{ opacity: 0.6 }}>.shop</Box>
            </Typography>
          </Box>

          {isAuthenticated ? (
            <AuthenticatedMenu
              user={user}
              cartItemCount={cartItemCount}
              onMenuClick={(e) => setAnchorEl(e.currentTarget)}
              anchorEl={anchorEl}
              onCloseMenu={() => setAnchorEl(null)}
              onLogout={handleLogout}
            />
          ) : (
            <UnauthenticatedMenu />
          )}
        </Toolbar>
      </AppBar>

      <Box
        id="main-content"
        component="main"
        tabIndex={-1}
        sx={{ flex: 1, py: { xs: 3, md: 4 } }}
        role="main"
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3, px: 4,
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(245, 158, 11, 0.12)',
        }}
        role="contentinfo"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, maxWidth: 'xl', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '1.2rem' }}>🃏</Box>
            <Typography sx={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#f59e0b', fontSize: '1rem' }}>
              Collector.shop
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            © 2026 Collector.shop — Pokémon TCG Marketplace · POC Bloc 3
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['Catalogue', 'Connexion'].map((label) => (
              <Typography
                key={label}
                variant="caption"
                component={Link}
                to={`/${label === 'Catalogue' ? 'catalog' : 'login'}`}
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
