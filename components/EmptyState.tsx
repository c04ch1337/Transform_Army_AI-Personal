import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-pink-300 p-8">
      <div className="text-5xl mb-4 opacity-70">{icon}</div>
      <h2 className="font-hacker text-xl text-pink-400 mb-2">{title}</h2>
      <p className="font-mono max-w-md text-sm">
        {message}
      </p>
    </div>
  );
};