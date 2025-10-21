import React from 'react';
import { Packet } from '../types';

const protocolColorMap: Record<Packet['protocol'], string> = {
  'TCP': 'text-cyan-400',
  'UDP': 'text-purple-400',
  'ICMP': 'text-yellow-400',
};

const LivePacketMonitor: React.FC<{ packets: Packet[] }> = ({ packets }) => {
  return (
    <div className="overflow-y-auto h-full font-mono text-xs bg-slate-900/50 rounded-md p-2">
      <div className="grid grid-cols-[1fr,1fr,4rem] gap-x-2 text-slate-500 mb-2 px-2">
        <span>Source</span>
        <span>Destination</span>
        <span className="text-right">Size</span>
      </div>
      <ul className="space-y-1 pr-2">
        {packets.map(packet => (
          <li key={packet.id} className="p-2 rounded-md bg-slate-800/50 animate-fade-in-fast">
            <div className="grid grid-cols-[1fr,1fr,4rem] gap-x-2 items-center">
              <span className="truncate text-slate-300">{packet.sourceIp}:{packet.sourcePort}</span>
              <span className="truncate text-slate-300">{packet.destIp}:{packet.destPort}</span>
              <span className="text-right text-slate-400">{packet.size} B</span>
            </div>
             <div className="flex items-center justify-between mt-1 text-slate-500">
                <span className={protocolColorMap[packet.protocol]}>{packet.protocol}</span>
                <span>{new Date(packet.timestamp).toLocaleTimeString()}</span>
             </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LivePacketMonitor;
