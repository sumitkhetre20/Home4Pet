import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, Heart, MessageCircle, User, LogOut, 
  ChevronDown, Sun, Moon, ShieldAlert, PawPrint, Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../api/services';
import { useSync } from '../context/SyncContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const profileMenuRef = useRef(null);
  const { syncVersion } = useSync();

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch unread notifications count
  useEffect(() => {
    let active = true;
    const fetchUnread = async () => {
      if (isAuthenticated) {
        try {
          const res = await notificationService.getUnreadCount();
          if (active && res && typeof res.data === 'number') {
            setUnreadNotifications(res.data);
          }
        } catch (err) {
          console.warn('Could not retrieve notification count.');
        }
      }
    };

    fetchUnread();

    // Poll every 4s; also re-runs immediately on sync changes
    const interval = setInterval(fetchUnread, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname, syncVersion]); // syncVersion triggers instant refresh

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const activeClass = "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold";
  const inactiveClass = "text-slate-600 hover:bg-slate-100/50 hover:text-primary dark:text-slate-350 dark:hover:bg-slate-800/50 dark:hover:text-primary-light font-medium";

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto glass-nav rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/30 transition-all duration-350">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <PawPrint size={20} className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-750 dark:from-white dark:to-slate-300">
                Home<span className="text-primary font-black">4</span>Pet
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/pets" className={({ active }) => `${active ? activeClass : inactiveClass} px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-sm`}>
                Browse Pets
              </NavLink>
              <NavLink to="/chat" className={({ active }) => `${active ? activeClass : inactiveClass} px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-sm`}>
                <MessageCircle size={15} />
                AI Assistant
              </NavLink>
              
              {isAuthenticated && (
                <>
                  <NavLink to="/favorites" className={({ active }) => `${active ? activeClass : inactiveClass} px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-sm`}>
                    <Heart size={15} />
                    Favorites
                  </NavLink>
                  <NavLink to="/notifications" className={({ active }) => `relative ${active ? activeClass : inactiveClass} px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-sm`}>
                    <Bell size={15} />
                    Notifications
                    <AnimatePresence>
                      {unreadNotifications > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-0.5 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white bg-red-500 rounded-full shadow-sm"
                        >
                          {unreadNotifications}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </>
              )}
            </div>

            {/* Desktop Right Hand Control Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Dark Mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all duration-300"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {isAuthenticated ? (
                /* User Profile Dropdown container */
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-xs shadow-inner uppercase">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 max-w-[80px] truncate">
                      {user?.firstName}
                    </span>
                    <ChevronDown size={12} className={`text-slate-400 transform transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50 text-sm flex flex-col space-y-0.5"
                      >
                        {hasRole('ADMIN') && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                          >
                            <ShieldAlert size={16} className="text-red-500" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                        >
                          <User size={16} />
                          <span>Profile Settings</span>
                        </Link>
                        
                        {(hasRole('OWNER') || hasRole('SHELTER') || hasRole('NGO') || hasRole('ADMIN')) && (
                          <>
                            <Link
                              to="/my-pets"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                            >
                              <PawPrint size={16} />
                              <span>My Pets</span>
                            </Link>
                            <Link
                              to="/adoptions/received"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                            >
                              <Landmark size={16} />
                              <span>Received Requests</span>
                            </Link>
                          </>
                        )}

                        <Link
                          to="/adoptions"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                        >
                          <Landmark size={16} />
                          <span>Adoption Requests</span>
                        </Link>
                        <Link
                          to="/payments"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/80 dark:hover:text-primary-light text-slate-750 dark:text-slate-300 font-medium"
                        >
                          <Landmark size={16} />
                          <span>Payments Ledger</span>
                        </Link>
                        <hr className="border-slate-200 dark:border-slate-800 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2.5 p-3 rounded-xl hover:bg-red-500/10 text-red-650 dark:text-red-400 font-semibold w-full text-left"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger menu toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all duration-300"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation drawer menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden rounded-b-2xl"
            >
              <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col">
                <NavLink 
                  to="/pets" 
                  className={({ active }) => `p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold ${active ? 'text-primary' : 'text-slate-655 dark:text-slate-300'}`}
                >
                  Browse Pets
                </NavLink>
                <NavLink 
                  to="/chat" 
                  className={({ active }) => `p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2 ${active ? 'text-primary' : 'text-slate-655 dark:text-slate-300'}`}
                >
                  <MessageCircle size={16} />
                  AI Assistant
                </NavLink>

                {isAuthenticated ? (
                  <>
                    <NavLink 
                      to="/favorites" 
                      className={({ active }) => `p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2 ${active ? 'text-primary' : 'text-slate-655 dark:text-slate-300'}`}
                    >
                      <Heart size={16} />
                      Favorites
                    </NavLink>
                    <NavLink 
                      to="/notifications" 
                      className={({ active }) => `p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2 ${active ? 'text-primary' : 'text-slate-655 dark:text-slate-300'}`}
                    >
                      <Bell size={16} />
                      Notifications ({unreadNotifications})
                    </NavLink>
                    <hr className="border-slate-100 dark:border-slate-850" />
                    
                    {hasRole('ADMIN') && (
                      <NavLink 
                        to="/admin/dashboard" 
                        className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-red-500 flex items-center gap-2"
                      >
                        <ShieldAlert size={16} />
                        Admin Panel
                      </NavLink>
                    )}

                    <NavLink 
                      to="/profile" 
                      className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2"
                    >
                      <User size={16} />
                      Profile Settings
                    </NavLink>

                    {(hasRole('OWNER') || hasRole('SHELTER') || hasRole('NGO') || hasRole('ADMIN')) && (
                      <>
                        <NavLink 
                          to="/my-pets" 
                          className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2"
                        >
                          <PawPrint size={16} />
                          My Pets
                        </NavLink>
                        <NavLink 
                          to="/adoptions/received" 
                          className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2"
                        >
                          <Landmark size={16} />
                          Received Requests
                        </NavLink>
                      </>
                    )}

                    <NavLink 
                      to="/adoptions" 
                      className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2"
                    >
                      <Landmark size={16} />
                      Adoption Requests
                    </NavLink>

                    <NavLink 
                      to="/payments" 
                      className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold flex items-center gap-2"
                    >
                      <Landmark size={16} />
                      Payments Ledger
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-3 rounded-xl hover:bg-red-500/10 font-bold text-red-500 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link
                      to="/login"
                      className="w-full text-center py-3 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-md shadow-primary/20"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
