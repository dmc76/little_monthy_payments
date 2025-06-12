import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeSelector: React.FC = () => {
  const { currentTheme, availableThemes, changeTheme, theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    changeTheme(newTheme);
  };

  return (
    <div className="relative">
      <select
        value={currentTheme}
        onChange={handleChange}
        className="appearance-none px-4 py-2 pr-8 rounded-lg border focus:ring-2 focus:outline-none"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          borderColor: theme.colors.border
        }}
      >
        {availableThemes.map(({ key, name }) => (
          <option key={key} value={key}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDown 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: theme.colors.textSecondary }}
      />
    </div>
  );
};

export default ThemeSelector;