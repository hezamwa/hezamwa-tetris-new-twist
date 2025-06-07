import React from 'react';
import { GameMode } from '../types/types';
import { GAME_MODE_SETTINGS } from '../utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onModeSelect }) => {
  const modes: GameMode[] = ['classic', 'time-attack', 'survival', 'marathon'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {modes.map(mode => {
        const settings = GAME_MODE_SETTINGS[mode];
        const isSelected = selectedMode === mode;
        
        return (
          <Card
            key={mode}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              isSelected 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onModeSelect(mode)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{settings.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.timeLimit && (
                  <Badge variant="secondary">
                    ⏱️ {settings.timeLimit / 60} min
                  </Badge>
                )}
                {settings.targetScore && (
                  <Badge variant="secondary">
                    🎯 {settings.targetScore.toLocaleString()}
                  </Badge>
                )}
                {settings.difficultyProgression && (
                  <Badge variant="secondary">
                    📈 Progressive
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GameModeSelector; 