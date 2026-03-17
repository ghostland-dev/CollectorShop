import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Logout, Add, ShoppingCart, ShoppingBag } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useNotifications } from '../hooks/useNotifications';
import { LanguageSelector } from './LanguageSelector';
import { CollectorLogo } from './CollectorLogo';

interface LayoutProps {
  children: ReactNode;
}

// Helper component for user menu dropdown
function UserMenu({ anchorEl, user, onClose, onLogout }: {
  anchorEl: HTMLElement | null;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem disabled>
        <Typography variant="body2">
          {user?.firstName} {user?.lastName}
        </Typography>
      </MenuItem>
      <MenuItem disabled>
        <Typography variant="caption" color="text.secondary">
          {user?.email}
        </Typography>
      </MenuItem>
      <MenuItem component={Link} to="/my-purchases" onClick={onClose}>
        <ShoppingBag sx={{ mr: 1 }} />
        Mes achats
      </MenuItem>
      <MenuItem onClick={onLogout}>
        <Logout sx={{ mr: 1 }} />
        Déconnexion
      </MenuItem>
    </Menu>
  );
}

// Helper component for authenticated user menu
function AuthenticatedMenu({ user, cartItemCount, onMenuClick, anchorEl, onCloseMenu, onLogout }: {
  user: { role: string; firstName?: string; lastName?: string; email?: string } | null;
  cartItemCount: number;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null;
  onCloseMenu: () => void;
  onLogout: () => void;
}) {
  const isBuyer = user?.role === 'BUYER' || user?.role === 'SELLER' || user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return (
    <>
      <LanguageSelector />
      <Button
        color="inherit"
        component={Link}
        to="/catalog"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
        aria-label="Accéder au catalogue"
      >
        Catalogue
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/chat"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
        aria-label="Accéder aux messages"
      >
        Messages
      </Button>
      {isBuyer && (
        <IconButton
          color="inherit"
          component={Link}
          to="/cart"
          sx={{ ml: 1 }}
          aria-label={`Panier avec ${cartItemCount} article${cartItemCount > 1 ? 's' : ''}`}
          aria-describedby="cart-badge"
        >
          <Badge badgeContent={cartItemCount} color="error" id="cart-badge">
            <ShoppingCart aria-hidden="true" />
          </Badge>
        </IconButton>
      )}
      {isSeller && (
        <>
          <Button
            color="inherit"
            component={Link}
            to="/my-announcements"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
            aria-label="Accéder à mes annonces"
          >
            Mes annonces
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/announcements/create"
            startIcon={<Add />}
            aria-label="Créer une nouvelle annonce"
          >
            Créer
          </Button>
        </>
      )}
      <IconButton
        size="large"
        onClick={onMenuClick}
        color="inherit"
        sx={{ ml: 1 }}
        aria-label="Menu utilisateur"
        aria-haspopup="true"
        aria-expanded={!!anchorEl}
        id="user-menu-button"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }} aria-hidden="true">
          {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <UserMenu
        anchorEl={anchorEl}
        user={user}
        onClose={onCloseMenu}
        onLogout={onLogout}
      />
    </>
  );
}

// Helper component for unauthenticated menu
function UnauthenticatedMenu() {
  return (
    <>
      <Button color="inherit" component={Link} to="/catalog">
        Catalogue
      </Button>
      <Button color="inherit" component={Link} to="/login">
        Connexion
      </Button>
      <Button color="inherit" component={Link} to="/register">
        Inscription
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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-to-main">
        Aller au contenu principal
      </a>
      <AppBar position="static" role="banner" aria-label="En-tête principal">
        <Toolbar role="toolbar" aria-label="Navigation principale">
          <Box
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            aria-label="Collector.shop - Accueil"
          >
            <CollectorLogo size={36} showText={true} />
          </Box>
          {isAuthenticated ? (
            <AuthenticatedMenu
              user={user}
              cartItemCount={cartItemCount}
              onMenuClick={handleMenu}
              anchorEl={anchorEl}
              onCloseMenu={handleCloseMenu}
              onLogout={handleLogout}
            />
          ) : (
            <UnauthenticatedMenu />
          )}
        </Toolbar>
      </AppBar>
      <Container id="main-content" component="main" sx={{ flex: 1, py: 4 }} role="main" tabIndex={-1}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: 'rgba(255,255,255,0.8)',
        }}
        role="contentinfo"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
          <CollectorLogo size={20} showText={true} />
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(52,211,153,0.8)' }}>
          © 2026 Collector.shop — POC Bloc 3
        </Typography>
      </Box>
    </Box>
  );
}
