import { Box, Typography, Button, Container, Grid, Card, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  EmojiEvents, Security, Speed, TrendingUp,
  ArrowForward, AutoAwesome, Verified,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

const features = [
  {
    icon: <EmojiEvents sx={{ fontSize: 32 }} />,
    title: 'Cartes Rares',
    description: 'Base Set 1ère édition, GX Full Art, VMAX Rainbow — les cartes les plus recherchées',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    icon: <Security sx={{ fontSize: 32 }} />,
    title: 'Transactions Sécurisées',
    description: 'Paiements protégés, vendeurs vérifiés, historique complet de vos achats',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    icon: <Speed sx={{ fontSize: 32 }} />,
    title: 'Recherche Instantanée',
    description: 'Filtrez par set, rareté, personnage — trouvez la carte en quelques secondes',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 32 }} />,
    title: 'Prix du Marché',
    description: 'Prix fixés par des collectionneurs passionnés, négociation possible',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
  },
];

const stats = [
  { value: '12', label: 'Cartes rares', icon: '🃏' },
  { value: '3', label: 'Boutiques actives', icon: '🏪' },
  { value: 'PSA', label: 'Certified quality', icon: '✅' },
  { value: '1999', label: 'Base Set vintage', icon: '⭐' },
];

const categories = [
  {
    title: 'Base Set 1ère Éd.',
    subtitle: 'Holographiques 1999',
    emoji: '🌟',
    badge: 'Ultra Rare',
    color: '#f59e0b',
    priceFrom: '320 €',
  },
  {
    title: 'GX Full Art',
    subtitle: 'Sun & Moon 2016-2019',
    emoji: '💎',
    badge: 'Secret Rare',
    color: '#8b5cf6',
    priceFrom: '420 €',
  },
  {
    title: 'VMAX Rainbow',
    subtitle: 'Sword & Shield 2020+',
    emoji: '🌈',
    badge: 'Rainbow Rare',
    color: '#38bdf8',
    priceFrom: '680 €',
  },
  {
    title: 'Séries Neo',
    subtitle: 'Neo Genesis 2000-2002',
    emoji: '🔥',
    badge: 'Holo Rare',
    color: '#10b981',
    priceFrom: '950 €',
  },
];

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden',
        py: { xs: 8, md: 12 }, mb: 8,
        mx: { xs: -3, md: -4 }, mt: { xs: -3, md: -4 },
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1a0a2e 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />
      </Box>
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 780, mx: 'auto' }}>
          <Chip
            icon={<AutoAwesome sx={{ fontSize: '0.8rem !important', color: '#f59e0b !important' }} />}
            label="Pokémon TCG Marketplace"
            size="small"
            sx={{
              mb: 3, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.75rem',
            }}
          />
          <Typography
            variant="h1" component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
              fontWeight: 700, lineHeight: 1.05, mb: 2,
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Collector.shop
          </Typography>
          <Typography
            variant="h4"
            sx={{ mb: 2, color: '#f8fafc', fontSize: { xs: '1.2rem', md: '1.6rem' }, fontWeight: 500, opacity: 0.9 }}
          >
            La marketplace des cartes Pokémon rares (changement pour la démo)
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: '#94a3b8', maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Achetez et vendez des cartes Pokémon certifiées. Base Set 1ère édition,
            GX Full Art, VMAX Rainbow — toutes les pièces rares en un seul endroit.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained" size="large" component={Link} to="/catalog"
              endIcon={<ArrowForward />} sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Explorer le catalogue
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined" size="large" component={Link} to="/register"
                sx={{
                  px: 4, py: 1.5, fontSize: '1rem',
                  borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b',
                  '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' },
                }}
              >
                Créer un compte
              </Button>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Box>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection isAuthenticated={isAuthenticated} />

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Box
                sx={{
                  textAlign: 'center', py: 3, px: 2,
                  bgcolor: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.12)',
                  borderRadius: 3,
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{stat.icon}</Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 700,
                    color: '#f59e0b',
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Collections disponibles
          </Typography>
          <Button
            component={Link}
            to="/catalog"
            endIcon={<ArrowForward />}
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Voir tout
          </Button>
        </Box>
        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={3} key={cat.title}>
              <Card
                component={Link}
                to="/catalog"
                sx={{
                  p: 2.5,
                  textDecoration: 'none',
                  display: 'block',
                  cursor: 'pointer',
                  border: `1px solid ${cat.color}20`,
                  '&:hover': {
                    border: `1px solid ${cat.color}50`,
                    boxShadow: `0 8px 32px ${cat.color}20`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '2rem' }}>{cat.emoji}</Typography>
                  <Chip
                    label={cat.badge}
                    size="small"
                    sx={{
                      bgcolor: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}30`,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      height: 20,
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.3 }}>
                  {cat.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {cat.subtitle}
                </Typography>
                <Typography variant="body2" sx={{ color: cat.color, fontWeight: 600 }}>
                  À partir de {cat.priceFrom}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" fontWeight={700} gutterBottom>
          Pourquoi Collector.shop ?
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 5 }}>
          Une expérience premium pour les collectionneurs sérieux
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} key={feature.title}>
              <Card sx={{ p: 3, height: '100%', border: `1px solid ${feature.color}20` }}>
                <Box
                  sx={{
                    width: 56, height: 56, borderRadius: 2, mb: 2,
                    bgcolor: feature.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: feature.color,
                    border: `1px solid ${feature.color}20`,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            mb: 4,
          }}
        >
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip icon={<Verified />} label="100% gratuit" size="small" color="success" />
            <Chip label="Aucune commission" size="small" sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
            Prêt à collectionner ?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            Rejoignez la communauté de collectionneurs Pokémon et accédez aux cartes les plus rares
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            endIcon={<ArrowForward />}
            sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
          >
            S'inscrire gratuitement
          </Button>
        </Box>
      )}
    </Box>
  );
}
