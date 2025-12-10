import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage';
import { CreateAnnouncementPage } from './pages/CreateAnnouncementPage';
import { EditAnnouncementPage } from './pages/EditAnnouncementPage';
import { MyAnnouncementsPage } from './pages/MyAnnouncementsPage';
import { CartPage } from './pages/CartPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/announcements/create"
          element={
            <ProtectedRoute requiredRole={['SELLER', 'ADMIN']}>
              <CreateAnnouncementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements/:id/edit"
          element={
            <ProtectedRoute requiredRole={['SELLER', 'ADMIN']}>
              <EditAnnouncementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-announcements"
          element={
            <ProtectedRoute requiredRole={['SELLER', 'ADMIN']}>
              <MyAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
