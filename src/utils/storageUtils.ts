import { Payment, Project } from '../types/Payment';

const PAYMENTS_KEY = 'little-monthly-payments';
const PROJECTS_KEY = 'little-monthly-projects';
const THEME_KEY = 'little-monthly-payments-theme';

export const savePayments = (payments: Payment[]): void => {
  try {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error('Failed to save payments to localStorage:', error);
  }
};

export const loadPayments = (): Payment[] => {
  try {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load payments from localStorage:', error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

export const loadProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
    return [];
  }
};

export const saveTheme = (themeName: string): void => {
  try {
    localStorage.setItem(THEME_KEY, themeName);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

export const loadTheme = (): string => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
    return 'light';
  }
};