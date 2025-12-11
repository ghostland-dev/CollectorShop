import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseService, Purchase } from '../services/purchase.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { TabPanel } from '../components/common/TabPanel';
import { PurchaseCard } from '../components/purchases/PurchaseCard';
import { DeliveryStatusDialog } from '../components/purchases/DeliveryStatusDialog';


export function MyPurchasesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: purchaseService.getMyPurchases,
    enabled: !isSeller || tabValue === 0,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['mySales'],
    queryFn: purchaseService.getMySales,
    enabled: isSeller && tabValue === 1,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { deliveryStatus: string; trackingNumber?: string }) =>
      purchaseService.updateDeliveryStatus(selectedPurchase!.id, data),
    onSuccess: () => {
      showSuccess('Statut de livraison mis à jour avec succès');
      setUpdateDialogOpen(false);
      setSelectedPurchase(null);
      queryClient.invalidateQueries({ queryKey: ['mySales'] });
      queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      showError(axiosError.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });

  const handleUpdateStatus = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setUpdateDialogOpen(true);
  };

  const handleSubmitUpdate = (data: { deliveryStatus: string; trackingNumber?: string }) => {
    if (!selectedPurchase) return;
    updateStatusMutation.mutate(data);
  };

  const purchases = tabValue === 0 ? purchasesData?.purchases || [] : salesData?.purchases || [];
  const isLoading = tabValue === 0 ? purchasesLoading : salesLoading;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        {isSeller ? 'Mes achats et ventes' : 'Mes achats'}
      </Typography>

      {isSeller && (
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="Onglets achats et ventes"
          >
            <Tab label="Mes achats" id="purchases-tab-0" aria-controls="purchases-tabpanel-0" />
            <Tab label="Mes ventes" id="purchases-tab-1" aria-controls="purchases-tabpanel-1" />
          </Tabs>
        </Paper>
      )}

      <TabPanel value={tabValue} index={0}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : purchases.length === 0 ? (
          <Alert severity="info">Vous n'avez effectué aucun achat pour le moment.</Alert>
        ) : (
          <Box>
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                isSeller={false}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </Box>
        )}
      </TabPanel>

      {isSeller && (
        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : purchases.length === 0 ? (
            <Alert severity="info">Vous n'avez aucune vente pour le moment.</Alert>
          ) : (
            <Box>
              {purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  isSeller={true}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </Box>
          )}
        </TabPanel>
      )}

      {/* Dialog de mise à jour du statut de livraison */}
      <DeliveryStatusDialog
        open={updateDialogOpen}
        purchase={selectedPurchase}
        onClose={() => setUpdateDialogOpen(false)}
        onSubmit={handleSubmitUpdate}
        isSubmitting={updateStatusMutation.isPending}
      />
    </Container>
  );
}

