import { GameState } from '../types';

export interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  data: GameState;
}

export const CURRENT_SCHEMA_VERSION = 1;

export const validateBackup = (json: any): { valid: boolean; error?: string; data?: BackupFile } => {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Invalid JSON format' };
  }

  // Basic Metadata check
  if (json.appName !== "Summoner's Shape") {
    return { valid: false, error: 'File is not a Summoner\'s Shape backup' };
  }
  
  if (typeof json.schemaVersion !== 'number') {
    return { valid: false, error: 'Missing schema version' };
  }

  // Version check
  if (json.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { valid: false, error: `Backup is from a newer version (v${json.schemaVersion}). Please update the app.` };
  }

  // Data integrity check
  if (!json.data || !json.data.profile || !json.data.logs || !json.data.rank) {
    return { valid: false, error: 'Corrupt backup data: Missing core fields' };
  }

  // Migration logic (placeholder for future versions)
  // if (json.schemaVersion < CURRENT_SCHEMA_VERSION) { ...migrate... }

  return { valid: true, data: json as BackupFile };
};