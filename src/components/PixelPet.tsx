import { useState, useEffect, useRef, useCallback } from 'react';

type PetState = 'idle' | 'happy' | 'waving' | 'bored' | 'sleeping' | 'angry' | 'curious' | 'working' | 'stargazing';
type Section = 'hero' | 'education' | 'work' | 'space';

interface PixelPetProps {
  currentSection: Section;
  onAppear: () => void;
}

const STORAGE_KEY = 'pixel_pet_visitor';

const PixelPet = ({ currentSection, onAppear }: PixelPetProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [petState, setPetState] = useState<PetState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isReturning, setIsReturning] = useState(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const boredTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSectionRef = useRef<Section>(currentSection);
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Check if should be disabled
  const shouldDisable = () => {
    if (typeof window === 'undefined') return true;
    if (window.innerWidth < 768) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return false;
  };

  // Initialize and check for returning visitor
  useEffect(() => {
    if (shouldDisable()) return;

    const hasVisited = localStorage.getItem(STORAGE_KEY);
    setIsReturning(!!hasVisited);
    
    // Small delay before appearing
    const timer = setTimeout(() => {
      setIsVisible(true);
      onAppear();
      
      if (hasVisited) {
        showMessage("Oh, you're back! 👋");
      } else {
        showMessage("Oh. You're <em>that</em> kind of user.");
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [onAppear]);

  // Show message with auto-hide
  const showMessage = useCallback((msg: string, duration = 3500) => {
    setMessage(msg);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
    
    if (petState === 'sleeping' || petState === 'bored') {
      setPetState('idle');
    }

    idleTimerRef.current = setTimeout(() => {
      setPetState('bored');
      showMessage("*yawn*", 2000);
      
      boredTimerRef.current = setTimeout(() => {
        setPetState('sleeping');
        showMessage("zzz...", 2000);
      }, 5000);
    }, 15000);
  }, [petState, showMessage]);

  // Handle cursor movement - occasionally follow
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      
      // Only occasionally follow cursor (10% chance per significant movement)
      if (Math.random() < 0.02 && petState !== 'sleeping') {
        const targetX = Math.min(50, Math.max(-50, (e.clientX - window.innerWidth + 100) * 0.05));
        const targetY = Math.min(20, Math.max(-20, (e.clientY - window.innerHeight + 100) * 0.05));
        targetPositionRef.current = { x: targetX, y: targetY };
        
        if (!animationFrameRef.current) {
          const animate = () => {
            setPosition(prev => ({
              x: prev.x + (targetPositionRef.current.x - prev.x) * 0.1,
              y: prev.y + (targetPositionRef.current.y - prev.y) * 0.1
            }));
            
            if (Math.abs(targetPositionRef.current.x - position.x) > 0.1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            } else {
              animationFrameRef.current = null;
            }
          };
          animate();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible, petState, resetIdleTimer, position]);

  // Handle scrolling
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    const handleScroll = () => {
      resetIdleTimer();
      if (petState === 'sleeping') {
        setPetState('curious');
        showMessage("Hmm?", 1500);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isVisible, petState, resetIdleTimer, showMessage]);

  // Handle spam clicking
  const handleClick = () => {
    if (shouldDisable()) return;
    
    resetIdleTimer();
    clickCountRef.current++;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 5) {
      setPetState('angry');
      showMessage("Hey! Stop that! 😤", 2500);
      clickCountRef.current = 0;
      setTimeout(() => setPetState('idle'), 2500);
    } else if (clickCountRef.current === 1) {
      setPetState('happy');
      showMessage("Hi! ✨", 1500);
      setTimeout(() => setPetState('idle'), 1500);
    }
  };

  // Handle hover
  const handleMouseEnter = () => {
    if (shouldDisable() || petState === 'angry') return;
    resetIdleTimer();
    setPetState('waving');
  };

  const handleMouseLeave = () => {
    if (shouldDisable()) return;
    if (petState === 'waving') {
      setPetState('idle');
    }
  };

  // React to section changes
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;
    
    if (lastSectionRef.current !== currentSection) {
      lastSectionRef.current = currentSection;
      resetIdleTimer();

      const sectionReactions: Record<Section, { state: PetState; message: string }> = {
        hero: { state: 'happy', message: 'Nice to meet you!' },
        education: { state: 'curious', message: '📚 Smart!' },
        work: { state: 'working', message: '💼 Impressive!' },
        space: { state: 'stargazing', message: '✨ Wow...' }
      };

      const reaction = sectionReactions[currentSection];
      if (reaction && petState !== 'sleeping' && petState !== 'angry') {
        setPetState(reaction.state);
        showMessage(reaction.message, 2000);
        setTimeout(() => setPetState('idle'), 2500);
      }
    }
  }, [currentSection, isVisible, petState, resetIdleTimer, showMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Start idle timer on mount
  useEffect(() => {
    if (isVisible) {
      resetIdleTimer();
    }
  }, [isVisible, resetIdleTimer]);

  if (!isVisible || shouldDisable()) return null;

  // Pixel art representations for each state
  const getPetFace = () => {
    switch (petState) {
      case 'happy':
        return { eyes: '^', mouth: 'w' };
      case 'waving':
        return { eyes: '◕', mouth: '◡', arm: '/' };
      case 'bored':
        return { eyes: '−', mouth: '~' };
      case 'sleeping':
        return { eyes: '−', mouth: '○', zzz: true };
      case 'angry':
        return { eyes: '>', mouth: '<' };
      case 'curious':
        return { eyes: '●', mouth: 'o' };
      case 'working':
        return { eyes: '◉', mouth: '‿' };
      case 'stargazing':
        return { eyes: '★', mouth: '○' };
      default:
        return { eyes: '•', mouth: '‿' };
    }
  };

  const face = getPetFace();

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {/* Speech bubble */}
      {message && (
        <div className="absolute bottom-full right-0 mb-2 animate-fade-in">
          <div className="relative bg-foreground text-background px-3 py-2 rounded-xl text-xs font-medium shadow-lg whitespace-nowrap">
            <span dangerouslySetInnerHTML={{ __html: message }} />
            <div className="absolute right-4 top-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Pet body */}
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-pointer group"
      >
        {/* Main body - pixel art style */}
        <div className="relative w-12 h-12 bg-foreground/10 backdrop-blur-sm rounded-lg border border-foreground/20 flex items-center justify-center transition-transform group-hover:scale-110">
          {/* Face */}
          <div className="text-foreground font-mono text-center leading-none select-none">
            <div className="text-[10px] tracking-widest">
              {face.eyes}{face.eyes}
            </div>
            <div className="text-[10px] mt-0.5">
              {face.mouth}
            </div>
          </div>

          {/* Waving arm */}
          {face.arm && (
            <div className="absolute -right-1 top-1 text-foreground text-xs animate-bounce">
              {face.arm}
            </div>
          )}

          {/* Sleeping Zzz */}
          {face.zzz && (
            <div className="absolute -top-2 -right-2 text-foreground/60 text-[8px] animate-pulse">
              z<span className="text-[10px]">z</span><span className="text-xs">z</span>
            </div>
          )}

          {/* Blush for happy/waving states */}
          {(petState === 'happy' || petState === 'waving') && (
            <>
              <div className="absolute left-1 top-1/2 w-1.5 h-1 bg-pink-400/40 rounded-full" />
              <div className="absolute right-1 top-1/2 w-1.5 h-1 bg-pink-400/40 rounded-full" />
            </>
          )}

          {/* Anger marks */}
          {petState === 'angry' && (
            <div className="absolute -top-1 right-0 text-red-400 text-[8px]">💢</div>
          )}

          {/* Stars for stargazing */}
          {petState === 'stargazing' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] animate-pulse">
              ✦
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelPet;
