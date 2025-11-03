// Fix: Import `React` to make the `React` namespace available for type annotations like `React.Dispatch`.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AgentManifest,
  AgentRuntimeState,
  AgentStatus,
  AgentTeamManifest,
  LogEntry,
  MissionStep,
  SlackMessage,
  SharedMemoryContents,
} from '../types';
import { ALL_TEAM_MANIFESTS, allAgents as initialAllAgents, ORACLE_ORCHESTRATOR, MISSIONS } from '../constants';
import { generateMissionPlan, generateAgentThoughtStream } from '../services/geminiService';
import { getInitialState } from '../utils/localStorage';
import { playDeploySound, playAbortSound, playSuccessSound, playErrorSound, playClickSound } from '../utils/audio';

const postSlackMessage = (
  setter: React.Dispatch<React.SetStateAction<SlackMessage[]>>,
  sender: SlackMessage['sender'],
  text: string
) => {
  const newMessage: SlackMessage = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    sender,
    text,
  };
  setter(prev => [...prev, newMessage]);
};


export const useMissionControl = () => {
  // Static state
  const [allAgents, setAllAgents] = useState<{[id: string]: AgentManifest}>(() => getInitialState('allAgents', initialAllAgents));
  const [teamManifests, setTeamManifests] = useState<AgentTeamManifest[]>(ALL_TEAM_MANIFESTS);

  // Control Panel State
  const [selectedTeam, setSelectedTeam] = useState<string>(() => getInitialState('selectedTeam', ALL_TEAM_MANIFESTS[0].name));
  const [selectedIndustry, setSelectedIndustry] = useState<string>(() => getInitialState('selectedIndustry', 'Technology'));
  const [selectedProvider, setSelectedProvider] = useState<string>(() => getInitialState('selectedProvider', 'Google Gemini'));
  const [selectedModel, setSelectedModel] = useState<string>(() => getInitialState('selectedModel', 'gemini-2.5-pro'));
  
  // Mission State
  const [missionObjective, setMissionObjective] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>(() => getInitialState('targetAudience', ''));
  const [kpis, setKpis] = useState<string>(() => getInitialState('kpis', ''));
  const [desiredOutcomes, setDesiredOutcomes] = useState<string>(() => getInitialState('desiredOutcomes', ''));
  const [selectedMission, setSelectedMission] = useState<string>(MISSIONS[selectedTeam]?.[0] || '');
  const [isMissionActive, setIsMissionActive] = useState<boolean>(false);
  const [missionPlan, setMissionPlan] = useState<MissionStep[] | null>(null);
  const [missionExecutionIndex, setMissionExecutionIndex] = useState<number>(0);
  const [completedPlan, setCompletedPlan] = useState<MissionStep[]>([]);
  
  // Runtime State
  const [agents, setAgents] = useState<AgentRuntimeState[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [slackHistory, setSlackHistory] = useState<SlackMessage[]>([]);
  const [sharedMemory, setSharedMemory] = useState<SharedMemoryContents>({});
  const [agentUsingToolId, setAgentUsingToolId] = useState<string | null>(null);

  // UI State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [vaultValues, setVaultValues] = useState<Record<string, string>>(() => getInitialState('vaultValues', {}));

  // Simulation Settings
  const [planningDelay, setPlanningDelay] = useState<number>(() => getInitialState('planningDelay', 2000));
  const [stepExecutionDelay, setStepExecutionDelay] = useState<number>(() => getInitialState('stepExecutionDelay', 4000));
  const [failureChance, setFailureChance] = useState<number>(() => getInitialState('failureChance', 15));

  // Add sound effects to toasts
  useEffect(() => {
    if (toast) {
        if (toast.type === 'success') {
            playSuccessSound();
        } else if (toast.type === 'error') {
            playErrorSound();
        }
    }
  }, [toast]);


  // Derived State
  const currentTeamManifest = useMemo(() => teamManifests.find(t => t.name === selectedTeam), [selectedTeam, teamManifests]);
  const teamHasSlackAdmin = useMemo(() => {
    if (!currentTeamManifest) return false;
    return currentTeamManifest.members.some(m => m.agentId === 'sys-2');
  }, [currentTeamManifest]);

  const requiredApiKeys = useMemo(() => {
    if (!currentTeamManifest) return [];
    const agentIds = new Set(currentTeamManifest.members.map(m => m.agentId));
    const keys = new Set<string>();
    // Fix: Explicitly type `agent` as AgentManifest to resolve type inference issue.
    Object.values(allAgents).forEach((agent: AgentManifest) => {
        if (agentIds.has(agent.id)) {
            agent.env.required.forEach(key => keys.add(key));
        }
    });
    return Array.from(keys);
  }, [currentTeamManifest, allAgents]);

  const isReadyForDeployment = useMemo(() => {
    return requiredApiKeys.every(key => vaultValues[key] && vaultValues[key].trim() !== '');
  }, [requiredApiKeys, vaultValues]);

  // Persist settings to localStorage
  useEffect(() => localStorage.setItem('selectedTeam', selectedTeam), [selectedTeam]);
  useEffect(() => localStorage.setItem('selectedIndustry', selectedIndustry), [selectedIndustry]);
  useEffect(() => localStorage.setItem('selectedProvider', selectedProvider), [selectedProvider]);
  useEffect(() => localStorage.setItem('selectedModel', selectedModel), [selectedModel]);
  useEffect(() => localStorage.setItem('targetAudience', targetAudience), [targetAudience]);
  useEffect(() => localStorage.setItem('kpis', kpis), [kpis]);
  useEffect(() => localStorage.setItem('desiredOutcomes', desiredOutcomes), [desiredOutcomes]);
  useEffect(() => localStorage.setItem('planningDelay', String(planningDelay)), [planningDelay]);
  useEffect(() => localStorage.setItem('stepExecutionDelay', String(stepExecutionDelay)), [stepExecutionDelay]);
  useEffect(() => localStorage.setItem('failureChance', String(failureChance)), [failureChance]);
  useEffect(() => {
    try {
        localStorage.setItem('allAgents', JSON.stringify(allAgents));
    } catch (error) {
        console.error("Failed to save agents to localStorage", error);
    }
  }, [allAgents]);
  useEffect(() => {
    try {
        localStorage.setItem('vaultValues', JSON.stringify(vaultValues));
    } catch (error) {
        console.error("Failed to save vault values to localStorage", error);
    }
  }, [vaultValues]);


  // Update document title based on mission status
  useEffect(() => {
    if (!isMissionActive) {
        document.title = 'Transform Army AI - Standby';
    } else if (isMissionActive && !missionPlan) {
        document.title = `Planning: ${missionObjective}`;
    } else if (isMissionActive && missionPlan) {
        if (missionExecutionIndex >= missionPlan.length) {
            document.title = '✨ Mission Complete! ✨';
        } else {
            const currentStep = missionPlan[missionExecutionIndex];
            if (currentStep) {
                const truncatedTask = currentStep.task.length > 30 ? `${currentStep.task.substring(0, 27)}...` : currentStep.task;
                document.title = `[${missionExecutionIndex+1}/${missionPlan.length}] ${currentStep.agent}: ${truncatedTask}`;
            }
        }
    }
  }, [isMissionActive, missionPlan, missionExecutionIndex, missionObjective]);

  // Update agents when team changes
  useEffect(() => {
    if (currentTeamManifest) {
      const teamAgentIds = currentTeamManifest.members.map(m => m.agentId);
      const newAgents: AgentRuntimeState[] = teamAgentIds
        .map(id => allAgents[id])
        .filter(Boolean) // Filter out any missing agents
        .map(manifest => ({
          id: manifest.id,
          name: manifest.name,
          status: AgentStatus.STANDBY,
          currentTask: '',
          currentThought: '',
          manifest,
      }));
      setAgents(newAgents);
    } else {
      setAgents([]);
    }
  }, [selectedTeam, teamManifests, allAgents, currentTeamManifest]);
  
  const addLog = useCallback((source: string, message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      source,
      message,
      type,
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const handleMissionFailure = useCallback((failedStep: MissionStep, failedAgent: AgentRuntimeState) => {
    playErrorSound();
    setIsMissionActive(false);
    
    const failureMessage = `Task "${failedStep.task}" failed. Critical error during execution.`;
    addLog(failedAgent.name, failureMessage, 'ERROR');
    
    if (teamHasSlackAdmin) {
        postSlackMessage(setSlackHistory, 'error-bot', `🚨 MISSION FAILURE!\nAgent: ${failedAgent.name}\nTask: ${failedStep.task}\nReason: Critical error during execution.`);
    }

    setToast({ message: `Mission failed: ${failedAgent.name} failed its task.`, type: 'error' });
    
    // Set failed agent to ERROR, others to standby
    setAgents(prev => prev.map(a => {
        if (a.id === failedAgent.id) {
            return {...a, status: AgentStatus.ERROR, currentTask: 'Task Failed', currentThought: ''};
        }
        // If agent was already completed, keep it that way. Otherwise, standby.
        if (a.status !== AgentStatus.TASK_COMPLETED) {
            return {...a, status: AgentStatus.STANDBY, currentTask: '', currentThought: ''};
        }
        return a;
    }));

    setAgentUsingToolId(null);
  }, [addLog, teamHasSlackAdmin]);


  // The main mission execution loop
  useEffect(() => {
    if (!isMissionActive || !missionPlan || missionExecutionIndex >= missionPlan.length) {
      if (isMissionActive && missionPlan && missionExecutionIndex >= missionPlan.length) {
        // Mission complete
        addLog('ORACLE', `Mission objective "${missionObjective}" accomplished. All tasks completed.`, 'STATUS');
        if (teamHasSlackAdmin) {
          postSlackMessage(setSlackHistory, 'system-bot', `🎉 Mission Accomplished!\nObjective: "${missionObjective}"`);
        }
        setIsMissionActive(false);
        setCompletedPlan(missionPlan);
        setIsSummaryModalOpen(true);
        setAgentUsingToolId(null);
        playSuccessSound();
        // Reset agents to standby
        setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, currentTask: '', currentThought: ''})));
      }
      return;
    }

    const step = missionPlan[missionExecutionIndex];
    const agentRuntimeState = agents.find(a => a.name === step.agent);
    
    const timeoutId = setTimeout(() => {
      // Set previous agent to completed
      if (missionExecutionIndex > 0) {
        const prevStep = missionPlan[missionExecutionIndex - 1];
        setAgents(prev => prev.map(a => a.name === prevStep.agent ? {...a, status: AgentStatus.TASK_COMPLETED, currentThought: '' } : a));
      }

      if (!agentRuntimeState) {
          addLog('SYSTEM', `Error: Could not find agent "${step.agent}" for current step. Aborting mission.`, 'ERROR');
          if (teamHasSlackAdmin) {
              postSlackMessage(setSlackHistory, 'error-bot', `CRITICAL ERROR: Agent "${step.agent}" not found. Mission aborted.`);
          }
          setIsMissionActive(false);
          playErrorSound();
          return;
      }
       
      // Simulate a chance of task failure. Don't fail the first step.
      if (missionExecutionIndex > 0 && Math.random() < (failureChance / 100)) {
        handleMissionFailure(step, agentRuntimeState);
        return; // Stop the execution loop
      }

      // Set current agent to processing and stream thoughts
      (async () => {
        setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, status: AgentStatus.PROCESSING, currentTask: step.task, currentThought: ''} : a));
        addLog(agentRuntimeState.name, `Executing task: "${step.task}"`, 'STATUS');
        if (teamHasSlackAdmin) {
          postSlackMessage(setSlackHistory, 'system-bot', `[${agentRuntimeState.name}] has started task: "${step.task}"`);
        }

        try {
            const thoughtStream = generateAgentThoughtStream(agentRuntimeState.manifest, step.task, missionObjective, selectedModel);
            for await (const thoughtChunk of thoughtStream) {
                setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: (a.currentThought || '') + thoughtChunk } : a));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addLog(agentRuntimeState.name, `Failed to generate thought process: ${errorMessage}`, 'ERROR');
            setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: "[Thought process failed to generate.]" } : a));
        }
      })();
      
      // Simulate tool usage
      const toolUsed = agentRuntimeState.manifest.tools.find(tool => step.task.toLowerCase().includes(tool.name.toLowerCase()));
      if (toolUsed) {
        setAgentUsingToolId(agentRuntimeState.id);
        addLog(agentRuntimeState.name, `Using tool: 🛠️ ${toolUsed.name}`, 'COMMAND');
      } else {
        setAgentUsingToolId(null);
      }
      
      if (teamHasSlackAdmin) {
        postSlackMessage(setSlackHistory, 'system-bot', `✅ [${agentRuntimeState.name}] has completed task: "${step.task}"`);
      }

      // Simulate adding to shared memory
      setSharedMemory(prev => ({
          ...prev,
          [`task_${missionExecutionIndex}_result`]: {
              value: `Completed: ${step.task}`,
              writtenBy: agentRuntimeState.name,
              timestamp: new Date().toISOString()
          }
      }));
      addLog(agentRuntimeState.name, `Wrote result for task "${step.task}" to shared memory.`, 'INFO');

      setMissionExecutionIndex(prev => prev + 1);
    }, stepExecutionDelay);

    return () => clearTimeout(timeoutId);
  }, [isMissionActive, missionPlan, missionExecutionIndex, addLog, missionObjective, agents, selectedModel, teamHasSlackAdmin, handleMissionFailure, stepExecutionDelay, failureChance]);


  const resetMission = useCallback(() => {
    setIsMissionActive(false);
    setMissionPlan(null);
    setMissionExecutionIndex(0);
    setLogs([]);
    setSlackHistory([]);
    setSharedMemory({});
    setAgentUsingToolId(null);
    setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, currentTask: '', currentThought: ''})));
  }, []);

  const handleDeployMission = useCallback(async () => {
    if (!missionObjective.trim() || !targetAudience.trim() || !kpis.trim() || !desiredOutcomes.trim()) {
        setToast({ message: 'Cannot deploy: Please fill in all mission parameters.', type: 'error' });
        return;
    }
    if (!currentTeamManifest) {
      setToast({ message: 'Cannot deploy: No team selected.', type: 'error' });
      return;
    }
    if (!isReadyForDeployment) {
      setToast({ message: 'Cannot deploy: Missing required API keys in Secure Vault.', type: 'error' });
      return;
    }
    if (selectedProvider !== 'Google Gemini') {
      setToast({ message: 'Deployment failed: Only Google Gemini models are currently supported by the orchestrator.', type: 'error' });
      return;
    }
    
    playDeploySound();
    resetMission();
    setIsMissionActive(true);
    addLog('ORACLE', `Mission objective received: "${missionObjective}"`, 'STATUS');
    addLog('ORACLE', `Engaging model ${selectedModel} to generate mission plan...`, 'INFO');
    if (teamHasSlackAdmin) {
      postSlackMessage(setSlackHistory, 'system-bot', `🚀 Mission Deployed!\nTeam: ${currentTeamManifest.name}\nObjective: ${missionObjective}`);
    }

    try {
      // Simulate planning phase
      await new Promise(resolve => setTimeout(resolve, planningDelay));
      
      const teamAgents = currentTeamManifest.members.map(m => allAgents[m.agentId]).filter(Boolean);
      const plan = await generateMissionPlan(
        missionObjective, 
        currentTeamManifest, 
        teamAgents, 
        ORACLE_ORCHESTRATOR, 
        selectedIndustry, 
        selectedModel,
        targetAudience,
        kpis,
        desiredOutcomes
      );
      
      if (!plan || plan.length === 0) {
        throw new Error("Orchestrator returned an empty or invalid plan.");
      }

      addLog('ORACLE', 'Mission plan generated successfully. Deploying agents.', 'STATUS');
      setMissionPlan(plan);
      // Kick off the execution loop by setting the index to 0
      setMissionExecutionIndex(0);
      setAgents(prev => prev.map(a => ({...a, status: AgentStatus.DEPLOYED})));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addLog('ORACLE', `Mission planning failed: ${errorMessage}`, 'ERROR');
      if (teamHasSlackAdmin) {
        postSlackMessage(setSlackHistory, 'error-bot', `Mission planning failed: ${errorMessage}`);
      }
      setToast({ message: `Mission planning failed: ${errorMessage}`, type: 'error' });
      setIsMissionActive(false);
      setAgents(prev => prev.map(a => ({...a, status: AgentStatus.ERROR, currentTask: 'Planning Failed'})));
    }
  }, [missionObjective, targetAudience, kpis, desiredOutcomes, currentTeamManifest, selectedIndustry, allAgents, addLog, resetMission, isReadyForDeployment, selectedProvider, selectedModel, teamHasSlackAdmin, planningDelay]);

  const handleAbortMission = useCallback(() => {
    playAbortSound();
    setIsMissionActive(false);
    setMissionPlan(null);
    setMissionExecutionIndex(0);
    addLog('SYSTEM', 'MISSION ABORTED BY USER.', 'ERROR');
    if (teamHasSlackAdmin) {
        postSlackMessage(setSlackHistory, 'error-bot', `🛑 MISSION ABORTED BY USER.`);
    }
    setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, currentTask: 'Aborted', currentThought: ''})));
    setIsAbortModalOpen(false);
    setAgentUsingToolId(null);
  }, [addLog, teamHasSlackAdmin]);

  const handleImport = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        if (!data.team || !data.agents || data.exportVersion !== "1.0") {
            throw new Error("Invalid or unsupported export file format.");
        }
        const newTeam: AgentTeamManifest = data.team;
        const newAgents: AgentManifest[] = data.agents;

        // Add import metadata
        newTeam.importMeta = {
            source: 'user-paste',
            sourceType: 'user-paste',
            timestamp: new Date().toISOString(),
        };

        // Validate agents in team exist in the import
        const importedAgentIds = new Set(newAgents.map(a => a.id));
        for (const member of newTeam.members) {
            if (!importedAgentIds.has(member.agentId)) {
                throw new Error(`Team manifest lists agent ID "${member.agentId}" but this agent is not defined in the import file.`);
            }
        }

        // Update state
        setTeamManifests(prev => [...prev.filter(t => t.id !== newTeam.id), newTeam]);
        setAllAgents(prev => {
            const updatedAgents = {...prev};
            newAgents.forEach(agent => {
                updatedAgents[agent.id] = agent;
            });
            return updatedAgents;
        });

        setSelectedTeam(newTeam.name);
        setToast({ message: `Successfully imported team: ${newTeam.name}`, type: 'success' });
        setIsImportModalOpen(false);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse JSON.";
        setToast({ message: `Import failed: ${message}`, type: 'error' });
    }
  };

  const handleExport = () => {
    if (!currentTeamManifest) return;
    playClickSound();
    setIsExportModalOpen(true);
  };

  const handleSlackCommand = useCallback((command: string) => {
    postSlackMessage(setSlackHistory, 'user', command);
    
    const [cmd] = command.trim().split(' ');

    switch (cmd) {
        case '/help':
            postSlackMessage(setSlackHistory, 'system-bot', `Available Commands:\n• /help - Show this help message\n• /status - Get current mission status`);
            break;
        case '/status':
            if (!isMissionActive) {
                postSlackMessage(setSlackHistory, 'system-bot', `No active mission. Ready for deployment.`);
            } else if (!missionPlan) {
                postSlackMessage(setSlackHistory, 'system-bot', `Mission status: PLANNING\nOracle is generating the mission plan...`);
            } else {
                const currentStep = missionPlan[missionExecutionIndex];
                const statusMessage = currentStep 
                    ? `Mission status: IN PROGRESS\nExecuting Step ${missionExecutionIndex + 1} of ${missionPlan.length}:\nAgent: ${currentStep.agent}\nTask: ${currentStep.task}`
                    : `Mission status: COMPLETE`;
                postSlackMessage(setSlackHistory, 'system-bot', statusMessage);
            }
            break;
        default:
            postSlackMessage(setSlackHistory, 'error-bot', `Unknown command: "${cmd}". Type /help for available commands.`);
            break;
    }
  }, [isMissionActive, missionPlan, missionExecutionIndex]);
  
  const exportData = useMemo(() => {
    if (!currentTeamManifest) return null;
    const teamAgentIds = new Set(currentTeamManifest.members.map(m => m.agentId));
    // Fix: Explicitly type `a` as AgentManifest to resolve type inference issue.
    const agentsToExport = Object.values(allAgents).filter((a: AgentManifest) => teamAgentIds.has(a.id));
    return {
        team: currentTeamManifest,
        agents: agentsToExport,
    };
  }, [currentTeamManifest, allAgents]);


  return {
    // State
    agents,
    logs,
    slackHistory,
    sharedMemory,
    selectedTeam,
    selectedIndustry,
    selectedProvider,
    selectedModel,
    missionObjective,
    targetAudience,
    kpis,
    desiredOutcomes,
    selectedMission,
    isMissionActive,
    missionPlan,
    missionExecutionIndex,
    toast,
    isAbortModalOpen,
    isSummaryModalOpen,
    isExportModalOpen,
    isImportModalOpen,
    teamManifests,
    exportData,
    completedPlan,
    requiredApiKeys,
    vaultValues,
    isReadyForDeployment,
    agentUsingToolId,
    allAgents,
    planningDelay,
    stepExecutionDelay,
    failureChance,

    // Setters
    setMissionObjective,
    setTargetAudience,
    setKpis,
    setDesiredOutcomes,
    setSelectedTeam,
    setSelectedIndustry,
    setSelectedProvider,
    setSelectedModel,
    setSelectedMission,
    setToast,
    setIsAbortModalOpen,
    setIsSummaryModalOpen,
    setIsExportModalOpen,
    setIsImportModalOpen,
    setVaultValues,
    setAllAgents,
    setPlanningDelay,
    setStepExecutionDelay,
    setFailureChance,

    // Handlers
    handleDeployMission,
    handleAbortMission,
    handleImport,
    handleExport,
    handleSlackCommand,
  };
};