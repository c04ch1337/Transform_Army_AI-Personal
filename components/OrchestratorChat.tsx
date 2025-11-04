import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../App';
import { ChatMessage } from '../types';
import { ORACLE_ORCHESTRATOR } from '../constants';
import { Avatar } from './Avatar';

// A simple markdown-like renderer for the chat.
const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const textWithBreaks = message.text.replace(/\n/g, '<br />');
    const textWithBold = textWithBreaks.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return (
        <div dangerouslySetInnerHTML={{ __html: textWithBold }} />
    );
};


export const OrchestratorChat: React.FC = () => {
    const { 
        orchestratorChatHistory,
        handleSendOrchestratorMessage,
        isOrchestratorReplying,
        isMissionActive,
    } = useMission();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [orchestratorChatHistory]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            handleSendOrchestratorMessage(input);
            setInput('');
        }
    };

    const isInputDisabled = isMissionActive || isOrchestratorReplying;

    return (
        <div className="p-4 bg-sparkle h-full flex flex-col">
            <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">CHAT WITH ORACLE</h2>
            <div className="flex-grow bg-black/30 rounded-md p-3 my-2 overflow-y-auto border border-gray-700 font-mono text-sm space-y-4">
                {orchestratorChatHistory.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const isThinking = msg.text === '...';
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                             <div className="flex-shrink-0 mt-1">
                                <Avatar
                                    avatar={isUser ? '👤' : ORACLE_ORCHESTRATOR.display?.avatar || '🔮'}
                                    name={isUser ? 'User' : ORACLE_ORCHESTRATOR.name}
                                    className="text-2xl"
                                    imageClassName="w-8 h-8 rounded-md object-cover"
                                />
                            </div>
                            <div className={`p-3 rounded-lg max-w-lg ${isUser ? 'bg-purple-800 text-purple-100' : 'bg-gray-700 text-gray-200'}`}>
                                {isThinking ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                        <span className="h-2 w-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="h-2 w-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                ) : (
                                    <ChatBubble message={msg} />
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isInputDisabled}
                    placeholder={
                        isMissionActive ? "Chat disabled during active mission." :
                        isOrchestratorReplying ? "Oracle is replying..." :
                        "Ask about the team or mission..."
                    }
                    className="flex-grow w-full bg-gray-800 border border-gray-600 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 font-mono text-sm"
                    aria-label="Chat with orchestrator"
                />
                <button type="submit" disabled={isInputDisabled} className="font-display bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                    SEND
                </button>
            </form>
        </div>
    );
};