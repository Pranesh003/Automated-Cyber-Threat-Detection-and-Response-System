import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-lg p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
