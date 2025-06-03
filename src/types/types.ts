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

export interface GameState {
  grid: string[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
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
}

export type GameAction = 
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAME_OVER' }
  | { type: 'NEW_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'UPDATE_COLORS'; colors: string[] }; 