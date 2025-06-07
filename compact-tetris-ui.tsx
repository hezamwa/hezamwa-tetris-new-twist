import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, ArrowLeft, ArrowRight, ArrowDown, Square, Trophy, Target, Clock, Zap } from 'lucide-react';

const TetrisGame = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    lines: 0,
    time: '2:40',
    isPaused: false,
    gameMode: 'Classic'
  });

  const [stats, setStats] = useState({
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
    tspins: 0,
    combo: 0
  });

  // Mock game grid (10x20)
  const createEmptyGrid = () => {
    return Array(20).fill().map(() => Array(10).fill(0));
  };

  const [grid, setGrid] = useState(createEmptyGrid());

  // Mock next pieces
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const [nextPieces, setNextPieces] = useState(['T', 'I', 'O']);
  const [holdPiece, setHoldPiece] = useState('L');

  const gameModes = [
    { name: 'Classic', icon: Square, target: '1,000', color: 'bg-blue-500' },
    { name: 'Time Attack', icon: Clock, target: '2 min', color: 'bg-red-500' },
    { name: 'Survival', icon: Zap, target: 'Endless', color: 'bg-yellow-500' },
    { name: 'Marathon', icon: Target, target: '10,000', color: 'bg-green-500' }
  ];

  const renderPiece = (piece, size = 'w-4 h-4') => {
    const colors = {
      'I': 'bg-cyan-400',
      'O': 'bg-yellow-400',
      'T': 'bg-purple-400',
      'S': 'bg-green-400',
      'Z': 'bg-red-400',
      'J': 'bg-blue-400',
      'L': 'bg-orange-400'
    };
    return <div className={`${size} ${colors[piece]} border border-gray-600 rounded-sm`}></div>;
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-10 gap-px bg-gray-800 p-2 rounded-lg border-2 border-gray-600">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-6 h-6 border border-gray-700 rounded-sm ${
                cell ? 'bg-cyan-400' : 'bg-gray-900'
              }`}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative">
          {/* Exit Button - Top Left */}
          <button 
            className="absolute top-0 left-0 bg-red-600/80 hover:bg-red-600 backdrop-blur p-2 rounded-lg transition-all shadow-lg z-10"
            title="Exit to Main Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent ml-16">
            🎮 TETRIS
          </h1>
          <div className="flex gap-2">
            {gameModes.map(mode => (
              <button
                key={mode.name}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  gameState.gameMode === mode.name
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
                  <div className="text-2xl font-bold text-cyan-400">0</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs">Games Played</div>
                    <div className="text-lg font-bold text-purple-400">0</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs">Highest Level</div>
                    <div className="text-lg font-bold text-green-400">1</div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Total Play Time</div>
                  <div className="text-lg font-bold text-yellow-400">0h 0m</div>
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
                  <div className="text-xl font-bold text-green-400">{gameState.lines}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="text-gray-400">Time</div>
                  <div className="text-xl font-bold text-yellow-400">{gameState.time}</div>
                </div>
              </div>
            </div>

            {/* Line Clears */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-purple-400">Line Clears</h3>
              <div className="space-y-2 text-sm">
                {[
                  { name: 'Singles', count: stats.singles, color: 'text-blue-400' },
                  { name: 'Doubles', count: stats.doubles, color: 'text-green-400' },
                  { name: 'Triples', count: stats.triples, color: 'text-yellow-400' },
                  { name: 'Tetrises', count: stats.tetrises, color: 'text-red-400' },
                  { name: 'T-Spins', count: stats.tspins, color: 'text-purple-400' }
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
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
                {renderGrid()}
              </div>
            </div>
            
            {/* Controls under the grid */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-yellow-400 text-center">Game Controls</h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-3 text-sm max-w-md">
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <ArrowLeft className="w-5 h-5 mb-1" />
                    <div>Move Left</div>
                    <div className="text-xs text-gray-400">←</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <RotateCw className="w-5 h-5 mb-1" />
                    <div>Rotate</div>
                    <div className="text-xs text-gray-400">↑</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <ArrowRight className="w-5 h-5 mb-1" />
                    <div>Move Right</div>
                    <div className="text-xs text-gray-400">→</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <Square className="w-5 h-5 mb-1" />
                    <div>Hold</div>
                    <div className="text-xs text-gray-400">C</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <ArrowDown className="w-5 h-5 mb-1" />
                    <div>Soft Drop</div>
                    <div className="text-xs text-gray-400">↓</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors flex flex-col items-center">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
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
                {holdPiece ? renderPiece(holdPiece, 'w-6 h-6') : <div className="w-6 h-6 border-2 border-dashed border-gray-600 rounded"></div>}
              </div>
            </div>

            {/* Next Pieces */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-green-400">Next</h3>
              <div className="space-y-2">
                {nextPieces.map((piece, index) => (
                  <div key={index} className={`bg-gray-900/50 p-2 rounded-lg flex justify-center ${index === 0 ? 'ring-2 ring-green-400/50' : ''}`}>
                    {renderPiece(piece, 'w-5 h-5')}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-red-400">Performance</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'PPS', value: '1.5', color: 'text-cyan-400' },
                  { label: 'LPM', value: '0.0', color: 'text-green-400' },
                  { label: 'SPM', value: '0', color: 'text-yellow-400' },
                  { label: 'Combo', value: '0', color: 'text-red-400' }
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center bg-gray-900/30 p-2 rounded">
                    <span className="text-gray-300">{item.label}</span>
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
                  <span>Target: 1,000</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full" style={{width: '0%'}}></div>
                </div>
                <div className="text-center text-xs text-gray-400">Grade: F</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-bold transition-colors flex items-center justify-center">
                {gameState.isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="bg-red-600 hover:bg-red-700 p-3 rounded-lg font-bold transition-colors">
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;