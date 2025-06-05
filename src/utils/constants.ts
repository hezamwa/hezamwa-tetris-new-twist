import { TetrominoType, Achievement, GameMode } from '../types/types';

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const INITIAL_SPEED = 1000;

export const TETROMINOS: Record<TetrominoType, number[][]> = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'O': [
    [1, 1],
    [1, 1]
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

export const DEFAULT_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500'  // Orange
];

// Enhanced scoring system
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  PERFECT_CLEAR: 3000,
  SOFT_DROP: 1,
  HARD_DROP: 2,
  COMBO_BASE: 50,
  BACK_TO_BACK_BONUS: 1.5,
};

// Multiplier system
export const MULTIPLIERS = {
  LEVEL_BONUS: 0.1, // 10% bonus per level
  COMBO_MULTIPLIER: 0.2, // 20% bonus per combo level
  STREAK_MULTIPLIER: 0.1, // 10% bonus per streak
  SPEED_BONUS: 0.05, // 5% bonus for fast play
  TIME_ATTACK_MULTIPLIER: 2, // 2x score in time attack
  SURVIVAL_MULTIPLIER: 1.5, // 1.5x score in survival
};

// Game mode settings
export const GAME_MODE_SETTINGS: Record<GameMode, {
  name: string;
  description: string;
  timeLimit?: number; // in seconds
  targetScore?: number;
  difficultyProgression: boolean;
}> = {
  classic: {
    name: 'Classic',
    description: 'Traditional Tetris gameplay',
    targetScore: 1000,
    difficultyProgression: true,
  },
  'time-attack': {
    name: 'Time Attack',
    description: 'Score as much as possible in limited time',
    timeLimit: 120, // 2 minutes
    difficultyProgression: false,
  },
  survival: {
    name: 'Survival',
    description: 'Survive as long as possible with increasing speed',
    difficultyProgression: true,
  },
  marathon: {
    name: 'Marathon',
    description: 'Endurance mode with high target score',
    targetScore: 10000,
    difficultyProgression: true,
  },
};

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    unlocked: false,
  },
  {
    id: 'tetris_master',
    name: 'Tetris Master',
    description: 'Clear 4 lines at once (Tetris)',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Achieve a 10x combo',
    icon: '⚡',
    unlocked: false,
    maxProgress: 10,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Achieve 60+ pieces per minute',
    icon: '💨',
    unlocked: false,
  },
  {
    id: 'perfect_clear',
    name: 'Perfect Clear',
    description: 'Clear the entire board',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    unlocked: false,
    maxProgress: 10,
  },
  {
    id: 'marathon_winner',
    name: 'Marathon Champion',
    description: 'Complete Marathon mode',
    icon: '🏃',
    unlocked: false,
  },
  {
    id: 'time_attack_pro',
    name: 'Time Attack Pro',
    description: 'Score 5000+ in Time Attack',
    icon: '⏱️',
    unlocked: false,
    maxProgress: 5000,
  },
  {
    id: 'survival_expert',
    name: 'Survival Expert',
    description: 'Survive 10 minutes in Survival mode',
    icon: '🛡️',
    unlocked: false,
    maxProgress: 600, // 10 minutes in seconds
  },
  {
    id: 'line_clearer',
    name: 'Line Clearer',
    description: 'Clear 100 lines total',
    icon: '📏',
    unlocked: false,
    maxProgress: 100,
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Play for 10 hours total',
    icon: '⏰',
    unlocked: false,
    maxProgress: 36000, // 10 hours in seconds
  },
  {
    id: 'hundred_games',
    name: 'Centurion',
    description: 'Play 100 games',
    icon: '💯',
    unlocked: false,
    maxProgress: 100,
  },
];

// Scoring calculation helpers
export const calculateScore = (
  linesCleared: number,
  level: number,
  isTSpin: boolean = false,
  isBackToBack: boolean = false,
  combo: number = 0,
  isPerfectClear: boolean = false
): number => {
  let baseScore = 0;

  if (isPerfectClear) {
    return POINTS.PERFECT_CLEAR * (1 + level * MULTIPLIERS.LEVEL_BONUS);
  }

  switch (linesCleared) {
    case 1:
      baseScore = isTSpin ? POINTS.T_SPIN_SINGLE : POINTS.SINGLE;
      break;
    case 2:
      baseScore = isTSpin ? POINTS.T_SPIN_DOUBLE : POINTS.DOUBLE;
      break;
    case 3:
      baseScore = isTSpin ? POINTS.T_SPIN_TRIPLE : POINTS.TRIPLE;
      break;
    case 4:
      baseScore = POINTS.TETRIS;
      break;
    default:
      return 0;
  }

  // Apply level bonus
  baseScore *= (1 + level * MULTIPLIERS.LEVEL_BONUS);

  // Apply back-to-back bonus
  if (isBackToBack && (linesCleared === 4 || isTSpin)) {
    baseScore *= POINTS.BACK_TO_BACK_BONUS;
  }

  // Apply combo bonus
  if (combo > 0) {
    baseScore += POINTS.COMBO_BASE * combo * (1 + level * MULTIPLIERS.LEVEL_BONUS);
  }

  return Math.floor(baseScore);
}; 