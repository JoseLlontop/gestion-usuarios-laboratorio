import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { routes } from './routes/index';          // tu generación dinámica de rutas públicas
import LoginPage from './pages/login/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import GestionAdminBecario from './pages/becario/GestionAdminBecario';
import PageWrapper from './components/layout/PageWrapper';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
                path="/gestion-admin-becario"
                element={
                  <PageWrapper state="gestionAdminBecario">
                    <GestionAdminBecario />
                  </PageWrapper>
                }
              />
            </Route>
            
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
