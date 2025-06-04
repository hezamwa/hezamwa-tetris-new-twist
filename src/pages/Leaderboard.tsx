import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types/user';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaderboard-tabpanel-${index}`}
      aria-labelledby={`leaderboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const Leaderboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [highScores, setHighScores] = useState<UserProfile[]>([]);
  const [mostGames, setMostGames] = useState<UserProfile[]>([]);
  const [highestLevels, setHighestLevels] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
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
        orderBy('gameStats.gameCount', 'desc'),
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
    };

    fetchLeaderboards();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderLeaderboardTable = (data: UserProfile[], valueKey: keyof UserProfile['gameStats']) => (
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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="High Scores" />
            <Tab label="Most Games" />
            <Tab label="Highest Level" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Top 10 High Scores
          </Typography>
          {renderLeaderboardTable(highScores, 'highScore')}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Top 10 Most Games Played
          </Typography>
          {renderLeaderboardTable(mostGames, 'gameCount')}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Top 10 Highest Levels
          </Typography>
          {renderLeaderboardTable(highestLevels, 'highestLevel')}
        </TabPanel>
      </Paper>
    </Container>
  );
}; 