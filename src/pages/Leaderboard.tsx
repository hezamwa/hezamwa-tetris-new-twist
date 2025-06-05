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
  CircularProgress
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types/user';

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
  const [highScores, setHighScores] = useState<UserProfile[]>([]);
  const [mostGames, setMostGames] = useState<UserProfile[]>([]);
  const [highestLevels, setHighestLevels] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const usersRef = collection(db, 'users');

        // Fetch high scores
        const highScoresQuery = query(
          usersRef,
          orderBy('gameStats.highScore', 'desc'),
          limit(10)
        );
        const highScoresSnapshot = await getDocs(highScoresQuery);
        setHighScores(highScoresSnapshot.docs.map(doc => doc.data() as UserProfile));

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

  const renderLeaderboardTable = (data: UserProfile[], valueKey: keyof UserProfile['gameStats']) => {
    if (data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No data available yet. Play some games to see leaderboards!
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
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user, index) => (
              <TableRow key={user.uid}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.avatarUrl} alt={user.fullName} />
                    {user.fullName}
                  </Box>
                </TableCell>
                <TableCell align="right">{user.gameStats[valueKey]}</TableCell>
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
        Leaderboards
      </Typography>
      
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="leaderboard tabs">
            <Tab label="High Scores" />
            <Tab label="Most Games" />
            <Tab label="Highest Level" />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          {renderLeaderboardTable(highScores, 'highScore')}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          {renderLeaderboardTable(mostGames, 'totalGames')}
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          {renderLeaderboardTable(highestLevels, 'highestLevel')}
        </TabPanel>
      </Paper>
    </Container>
  );
}; 