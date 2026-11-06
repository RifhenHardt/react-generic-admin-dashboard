import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CategoriesPage from './pages/CategoriesPage';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import ListingsPage from './pages/ListingsPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import RoleHomePage from './pages/RoleHomePage';
import UsersPage from './pages/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LoadingPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <p className="text-sm font-medium text-gray-600">Checking your account…</p>
  </main>
);

const ProtectedPage = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

const AccountRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<ProtectedHome />} />
    <Route path="/events" element={<ProtectedPage roles={['admin']}><EventsPage /></ProtectedPage>} />
    <Route path="/listings" element={<ProtectedPage roles={['admin']}><ListingsPage /></ProtectedPage>} />
    <Route path="/reports" element={<ProtectedPage roles={['admin']}><ReportsPage /></ProtectedPage>} />
    <Route path="/categories" element={<ProtectedPage roles={['admin']}><CategoriesPage /></ProtectedPage>} />
    <Route path="/users" element={<ProtectedPage roles={['admin']}><UsersPage /></ProtectedPage>} />
    <Route path="/orders" element={<ProtectedPage roles={['admin']}><OrdersPage /></ProtectedPage>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const ProtectedHome = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{user.role === 'admin' ? <Dashboard /> : <RoleHomePage user={user} />}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AccountRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
