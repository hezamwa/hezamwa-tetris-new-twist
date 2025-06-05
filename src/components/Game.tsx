import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import TetrisGame from './TetrisGame';

const Game = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser && !userProfile) {
      navigate('/login');
    }
  }, [currentUser, userProfile, navigate]);

  const handleGameStart = () => {
    const startTime = new Date();
    const gameId = `${currentUser?.uid}_${startTime.getTime()}`;
    setGameStartTime(startTime);
    setCurrentGameId(gameId);
    console.log('Game started at:', startTime);
  };

  const handleGameEnd = async (score: number, level: number) => {
    if (!currentUser || !userProfile || !gameStartTime || !currentGameId) {
      console.log('Missing required data for game end:', { 
        currentUser: !!currentUser, 
        userProfile: !!userProfile, 
        gameStartTime: !!gameStartTime,
        currentGameId: !!currentGameId
      });
      return;
    }

    const gameEndTime = new Date();
    const playTime = Math.floor((gameEndTime.getTime() - gameStartTime.getTime()) / 1000);

    console.log('Game ended:', {
      score,
      level,
      playTime,
      gameStartTime,
      gameEndTime
    });

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updates: any = {
        'gameStats.gameCount': increment(1),
        'gameStats.totalScore': increment(score),
        'gameStats.totalPlayTime': increment(playTime)
      };

      // Only update high score if this score is higher
      if (score > userProfile.gameStats.highScore) {
        updates['gameStats.highScore'] = score;
      }

      // Only update highest level if this level is higher
      if (level > userProfile.gameStats.highestLevel) {
        updates['gameStats.highestLevel'] = level;
      }

      await updateDoc(userRef, updates);
      console.log('Game stats updated successfully');

      // Reset game tracking
      setGameStartTime(null);
      setCurrentGameId(null);

    } catch (error) {
      console.error('Error updating game stats:', error);
    }
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
        {gameStartTime && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              Game in progress... Started at {gameStartTime.toLocaleTimeString()}
            </Typography>
          </Box>
        )}
      </Paper>
      <TetrisGame
        onGameStart={handleGameStart}
        onGameEnd={handleGameEnd}
      />
    </Box>
  );
};

export default Game; 