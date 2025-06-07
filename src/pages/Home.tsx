import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SportsEsports,
  EmojiEvents,
  People,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  console.log('Home component rendering...', { currentUser });

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

  console.log('Home component about to render content...');

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 mb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Tetris New Twist
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                A modern take on the classic game with competitive features and social elements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/game')}
                  className="text-lg px-8 py-3"
                >
                  Play Now
                </Button>
                {!currentUser && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/register')}
                    className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Sign Up
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="h-80 bg-white/10 rounded-lg flex items-center justify-center">
                <SportsEsports sx={{ fontSize: 120, opacity: 0.8 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                <div className="text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground flex-1">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of players and start your journey now!
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/game')}
            className="text-lg px-8 py-3 bg-secondary-foreground text-secondary border-secondary-foreground hover:bg-secondary-foreground/90"
          >
            Start Playing
          </Button>
        </div>
      </div>
    </div>
  );
}; 