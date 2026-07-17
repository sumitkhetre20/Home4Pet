import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

// Context
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';

// Route Wrappers
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetails from './pages/PetDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Favorites from './pages/Favorites';
import MyPets from './pages/MyPets';
import AddEditPet from './pages/AddEditPet';
import Adoptions from './pages/Adoptions';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

// Payment redirect shims for Stripe return URLs
import PaymentRedirect from './components/PaymentRedirect';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAdoptions from './pages/admin/Adoptions';
import AdminPayments from './pages/admin/Payments';

// Scroll Progress Bar Indicator
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Scroll To Top Floating Button
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Page Transition Motion Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ScrollProgress />
      <main className="flex-grow pt-24">{children}</main>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

// Component to handle AnimatePresence keys inside Router context
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/pets" element={<PageTransition><Pets /></PageTransition>} />
        <Route path="/pets/:id" element={<PageTransition><PetDetails /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Protected Adopter/Owner Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageTransition><Profile /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <PageTransition><ChangePassword /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <PageTransition><Favorites /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/my-pets" element={
          <ProtectedRoute>
            <PageTransition><MyPets /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/pets/new" element={
          <ProtectedRoute>
            <PageTransition><AddEditPet /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/pets/:id/edit" element={
          <ProtectedRoute>
            <PageTransition><AddEditPet /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/adoptions" element={
          <ProtectedRoute>
            <PageTransition><Adoptions /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/adoptions/received" element={
          <ProtectedRoute>
            <PageTransition><Adoptions /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <PageTransition><Payments /></PageTransition>
          </ProtectedRoute>
        } />
        {/* Stripe return URL shims */}
        <Route path="/payment/success" element={<ProtectedRoute><PaymentRedirect type="success" /></ProtectedRoute>} />
        <Route path="/payment/cancel"  element={<ProtectedRoute><PaymentRedirect type="cancel"  /></ProtectedRoute>} />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <PageTransition><Notifications /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <PageTransition><Chat /></PageTransition>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <PageTransition><AdminDashboard /></PageTransition>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <PageTransition><AdminUsers /></PageTransition>
          </AdminRoute>
        } />
        <Route path="/admin/adoptions" element={
          <AdminRoute>
            <PageTransition><AdminAdoptions /></PageTransition>
          </AdminRoute>
        } />
        <Route path="/admin/payments" element={
          <AdminRoute>
            <PageTransition><AdminPayments /></PageTransition>
          </AdminRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SyncProvider>
          <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '16px',
              padding: '12px 16px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            }
          }} 
        />
        <Layout>
          <AnimatedRoutes />
        </Layout>
        </SyncProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
