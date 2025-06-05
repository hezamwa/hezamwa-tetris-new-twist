import { useReducer, useCallback, useEffect } from 'react';
import { GameState, GameAction, Tetromino, TetrominoType, GameHistory } from '../types/types';
import { GRID_WIDTH, GRID_HEIGHT, TETROMINOS, INITIAL_SPEED, DEFAULT_COLORS, POINTS } from '../utils/constants';

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

const checkLines = (grid: string[][]): { newGrid: string[][], linesCleared: number } => {
  let linesCleared = 0;
  const newGrid = grid.filter(row => {
    const isLineFull = row.every(cell => cell !== '');
    if (isLineFull) linesCleared++;
    return !isLineFull;
  });

  while (newGrid.length < GRID_HEIGHT) {
    newGrid.unshift(Array(GRID_WIDTH).fill(''));
  }

  return { newGrid, linesCleared };
};

const TARGET_SCORE = 1000; // Score needed to complete the game
const MAX_HISTORY = 10; // Maximum number of moves to store for undo

const createInitialState = (previousLevel = 1) => ({
  grid: createEmptyGrid(),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  globalScore: 0,
  gamesCompleted: 0,
  targetScore: TARGET_SCORE,
  level: previousLevel,
  isGameOver: false,
  isPaused: false,
  isGameCompleted: false,
  availableColors: DEFAULT_COLORS,
  selectedColors: DEFAULT_COLORS.slice(0, 4),
  history: []
});

const initialState: GameState = createInitialState();

const gameReducer = (state: GameState, action: GameAction): GameState => {
  if (state.isGameOver && !['NEW_GAME', 'RESTART_GAME', 'UNDO_MOVE'].includes(action.type)) return state;
  if (state.isPaused && !['PAUSE', 'RESUME', 'NEW_GAME', 'RESTART_GAME'].includes(action.type)) return state;

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
        return { ...state, currentPiece: newPiece };
      } else {
        // Save current state to history before locking piece
        const historyEntry: GameHistory = {
          grid: state.grid.map(row => [...row]),
          score: state.score,
          level: state.level
        };
        const newHistory = [...state.history, historyEntry].slice(-MAX_HISTORY);

        // Lock the piece in place
        const newGrid = mergeTetrominoWithGrid(state.grid, state.currentPiece);
        const { newGrid: clearedGrid, linesCleared } = checkLines(newGrid);
        const newScore = state.score + (linesCleared * POINTS.SINGLE);
        const newLevel = Math.floor(newScore / 1000) + 1;
        
        // Check if game is completed
        const isGameCompleted = newScore >= state.targetScore;
        
        // Update global score and games completed if game is completed or over
        const globalScore = state.globalScore + newScore;
        const gamesCompleted = (isGameCompleted || state.isGameOver) ? state.gamesCompleted + 1 : state.gamesCompleted;
        
        // Create new piece
        const currentPiece = state.nextPiece;
        const nextPiece = createRandomTetromino(state.selectedColors);
        const isGameOver = !currentPiece || !isValidMove(clearedGrid, currentPiece);

        return {
          ...state,
          grid: clearedGrid,
          currentPiece: isGameOver ? null : currentPiece,
          nextPiece: isGameOver ? null : nextPiece,
          score: newScore,
          globalScore,
          gamesCompleted,
          level: newLevel,
          isGameOver,
          isGameCompleted,
          history: newHistory
        };
      }
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
      return isValidMove(state.grid, newPiece)
        ? { ...state, currentPiece: newPiece }
        : state;
    }

    case 'PAUSE':
      return { ...state, isPaused: true };

    case 'RESUME':
      return { ...state, isPaused: false };

    case 'NEW_GAME': {
      const currentPiece = createRandomTetromino(state.selectedColors);
      const nextPiece = createRandomTetromino(state.selectedColors);
      const nextLevel = state.isGameCompleted ? state.level + 1 : 1;
      return {
        ...createInitialState(nextLevel),
        globalScore: state.globalScore,
        gamesCompleted: state.gamesCompleted,
        selectedColors: state.selectedColors,
        currentPiece,
        nextPiece
      };
    }

    case 'RESTART_GAME': {
      const currentPiece = createRandomTetromino(state.selectedColors);
      const nextPiece = createRandomTetromino(state.selectedColors);
      return {
        ...state,
        grid: createEmptyGrid(),
        currentPiece,
        nextPiece,
        score: 0,
        level: 1,
        isGameOver: false,
        isPaused: false,
        isGameCompleted: false,
        history: []
      };
    }

    case 'UNDO_MOVE': {
      if (state.history.length === 0) return state;
      
      const lastHistory = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      
      return {
        ...state,
        grid: lastHistory.grid.map(row => [...row]),
        score: lastHistory.score,
        level: lastHistory.level,
        history: newHistory,
        isGameOver: false,
        isGameCompleted: false
      };
    }

    case 'UPDATE_COLORS':
      return {
        ...state,
        selectedColors: action.colors
      };

    default:
      return state;
  }
};

export const useGameLogic = () => {
  const [gameState, dispatch] = useReducer(gameReducer, {
    ...initialState,
    currentPiece: createRandomTetromino(initialState.selectedColors),
    nextPiece: createRandomTetromino(initialState.selectedColors)
  });

  const moveLeft = useCallback(() => dispatch({ type: 'MOVE_LEFT' }), []);
  const moveRight = useCallback(() => dispatch({ type: 'MOVE_RIGHT' }), []);
  const moveDown = useCallback(() => dispatch({ type: 'MOVE_DOWN' }), []);
  const rotate = useCallback(() => dispatch({ type: 'ROTATE' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const newGame = useCallback(() => dispatch({ type: 'NEW_GAME' }), []);
  const restartGame = useCallback(() => dispatch({ type: 'RESTART_GAME' }), []);
  const undoMove = useCallback(() => dispatch({ type: 'UNDO_MOVE' }), []);
  const updateColors = useCallback((colors: string[]) => 
    dispatch({ type: 'UPDATE_COLORS', colors }), []);

  const startGame = useCallback(() => {
    dispatch({
      type: 'NEW_GAME'
    });
  }, []);

  const handleGameOver = useCallback(() => {
    dispatch({
      type: 'RESTART_GAME'
    });
  }, []);

  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const gameLoop = setInterval(() => {
      dispatch({ type: 'MOVE_DOWN' });
    }, INITIAL_SPEED / gameState.level);

    return () => clearInterval(gameLoop);
  }, [gameState.level, gameState.isPaused, gameState.isGameOver]);

  return {
    gameState,
    actions: {
      moveLeft,
      moveRight,
      moveDown,
      rotate,
      pause,
      resume,
      newGame,
      restartGame,
      undoMove,
      updateColors,
      startGame,
      handleGameOver
    }
  };
}; 