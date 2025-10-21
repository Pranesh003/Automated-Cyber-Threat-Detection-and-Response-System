
import React, { useState, useEffect, useCallback } from 'react';
import { ActionType, ThreatAlert, NetworkDataPoint, Toast as ToastType, BlockedIP, Packet, ThreatSeverity, Settings, LogEntry, Honeypot, HoneypotLog, Playbook, PlaybookAction } from './types';
import { INITIAL_ALERTS, INITIAL_NETWORK_DATA, generateNewAlert, generateNewDataPoint, DEMO_BLOCK_DURATION_MS, generateNewPacket, INITIAL_HONEYPOTS, generateNewHoneypotLog, DEFAULT_PLAYBOOKS } from './constants';
import * as loggingService from './services/loggingService';
import Card from './components/Card';
import NetworkActivityChart from './components/NetworkActivityChart';
import LiveAlertsFeed from './components/LiveAlertsFeed';
import ThreatDetailsModal from './components/ThreatDetailsModal';
import StatCard from './components/StatCard';
import BlockedIPs from './components/BlockedIPs';
import LivePacketMonitor from './components/LivePacketMonitor';
import Chatbot from './components/Chatbot';
import ApiIntegrationModal from './components/ApiIntegrationModal';
import SettingsModal from './components/SettingsModal';
import AuditLogModal from './components/AuditLogModal';
import HoneynetMonitor from './components/HoneynetMonitor';
import PlaybooksModal from './components/PlaybooksModal';

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const ShieldOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
const ApiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;


const Toast: React.FC<{ toast: ToastType; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 5000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);
    return (
      <div className={`w-full max-w-sm rounded-lg shadow-lg p-4 border-l-4 flex items-center justify-between animate-fade-in-right bg-slate-800`}>
        <p className="text-slate-300">{toast.message}</p>
        <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-white text-xl">&times;</button>
      </div>
    );
};

const App: React.FC = () => {
    const [alerts, setAlerts] = useState<ThreatAlert[]>(INITIAL_ALERTS);
    const [networkData, setNetworkData] = useState<NetworkDataPoint[]>(INITIAL_NETWORK_DATA);
    const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>(() => {
        try {
            const saved = localStorage.getItem('blockedIPs');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [isLiveDefenseMode, setIsLiveDefenseMode] = useState(false);
    const [livePackets, setLivePackets] = useState<Packet[]>(() => Array.from({ length: 50 }, generateNewPacket));
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
    const [isPlaybooksModalOpen, setIsPlaybooksModalOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
    const [honeypots, setHoneypots] = useState<Honeypot[]>(INITIAL_HONEYPOTS);
    const [honeypotLogs, setHoneypotLogs] = useState<HoneypotLog[]>([]);
    const [customPlaybooks, setCustomPlaybooks] = useState<Playbook[]>(() => {
        try {
            const saved = localStorage.getItem('customPlaybooks');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load custom playbooks", e);
        }
        // Add a sample custom playbook for demo purposes if none exist
        return [
            {
                id: `cpb-${Date.now()}`,
                name: 'Custom SQLi Response',
                description: 'User-defined rapid response for SQL Injection attempts.',
                appliesTo: ['SQL Injection'],
                steps: [
                    { action: 'BLOCK_IP', description: 'Immediately block the source IP at the edge firewall.' },
                    { action: 'NOTIFY_SOC_LEAD', description: 'Alert L2 analyst and DB admin for investigation.' }
                ],
                isCustom: true,
            }
        ];
    });
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const saved = localStorage.getItem('actdrsSettings');
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                notificationsEnabled: parsed.notificationsEnabled ?? false,
                notificationEndpoint: parsed.notificationEndpoint ?? '',
                mediumSeverityThreshold: parsed.mediumSeverityThreshold ?? 150,
                highSeverityThreshold: parsed.highSeverityThreshold ?? 200,
            };
        } catch {
            return {
                notificationsEnabled: false,
                notificationEndpoint: '',
                mediumSeverityThreshold: 150,
                highSeverityThreshold: 200,
            };
        }
    });

    const refreshLogs = useCallback(() => {
        setAuditLogs(loggingService.getLogs());
    }, []);

    useEffect(() => {
        refreshLogs();
    }, [refreshLogs]);


    useEffect(() => {
        localStorage.setItem('blockedIPs', JSON.stringify(blockedIPs));
    }, [blockedIPs]);

    useEffect(() => {
        localStorage.setItem('actdrsSettings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        try {
            localStorage.setItem('customPlaybooks', JSON.stringify(customPlaybooks));
        } catch (e) {
            console.error("Failed to save custom playbooks", e);
        }
    }, [customPlaybooks]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);
    
    useEffect(() => {
        const alertInterval = setInterval(() => {
            const newAlert = generateNewAlert();
            if (settings.notificationsEnabled && newAlert.severity === ThreatSeverity.HIGH) {
                const message = `High-severity threat detected: ${newAlert.type} from ${newAlert.ip}. Sending alert to ${settings.notificationEndpoint}.`;
                loggingService.addLog(message);
                refreshLogs();
                addToast(`High-severity alert: ${newAlert.type}`, 'error');
            }
            setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 49)]);
        }, 3000);

        const networkInterval = setInterval(() => {
            const newDataPoint = generateNewDataPoint();
            const { highSeverityThreshold, mediumSeverityThreshold } = settings;
            const incomingTraffic = newDataPoint.incoming;

            if (highSeverityThreshold > 0 && incomingTraffic > highSeverityThreshold) {
                setAlerts(prevAlerts => [{
                    id: `alert-thresh-high-${Date.now()}`, timestamp: new Date().toISOString(), ip: 'N/A (Network Wide)',
                    type: 'Anomalous Traffic Volume', severity: ThreatSeverity.HIGH,
                    description: `Incoming traffic of ${incomingTraffic} MB/s exceeded high severity threshold of ${highSeverityThreshold} MB/s.`,
                    location: 'Internal Monitor', details: { targetService: 'Network Infrastructure', payloadSignature: 'Traffic.Volume.Anomaly' },
                }, ...prevAlerts.slice(0, 49)]);
            } else if (mediumSeverityThreshold > 0 && incomingTraffic > mediumSeverityThreshold) {
                setAlerts(prevAlerts => [{
                    id: `alert-thresh-med-${Date.now()}`, timestamp: new Date().toISOString(), ip: 'N/A (Network Wide)',
                    type: 'Anomalous Traffic Volume', severity: ThreatSeverity.MEDIUM,
                    description: `Incoming traffic of ${incomingTraffic} MB/s exceeded medium severity threshold of ${mediumSeverityThreshold} MB/s.`,
                    location: 'Internal Monitor', details: { targetService: 'Network Infrastructure', payloadSignature: 'Traffic.Volume.Anomaly' },
                }, ...prevAlerts.slice(0, 49)]);
            }

            setNetworkData(prevData => [...prevData.slice(1), newDataPoint]);
        }, 2000);
        
        const packetInterval = setInterval(() => setLivePackets(prev => [generateNewPacket(), ...prev.slice(0, 99)]), 500);
        
        const honeypotInterval = setInterval(() => {
            const newLog = generateNewHoneypotLog(honeypots);
            setHoneypotLogs(prev => [newLog, ...prev.slice(0, 49)]);
            const newAlert = generateNewAlert(newLog);
            setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
            addToast(`Honeypot alert: ${newLog.summary}`, 'error');
        }, 5500);

        return () => { clearInterval(alertInterval); clearInterval(networkInterval); clearInterval(packetInterval); clearInterval(honeypotInterval); };
    }, [settings, addToast, refreshLogs, honeypots]);
    
    useEffect(() => {
        const expiryInterval = setInterval(() => {
            const now = Date.now();
            const expired = blockedIPs.filter(ip => ip.expiresAt <= now);
            if (expired.length > 0) {
                setBlockedIPs(currentBlocked => currentBlocked.filter(ip => ip.expiresAt > now));
                expired.forEach(ip => {
                    const message = `IP ${ip.ip} auto-unblocked after expiry.`;
                    addToast(message, 'info');
                    loggingService.addLog(message);
                    refreshLogs();
                });
            }
        }, 1000);

        return () => clearInterval(expiryInterval);
    }, [blockedIPs, addToast, refreshLogs]);

    const handleSelectAlert = useCallback((alert: ThreatAlert) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedAlert(null);
    }, []);
    
    const handleRunPlaybook = useCallback(async (playbook: Playbook, alert: ThreatAlert): Promise<boolean> => {
        for (const step of playbook.steps) {
             let message = '';
            if (!isLiveDefenseMode && (step.action === 'BLOCK_IP' || step.action === 'ISOLATE_HOST')) {
                message = `Simulation Mode: Action '${step.action}' for ${alert.ip} logged.`;
                addToast(message, 'info');
                loggingService.addLog(message, step.action);
                continue;
            }

            switch (step.action) {
                case 'BLOCK_IP':
                    if (!blockedIPs.some(b => b.ip === alert.ip)) {
                        const newBlockedIP: BlockedIP = { ip: alert.ip, expiresAt: Date.now() + DEMO_BLOCK_DURATION_MS, threatType: alert.type };
                        setBlockedIPs(prev => [newBlockedIP, ...prev].sort((a,b) => b.expiresAt - a.expiresAt));
                        message = `IP ${alert.ip} blocked for threat: ${alert.type}.`;
                        addToast(message, 'success');
                    } else {
                        message = `IP ${alert.ip} is already blocked.`;
                        addToast(message, 'info');
                    }
                    break;
                case 'ISOLATE_HOST': message = `Host isolation initiated for ${alert.ip}.`; addToast(message, 'info'); break;
                case 'SNAPSHOT_DISK': message = `Forensic disk snapshot started for ${alert.ip}.`; addToast(message, 'info'); break;
                case 'NOTIFY_SOC_LEAD': message = `High-priority notification sent to SOC Lead for alert ${alert.type}.`; addToast(message, 'info'); break;
            }
            if (message) {
                loggingService.addLog(message, step.action);
            }
        }
        refreshLogs();
        return true; // Simplified for demo
    }, [blockedIPs, addToast, isLiveDefenseMode, refreshLogs]);

    const handleUnblockIp = useCallback((ip: string, source: 'manual' | 'rollback' = 'manual') => {
        setBlockedIPs(prev => prev.filter(blockedIp => blockedIp.ip !== ip));
        const message = source === 'manual'
            ? `IP ${ip} has been manually unblocked.`
            : `IP ${ip} was unblocked due to a rollback action.`;
        
        if (source === 'manual') {
            addToast(`IP ${ip} has been manually unblocked.`, 'success');
        }
        loggingService.addLog(message);
        refreshLogs();
    }, [addToast, refreshLogs]);
    
    const handleIngestAlert = useCallback((alertData: Omit<ThreatAlert, 'id' | 'timestamp' | 'source'>) => {
        const newAlert: ThreatAlert = {
            ...alertData, id: `alert-api-${Date.now()}`, timestamp: new Date().toISOString(), source: 'API',
        };
        setAlerts(prev => [newAlert, ...prev]);
        const message = `New alert for ${newAlert.ip} ingested via API.`;
        addToast(message, 'success');
        loggingService.addLog(message);
        refreshLogs();
        return true;
    }, [addToast, refreshLogs]);

    const handleProgrammaticBlock = useCallback((ip: string, threatType: string) => {
        let message = '';
        if (!isLiveDefenseMode) {
            message = `Simulation Mode: API request to block ${ip} logged.`;
            addToast(message, 'info');
            loggingService.addLog(message, 'BLOCK_IP');
            refreshLogs();
            return true;
        }
        if (!blockedIPs.some(b => b.ip === ip)) {
            const newBlockedIP: BlockedIP = { ip, expiresAt: Date.now() + DEMO_BLOCK_DURATION_MS, threatType };
            setBlockedIPs(prev => [newBlockedIP, ...prev].sort((a,b) => b.expiresAt - a.expiresAt));
            message = `IP ${ip} blocked via API for reason: ${threatType}.`;
            addToast(message, 'success');
            loggingService.addLog(message, 'BLOCK_IP');
            refreshLogs();
            return true;
        } else {
            addToast(`API request to block ${ip} ignored: already blocked.`, 'info');
            return false;
        }
    }, [isLiveDefenseMode, blockedIPs, addToast, refreshLogs]);

    const handleSaveSettings = useCallback((newSettings: Settings) => {
        setSettings(newSettings);
        const message = 'Settings saved.';
        addToast(message, 'success');
        loggingService.addLog(message);
        refreshLogs();
        setIsSettingsModalOpen(false);
    }, [addToast, refreshLogs]);

    const handleClearLogs = useCallback(() => {
        loggingService.clearLogs();
        refreshLogs();
        addToast("Audit logs cleared.", 'info');
    }, [refreshLogs, addToast]);
    
    const handleRollbackAction = useCallback((log: LogEntry) => {
        const ipToUnblock = log.message.match(/(\d{1,3}(\.\d{1,3}){3})/)?.[0];
        if (ipToUnblock) {
            handleUnblockIp(ipToUnblock, 'rollback');
            loggingService.markLogAsRolledBack(log.id);
            addToast(`Rolled back action: unblocked ${ipToUnblock}`, 'success');
            refreshLogs();
        }
    }, [handleUnblockIp, addToast, refreshLogs]);

    const handleDefenseModeToggle = () => {
        const newMode = !isLiveDefenseMode;
        setIsLiveDefenseMode(newMode);
        const message = `Defense mode set to: ${newMode ? 'LIVE' : 'SIMULATION'}.`;
        addToast(message, newMode ? 'error' : 'info');
        loggingService.addLog(message);
        refreshLogs();
    };


    const highSeverityCount = alerts.filter(a => a.severity === 'High').length;
    const mediumSeverityCount = alerts.filter(a => a.severity === 'Medium').length;


    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-4 lg:p-6">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3"><ShieldIcon /><h1 className="text-2xl font-bold text-slate-100">ACTDRS Dashboard</h1></div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsPlaybooksModalOpen(true)} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="View Playbooks"><BookIcon /></button>
                    <button onClick={() => setIsAuditLogModalOpen(true)} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Audit Log"><HistoryIcon /></button>
                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Settings"><SettingsIcon /></button>
                    <button onClick={() => setIsApiModalOpen(true)} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="API Integration"><ApiIcon /></button>
                    <span className="w-px h-6 bg-slate-700"></span>
                    <span className={`text-sm font-bold ${isLiveDefenseMode ? 'text-red-400' : 'text-green-400'}`}>{isLiveDefenseMode ? 'LIVE DEFENSE MODE' : 'SIMULATION MODE'}</span>
                    <label htmlFor="defense-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="defense-toggle" className="sr-only peer" checked={isLiveDefenseMode} onChange={handleDefenseModeToggle} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total Alerts (Live)" value={alerts.length} icon={<AlertTriangleIcon/>} colorClass="bg-sky-500/30 text-sky-300" />
                <StatCard title="High Severity" value={highSeverityCount} icon={<AlertTriangleIcon/>} colorClass="bg-red-500/30 text-red-300" />
                <StatCard title="Medium Severity" value={mediumSeverityCount} icon={<AlertTriangleIcon/>} colorClass="bg-orange-500/30 text-orange-300" />
                <StatCard title="Blocked IPs" value={blockedIPs.length} icon={<ShieldOffIcon/>} colorClass="bg-slate-500/30 text-slate-300" />
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card title="Real-time Network Traffic" className="lg:col-span-3"><div className="h-64"><NetworkActivityChart data={networkData} /></div></Card>
                <Card title="Honeynet Monitor"><div className="h-64"><HoneynetMonitor honeypots={honeypots} logs={honeypotLogs} /></div></Card>
                <Card title="Live Threat Alerts" className="lg:col-span-2"><div className="h-96"><LiveAlertsFeed alerts={alerts} onSelectAlert={handleSelectAlert} /></div></Card>
                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card title="Live Packet Monitor"><div className="h-96 sm:h-auto"><LivePacketMonitor packets={livePackets} /></div></Card>
                    <Card title="Blocked IPs"><div className="h-96 sm:h-auto"><BlockedIPs ips={blockedIPs} onUnblock={handleUnblockIp} /></div></Card>
                </div>
            </main>

            <ThreatDetailsModal isOpen={isModalOpen} alert={selectedAlert} onClose={handleCloseModal} onRunPlaybook={handleRunPlaybook} customPlaybooks={customPlaybooks} />
            <ApiIntegrationModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} onIngestAlert={handleIngestAlert} onProgrammaticBlock={handleProgrammaticBlock} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSave={handleSaveSettings} />
            <AuditLogModal isOpen={isAuditLogModalOpen} onClose={() => setIsAuditLogModalOpen(false)} logs={auditLogs} onClearLogs={handleClearLogs} onRollback={handleRollbackAction} />
            <PlaybooksModal isOpen={isPlaybooksModalOpen} onClose={() => setIsPlaybooksModalOpen(false)} customPlaybooks={customPlaybooks} />

            <div className="fixed bottom-4 right-20 z-[100] w-full max-w-sm space-y-3">
                {toasts.map(toast => (<Toast key={toast.id} toast={toast} onDismiss={removeToast} />))}
            </div>
            
            <Chatbot />
        </div>
    );
};

export default App;
