import React, { useState, useEffect } from 'react';
import { ThreatSeverity } from '../types';

const locations = ['USA', 'China', 'Russia', 'Germany', 'Brazil', 'India', 'UK', 'Nigeria'];

type Status = ThreatSeverity | 'Normal';

const severityDotMap: Record<Status, string> = {
  [ThreatSeverity.HIGH]: 'bg-red-500 animate-pulse',
  [ThreatSeverity.MEDIUM]: 'bg-orange-500 animate-pulse',
  [ThreatSeverity.LOW]: 'bg-yellow-500',
  'Normal': 'bg-green-500',
};

const MonitoredRegions: React.FC = () => {
    const [regionStatus, setRegionStatus] = useState<Record<string, Status>>(
        locations.reduce((acc, loc) => ({ ...acc, [loc]: 'Normal' }), {})
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setRegionStatus(prevStatus => {
                const newStatus = { ...prevStatus };
                // 40% chance to update a region
                if (Math.random() < 0.4) {
                    const randomRegion = locations[Math.floor(Math.random() * locations.length)];
                    const severities: Status[] = [ThreatSeverity.LOW, ThreatSeverity.MEDIUM, ThreatSeverity.HIGH, 'Normal'];
                    newStatus[randomRegion] = severities[Math.floor(Math.random() * severities.length)];
                }
                return newStatus;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

  return (
     <div className="overflow-y-auto h-full pr-2">
      <ul className="space-y-3">
        {locations.map(location => (
          <li key={location} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md text-sm">
            <span className="text-slate-300">{location}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 capitalize">{regionStatus[location].toLowerCase()}</span>
                <span className={`w-3 h-3 rounded-full transition-colors ${severityDotMap[regionStatus[location]]}`}></span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MonitoredRegions;
