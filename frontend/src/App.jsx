import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import POSPage from './pages/POSPage';
import CustomersPage from './pages/CustomersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import DebtsPage from './pages/DebtsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><Layout><POSPage /></Layout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Layout><CustomersPage /></Layout></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><Layout><CustomerProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/debts" element={<ProtectedRoute><Layout><DebtsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
