import React, { useState, useEffect, useMemo } from 'react';
import { ThreatAlert, ThreatSeverity, ActionType, ThreatActorProfile, Playbook, PlaybookAction, PlaybookStep } from '../types';
import { generateThreatSummary, getThreatAttribution } from '../services/geminiService';
import { DEFAULT_PLAYBOOKS } from '../constants';
import ConfirmationModal from './ConfirmationModal';
import XaiExplanation from './XaiExplanation';

interface ThreatDetailsModalProps {
  alert: ThreatAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onRunPlaybook: (playbook: Playbook, alert: ThreatAlert) => Promise<boolean>;
  customPlaybooks: Playbook[];
}

const severityClasses: Record<ThreatSeverity, string> = {
    [ThreatSeverity.HIGH]: 'bg-red-500 text-white',
    [ThreatSeverity.MEDIUM]: 'bg-orange-500 text-white',
    [ThreatSeverity.LOW]: 'bg-yellow-500 text-slate-900',
};

const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\s*[\*-]\s(.*)/gm, '<ul class="list-disc list-inside"><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul class="list-disc list-inside">/g, '')
        .replace(/^\s*\d+\.\s(.*)/gm, '<ol class="list-decimal list-inside"><li>$1</li></ol>')
        .replace(/<\/ol>\n<ol class="list-decimal list-inside">/g, '')
        .replace(/\n/g, '<br />');
};

const ThreatDetailsModal: React.FC<ThreatDetailsModalProps> = ({ alert, isOpen, onClose, onRunPlaybook, customPlaybooks }) => {
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [threatActorProfile, setThreatActorProfile] = useState<ThreatActorProfile | null>(null);
  const [isLoadingAttribution, setIsLoadingAttribution] = useState(false);
  const [isPlaybookRunning, setIsPlaybookRunning] = useState(false);
  const [playbookRunStatus, setPlaybookRunStatus] = useState<Record<number, 'pending' | 'running' | 'completed' | 'failed'>>({});
  const [playbookComplete, setPlaybookComplete] = useState(false);
  
  const [confirmation, setConfirmation] = useState<{
    playbook: Playbook;
    title: string;
    message: React.ReactNode;
  } | null>(null);

  const selectedPlaybook = useMemo(() => {
    if (!alert) return null;
    
    // 1. Search custom playbooks first
    const customMatch = customPlaybooks.find(p => p.appliesTo.includes(alert.type));
    if (customMatch) return customMatch;

    // 2. Fallback to default playbooks
    const defaultMatch = DEFAULT_PLAYBOOKS.find(p => p.appliesTo.includes(alert.type));
    if (defaultMatch) return defaultMatch;
    
    // 3. Final fallback to a generic triage playbook
    return DEFAULT_PLAYBOOKS.find(p => p.id === 'PB-003') || DEFAULT_PLAYBOOKS[0];
  }, [alert, customPlaybooks]);

  useEffect(() => {
    if (isOpen && alert) {
      setIsLoadingSummary(true);
      setIsLoadingAttribution(true);
      setSummary('');
      setThreatActorProfile(null);
      setIsPlaybookRunning(false);
      setPlaybookComplete(false);
      setPlaybookRunStatus({});

      const fetchSummary = async () => {
        try {
          const result = await generateThreatSummary(alert);
          setSummary(result);
        } finally {
          setIsLoadingSummary(false);
        }
      };

      const fetchAttribution = async () => {
        try {
            const result = await getThreatAttribution(alert);
            setThreatActorProfile(result);
        } finally {
            setIsLoadingAttribution(false);
        }
      };

      fetchSummary();
      fetchAttribution();
    }
  }, [isOpen, alert]);

  if (!isOpen || !alert || !selectedPlaybook) return null;

  const handleRunPlaybookClick = () => {
    const confidence = threatActorProfile?.confidence ?? 1.0;
    let message: React.ReactNode = `You are about to run the "${selectedPlaybook.name}" playbook. This will execute ${selectedPlaybook.steps.length} automated action(s).`;
    
    if (confidence < 0.6) {
        message = (
            <>
                <p>{message}</p>
                <p className="mt-3 p-2 bg-orange-500/20 text-orange-300 rounded-md text-sm">
                    <strong className="font-bold">Low Confidence Warning:</strong> The AI attribution confidence is only <strong>{(confidence * 100).toFixed(0)}%</strong>. Proceed with caution.
                </p>
            </>
        );
    }

    setConfirmation({
        playbook: selectedPlaybook,
        title: 'Confirm Playbook Execution',
        message: message,
    });
  };
  
  const handleConfirmAction = async () => {
    if (!confirmation) return;
    const { playbook } = confirmation;
    setConfirmation(null);
    setIsPlaybookRunning(true);
    setPlaybookRunStatus(playbook.steps.reduce((acc, _, i) => ({ ...acc, [i]: 'pending' }), {}));

    for (let i = 0; i < playbook.steps.length; i++) {
        setPlaybookRunStatus(prev => ({ ...prev, [i]: 'running' }));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency/processing
        
        const success = await onRunPlaybook(playbook, alert); // This should be step-by-step
        
        // Simplified: assume whole playbook succeeds or fails. A real implementation would be step-by-step.
        setPlaybookRunStatus(prev => ({ ...prev, [i]: success ? 'completed' : 'failed' }));
        if (!success) {
            break; // Stop on failure
        }
    }
    
    setPlaybookComplete(true);
    // Note: In a real app, you wouldn't close automatically. We leave it open to see results.
  };

  const getConfidenceColor = (score: number) => {
    if (score > 0.8) return 'bg-red-500';
    if (score > 0.6) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const statusIcons: Record<string, React.ReactNode> = {
      pending: <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="1, 4" /></svg>,
      running: <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>,
      completed: <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      failed: <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };


  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={isPlaybookRunning && !playbookComplete ? undefined : onClose}
      >
        <div 
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Threat Details</h2>
            <button onClick={onClose} disabled={isPlaybookRunning && !playbookComplete} className="text-slate-400 hover:text-white text-2xl leading-none disabled:opacity-50">&times;</button>
          </div>

          <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                  <div className="bg-slate-900/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">Alert Details</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div><strong className="text-slate-400">Timestamp:</strong></div><div><span className="text-slate-200">{new Date(alert.timestamp).toLocaleString()}</span></div>
                          <div><strong className="text-slate-400">Source IP:</strong></div><div><span className="text-slate-200 font-mono">{alert.ip}</span></div>
                          <div><strong className="text-slate-400">Threat Type:</strong></div><div><span className="text-slate-200">{alert.type}</span></div>
                          <div><strong className="text-slate-400">Target Service:</strong></div><div><span className="text-slate-200">{alert.details.targetService}</span></div>
                          <div><strong className="text-slate-400">Severity:</strong></div><div><span className={`px-2 py-1 text-xs font-bold rounded ${severityClasses[alert.severity]}`}>{alert.severity}</span></div>
                      </div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold text-purple-400 mb-3">Threat Attribution Engine</h3>
                        {isLoadingAttribution ? (
                             <div className="flex items-center space-x-2 text-slate-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div><span>Analyzing attribution...</span></div>
                        ) : threatActorProfile ? (
                            <div className="space-y-3 text-sm">
                                <div><strong className="text-slate-400">Suspected Group:</strong><p className="text-lg font-bold text-purple-300">{threatActorProfile.threatActorGroup}</p></div>
                                <div><strong className="text-slate-400">Confidence:</strong><div className="flex items-center gap-2 mt-1"><div className="w-full bg-slate-700 rounded-full h-2.5"><div className={`${getConfidenceColor(threatActorProfile.confidence)} h-2.5 rounded-full`} style={{ width: `${threatActorProfile.confidence * 100}%`}}></div></div><span className="font-mono text-purple-300">{(threatActorProfile.confidence * 100).toFixed(0)}%</span></div></div>
                                <div><strong className="text-slate-400">Primary Motivation:</strong><p className="text-slate-200">{threatActorProfile.motivation}</p></div>
                                <div><strong className="text-slate-400">Associated TTPs (MITRE ATT&CK):</strong><div className="flex flex-wrap gap-2 mt-2">{threatActorProfile.mitreTTPs.map(ttp => (<a key={ttp} href={`https://attack.mitre.org/techniques/${ttp.replace('.', '/')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-md transition-colors">{ttp}</a>))}</div></div>
                            </div>
                        ) : ( <p className="text-sm text-slate-500">Could not determine attribution.</p>)}
                  </div>
              </div>
              
              <div className="space-y-6">
                  <div className="bg-slate-900/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-amber-400 mb-2">Automated Response Playbook</h3>
                      <div className="mb-4 flex items-center gap-3">
                        <div>
                            <p className="font-bold text-slate-200">{selectedPlaybook.name}</p>
                            <p className="text-xs text-slate-400">{selectedPlaybook.description}</p>
                        </div>
                        {selectedPlaybook.isCustom && (
                             <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full self-start flex-shrink-0">CUSTOM</span>
                        )}
                      </div>
                      <ul className="space-y-3">
                        {selectedPlaybook.steps.map((step, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm">
                                {statusIcons[playbookRunStatus[index] || 'pending']}
                                <span className="text-slate-300">{step.action.replace('_', ' ')}</span>
                                <span className="text-slate-500 text-xs flex-1 truncate">({step.description})</span>
                            </li>
                        ))}
                      </ul>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-sky-400 mb-2">AI-Generated Analysis</h3>
                      {isLoadingSummary ? (
                          <div className="flex items-center space-x-2 text-slate-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-400"></div><span>Generating summary...</span></div>
                      ) : (
                          <div className="prose prose-sm prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(summary) }} />
                      )}
                  </div>
              </div>
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end space-x-2">
              <button 
                  onClick={onClose} 
                  disabled={isPlaybookRunning && !playbookComplete}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                  Close
              </button>
              <button 
                  onClick={handleRunPlaybookClick}
                  disabled={isPlaybookRunning || playbookComplete}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center justify-center gap-2 w-44 disabled:bg-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                  {isPlaybookRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Executing...</span>
                      </>
                  ) : playbookComplete ? 'Playbook Finished' : 'Run Playbook'
                  }
              </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={!!confirmation}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmAction}
        title={confirmation?.title || 'Confirm Action'}
      >
        <div className="text-sm text-slate-300">{confirmation?.message}</div>
      </ConfirmationModal>
    </>
  );
};

export default ThreatDetailsModal;