import React, { useState } from 'react';
import { Modal } from './Modal';

interface ImportAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
}

export const ImportAgentModal: React.FC<ImportAgentModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleImportClick = () => {
    setError('');
    if (!jsonInput.trim()) {
      setError('Paste an agent manifest to import.');
      return;
    }
    onImport(jsonInput);
  };

  const handleClose = () => {
    setJsonInput('');
    setError('');
    onClose();
  };
  
  const footer = (
    <>
      <button
        onClick={handleImportClick}
        className="font-display bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
      >
        IMPORT
      </button>
      <button
        onClick={handleClose}
        className="font-display bg-gray-700 text-gray-200 px-8 py-2 rounded-md hover:bg-gray-600 transition-colors"
      >
        CLOSE
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="IMPORT AGENT MANIFEST"
      footer={footer}
      className="max-w-2xl"
    >
      <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">
        Import a new agent using an ACoC-compliant JSON manifest. The agent's ID must be unique.
      </p>
      
      <p className="font-mono text-sm text-gray-400 mb-2">Paste the full JSON content from a single agent export file below:</p>
      <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{
"//": "Agent Change of Command (ACoC) Single Agent Export File",
"exportVersion": "1.0",
...
"agent": { ... }
}`}
          className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-xs"
          rows={15}
      />
      {error && (
        <p className="text-sm font-display text-red-400 bg-red-900/40 border border-red-500/50 p-3 rounded-md mt-4">
          {error}
        </p>
      )}
    </Modal>
  );
};