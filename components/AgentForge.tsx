import React, { useState, useEffect } from 'react';
import { AgentManifest } from '../types';
import { playClickSound } from '../utils/audio';
import { generateAvatarImage } from '../services/imagenService';
import { Avatar } from './Avatar';
import { useMission } from '../App';
import { allAgents as defaultAgents } from '../constants';
import { Tooltip } from './Tooltip';

const AVATAR_STYLES = [
    "pixel art emoji",
    "flat design icon",
    "3D render",
    "vector logo",
    "kawaii doodle",
    "synthwave",
];

export const AgentForge: React.FC = () => {
  const { 
      allAgents, 
      setAllAgents, 
      toast,
      setToast, 
      selectedAgentId,
      setSelectedAgentId,
      setIsCreateAgentModalOpen,
      setIsImportAgentModalOpen,
      setIsDeleteAgentModalOpen,
      handleExportAgent,
    } = useMission();

  const [manifestText, setManifestText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<string>(AVATAR_STYLES[0]);

  const agentList: AgentManifest[] = (Object.values(allAgents) as AgentManifest[]).sort((a, b) => a.name.localeCompare(b.name));
  const isDefaultAgent = selectedAgentId ? !!defaultAgents[selectedAgentId] : false;

  useEffect(() => {
    // If no agent is selected, and there are agents, select the first one
    if (!selectedAgentId && agentList.length > 0) {
      setSelectedAgentId(agentList[0].id);
    }
     // if the selected agent is no longer in the list, deselect it
    if (selectedAgentId && !allAgents[selectedAgentId]) {
      setSelectedAgentId(null);
    }
  }, [agentList, selectedAgentId, allAgents, setSelectedAgentId]);

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
  
  const handleGenerateAvatar = async () => {
    playClickSound();
    if (!selectedAgentId) return;

    const agent = allAgents[selectedAgentId];
    setIsGeneratingAvatar(true);
    try {
        const imageDataUrl = await generateAvatarImage(agent.name, agent.description, avatarStyle);
        const updatedManifest = {
            ...agent,
            display: {
                ...agent.display,
                avatar: imageDataUrl,
            }
        };
        // Update both the editor and the main state for immediate feedback
        setManifestText(JSON.stringify(updatedManifest, null, 2));
        setAllAgents(prev => ({
            ...prev,
            [selectedAgentId]: updatedManifest
        }));
        setToast({ message: "Avatar generated! Don't forget to save.", type: 'success' });
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setToast({ message: `Avatar generation failed: ${message}`, type: 'error' });
    } finally {
        setIsGeneratingAvatar(false);
    }
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
        <div className="flex items-center justify-between border-b-2 border-pink-500/30 pb-2 mb-2 gap-2">
            <h2 className="font-display text-pink-400 text-lg text-glow-pink">AGENT ROSTER</h2>
            <div className="flex gap-2">
                <button
                    onClick={() => { playClickSound(); setIsImportAgentModalOpen(true); }}
                    className="font-display text-xs bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700 transition-colors"
                    title="Import a new agent from a JSON manifest"
                >
                    IMPORT AGENT
                </button>
                <button
                    onClick={() => { playClickSound(); setIsCreateAgentModalOpen(true); }}
                    className="font-display text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                    title="Create a new agent from a template"
                >
                    + NEW
                </button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-1">
                {agentList.map(agent => (
                    <li key={agent.id}>
                        <button 
                            onClick={() => handleSelectAgent(agent.id)}
                            className={`group w-full text-left font-display p-2 rounded-md transition-colors text-sm flex items-center gap-3 ${
                                selectedAgentId === agent.id 
                                ? 'bg-pink-600 text-white' 
                                : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                            }`}
                        >
                           <Avatar 
                             avatar={agent.display.avatar}
                             name={agent.name}
                             className="text-lg"
                             imageClassName="w-6 h-6 rounded-md object-cover"
                           />
                           <div className="flex flex-col items-start">
                                <span className="leading-tight">{agent.name}</span>
                                <span className={`text-xs font-mono leading-tight ${
                                    selectedAgentId === agent.id 
                                    ? 'text-pink-200' 
                                    : 'text-gray-500 group-hover:text-gray-300'
                                }`}>
                                    ID: {agent.id}
                                </span>
                            </div>
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
        <div className="mt-4 pt-4 border-t border-pink-500/30 flex justify-between items-center gap-2">
            <div>
                 <Tooltip text={isDefaultAgent ? "Default agents cannot be deleted." : "Permanently delete this agent"}>
                    <span className="inline-block"> {/* Tooltip needs a span wrapper for disabled buttons */}
                        <button
                        onClick={() => { playClickSound(); setIsDeleteAgentModalOpen(true); }}
                        disabled={!selectedAgentId || isDefaultAgent}
                        className="font-display bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                        DELETE AGENT
                        </button>
                    </span>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <button
                onClick={handleExportAgent}
                disabled={!selectedAgentId}
                className="font-display bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
                >
                EXPORT AGENT
                </button>
                <button
                onClick={handleReset}
                disabled={!selectedAgentId || !defaultAgents[selectedAgentId]}
                className="font-display bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
                >
                RESET TO DEFAULT
                </button>
                <select
                    value={avatarStyle}
                    onChange={(e) => { playClickSound(); setAvatarStyle(e.target.value); }}
                    disabled={!selectedAgentId || isGeneratingAvatar}
                    className="font-display text-xs bg-gray-700 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 h-[42px]"
                >
                    {AVATAR_STYLES.map(style => (
                        <option key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                    ))}
                </select>
                <button
                onClick={handleGenerateAvatar}
                disabled={!selectedAgentId || isGeneratingAvatar}
                className="font-display bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                {isGeneratingAvatar ? 'GENERATING...' : '✨ GENERATE'}
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
    </div>
  );
};