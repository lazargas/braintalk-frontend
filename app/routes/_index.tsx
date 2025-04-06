import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';

export default function Index() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    setDebugInfo(`Auth token: ${token ? 'Present' : 'Not present'}`);
    
    // Add a small delay before redirecting
    const timer = setTimeout(() => {
      if (token) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [token, navigate]);

  return (
    <div className="loading-container">
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Braintalk
      </motion.h1>
      <p style={{ marginTop: '20px', color: '#666' }}>{debugInfo}</p>
    </div>
  );
}