import React, { useState, useEffect } from 'react';
import { AgentManifest } from '../types';
import { Modal } from './Modal';

interface ExportAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: AgentManifest | null;
}

export const ExportAgentModal: React.FC<ExportAgentModalProps> = ({ isOpen, onClose, exportData }) => {
  const [copyStatus, setCopyStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  
  const exportJsonString = exportData 
    ? JSON.stringify({
        "//": "Agent Change of Command (ACoC) Single Agent Export File",
        "exportVersion": "1.0",
        "timestamp": new Date().toISOString(),
        "agent": exportData
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
  
  const footer = (
    <>
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
    </>
  );

  return (
    <Modal 
        isOpen={isOpen}
        onClose={onClose}
        title="EXPORT AGENT MANIFEST"
        footer={footer}
        className="max-w-2xl"
    >
        <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">
          Exporting manifest for: <span className="font-bold text-pink-400">{exportData?.name}</span>
        </p>
        
        <div className="overflow-y-auto pr-2 flex-grow bg-black text-white font-mono text-xs p-4 rounded-md">
            <pre><code>{exportJsonString}</code></pre>
        </div>
    </Modal>
  );
};