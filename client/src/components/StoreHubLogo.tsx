import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface StoreHubLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, string> = {
  sm: 'w-10 h-10',   // 40px — Mobile / navbar
  md: 'w-11 h-11',   // 44px — Desktop navbar / sidebar
  lg: 'w-14 h-14',   // 56px — Login / Register
};

export const StoreHubLogo: React.FC<StoreHubLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <img
      src="/favicon.png"
      alt="StoreHub"
      className={`${sizeMap[size]} rounded-xl object-contain aspect-square transition-transform duration-200 hover:scale-[1.03] ${className}`}
      draggable={false}
    />
  );
};
