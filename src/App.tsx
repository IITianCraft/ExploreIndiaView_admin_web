import ErrorBoundary from '@/components/Common/ErrorBoundary';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layout Components
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import { ThemeProvider } from '@/context/ThemeContext';

// Pages
import ServiceManagementPage from '@/components/Services/ServiceManagementPage';
import AffiliatesPage from '@/pages/Affiliates/AffiliatesPage';
import LoginPage from '@/pages/Auth/LoginPage';
import BookingsPage from '@/pages/Bookings/BookingsPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import PackagesPage from '@/pages/Explore/PackagesPage';
import PartnersPage from '@/pages/Partners/PartnersPage';
import UsersPage from '@/pages/Users/UsersPage';
import UserDetailsPage from '@/pages/Users/UserDetailsPage';
import WalletPage from '@/pages/Wallet/WalletPage';

// Icons for Service Pages
import { Car, Hotel, Plane, Train } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-950 text-white">Loading Auth...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--bg-main)] p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" richColors theme="dark" closeButton />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailsPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/affiliates" element={<AffiliatesPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/wallet" element={<WalletPage />} />

                {/* Service Routes */}
                <Route
                  path="/services/flights"
                  element={
                    <ServiceManagementPage
                      type="flights"
                      title="Flight Bookings"
                      description="Manage and track all flight reservations"
                      icon={<Plane className="text-emerald-500" size={24} />}
                    />
                  }
                />
                <Route
                  path="/services/trains"
                  element={
                    <ServiceManagementPage
                      type="trains"
                      title="Train Bookings"
                      description="Manage and track all train reservations"
                      icon={<Train className="text-emerald-500" size={24} />}
                    />
                  }
                />
                <Route
                  path="/services/hotels"
                  element={
                    <ServiceManagementPage
                      type="hotels"
                      title="Hotel Bookings"
                      description="Manage and track all hotel reservations"
                      icon={<Hotel className="text-emerald-500" size={24} />}
                    />
                  }
                />
                <Route
                  path="/services/cabs"
                  element={
                    <ServiceManagementPage
                      type="cabs"
                      title="Cab Bookings"
                      description="Manage and track all cab reservations"
                      icon={<Car className="text-emerald-500" size={24} />}
                    />
                  }
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
