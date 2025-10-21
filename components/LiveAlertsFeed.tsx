
import React from 'react';
import { ThreatAlert, ThreatSeverity } from '../types';

interface LiveAlertsFeedProps {
  alerts: ThreatAlert[];
  onSelectAlert: (alert: ThreatAlert) => void;
}

const severityColorMap: Record<ThreatSeverity, string> = {
  [ThreatSeverity.HIGH]: 'bg-red-500/20 text-red-400 border-red-500/50',
  [ThreatSeverity.MEDIUM]: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  [ThreatSeverity.LOW]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
};

const severityDotMap: Record<ThreatSeverity, string> = {
    [ThreatSeverity.HIGH]: 'bg-red-500',
    [ThreatSeverity.MEDIUM]: 'bg-orange-500',
    [ThreatSeverity.LOW]: 'bg-yellow-500',
};


const LiveAlertsFeed: React.FC<LiveAlertsFeedProps> = ({ alerts, onSelectAlert }) => {
  return (
    <div className="overflow-y-auto h-full pr-2">
      <ul className="space-y-3">
        {alerts.map(alert => (
          <li
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className={`p-3 rounded-md border-l-4 cursor-pointer transition-all duration-200 hover:bg-slate-700/80 ${severityColorMap[alert.severity]}`}
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${severityDotMap[alert.severity]}`}></span>
                    <p className="font-semibold text-sm">{alert.type}</p>
                    {alert.source === 'API' && (
                        <span className="text-xs font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full">API</span>
                    )}
                </div>
                <p className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Source: {alert.ip} ({alert.location})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveAlertsFeed;