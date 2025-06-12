import React from 'react';
import { PoundSterling } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface TotalTileProps {
  total: number;
}

const TotalTile: React.FC<TotalTileProps> = ({ total }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-sm font-medium mb-1"
            style={{ color: theme.colors.textSecondary }}
          >
            Total Left to Pay
          </h2>
          <div className="flex items-center">
            <PoundSterling 
              className="w-6 h-6 mr-1"
              style={{ color: theme.colors.primary }}
            />
            <span 
              className="text-3xl font-bold"
              style={{ color: theme.colors.text }}
            >
              {total.toFixed(2)}
            </span>
          </div>
        </div>
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <PoundSterling 
            className="w-8 h-8"
            style={{ color: '#ffffff' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TotalTile;