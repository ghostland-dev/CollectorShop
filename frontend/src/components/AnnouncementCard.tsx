import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Announcement } from '../services/announcement.service';
import { ImageNotSupported, ArrowForward, LocalOffer } from '@mui/icons-material';

interface AnnouncementCardProps {
  announcement: Announcement;
}

function CardImage({ announcement }: { announcement: Announcement }) {
  if (announcement.images.length > 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '10px 10px 0 0',
          background: '#0f172a',
        }}
      >
        <Box
          component="img"
          src={announcement.images[0]}
          alt={announcement.title}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) parent.setAttribute('data-fallback', 'true');
          }}
          sx={{
            width: '100%',
            height: 260,
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
            p: announcement.images[0].includes('pokemontcg') ? 1 : 0,
            transition: 'transform 0.4s ease',
            '.MuiCard-root:hover &': { transform: 'scale(1.05)' },
          }}
        />
        {announcement.status === 'SOLD' && (
          <Box
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'rgba(0,0,0,0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700, fontSize: '1.8rem',
                color: '#ef4444', letterSpacing: '0.1em',
                border: '3px solid #ef4444', px: 2, py: 0.5, borderRadius: 1,
                transform: 'rotate(-15deg)',
              }}
            >
              VENDU
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        height: 260,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#334155',
        borderRadius: '10px 10px 0 0',
      }}
    >
      <ImageNotSupported sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="caption">Pas d'image</Typography>
    </Box>
  );
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const navigate = useNavigate();
  const shopName = announcement.seller?.shop?.name
    || `${announcement.seller?.firstName || ''} ${announcement.seller?.lastName || ''}`.trim()
    || 'Vendeur';

  const handleClick = () => navigate(`/announcements/${announcement.id}`);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={handleClick}
    >
      <CardImage announcement={announcement} />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Category + shop */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          {announcement.category && (
            <Chip
              label={announcement.category}
              size="small"
              icon={<LocalOffer sx={{ fontSize: '0.75rem !important' }} />}
              sx={{
                bgcolor: 'rgba(245,158,11,0.1)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.2)',
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-icon': { color: '#f59e0b' },
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
            🏪 {shopName}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="subtitle1"
          component="h2"
          fontWeight={700}
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.8em',
            lineHeight: 1.4,
            fontFamily: 'Rajdhani, Inter, sans-serif',
            fontSize: '1rem',
          }}
        >
          {announcement.title}
        </Typography>

        {/* Description */}
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
            lineHeight: 1.6,
            fontSize: '0.8rem',
          }}
        >
          {announcement.description}
        </Typography>

        {/* Price + CTA */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                color: announcement.status === 'SOLD' ? '#64748b' : '#f59e0b',
                lineHeight: 1,
              }}
            >
              {announcement.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </Typography>
            {announcement.status === 'SOLD' && (
              <Chip
                label="Vendu"
                size="small"
                sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', height: 22, fontSize: '0.7rem' }}
              />
            )}
          </Box>
          <Button
            variant={announcement.status === 'SOLD' ? 'outlined' : 'contained'}
            fullWidth
            size="medium"
            endIcon={<ArrowForward />}
            disabled={false}
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            sx={{
              ...(announcement.status === 'SOLD' && {
                borderColor: 'rgba(248,250,252,0.12)',
                color: '#64748b',
                '&:hover': { borderColor: 'rgba(248,250,252,0.2)', bgcolor: 'rgba(248,250,252,0.04)' },
              }),
            }}
          >
            {announcement.status === 'SOLD' ? 'Voir le détail' : 'Voir les détails'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
