import React from 'react';

interface AvatarProps {
  avatar: string;
  name: string;
  className?: string;
  imageClassName?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ avatar, name, className, imageClassName }) => {
  const isImageDataUrl = avatar?.startsWith('data:image/');

  if (isImageDataUrl) {
    return (
      <img
        src={avatar}
        alt={`${name} avatar`}
        className={imageClassName || "w-8 h-8 rounded-full"}
      />
    );
  }

  return (
    <span className={className || "text-3xl"}>
      {avatar}
    </span>
  );
};
