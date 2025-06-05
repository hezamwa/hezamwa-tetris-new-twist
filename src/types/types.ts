export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  color: string;
  position: Position;
}

export interface GameHistory {
  grid: string[][];
  score: number;
  level: number;
}

// New types for enhanced scoring and game modes
export type GameMode = 'classic' | 'time-attack' | 'survival' | 'marathon';

export interface LineClearStats {
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
}

export interface ScoreMultiplier {
  current: number;
  streak: number;
  maxStreak: number;
}

export interface GamePerformance {
  startTime: Date;
  endTime?: Date;
  piecesPlaced: number;
  linesCleared: number;
  lineClearStats: LineClearStats;
  maxCombo: number;
  perfectClears: number;
  tSpins: number;
  holdUsed: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface GameState {
  grid: string[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  holdPiece: Tetromino | null;
  canHold: boolean;
  score: number;
  globalScore: number;
  gamesCompleted: number;
  targetScore: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  isGameCompleted: boolean;
  availableColors: string[];
  selectedColors: string[];
  history: GameHistory[];
  gameMode: GameMode;
  timeRemaining?: number; // for time-attack mode
  survivalLevel?: number; // for survival mode
  multiplier: ScoreMultiplier;
  performance: GamePerformance;
  lineClearStats: LineClearStats;
  combo: number;
  backToBack: boolean;
}

export type GameAction = 
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE' }
  | { type: 'ROTATE_COUNTER' }
  | { type: 'HARD_DROP' }
  | { type: 'SOFT_DROP' }
  | { type: 'HOLD' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAME_OVER' }
  | { type: 'NEW_GAME'; mode?: GameMode }
  | { type: 'RESTART_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'UPDATE_COLORS'; colors: string[] }
  | { type: 'TICK_TIME' }; 