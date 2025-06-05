import { Timestamp } from 'firebase/firestore';
import { GameMode, LineClearStats, Achievement } from './types';

export interface DetailedGameStats {
  totalGames: number;
  totalScore: number;
  totalPlayTime: number; // in seconds
  highScore: number;
  highestLevel: number;
  averageGameTime: number;
  averageScore: number;
  piecesPerMinute: number;
  totalLinesCleared: number;
  lineClearStats: LineClearStats;
  maxCombo: number;
  perfectClears: number;
  tSpins: number;
  achievements: Achievement[];
  lastGameDate?: Timestamp; // Track when the last game was played for time-based leaderboards
  // Mode-specific stats
  modeStats: {
    [key in GameMode]: {
      games: number;
      bestScore: number;
      bestTime?: number;
      totalPlayTime: number;
    };
  };
}

export interface WeeklyStats {
  week: string; // ISO week string (e.g., "2024-W01")
  gamesPlayed: number;
  totalScore: number;
  totalPlayTime: number;
  averageScore: number;
}

export interface MonthlyStats {
  month: string; // ISO month string (e.g., "2024-01")
  gamesPlayed: number;
  totalScore: number;
  totalPlayTime: number;
  averageScore: number;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  score: number;
  level: number;
  linesCleared: number;
  lineClearStats: LineClearStats;
  gameMode: GameMode;
  completed: boolean;
  piecesPlaced: number;
  maxCombo: number;
  playTime: number; // in seconds
  achievements?: string[]; // achievement IDs unlocked in this session
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  registrationDate: Timestamp;
  lastLoginDate: Timestamp;
  gameStats: DetailedGameStats;
  recentSessions: GameSession[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  preferences: {
    defaultGameMode: GameMode;
    soundEnabled: boolean;
    showGhost: boolean;
    autoRepeat: boolean;
  };
}

export interface LeaderboardEntry {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  score: number;
  level?: number;
  gameMode?: GameMode;
  date: Timestamp;
}

// Chart data interfaces
export interface ScoreProgressData {
  date: string;
  score: number;
  level: number;
  gameMode: GameMode;
}

export interface PerformanceData {
  date: string;
  ppm: number; // pieces per minute
  lpm: number; // lines per minute
  efficiency: number; // score per minute
}

export interface ComparisonData {
  category: string;
  userValue: number;
  averageValue: number;
  percentile: number;
}

export interface UserGameSession {
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  level: number;
  completed: boolean;
} 