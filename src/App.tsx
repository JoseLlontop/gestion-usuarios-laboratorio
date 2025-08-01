import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { routes } from './routes/index';          // tu generación dinámica de rutas públicas
import LoginPage from './pages/login/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import GestionAdminBecarios from './pages/becario/GestionAdminBecarios';
import PageWrapper from './components/layout/PageWrapper';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Toda la app bajo el mismo layout */}
            <Route path="/" element={<MainLayout />}>
              
              {/* 🚪 Rutas públicas, generadas dinámicamente */}
              {routes}

              {/* 🚪 Ruta de login */}
              <Route path="/login-profesor" element={<LoginPage />} />

              {/* 🔐 Grupo de rutas privadas */}
              <Route element={<PrivateRoute />}>
                <Route
                  path="/gestion-admin-becarios"
                  element={
                    <PageWrapper state="gestionAdminBecario">
                      <GestionAdminBecarios />
                    </PageWrapper>
                  }
                />
              </Route>
            {/* cualquier otra ruta → redirige al Home */}
           <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
