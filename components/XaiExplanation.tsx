import React from 'react';
import { XaiFeature } from '../types';

interface XaiExplanationProps {
  explanation: XaiFeature[];
}

const XaiExplanation: React.FC<XaiExplanationProps> = ({ explanation }) => {
  if (!explanation || explanation.length === 0) {
    return <p className="text-sm text-slate-500">No XAI data available.</p>;
  }

  // Normalize scores for better visualization, assuming scores are positive contributions.
  const maxScore = Math.max(...explanation.map(e => e.score), 0);

  return (
    <div className="space-y-3 text-sm">
      {explanation.map((item, index) => {
        const barWidth = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
        // Color intensity based on score
        const colorOpacity = 0.4 + (item.score / maxScore) * 0.6;
        
        return (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300">{item.feature}</span>
              <span className="font-mono text-teal-300">{item.score.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${barWidth}%`, opacity: colorOpacity }}
              ></div>
            </div>
          </div>
        );
      })}
       <p className="text-xs text-slate-500 pt-2">Higher scores indicate a stronger contribution to this threat's detection.</p>
    </div>
  );
};

export default XaiExplanation;
