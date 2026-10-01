import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './types';
import ChatBot from './components/ui/ChatBot';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

// Customer pages
import CustomerLayout from './components/layout/CustomerLayout';
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import NotificationsPage from './pages/customer/NotificationsPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import ProfilePage from './pages/customer/ProfilePage';

// Staff pages
import StaffLayout from './components/layout/StaffLayout';
import KitchenQueuePage from './pages/staff/KitchenQueuePage';
import TokenVerificationPage from './pages/staff/TokenVerificationPage';
import StaffOrderDetailPage from './pages/staff/StaffOrderDetailPage';

// Manager pages
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import MenuManagementPage from './pages/manager/MenuManagementPage';
import PickupSlotsPage from './pages/manager/PickupSlotsPage';
import AnalyticsPage from './pages/manager/AnalyticsPage';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import SystemLogsPage from './pages/admin/SystemLogsPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';

// ---- Route Guards -------------------------------------------------------
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function RoleRouter() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/queue" replace />;
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/home" replace />;
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-beige flex items-center justify-center">
      <div className="card text-center max-w-md">
        <h1 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h1>
        <p className="text-charcoal-400 mb-4">You don't have permission to view this page.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#171717',
            color: '#F5E8D0',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#4F9D8A', secondary: '#F5E8D0' } },
          error: { iconTheme: { primary: '#C94720', secondary: '#F5E8D0' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RequireAuth><RoleRouter /></RequireAuth>} />

        {/* ---- CUSTOMER ---- */}
        <Route path="/" element={<RequireRole roles={['customer']}><CustomerLayout /></RequireRole>}>
          <Route path="home" element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="track/:orderId" element={<OrderTrackingPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ---- STAFF ---- */}
        <Route path="/staff" element={<RequireRole roles={['staff', 'manager', 'admin']}><StaffLayout /></RequireRole>}>
          <Route path="queue" element={<KitchenQueuePage />} />
          <Route path="verify" element={<TokenVerificationPage />} />
          <Route path="order/:orderId" element={<StaffOrderDetailPage />} />
        </Route>

        {/* ---- MANAGER ---- */}
        <Route path="/manager" element={<RequireRole roles={['manager', 'admin']}><ManagerLayout /></RequireRole>}>
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="slots" element={<PickupSlotsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* ---- ADMIN ---- */}
        <Route path="/admin" element={<RequireRole roles={['admin']}><AdminLayout /></RequireRole>}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="logs" element={<SystemLogsPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ── Global AI Assistant — visible on every page ── */}
      <ChatBot />
    </BrowserRouter>
  );
}
