import { useState, useEffect } from 'react';
import { Theme } from '../types/Payment';
import { saveTheme, loadTheme } from '../utils/storageUtils';

const themes: Record<string, Theme> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      border: '#e2e8f0'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#475569'
    }
  },
  midnight: {
    name: 'Midnight',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      background: '#0c1e3d',
      surface: '#1e3a8a',
      text: '#ffffff',
      textSecondary: '#bfdbfe',
      success: '#06b6d4',
      warning: '#fbbf24',
      error: '#f87171',
      border: '#3b82f6'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#fef3c7',
      surface: '#fef9e7',
      text: '#92400e',
      textSecondary: '#b45309',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      border: '#fbbf24'
    }
  },
  mint: {
    name: 'Mint',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      background: '#ecfdf5',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#065f46',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#a7f3d0'
    }
  },
  luxe: {
    name: 'Luxe',
    colors: {
      primary: '#1d4ed8',
      secondary: '#eab308',
      background: '#1e40af',
      surface: '#312e81',
      text: '#fbbf24',
      textSecondary: '#fde047',
      success: '#059669',
      warning: '#eab308',
      error: '#dc2626',
      border: '#4338ca'
    }
  }
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Apply theme immediately to DOM and force complete refresh
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName];
    if (!theme) return;

    // Clear any existing theme classes and styles
    document.body.className = '';
    document.documentElement.className = '';
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
    
    // Apply styles directly to body and html for immediate effect
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    
    bodyStyle.setProperty('background-color', theme.colors.background, 'important');
    bodyStyle.setProperty('color', theme.colors.text, 'important');
    bodyStyle.setProperty('transition', 'none', 'important');
    bodyStyle.setProperty('min-height', '100vh', 'important');
    
    htmlStyle.setProperty('background-color', theme.colors.background, 'important');
    htmlStyle.setProperty('color', theme.colors.text, 'important');
    htmlStyle.setProperty('transition', 'none', 'important');
    
    // Force immediate repaint
    document.body.offsetHeight;
    document.documentElement.offsetHeight;
    
    // Force complete React re-render by updating the force update counter
    setForceUpdate(prev => prev + 1);
    
    // Small delay to ensure DOM is updated, then trigger another re-render
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 10);
  };

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = loadTheme();
    const initialTheme = themes[storedTheme] ? storedTheme : 'light';
    setCurrentTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const changeTheme = (themeName: string) => {
    if (!themes[themeName] || themeName === currentTheme) return;
    
    // Update state immediately
    setCurrentTheme(themeName);
    
    // Save to localStorage immediately
    saveTheme(themeName);
    
    // Apply theme and force refresh immediately
    applyTheme(themeName);
    
    // Additional refresh after a short delay to ensure everything updates
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return {
    currentTheme,
    theme: themes[currentTheme],
    availableThemes: Object.keys(themes).map(key => ({
      key,
      name: themes[key].name
    })),
    changeTheme,
    forceUpdate // This will cause components to re-render when theme changes
  };
};