import React, { useState, useEffect } from 'react';
import { ThreatAlert, ThreatSeverity } from '../types';

type ApiEndpoint = 'ingest_alert' | 'block_ip';

interface ApiIntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIngestAlert: (alertData: Omit<ThreatAlert, 'id' | 'timestamp' | 'source'>) => boolean;
    onProgrammaticBlock: (ip: string, threatType: string) => boolean;
}

const examplePayloads: Record<ApiEndpoint, object> = {
    ingest_alert: {
        ip: "98.137.11.134",
        type: "Phishing Attempt",
        severity: "Medium",
        description: "Inbound connection from known phishing source detected by external threat intel.",
        location: "USA",
        // Fix: Add details to the example payload as it is a required field for ThreatAlert
        details: {
            targetService: "SMTP (25)",
            payloadSignature: "Phish.URL.Generic"
        }
    },
    block_ip: {
        ip: "203.0.113.75",
        reason: "Brute-force attempt on SSH"
    }
};

const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({ isOpen, onClose, onIngestAlert, onProgrammaticBlock }) => {
    const [endpoint, setEndpoint] = useState<ApiEndpoint>('ingest_alert');
    const [payload, setPayload] = useState(JSON.stringify(examplePayloads[endpoint], null, 2));
    const [response, setResponse] = useState<string | null>(null);

    useEffect(() => {
        setPayload(JSON.stringify(examplePayloads[endpoint], null, 2));
        setResponse(null);
    }, [endpoint]);

    const handleSendRequest = () => {
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(payload);
        } catch (error) {
            setResponse(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }, null, 2));
            return;
        }

        let success = false;
        if (endpoint === 'ingest_alert') {
            // Fix: Destructure 'details' and provide a default to satisfy the ThreatAlert type.
            const { ip, type, severity, description, location, details } = parsedPayload;
            if (ip && type && severity && description && location && Object.values(ThreatSeverity).includes(severity)) {
                 success = onIngestAlert({ ip, type, severity, description, location, details: details || { targetService: 'Unknown', payloadSignature: 'API.Ingest.Generic' } });
            }
        } else if (endpoint === 'block_ip') {
            const { ip, reason } = parsedPayload;
            if (ip && reason) {
                success = onProgrammaticBlock(ip, reason);
            }
        }
        
        if (success) {
             setResponse(JSON.stringify({ success: true, message: 'Action completed successfully.' }, null, 2));
        } else {
             setResponse(JSON.stringify({ success: false, error: 'Request failed. Check payload or system state (e.g., Live Defense Mode).' }, null, 2));
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                        API Integration
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="endpoint-select" className="block text-sm font-medium text-slate-400 mb-2">Endpoint</label>
                        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-md">
                            <span className="font-semibold text-slate-200 bg-slate-700 px-3 py-1.5 rounded-md">POST</span>
                            <select
                                id="endpoint-select"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value as ApiEndpoint)}
                                className="w-full bg-transparent text-slate-200 focus:outline-none"
                            >
                                <option value="ingest_alert" className="bg-slate-800">/api/v1/alerts</option>
                                <option value="block_ip" className="bg-slate-800">/api/v1/actions/block-ip</option>
                            </select>
                        </div>

                        <label htmlFor="payload-editor" className="block text-sm font-medium text-slate-400 mt-4 mb-2">Payload</label>
                        <textarea
                            id="payload-editor"
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            className="w-full h-48 font-mono text-sm bg-slate-900/50 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            spellCheck="false"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Response</label>
                        <pre className="w-full h-full font-mono text-sm bg-slate-900/50 border border-slate-700 rounded-md p-3 overflow-auto">
                            {response ? response : <span className="text-slate-500">Click "Send Request" to see the response.</span>}
                        </pre>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors">
                        Close
                    </button>
                    <button onClick={handleSendRequest} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiIntegrationModal;