import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, Tetromino, TetrominoType, GameHistory, GameMode, LineClearStats, ScoreMultiplier, GamePerformance } from '../types/types';
import { GRID_WIDTH, GRID_HEIGHT, TETROMINOS, INITIAL_SPEED, DEFAULT_COLORS, calculateScore, GAME_MODE_SETTINGS, MULTIPLIERS } from '../utils/constants';

const createEmptyGrid = () => 
  Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(''));

const createRandomTetromino = (colors: string[]): Tetromino => {
  const tetrominoTypes = Object.keys(TETROMINOS) as TetrominoType[];
  const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return {
    shape: [...TETROMINOS[randomType]], // Create a deep copy of the shape
    color: randomColor,
    position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 }
  };
};

const isValidMove = (grid: string[][], piece: Tetromino): boolean => {
  return piece.shape.every((row, dy) =>
    row.every((cell, dx) => {
      if (cell === 0) return true;
      const newX = piece.position.x + dx;
      const newY = piece.position.y + dy;
      return (
        newX >= 0 &&
        newX < GRID_WIDTH &&
        newY >= 0 &&
        newY < GRID_HEIGHT &&
        grid[newY][newX] === ''
      );
    })
  );
};

const mergeTetrominoWithGrid = (grid: string[][], piece: Tetromino): string[][] => {
  const newGrid = grid.map(row => [...row]);
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        const gridY = piece.position.y + y;
        const gridX = piece.position.x + x;
        if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
          newGrid[gridY][gridX] = piece.color;
        }
      }
    });
  });
  return newGrid;
};

const checkLines = (grid: string[][]): { newGrid: string[][], linesCleared: number, clearedRows: number[] } => {
  const clearedRows: number[] = [];
  let linesCleared = 0;
  
  const newGrid = grid.filter((row, index) => {
    const isLineFull = row.every(cell => cell !== '');
    if (isLineFull) {
      linesCleared++;
      clearedRows.push(index);
    }
    return !isLineFull;
  });

  while (newGrid.length < GRID_HEIGHT) {
    newGrid.unshift(Array(GRID_WIDTH).fill(''));
  }

  return { newGrid, linesCleared, clearedRows };
};

const isPerfectClear = (grid: string[][]): boolean => {
  return grid.every(row => row.every(cell => cell === ''));
};

const isTSpin = (grid: string[][], piece: Tetromino, lastAction: string): boolean => {
  // Simple T-spin detection - piece is T and was just rotated
  if (piece.shape.length !== 3 || lastAction !== 'ROTATE') return false;
  
  // Check if T-piece is in a confined space (basic T-spin detection)
  const { x, y } = piece.position;
  let blockedCorners = 0;
  
  // Check the four corners around the T-piece center
  const corners = [
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
  ];
  
  corners.forEach(({ dx, dy }) => {
    const checkX = x + 1 + dx; // +1 because T-piece center is at [1,1] in its 3x3 grid
    const checkY = y + 1 + dy;
    
    if (checkX < 0 || checkX >= GRID_WIDTH || checkY < 0 || checkY >= GRID_HEIGHT || 
        (checkY < GRID_HEIGHT && grid[checkY][checkX] !== '')) {
      blockedCorners++;
    }
  });
  
  return blockedCorners >= 3;
};

const createInitialLineClearStats = (): LineClearStats => ({
  singles: 0,
  doubles: 0,
  triples: 0,
  tetrises: 0,
});

const createInitialMultiplier = (): ScoreMultiplier => ({
  current: 1,
  streak: 0,
  maxStreak: 0,
});

const createInitialPerformance = (): GamePerformance => ({
  startTime: new Date(),
  piecesPlaced: 0,
  linesCleared: 0,
  lineClearStats: createInitialLineClearStats(),
  maxCombo: 0,
  perfectClears: 0,
  tSpins: 0,
  holdUsed: 0,
});

const createInitialState = (mode: GameMode = 'classic', previousLevel = 1): GameState => {
  const settings = GAME_MODE_SETTINGS[mode];
  
  return {
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPiece: null,
    holdPiece: null,
    canHold: true,
    score: 0,
    globalScore: 0,
    gamesCompleted: 0,
    targetScore: settings.targetScore || 1000,
    level: previousLevel,
    isGameOver: false,
    isPaused: false,
    isGameCompleted: false,
    availableColors: DEFAULT_COLORS,
    selectedColors: DEFAULT_COLORS.slice(0, 4),
    history: [],
    gameMode: mode,
    timeRemaining: settings.timeLimit,
    survivalLevel: mode === 'survival' ? 1 : undefined,
    multiplier: createInitialMultiplier(),
    performance: createInitialPerformance(),
    lineClearStats: createInitialLineClearStats(),
    combo: 0,
    backToBack: false,
  };
};

const MAX_HISTORY = 10;

const createInitialStateWithPieces = (mode: GameMode = 'classic', previousLevel = 1): GameState => {
  const state = createInitialState(mode, previousLevel);
  const currentPiece = createRandomTetromino(state.selectedColors);
  const nextPiece = createRandomTetromino(state.selectedColors);
  return { ...state, currentPiece, nextPiece };
};

const initialState: GameState = createInitialStateWithPieces();

const gameReducer = (state: GameState, action: GameAction): GameState => {
  if (state.isGameOver && !['NEW_GAME', 'RESTART_GAME', 'UNDO_MOVE'].includes(action.type)) return state;
  if (state.isPaused && !['PAUSE', 'RESUME', 'NEW_GAME', 'RESTART_GAME', 'TICK_TIME'].includes(action.type)) return state;

  switch (action.type) {
    case 'MOVE_LEFT': {
      if (!state.currentPiece) return state;
      const newPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, x: state.currentPiece.position.x - 1 }
      };
      return isValidMove(state.grid, newPiece)
        ? { ...state, currentPiece: newPiece }
        : state;
    }

    case 'MOVE_RIGHT': {
      if (!state.currentPiece) return state;
      const newPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, x: state.currentPiece.position.x + 1 }
      };
      return isValidMove(state.grid, newPiece)
        ? { ...state, currentPiece: newPiece }
        : state;
    }

    case 'SOFT_DROP':
    case 'MOVE_DOWN': {
      if (!state.currentPiece) {
        const currentPiece = state.nextPiece || createRandomTetromino(state.selectedColors);
        const nextPiece = createRandomTetromino(state.selectedColors);
        return isValidMove(state.grid, currentPiece)
          ? { ...state, currentPiece, nextPiece }
          : { ...state, isGameOver: true };
      }

      const newPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, y: state.currentPiece.position.y + 1 }
      };
      
      if (isValidMove(state.grid, newPiece)) {
        const softDropBonus = action.type === 'SOFT_DROP' ? 1 : 0;
        return { 
          ...state, 
          currentPiece: newPiece,
          score: state.score + softDropBonus
        };
      } else {
        return lockPiece(state, false);
      }
    }

    case 'HARD_DROP': {
      if (!state.currentPiece) return state;
      
      let dropDistance = 0;
      let testPiece = { ...state.currentPiece };
      
      while (isValidMove(state.grid, testPiece)) {
        testPiece.position.y += 1;
        dropDistance++;
      }
      
      dropDistance -= 1; // Back up one step
      testPiece.position.y -= 1;
      
      return lockPiece(
        { 
          ...state, 
          currentPiece: testPiece,
          score: state.score + (dropDistance * 2) // Hard drop bonus
        }, 
        false
      );
    }

    case 'ROTATE': {
      if (!state.currentPiece) return state;
      const rotatedShape = state.currentPiece.shape[0].map((_, i) =>
        state.currentPiece!.shape.map(row => row[i]).reverse()
      );
      const newPiece = {
        ...state.currentPiece,
        shape: rotatedShape
      };
      
      if (isValidMove(state.grid, newPiece)) {
        return { ...state, currentPiece: newPiece };
      }
      
      // Try wall kicks for I and O pieces (basic implementation)
      const kicks = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 },
        { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -2 }
      ];
      
      for (const kick of kicks) {
        const kickedPiece = {
          ...newPiece,
          position: {
            x: newPiece.position.x + kick.x,
            y: newPiece.position.y + kick.y
          }
        };
        
        if (isValidMove(state.grid, kickedPiece)) {
          return { ...state, currentPiece: kickedPiece };
        }
      }
      
      return state;
    }

    case 'ROTATE_COUNTER': {
      if (!state.currentPiece) return state;
      const rotatedShape = state.currentPiece.shape[0].map((_, i) =>
        state.currentPiece!.shape.map(row => row[row.length - 1 - i])
      );
      const newPiece = {
        ...state.currentPiece,
        shape: rotatedShape
      };
      return isValidMove(state.grid, newPiece)
        ? { ...state, currentPiece: newPiece }
        : state;
    }

    case 'HOLD': {
      if (!state.canHold || !state.currentPiece) return state;
      
      let newCurrentPiece: Tetromino | null;
      let newHoldPiece: Tetromino;
      let newNextPiece = state.nextPiece;
      
      if (state.holdPiece) {
        // Swap current and hold pieces
        newCurrentPiece = {
          ...state.holdPiece,
          position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 }
        };
        newHoldPiece = state.currentPiece;
      } else {
        // Move current to hold, bring in next piece
        newHoldPiece = state.currentPiece;
        newCurrentPiece = state.nextPiece ? {
          ...state.nextPiece,
          position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 }
        } : null;
        newNextPiece = createRandomTetromino(state.selectedColors);
      }
      
      if (newCurrentPiece && !isValidMove(state.grid, newCurrentPiece)) {
        return { ...state, isGameOver: true };
      }
      
      return {
        ...state,
        currentPiece: newCurrentPiece,
        holdPiece: newHoldPiece,
        nextPiece: newNextPiece,
        canHold: false,
        performance: {
          ...state.performance,
          holdUsed: state.performance.holdUsed + 1
        }
      };
    }

    case 'PAUSE':
      return { ...state, isPaused: true };

    case 'RESUME':
      return { ...state, isPaused: false };

    case 'TICK_TIME': {
      if (state.gameMode === 'time-attack' && state.timeRemaining !== undefined) {
        const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
        if (newTimeRemaining === 0) {
          return { 
            ...state, 
            timeRemaining: 0, 
            isGameOver: true,
            performance: {
              ...state.performance,
              endTime: new Date()
            }
          };
        }
        return { ...state, timeRemaining: newTimeRemaining };
      }
      return state;
    }

    case 'NEW_GAME': {
      const mode = action.mode || state.gameMode;
      const nextLevel = state.isGameCompleted ? state.level + 1 : 1;
      const newState = createInitialStateWithPieces(mode, nextLevel);
      return {
        ...newState,
        globalScore: state.globalScore,
        gamesCompleted: state.gamesCompleted,
        selectedColors: state.selectedColors,
      };
    }

    case 'RESTART_GAME': {
      const newState = createInitialStateWithPieces(state.gameMode);
      return {
        ...newState,
        globalScore: state.globalScore,
        gamesCompleted: state.gamesCompleted,
        selectedColors: state.selectedColors,
      };
    }

    case 'UNDO_MOVE': {
      if (state.history.length === 0) return state;
      const previousState = state.history[state.history.length - 1];
      return {
        ...state,
        grid: previousState.grid,
        score: previousState.score,
        level: previousState.level,
        history: state.history.slice(0, -1)
      };
    }

    case 'UPDATE_COLORS':
      return { ...state, selectedColors: action.colors };

    default:
      return state;
  }
};

const lockPiece = (state: GameState, wasRotation: boolean): GameState => {
  if (!state.currentPiece) return state;

  // Save current state to history
  const historyEntry: GameHistory = {
    grid: state.grid.map(row => [...row]),
    score: state.score,
    level: state.level
  };
  const newHistory = [...state.history, historyEntry].slice(-MAX_HISTORY);

  // Lock the piece in place
  const newGrid = mergeTetrominoWithGrid(state.grid, state.currentPiece);
  const { newGrid: clearedGrid, linesCleared, clearedRows } = checkLines(newGrid);
  
  // Check for special conditions
  const wasTSpin = isTSpin(state.grid, state.currentPiece, wasRotation ? 'ROTATE' : '');
  const wasPerfectClear = linesCleared > 0 && isPerfectClear(clearedGrid);
  const wasBackToBack = (linesCleared === 4 || wasTSpin) && state.backToBack;
  
  // Update line clear statistics
  const newLineClearStats = { ...state.lineClearStats };
  if (linesCleared === 1) newLineClearStats.singles++;
  else if (linesCleared === 2) newLineClearStats.doubles++;
  else if (linesCleared === 3) newLineClearStats.triples++;
  else if (linesCleared === 4) newLineClearStats.tetrises++;

  // Update combo
  const newCombo = linesCleared > 0 ? state.combo + 1 : 0;
  
  // Calculate score with enhanced algorithm
  const lineScore = calculateScore(
    linesCleared,
    state.level,
    wasTSpin,
    wasBackToBack,
    newCombo,
    wasPerfectClear
  );
  
  // Apply game mode multipliers
  let modeMultiplier = 1;
  if (state.gameMode === 'time-attack') modeMultiplier = MULTIPLIERS.TIME_ATTACK_MULTIPLIER;
  else if (state.gameMode === 'survival') modeMultiplier = MULTIPLIERS.SURVIVAL_MULTIPLIER;
  
  const finalScore = Math.floor(lineScore * modeMultiplier);
  const newScore = state.score + finalScore;
  
  // Update level based on game mode
  let newLevel = state.level;
  if (GAME_MODE_SETTINGS[state.gameMode].difficultyProgression) {
    newLevel = Math.floor(newScore / 1000) + 1;
  }
  
  // Check if game is completed
  const isGameCompleted = state.targetScore ? newScore >= state.targetScore : false;
  
  // Update performance stats
  const newPerformance: GamePerformance = {
    ...state.performance,
    piecesPlaced: state.performance.piecesPlaced + 1,
    linesCleared: state.performance.linesCleared + linesCleared,
    lineClearStats: {
      ...state.performance.lineClearStats,
      singles: state.performance.lineClearStats.singles + (linesCleared === 1 ? 1 : 0),
      doubles: state.performance.lineClearStats.doubles + (linesCleared === 2 ? 1 : 0),
      triples: state.performance.lineClearStats.triples + (linesCleared === 3 ? 1 : 0),
      tetrises: state.performance.lineClearStats.tetrises + (linesCleared === 4 ? 1 : 0),
    },
    maxCombo: Math.max(state.performance.maxCombo, newCombo),
    perfectClears: state.performance.perfectClears + (wasPerfectClear ? 1 : 0),
    tSpins: state.performance.tSpins + (wasTSpin ? 1 : 0),
    endTime: isGameCompleted ? new Date() : state.performance.endTime,
  };
  
  // Update global score and games completed if game is completed
  const globalScore = state.globalScore + (isGameCompleted ? newScore : 0);
  const gamesCompleted = isGameCompleted ? state.gamesCompleted + 1 : state.gamesCompleted;
  
  // Create new piece
  const currentPiece = state.nextPiece;
  const nextPiece = createRandomTetromino(state.selectedColors);
  const isGameOver = !currentPiece || !isValidMove(clearedGrid, currentPiece);

  return {
    ...state,
    grid: clearedGrid,
    currentPiece: isGameOver ? null : currentPiece,
    nextPiece: isGameOver ? null : nextPiece,
    canHold: true, // Reset hold availability
    score: newScore,
    globalScore,
    gamesCompleted,
    level: newLevel,
    isGameOver,
    isGameCompleted,
    history: newHistory,
    lineClearStats: newLineClearStats,
    combo: newCombo,
    backToBack: linesCleared === 4 || wasTSpin,
    performance: newPerformance,
  };
};

export const useGameLogic = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timeTickRef = useRef<NodeJS.Timeout | null>(null);

  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    const speed = Math.max(100, INITIAL_SPEED - (gameState.level - 1) * 50);
    gameLoopRef.current = setInterval(() => {
      if (!gameState.isPaused && !gameState.isGameOver) {
        dispatch({ type: 'MOVE_DOWN' });
      }
    }, speed);
  }, [gameState.level, gameState.isPaused, gameState.isGameOver]);

  const startTimeTimer = useCallback(() => {
    if (timeTickRef.current) clearInterval(timeTickRef.current);
    
    if (gameState.gameMode === 'time-attack') {
      timeTickRef.current = setInterval(() => {
        dispatch({ type: 'TICK_TIME' });
      }, 1000);
    }
  }, [gameState.gameMode]);

  useEffect(() => {
    startGameLoop();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [startGameLoop]);

  useEffect(() => {
    startTimeTimer();
    return () => {
      if (timeTickRef.current) clearInterval(timeTickRef.current);
    };
  }, [startTimeTimer]);

  const actions = {
    moveLeft: () => dispatch({ type: 'MOVE_LEFT' }),
    moveRight: () => dispatch({ type: 'MOVE_RIGHT' }),
    moveDown: () => dispatch({ type: 'MOVE_DOWN' }),
    softDrop: () => dispatch({ type: 'SOFT_DROP' }),
    hardDrop: () => dispatch({ type: 'HARD_DROP' }),
    rotate: () => dispatch({ type: 'ROTATE' }),
    rotateCounter: () => dispatch({ type: 'ROTATE_COUNTER' }),
    hold: () => dispatch({ type: 'HOLD' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    resume: () => dispatch({ type: 'RESUME' }),
    newGame: (mode?: GameMode) => dispatch({ type: 'NEW_GAME', mode }),
    restartGame: () => dispatch({ type: 'RESTART_GAME' }),
    undoMove: () => dispatch({ type: 'UNDO_MOVE' }),
    updateColors: (colors: string[]) => dispatch({ type: 'UPDATE_COLORS', colors }),
  };

  return { gameState, actions };
}; 