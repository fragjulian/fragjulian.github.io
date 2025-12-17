import { Droplets, DropletsIcon } from 'lucide-react';

interface FluidControlsProps {
  enabled: boolean;
  onToggle: () => void;
}

const FluidControls = ({ enabled, onToggle }: FluidControlsProps) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-secondary/80 backdrop-blur-sm border border-border hover:bg-secondary transition-all duration-300"
      aria-label={enabled ? "Disable fluid animation" : "Enable fluid animation"}
    >
      {enabled ? (
        <Droplets className="w-5 h-5 text-foreground" />
      ) : (
        <DropletsIcon className="w-5 h-5 text-foreground/50" />
      )}
    </button>
  );
};

export default FluidControls;
