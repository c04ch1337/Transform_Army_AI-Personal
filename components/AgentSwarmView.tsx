import React, { useState, useEffect, useRef } from 'react';
import { AgentRuntimeState, MissionStep } from '../types';
import { AgentCard } from './AgentCard';
import { EmptyState } from './EmptyState';
import { useMission } from '../App';

interface Line {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: 'completed' | 'active' | 'future';
}

const lineStatusConfig = {
    completed: {
        stroke: '#10B981', // green-500
        strokeWidth: 2,
        strokeDasharray: 'none',
        animation: 'none',
    },
    active: {
        stroke: '#EC4899', // pink-500
        strokeWidth: 3,
        strokeDasharray: 'none',
        animation: 'pulse-line 2s infinite ease-in-out',
    },
    future: {
        stroke: '#6B7280', // gray-500
        strokeWidth: 2,
        strokeDasharray: '5, 5',
        animation: 'none',
    },
};

export const AgentSwarmView: React.FC = () => {
  const { 
    agents, 
    missionPlan, 
    missionExecutionIndex, 
    isMissionActive 
  } = useMission();

  const [lines, setLines] = useState<Line[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const agentElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const calculateLines = React.useCallback(() => {
    if (!isMissionActive || !missionPlan || !gridRef.current) {
      if (lines.length > 0) setLines([]);
      return;
    }
    
    // Update refs to elements
    agentElementsRef.current.clear();
    const agentCards = gridRef.current.querySelectorAll<HTMLElement>('[data-agent-id]');
    agentCards.forEach(card => {
        const agentId = card.dataset.agentId;
        if (agentId) {
            agentElementsRef.current.set(agentId, card);
        }
    });

    const containerRect = gridRef.current.getBoundingClientRect();
    const newLines: Line[] = [];

    for (let i = 0; i < missionPlan.length - 1; i++) {
      const fromStep = missionPlan[i];
      const toStep = missionPlan[i + 1];

      const fromAgent = agents.find(a => a.name === fromStep.agent);
      const toAgent = agents.find(a => a.name === toStep.agent);

      if (!fromAgent || !toAgent || fromAgent.id === toAgent.id) continue;

      const fromElem = agentElementsRef.current.get(fromAgent.id);
      const toElem = agentElementsRef.current.get(toAgent.id);

      if (!fromElem || !toElem) continue;

      const fromRect = fromElem.getBoundingClientRect();
      const toRect = toElem.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      let status: Line['status'];
      if (i < missionExecutionIndex - 1) {
        status = 'completed';
      } else if (i === missionExecutionIndex - 1) {
        status = 'active';
      } else {
        status = 'future';
      }

      newLines.push({ key: `${fromAgent.id}-${toAgent.id}-${i}`, x1, y1, x2, y2, status });
    }

    setLines(newLines);
  }, [isMissionActive, missionPlan, missionExecutionIndex, agents, lines.length]);
  
  useEffect(() => {
    calculateLines();
    const observer = new ResizeObserver(calculateLines);
    const gridEl = gridRef.current;
    if (gridEl) {
      observer.observe(gridEl);
    }
    return () => {
      if (gridEl) {
        observer.unobserve(gridEl);
      }
    };
  }, [calculateLines]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-4 rounded-lg shadow-lg bg-sparkle h-full flex flex-col">
      <h2 className="font-display text-pink-400 text-lg mb-4 border-b-2 border-pink-500/30 pb-2 text-glow-pink">AGENT SWARM STATUS</h2>
      <div className="flex-grow overflow-y-auto pr-2 relative">
        <style>
          {`
            @keyframes pulse-line {
              50% {
                stroke-width: 5px;
                filter: drop-shadow(0 0 6px #EC4899aa);
              }
            }
            .grid-container-for-lines {
              position: relative; /* Establish positioning context for SVG */
            }
          `}
        </style>
        
        {agents.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-container-for-lines">
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
              style={{ overflow: 'visible' }}
            >
              <defs>
                  <marker id="arrowhead-future" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                  </marker>
                  <marker id="arrowhead-completed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#EC4899" />
                  </marker>
              </defs>
              {lines.map(line => {
                const config = lineStatusConfig[line.status];
                return (
                  <line
                    key={line.key}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={config.stroke}
                    strokeWidth={config.strokeWidth}
                    strokeDasharray={config.strokeDasharray}
                    style={{ animation: config.animation }}
                    markerEnd={`url(#arrowhead-${line.status})`}
                  />
                );
              })}
            </svg>
            {agents.map(agent => (
              <div key={agent.id} data-agent-id={agent.id} className="relative z-0">
                <AgentCard 
                  agent={agent} 
                />
              </div>
            ))}
             {isMissionActive && !missionPlan && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md z-20 col-span-full">
                    <p className="font-display text-yellow-300 text-lg animate-pulse">ORACLE IS PLANNING...</p>
                </div>
            )}
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
