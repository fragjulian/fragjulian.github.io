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
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse items-start gap-2">
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

      {/* Control buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <button
            onClick={() => {
              onColorModeChange('rainbow');
              setIsOpen(false);
            }}
            className={`${buttonClass} ${colorMode === 'rainbow' ? 'ring-2 ring-foreground/50' : ''}`}
            aria-label="Rainbow colors"
            title="Rainbow"
          >
            <Rainbow className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={() => {
              onColorModeChange('monochrome');
              setIsOpen(false);
            }}
            className={`${buttonClass} ${colorMode === 'monochrome' ? 'ring-2 ring-foreground/50' : ''}`}
            aria-label="Monochrome colors"
            title="Monochrome"
          >
            <Circle className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={() => {
              onColorModeChange('disabled');
              setIsOpen(false);
            }}
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
