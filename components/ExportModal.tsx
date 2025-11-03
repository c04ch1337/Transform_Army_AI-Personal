import React, { useState, useEffect } from 'react';
import { AgentTeamManifest, AgentManifest } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: {
    team: AgentTeamManifest;
    agents: AgentManifest[];
  } | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, exportData }) => {
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  
  const exportJsonString = exportData 
    ? JSON.stringify({
        "//": "Agent Change of Command (ACoC) Export File",
        "exportVersion": "1.0",
        "timestamp": new Date().toISOString(),
        ...exportData
      }, null, 2)
    : '';

  useEffect(() => {
    if (isOpen) {
      setCopyStatus('IDLE');
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJsonString).then(() => {
      setCopyStatus('SUCCESS');
      setTimeout(() => setCopyStatus('IDLE'), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
        <h2 className="font-display text-pink-400 text-xl mb-2 text-glow-pink">EXPORT TEAM MANIFEST</h2>
        <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">
          Exporting manifest for: <span className="font-bold text-pink-400">{exportData?.team.name}</span>
        </p>
        
        <div className="overflow-y-auto pr-2 flex-grow bg-black text-white font-mono text-xs p-4 rounded-md">
            <pre><code>{exportJsonString}</code></pre>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-pink-500/30">
          <button
            onClick={handleCopy}
            className="font-display bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors w-40 text-center"
          >
            {copyStatus === 'SUCCESS' ? 'COPIED!' : 'COPY JSON'}
          </button>
          <button
            onClick={onClose}
            className="font-display bg-gray-700 text-gray-200 px-8 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};