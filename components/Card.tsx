
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg p-4 flex flex-col ${className}`}>
      <h2 className="text-lg font-semibold text-slate-200 mb-4">{title}</h2>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default Card;
