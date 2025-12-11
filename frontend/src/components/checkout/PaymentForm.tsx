import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { formatCardNumber, formatExpiryDate } from '../../utils/paymentFormatters';
import { PaymentFormData } from '../../utils/validation';

interface PaymentFormProps {
  formData: PaymentFormData & { rememberCard: boolean };
  errors: Partial<Record<keyof PaymentFormData, string>>;
  onChange: (data: PaymentFormData & { rememberCard: boolean }) => void;
}

export function PaymentForm({ formData, errors, onChange }: PaymentFormProps) {
  const [showCvv, setShowCvv] = useState(false);

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const handleCardNumberChange = (value: string) => {
    handleChange('cardNumber', formatCardNumber(value));
  };

  const handleExpiryDateChange = (value: string) => {
    handleChange('expiryDate', formatExpiryDate(value));
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 3);
    handleChange('cvv', cleaned);
  };

  const handleCardHolderChange = (value: string) => {
    handleChange('cardHolder', value.toUpperCase());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Lock sx={{ mr: 1, color: 'success.main' }} />
        <Box component="h2" sx={{ m: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          Informations de paiement
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Numéro de carte"
        value={formData.cardNumber}
        onChange={(e) => handleCardNumberChange(e.target.value)}
        error={!!errors.cardNumber}
        helperText={errors.cardNumber}
        placeholder="1234 5678 9012 3456"
        inputProps={{
          maxLength: 19,
          'aria-label': 'Numéro de carte bancaire',
          'aria-required': 'true',
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Nom du titulaire"
        value={formData.cardHolder}
        onChange={(e) => handleCardHolderChange(e.target.value)}
        error={!!errors.cardHolder}
        helperText={errors.cardHolder}
        placeholder="JEAN DUPONT"
        inputProps={{
          'aria-label': 'Nom du titulaire de la carte',
          'aria-required': 'true',
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Date d'expiration"
          value={formData.expiryDate}
          onChange={(e) => handleExpiryDateChange(e.target.value)}
          error={!!errors.expiryDate}
          helperText={errors.expiryDate}
          placeholder="MM/AA"
          inputProps={{
            maxLength: 5,
            'aria-label': 'Date d\'expiration de la carte',
            'aria-required': 'true',
          }}
        />
        <TextField
          fullWidth
          label="CVV"
          type={showCvv ? 'text' : 'password'}
          value={formData.cvv}
          onChange={(e) => handleCvvChange(e.target.value)}
          error={!!errors.cvv}
          helperText={errors.cvv}
          placeholder="123"
          inputProps={{
            maxLength: 3,
            'aria-label': 'Code de sécurité CVV',
            'aria-required': 'true',
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showCvv ? 'Masquer le CVV' : 'Afficher le CVV'}
                  onClick={() => setShowCvv(!showCvv)}
                  edge="end"
                >
                  {showCvv ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.rememberCard}
            onChange={(e) => onChange({ ...formData, rememberCard: e.target.checked })}
            aria-label="Mémoriser les informations de carte pour les prochains achats"
          />
        }
        label="Mémoriser cette carte pour les prochains achats"
        sx={{ mb: 2 }}
      />

      <Alert severity="info">
        <Box component="span" sx={{ fontSize: '0.875rem' }}>
          🔒 Paiement sécurisé - Les informations de carte sont chiffrées et ne sont pas stockées sur nos serveurs.
          Cette transaction est une simulation pour le POC.
        </Box>
      </Alert>
    </Box>
  );
}

