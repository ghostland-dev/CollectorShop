import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Paper,
  Chip,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { announcementService } from '../services/announcement.service';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { CatalogSkeleton } from '../components/LoadingSkeleton';
import { useNotifications } from '../hooks/useNotifications';

// Helper component for search filters
function SearchFilters({ search, category, onSearchChange, onCategoryChange, onClearFilters }: {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          fullWidth
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto', minWidth: 250 } }}
          placeholder="Rechercher un objet..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <Clear
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onSearchChange('')}
                />
              </InputAdornment>
            ),
          }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>
            <FilterList sx={{ mr: 0.5, verticalAlign: 'middle' }} fontSize="small" />
            Catégorie
          </InputLabel>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            label="Catégorie"
          >
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="Philatélie">Philatélie</MenuItem>
            <MenuItem value="Numismatique">Numismatique</MenuItem>
            <MenuItem value="Cartes">Cartes</MenuItem>
            <MenuItem value="Autres">Autres</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {(search || category) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label="Effacer les filtres"
            size="small"
            onDelete={onClearFilters}
            deleteIcon={<Clear />}
            variant="outlined"
          />
        </Box>
      )}
    </Paper>
  );
}

// Helper component for catalog content
function CatalogContent({ data, isLoading, error }: {
  data: { announcements: Array<{ id: string }> } | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {error instanceof Error ? error.message : 'Erreur lors du chargement du catalogue'}
        </Typography>
      </Alert>
    );
  }

  if (data && data.announcements.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="body1">Aucune annonce trouvée</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Essayez de modifier vos critères de recherche
        </Typography>
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {data?.announcements.map((announcement) => (
        <Grid item xs={12} sm={6} md={4} key={announcement.id}>
          <AnnouncementCard announcement={announcement as Parameters<typeof AnnouncementCard>[0]['announcement']} />
        </Grid>
      ))}
    </Grid>
  );
}

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const { showError } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['announcements', { search: debouncedSearch, category }],
    queryFn: () => announcementService.getAll({ search: debouncedSearch, category, limit: 20 }),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const filteredCount = useMemo(() => {
    if (!data) return 0;
    return data.announcements.length;
  }, [data]);

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement du catalogue';
    showError(errorMessage);
  }

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <Box role="region" aria-label="Catalogue des annonces">
      <Box sx={{ mb: 4 }} role="banner">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" id="catalog-title">
          Catalogue
        </Typography>
        <Typography variant="body1" color="text.secondary" aria-describedby="catalog-title">
          Découvrez notre sélection d'objets de collection
        </Typography>
      </Box>

      <SearchFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onClearFilters={handleClearFilters}
      />

      {(debouncedSearch || category) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredCount} résultat{filteredCount !== 1 ? 's' : ''} trouvé{filteredCount !== 1 ? 's' : ''}
        </Typography>
      )}

      <CatalogContent
        data={data}
        isLoading={isLoading}
        error={error}
      />
    </Box>
  );
}
