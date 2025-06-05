import React from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ScoreProgressData, PerformanceData, ComparisonData } from '../types/user';
import { LineClearStats } from '../types/types';

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const ChartSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const MetricCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #4CAF50;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface PerformanceChartsProps {
  scoreProgressData: ScoreProgressData[];
  performanceData: PerformanceData[];
  comparisonData: ComparisonData[];
  lineClearStats: LineClearStats;
  currentStats?: {
    averageScore: number;
    averageGameTime: number;
    piecesPerMinute: number;
    totalGames: number;
  };
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  scoreProgressData,
  performanceData,
  comparisonData,
  lineClearStats,
  currentStats
}) => {
  // Prepare line clear data for pie chart
  const lineClearData = [
    { name: 'Singles', value: lineClearStats.singles, color: '#4CAF50' },
    { name: 'Doubles', value: lineClearStats.doubles, color: '#2196F3' },
    { name: 'Triples', value: lineClearStats.triples, color: '#FF9800' },
    { name: 'Tetrises', value: lineClearStats.tetrises, color: '#F44336' },
  ].filter(item => item.value > 0);

  // Prepare radar chart data for comparison
  const radarData = comparisonData.map(item => ({
    category: item.category,
    user: item.percentile,
    average: 50, // Average percentile is 50
  }));

  // Prepare score progression with trend line
  const scoreDataWithTrend = scoreProgressData.map((item, index) => ({
    ...item,
    trend: index > 0 ? scoreProgressData[index - 1].score : item.score,
  }));

  return (
    <ChartsContainer>
      {/* Key Metrics Overview */}
      {currentStats && (
        <ChartSection>
          <ChartTitle>📊 Key Performance Indicators</ChartTitle>
          <ChartGrid>
            <MetricCard>
              <MetricValue>{currentStats.averageScore.toLocaleString()}</MetricValue>
              <MetricLabel>Average Score</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{Math.floor(currentStats.averageGameTime / 60)}m {Math.floor(currentStats.averageGameTime % 60)}s</MetricValue>
              <MetricLabel>Average Game Time</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{currentStats.piecesPerMinute.toFixed(1)}</MetricValue>
              <MetricLabel>Pieces Per Minute</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{currentStats.totalGames}</MetricValue>
              <MetricLabel>Total Games</MetricLabel>
            </MetricCard>
          </ChartGrid>
        </ChartSection>
      )}

      {/* Score Progress Over Time */}
      <ChartSection>
        <ChartTitle>📈 Score Progress Over Time</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreDataWithTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#4CAF50" 
              fill="#4CAF50" 
              fillOpacity={0.2}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#4CAF50" 
              strokeWidth={3}
              dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartSection>

      <ChartGrid>
        {/* Performance Metrics Over Time */}
        <ChartSection>
          <ChartTitle>⚡ Performance Metrics</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ppm" 
                stroke="#2196F3" 
                name="Pieces/Min"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="lpm" 
                stroke="#FF9800" 
                name="Lines/Min"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#9C27B0" 
                name="Score/Min"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Line Clear Distribution */}
        <ChartSection>
          <ChartTitle>🎯 Line Clear Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lineClearData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
                labelLine={false}
              >
                {lineClearData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </ChartGrid>

      <ChartGrid>
        {/* Performance Comparison Radar */}
        <ChartSection>
          <ChartTitle>🎯 Performance vs Average</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Your Performance"
                dataKey="user"
                stroke="#4CAF50"
                fill="#4CAF50"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Average Player"
                dataKey="average"
                stroke="#FF9800"
                fill="#FF9800"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Weekly Performance Bars */}
        <ChartSection>
          <ChartTitle>📅 Weekly Performance</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="ppm" fill="#4CAF50" name="Pieces/Min" />
              <Bar dataKey="lpm" fill="#2196F3" name="Lines/Min" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </ChartGrid>

      {/* Detailed Comparison Table */}
      <ChartSection>
        <ChartTitle>📊 Detailed Performance Comparison</ChartTitle>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart 
            data={comparisonData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="category" type="category" width={100} />
            <Tooltip 
              formatter={(value, name) => [
                `${value}th percentile`, 
                name === 'userValue' ? 'Your Performance' : 'Your Percentile'
              ]}
            />
            <Bar 
              dataKey="percentile" 
              fill="#4CAF50" 
              name="Your Percentile"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    </ChartsContainer>
  );
};

export default PerformanceCharts; 