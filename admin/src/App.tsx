import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inquiries from './pages/Inquiries';
import Sliders from './pages/Sliders';
import Blogs from './pages/Blogs';
import Dashboard from './pages/Dashboard';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import Rankings from './pages/Rankings';
import AdminLogin from './pages/Login';
import { Toaster } from 'sonner';

// Secure Private Route Guard
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="sliders" element={<Sliders />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
