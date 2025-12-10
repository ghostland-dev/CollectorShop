import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { Collections, Security, Speed, TrendingUp } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

const features = [
  {
    icon: <Collections sx={{ fontSize: 40 }} />,
    title: 'Catalogue varié',
    description: 'Découvrez des milliers d\'objets de collection uniques',
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Transactions sécurisées',
    description: 'Paiements sécurisés et protection des acheteurs',
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Recherche rapide',
    description: 'Trouvez facilement ce que vous cherchez',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: 'Prix compétitifs',
    description: 'Des prix justes pour tous les budgets',
  },
];

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
        }}
      >
        <Container>
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Bienvenue sur Collector.shop
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              La plateforme de vente d'objets de collection entre particuliers
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/catalog"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4,
                  py: 1.5,
                }}
              >
                Découvrir le catalogue
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Créer un compte
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container>
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom fontWeight="bold">
            Pourquoi choisir Collector.shop ?
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Une expérience simple et sécurisée pour les collectionneurs
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Prêt à commencer ?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Rejoignez notre communauté de collectionneurs dès aujourd'hui
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ px: 4 }}
            >
              S'inscrire gratuitement
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
