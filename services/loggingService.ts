import { LogEntry, PlaybookAction } from '../types';

const LOG_STORAGE_KEY = 'actdrsAuditLog';
const MAX_LOG_ENTRIES = 100;

export const getLogs = (): LogEntry[] => {
  try {
    const savedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    return savedLogs ? JSON.parse(savedLogs) : [];
  } catch (error) {
    console.error('Failed to retrieve logs from localStorage', error);
    return [];
  }
};

export const addLog = (message: string, action?: PlaybookAction): LogEntry => {
    const logs = getLogs();
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      message,
      canRollback: action === 'BLOCK_IP',
      isRolledBack: false,
    };

    try {
        const updatedLogs = [newLog, ...logs].slice(0, MAX_LOG_ENTRIES);
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
        console.error('Failed to add log to localStorage', error);
    }
    
    return newLog;
};

export const clearLogs = (): void => {
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear logs from localStorage', error);
  }
};

export const markLogAsRolledBack = (logId: string): boolean => {
    try {
        const logs = getLogs();
        const updatedLogs = logs.map(log => {
            if (log.id === logId) {
                return { ...log, isRolledBack: true, canRollback: false };
            }
            return log;
        });
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
        return true;
    } catch (error) {
        console.error('Failed to mark log as rolled back in localStorage', error);
        return false;
    }
};