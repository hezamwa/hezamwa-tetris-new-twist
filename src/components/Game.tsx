import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import TetrisGame from './TetrisGame';

const Game = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!currentUser && !userProfile) {
      navigate('/login');
    }
  }, [currentUser, userProfile, navigate]);

  const handleGameStart = () => {
    setGameStartTime(new Date());
  };

  const handleGameEnd = async (score: number, level: number) => {
    if (!currentUser || !userProfile || !gameStartTime) return;

    const gameEndTime = new Date();
    const playTime = Math.floor((gameEndTime.getTime() - gameStartTime.getTime()) / 1000);

    const userRef = doc(db, 'users', currentUser.uid);
    const updates: any = {
      'gameStats.gameCount': increment(1),
      'gameStats.totalScore': increment(score),
      'gameStats.totalPlayTime': increment(playTime)
    };

    if (score > userProfile.gameStats.highScore) {
      updates['gameStats.highScore'] = score;
    }

    if (level > userProfile.gameStats.highestLevel) {
      updates['gameStats.highestLevel'] = level;
    }

    await updateDoc(userRef, updates);

    // Update local state
    const updatedStats = {
      ...userProfile.gameStats,
      gameCount: userProfile.gameStats.gameCount + 1,
      totalScore: userProfile.gameStats.totalScore + score,
      totalPlayTime: userProfile.gameStats.totalPlayTime + playTime,
      highScore: Math.max(userProfile.gameStats.highScore, score),
      highestLevel: Math.max(userProfile.gameStats.highestLevel, level)
    };

    await updateProfile({
      gameStats: updatedStats
    });
  };

  if (!currentUser || !userProfile) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Please log in to play</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, width: '100%', maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Player Stats
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Typography>High Score: {userProfile.gameStats.highScore}</Typography>
          <Typography>Games Played: {userProfile.gameStats.gameCount}</Typography>
          <Typography>Highest Level: {userProfile.gameStats.highestLevel}</Typography>
          <Typography>
            Total Time: {Math.floor(userProfile.gameStats.totalPlayTime / 3600)}h{' '}
            {Math.floor((userProfile.gameStats.totalPlayTime % 3600) / 60)}m
          </Typography>
        </Box>
      </Paper>
      <TetrisGame
        onGameStart={handleGameStart}
        onGameEnd={handleGameEnd}
      />
    </Box>
  );
};

export default Game; 