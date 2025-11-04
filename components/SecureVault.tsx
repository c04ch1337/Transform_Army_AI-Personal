import React from 'react';
import { useMission } from '../App';

export const SecureVault: React.FC = () => {
  const { requiredApiKeys, vaultValues, setVaultValues } = useMission();

  const onValueChange = (key: string, value: string) => {
    setVaultValues(prev => ({...prev, [key]: value}));
  };

  const getStatus = (key: string) => {
    return vaultValues[key] && vaultValues[key].trim() !== '' ? 'SET' : 'MISSING';
  };

  return (
    <div className="p-4 bg-sparkle h-full flex flex-col">
        <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">SECURE VAULT</h2>
        <div className="flex-grow overflow-y-auto pr-2">
            <p className="font-mono text-xs text-pink-400 mb-4">
                The following API keys and environment variables are required by the selected team.
                Provide a value for each required key to enable mission deployment.
            </p>
            {requiredApiKeys.length > 0 ? (
                <div className="space-y-3">
                    {requiredApiKeys.map(key => (
                        <div key={key} className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700 gap-4">
                            <div className="flex items-center flex-shrink-0">
                                <span className={`mr-2 text-xs font-bold ${getStatus(key) === 'SET' ? 'text-green-500' : 'text-red-400'}`}>
                                    [{getStatus(key)}]
                                </span>
                                <label htmlFor={key} className="font-mono text-sm text-pink-300">{key}</label>
                            </div>
                            <input
                                id={key}
                                type="text"
                                value={vaultValues[key] || ''}
                                onChange={(e) => onValueChange(key, e.target.value)}
                                placeholder="Enter placeholder value..."
                                className="w-full bg-gray-700 border border-gray-600 text-gray-200 p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono text-xs"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-center text-pink-500">
                    <p className="font-mono text-sm">No specific keys required for this team. ✨</p>
                </div>
            )}
        </div>
    </div>
  );
};