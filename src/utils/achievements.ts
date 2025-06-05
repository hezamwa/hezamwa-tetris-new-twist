import { Achievement, GameState, LineClearStats } from '../types/types';
import { ACHIEVEMENTS } from './constants';
import toast from 'react-hot-toast';

export const checkAchievements = (
  gameState: GameState,
  userAchievements: Achievement[]
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievementTemplate => {
    const userAchievement = userAchievements.find(a => a.id === achievementTemplate.id);
    
    if (userAchievement?.unlocked) return;
    
    let shouldUnlock = false;
    let progress = userAchievement?.progress || 0;
    
    switch (achievementTemplate.id) {
      case 'first_game':
        shouldUnlock = gameState.isGameCompleted || gameState.isGameOver;
        break;
        
      case 'tetris_master':
        shouldUnlock = gameState.lineClearStats.tetrises > 0;
        break;
        
      case 'combo_king':
        progress = Math.max(progress, gameState.combo);
        shouldUnlock = gameState.combo >= 10;
        break;
        
      case 'speed_demon':
        const ppm = calculatePiecesPerMinute(gameState.performance);
        shouldUnlock = ppm >= 60;
        break;
        
      case 'perfect_clear':
        shouldUnlock = gameState.performance.perfectClears > 0;
        break;
        
      case 'level_10':
        progress = Math.max(progress, gameState.level);
        shouldUnlock = gameState.level >= 10;
        break;
        
      case 'marathon_winner':
        shouldUnlock = gameState.gameMode === 'marathon' && gameState.isGameCompleted;
        break;
        
      case 'time_attack_pro':
        if (gameState.gameMode === 'time-attack') {
          progress = Math.max(progress, gameState.score);
          shouldUnlock = gameState.score >= 5000;
        }
        break;
        
      case 'survival_expert':
        if (gameState.gameMode === 'survival') {
          const playTime = (Date.now() - gameState.performance.startTime.getTime()) / 1000;
          progress = Math.max(progress, playTime);
          shouldUnlock = playTime >= 600; // 10 minutes
        }
        break;
        
      case 'line_clearer':
        progress = Math.max(progress, gameState.performance.linesCleared);
        shouldUnlock = gameState.performance.linesCleared >= 100;
        break;
        
      case 'dedication':
        const totalPlayTime = (Date.now() - gameState.performance.startTime.getTime()) / 1000;
        progress = Math.max(progress, totalPlayTime);
        shouldUnlock = totalPlayTime >= 36000; // 10 hours
        break;
        
      case 'hundred_games':
        progress = Math.max(progress, gameState.gamesCompleted);
        shouldUnlock = gameState.gamesCompleted >= 100;
        break;
    }
    
    if (shouldUnlock && !userAchievement?.unlocked) {
      const newAchievement: Achievement = {
        ...achievementTemplate,
        unlocked: true,
        unlockedDate: new Date(),
        progress: achievementTemplate.maxProgress || 1,
      };
      newlyUnlocked.push(newAchievement);
      
      // Show toast notification
      toast.success(
        `🏆 Achievement Unlocked: ${newAchievement.name}!`,
        {
          duration: 4000,
          position: 'top-center',
        }
      );
    } else if (progress > (userAchievement?.progress || 0)) {
      // Update progress for non-unlocked achievements
      const updatedAchievement: Achievement = {
        ...achievementTemplate,
        progress,
        unlocked: false,
      };
      newlyUnlocked.push(updatedAchievement);
    }
  });
  
  return newlyUnlocked;
};

export const calculatePiecesPerMinute = (performance: { startTime: Date; piecesPlaced: number }): number => {
  const playTimeMinutes = (Date.now() - performance.startTime.getTime()) / (1000 * 60);
  return playTimeMinutes > 0 ? performance.piecesPlaced / playTimeMinutes : 0;
};

export const calculateLinesPerMinute = (performance: { startTime: Date; linesCleared: number }): number => {
  const playTimeMinutes = (Date.now() - performance.startTime.getTime()) / (1000 * 60);
  return playTimeMinutes > 0 ? performance.linesCleared / playTimeMinutes : 0;
};

export const calculateEfficiency = (score: number, performance: { startTime: Date }): number => {
  const playTimeMinutes = (Date.now() - performance.startTime.getTime()) / (1000 * 60);
  return playTimeMinutes > 0 ? score / playTimeMinutes : 0;
};

export const getLineClearTypeName = (linesCleared: number, isTSpin: boolean = false): string => {
  if (isTSpin) {
    switch (linesCleared) {
      case 1: return 'T-Spin Single';
      case 2: return 'T-Spin Double';
      case 3: return 'T-Spin Triple';
      default: return 'T-Spin';
    }
  }
  
  switch (linesCleared) {
    case 1: return 'Single';
    case 2: return 'Double';
    case 3: return 'Triple';
    case 4: return 'Tetris';
    default: return '';
  }
};

export const calculateGrade = (stats: LineClearStats): string => {
  const total = stats.singles + stats.doubles + stats.triples + stats.tetrises;
  if (total === 0) return 'F';
  
  const tetrisRatio = stats.tetrises / total;
  const complexRatio = (stats.triples + stats.tetrises) / total;
  
  if (tetrisRatio >= 0.7) return 'S+';
  if (tetrisRatio >= 0.5) return 'S';
  if (tetrisRatio >= 0.3) return 'A';
  if (complexRatio >= 0.5) return 'B';
  if (complexRatio >= 0.3) return 'C';
  return 'D';
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getWeekString = (date: Date): string => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const getMonthString = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${month.toString().padStart(2, '0')}`;
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}; 