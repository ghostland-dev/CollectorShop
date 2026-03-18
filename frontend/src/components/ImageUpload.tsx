import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthStore } from '../stores/authStore';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

// Helper component for single image preview
function ImagePreviewItem({ url, index, onRemove }: { url: string; index: number; onRemove: (index: number) => void }) {
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {url ? (
        <Box
          component="img"
          src={url}
          alt={`Preview ${index + 1}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>
      )}
      <IconButton
        size="small"
        onClick={() => onRemove(index)}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          bgcolor: 'error.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'error.dark',
          },
        }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
}

// Helper component for image preview
function ImagePreview({ images, onRemove }: { images: string[]; onRemove: (index: number) => void }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 2,
        mt: 2,
      }}
    >
      {images.map((url, index) => (
        <ImagePreviewItem
          key={index}
          url={url}
          index={index}
          onRemove={onRemove}
        />
      ))}
    </Box>
  );
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const performUpload = useCallback(
    async (formData: FormData) => {
      // Pour FormData, ne pas définir Content-Type, le navigateur le fera automatiquement avec la boundary
      const token = useAuthStore.getState().token;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${API_BASE_URL}/upload/images`;

      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      return data.urls || [];
    },
    []
  );

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        showError(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s)`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        fileArray.forEach((file) => {
          formData.append('images', file);
        });

        const newUrls = await performUpload(formData);
        onImagesChange([...images, ...newUrls]);
        showSuccess(`${newUrls.length} image(s) uploadée(s) avec succès`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur lors de l\'upload des images';
        showError(message);
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onImagesChange, showSuccess, showError, performUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleUpload(files);
      }
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleUpload(files);
      }
      // Reset input
      e.target.value = '';
    },
    [handleUpload]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Images ({images.length}/{maxImages})
      </Typography>

      {/* Zone de drag & drop */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          mb: 2,
        }}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input
          id="image-upload-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={uploading || images.length >= maxImages}
        />
        {uploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Upload en cours...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary">
              Glissez-déposez vos images ici ou cliquez pour sélectionner
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formats acceptés: JPEG, PNG, WebP, GIF (max 10MB par image)
            </Typography>
          </Box>
        )}
      </Paper>

      {images.length > 0 && <ImagePreview images={images} onRemove={handleRemove} />}

      {images.length >= maxImages && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Vous avez atteint la limite de {maxImages} images
        </Alert>
      )}
    </Box>
  );
}
