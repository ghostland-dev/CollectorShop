import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Logout, Add, ShoppingCart } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useNotifications } from '../hooks/useNotifications';

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
  const isBuyer = user?.role === 'BUYER' || user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return (
    <>
      <Button
        color="inherit"
        component={Link}
        to="/catalog"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        Catalogue
      </Button>
      {isBuyer && (
        <IconButton
          color="inherit"
          component={Link}
          to="/cart"
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={cartItemCount} color="error">
            <ShoppingCart />
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
          >
            Mes annonces
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/announcements/create"
            startIcon={<Add />}
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
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
            Collector.shop
          </Typography>
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
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 Collector.shop - POC
        </Typography>
      </Box>
    </Box>
  );
}
