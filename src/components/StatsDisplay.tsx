import React from 'react';
import { GameState } from '../types/types';
import { calculatePiecesPerMinute, calculateLinesPerMinute, calculateEfficiency, formatTime, calculateGrade } from '../utils/achievements';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface StatsDisplayProps {
  gameState: GameState;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ gameState }) => {
  const playTime = (Date.now() - gameState.performance.startTime.getTime()) / 1000;
  const ppm = calculatePiecesPerMinute(gameState.performance);
  const lpm = calculateLinesPerMinute(gameState.performance);
  const efficiency = calculateEfficiency(gameState.score, gameState.performance);
  const grade = calculateGrade(gameState.lineClearStats);

  const getGradeColor = (grade: string) => {
    switch (grade[0]) {
      case 'S': return 'bg-green-500';
      case 'A': return 'bg-green-400';
      case 'B': return 'bg-yellow-400';
      case 'C': return 'bg-orange-400';
      case 'D': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const renderGameModeInfo = () => {
    switch (gameState.gameMode) {
      case 'time-attack':
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">⏱️ Time Attack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time Remaining:</span>
                <span className={`font-semibold ${gameState.timeRemaining! < 30 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatTime(gameState.timeRemaining || 0)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    gameState.timeRemaining! < 30 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(gameState.timeRemaining || 0) / 120 * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 'survival':
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🛡️ Survival</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Survival Time:</span>
                <span className="font-semibold text-green-500">{formatTime(playTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Survival Level:</span>
                <span className="font-semibold">{gameState.survivalLevel}</span>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'marathon':
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🏃 Marathon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="font-semibold">
                  {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(gameState.score / gameState.targetScore) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🎮 Classic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="font-semibold">
                  {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(gameState.score / gameState.targetScore) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg min-w-72">
      {/* Basic Game Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📊 Game Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Score:</span>
            <span className="font-semibold text-green-500">{gameState.score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Level:</span>
            <span className="font-semibold">{gameState.level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lines Cleared:</span>
            <span className="font-semibold">{gameState.performance.linesCleared}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Grade:</span>
            <Badge className={`${getGradeColor(grade)} text-white border-0`}>
              {grade}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Game Mode Specific Info */}
      {renderGameModeInfo()}

      {/* Current Combo */}
      {gameState.combo > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-500 text-white rounded-md font-semibold animate-pulse">
          <span>🔥 COMBO x{gameState.combo}</span>
          {gameState.backToBack && <span>⚡ B2B</span>}
        </div>
      )}

      {/* Performance Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📈 Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Play Time:</span>
            <span className="font-semibold">{formatTime(playTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pieces/Min:</span>
            <span className={`font-semibold ${ppm >= 60 ? 'text-green-500' : ''}`}>
              {ppm.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lines/Min:</span>
            <span className="font-semibold">{lpm.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Score/Min:</span>
            <span className="font-semibold">{efficiency.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Max Combo:</span>
            <span className="font-semibold">{gameState.performance.maxCombo}</span>
          </div>
        </CardContent>
      </Card>

      {/* Line Clear Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🎯 Line Clears</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Singles</div>
              <div className="font-semibold">{gameState.lineClearStats.singles}</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Doubles</div>
              <div className="font-semibold">{gameState.lineClearStats.doubles}</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Triples</div>
              <div className="font-semibold">{gameState.lineClearStats.triples}</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Tetrises</div>
              <div className="font-semibold">{gameState.lineClearStats.tetrises}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✨ Special</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">T-Spins:</span>
            <span className="font-semibold">{gameState.performance.tSpins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Perfect Clears:</span>
            <span className="font-semibold">{gameState.performance.perfectClears}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Hold Used:</span>
            <span className="font-semibold">{gameState.performance.holdUsed}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDisplay; 