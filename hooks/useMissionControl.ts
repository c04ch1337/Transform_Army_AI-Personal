import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AgentManifest,
  AgentRuntimeState,
  AgentStatus,
  AgentSubStatus,
  AgentTeamManifest,
  LogEntry,
  MissionStep,
  SlackMessage,
  SharedMemoryContents,
  ChatMessage,
} from '../types';
import { ALL_TEAM_MANIFESTS, allAgents as initialAllAgents, ORACLE_ORCHESTRATOR, MISSIONS } from '../constants';
import { generateMissionPlan, generateAgentThoughtStream, executeGroundedAgentTask, getOrchestratorChatResponse } from '../services/geminiService';
import { useLocalStorage } from './useLocalStorage';
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
  const [allAgents, setAllAgents] = useLocalStorage<{[id: string]: AgentManifest}>('allAgents', initialAllAgents);
  const [teamManifests, setTeamManifests] = useState<AgentTeamManifest[]>(ALL_TEAM_MANIFESTS);

  // Control Panel State
  const [selectedTeam, setSelectedTeam] = useLocalStorage<string>('selectedTeam', ALL_TEAM_MANIFESTS[0].name);
  const [selectedIndustry, setSelectedIndustry] = useLocalStorage<string>('selectedIndustry', 'Technology');
  const [selectedProvider, setSelectedProvider] = useLocalStorage<string>('selectedProvider', 'Google Gemini');
  const [selectedModel, setSelectedModel] = useLocalStorage<string>('selectedModel', 'gemini-2.5-pro');
  
  // Mission State
  const [missionObjective, setMissionObjective] = useState<string>('');
  const [targetAudience, setTargetAudience] = useLocalStorage<string>('targetAudience', '');
  const [kpis, setKpis] = useLocalStorage<string>('kpis', '');
  const [desiredOutcomes, setDesiredOutcomes] = useLocalStorage<string>('desiredOutcomes', '');
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
  const [orchestratorChatHistory, setOrchestratorChatHistory] = useState<ChatMessage[]>([]);
  const [isOrchestratorReplying, setIsOrchestratorReplying] = useState(false);

  // UI State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isExportTeamModalOpen, setIsExportTeamModalOpen] = useState(false);
  const [isImportTeamModalOpen, setIsImportTeamModalOpen] = useState(false);
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState(false);
  const [isExportAgentModalOpen, setIsExportAgentModalOpen] = useState(false);
  const [isImportAgentModalOpen, setIsImportAgentModalOpen] = useState(false);
  const [isDeleteAgentModalOpen, setIsDeleteAgentModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [vaultValues, setVaultValues] = useLocalStorage<Record<string, string>>('vaultValues', {});

  // Simulation Settings
  const [planningDelay, setPlanningDelay] = useLocalStorage<number>('planningDelay', 2000);
  const [stepExecutionDelay, setStepExecutionDelay] = useLocalStorage<number>('stepExecutionDelay', 4000);
  const [failureChance, setFailureChance] = useLocalStorage<number>('failureChance', 15);

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
    Object.values(allAgents).forEach((agent: AgentManifest) => {
        if (agentIds.has(agent.id)) {
            agent.env.required.forEach(key => keys.add(key));
        }
    });
    // Add orchestrator key based on provider
    if (selectedProvider !== 'Google Gemini') {
        keys.add('OPENROUTER_API_KEY');
    }
    return Array.from(keys);
  }, [currentTeamManifest, allAgents, selectedProvider]);

  const isReadyForDeployment = useMemo(() => {
    return requiredApiKeys.every(key => vaultValues[key] && vaultValues[key].trim() !== '');
  }, [requiredApiKeys, vaultValues]);

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
          subStatus: null,
          currentTask: '',
          currentThought: '',
          manifest,
      }));
      setAgents(newAgents);
    } else {
      setAgents([]);
    }
  }, [selectedTeam, teamManifests, allAgents, currentTeamManifest]);

  // Initialize orchestrator chat with a welcome message when the team changes
  useEffect(() => {
    if (currentTeamManifest) {
        const welcomeMessage: ChatMessage = {
            id: `welcome-${Date.now()}`,
            sender: 'orchestrator',
            text: `I am ORACLE, the orchestrator for the **${currentTeamManifest.displayName || currentTeamManifest.name}**. How can I assist you with planning your mission today? You can ask about the team's capabilities or discuss potential objectives.`,
            timestamp: new Date().toISOString(),
        };
        setOrchestratorChatHistory([welcomeMessage]);
    }
  }, [selectedTeam, teamManifests, currentTeamManifest]);
  
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
            return {...a, status: AgentStatus.ERROR, subStatus: null, currentTask: 'Task Failed', currentThought: ''};
        }
        // If agent was already completed, keep it that way. Otherwise, standby.
        if (a.status !== AgentStatus.TASK_COMPLETED) {
            return {...a, status: AgentStatus.STANDBY, subStatus: null, currentTask: '', currentThought: ''};
        }
        return a;
    }));
  }, [addLog, teamHasSlackAdmin]);


  // The main mission execution loop
  useEffect(() => {
    // Exit if mission isn't active or is complete
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
        playSuccessSound();
        setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, subStatus: null, currentTask: '', currentThought: ''})));
      }
      return;
    }
    
    let isCancelled = false;
    const step = missionPlan[missionExecutionIndex];
    const agentRuntimeState = agents.find(a => a.name === step.agent);

    const processStep = async () => {
       if (missionExecutionIndex > 0) {
        const prevStep = missionPlan[missionExecutionIndex - 1];
        setAgents(prev => prev.map(a => a.name === prevStep.agent ? {...a, status: AgentStatus.TASK_COMPLETED, subStatus: null, currentThought: '' } : a));
      }

      if (!agentRuntimeState) {
          addLog('SYSTEM', `Error: Could not find agent "${step.agent}" for current step. Aborting mission.`, 'ERROR');
          if (teamHasSlackAdmin) postSlackMessage(setSlackHistory, 'error-bot', `CRITICAL ERROR: Agent "${step.agent}" not found. Mission aborted.`);
          setIsMissionActive(false);
          playErrorSound();
          return;
      }
       
      if (missionExecutionIndex > 0 && Math.random() < (failureChance / 100)) {
        handleMissionFailure(step, agentRuntimeState);
        return;
      }

      addLog(agentRuntimeState.name, `Executing task: "${step.task}"`, 'STATUS');
      if (teamHasSlackAdmin) postSlackMessage(setSlackHistory, 'system-bot', `[${agentRuntimeState.name}] has started task: "${step.task}"`);
      
      setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, status: AgentStatus.PROCESSING, subStatus: AgentSubStatus.THINKING, currentTask: step.task, currentThought: ''} : a));
      
      // Special handling for Trend-Spotter to use grounding
      if (agentRuntimeState.name === 'Trend-Spotter') {
          try {
              setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: 'Accessing Google Search for real-time trend data...' } : a));
              await new Promise(resolve => setTimeout(resolve, 1500)); // UI delay

              const response = await executeGroundedAgentTask(agentRuntimeState.manifest, step.task, missionObjective, selectedModel, selectedProvider, vaultValues);
              const resultText = response.text;
              const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
              const citations = groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean);

              if (citations && citations.length > 0) {
                  addLog(agentRuntimeState.name, `Sources found: ${citations.join(', ')}`, 'INFO');
              }
              
              setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: 'Finalizing grounded response...' } : a));

              setSharedMemory(prev => ({
                  ...prev,
                  [`task_${missionExecutionIndex}_result`]: {
                      value: resultText,
                      writtenBy: agentRuntimeState.name,
                      timestamp: new Date().toISOString(),
                      citations: citations || [],
                  }
              }));
              addLog(agentRuntimeState.name, `Wrote grounded result for task "${step.task}" to shared memory.`, 'INFO');
          } catch (error) {
              handleMissionFailure(step, agentRuntimeState);
              return;
          }
      } else {
        // Standard agent execution (simulated)
        try {
          const thoughtStream = generateAgentThoughtStream(agentRuntimeState.manifest, step.task, missionObjective, selectedModel, selectedProvider, vaultValues);
          for await (const thoughtChunk of thoughtStream) {
              if (isCancelled) return;
              setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: (a.currentThought || '') + thoughtChunk } : a));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          addLog(agentRuntimeState.name, `Failed to generate thought process: ${errorMessage}`, 'ERROR');
          if (!isCancelled) setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, currentThought: "[Thought process failed to generate.]" } : a));
        }

        if (isCancelled) return;
        
        const toolUsed = agentRuntimeState.manifest.tools.find(tool => step.task.toLowerCase().includes(tool.name.toLowerCase()));
        if (toolUsed) {
          setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, subStatus: AgentSubStatus.USING_TOOL } : a));
          addLog(agentRuntimeState.name, `Using tool: 🛠️ ${toolUsed.name}`, 'COMMAND');
          await new Promise(resolve => setTimeout(resolve, stepExecutionDelay / 2));
        }

        setSharedMemory(prev => ({
            ...prev,
            [`task_${missionExecutionIndex}_result`]: {
                value: `Completed: ${step.task}`,
                writtenBy: agentRuntimeState.name,
                timestamp: new Date().toISOString()
            }
        }));
        addLog(agentRuntimeState.name, `Wrote result for task "${step.task}" to shared memory.`, 'INFO');
      }
      
      if (isCancelled) return;

      // Phase 3: Final Execution
      setAgents(prev => prev.map(a => a.id === agentRuntimeState.id ? {...a, subStatus: null } : a));
      await new Promise(resolve => setTimeout(resolve, stepExecutionDelay / 2));
      
      if (isCancelled) return;

      if (teamHasSlackAdmin) postSlackMessage(setSlackHistory, 'system-bot', `✅ [${agentRuntimeState.name}] has completed task: "${step.task}"`);
      
      setMissionExecutionIndex(prev => prev + 1);
    };

    const timeoutId = setTimeout(processStep, stepExecutionDelay);

    return () => { 
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isMissionActive, missionPlan, missionExecutionIndex, agents, failureChance, handleMissionFailure, addLog, missionObjective, teamHasSlackAdmin, stepExecutionDelay, selectedModel, selectedProvider, vaultValues]);


  const resetMission = useCallback(() => {
    setIsMissionActive(false);
    setMissionPlan(null);
    setMissionExecutionIndex(0);
    setLogs([]);
    setSlackHistory([]);
    setSharedMemory({});
    setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, subStatus: null, currentTask: '', currentThought: ''})));
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
    
    playDeploySound();
    resetMission();
    setIsMissionActive(true);
    addLog('ORACLE', `Mission objective received: "${missionObjective}"`, 'STATUS');
    addLog('ORACLE', `Engaging model ${selectedModel} to generate mission plan...`, 'INFO');
    if (teamHasSlackAdmin) {
      postSlackMessage(setSlackHistory, 'system-bot', `🚀 Mission Deployed!\nTeam: ${currentTeamManifest.name}\nObjective: ${missionObjective}`);
    }

    try {
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
        desiredOutcomes,
        selectedProvider,
        vaultValues
      );
      
      if (!plan || plan.length === 0) {
        throw new Error("Orchestrator returned an empty or invalid plan.");
      }

      addLog('ORACLE', 'Mission plan generated successfully. Deploying agents.', 'STATUS');
      setMissionPlan(plan);
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
      setAgents(prev => prev.map(a => ({...a, status: AgentStatus.ERROR, subStatus: null, currentTask: 'Planning Failed'})));
    }
  }, [missionObjective, targetAudience, kpis, desiredOutcomes, currentTeamManifest, selectedIndustry, allAgents, addLog, resetMission, isReadyForDeployment, selectedProvider, selectedModel, vaultValues, teamHasSlackAdmin, planningDelay]);

  const handleAbortMission = useCallback(() => {
    playAbortSound();
    setIsMissionActive(false);
    setMissionPlan(null);
    setMissionExecutionIndex(0);
    addLog('SYSTEM', 'MISSION ABORTED BY USER.', 'ERROR');
    if (teamHasSlackAdmin) {
        postSlackMessage(setSlackHistory, 'error-bot', `🛑 MISSION ABORTED BY USER.`);
    }
    setAgents(prev => prev.map(a => ({...a, status: AgentStatus.STANDBY, subStatus: null, currentTask: 'Aborted', currentThought: ''})));
    setIsAbortModalOpen(false);
  }, [addLog, teamHasSlackAdmin]);

  const handleImportTeam = (jsonString: string) => {
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
        setIsImportTeamModalOpen(false);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse JSON.";
        setToast({ message: `Import failed: ${message}`, type: 'error' });
    }
  };

  const handleExportTeam = () => {
    if (!currentTeamManifest) return;
    playClickSound();
    setIsExportTeamModalOpen(true);
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
  
  const handleCreateAgent = (name: string, description: string) => {
    const newId = `custom-${Date.now()}`;
    const newAgent: AgentManifest = {
      schemaVersion: "agent.v1",
      id: newId,
      name: name,
      version: "1.0.0",
      description: description,
      author: "User",
      display: { avatar: "👤" },
      language: { name: "typescript", version: "5.0" },
      runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
      execution: { kind: "process", command: "node", args: ["main.js"] },
      model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.7, maxTokens: 2048 },
      prompts: {
        system: `You are a custom agent named ${name}. Your purpose is: ${description}`,
        assistant: "I am ready for my assignment.",
        userStarters: []
      },
      tools: [],
      memory: { mode: "short-term", provider: "local", binding: `memory_${newId}.json` },
      env: { required: [], optional: [] },
      tests: [{
        name: "smoke-test",
        input: "Introduce yourself.",
        expect: { contains: [name] }
      }]
    };

    setAllAgents(prev => ({ ...prev, [newId]: newAgent }));
    setIsCreateAgentModalOpen(false);
    setToast({ message: `Agent '${name}' created successfully!`, type: 'success' });
  };

  const handleExportAgent = () => {
    playClickSound();
    setIsExportAgentModalOpen(true);
  };
  
  const handleImportAgent = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        if (!data.agent || data.exportVersion !== "1.0") {
            throw new Error("Invalid or unsupported single agent export file format. Expected a root 'agent' key.");
        }
        const newAgent: AgentManifest = data.agent;

        if (!newAgent.id || !newAgent.name || !newAgent.schemaVersion) {
            throw new Error("Imported agent manifest is missing required fields (id, name, schemaVersion).");
        }
        if (allAgents[newAgent.id]) {
            throw new Error(`An agent with the ID "${newAgent.id}" already exists. Please use a unique ID.`);
        }

        // Add import metadata
        newAgent.importMeta = {
            source: 'user-paste',
            sourceType: 'user-paste',
            timestamp: new Date().toISOString(),
        };

        setAllAgents(prev => ({ ...prev, [newAgent.id]: newAgent }));

        setToast({ message: `Successfully imported agent: ${newAgent.name}`, type: 'success' });
        setIsImportAgentModalOpen(false);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse JSON.";
        setToast({ message: `Import failed: ${message}`, type: 'error' });
    }
  };

  const handleDeleteAgent = useCallback(() => {
    if (!selectedAgentId) return;

    const agentToDelete = allAgents[selectedAgentId];
    if (!agentToDelete) return;

    playAbortSound();

    // 1. Remove from allAgents
    setAllAgents(prevAllAgents => {
        const newAgents = { ...prevAllAgents };
        delete newAgents[selectedAgentId];
        return newAgents;
    });

    // 2. Remove from any teams it belongs to
    setTeamManifests(prevTeams =>
        prevTeams.map(team => ({
            ...team,
            members: team.members.filter(member => member.agentId !== selectedAgentId)
        }))
    );

    // 3. Reset UI state
    setSelectedAgentId(null);
    setIsDeleteAgentModalOpen(false);
    setToast({ message: `Agent '${agentToDelete.name}' and all team associations have been deleted.`, type: 'success' });
  }, [selectedAgentId, allAgents, setAllAgents, setTeamManifests, setSelectedAgentId, setIsDeleteAgentModalOpen, setToast]);
  
  const handleSendOrchestratorMessage = async (messageText: string) => {
    if (!messageText.trim() || !currentTeamManifest) return;

    const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: messageText,
        timestamp: new Date().toISOString(),
    };
    
    const thinkingMessage: ChatMessage = {
        id: `orchestrator-thinking-${Date.now()}`,
        sender: 'orchestrator',
        text: '...',
        timestamp: new Date().toISOString(),
    };

    const currentHistory = [...orchestratorChatHistory, userMessage];
    setOrchestratorChatHistory(prev => [...prev, userMessage, thinkingMessage]);
    setIsOrchestratorReplying(true);

    try {
        const teamAgents = currentTeamManifest.members.map(m => allAgents[m.agentId]).filter(Boolean);
        const responseText = await getOrchestratorChatResponse(
            currentHistory,
            ORACLE_ORCHESTRATOR,
            currentTeamManifest,
            teamAgents,
            selectedModel,
            selectedProvider,
            vaultValues
        );

        const orchestratorResponse: ChatMessage = {
            id: `orchestrator-${Date.now()}`,
            sender: 'orchestrator',
            text: responseText,
            timestamp: new Date().toISOString(),
        };

        setOrchestratorChatHistory(prev => [...prev.slice(0, -1), orchestratorResponse]);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const errorResponse: ChatMessage = {
            id: `orchestrator-error-${Date.now()}`,
            sender: 'orchestrator',
            text: `Sorry, I encountered an error: ${errorMessage}`,
            timestamp: new Date().toISOString(),
        };
        setOrchestratorChatHistory(prev => [...prev.slice(0, -1), errorResponse]);
        setToast({ message: `Orchestrator chat failed: ${errorMessage}`, type: 'error' });
    } finally {
        setIsOrchestratorReplying(false);
    }
  };


  const exportTeamData = useMemo(() => {
    if (!currentTeamManifest) return null;
    const teamAgentIds = new Set(currentTeamManifest.members.map(m => m.agentId));
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
    isExportTeamModalOpen,
    isImportTeamModalOpen,
    isCreateAgentModalOpen,
    isExportAgentModalOpen,
    isImportAgentModalOpen,
    isDeleteAgentModalOpen,
    selectedAgentId,
    teamManifests,
    exportTeamData,
    completedPlan,
    requiredApiKeys,
    vaultValues,
    isReadyForDeployment,
    allAgents,
    planningDelay,
    stepExecutionDelay,
    failureChance,
    orchestratorChatHistory,
    isOrchestratorReplying,

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
    setIsExportTeamModalOpen,
    setIsImportTeamModalOpen,
    setIsCreateAgentModalOpen,
    setIsExportAgentModalOpen,
    setIsImportAgentModalOpen,
    setIsDeleteAgentModalOpen,
    setSelectedAgentId,
    setVaultValues,
    setAllAgents,
    setPlanningDelay,
    setStepExecutionDelay,
    setFailureChance,

    // Handlers
    handleDeployMission,
    handleAbortMission,
    handleImportTeam,
    handleExportTeam,
    handleSlackCommand,
    handleCreateAgent,
    handleExportAgent,
    handleImportAgent,
    handleDeleteAgent,
    handleSendOrchestratorMessage,
  };
};