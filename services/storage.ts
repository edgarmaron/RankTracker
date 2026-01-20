import { GameState } from '../types';

const STORAGE_KEY = 'summoners_shape_db_v1';

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (e) {
    console.error("Failed to load state", e);
    return null;
  }
};

export const clearGameState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};