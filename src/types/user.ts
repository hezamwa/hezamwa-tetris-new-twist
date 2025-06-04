import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  registrationDate: Timestamp;
  lastLoginDate: Timestamp;
  gameStats: {
    highScore: number;
    gameCount: number;
    highestLevel: number;
    totalScore: number;
    totalPlayTime: number; // in seconds
  };
}

export interface UserGameSession {
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  level: number;
  completed: boolean;
} 