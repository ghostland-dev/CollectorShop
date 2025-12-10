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
            <>
              <Button
                color="inherit"
                component={Link}
                to="/catalog"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Catalogue
              </Button>
              {(user?.role === 'BUYER' || user?.role === 'ADMIN') && (
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
              {user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
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
              ) : null}
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
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
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
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
