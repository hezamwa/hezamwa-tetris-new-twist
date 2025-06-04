import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  useTheme
} from '@mui/material';
import {
  SportsEsports,
  EmojiEvents,
  People,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <SportsEsports fontSize="large" />,
      title: 'Modern Tetris',
      description: 'Experience the classic game with a modern twist and improved graphics.'
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: 'Competitive Play',
      description: 'Compete with players worldwide and climb the leaderboard.'
    },
    {
      icon: <People fontSize="large" />,
      title: 'Player Profiles',
      description: 'Create your profile, track your progress, and showcase your achievements.'
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Progressive Difficulty',
      description: 'Face increasing challenges as you advance through levels.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Tetris New Twist
              </Typography>
              <Typography variant="h5" paragraph>
                A modern take on the classic game with competitive features and social elements.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/game')}
                  sx={{ mr: 2 }}
                >
                  Play Now
                </Button>
                {!currentUser && (
                  <Button
                    variant="outlined"
                    size="large"
                    color="inherit"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SportsEsports sx={{ fontSize: 120, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to Play?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join thousands of players and start your journey now!
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate('/game')}
              sx={{
                bgcolor: 'white',
                color: 'secondary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Start Playing
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}; 