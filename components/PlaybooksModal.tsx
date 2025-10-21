import React from 'react';
import { DEFAULT_PLAYBOOKS } from '../constants';
import { Playbook } from '../types';

interface PlaybooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPlaybooks: Playbook[];
}

const PlaybookCard: React.FC<{ playbook: Playbook }> = ({ playbook }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-full flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <h4 className="text-lg font-bold text-amber-400">{playbook.name}</h4>
            {playbook.isCustom && (
                <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full flex-shrink-0">CUSTOM</span>
            )}
        </div>
        <p className="text-xs text-slate-400 mb-3 flex-grow">{playbook.description}</p>
        <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">APPLIES TO THREATS:</p>
            <div className="flex flex-wrap gap-1">
                {playbook.appliesTo.map(t => <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{t}</span>)}
            </div>
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">STEPS:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                {playbook.steps.map((step, i) => <li key={i}>{step.action.replace(/_/g, ' ')}</li>)}
            </ol>
        </div>
    </div>
);

const PlaybooksModal: React.FC<PlaybooksModalProps> = ({ isOpen, onClose, customPlaybooks }) => {
  if (!isOpen) return null;

  const allPlaybooks = [...customPlaybooks, ...DEFAULT_PLAYBOOKS];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Response Playbooks
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlaybooks.map(playbook => (
                <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybooksModal;