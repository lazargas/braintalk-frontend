import { useState } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { useAuth } from '../hooks/useAuth';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await login({ email, password });
    if (resultAction.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  return (
    <PageTransition>
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Login to Braintalk</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
          <p className="auth-link">
            Missing an account ? <Link to="/register">Register</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}