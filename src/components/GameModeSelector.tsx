import React from 'react';
import styled from 'styled-components';
import { GameMode } from '../types/types';
import { GAME_MODE_SETTINGS } from '../utils/constants';

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const ModeCard = styled.div<{ selected: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#4CAF50' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.selected ? '#f8fff8' : '#fff'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4CAF50;
    background: #f8fff8;
    transform: translateY(-2px);
  }
`;

const ModeTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
`;

const ModeDescription = styled.p`
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const ModeDetails = styled.div`
  font-size: 12px;
  color: #888;
`;

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onModeSelect }) => {
  const modes: GameMode[] = ['classic', 'time-attack', 'survival', 'marathon'];

  return (
    <ModeSelector>
      {modes.map(mode => {
        const settings = GAME_MODE_SETTINGS[mode];
        return (
          <ModeCard
            key={mode}
            selected={selectedMode === mode}
            onClick={() => onModeSelect(mode)}
          >
            <ModeTitle>{settings.name}</ModeTitle>
            <ModeDescription>{settings.description}</ModeDescription>
            <ModeDetails>
              {settings.timeLimit && `⏱️ ${settings.timeLimit / 60} minutes`}
              {settings.targetScore && `🎯 Target: ${settings.targetScore.toLocaleString()}`}
              {settings.difficultyProgression && `📈 Progressive difficulty`}
            </ModeDetails>
          </ModeCard>
        );
      })}
    </ModeSelector>
  );
};

export default GameModeSelector; 