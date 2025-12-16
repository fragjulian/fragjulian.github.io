import { useState } from 'react';
import { Palette, Rainbow, Circle, CircleOff, X } from 'lucide-react';

export type FluidColorMode = 'rainbow' | 'monochrome' | 'disabled';

interface FluidControlsProps {
  colorMode: FluidColorMode;
  onColorModeChange: (mode: FluidColorMode) => void;
}

const FluidControls = ({ colorMode, onColorModeChange }: FluidControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonClass = "p-3 rounded-full bg-secondary/80 backdrop-blur-sm border border-border hover:bg-secondary transition-all duration-300";

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-2">
      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="Fluid animation controls"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Palette className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Control buttons - opens to the right */}
      {isOpen && (
        <div className="flex gap-2 animate-fade-in">
          <button
            onClick={() => onColorModeChange('rainbow')}
            className={`${buttonClass} ${colorMode === 'rainbow' ? 'ring-2 ring-foreground/50' : ''}`}
            aria-label="Rainbow colors"
            title="Rainbow"
          >
            <Rainbow className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={() => onColorModeChange('monochrome')}
            className={`${buttonClass} ${colorMode === 'monochrome' ? 'ring-2 ring-foreground/50' : ''}`}
            aria-label="Monochrome colors"
            title="Monochrome"
          >
            <Circle className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={() => onColorModeChange('disabled')}
            className={`${buttonClass} ${colorMode === 'disabled' ? 'ring-2 ring-foreground/50' : ''}`}
            aria-label="Disable fluid animation"
            title="Disabled"
          >
            <CircleOff className="w-5 h-5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FluidControls;
