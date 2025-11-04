import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';
import { Modal } from './Modal';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    playClickSound();
    if (!name.trim() || !description.trim()) {
      setError('Please provide both a name and a description for the new agent.');
      return;
    }
    onCreate(name, description);
    // Reset state for next time
    setName('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    // Reset state on close
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const footer = (
    <>
      <button
        onClick={handleClose}
        className="font-display bg-gray-700 text-gray-200 px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
      >
        CANCEL
      </button>
      <button
        onClick={handleCreate}
        className="font-display bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
      >
        CREATE AGENT
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CREATE NEW AGENT"
      footer={footer}
    >
      <div className="space-y-4">
          <div>
              <label htmlFor="agentName" className="block text-xs font-display text-pink-400 mb-1 tracking-widest">AGENT NAME</label>
              <input
                  id="agentName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Meme-Master"
                  className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
              />
          </div>
          <div>
              <label htmlFor="agentDescription" className="block text-xs font-display text-pink-400 mb-1 tracking-widest">AGENT DESCRIPTION</label>
              <textarea
                  id="agentDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short, clear description of the agent's purpose."
                  className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                  rows={3}
              />
          </div>
            {error && (
              <p className="text-sm font-display text-red-400 bg-red-900/40 border border-red-500/50 p-3 rounded-md">
                  {error}
              </p>
          )}
      </div>
    </Modal>
  );
};