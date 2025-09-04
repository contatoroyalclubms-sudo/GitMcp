import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Lazy loading das páginas
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Events = React.lazy(() => import('./pages/Events/Events'));
const EventDetail = React.lazy(() => import('./pages/Events/EventDetail'));
const Clients = React.lazy(() => import('./pages/Clients/Clients'));
const Plans = React.lazy(() => import('./pages/Plans/Plans'));
const Reports = React.lazy(() => import('./pages/Reports/Reports'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));

// Loading component
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    height="100vh"
  >
    <CircularProgress />
  </Box>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rota de login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
          } 
        />

        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect para dashboard se autenticado */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Suspense>
  );
}

export default App;
