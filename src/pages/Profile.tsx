import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';

export const Profile = () => {
  const { userProfile, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!userProfile) {
    return (
      <Container>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    );
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const storageRef = ref(storage, `avatars/${userProfile.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile({ avatarUrl: downloadURL });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    try {
      // Handle Firestore Timestamp
      if (date instanceof Timestamp) {
        return format(date.toDate(), 'PPP');
      }
      // Handle regular Date object
      if (date instanceof Date) {
        return format(date, 'PPP');
      }
      // Handle date string or timestamp number
      return format(new Date(date), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box position="relative" display="inline-block">
              <Avatar
                src={userProfile.avatarUrl}
                alt={userProfile.fullName}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 0,
                  backgroundColor: 'white'
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>
            <Typography variant="h5" gutterBottom>
              {userProfile.fullName}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {userProfile.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Registration Date"
                  secondary={formatDate(userProfile.registrationDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Last Login"
                  secondary={formatDate(userProfile.lastLoginDate)}
                />
              </ListItem>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Game Statistics
              </Typography>
              <ListItem>
                <ListItemText
                  primary="High Score"
                  secondary={userProfile.gameStats.highScore}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Games Played"
                  secondary={userProfile.gameStats.gameCount}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Highest Level"
                  secondary={userProfile.gameStats.highestLevel}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Score"
                  secondary={userProfile.gameStats.totalScore}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Play Time"
                  secondary={formatPlayTime(userProfile.gameStats.totalPlayTime)}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}; 