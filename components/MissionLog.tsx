import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { EmptyState } from './EmptyState';
import { useMission } from '../App';

const logTypeConfig = {
    COMMAND: 'text-purple-400',
    STATUS: 'text-green-400',
    COMMS: 'text-pink-400',
    ERROR: 'text-red-400',
    INFO: 'text-gray-400',
};

export const MissionLog: React.FC = () => {
  const { logs } = useMission();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="text-gray-200 font-mono p-4 bg-sparkle h-full flex flex-col">
      <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">
        MISSION LOG
      </h2>
      <div className="flex-grow overflow-y-auto text-xs space-y-2 pr-2 flex flex-col-reverse">
        {logs.length > 0 ? (
          <>
            {/* This div is the target for scrolling. In a flex-reverse container, the last element is at the top. */}
            <div />
            {logs.map(log => (
                <div key={log.id}>
                    <div className="flex items-center">
                        <span className="text-gray-500 mr-2 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`${logTypeConfig[log.type]} font-bold`}>[{log.source}]</span>
                    </div>
                    <p className="text-gray-300 break-words pl-1 mt-0.5">
                        {'>'} {log.message}
                    </p>
                </div>
            ))}
            {/* This div is the first element, so it appears at the bottom. We scroll to it. */}
            <div ref={logEndRef} />
          </>
        ) : (
            <div className="flex-grow flex items-center justify-center h-full">
              <EmptyState 
                icon="📝"
                title="Awaiting Mission"
                message="Deploy agents to begin logging."
              />
            </div>
        )}
      </div>
    </div>
  );
};