import { ReactNode } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const LiquidGlass = ({ children, className = '', rounded = 'lg' }: LiquidGlassProps) => {
  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div className={`relative ${roundedClasses[rounded]} overflow-hidden ${className}`}>
      {/* SVG Filter Definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="lg-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015" 
              numOctaves="3" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="8" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Layer 1: Distortion filter */}
      <div 
        className="absolute inset-0 z-0 isolate"
        style={{
          backdropFilter: 'blur(0px)',
          filter: 'url(#lg-distortion)',
        }}
      />

      {/* Layer 2: Glass tint */}
      <div className="absolute inset-0 z-[1] bg-background/30 dark:bg-background/40" />

      {/* Layer 3: Specular highlight (shine) */}
      <div 
        className={`absolute inset-0 z-[2] ${roundedClasses[rounded]} overflow-hidden`}
        style={{
          boxShadow: `
            inset 1px 1px 0 rgba(255, 255, 255, 0.5),
            inset -1px -1px 0 rgba(255, 255, 255, 0.15),
            inset 0 0 8px rgba(255, 255, 255, 0.25)
          `,
        }}
      />

      {/* Layer 4: Content */}
      <div className="relative z-[3]">
        {children}
      </div>
    </div>
  );
};

export default LiquidGlass;
