import React from 'react';
import { MissionStep } from '../types';
import { Typewriter } from './Typewriter';
import { EmptyState } from './EmptyState';
import { Tooltip } from './Tooltip';
import { useMission } from '../App';

interface MissionParameterInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  rows?: number;
}

const MissionParameterInput: React.FC<MissionParameterInputProps> = ({ id, label, value, onChange, disabled, placeholder, rows = 2 }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-display text-pink-400 mb-1 tracking-widest">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 font-mono text-sm"
      rows={rows}
    />
  </div>
);


export const OrchestratorConsole: React.FC = () => {
  const {
    missionObjective,
    setMissionObjective,
    targetAudience,
    setTargetAudience,
    kpis,
    setKpis,
    desiredOutcomes,
    setDesiredOutcomes,
    handleDeployMission,
    isMissionActive,
    isReadyForDeployment,
    missionPlan,
    missionExecutionIndex,
    selectedProvider,
    selectedModel,
  } = useMission();

  const onDeploy = handleDeployMission;

  const isPlanning = isMissionActive && !missionPlan;
  const isExecuting = isMissionActive && missionPlan;
  
  const isModelSelected = selectedModel && selectedModel.trim() !== '';

  const areAllFieldsFilled = 
    missionObjective.trim() &&
    targetAudience.trim() &&
    kpis.trim() &&
    desiredOutcomes.trim();
    
  const getDeploymentStatus = () => {
    if (!isReadyForDeployment) return "API KEY(S) MISSING IN SECURE VAULT";
    if (!isModelSelected) return "SELECT A MODEL IN MISSION CONTROL";
    if (!areAllFieldsFilled) return "FILL IN ALL MISSION PARAMETERS";
    return "READY FOR DEPLOYMENT";
  };

  const deploymentStatus = getDeploymentStatus();
  const isDeployable = deploymentStatus === "READY FOR DEPLOYMENT";
  const isButtonDisabled = isMissionActive || !isDeployable;

  const getTooltipText = () => {
    if (isMissionActive) return "Mission is currently active.";
    if (!isDeployable) return deploymentStatus;
    return "Let's go!";
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-4 rounded-lg shadow-lg bg-sparkle flex flex-col h-full">
      <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">ORACLE CONSOLE</h2>
      <div className="flex-grow flex flex-col min-h-0">
        <div className="overflow-y-auto pr-2">
            <div className="space-y-3 mb-4">
                <MissionParameterInput
                    id="missionObjective"
                    label="MISSION OBJECTIVE"
                    value={missionObjective}
                    onChange={setMissionObjective}
                    disabled={isMissionActive}
                    placeholder="Enter your high-level objective here..."
                    rows={3}
                />
                 <MissionParameterInput
                    id="targetAudience"
                    label="TARGET AUDIENCE"
                    value={targetAudience}
                    onChange={setTargetAudience}
                    disabled={isMissionActive}
                    placeholder="e.g., Tech enthusiasts aged 25-40"
                />
                <MissionParameterInput
                    id="kpis"
                    label="KEY PERFORMANCE INDICATORS (KPIs)"
                    value={kpis}
                    onChange={setKpis}
                    disabled={isMissionActive}
                    placeholder="e.g., 20% increase in engagement, 500 new followers"
                />
                <MissionParameterInput
                    id="desiredOutcomes"
                    label="DESIRED OUTCOMES"
                    value={desiredOutcomes}
                    onChange={setDesiredOutcomes}
                    disabled={isMissionActive}
                    placeholder="e.g., Successful product launch, stronger brand presence"
                />
            </div>

            <Tooltip text={getTooltipText()}>
                <span className="inline-block w-full">
                    <button
                    onClick={onDeploy}
                    disabled={isButtonDisabled}
                    className="w-full font-display bg-pink-600 text-white px-4 py-3 rounded-md hover:bg-pink-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 text-base"
                    >
                    {isPlanning ? 'ORCHESTRATING...' : isExecuting ? 'MISSION IN PROGRESS...' : 'DEPLOY AGENTS'}
                    </button>
                </span>
            </Tooltip>
            {!isMissionActive && (
              <div className={`mt-2 text-center font-display text-xs tracking-widest ${isDeployable ? 'text-green-400' : 'text-yellow-400'}`}>
                STATUS: {deploymentStatus}
              </div>
            )}
            
            <div className="mt-4 border-t border-pink-500/30 pt-3">
                <h3 className="font-display text-pink-400 text-sm mb-2">MISSION PLAN:</h3>
                {isPlanning && (
                    <div className="font-mono text-sm text-yellow-300 p-2 bg-yellow-900/40 rounded-md">
                        <Typewriter text="[ORACLE] Analyzing objective... Decomposing tasks... Assigning agents... Generating executable plan..." />
                    </div>
                )}
                {!isMissionActive && !missionPlan && (
                    <EmptyState icon="🎯" title="Awaiting Objective" message="Define a mission objective and deploy agents to generate a plan." />
                )}
                {missionPlan && (
                    <ul className="space-y-2">
                        {missionPlan.map((step, index) => (
                            <li key={index} className={`font-mono text-sm p-2 rounded-md border-l-4 transition-colors duration-300
                                ${index < missionExecutionIndex ? 'border-green-500 bg-green-900/30' : ''}
                                ${index === missionExecutionIndex ? 'border-pink-500 bg-pink-900/40 animate-pulse-pink' : ''}
                                ${index > missionExecutionIndex ? 'border-purple-500 bg-purple-900/30' : ''}
                            `}>
                                <p className="font-bold text-gray-200">
                                    <span className="text-pink-400">{`[${step.agent}]`}</span> {`> ${step.task}`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 pl-2 border-l-2 border-gray-600 ml-1">
                                    <span className="font-bold">ORACLE's Thought:</span> {step.thought}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};