import React from 'react';
import { useMission } from '../App';

const Header: React.FC = () => {
  const { isMissionActive, setIsAbortModalOpen } = useMission();

  return (
    <header className="bg-black/50 backdrop-blur-lg border-b border-pink-500/30 p-4 shadow-lg sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-xl sm:text-2xl text-white text-glow-pink whitespace-nowrap">
          <span className="text-pink-500">[</span> 💎 TRANSFORM ARMY AI 💎 <span className="text-pink-500">]</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-pink-400 hidden sm:block">
            Personal AI Orchestrator v1.0
          </div>
          {isMissionActive && (
             <button
                onClick={() => setIsAbortModalOpen(true)}
                className="font-display bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm animate-pulse"
              >
                ABORT MISSION
              </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);