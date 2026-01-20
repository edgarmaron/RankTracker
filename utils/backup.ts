import { GameState } from '../types';
import { BackupFile, CURRENT_SCHEMA_VERSION, validateBackup } from '../schemas/backupSchema';

export const generateBackupData = (state: GameState): BackupFile => {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "Summoner's Shape",
    data: state
  };
};

export const downloadFile = (backup: BackupFile) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  const date = new Date().toISOString().split('T')[0];
  downloadAnchorNode.setAttribute("download", `summoners-shape-backup-${date}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const parseBackupFile = async (file: File): Promise<BackupFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        const validation = validateBackup(json);
        
        if (validation.valid && validation.data) {
          resolve(validation.data);
        } else {
          reject(new Error(validation.error || 'Unknown validation error'));
        }
      } catch (e) {
        reject(new Error('Failed to parse file. Is it a valid JSON?'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};