import React from 'react';
import { AgentRuntimeState, AgentStatus } from '../types';
import { Typewriter } from './Typewriter';
import { Tooltip } from './Tooltip';

interface AgentCardProps {
  agent: AgentRuntimeState;
  isUsingTool?: boolean;
}

const statusConfig = {
  [AgentStatus.STANDBY]: {
    borderColor: 'border-purple-500',
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-900/50',
    label: 'STANDBY',
    animation: '',
  },
  [AgentStatus.DEPLOYED]: {
    borderColor: 'border-pink-500',
    textColor: 'text-pink-300',
    bgColor: 'bg-pink-900/50',
    label: 'DEPLOYED',
    animation: 'animate-pulse-pink',
  },
  [AgentStatus.PROCESSING]: {
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-300',
    bgColor: 'bg-yellow-900/50',
    label: 'PROCESSING',
    animation: 'animate-pulse-peach',
  },
  [AgentStatus.TASK_COMPLETED]: {
    borderColor: 'border-green-500',
    textColor: 'text-green-300',
    bgColor: 'bg-green-900/50',
    label: 'TASK COMPLETE',
    animation: '',
  },
  [AgentStatus.ERROR]: {
    borderColor: 'border-red-500',
    textColor: 'text-red-300',
    bgColor: 'bg-red-900/50',
    label: 'ERROR',
    animation: 'animate-shake',
  },
  [AgentStatus.COMPROMISED]: {
    borderColor: 'border-red-500',
    textColor: 'text-white',
    bgColor: 'bg-red-500',
    label: 'COMPROMISED',
    animation: 'animate-pulse',
  },
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isUsingTool }) => {
  const config = statusConfig[agent.status] || statusConfig[AgentStatus.STANDBY];

  return (
    <div className={`border-l-4 ${config.borderColor} bg-gray-900 rounded-md shadow-md p-3 flex flex-col transition-all duration-300 h-full ${config.animation || ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.manifest.display.avatar}</span>
          <div>
            <Tooltip text={agent.manifest.description}>
                <h3 className="font-display text-gray-100 text-base">{agent.name}</h3>
            </Tooltip>
            <p className={`font-display text-xs ${config.textColor}`}>{config.label}</p>
          </div>
        </div>
        {isUsingTool && (
            <Tooltip text="Using Tool">
                <span className="text-xl animate-tool-glow">🪄</span>
            </Tooltip>
        )}
      </div>
      <div className="mt-2 flex-grow min-h-[3rem]">
        <p className="font-mono text-xs text-pink-500">Current Task:</p>
        <p className="font-mono text-sm text-gray-300 h-full">
            {agent.status === AgentStatus.PROCESSING ? <Typewriter text={agent.currentTask} /> : agent.currentTask || 'Awaiting assignment...'}
        </p>
      </div>
      {agent.currentThought && agent.status === AgentStatus.PROCESSING && (
        <div className="mt-2 text-xs font-mono bg-purple-900/30 border-l-2 border-purple-500/50 p-2 rounded">
          <p className="text-gray-400 mb-1">Thought Process:</p>
          <p className="text-purple-300 whitespace-pre-wrap">
            {agent.currentThought}
            <span className="animate-pulse">_</span>
          </p>
        </div>
      )}
    </div>
  );
};