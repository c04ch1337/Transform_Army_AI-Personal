import React, { useState, useRef, useEffect } from 'react';
import { SlackMessage } from '../types';
import { useMission } from '../App';
import { Avatar } from './Avatar';

const senderConfig = {
    'user': {
        icon: '🎀',
        name: 'Admin',
        color: 'text-purple-400',
    },
    'system-bot': {
        icon: '🤖',
        name: 'System Bot',
        color: 'text-green-400',
    },
    'error-bot': {
        icon: '🚨',
        name: 'Error Bot',
        color: 'text-red-400',
    }
};

export const SlackAdminConsole: React.FC = () => {
  const { 
    slackHistory: messages, 
    handleSlackCommand: onSendCommand, 
    isMissionActive: isDisabled 
  } = useMission();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isDisabled) {
      onSendCommand(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="p-4 bg-sparkle h-full flex flex-col">
       <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">#mission-control</h2>
       <div className="flex-grow bg-black/30 rounded-md p-3 my-2 overflow-y-auto border border-gray-700 font-mono text-sm space-y-4">
            {messages.map(msg => {
                const config = senderConfig[msg.sender];
                return (
                    <div key={msg.id} className="flex items-start">
                        <div className="mr-3 flex-shrink-0">
                            <Avatar avatar={config.icon} name={config.name} className="text-xl" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline">
                                <span className={`font-bold mr-2 ${config.color}`}>{config.name}</span>
                                <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-gray-200 whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
       </div>
       <form onSubmit={handleSubmit} className="mt-auto">
            <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isDisabled}
                placeholder={isDisabled ? 'Mission in progress...' : "Type a command... (e.g. /help)"}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 font-mono text-sm"
            />
       </form>
    </div>
  );
};
