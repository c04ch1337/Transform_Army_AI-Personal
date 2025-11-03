import React from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import { AgentSwarmView } from './components/AgentSwarmView';
import { OrchestratorConsole } from './components/OrchestratorConsole';
import { TabbedPanel } from './components/TabbedPanel';
import { MissionLog } from './components/MissionLog';
import { SlackAdminConsole } from './components/SlackAdminConsole';
import { SharedMemoryPanel } from './components/SharedMemoryPanel';
import { SecureVault } from './components/SecureVault';
import { AgentForge } from './components/AgentForge';
import { SimulationControls } from './components/SimulationControls';
import { ConfirmModal } from './components/ConfirmModal';
import { MissionSummaryModal } from './components/MissionSummaryModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { Toast } from './components/Toast';
import { ResizablePanel } from './components/ResizablePanel';
import { useMissionControl } from './hooks/useMissionControl';
import { allAgents as initialAllAgents } from './constants';

const App: React.FC = () => {
  const {
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
    handleDeployMission,
    handleAbortMission,
    handleImport,
    handleExport,
    setVaultValues,
    handleSlackCommand,
    setAllAgents,
    setPlanningDelay,
    setStepExecutionDelay,
    setFailureChance,
  } = useMissionControl();

  const primaryTabs = [
    { label: 'Mission Log', component: <MissionLog logs={logs} /> },
    { label: 'Slack Admin', component: <SlackAdminConsole messages={slackHistory} onSendCommand={handleSlackCommand} isDisabled={isMissionActive} /> },
    { label: 'Shared Memory', component: <SharedMemoryPanel memory={sharedMemory} /> },
    { label: 'Secure Vault', component: <SecureVault requiredKeys={requiredApiKeys} vaultValues={vaultValues} onValueChange={(key, value) => setVaultValues(prev => ({...prev, [key]: value}))} /> },
    { label: 'Agent Forge', component: <AgentForge allAgents={allAgents} setAllAgents={setAllAgents} defaultAgents={initialAllAgents} setToast={setToast} /> },
    { label: 'Simulation', component: <SimulationControls 
        planningDelay={planningDelay}
        setPlanningDelay={setPlanningDelay}
        stepExecutionDelay={stepExecutionDelay}
        setStepExecutionDelay={setStepExecutionDelay}
        failureChance={failureChance}
        setFailureChance={setFailureChance}
    />},
  ];

  return (
    <div className="bg-black min-h-screen font-sans text-gray-200 flex flex-col">
      <Header isMissionActive={isMissionActive} onAbortMission={() => setIsAbortModalOpen(true)} />
      
      <main className="container mx-auto p-4 flex-grow flex flex-col gap-4">
        <div className="flex-grow min-h-0">
          <ResizablePanel direction="horizontal" initialSize={70}>
            {/* Left side of resizable panel */}
            <div className="h-full flex flex-col gap-4">
              <div className="flex-grow min-h-0">
                <ResizablePanel direction="horizontal" initialSize={30}>
                  <ControlPanel
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    selectedIndustry={selectedIndustry}
                    setSelectedIndustry={setSelectedIndustry}
                    selectedMission={selectedMission}
                    setSelectedMission={setSelectedMission}
                    setMissionObjective={setMissionObjective}
                    selectedProvider={selectedProvider}
                    setSelectedProvider={setSelectedProvider}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    isMissionActive={isMissionActive}
                    onExport={handleExport}
                    onImport={() => setIsImportModalOpen(true)}
                    teamManifests={teamManifests}
                  />
                  <OrchestratorConsole
                    missionObjective={missionObjective}
                    setMissionObjective={setMissionObjective}
                    targetAudience={targetAudience}
                    setTargetAudience={setTargetAudience}
                    kpis={kpis}
                    setKpis={setKpis}
                    desiredOutcomes={desiredOutcomes}
                    setDesiredOutcomes={setDesiredOutcomes}
                    onDeploy={handleDeployMission}
                    isMissionActive={isMissionActive}
                    isReadyForDeployment={isReadyForDeployment}
                    missionPlan={missionPlan}
                    missionExecutionIndex={missionExecutionIndex}
                    selectedProvider={selectedProvider}
                    selectedModel={selectedModel}
                  />
                </ResizablePanel>
              </div>
              <div className="h-[40%] min-h-[200px] flex-shrink-0">
                <AgentSwarmView agents={agents} agentUsingToolId={agentUsingToolId} />
              </div>
            </div>
            
            {/* Right side of resizable panel */}
            <TabbedPanel tabs={primaryTabs} />
          </ResizablePanel>
        </div>
      </main>

      {/* Modals and Toasts */}
      <ConfirmModal
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        onConfirm={handleAbortMission}
        title="ABORT MISSION"
      >
        <p>Are you sure you want to abort the current mission? All progress will be lost and agents will be reset to standby.</p>
      </ConfirmModal>

      <MissionSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        missionObjective={missionObjective}
        completedPlan={completedPlan}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportData={exportData}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;