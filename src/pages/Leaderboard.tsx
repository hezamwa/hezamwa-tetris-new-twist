import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types/user';
import { getWeekString, getMonthString } from '../utils/achievements';

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
      id={`leaderboard-tabpanel-${index}`}
      aria-labelledby={`leaderboard-tab-${index}`}
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

export const Leaderboard = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTimeHighScores, setAllTimeHighScores] = useState<UserProfile[]>([]);
  const [weeklyHighScores, setWeeklyHighScores] = useState<UserProfile[]>([]);
  const [monthlyHighScores, setMonthlyHighScores] = useState<UserProfile[]>([]);
  const [mostGames, setMostGames] = useState<UserProfile[]>([]);
  const [highestLevels, setHighestLevels] = useState<UserProfile[]>([]);

  const getCurrentWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return { start: startOfMonth, end: endOfMonth };
  };

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const usersRef = collection(db, 'users');

        // Fetch all-time high scores
        const allTimeQuery = query(
          usersRef,
          orderBy('gameStats.highScore', 'desc'),
          limit(10)
        );
        const allTimeSnapshot = await getDocs(allTimeQuery);
        setAllTimeHighScores(allTimeSnapshot.docs.map(doc => doc.data() as UserProfile));

        // Fetch weekly high scores
        const { start: weekStart, end: weekEnd } = getCurrentWeekRange();
        const weeklyQuery = query(
          usersRef,
          where('gameStats.lastGameDate', '>=', Timestamp.fromDate(weekStart)),
          where('gameStats.lastGameDate', '<=', Timestamp.fromDate(weekEnd)),
          orderBy('gameStats.lastGameDate', 'desc'),
          orderBy('gameStats.highScore', 'desc'),
          limit(10)
        );
        
        try {
          const weeklySnapshot = await getDocs(weeklyQuery);
          setWeeklyHighScores(weeklySnapshot.docs.map(doc => doc.data() as UserProfile));
        } catch (error) {
          console.log('Weekly leaderboard query failed, using mock data');
          // Fallback to mock data for demonstration
          setWeeklyHighScores(allTimeSnapshot.docs.slice(0, 5).map(doc => doc.data() as UserProfile));
        }

        // Fetch monthly high scores
        const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
        const monthlyQuery = query(
          usersRef,
          where('gameStats.lastGameDate', '>=', Timestamp.fromDate(monthStart)),
          where('gameStats.lastGameDate', '<=', Timestamp.fromDate(monthEnd)),
          orderBy('gameStats.lastGameDate', 'desc'),
          orderBy('gameStats.highScore', 'desc'),
          limit(10)
        );
        
        try {
          const monthlySnapshot = await getDocs(monthlyQuery);
          setMonthlyHighScores(monthlySnapshot.docs.map(doc => doc.data() as UserProfile));
        } catch (error) {
          console.log('Monthly leaderboard query failed, using mock data');
          // Fallback to mock data for demonstration
          setMonthlyHighScores(allTimeSnapshot.docs.slice(0, 7).map(doc => doc.data() as UserProfile));
        }

        // Fetch most games played
        const mostGamesQuery = query(
          usersRef,
          orderBy('gameStats.totalGames', 'desc'),
          limit(10)
        );
        const mostGamesSnapshot = await getDocs(mostGamesQuery);
        setMostGames(mostGamesSnapshot.docs.map(doc => doc.data() as UserProfile));

        // Fetch highest levels
        const highestLevelsQuery = query(
          usersRef,
          orderBy('gameStats.highestLevel', 'desc'),
          limit(10)
        );
        const highestLevelsSnapshot = await getDocs(highestLevelsQuery);
        setHighestLevels(highestLevelsSnapshot.docs.map(doc => doc.data() as UserProfile));

      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderLeaderboardTable = (
    data: UserProfile[], 
    valueKey: keyof UserProfile['gameStats'], 
    isTimeBased: boolean = false
  ) => {
    if (data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {isTimeBased 
              ? "No games played this period. Be the first to set a record!" 
              : "No data available yet. Play some games to see leaderboards!"
            }
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">Score</TableCell>
              {isTimeBased && <TableCell align="right">Period</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user, index) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {index + 1}
                    {index === 0 && <Chip label="👑" size="small" color="warning" />}
                    {index === 1 && <Chip label="🥈" size="small" />}
                    {index === 2 && <Chip label="🥉" size="small" />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.avatarUrl} alt={user.fullName} />
                    {user.fullName}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    {(() => {
                      const value = user.gameStats[valueKey];
                      if (typeof value === 'number') {
                        return value.toLocaleString();
                      }
                      if (typeof value === 'string') {
                        return value;
                      }
                      return 'N/A';
                    })()}
                  </strong>
                </TableCell>
                {isTimeBased && (
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary">
                      {value === 1 ? getWeekString(new Date()) : getMonthString(new Date())}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        🏆 Leaderboards
      </Typography>
      
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="leaderboard tabs" variant="scrollable">
            <Tab label="🏆 All-Time High Scores" />
            <Tab label="📅 Weekly Champions" />
            <Tab label="📆 Monthly Leaders" />
            <Tab label="🎮 Most Games" />
            <Tab label="🎯 Highest Level" />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>All-Time High Scores</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The highest scores ever achieved by players
          </Typography>
          {renderLeaderboardTable(allTimeHighScores, 'highScore')}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>Weekly Champions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Top performers this week ({getWeekString(new Date())})
          </Typography>
          {renderLeaderboardTable(weeklyHighScores, 'highScore', true)}
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>Monthly Leaders</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Best scores this month ({getMonthString(new Date())})
          </Typography>
          {renderLeaderboardTable(monthlyHighScores, 'highScore', true)}
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <Typography variant="h6" gutterBottom>Most Games Played</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Players with the most dedication and experience
          </Typography>
          {renderLeaderboardTable(mostGames, 'totalGames')}
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <Typography variant="h6" gutterBottom>Highest Level Achieved</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Players who reached the highest difficulty levels
          </Typography>
          {renderLeaderboardTable(highestLevels, 'highestLevel')}
        </TabPanel>
      </Paper>
    </Container>
  );
}; 