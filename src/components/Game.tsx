import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameMode } from '../types/types';
import { formatTime } from '../utils/achievements';
import { Button } from './ui/button';
import { 
  Play, 
  Pause, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  Square, 
  Target, 
  Clock, 
  Zap,
  Undo2,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';

interface GameProps {
  onToggleNav?: () => void;
  navVisible?: boolean;
}

const Game: React.FC<GameProps> = ({ onToggleNav, navVisible }) => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [gameInitialized, setGameInitialized] = useState(false);

  // Use actual game logic instead of mock state
  const { gameState, actions } = useGameLogic();

  const gameModes = [
    { name: 'Classic', icon: Square, target: '1,000', color: 'bg-blue-500', mode: 'classic' as GameMode },
    { name: 'Time Attack', icon: Clock, target: '2 min', color: 'bg-red-500', mode: 'time-attack' as GameMode },
    { name: 'Survival', icon: Zap, target: 'Endless', color: 'bg-yellow-500', mode: 'survival' as GameMode },
    { name: 'Marathon', icon: Target, target: '10,000', color: 'bg-green-500', mode: 'marathon' as GameMode }
  ];

  useEffect(() => {
    if (!currentUser && !userProfile) {
      navigate('/login');
    }
  }, [currentUser, userProfile, navigate]);

  const handleGameEnd = useCallback(async (score: number, level: number) => {
    if (!currentUser || !userProfile || !gameStartTime || !currentGameId) {
      return;
    }

    const gameEndTime = new Date();
    const playTime = Math.floor((gameEndTime.getTime() - gameStartTime.getTime()) / 1000);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updates: any = {
        'gameStats.totalGames': increment(1),
        'gameStats.totalScore': increment(score),
        'gameStats.totalPlayTime': increment(playTime)
      };

      if (score > userProfile.gameStats.highScore) {
        updates['gameStats.highScore'] = score;
      }

      if (level > userProfile.gameStats.highestLevel) {
        updates['gameStats.highestLevel'] = level;
      }

      await updateDoc(userRef, updates);
      setGameStartTime(null);
      setCurrentGameId(null);

    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  }, [currentUser, userProfile, gameStartTime, currentGameId]);

  // Game lifecycle callbacks
  useEffect(() => {
    if (gameState.currentPiece && !gameStartTime) {
      setGameStartTime(new Date());
      const gameId = `${currentUser?.uid}_${Date.now()}`;
      setCurrentGameId(gameId);
    }

    if ((gameState.isGameOver || gameState.isGameCompleted) && gameStartTime) {
      handleGameEnd(gameState.score, gameState.level);
    }
  }, [gameState.isGameOver, gameState.isGameCompleted, gameState.currentPiece, gameStartTime, gameState.score, gameState.level, currentUser?.uid, handleGameEnd]);

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

    return (
      <div className="grid grid-cols-10 gap-px bg-gray-800 p-2 rounded-lg border-2 border-gray-600">
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const colors: Record<string, string> = {
              '#00f5ff': 'bg-cyan-400',
              '#ffff00': 'bg-yellow-400',
              '#800080': 'bg-purple-400',
              '#00ff00': 'bg-green-400',
              '#ff0000': 'bg-red-400',
              '#0000ff': 'bg-blue-400',
              '#ffa500': 'bg-orange-400'
            };
            const colorClass = cell ? colors[cell] || 'bg-gray-400' : 'bg-gray-900';
            
            return (
              <div
                key={`${x}-${y}`}
                className={`w-6 h-6 border border-gray-700 rounded-sm ${colorClass}`}
              />
            );
          })
        )}
      </div>
    );
  };

  const renderPreviewPiece = (piece: any, size = 'w-5 h-5') => {
    if (!piece) {
      return <div className="w-6 h-6 border-2 border-dashed border-gray-600 rounded"></div>;
    }

    // Create a 4x4 grid for the piece preview
    const previewGrid = Array(4).fill(null).map(() => Array(4).fill(''));
    if (piece.shape) {
      piece.shape.forEach((row: any[], y: number) => {
        row.forEach((cell: number, x: number) => {
          if (cell !== 0 && y < 4 && x < 4) {
            previewGrid[y][x] = piece.color;
          }
        });
      });
    }

    const colors: Record<string, string> = {
      '#00f5ff': 'bg-cyan-400',
      '#ffff00': 'bg-yellow-400',
      '#800080': 'bg-purple-400',
      '#00ff00': 'bg-green-400',
      '#ff0000': 'bg-red-400',
      '#0000ff': 'bg-blue-400',
      '#ffa500': 'bg-orange-400'
    };

    return (
      <div className="grid grid-cols-4 gap-px">
        {previewGrid.flat().map((cell, index) => {
          const colorClass = cell ? colors[cell] || 'bg-gray-400' : 'bg-transparent';
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-sm ${colorClass} ${cell ? 'border border-gray-600' : ''}`}
            />
          );
        })}
      </div>
    );
  };

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setGameInitialized(true);
    actions.newGame(mode);
  };

  // Initialize game only once when component mounts
  useEffect(() => {
    if (!gameInitialized) {
      setGameInitialized(true);
      actions.newGame(selectedMode);
    }
  }, []);

  const handleUndo = () => {
    actions.undoMove();
  };

  const togglePause = () => {
    if (gameState.isPaused) {
      actions.resume();
    } else {
      actions.pause();
    }
  };

  const handleRestart = () => {
    actions.restartGame();
    setGameStartTime(new Date());
  };

  // Calculate play time
  const playTime = gameState.performance.startTime 
    ? (Date.now() - gameState.performance.startTime.getTime()) / 1000 
    : 0;

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key);
      switch (e.key.toLowerCase()) {
        case 'z':
          if (gameState.history.length > 0) {
            console.log('Undo triggered');
            actions.undoMove();
          }
          break;
        case 'p':
          console.log('Pause/Resume triggered');
          if (gameState.isPaused) {
            actions.resume();
          } else {
            actions.pause();
          }
          break;
        case 'r':
          console.log('Restart triggered');
          actions.restartGame();
          setGameStartTime(new Date());
          break;
        case 'arrowleft':
          console.log('Move left triggered');
          e.preventDefault();
          actions.moveLeft();
          break;
        case 'arrowright':
          console.log('Move right triggered');
          e.preventDefault();
          actions.moveRight();
          break;
        case 'arrowdown':
          console.log('Soft drop triggered');
          e.preventDefault();
          actions.softDrop();
          break;
        case 'arrowup':
          console.log('Rotate triggered');
          e.preventDefault();
          actions.rotate();
          break;
        case 'c':
          console.log('Hold triggered');
          actions.hold();
          break;
        case ' ':
          console.log('Hard drop triggered');
          e.preventDefault();
          actions.hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.history.length, gameState.isPaused]);

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to play</h2>
          <Button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative">
          {/* Exit Button - Top Left */}
          <button 
            onClick={() => {
              navigate('/analytics');
            }}
            className="absolute top-0 left-0 bg-red-600/80 hover:bg-red-600 backdrop-blur p-2 rounded-lg transition-all shadow-lg z-10"
            title="Go to Game Statistics"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent ml-16">
            🎮 TETRIS
          </h1>
          <div className="flex gap-2">
            {gameModes.map(mode => (
              <button
                key={mode.name}
                onClick={() => handleModeSelect(mode.mode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedMode === mode.mode
                    ? `${mode.color} text-white shadow-lg`
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <mode.icon className="w-4 h-4 inline mr-1" />
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel - Player Stats */}
          <div className="col-span-3 space-y-4">
            {/* Player Overall Stats */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-cyan-400">Player Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-gray-400">High Score</div>
                  <div className="text-2xl font-bold text-cyan-400">{userProfile.gameStats.highScore?.toLocaleString() || '0'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs">Games Played</div>
                    <div className="text-lg font-bold text-purple-400">{userProfile.gameStats.totalGames || '0'}</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs">Highest Level</div>
                    <div className="text-lg font-bold text-green-400">{userProfile.gameStats.highestLevel || '1'}</div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Total Play Time</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {Math.floor((userProfile.gameStats.totalPlayTime || 0) / 3600)}h{' '}
                    {Math.floor(((userProfile.gameStats.totalPlayTime || 0) % 3600) / 60)}m
                  </div>
                </div>
              </div>
            </div>

            {/* Current Game Stats */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-orange-400">Current Game</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Score</div>
                  <div className="text-xl font-bold text-cyan-400">{gameState.score.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Level</div>
                  <div className="text-xl font-bold text-purple-400">{gameState.level}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Lines</div>
                  <div className="text-xl font-bold text-green-400">{gameState.performance.linesCleared}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Time</div>
                  <div className="text-xl font-bold text-yellow-400">{formatTime(playTime)}</div>
                </div>
              </div>
            </div>

            {/* Line Clears */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-purple-400">Line Clears</h3>
              <div className="space-y-2 text-sm">
                {[
                  { name: 'Singles', count: gameState.lineClearStats.singles, color: 'text-blue-400' },
                  { name: 'Doubles', count: gameState.lineClearStats.doubles, color: 'text-green-400' },
                  { name: 'Triples', count: gameState.lineClearStats.triples, color: 'text-yellow-400' },
                  { name: 'Tetrises', count: gameState.lineClearStats.tetrises, color: 'text-red-400' },
                  { name: 'T-Spins', count: gameState.performance.tSpins, color: 'text-purple-400' }
                ].map(item => (
                  <div key={item.name} className="flex justify-between items-center bg-gray-900/30 p-2 rounded">
                    <span className="text-gray-300">{item.name}</span>
                    <span className={`font-bold ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Game Grid & Controls */}
          <div className="col-span-6 space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700 relative">
                {renderGrid()}
                
                {/* Game Over/Completion Overlay */}
                {(gameState.isGameOver || gameState.isGameCompleted || gameState.isPaused) && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
                    <div className="bg-gray-900/90 p-6 rounded-xl border border-gray-600 text-center max-w-md">
                      {gameState.isPaused && (
                        <>
                          <h2 className="text-2xl font-bold text-yellow-400 mb-2">⏸️ Paused</h2>
                          <p className="text-gray-300 mb-4">Press P to resume</p>
                          <div className="flex gap-2 justify-center">
                            <Button onClick={togglePause} className="bg-green-600 hover:bg-green-700">
                              Resume
                            </Button>
                            <Button variant="secondary" onClick={handleRestart}>
                              Restart
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {gameState.isGameCompleted && !gameState.isPaused && (
                        <>
                          <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 Target Reached!</h2>
                          <div className="text-gray-300 mb-4">
                            <p>Final Score: {gameState.score.toLocaleString()}</p>
                            <p>Level Reached: {gameState.level}</p>
                            <p>Time Played: {formatTime(playTime)}</p>
                          </div>
                          <div className="flex gap-2 justify-center flex-wrap">
                            <Button onClick={() => handleModeSelect(selectedMode)} className="bg-green-600 hover:bg-green-700">
                              Next Level
                            </Button>
                            <Button variant="secondary" onClick={handleRestart}>
                              Restart
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {gameState.isGameOver && !gameState.isGameCompleted && !gameState.isPaused && (
                        <>
                          <h2 className="text-2xl font-bold text-red-400 mb-2">💀 Game Over</h2>
                          <div className="text-gray-300 mb-4">
                            <p>Final Score: {gameState.score.toLocaleString()}</p>
                            <p>Level Reached: {gameState.level}</p>
                            <p>Time Played: {formatTime(playTime)}</p>
                          </div>
                          <div className="flex gap-2 justify-center flex-wrap">
                            <Button onClick={() => handleModeSelect(selectedMode)} className="bg-blue-600 hover:bg-blue-700">
                              New Game
                            </Button>
                            <Button variant="secondary" onClick={handleRestart}>
                              Restart
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls under the grid */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-yellow-400 text-center">Game Controls</h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-3 text-sm max-w-md">
                  <button 
                    onClick={actions.moveLeft}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <ArrowLeft className="w-5 h-5 mb-1" />
                    <div>Move Left</div>
                    <div className="text-xs text-gray-400">←</div>
                  </button>
                  <button 
                    onClick={actions.rotate}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <RotateCw className="w-5 h-5 mb-1" />
                    <div>Rotate</div>
                    <div className="text-xs text-gray-400">↑</div>
                  </button>
                  <button 
                    onClick={actions.moveRight}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <ArrowRight className="w-5 h-5 mb-1" />
                    <div>Move Right</div>
                    <div className="text-xs text-gray-400">→</div>
                  </button>
                  <button 
                    onClick={actions.hold}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Square className="w-5 h-5 mb-1" />
                    <div>Hold</div>
                    <div className="text-xs text-gray-400">C</div>
                  </button>
                  <button 
                    onClick={actions.hardDrop}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <ArrowDown className="w-5 h-5 mb-1" />
                    <div>Drop</div>
                    <div className="text-xs text-gray-400">Space</div>
                  </button>
                  <button 
                    onClick={handleUndo}
                    disabled={gameState.history.length === 0}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed p-3 rounded-lg transition-colors flex flex-col items-center"
                  >
                    <Undo2 className="w-5 h-5 mb-1" />
                    <div>Undo</div>
                    <div className="text-xs text-gray-400">Z</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Next Pieces & Performance */}
          <div className="col-span-3 space-y-4">
            {/* Hold Piece */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-orange-400">Hold</h3>
              <div className="bg-gray-900/50 p-3 rounded-lg flex justify-center">
                {renderPreviewPiece(gameState.holdPiece)}
              </div>
            </div>

            {/* Next Pieces */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-green-400">Next</h3>
              <div className="space-y-2">
                <div className="bg-gray-900/50 p-2 rounded-lg flex justify-center ring-2 ring-green-400/50">
                  {renderPreviewPiece(gameState.nextPiece)}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-red-400">Performance</h3>
              <div className="space-y-2 text-sm">
                {[
                  { 
                    label: 'PPS', 
                    value: ((gameState.performance.piecesPlaced / (playTime / 60)) || 0).toFixed(1), 
                    color: 'text-cyan-400',
                    tooltip: 'Pieces Per Second - How fast you place pieces'
                  },
                  { 
                    label: 'LPM', 
                    value: ((gameState.performance.linesCleared / (playTime / 60)) || 0).toFixed(1), 
                    color: 'text-green-400',
                    tooltip: 'Lines Per Minute - How fast you clear lines'
                  },
                  { 
                    label: 'SPM', 
                    value: ((gameState.score / (playTime / 60)) || 0).toFixed(0), 
                    color: 'text-yellow-400',
                    tooltip: 'Score Per Minute - Your scoring efficiency'
                  },
                  { 
                    label: 'Combo', 
                    value: gameState.combo.toString(), 
                    color: 'text-red-400',
                    tooltip: 'Current combo count - Consecutive line clears'
                  }
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center bg-gray-900/30 p-2 rounded">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">{item.label}</span>
                      <div className="group relative">
                        <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.tooltip}
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-pink-400">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Target: {gameState.targetScore.toLocaleString()}</span>
                  <span>{Math.min(100, (gameState.score / gameState.targetScore * 100)).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full transition-all duration-300" 
                    style={{width: `${Math.min(100, (gameState.score / gameState.targetScore * 100))}%`}}
                  ></div>
                </div>
                <div className="text-center text-xs text-gray-400">Level: {gameState.level}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={togglePause}
                className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-bold transition-colors flex items-center justify-center"
              >
                {gameState.isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button 
                onClick={handleRestart}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-lg font-bold transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game; 