import React, { useState } from 'react';
import { playTabSwitchSound } from '../utils/audio';

interface Tab {
  label: string;
  component: React.ReactNode;
}

interface TabbedPanelProps {
  tabs: Tab[];
}

export const TabbedPanel: React.FC<TabbedPanelProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    if (activeTab !== index) {
      playTabSwitchSound();
      setActiveTab(index);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
      <div className="flex border-b border-pink-500/30 px-2 bg-sparkle rounded-t-lg">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`tab-button ${
              activeTab === index
                ? 'tab-button-active'
                : 'tab-button-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-grow min-h-0">
        {tabs.map((tab, index) => (
          <div key={index} className={`h-full ${activeTab === index ? 'block' : 'hidden'}`}>
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
};