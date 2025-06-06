import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  Divider,
  SvgIcon
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { checkBrowserCompatibility, getAuthErrorMessage } from '../utils/authDebug';
import { AuthDebug } from '../components/AuthDebug';

// Custom Microsoft Icon Component
const MicrosoftIcon = () => (
  <SvgIcon>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
    </svg>
  </SvgIcon>
);

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState<Error | null>(null);
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();

  // Show debug component in development mode only
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Check browser compatibility on component mount
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.isCompatible) {
      setWarning(`Browser compatibility issues detected: ${compatibility.issues.join(', ')}`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setAuthError(null);
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/profile');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setAuthError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setAuthError(null);
      setLoading(true);
      await loginWithGoogle();
      navigate('/profile');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setAuthError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setError('');
      setAuthError(null);
      setLoading(true);
      await loginWithMicrosoft();
      navigate('/profile');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setAuthError(err);
      console.error('Microsoft auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        {warning && <Alert severity="warning" sx={{ mb: 2 }}>{warning}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign in with Google
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            startIcon={<MicrosoftIcon />}
            onClick={handleMicrosoftSignIn}
            disabled={loading}
          >
            Sign in with Microsoft
          </Button>
        </Box>

        <Box sx={{ my: 3 }}>
          <Divider>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              OR
            </Typography>
          </Divider>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            Login
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register here
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* Debug component for development */}
      <AuthDebug 
        error={authError} 
        isVisible={isDevelopment && !!authError} 
      />
    </Container>
  );
}; 