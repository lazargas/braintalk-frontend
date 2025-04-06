import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from '@remix-run/react';
import { logout } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { setResponse } from '../store/slices/promptSlice';

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  // Get history items from the store
  const { items: historyItems, loading: historyLoading } = useSelector((state: RootState) => state.history);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to load a history item
  const loadHistoryItem = (item: any) => {
    dispatch(setResponse({
      text: item.responseText,
      audioUrl: item.audioUrl,
      duration: item.duration,
      id: item.id,
      promptId: item.promptId,
    }));
    // Close the menu after selecting an item on mobile
    setMenuOpen(false);
  };

  // Format date for history items
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
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
            
            {/* Mobile History Section */}
            <div className="mobile-history-section">
              <h3>History</h3>
              {historyLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading history...</p>
                </div>
              ) : historyItems && historyItems.length > 0 ? (
                <div className="mobile-history-list">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="mobile-history-item"
                      onClick={() => loadHistoryItem(item)}
                    >
                      <div className="history-text">{item.text}</div>
                      <div className="history-meta">
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-history-mobile">
                  <p>No history yet</p>
                  <p className="small-text">Your conversation history will appear here</p>
                </div>
              )}
            </div>
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