import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Timeline,
  EmojiEvents,
  BarChart
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import PerformanceCharts from '../components/PerformanceCharts';
import AchievementPanel from '../components/AchievementPanel';
import { ACHIEVEMENTS } from '../utils/constants';
import { ScoreProgressData, PerformanceData, ComparisonData } from '../types/user';
import { formatTime, calculateGrade } from '../utils/achievements';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

export const Analytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from Firebase
  const [scoreProgressData] = useState<ScoreProgressData[]>([
    { date: '2024-01-01', score: 1200, level: 3, gameMode: 'classic' },
    { date: '2024-01-02', score: 1450, level: 4, gameMode: 'classic' },
    { date: '2024-01-03', score: 2100, level: 6, gameMode: 'time-attack' },
    { date: '2024-01-04', score: 1800, level: 5, gameMode: 'classic' },
    { date: '2024-01-05', score: 2800, level: 8, gameMode: 'marathon' },
    { date: '2024-01-06', score: 3200, level: 9, gameMode: 'survival' },
    { date: '2024-01-07', score: 2900, level: 7, gameMode: 'time-attack' },
  ]);

  const [performanceData] = useState<PerformanceData[]>([
    { date: '2024-01-01', ppm: 45, lpm: 12, efficiency: 180 },
    { date: '2024-01-02', ppm: 52, lpm: 15, efficiency: 220 },
    { date: '2024-01-03', ppm: 68, lpm: 18, efficiency: 315 },
    { date: '2024-01-04', ppm: 58, lpm: 16, efficiency: 280 },
    { date: '2024-01-05', ppm: 72, lpm: 22, efficiency: 380 },
    { date: '2024-01-06', ppm: 85, lpm: 25, efficiency: 420 },
    { date: '2024-01-07', ppm: 78, lpm: 20, efficiency: 390 },
  ]);

  const [comparisonData] = useState<ComparisonData[]>([
    { category: 'Score', userValue: 3200, averageValue: 1800, percentile: 85 },
    { category: 'Speed (PPM)', userValue: 78, averageValue: 45, percentile: 92 },
    { category: 'Efficiency', userValue: 390, averageValue: 200, percentile: 88 },
    { category: 'Lines/Min', userValue: 20, averageValue: 12, percentile: 82 },
    { category: 'Level Reached', userValue: 9, averageValue: 5, percentile: 90 },
  ]);

  const lineClearStats = {
    singles: 45,
    doubles: 32,
    triples: 18,
    tetrises: 12,
  };

  const currentStats = {
    averageScore: 2350,
    averageGameTime: 420, // 7 minutes
    piecesPerMinute: 68.5,
    totalGames: 87,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1">
          Please log in to view your game analytics.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Analytics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Game Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive performance insights and statistics for {currentUser.displayName || currentUser.email}
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {currentStats.averageScore.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">
                  Average Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <Speed />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {currentStats.piecesPerMinute.toFixed(1)}
                </Typography>
                <Typography color="text.secondary">
                  Pieces Per Minute
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {calculateGrade(lineClearStats)}
                </Typography>
                <Typography color="text.secondary">
                  Performance Grade
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <BarChart />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {currentStats.totalGames}
                </Typography>
                <Typography color="text.secondary">
                  Total Games
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Percentiles */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="🎯 Performance Percentiles" 
          subheader="How you compare to other players"
        />
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            {comparisonData.map((item) => (
              <Box key={item.category} sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.percentile}th
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.category}
                </Typography>
                <Chip 
                  label={
                    item.percentile >= 90 ? 'Elite' : 
                    item.percentile >= 75 ? 'Advanced' : 
                    item.percentile >= 50 ? 'Average' : 'Beginner'
                  }
                  color={
                    item.percentile >= 90 ? 'error' : 
                    item.percentile >= 75 ? 'warning' : 
                    item.percentile >= 50 ? 'primary' : 'default'
                  }
                  size="small"
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tabbed Analytics */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Timeline />} label="Performance Charts" {...a11yProps(0)} />
          <Tab icon={<Assessment />} label="Detailed Stats" {...a11yProps(1)} />
          <Tab icon={<EmojiEvents />} label="Achievements" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <PerformanceCharts
            scoreProgressData={scoreProgressData}
            performanceData={performanceData}
            comparisonData={comparisonData}
            lineClearStats={lineClearStats}
            currentStats={currentStats}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Detailed Statistics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card>
                <CardHeader title="📈 Game Statistics" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Games Played:</Typography>
                      <Typography fontWeight="bold">{currentStats.totalGames}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Average Game Duration:</Typography>
                      <Typography fontWeight="bold">{formatTime(currentStats.averageGameTime)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Lines Cleared:</Typography>
                      <Typography fontWeight="bold">
                        {lineClearStats.singles + lineClearStats.doubles + lineClearStats.triples + lineClearStats.tetrises}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tetris Rate:</Typography>
                      <Typography fontWeight="bold">
                        {(lineClearStats.tetrises / (lineClearStats.singles + lineClearStats.doubles + lineClearStats.triples + lineClearStats.tetrises) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="🎯 Line Clear Breakdown" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Singles:</Typography>
                      <Typography fontWeight="bold">{lineClearStats.singles}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Doubles:</Typography>
                      <Typography fontWeight="bold">{lineClearStats.doubles}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Triples:</Typography>
                      <Typography fontWeight="bold">{lineClearStats.triples}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tetrises:</Typography>
                      <Typography fontWeight="bold" color="primary">{lineClearStats.tetrises}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Mode-specific stats would go here */}
            <Card>
              <CardHeader title="🎮 Game Mode Performance" />
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  Detailed game mode statistics will be displayed here, showing performance across Classic, Time Attack, Survival, and Marathon modes.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AchievementPanel achievements={ACHIEVEMENTS} />
        </TabPanel>
      </Paper>
    </Container>
  );
}; 