import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { RemitosPage } from './pages/RemitosPage';
import RemitoDetallePage from './pages/RemitoDetallePage';
import NuevoRemitoPage from './pages/NuevoRemitoPage';

export const App: React.FC = () => {
  const cargarSesion = useAuthStore((state) => state.cargarSesion);

  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas del Panel */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/remitos" replace />} />
          <Route path="/remitos" element={<RemitosPage />} />
          <Route path="/remitos/nuevo" element={<NuevoRemitoPage />} />
          <Route path="/remitos/:numero" element={<RemitoDetallePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;