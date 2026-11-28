import { Route, Routes } from 'react-router-dom';
import { ContentProvider } from './content-store.jsx';
import { AuthProvider, RequireAuth } from './auth-store.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Faq from './pages/Faq.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminConsole from './pages/AdminConsole.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Overview from './pages/dashboard/Overview.jsx';
import Orders from './pages/dashboard/Orders.jsx';
import Settings from './pages/dashboard/Settings.jsx';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Shop from './pages/Shop.jsx';
import Checkout from './pages/Checkout.jsx';
import { CartProvider } from './cart-store.jsx';
import CartNotification from './components/CartNotification.jsx';

export default function App() {
  return (
    <ContentProvider>
      <AuthProvider>
        <CartProvider>
        <div className="shell">
          <CartNotification />
          <Nav />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Overview />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <RequireAuth role="admin">
                    <AdminConsole />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<div className="fatal">Page not found.</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
        </CartProvider>
      </AuthProvider>
    </ContentProvider>
  );
}
