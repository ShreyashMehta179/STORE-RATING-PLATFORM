import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/common/Sidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SkeletonLoader } from './components/common/SkeletonLoader';
import { Toaster } from 'sonner';
import { Role } from './types';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { HowItWorksPage } from './pages/how/HowItWorksPage';
import { AboutPage } from './pages/about/AboutPage';


// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { AdminRatingsPage } from './pages/admin/AdminRatingsPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { StoreDiscoveryPage } from './pages/user/StoreDiscoveryPage';
import { StoreDetailsPage } from './pages/user/StoreDetailsPage';
import { UserFavoritesPage } from './pages/user/UserFavoritesPage';
import { UserRatingsPage } from './pages/user/UserRatingsPage';
import { UserProfilePage } from './pages/user/UserProfilePage';

// Owner Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { OwnerStorePage } from './pages/owner/OwnerStorePage';
import { OwnerCustomersPage } from './pages/owner/OwnerCustomersPage';

// Public Layout Component with Navbar and Footer
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Protected Route Component with Role Checks
const ProtectedLayout: React.FC<{ allowedRoles?: Role[] }> = ({ allowedRoles }) => {
  const { user, isLoading, hasRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to proper role dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Toaster position="top-right" richColors closeButton />
            <Routes>
              {/* Standalone Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />


              {/* Public Pages with Shared Layout */}
              <Route element={<PublicLayout />}>
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/stores/:id" element={<StoreDetailsPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/stores" element={<AdminStoresPage />} />
                <Route path="/admin/ratings" element={<AdminRatingsPage />} />
                <Route path="/admin/activity" element={<AdminActivityPage />} />
              </Route>

              {/* Normal User Protected Routes */}
              <Route element={<ProtectedLayout allowedRoles={['USER', 'ADMIN']} />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/stores" element={<StoreDiscoveryPage />} />
                <Route path="/user/stores/:id" element={<StoreDetailsPage />} />
                <Route path="/user/favorites" element={<UserFavoritesPage />} />
                <Route path="/user/ratings" element={<UserRatingsPage />} />
                <Route path="/user/profile" element={<UserProfilePage />} />
              </Route>

              {/* Store Owner Protected Routes */}
              <Route element={<ProtectedLayout allowedRoles={['STORE_OWNER', 'ADMIN']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/store" element={<OwnerStorePage />} />
                <Route path="/owner/customers" element={<OwnerCustomersPage />} />
              </Route>

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
