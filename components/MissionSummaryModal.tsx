import React from 'react';
import { MissionStep } from '../types';

interface MissionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionObjective: string;
  completedPlan: MissionStep[];
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({ isOpen, onClose, missionObjective, completedPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
        <h2 className="font-display text-pink-400 text-xl mb-2 text-glow-pink">MISSION ACCOMPLISHED! 🎉</h2>
        <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">Objective: "{missionObjective}"</p>
        
        <div className="overflow-y-auto pr-2 space-y-3 flex-grow">
            {completedPlan.map((step, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <p className="font-display text-pink-400 text-sm">STEP {index + 1}: ASSIGNED TO <span className="text-pink-300">{step.agent}</span></p>
                    <p className="font-mono text-gray-300 text-sm mt-1">Task: {step.task}</p>
                </div>
            ))}
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-pink-500/30">
          <button
            onClick={onClose}
            className="font-display bg-pink-600 text-white px-8 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};