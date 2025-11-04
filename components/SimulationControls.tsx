import React from 'react';
import { useMission } from '../App';

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
    <label htmlFor={label} className="flex justify-between items-center font-mono text-sm text-pink-300 mb-2">
      <span>{label}</span>
      <span className="font-display text-pink-400 text-base">{value}{unit}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      style={{'--thumb-color': '#ff007f'} as React.CSSProperties}
    />
    <style>{`
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: var(--thumb-color);
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid #0d0d0d;
        }
        input[type=range]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: var(--thumb-color);
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid #0d0d0d;
        }
    `}</style>
  </div>
);

export const SimulationControls: React.FC = () => {
  const {
    planningDelay,
    setPlanningDelay,
    stepExecutionDelay,
    setStepExecutionDelay,
    failureChance,
    setFailureChance,
  } = useMission();

  return (
    <div className="p-4 bg-sparkle h-full flex flex-col">
      <h2 className="font-display text-pink-400 text-lg mb-2 border-b-2 border-pink-500/30 pb-2 text-glow-pink">
        SIMULATION CONTROLS
      </h2>
      <div className="flex-grow overflow-y-auto pr-2 space-y-6 pt-4">
        <p className="font-mono text-xs text-pink-400">
          Adjust the timing and parameters for mission execution. Changes are saved automatically.
        </p>
        <SliderControl
          label="Orchestrator Planning Delay"
          value={planningDelay}
          min={500}
          max={5000}
          step={100}
          unit="ms"
          onChange={setPlanningDelay}
        />
        <SliderControl
          label="Agent Step Execution Delay"
          value={stepExecutionDelay}
          min={1000}
          max={10000}
          step={500}
          unit="ms"
          onChange={setStepExecutionDelay}
        />
        <SliderControl
          label="Task Failure Chance"
          value={failureChance}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={setFailureChance}
        />
      </div>
    </div>
  );
};