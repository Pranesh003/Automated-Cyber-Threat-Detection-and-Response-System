import React from 'react';
import { LogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
  onRollback: (log: LogEntry) => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs, onClearLogs, onRollback }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Audit Log
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No log entries found.
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-4 p-2 rounded-md bg-slate-900/50">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-slate-500 flex-shrink-0 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-slate-300 break-words">{log.message}</span>
                  </div>
                  {log.canRollback && !log.isRolledBack && (
                      <button 
                        onClick={() => onRollback(log)}
                        className="text-xs font-semibold text-sky-300 bg-sky-500/20 px-2 py-1 rounded-md hover:bg-sky-500/30 transition-colors flex-shrink-0"
                      >
                          Rollback
                      </button>
                  )}
                  {log.isRolledBack && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-700 px-2 py-1 rounded-md flex-shrink-0">
                          Rolled Back
                      </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end space-x-2">
          <button onClick={onClearLogs} className="px-4 py-2 bg-red-600/50 hover:bg-red-600/70 rounded-md text-red-200 font-semibold transition-colors">
            Clear Logs
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;