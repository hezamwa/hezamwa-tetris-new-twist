import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameLogic';
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
  border: 2px solid #333;
  margin-bottom: 20px;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NextPiecePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 30px);
  grid-template-rows: repeat(4, 30px);
  gap: 1px;
  background: #333;
  padding: 10px;
  border-radius: 4px;
`;

const Cell = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  background: ${props => props.color || '#fff'};
  border: ${props => props.color ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.1)'};
`;

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

const ColorSelector = styled.div`
  margin-bottom: 20px;
`;

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
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const TetrisGame: React.FC = () => {
  const { gameState, actions } = useGameLogic();

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
      <h1>Tetris</h1>
      
      <ColorSelector>
        <h3>Select Colors (2-7):</h3>
        {DEFAULT_COLORS.map((color, index) => (
          <ColorOption
            key={color}
            color={color}
            selected={gameState.selectedColors.includes(color)}
            onClick={() => handleColorSelection(color)}
          />
        ))}
      </ColorSelector>

      <Controls>
        <Button variant="primary" onClick={actions.newGame}>New Game</Button>
        <Button 
          variant="primary"
          onClick={gameState.isPaused ? actions.resume : actions.pause}
          disabled={gameState.isGameOver}
        >
          {gameState.isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button 
          variant="warning" 
          onClick={actions.restartGame}
          disabled={gameState.isGameOver && !gameState.isGameCompleted}
        >
          Restart Game
        </Button>
        <Button 
          variant="secondary" 
          onClick={actions.undoMove}
          disabled={gameState.history.length === 0}
        >
          Undo Last Move
        </Button>
      </Controls>

      <StatsDisplay>
        <div>Current Score: {gameState.score}</div>
        <div>Target Score: {gameState.targetScore}</div>
        <div>Global Score: {gameState.globalScore}</div>
        <div>Games Completed: {gameState.gamesCompleted}</div>
        <div>Level: {gameState.level}</div>
        <div>Moves Available to Undo: {gameState.history.length}</div>
      </StatsDisplay>

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

        <SidePanel>
          <h3>Next Piece</h3>
          {renderNextPiece()}
        </SidePanel>
      </GameArea>

      {gameState.isGameOver && (
        <div>
          <h2>Game Over!</h2>
          <Button onClick={actions.newGame}>Play Again</Button>
        </div>
      )}

      {gameState.isGameCompleted && (
        <div>
          <h2>Congratulations! You've reached the target score!</h2>
          <Button onClick={actions.newGame}>Play Again</Button>
        </div>
      )}
    </GameContainer>
  );
};

export default TetrisGame; 