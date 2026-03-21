import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import theme from './styles/theme';
import './styles/GlobalStyles.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import DemandeAcces from './pages/DemandeAcces';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RecteurDashboard from './pages/dashboards/RecteurDashboard';
import DirecteurDashboard from './pages/dashboards/DirecteurDashboard';
import EnseignantDashboard from './pages/dashboards/EnseignantDashboard';
import EtudiantDashboard from './pages/dashboards/EtudiantDashboard';
import UserManagement from './pages/UserManagement';
import GestionDemandesAcces from './pages/GestionDemandesAcces';
import ArchivedUsers from './pages/ArchivedUsers';
import AuditHistory from './pages/AuditHistory';

// Composant pour rediriger vers le bon dashboard selon le rôle
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role?.toLowerCase() || 'admin';
  return <Navigate to={`/dashboard/${role}`} replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demande-acces" element={<DemandeAcces />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected Routes - Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users/:userType" element={<UserManagement />} />
            <Route path="admin/archived-users" element={<ArchivedUsers />} />
            <Route path="admin/audit-history" element={<AuditHistory />} />
            <Route path="admin/demandes-acces" element={<GestionDemandesAcces />} />
            <Route path="recteur" element={<RecteurDashboard />} />
            <Route path="directeur" element={<DirecteurDashboard />} />
            <Route path="enseignant" element={<EnseignantDashboard />} />
            <Route path="etudiant" element={<EtudiantDashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
