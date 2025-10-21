import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(currentSettings);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSettings(prev => ({ ...prev, notificationEndpoint: e.target.value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value, 10),
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div 
            className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    Settings
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Notifications</h3>
                    <div className="bg-slate-900/50 p-4 rounded-md">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                                checked={currentSettings.notificationsEnabled}
                                onChange={handleCheckboxChange}
                            />
                            <span className="text-slate-300">Enable notifications for high-severity threats</span>
                        </label>
                        <div className={`mt-4 transition-all duration-300 ${currentSettings.notificationsEnabled ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                            <label htmlFor="endpoint-input" className="block text-sm font-medium text-slate-400 mb-1">
                                Notification Endpoint
                            </label>
                            <input
                                type="text"
                                id="endpoint-input"
                                value={currentSettings.notificationEndpoint}
                                onChange={handleInputChange}
                                placeholder="e.g., analyst@company.com or webhook URL"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <p className="text-xs text-slate-500 mt-1">Simulated: Notifications will be logged to the console.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Alert Thresholds</h3>
                    <div className="bg-slate-900/50 p-4 rounded-md space-y-4">
                        <div>
                            <label htmlFor="high-threshold-input" className="block text-sm font-medium text-slate-400 mb-1">
                                High Severity Threshold (MB/s)
                            </label>
                            <input
                                type="number"
                                id="high-threshold-input"
                                name="highSeverityThreshold"
                                value={currentSettings.highSeverityThreshold}
                                onChange={handleNumberInputChange}
                                placeholder="e.g., 200"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="medium-threshold-input" className="block text-sm font-medium text-slate-400 mb-1">
                                Medium Severity Threshold (MB/s)
                            </label>
                            <input
                                type="number"
                                id="medium-threshold-input"
                                name="mediumSeverityThreshold"
                                value={currentSettings.mediumSeverityThreshold}
                                onChange={handleNumberInputChange}
                                placeholder="e.g., 150"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Triggers an 'Anomalous Traffic Volume' alert when incoming traffic exceeds these values.</p>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors">
                    Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">
                    Save Settings
                </button>
            </div>
        </div>
    </div>
  );
};

export default SettingsModal;