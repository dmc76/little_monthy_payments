import React from 'react';
import { PaymentFilter } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';

interface TabFilterProps {
  activeFilter: PaymentFilter;
  onFilterChange: (filter: PaymentFilter) => void;
  counts: {
    all: number;
    recurring: number;
    oneOff: number;
  };
}

const TabFilter: React.FC<TabFilterProps> = ({ activeFilter, onFilterChange, counts }) => {
  const { theme } = useTheme();

  const tabs = [
    { key: 'all' as PaymentFilter, label: 'All', count: counts.all },
    { key: 'recurring' as PaymentFilter, label: 'Recurring', count: counts.recurring },
    { key: 'one-off' as PaymentFilter, label: 'One-off', count: counts.oneOff }
  ];

  return (
    <div 
      className="flex p-1 rounded-lg border"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border
      }}
    >
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className="flex-1 px-4 py-3 rounded-md font-medium transition-all duration-200"
          style={{
            backgroundColor: activeFilter === key 
              ? theme.colors.primary 
              : 'transparent',
            color: activeFilter === key 
              ? '#ffffff' 
              : theme.colors.text
          }}
        >
          <span className="text-sm">{label}</span>
          {count > 0 && (
            <span 
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                backgroundColor: activeFilter === key 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : theme.colors.primary + '20',
                color: activeFilter === key 
                  ? '#ffffff' 
                  : theme.colors.primary
              }}
            >
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;