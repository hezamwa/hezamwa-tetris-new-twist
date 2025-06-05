import React from 'react';
import styled from 'styled-components';
import { Achievement } from '../types/types';
import { formatTime } from '../utils/achievements';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const PanelTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const AchievementItem = styled.div<{ unlocked: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.unlocked ? '#e8f5e8' : 'white'};
  border: 2px solid ${props => props.unlocked ? '#4CAF50' : '#e0e0e0'};
  border-radius: 8px;
  transition: all 0.2s ease;
  opacity: ${props => props.unlocked ? 1 : 0.7};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const AchievementIcon = styled.div<{ unlocked: boolean }>`
  font-size: 24px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.unlocked ? '#4CAF50' : '#f5f5f5'};
  border-radius: 50%;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(1)'};
`;

const AchievementContent = styled.div`
  flex: 1;
`;

const AchievementName = styled.div<{ unlocked: boolean }>`
  font-weight: 600;
  color: ${props => props.unlocked ? '#2E7D32' : '#333'};
  margin-bottom: 4px;
`;

const AchievementDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const ProgressContainer = styled.div`
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: #4CAF50;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  text-align: right;
`;

const UnlockedDate = styled.div`
  font-size: 11px;
  color: #4CAF50;
  font-style: italic;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#4CAF50' : '#f5f5f5'};
  }
`;

interface AchievementPanelProps {
  achievements: Achievement[];
  compact?: boolean;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ achievements, compact = false }) => {
  const [filter, setFilter] = React.useState<'all' | 'unlocked' | 'progress'>('all');
  
  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'unlocked':
        return achievement.unlocked;
      case 'progress':
        return !achievement.unlocked && achievement.progress !== undefined;
      default:
        return true;
    }
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const renderProgress = (achievement: Achievement) => {
    if (!achievement.maxProgress || achievement.unlocked) return null;
    
    const progress = achievement.progress || 0;
    const percentage = (progress / achievement.maxProgress) * 100;
    
    return (
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill percentage={percentage} />
        </ProgressBar>
        <ProgressText>
          {progress.toFixed(0)} / {achievement.maxProgress}
        </ProgressText>
      </ProgressContainer>
    );
  };

  if (compact) {
    return (
      <Panel>
        <PanelTitle>
          🏆 Achievements ({unlockedCount}/{totalCount})
        </PanelTitle>
        {achievements.slice(0, 3).map(achievement => (
          <AchievementItem key={achievement.id} unlocked={achievement.unlocked}>
            <AchievementIcon unlocked={achievement.unlocked}>
              {achievement.icon}
            </AchievementIcon>
            <AchievementContent>
              <AchievementName unlocked={achievement.unlocked}>
                {achievement.name}
              </AchievementName>
              <AchievementDescription>
                {achievement.description}
              </AchievementDescription>
              {renderProgress(achievement)}
            </AchievementContent>
          </AchievementItem>
        ))}
        {achievements.length > 3 && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: '12px' }}>
            +{achievements.length - 3} more achievements
          </div>
        )}
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelTitle>
        🏆 Achievements ({unlockedCount}/{totalCount})
      </PanelTitle>
      
      <CategoryFilter>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          active={filter === 'unlocked'} 
          onClick={() => setFilter('unlocked')}
        >
          Unlocked ({unlockedCount})
        </FilterButton>
        <FilterButton 
          active={filter === 'progress'} 
          onClick={() => setFilter('progress')}
        >
          In Progress
        </FilterButton>
      </CategoryFilter>

      {filteredAchievements.map(achievement => (
        <AchievementItem key={achievement.id} unlocked={achievement.unlocked}>
          <AchievementIcon unlocked={achievement.unlocked}>
            {achievement.icon}
          </AchievementIcon>
          <AchievementContent>
            <AchievementName unlocked={achievement.unlocked}>
              {achievement.name}
            </AchievementName>
            <AchievementDescription>
              {achievement.description}
            </AchievementDescription>
            {achievement.unlocked && achievement.unlockedDate && (
              <UnlockedDate>
                Unlocked {achievement.unlockedDate.toLocaleDateString()}
              </UnlockedDate>
            )}
            {renderProgress(achievement)}
          </AchievementContent>
        </AchievementItem>
      ))}
    </Panel>
  );
};

export default AchievementPanel; 