import React from 'react';
import { MissionStep } from '../types';
import { Modal } from './Modal';

interface MissionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionObjective: string;
  completedPlan: MissionStep[];
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({ isOpen, onClose, missionObjective, completedPlan }) => {
  const footer = (
    <button
      onClick={onClose}
      className="font-display bg-pink-600 text-white px-8 py-2 rounded-md hover:bg-pink-700 transition-colors"
    >
      DISMISS
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MISSION ACCOMPLISHED! 🎉"
      footer={footer}
      className="max-w-2xl"
    >
      <p className="text-gray-400 font-mono mb-4 text-sm border-b border-pink-500/30 pb-4">
        Objective: "{missionObjective}"
      </p>
      <div className="space-y-3">
        {completedPlan.map((step, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <p className="font-display text-pink-400 text-sm">
              STEP {index + 1}: ASSIGNED TO <span className="text-pink-300">{step.agent}</span>
            </p>
            <p className="font-mono text-gray-300 text-sm mt-1">
              Task: {step.task}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
};