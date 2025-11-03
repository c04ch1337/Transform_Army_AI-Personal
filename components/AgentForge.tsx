import React, { useState, useEffect } from 'react';
import { AgentManifest } from '../types';
import { playClickSound } from '../utils/audio';

interface AgentForgeProps {
  allAgents: { [id: string]: AgentManifest };
  setAllAgents: React.Dispatch<React.SetStateAction<{ [id: string]: AgentManifest }>>;
  defaultAgents: { [id: string]: AgentManifest };
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

export const AgentForge: React.FC<AgentForgeProps> = ({ allAgents, setAllAgents, defaultAgents, setToast }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [manifestText, setManifestText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fix: Explicitly cast the result of Object.values to AgentManifest[] to ensure correct type inference for its elements.
  const agentList: AgentManifest[] = (Object.values(allAgents) as AgentManifest[]).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // If no agent is selected, and there are agents, select the first one
    if (!selectedAgentId && agentList.length > 0) {
      setSelectedAgentId(agentList[0].id);
    }
     // if the selected agent is no longer in the list, deselect it
    if (selectedAgentId && !allAgents[selectedAgentId]) {
      setSelectedAgentId(null);
    }
  }, [agentList, selectedAgentId, allAgents]);

  useEffect(() => {
    if (selectedAgentId && allAgents[selectedAgentId]) {
      setManifestText(JSON.stringify(allAgents[selectedAgentId], null, 2));
      setError(null);
    } else {
      setManifestText('');
    }
  }, [selectedAgentId, allAgents]);

  const handleSelectAgent = (agentId: string) => {
    playClickSound();
    setSelectedAgentId(agentId);
  };

  const handleSave = () => {
    playClickSound();
    if (!selectedAgentId) return;

    try {
      const updatedManifest = JSON.parse(manifestText);
      // Basic validation
      if (!updatedManifest.id || !updatedManifest.name || updatedManifest.schemaVersion !== "agent.v1") {
          throw new Error("Invalid manifest format. Missing required fields like 'id', 'name', or 'schemaVersion'.");
      }
      if (updatedManifest.id !== selectedAgentId) {
          throw new Error("Agent ID in the manifest does not match the selected agent. ID cannot be changed.");
      }
      
      setAllAgents(prev => ({
        ...prev,
        [selectedAgentId]: updatedManifest
      }));
      setError(null);
      setToast({ message: `Agent '${updatedManifest.name}' saved successfully!`, type: 'success' });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON format.";
      setError(message);
      setToast({ message: `Save failed: ${message}`, type: 'error' });
    }
  };

  const handleReset = () => {
    playClickSound();
    if (selectedAgentId && defaultAgents[selectedAgentId]) {
      setAllAgents(prev => ({
        ...prev,
        [selectedAgentId]: defaultAgents[selectedAgentId]
      }));
      setToast({ message: `Agent '${defaultAgents[selectedAgentId].name}' has been reset to its default state.`, type: 'success' });
    } else {
      setToast({ message: `Cannot reset: Default manifest for this agent not found.`, type: 'error' });
    }
  };

  return (
    <div className="p-4 bg-sparkle h-full flex flex-row gap-4">
      <div className="w-1/3 flex flex-col border-r-2 border-pink-500/30 pr-4">
        <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">AGENT ROSTER</h2>
        <div className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-1">
                {agentList.map(agent => (
                    <li key={agent.id}>
                        <button 
                            onClick={() => handleSelectAgent(agent.id)}
                            className={`w-full text-left font-display p-2 rounded-md transition-colors text-sm ${
                                selectedAgentId === agent.id 
                                ? 'bg-pink-600 text-white' 
                                : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                            }`}
                        >
                            {agent.display.avatar} {agent.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="w-2/3 flex flex-col">
        <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">MANIFEST EDITOR</h2>
        <div className="flex-grow flex flex-col min-h-0">
          <textarea
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
            disabled={!selectedAgentId}
            placeholder="Select an agent to view its manifest..."
            className="w-full h-full bg-gray-900 border border-gray-600 text-gray-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 font-mono text-xs flex-grow"
          />
          {error && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-500/50 text-red-300 rounded-md font-mono text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-pink-500/30 flex justify-end gap-4">
            <button
              onClick={handleReset}
              disabled={!selectedAgentId || !defaultAgents[selectedAgentId]}
              className="font-display bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
            >
              RESET TO DEFAULT
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedAgentId}
              className="font-display bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
            >
              SAVE CHANGES
            </button>
        </div>
      </div>
    </div>
  );
};