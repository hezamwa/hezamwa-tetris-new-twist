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
import { Button } from './ui/button';

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
  z-index: 10;
`;

const OverlayContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
`;

const OverlayTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
`;

const OverlayText = styled.p`
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.4;
`;

interface TetrisGameProps {
  onGameStart?: () => void;
  onGameEnd?: (score: number, level: number) => void;
}

const TetrisGame: React.FC<TetrisGameProps> = ({ onGameStart, onGameEnd }) => {
  const { gameState, actions } = useGameLogic();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [gameStarted, setGameStarted] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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
      const newAchievements = checkAchievements(gameState, ACHIEVEMENTS);
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
  }, [gameState, ACHIEVEMENTS]);

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
                      <div className="flex gap-2 justify-center">
                        <Button onClick={actions.resume}>Resume</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                      </div>
                    </>
                  )}
                  
                  {gameState.isGameCompleted && (
                    <>
                      <OverlayTitle>🎉 Level Complete!</OverlayTitle>
                      <OverlayText>
                        Score: {gameState.score.toLocaleString()}<br/>
                        Time: {formatTime((Date.now() - gameState.performance.startTime.getTime()) / 1000)}
                      </OverlayText>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => actions.newGame(selectedMode)}>Next Level</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                      </div>
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
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button onClick={() => actions.newGame(selectedMode)}>New Game</Button>
                        <Button variant="secondary" onClick={actions.restartGame}>Restart</Button>
                        <Button variant="destructive" onClick={() => setShowAchievements(!showAchievements)}>
                          Achievements
                        </Button>
                      </div>
                    </>
                  )}
                </OverlayContent>
              </GameOverlay>
            </GameBoard>
          </div>

          {/* Touch Controls */}
          <div className="grid grid-cols-3 grid-rows-4 gap-1 p-4 bg-white rounded-lg shadow-md" style={{
            gridTemplateAreas: `". up ." "left center right" ". down ." "hold space drop"`
          }}>
            <Button 
              size="sm" 
              className="w-12 h-12 text-lg"
              style={{ gridArea: 'up' }}
              onClick={actions.rotate}
            >
              ↻
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-lg"
              style={{ gridArea: 'left' }}
              onClick={actions.moveLeft}
            >
              ←
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-lg"
              style={{ gridArea: 'right' }}
              onClick={actions.moveRight}
            >
              →
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-lg"
              style={{ gridArea: 'down' }}
              onClick={actions.softDrop}
            >
              ↓
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-xs"
              style={{ gridArea: 'hold' }}
              onClick={actions.hold}
            >
              Hold
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-xs"
              style={{ gridArea: 'space' }}
              onClick={gameState.isPaused ? actions.resume : actions.pause}
            >
              {gameState.isPaused ? 'Play' : 'Pause'}
            </Button>
            <Button 
              size="sm" 
              className="w-12 h-12 text-xs"
              style={{ gridArea: 'drop' }}
              onClick={actions.hardDrop}
            >
              Drop
            </Button>
          </div>

          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={actions.restartGame}>Restart</Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={actions.undoMove} 
              disabled={gameState.history.length === 0}
            >
              Undo
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => setShowAchievements(!showAchievements)}
            >
              Achievements
            </Button>
          </div>
        </GameCenterArea>

        {/* Right Panel */}
        <RightPanel>
          <StatsDisplay gameState={gameState} />
        </RightPanel>
      </GameArea>

      {/* Full Achievement Panel */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-lg p-5 max-w-2xl max-h-[80vh] overflow-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold m-0">🏆 All Achievements</h2>
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