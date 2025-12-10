import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Announcement } from '../services/announcement.service';
import { Collections, ImageNotSupported } from '@mui/icons-material';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/announcements/${announcement.id}`)}
    >
      {announcement.images.length > 0 ? (
        <CardMedia
          component="img"
          height="200"
          image={announcement.images[0]}
          alt={announcement.title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.100',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'grey.400',
          }}
        >
          <ImageNotSupported sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="caption">Pas d'image</Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.5em',
          }}
        >
          {announcement.title}
        </Typography>
        {announcement.category && (
          <Chip
            label={announcement.category}
            size="small"
            icon={<Collections />}
            sx={{ mb: 1, alignSelf: 'flex-start' }}
          />
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {announcement.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {announcement.price.toFixed(2)} €
          </Typography>
          {announcement.status === 'SOLD' && (
            <Chip label="Vendu" color="error" size="small" />
          )}
        </Box>
        <Button variant="contained" fullWidth size="large">
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
}
