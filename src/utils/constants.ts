export const APP_NAME = 'Sector 47';
export const APP_TAGLINE = 'Gym Management Suite';

export const STORAGE_KEYS = {
  THEME: 'sector47.theme',
  TOKEN: 'sector47.token',
  USER: 'sector47.user',
} as const;

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
