import React, { useState, useRef, useEffect } from 'react';
import { playTabSwitchSound } from '../utils/audio';

interface Tab {
  label: string;
  component: React.ReactNode;
}

interface TabbedPanelProps {
  tabs: Tab[];
}

// Generate a simple, component-instance-specific prefix for IDs
const idPrefix = `tabpanel-${Math.random().toString(36).substr(2, 9)}`;

export const TabbedPanel: React.FC<TabbedPanelProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  const handleTabClick = (index: number) => {
    if (activeTab !== index) {
      playTabSwitchSound();
      setActiveTab(index);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = activeTab;
    let shouldPreventDefault = false;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = (activeTab + 1) % tabs.length;
        shouldPreventDefault = true;
        break;
      case 'ArrowLeft':
        newIndex = (activeTab - 1 + tabs.length) % tabs.length;
        shouldPreventDefault = true;
        break;
      case 'Home':
        newIndex = 0;
        shouldPreventDefault = true;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        shouldPreventDefault = true;
        break;
    }

    if (shouldPreventDefault) {
        event.preventDefault();
        playTabSwitchSound();
        setActiveTab(newIndex);
        tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
      <div
        role="tablist"
        aria-label="Mission Control Panels"
        className="flex border-b border-pink-500/30 px-2 bg-sparkle rounded-t-lg"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, index) => {
          const tabId = `${idPrefix}-tab-${index}`;
          const panelId = `${idPrefix}-panel-${index}`;
          return (
            <button
              key={tab.label}
              id={tabId}
              ref={el => tabRefs.current[index] = el}
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={panelId}
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => handleTabClick(index)}
              className={`tab-button ${
                activeTab === index
                  ? 'tab-button-active'
                  : 'tab-button-inactive'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-grow min-h-0">
        {tabs.map((tab, index) => {
           const tabId = `${idPrefix}-tab-${index}`;
           const panelId = `${idPrefix}-panel-${index}`;
          return (
            <div
              key={tab.label}
              id={panelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={tabId}
              className={`h-full ${activeTab === index ? 'block' : 'hidden'}`}
            >
              {tab.component}
            </div>
          );
        })}
      </div>
    </div>
  );
};
