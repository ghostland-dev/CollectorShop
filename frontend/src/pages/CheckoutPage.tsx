import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Paper,
  Container,
  Grid,
  Alert,
  Button,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { purchaseService } from '../services/purchase.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cartStore';
import { PaymentForm } from '../components/checkout/PaymentForm';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { validatePaymentForm, PaymentFormData } from '../utils/validation';

interface CheckoutFormData extends PaymentFormData {
  rememberCard: boolean;
}

interface LocationState {
  items: Array<{
    announcementId: string;
    title: string;
    price: number;
  }>;
  total: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const { t } = useTranslation();
  const { clearCart } = useCartStore();
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    rememberCard: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const state = location.state as LocationState | null;
  const items = state?.items || [];
  const total = state?.total || 0;

  const handleFormChange = (newFormData: CheckoutFormData) => {
    setFormData(newFormData);
    // Réinitialiser les erreurs quand l'utilisateur modifie le formulaire
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    const validation = validatePaymentForm({
      cardNumber: formData.cardNumber,
      cardHolder: formData.cardHolder,
      expiryDate: formData.expiryDate,
      cvv: formData.cvv,
    });
    setErrors(validation.errors);
    return validation.isValid;
  };

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Simuler le traitement du paiement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Créer les achats pour chaque article
      const purchasePromises = items.map((item) =>
        purchaseService.create({ announcementId: item.announcementId })
      );

      const purchases = await Promise.all(purchasePromises);

      // Confirmer tous les paiements
      const confirmPromises = purchases.map((p) =>
        purchaseService.confirm(p.purchase.id)
      );

      await Promise.all(confirmPromises);

      return purchases;
    },
    onSuccess: () => {
      showSuccess('Paiement effectué avec succès !');
      clearCart();
      navigate('/purchases/success');
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showError(error.message || 'Erreur lors du paiement');
      } else {
        showError('Erreur lors du paiement');
      }
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (validateForm()) {
      checkoutMutation.mutate();
    }
  };

  if (!user || items.length === 0) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          {t('cart.loginRequired')}
        </Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/cart')}>
          {t('nav.cart')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Paiement sécurisé
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Formulaire de paiement */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit} role="form" aria-label="Formulaire de paiement">
            <PaymentForm
              formData={formData}
              errors={errors}
              onChange={handleFormChange}
            />
          </Paper>
        </Grid>

        {/* Récapitulatif */}
        <Grid item xs={12} md={5}>
          <CheckoutSummary
            items={items}
            total={total}
            isProcessing={checkoutMutation.isPending}
            onSubmit={handleSubmit}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
