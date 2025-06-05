import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameMode, Achievement } from '../types/types';
import { ACHIEVEMENTS } from '../utils/constants';
import { checkAchievements, formatTime } from '../utils/achievements';
import GameModeSelector from './GameModeSelector';
import StatsDisplay from './StatsDisplay';
import AchievementPanel from './AchievementPanel';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f0f0f0;
  min-height: 100vh;
`;

const GameHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 1400px;
`;

const GameTitle = styled.h1`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
`;

const GameArea = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  flex-wrap: wrap;
  justify-content: center;
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
  position: relative;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
`;

const GameCenterArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PiecePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  text-align: center;
`;

const NextPiecePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 20px);
  grid-template-rows: repeat(4, 20px);
  gap: 1px;
  background: #333;
  padding: 8px;
  border-radius: 4px;
  justify-self: center;
`;

const HoldPiecePreview = styled.div<{ disabled?: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, 20px);
  grid-template-rows: repeat(4, 20px);
  gap: 1px;
  background: #333;
  padding: 8px;
  border-radius: 4px;
  justify-self: center;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const Cell = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  background: ${props => props.color || '#fff'};
  border: ${props => props.color ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.1)'};
`;

const PreviewCell = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  background: ${props => props.color || '#fff'};
  border: ${props => props.color ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.1)'};
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
  transition: all 0.2s ease;
  
  &:hover {
    filter: brightness(0.9);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ControlPanel = styled.div`
  display: grid;
  grid-template-areas:
    ". up ."
    "left center right"
    ". down ."
    "hold space drop";
  grid-template-columns: repeat(3, 50px);
  grid-template-rows: repeat(4, 50px);
  gap: 4px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ControlButton = styled(Button)`
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 8px;
  background: #2196F3;
  touch-action: manipulation;

  &:active {
    transform: scale(0.95);
  }

  &.rotate { grid-area: up; }
  &.left { grid-area: left; }
  &.right { grid-area: right; }
  &.down { grid-area: down; }
  &.hold { grid-area: hold; font-size: 12px; }
  &.space { grid-area: space; font-size: 12px; }
  &.drop { grid-area: drop; font-size: 12px; }
`;

const GameOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  z-index: 10;
`;

const OverlayContent = styled.div`
  text-align: center;
  color: white;
  padding: 20px;
`;

const OverlayTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 32px;
`;

const OverlayText = styled.p`
  margin: 0 0 20px 0;
  font-size: 18px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CompactButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
`;

interface TetrisGameProps {
  onGameStart?: () => void;
  onGameEnd?: (score: number, level: number) => void;
}

const TetrisGame: React.FC<TetrisGameProps> = ({ onGameStart, onGameEnd }) => {
  const { gameState, actions } = useGameLogic();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [gameStarted, setGameStarted] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [showAchievements, setShowAchievements] = useState(false);

  // Initialize the game with first pieces
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.isGameOver) {
      actions.newGame(selectedMode);
    }
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          actions.moveLeft();
          break;
        case 'ArrowRight':
          actions.moveRight();
          break;
        case 'ArrowDown':
          actions.softDrop();
          break;
        case 'ArrowUp':
          actions.rotate();
          break;
        case 'z':
        case 'Z':
          actions.rotateCounter();
          break;
        case 'c':
        case 'C':
          actions.hold();
          break;
        case ' ':
          e.preventDefault();
          actions.hardDrop();
          break;
        case 'p':
        case 'P':
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
  }, [gameState.isGameOver, gameState.isPaused, actions]);

  // Check for achievements
  useEffect(() => {
    if (gameState.currentPiece || gameState.isGameOver || gameState.isGameCompleted) {
      const newAchievements = checkAchievements(gameState, achievements);
      if (newAchievements.length > 0) {
        setAchievements(current => {
          const updated = [...current];
          newAchievements.forEach(newAchievement => {
            const index = updated.findIndex(a => a.id === newAchievement.id);
            if (index >= 0) {
              updated[index] = newAchievement;
            }
          });
          return updated;
        });
      }
    }
  }, [gameState, achievements]);

  // Game lifecycle callbacks
  useEffect(() => {
    if (gameState.currentPiece && !gameStarted) {
      setGameStarted(true);
      onGameStart?.();
    }

    if ((gameState.isGameOver || gameState.isGameCompleted) && gameStarted) {
      setGameStarted(false);
      onGameEnd?.(gameState.score, gameState.level);
    }
  }, [gameState.isGameOver, gameState.isGameCompleted, gameState.currentPiece, gameStarted, onGameStart, onGameEnd]);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    actions.newGame(mode);
  };

  const renderGrid = () => {
    const grid = gameState.grid.map(row => [...row]);
    
    // Add current piece to grid for display
    if (gameState.currentPiece) {
      gameState.currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const gridY = gameState.currentPiece!.position.y + y;
            const gridX = gameState.currentPiece!.position.x + x;
            if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
              grid[gridY][gridX] = gameState.currentPiece!.color;
            }
          }
        });
      });
    }

    return grid.flat().map((color, index) => (
      <Cell key={index} color={color} />
    ));
  };

  const renderPreviewPiece = (piece: any, size = 4) => {
    if (!piece) {
      return Array(size * size).fill(null).map((_, index) => (
        <PreviewCell key={index} color="" />
      ));
    }

    const previewGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    piece.shape.forEach((row: any[], y: number) => {
      row.forEach((cell: number, x: number) => {
        if (cell !== 0 && y < size && x < size) {
          previewGrid[y][x] = piece.color;
        }
      });
    });

    return previewGrid.flat().map((color, index) => (
      <PreviewCell key={index} color={color} />
    ));
  };

  return (
    <GameContainer>
      <Toaster position="top-center" />
      
      <GameHeader>
        <GameTitle>🎮 Enhanced Tetris</GameTitle>
        <GameModeSelector 
          selectedMode={selectedMode} 
          onModeSelect={handleModeSelect} 
        />
      </GameHeader>

      <GameArea>
        {/* Left Panel */}
        <LeftPanel>
          <PiecePreviewContainer>
            <PreviewTitle>Hold (C)</PreviewTitle>
            <HoldPiecePreview disabled={!gameState.canHold}>
              {renderPreviewPiece(gameState.holdPiece)}
            </HoldPiecePreview>
          </PiecePreviewContainer>

          <PiecePreviewContainer>
            <PreviewTitle>Next Piece</PreviewTitle>
            <NextPiecePreview>
              {renderPreviewPiece(gameState.nextPiece)}
            </NextPiecePreview>
          </PiecePreviewContainer>

          <AchievementPanel achievements={achievements} compact />
        </LeftPanel>

        {/* Center Game Area */}
        <GameCenterArea>
          <div style={{ position: 'relative' }}>
            <GameBoard>
              {renderGrid()}
              
              <GameOverlay visible={gameState.isGameOver || gameState.isGameCompleted || gameState.isPaused}>
                <OverlayContent>
                  {gameState.isPaused && (
                    <>
                      <OverlayTitle>⏸️ Paused</OverlayTitle>
                      <OverlayText>Press P to resume</OverlayText>
                      <ActionButtons>
                        <Button onClick={actions.resume}>Resume</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                      </ActionButtons>
                    </>
                  )}
                  
                  {gameState.isGameCompleted && (
                    <>
                      <OverlayTitle>🎉 Level Complete!</OverlayTitle>
                      <OverlayText>
                        Score: {gameState.score.toLocaleString()}<br/>
                        Time: {formatTime((Date.now() - gameState.performance.startTime.getTime()) / 1000)}
                      </OverlayText>
                      <ActionButtons>
                        <Button onClick={() => actions.newGame(selectedMode)}>Next Level</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                      </ActionButtons>
                    </>
                  )}
                  
                  {gameState.isGameOver && !gameState.isGameCompleted && (
                    <>
                      <OverlayTitle>💀 Game Over</OverlayTitle>
                      <OverlayText>
                        Final Score: {gameState.score.toLocaleString()}<br/>
                        Level Reached: {gameState.level}<br/>
                        Time Played: {formatTime((Date.now() - gameState.performance.startTime.getTime()) / 1000)}
                      </OverlayText>
                      <ActionButtons>
                        <Button onClick={() => actions.newGame(selectedMode)}>New Game</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                        <Button variant="warning" onClick={() => setShowAchievements(!showAchievements)}>
                          Achievements
                        </Button>
                      </ActionButtons>
                    </>
                  )}
                </OverlayContent>
              </GameOverlay>
            </GameBoard>
          </div>

          {/* Touch Controls */}
          <ControlPanel>
            <ControlButton className="rotate" onClick={actions.rotate}>↻</ControlButton>
            <ControlButton className="left" onClick={actions.moveLeft}>←</ControlButton>
            <ControlButton className="right" onClick={actions.moveRight}>→</ControlButton>
            <ControlButton className="down" onClick={actions.softDrop}>↓</ControlButton>
            <ControlButton className="hold" onClick={actions.hold}>Hold</ControlButton>
            <ControlButton className="space" onClick={gameState.isPaused ? actions.resume : actions.pause}>
              {gameState.isPaused ? 'Play' : 'Pause'}
            </ControlButton>
            <ControlButton className="drop" onClick={actions.hardDrop}>Drop</ControlButton>
          </ControlPanel>

          <ActionButtons>
            <CompactButton onClick={actions.restartGame}>Restart</CompactButton>
            <CompactButton onClick={actions.undoMove} disabled={gameState.history.length === 0}>
              Undo
            </CompactButton>
            <CompactButton 
              variant="warning" 
              onClick={() => setShowAchievements(!showAchievements)}
            >
              Achievements
            </CompactButton>
          </ActionButtons>
        </GameCenterArea>

        {/* Right Panel */}
        <RightPanel>
          <StatsDisplay gameState={gameState} />
        </RightPanel>
      </GameArea>

      {/* Full Achievement Panel */}
      {showAchievements && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            maxWidth: '600px', 
            maxHeight: '80vh', 
            overflow: 'auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>🏆 All Achievements</h2>
              <Button variant="secondary" onClick={() => setShowAchievements(false)}>Close</Button>
            </div>
            <AchievementPanel achievements={achievements} />
          </div>
        </div>
      )}
    </GameContainer>
  );
};

export default TetrisGame; 