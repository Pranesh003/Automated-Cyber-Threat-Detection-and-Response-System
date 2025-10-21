import React, { useState, useEffect } from 'react';
import { BlockedIP } from '../types';

interface BlockedIPsProps {
  ips: BlockedIP[];
  onUnblock: (ip: string) => void;
}

const CountdownTimer: React.FC<{ expiryTimestamp: number }> = ({ expiryTimestamp }) => {
  const [remaining, setRemaining] = useState(expiryTimestamp - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = expiryTimestamp - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        setRemaining(0);
      } else {
        setRemaining(timeLeft);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  if (remaining <= 0) {
    return <span className="text-xs text-slate-500">Expired</span>;
  }

  const minutes = Math.floor((remaining / 1000) / 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return <span className="text-xs text-slate-400">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
};


const BlockedIPs: React.FC<BlockedIPsProps> = ({ ips, onUnblock }) => {
  return (
    <div className="overflow-y-auto h-full pr-2">
      {ips.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 text-sm">No IPs currently blocked.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {ips.map(blocked => (
            <li key={blocked.ip} className="bg-slate-900/50 p-2 rounded-md flex justify-between items-center text-sm transition-colors hover:bg-slate-700/50">
              <div>
                <p className="font-mono text-slate-300">{blocked.ip}</p>
                <p className="text-xs text-slate-500">{blocked.threatType}</p>
              </div>
              <div className="flex items-center gap-4">
                 <CountdownTimer expiryTimestamp={blocked.expiresAt} />
                 <button
                    onClick={() => onUnblock(blocked.ip)}
                    className="text-red-400 hover:text-red-300 font-semibold text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    Unblock
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlockedIPs;
