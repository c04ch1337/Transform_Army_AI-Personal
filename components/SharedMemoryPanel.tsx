import React from 'react';
import { SharedMemoryContents } from '../types';
import { EmptyState } from './EmptyState';
import { useMission } from '../App';

export const SharedMemoryPanel: React.FC = () => {
  const { sharedMemory: memory } = useMission();
  const memoryKeys = Object.keys(memory);

  return (
    <div className="p-4 bg-sparkle h-full flex flex-col">
      <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">SHARED MEMORY</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {memoryKeys.length > 0 ? (
          <div className="border border-gray-700 rounded-md">
            <table className="w-full text-sm font-mono text-left">
              <thead className="text-xs text-pink-400 uppercase bg-black/30">
                <tr>
                  <th scope="col" className="px-4 py-2">Key</th>
                  <th scope="col" className="px-4 py-2">Written By</th>
                  <th scope="col" className="px-4 py-2">Timestamp</th>
                  <th scope="col" className="px-4 py-2">Value &amp; Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {memoryKeys.map(key => {
                  const entry = memory[key];
                  const valueString = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value, null, 2);

                  return (
                    <tr key={key} className="hover:bg-gray-800">
                      <td className="px-4 py-2 font-bold text-purple-400 align-top whitespace-nowrap">"{key}"</td>
                      <td className="px-4 py-2 text-gray-300 align-top whitespace-nowrap">{entry.writtenBy}</td>
                      <td className="px-4 py-2 text-gray-400 align-top whitespace-nowrap">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-2 text-gray-200 align-top">
                        <pre className="bg-gray-800 p-2 rounded text-xs whitespace-pre-wrap max-w-lg">
                          <code>{valueString}</code>
                        </pre>
                         {entry.citations && entry.citations.length > 0 && (
                            <div className="mt-2 p-2 bg-purple-900/30 rounded-md border-l-2 border-purple-500">
                                <p className="text-xs text-pink-400 mb-1">Sources:</p>
                                <ul className="space-y-1">
                                    {entry.citations.map((cite: string, i: number) => (
                                        <li key={i} className="text-xs text-purple-300 truncate">
                                            <a href={cite} target="_blank" rel="noopener noreferrer" className="hover:underline" title={cite}>
                                                {i + 1}. {cite}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center h-full">
            <EmptyState
              icon="🧠"
              title="Memory Is Empty"
              message="Shared memory will be populated as agents complete tasks and share information during a mission."
            />
          </div>
        )}
      </div>
    </div>
  );
};