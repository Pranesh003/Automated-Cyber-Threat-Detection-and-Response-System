import React from 'react';
import { Honeypot, HoneypotLog } from '../types';

interface HoneynetMonitorProps {
  honeypots: Honeypot[];
  logs: HoneypotLog[];
}

const statusColorMap: Record<Honeypot['status'], string> = {
  'Active': 'bg-green-500',
  'Compromised': 'bg-red-500 animate-pulse',
};

const HoneynetMonitor: React.FC<HoneynetMonitorProps> = ({ honeypots, logs }) => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Honeypot Status</h3>
        <ul className="grid grid-cols-2 gap-2">
          {honeypots.map(hp => (
            <li key={hp.id} className="bg-slate-900/50 p-2 rounded-md text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">{hp.type}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${statusColorMap[hp.status]}`}></span>
              </div>
              <p className="text-slate-500 font-mono">{hp.ip}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-grow flex flex-col">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Latest Activity</h3>
        <div className="flex-grow overflow-y-auto pr-2">
          {logs.length === 0 ? (
             <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 text-xs">Awaiting attacker interaction...</p>
             </div>
          ) : (
            <ul className="space-y-2 text-xs">
              {logs.map(log => (
                <li key={log.id} className="bg-slate-900/50 p-2 rounded-md animate-fade-in-fast">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-red-400">
                      {log.attackerIp} <span className="text-slate-500">({log.attackerLocation})</span>
                    </p>
                    <p className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-slate-300 mt-1">
                    <span className="text-slate-400">Summary:</span> {log.summary}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoneynetMonitor;
