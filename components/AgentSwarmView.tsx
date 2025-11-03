import React from 'react';
import { AgentRuntimeState } from '../types';
import { AgentCard } from './AgentCard';
import { EmptyState } from './EmptyState';

interface AgentSwarmViewProps {
  agents: AgentRuntimeState[];
  agentUsingToolId: string | null;
}

export const AgentSwarmView: React.FC<AgentSwarmViewProps> = ({ agents, agentUsingToolId }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-4 rounded-lg shadow-lg bg-sparkle h-full flex flex-col">
      <h2 className="font-display text-pink-400 text-lg mb-4 border-b-2 border-pink-500/30 pb-2 text-glow-pink">AGENT SWARM STATUS</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                isUsingTool={agent.id === agentUsingToolId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✨"
            title="Awaiting Team Selection"
            message="Select a team from the Mission Control panel to see agent statuses."
          />
        )}
      </div>
    </div>
  );
};