import React, { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleImportClick = () => {
    setError('');
    if (!jsonInput.trim()) {
      setError('Paste a manifest to import.');
      return;
    }
    onImport(jsonInput);
  };

  const handleClose = () => {
    setJsonInput('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-pink-400 text-xl mb-2 text-glow-pink">IMPORT TEAM MANIFEST</h2>
        <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">
          Import a new team using an ACoC-compliant JSON manifest from an export file.
        </p>
        
        <div className="overflow-y-auto pr-2 flex-grow">
            <p className="font-mono text-sm text-gray-400 mb-2">Paste the full JSON content from an export file below:</p>
            <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "//": "Agent Change of Command (ACoC) Export File",
  "exportVersion": "1.0",
  ...
}`}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-xs"
                rows={15}
            />
            {error && (
              <p className="text-sm font-display text-red-400 bg-red-900/40 border border-red-500/50 p-3 rounded-md mt-4">
                {error}
              </p>
            )}
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-pink-500/30">
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
        </div>
      </div>
    </div>
  );
};