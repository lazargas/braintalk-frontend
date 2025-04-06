import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from '@remix-run/react';
import { logout } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="dashboard-header">
      {/* Hamburger menu button - only visible on mobile */}
      <button 
        className="hamburger-menu" 
        onClick={toggleMenu}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="logo-container"
      >
        <Link to="/dashboard" className="logo">
          <h1>Braintalk</h1>
        </Link>
      </motion.div>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className={`menu-overlay ${menuOpen ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          ></motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className={`mobile-menu ${menuOpen ? 'active' : ''}`}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
          >
            <div className="mobile-menu-header">
              <h2>Menu</h2>
              <button 
                className="close-menu" 
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>
            {user && (
              <div className="mobile-user-info">
                <p>Signed in as:</p>
                <p className="user-email">{user.email}</p>
                <button 
                  className="btn btn-logout mobile-logout" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop user info - only visible on desktop */}
      {user && (
        <motion.div
          className="user-info desktop-only"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span>Welcome, {user.email}</span>
          <motion.button 
            className="btn btn-logout" 
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>
      )}
    </header>
  );
}