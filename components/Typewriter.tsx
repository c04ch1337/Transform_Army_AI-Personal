import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 40, className }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(''); // Reset on text change
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return <span className={className}>{displayText}</span>;
};