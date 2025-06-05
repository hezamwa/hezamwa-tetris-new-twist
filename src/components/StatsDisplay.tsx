import React from 'react';
import styled from 'styled-components';
import { GameState } from '../types/types';
import { calculatePiecesPerMinute, calculateLinesPerMinute, calculateEfficiency, formatTime, getLineClearTypeName, calculateGrade } from '../utils/achievements';

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  min-width: 280px;
`;

const StatSection = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
  font-size: 14px;
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span<{ highlight?: boolean }>`
  font-weight: 600;
  color: ${props => props.highlight ? '#4CAF50' : '#333'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 4px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.color || '#4CAF50'};
  transition: width 0.3s ease;
`;

const ComboIndicator = styled.div<{ combo: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props => props.combo > 0 ? '#ff9800' : '#f5f5f5'};
  color: ${props => props.combo > 0 ? 'white' : '#666'};
  border-radius: 4px;
  font-weight: 600;
  animation: ${props => props.combo > 0 ? 'pulse 0.5s ease-in-out' : 'none'};

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const LineClearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const LineClearItem = styled.div`
  text-align: center;
  padding: 8px 4px;
  background: #f0f0f0;
  border-radius: 4px;
`;

const LineClearLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const LineClearCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const GradeDisplay = styled.div<{ grade: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  background: ${props => {
    switch (props.grade[0]) {
      case 'S': return '#4CAF50';
      case 'A': return '#8BC34A';
      case 'B': return '#CDDC39';
      case 'C': return '#FFC107';
      case 'D': return '#FF9800';
      default: return '#F44336';
    }
  }};
  color: white;
`;

interface StatsDisplayProps {
  gameState: GameState;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ gameState }) => {
  const playTime = (Date.now() - gameState.performance.startTime.getTime()) / 1000;
  const ppm = calculatePiecesPerMinute(gameState.performance);
  const lpm = calculateLinesPerMinute(gameState.performance);
  const efficiency = calculateEfficiency(gameState.score, gameState.performance);
  const grade = calculateGrade(gameState.lineClearStats);

  const renderGameModeInfo = () => {
    switch (gameState.gameMode) {
      case 'time-attack':
        return (
          <StatSection>
            <SectionTitle>⏱️ Time Attack</SectionTitle>
            <StatItem>
              <StatLabel>Time Remaining:</StatLabel>
              <StatValue highlight={gameState.timeRemaining! < 30}>
                {formatTime(gameState.timeRemaining || 0)}
              </StatValue>
            </StatItem>
            <ProgressBar>
              <ProgressFill 
                percentage={(gameState.timeRemaining || 0) / 120 * 100} 
                color={gameState.timeRemaining! < 30 ? '#f44336' : '#4CAF50'}
              />
            </ProgressBar>
          </StatSection>
        );
      
      case 'survival':
        return (
          <StatSection>
            <SectionTitle>🛡️ Survival</SectionTitle>
            <StatItem>
              <StatLabel>Survival Time:</StatLabel>
              <StatValue highlight>{formatTime(playTime)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Survival Level:</StatLabel>
              <StatValue>{gameState.survivalLevel}</StatValue>
            </StatItem>
          </StatSection>
        );
      
      case 'marathon':
        return (
          <StatSection>
            <SectionTitle>🏃 Marathon</SectionTitle>
            <StatItem>
              <StatLabel>Progress:</StatLabel>
              <StatValue>
                {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
              </StatValue>
            </StatItem>
            <ProgressBar>
              <ProgressFill percentage={(gameState.score / gameState.targetScore) * 100} />
            </ProgressBar>
          </StatSection>
        );
      
      default:
        return (
          <StatSection>
            <SectionTitle>🎮 Classic</SectionTitle>
            <StatItem>
              <StatLabel>Progress:</StatLabel>
              <StatValue>
                {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
              </StatValue>
            </StatItem>
            <ProgressBar>
              <ProgressFill percentage={(gameState.score / gameState.targetScore) * 100} />
            </ProgressBar>
          </StatSection>
        );
    }
  };

  return (
    <StatsContainer>
      {/* Basic Game Stats */}
      <StatSection>
        <SectionTitle>📊 Game Stats</SectionTitle>
        <StatItem>
          <StatLabel>Score:</StatLabel>
          <StatValue highlight>{gameState.score.toLocaleString()}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Level:</StatLabel>
          <StatValue>{gameState.level}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Lines Cleared:</StatLabel>
          <StatValue>{gameState.performance.linesCleared}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Grade:</StatLabel>
          <GradeDisplay grade={grade}>{grade}</GradeDisplay>
        </StatItem>
      </StatSection>

      {/* Game Mode Specific Info */}
      {renderGameModeInfo()}

      {/* Current Combo */}
      {gameState.combo > 0 && (
        <ComboIndicator combo={gameState.combo}>
          <span>🔥 COMBO x{gameState.combo}</span>
          {gameState.backToBack && <span>⚡ B2B</span>}
        </ComboIndicator>
      )}

      {/* Performance Analytics */}
      <StatSection>
        <SectionTitle>📈 Performance</SectionTitle>
        <StatItem>
          <StatLabel>Play Time:</StatLabel>
          <StatValue>{formatTime(playTime)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Pieces/Min:</StatLabel>
          <StatValue highlight={ppm >= 60}>{ppm.toFixed(1)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Lines/Min:</StatLabel>
          <StatValue>{lpm.toFixed(1)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Score/Min:</StatLabel>
          <StatValue>{efficiency.toFixed(0)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Max Combo:</StatLabel>
          <StatValue>{gameState.performance.maxCombo}</StatValue>
        </StatItem>
      </StatSection>

      {/* Line Clear Statistics */}
      <StatSection>
        <SectionTitle>🎯 Line Clears</SectionTitle>
        <LineClearGrid>
          <LineClearItem>
            <LineClearLabel>Singles</LineClearLabel>
            <LineClearCount>{gameState.lineClearStats.singles}</LineClearCount>
          </LineClearItem>
          <LineClearItem>
            <LineClearLabel>Doubles</LineClearLabel>
            <LineClearCount>{gameState.lineClearStats.doubles}</LineClearCount>
          </LineClearItem>
          <LineClearItem>
            <LineClearLabel>Triples</LineClearLabel>
            <LineClearCount>{gameState.lineClearStats.triples}</LineClearCount>
          </LineClearItem>
          <LineClearItem>
            <LineClearLabel>Tetrises</LineClearLabel>
            <LineClearCount>{gameState.lineClearStats.tetrises}</LineClearCount>
          </LineClearItem>
        </LineClearGrid>
      </StatSection>

      {/* Special Achievements */}
      <StatSection>
        <SectionTitle>✨ Special</SectionTitle>
        <StatItem>
          <StatLabel>T-Spins:</StatLabel>
          <StatValue>{gameState.performance.tSpins}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Perfect Clears:</StatLabel>
          <StatValue>{gameState.performance.perfectClears}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Hold Used:</StatLabel>
          <StatValue>{gameState.performance.holdUsed}</StatValue>
        </StatItem>
      </StatSection>
    </StatsContainer>
  );
};

export default StatsDisplay; 