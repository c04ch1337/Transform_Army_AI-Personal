import React, { useState, useEffect } from 'react';
import { AgentRuntimeState, AgentStatus, AgentSubStatus } from '../types';
import { Typewriter } from './Typewriter';
import { Tooltip } from './Tooltip';
import { Avatar } from './Avatar';

interface AgentCardProps {
  agent: AgentRuntimeState;
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

const socialPlatformConfig = [
    { keys: ['tiktok'], icon: '🎵', name: 'TikTok' },
    { keys: ['facebook'], icon: '👍', name: 'Facebook' },
    { keys: ['instagram', 'insta'], icon: '📸', name: 'Instagram' },
    { keys: ['linkedin'], icon: '🤝', name: 'LinkedIn' },
];

const getSocialIcon = (agent: AgentRuntimeState): { icon: string; name: string } | null => {
    const combinedText = [
        agent.name,
        agent.manifest.description,
        ...agent.manifest.tools.map(t => t.name)
    ].join(' ').toLowerCase();

    for (const platform of socialPlatformConfig) {
        if (platform.keys.some(key => combinedText.includes(key))) {
            return { icon: platform.icon, name: platform.name };
        }
    }
    return null;
};

const SubStatusIndicator: React.FC<{ agent: AgentRuntimeState }> = ({ agent }) => {
    if (agent.status !== AgentStatus.PROCESSING || !agent.subStatus) {
        return null;
    }
    
    let text = '';
    let icon = '';
    let textColor = 'text-purple-300';
    switch(agent.subStatus) {
        case AgentSubStatus.THINKING:
            text = 'THINKING';
            icon = '🧠';
            textColor = 'text-purple-300';
            break;
        case AgentSubStatus.USING_TOOL:
            text = 'USING TOOL';
            icon = '🪄';
            textColor = 'text-yellow-300';
            break;
        default:
            return null;
    }

    return (
        <div className={`mt-2 text-xs font-mono ${textColor} flex items-center gap-1 animate-pulse`}>
            <span>{icon}</span>
            <span>{text}...</span>
        </div>
    );
};

const AgentCardComponent: React.FC<AgentCardProps> = ({ agent }) => {
  const config = statusConfig[agent.status] || statusConfig[AgentStatus.STANDBY];
  const isDeployed = agent.status === AgentStatus.DEPLOYED;
  const isUsingTool = agent.status === AgentStatus.PROCESSING && agent.subStatus === AgentSubStatus.USING_TOOL;
  const socialIcon = getSocialIcon(agent);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPersonaPinned, setIsPersonaPinned] = useState(false);

  const showPersona = isHovering || isPersonaPinned;

  useEffect(() => {
    if (agent.status === AgentStatus.TASK_COMPLETED) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 1000); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
  }, [agent.status]);

  return (
    <div 
      className={`relative border-l-4 ${config.borderColor} bg-gray-900 rounded-md shadow-md p-3 flex flex-col transition-all duration-300 h-full ${config.animation || ''} ${justCompleted ? 'animate-glow-green' : ''} cursor-pointer group`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => setIsPersonaPinned(prev => !prev)}
      role="button"
      tabIndex={0}
      aria-pressed={isPersonaPinned}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsPersonaPinned(prev => !prev); }}
    >
      <div className={`transition-opacity duration-300 ${showPersona ? 'opacity-10' : 'opacity-100'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <Avatar
              avatar={agent.manifest.display.avatar}
              name={agent.name}
              className={`text-3xl ${isDeployed ? 'animate-pulse' : ''}`}
              imageClassName={`w-10 h-10 rounded-md object-cover shadow-lg ${isDeployed ? 'animate-pulse-pink' : ''}`}
            />
            <div>
              <div className="flex items-center gap-1.5">
                  <Tooltip text={agent.manifest.description}>
                      <h3 className="font-display text-gray-100 text-base">{agent.name}</h3>
                  </Tooltip>
                  {socialIcon && (
                      <Tooltip text={`Platform: ${socialIcon.name}`}>
                          <span className="text-sm">{socialIcon.icon}</span>
                      </Tooltip>
                  )}
              </div>
              <p className={`font-display text-xs ${config.textColor}`}>{config.label}</p>
            </div>
          </div>
          {isUsingTool && (
              <Tooltip text="Using Tool">
                  <span className="text-xl animate-tool-glow">🪄</span>
              </Tooltip>
          )}
        </div>
         <SubStatusIndicator agent={agent} />
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

      {/* Persona Overlay */}
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm p-3 rounded-md flex flex-col transition-opacity duration-300 ease-in-out ${showPersona ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h4 className="font-display text-pink-400 text-xs mb-2 flex-shrink-0">AGENT PERSONA</h4>
        <div className="overflow-y-auto pr-1 flex-grow">
          <p className="font-mono text-xs text-gray-300">
            {agent.manifest.prompts.system}
          </p>
        </div>
      </div>
    </div>
  );
};

export const AgentCard = React.memo(AgentCardComponent);