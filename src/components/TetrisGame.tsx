import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameLogic';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DEFAULT_COLORS } from '../utils/constants';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f0f0f0;
  min-height: 100vh;
`;

const GameArea = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 30px);
  grid-template-rows: repeat(20, 30px);
  gap: 1px;
  background: #333;
  border: 4px solid #4169e1;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(65, 105, 225, 0.3);
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 200px;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  max-width: 400px;
  width: 100%;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background: ${props => {
    switch (props.variant) {
      case 'warning':
        return '#ff9800';
      case 'secondary':
        return '#2196F3';
      default:
        return '#4CAF50';
    }
  }};
  color: white;
  cursor: pointer;
  &:hover {
    filter: brightness(0.9);
  }
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SidePanelButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
`;

const CompactButton = styled(Button)`
  padding: 8px;
  font-size: 14px;
`;

const NextPiecePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 30px);
  grid-template-rows: repeat(4, 30px);
  gap: 1px;
  background: #333;
  padding: 8px;
  border-radius: 4px;
`;

const Cell = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  background: ${props => props.color || '#fff'};
  border: ${props => props.color ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.1)'};
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ColorSelector = styled.div`
  margin-bottom: 20px;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ColorOption = styled.div<{ color: string; selected: boolean }>`
  width: 30px;
  height: 30px;
  background: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#000' : 'transparent'};
  display: inline-block;
  margin: 5px;
  cursor: pointer;
`;

const StatsDisplay = styled.div`
  font-size: 16px;
  line-height: 1.3;
  margin: 4px 0;
`;

const ControlPanel = styled.div`
  display: grid;
  grid-template-areas:
    ". up ."
    "left center right"
    ". down .";
  grid-template-columns: repeat(3, 50px);
  grid-template-rows: repeat(3, 50px);
  gap: 4px;
`;

const ControlButton = styled(Button)`
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 50%;
  background: #2196F3;
  touch-action: manipulation;

  &:active {
    transform: scale(0.95);
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
`;

interface TetrisGameProps {
  onGameStart?: () => void;
  onGameEnd?: (score: number, level: number) => void;
}

const TetrisGame: React.FC<TetrisGameProps> = ({ onGameStart, onGameEnd }) => {
  const { gameState, actions } = useGameLogic();

  // Track if game has started to call onGameStart only once per game
  const [gameStarted, setGameStarted] = useState(false);
  const [previousGameState, setPreviousGameState] = useState(gameState);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          actions.moveLeft();
          break;
        case 'ArrowRight':
          actions.moveRight();
          break;
        case 'ArrowDown':
          actions.moveDown();
          break;
        case 'ArrowUp':
          actions.rotate();
          break;
        case ' ':
          if (gameState.isPaused) {
            actions.resume();
          } else {
            actions.pause();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions, gameState.isGameOver, gameState.isPaused]);

  // Handle game start detection
  useEffect(() => {
    if (!gameStarted && gameState.currentPiece && !gameState.isGameOver && !gameState.isPaused) {
      setGameStarted(true);
      onGameStart?.();
    }
  }, [gameState.currentPiece, gameState.isGameOver, gameState.isPaused, gameStarted, onGameStart]);

  // Handle game end detection
  useEffect(() => {
    if (gameStarted && (gameState.isGameOver || gameState.isGameCompleted)) {
      onGameEnd?.(gameState.score, gameState.level);
      setGameStarted(false);
    }
  }, [gameState.isGameOver, gameState.isGameCompleted, gameState.score, gameState.level, gameStarted, onGameEnd]);

  // Handle new game - reset game started flag
  useEffect(() => {
    if (previousGameState.isGameOver && !gameState.isGameOver && !gameState.isGameCompleted) {
      setGameStarted(false);
    }
    setPreviousGameState(gameState);
  }, [gameState, previousGameState]);

  useEffect(() => {
    if (gameState.isGameCompleted) {
      const timer = setTimeout(() => {
        actions.newGame();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameCompleted, actions]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleColorSelection = (color: string) => {
    const currentColors = gameState.selectedColors;
    if (currentColors.includes(color)) {
      if (currentColors.length > 2) {
        actions.updateColors(currentColors.filter(c => c !== color));
      }
    } else {
      if (currentColors.length < 7) {
        actions.updateColors([...currentColors, color]);
      }
    }
  };

  const renderNextPiece = () => {
    if (!gameState.nextPiece) return null;

    const previewGrid = Array(4).fill(null).map(() => Array(4).fill(''));
    const offsetX = Math.floor((4 - gameState.nextPiece.shape[0].length) / 2);
    const offsetY = Math.floor((4 - gameState.nextPiece.shape.length) / 2);

    gameState.nextPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          previewGrid[y + offsetY][x + offsetX] = gameState.nextPiece!.color;
        }
      });
    });

    return (
      <NextPiecePreview>
        {previewGrid.map((row, y) =>
          row.map((cell, x) => (
            <Cell key={`next-${x}-${y}`} color={cell} />
          ))
        )}
      </NextPiecePreview>
    );
  };

  // Create a display grid that includes both the fixed pieces and the current piece
  const displayGrid = gameState.grid.map(row => [...row]);
  if (gameState.currentPiece) {
    const { shape, position, color } = gameState.currentPiece;
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const gridY = position.y + y;
          const gridX = position.x + x;
          if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
            displayGrid[gridY][gridX] = color;
          }
        }
      });
    });
  }

  return (
    <GameContainer>
      <GameArea>
        <GameBoard>
          {displayGrid.map((row, y) =>
            row.map((cell, x) => (
              <Cell
                key={`${x}-${y}`}
                color={cell}
              />
            ))
          )}
        </GameBoard>

        <div>
          <SidePanel>
            <h2>Next Piece</h2>
            {renderNextPiece()}
            <StatsDisplay>
              <div>Score: {gameState.score}/{gameState.targetScore}</div>
              <div>Level: {gameState.level}</div>
              <div>Games Won: {gameState.gamesCompleted}</div>
            </StatsDisplay>
            <Button
              onClick={() => gameState.isGameOver ? actions.newGame() : gameState.isPaused ? actions.resume() : actions.pause()}
            >
              {gameState.isGameOver ? 'New Game' : gameState.isPaused ? 'Resume' : 'Pause'}
            </Button>
          </SidePanel>

          <SidePanelButtons>
            <CompactButton 
              variant="warning" 
              onClick={actions.restartGame}
              disabled={gameState.isGameOver && !gameState.isGameCompleted}
            >
              Restart
            </CompactButton>
            <CompactButton 
              variant="secondary" 
              onClick={actions.undoMove}
              disabled={gameState.history.length === 0}
            >
              Undo
            </CompactButton>
          </SidePanelButtons>

          <GameControls>
            <ControlPanel>
              <ControlButton
                style={{ gridArea: 'up' }}
                onClick={actions.rotate}
                disabled={gameState.isGameOver || gameState.isPaused}
              >
                ↻
              </ControlButton>
              <ControlButton
                style={{ gridArea: 'left' }}
                onClick={actions.moveLeft}
                disabled={gameState.isGameOver || gameState.isPaused}
              >
                ←
              </ControlButton>
              <ControlButton
                style={{ gridArea: 'right' }}
                onClick={actions.moveRight}
                disabled={gameState.isGameOver || gameState.isPaused}
              >
                →
              </ControlButton>
              <ControlButton
                style={{ gridArea: 'down' }}
                onClick={actions.moveDown}
                disabled={gameState.isGameOver || gameState.isPaused}
              >
                ↓
              </ControlButton>
            </ControlPanel>
          </GameControls>
        </div>
      </GameArea>

      {gameState.isGameOver && (
        <div>
          <h2>Game Over!</h2>
          <Button onClick={actions.newGame}>Play Again</Button>
        </div>
      )}

      {gameState.isGameCompleted && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h2>Level {gameState.level} Completed!</h2>
          <p>Starting next level in 2 seconds...</p>
        </div>
      )}
    </GameContainer>
  );
};

export default TetrisGame; 