import React from 'react';
import { MISSIONS, PROVIDERS, INDUSTRIES } from '../constants';
import { AgentTeamManifest } from '../types';
import { playClickSound } from '../utils/audio';
import { useMission } from '../App';

const ControlPanel: React.FC = () => {
  const {
    selectedTeam,
    setSelectedTeam,
    selectedIndustry,
    setSelectedIndustry,
    selectedMission,
    setSelectedMission,
    setMissionObjective,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    isMissionActive,
    // Fix: Corrected property name from handleExport to handleExportTeam to match the hook's return value.
    handleExportTeam,
    // Fix: Corrected property name from setIsImportModalOpen to setIsImportTeamModalOpen to match the hook's return value.
    setIsImportTeamModalOpen,
    teamManifests,
  } = useMission();
  
  const onExport = handleExportTeam;
  const onImport = () => setIsImportTeamModalOpen(true);

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playClickSound();
    const newTeam = e.target.value;
    setSelectedTeam(newTeam);
    // When team changes, reset the selected mission template,
    // but preserve any custom mission objective the user may have entered.
    const newDefaultMission = MISSIONS[newTeam]?.[0] || '';
    setSelectedMission(newDefaultMission);
  };

  const handleMissionTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playClickSound();
    const newMission = e.target.value;
    setSelectedMission(newMission);
    setMissionObjective(newMission);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playClickSound();
    const newProvider = e.target.value;
    setSelectedProvider(newProvider);
    const models = PROVIDERS[newProvider] || [];
    setSelectedModel(models[0] || '');
  };

  const modelsForProvider = PROVIDERS[selectedProvider] || [];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-4 rounded-lg shadow-lg bg-sparkle flex flex-col h-full">
      <h2 className="font-display text-pink-400 text-lg mb-4 border-b-2 border-pink-500/30 pb-2 text-glow-pink">MISSION CONTROL</h2>
      <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
        <ControlSelect label="TEAM" value={selectedTeam} onChange={handleTeamChange} disabled={isMissionActive}>
          {teamManifests.map(team => (
            <option key={team.id} value={team.name}>
                {team.displayName || team.name}
                {team.importMeta?.sourceType === 'user-paste' ? ' [i]' : ''}
            </option>
          ))}
        </ControlSelect>
        
        <ControlSelect label="INDUSTRY" value={selectedIndustry} onChange={e => { playClickSound(); setSelectedIndustry(e.target.value); }} disabled={isMissionActive}>
          {INDUSTRIES.map(industry => <option key={industry} value={industry}>{industry}</option>)}
        </ControlSelect>

        <ControlSelect label="MISSION TEMPLATE" value={selectedMission} onChange={handleMissionTemplateChange} disabled={isMissionActive || !selectedTeam}>
          {selectedTeam && MISSIONS[selectedTeam] && MISSIONS[selectedTeam].map(mission => <option key={mission} value={mission}>{mission}</option>)}
        </ControlSelect>

        <ControlSelect label="PROVIDER" value={selectedProvider} onChange={handleProviderChange} disabled={isMissionActive}>
          {Object.keys(PROVIDERS).map(provider => <option key={provider} value={provider}>{provider}</option>)}
        </ControlSelect>

        <ControlSelect label="MODEL" value={selectedModel} onChange={e => { playClickSound(); setSelectedModel(e.target.value); }} disabled={isMissionActive || modelsForProvider.length === 0}>
           {modelsForProvider.map(model => <option key={model} value={model}>{model}</option>)}
        </ControlSelect>
      </div>
      <div className="mt-4 pt-4 border-t border-pink-500/30 space-y-2">
         <button
          onClick={() => { playClickSound(); onImport(); }}
          disabled={isMissionActive}
          className="w-full font-display bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        >
          IMPORT TEAM
        </button>
        <button
          onClick={onExport}
          disabled={isMissionActive || !selectedTeam}
          className="w-full font-display bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        >
          EXPORT TEAM
        </button>
      </div>
    </div>
  );
};

interface ControlSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}

const ControlSelect: React.FC<ControlSelectProps> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-xs font-display text-pink-400 mb-1 tracking-widest">{label}</label>
        <select
            {...props}
            className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
        >
            {children}
        </select>
    </div>
);

export default ControlPanel;