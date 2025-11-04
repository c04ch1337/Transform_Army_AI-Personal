import React, { createContext, useContext } from 'react';
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
import { CreateAgentModal } from './components/CreateAgentModal';
import { ExportAgentModal } from './components/ExportAgentModal';
import { ImportAgentModal } from './components/ImportAgentModal';
import { Toast } from './components/Toast';
import { ResizablePanel } from './components/ResizablePanel';
import { useMissionControl } from './hooks/useMissionControl';
import { OrchestratorChat } from './components/OrchestratorChat';

// =================================================================
// CONTEXT SETUP
// =================================================================

// Create a type for the hook's return value to avoid using `any`
type MissionControlContextType = ReturnType<typeof useMissionControl>;

const MissionContext = createContext<MissionControlContextType | undefined>(undefined);

// The custom hook that components will use to access the context
export const useMission = (): MissionControlContextType => {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};

// The provider component that wraps the app and provides the context
const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const missionControl = useMissionControl();
  return (
    <MissionContext.Provider value={missionControl}>
      {children}
    </MissionContext.Provider>
  );
};


// =================================================================
// LAYOUT COMPONENT
// =================================================================
// This component contains the entire UI, and uses the context to get state.
const Layout: React.FC = () => {
  const {
    toast,
    isAbortModalOpen,
    isSummaryModalOpen,
    isExportTeamModalOpen,
    isImportTeamModalOpen,
    isCreateAgentModalOpen,
    isExportAgentModalOpen,
    isImportAgentModalOpen,
    isDeleteAgentModalOpen,
    exportTeamData,
    selectedAgentId,
    allAgents,
    completedPlan,
    missionObjective,
    setToast,
    setIsAbortModalOpen,
    setIsSummaryModalOpen,
    setIsExportTeamModalOpen,
    setIsImportTeamModalOpen,
    setIsCreateAgentModalOpen,
    setIsExportAgentModalOpen,
    setIsImportAgentModalOpen,
    setIsDeleteAgentModalOpen,
    handleAbortMission,
    handleImportTeam,
    handleCreateAgent,
    handleImportAgent,
    handleDeleteAgent,
  } = useMission();

  // Define tabs here, so child components can use the context without prop drilling
  const primaryTabs = [
    { label: 'Mission Log', component: <MissionLog /> },
    { label: 'Orchestrator Chat', component: <OrchestratorChat /> },
    { label: 'Slack Admin', component: <SlackAdminConsole /> },
    { label: 'Shared Memory', component: <SharedMemoryPanel /> },
    { label: 'Secure Vault', component: <SecureVault /> },
    { label: 'Agent Forge', component: <AgentForge /> },
    { label: 'Simulation', component: <SimulationControls /> },
  ];

  const agentToExport = selectedAgentId ? allAgents[selectedAgentId] : null;
  const agentToDelete = selectedAgentId ? allAgents[selectedAgentId] : null;

  return (
    <div className="bg-black min-h-screen font-sans text-gray-200 flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-grow flex flex-col gap-4">
        <div className="flex-grow min-h-0">
          <ResizablePanel direction="horizontal" initialSize={60}>
            {/* Left side of resizable panel */}
            <div className="h-full flex flex-col gap-4">
              <div className="flex-grow min-h-0">
                <ResizablePanel direction="horizontal" initialSize={30}>
                  <ControlPanel />
                  <OrchestratorConsole />
                </ResizablePanel>
              </div>
              <div className="h-[40%] min-h-[200px] flex-shrink-0">
                <AgentSwarmView />
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

       <ConfirmModal
        isOpen={isDeleteAgentModalOpen}
        onClose={() => setIsDeleteAgentModalOpen(false)}
        onConfirm={handleDeleteAgent}
        title="DELETE AGENT"
        confirmText="DELETE PERMANENTLY"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        {agentToDelete ? (
            <p>
                Are you sure you want to permanently delete the agent{' '}
                <strong className="text-pink-400">{agentToDelete.name}</strong>? This action
                cannot be undone. The agent will also be removed from any teams it belongs to.
            </p>
        ) : (
            <p>Are you sure you want to delete this agent? This action cannot be undone.</p>
        )}
      </ConfirmModal>

      <MissionSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        missionObjective={missionObjective}
        completedPlan={completedPlan}
      />

      <ExportModal 
        isOpen={isExportTeamModalOpen}
        onClose={() => setIsExportTeamModalOpen(false)}
        exportData={exportTeamData}
      />

      <ImportModal
        isOpen={isImportTeamModalOpen}
        onClose={() => setIsImportTeamModalOpen(false)}
        onImport={handleImportTeam}
      />

      <CreateAgentModal
        isOpen={isCreateAgentModalOpen}
        onClose={() => setIsCreateAgentModalOpen(false)}
        onCreate={handleCreateAgent}
      />

      <ExportAgentModal
        isOpen={isExportAgentModalOpen}
        onClose={() => setIsExportAgentModalOpen(false)}
        exportData={agentToExport}
      />

      <ImportAgentModal
        isOpen={isImportAgentModalOpen}
        onClose={() => setIsImportAgentModalOpen(false)}
        onImport={handleImportAgent}
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

// =================================================================
// APP COMPONENT (ROOT)
// =================================================================
// The root component now simply wraps the Layout with the state provider.
const App: React.FC = () => {
  return (
    <MissionProvider>
      <Layout />
    </MissionProvider>
  );
};

export default App;