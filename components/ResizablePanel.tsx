import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode[];
  direction: 'vertical' | 'horizontal';
  initialSize?: number;
  minSize?: number;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  initialSize = 50,
  minSize = 10,
}) => {
  const [size, setSize] = useState(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    let newSize;

    if (direction === 'vertical') {
      const newHeight = e.clientY - bounds.top;
      newSize = (newHeight / bounds.height) * 100;
    } else {
      const newWidth = e.clientX - bounds.left;
      newSize = (newWidth / bounds.width) * 100;
    }

    // Enforce min/max size
    if (newSize < minSize) newSize = minSize;
    if (newSize > 100 - minSize) newSize = 100 - minSize;

    setSize(newSize);
  }, [direction, minSize]);

  const stopDrag = useCallback(() => {
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', stopDrag);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleDrag]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize';
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', stopDrag);
  }, [handleDrag, stopDrag, direction]);

  const isVertical = direction === 'vertical';
  const containerClasses = `flex h-full w-full ${isVertical ? 'flex-col' : 'flex-row'}`;
  const handleClasses = `flex-shrink-0 resize-handle ${isVertical ? 'resize-handle-vertical' : 'resize-handle-horizontal'}`;

  return (
    <div ref={containerRef} className={containerClasses}>
      <div style={{ [isVertical ? 'height' : 'width']: `${size}%` }} className="flex-shrink-0 min-h-0 min-w-0">
        {children[0]}
      </div>
      <div onMouseDown={startDrag} className={handleClasses}></div>
      <div className="flex-grow min-h-0 min-w-0">
        {children[1]}
      </div>
    </div>
  );
};
