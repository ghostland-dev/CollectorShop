import { useState, useMemo, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert,
  Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Chip, Paper,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { announcementService, Announcement } from '../services/announcement.service';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { CatalogSkeleton } from '../components/LoadingSkeleton';
import { useNotifications } from '../hooks/useNotifications';

type AnnCardAnnouncement = Parameters<typeof AnnouncementCard>[0]['announcement'];

function CatalogContent({
  isLoading,
  error,
  announcements,
}: {
  isLoading: boolean;
  error: Error | null;
  announcements: Announcement[] | undefined;
}) {
  if (isLoading) return <CatalogSkeleton />;
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error.message}
      </Alert>
    );
  }
  if (!announcements?.length) {
    return (
      <Box
        sx={{
          textAlign: 'center', py: 10,
          bgcolor: 'rgba(248,250,252,0.02)',
          border: '1px dashed rgba(248,250,252,0.1)',
          borderRadius: 3,
        }}
      >
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
        <Typography variant="h6" fontWeight={600} gutterBottom>Aucune carte trouvée</Typography>
        <Typography variant="body2" color="text.secondary">
          Essayez de modifier vos critères de recherche
        </Typography>
      </Box>
    );
  }
  return (
    <Grid container spacing={3}>
      {announcements.map((announcement) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={announcement.id}>
          <AnnouncementCard announcement={announcement as AnnCardAnnouncement} />
        </Grid>
      ))}
    </Grid>
  );
}

const CATEGORIES = [
  { value: '', label: 'Toutes les cartes' },
  { value: 'Cartes Pokémon', label: '🃏 Cartes Pokémon' },
  { value: 'Philatélie', label: '📮 Philatélie' },
  { value: 'Numismatique', label: '🪙 Numismatique' },
  { value: 'Autres', label: '📦 Autres' },
];

function SearchFilters({ search, category, onSearchChange, onCategoryChange, onClearFilters }: {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, mb: 4,
        background: 'rgba(30,41,59,0.8)',
        border: '1px solid rgba(248,250,252,0.08)',
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 260 } }}
          placeholder="Rechercher Charizard, Lugia, Mewtwo..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <Clear
                  sx={{ cursor: 'pointer', color: 'text.secondary', fontSize: '1rem', '&:hover': { color: 'primary.main' } }}
                  onClick={() => onSearchChange('')}
                />
              </InputAdornment>
            ),
          }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
          <InputLabel>
            <FilterList sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} fontSize="small" />
            Catégorie
          </InputLabel>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            label="Catégorie"
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {(search || category) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {search && (
            <Chip
              label={`"${search}"`}
              size="small"
              onDelete={() => onSearchChange('')}
              sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
            />
          )}
          {category && (
            <Chip
              label={CATEGORIES.find(c => c.value === category)?.label || category}
              size="small"
              onDelete={() => onCategoryChange('')}
              sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
            />
          )}
          <Chip
            label="Effacer les filtres"
            size="small"
            onDelete={onClearFilters}
            deleteIcon={<Clear />}
            variant="outlined"
            sx={{ borderColor: 'rgba(248,250,252,0.12)', color: 'text.secondary' }}
          />
        </Box>
      )}
    </Paper>
  );
}

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const { showError } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['announcements', { search: debouncedSearch, category }],
    queryFn: () => announcementService.getAll({ search: debouncedSearch, category, limit: 50 }),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Show error via toast only when error changes, not on every render
  useEffect(() => {
    if (error) {
      const msg = error instanceof Error ? error.message : 'Erreur lors du chargement du catalogue';
      showError(msg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const filteredCount = useMemo(() => data?.announcements?.length ?? 0, [data]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <Box role="region" aria-label="Catalogue des annonces">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight={700}
            sx={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Catalogue
          </Typography>
          <Chip
            label="Pokémon TCG"
            size="small"
            sx={{
              bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.25)', fontWeight: 700, fontSize: '0.72rem',
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Cartes rares certifiées — Base Set, Neo, GX, VMAX & plus
        </Typography>
      </Box>

      <SearchFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onClearFilters={handleClearFilters}
      />

      {!isLoading && (debouncedSearch || category) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredCount} carte{filteredCount !== 1 ? 's' : ''} trouvée{filteredCount !== 1 ? 's' : ''}
        </Typography>
      )}

      <CatalogContent
        isLoading={isLoading}
        error={error}
        announcements={data?.announcements}
      />
    </Box>
  );
}
