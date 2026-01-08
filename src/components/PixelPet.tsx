import { useState, useEffect, useRef, useCallback } from 'react';
import idleSprite from '@/assets/Mushroom-Idle.png';
import runSprite from '@/assets/Mushroom-Run.png';
import stunSprite from '@/assets/Mushroom-Stun.png';

type PetState = 'idle' | 'running' | 'stunned';
type Section = 'hero' | 'education' | 'work' | 'space';

interface PixelPetProps {
  currentSection: Section;
  onAppear: () => void;
}

const STORAGE_KEY = 'pixel_pet_visitor';

// Sprite sheet configurations (all frames are 80x64 pixels)
const SPRITE_CONFIG = {
  idle: { src: idleSprite, frames: 7, frameWidth: 80, frameHeight: 64, fps: 8 },
  running: { src: runSprite, frames: 8, frameWidth: 80, frameHeight: 64, fps: 12 },
  stunned: { src: stunSprite, frames: 18, frameWidth: 80, frameHeight: 64, fps: 12, loop: false },
};

const DISPLAY_SCALE = 1.5;

const PixelPet = ({ currentSection, onAppear }: PixelPetProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [petState, setPetState] = useState<PetState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stunTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Sprite animation loop
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    const config = SPRITE_CONFIG[petState];
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        // For non-looping animations, stop at last frame
        if ('loop' in config && config.loop === false) {
          return prev < config.frames - 1 ? prev + 1 : prev;
        }
        return (prev + 1) % config.frames;
      });
    }, 1000 / config.fps);

    return () => clearInterval(interval);
  }, [isVisible, petState]);

  // Reset frame when state changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [petState]);

  // Initialize and check for returning visitor
  useEffect(() => {
    if (shouldDisable()) return;

    const hasVisited = localStorage.getItem(STORAGE_KEY);
    setIsReturning(!!hasVisited);
    
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
    if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
    
    if (petState !== 'stunned') {
      setPetState('idle');
    }

    idleTimerRef.current = setTimeout(() => {
      showMessage("zzz...", 2000);
    }, 15000);
  }, [petState, showMessage]);

  // Handle cursor movement - occasionally follow
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      
      // Occasionally follow cursor (run animation)
      if (Math.random() < 0.02 && petState === 'idle') {
        setPetState('running');
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
              setPetState('idle');
            }
          };
          animate();
        }
        
        setTimeout(() => setPetState('idle'), 1500);
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
      if (petState === 'idle') {
        setPetState('running');
        showMessage("Whoa!", 1500);
        setTimeout(() => setPetState('idle'), 1000);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isVisible, petState, resetIdleTimer, showMessage]);

  // Handle spam clicking - shows stunned animation
  const handleClick = () => {
    if (shouldDisable()) return;
    
    // If already stunned, extend the stun duration instead of resetting
    if (petState === 'stunned') {
      if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
      showMessage("STOP! 😵", 2500);
      stunTimerRef.current = setTimeout(() => setPetState('idle'), 2500);
      return;
    }
    
    resetIdleTimer();
    clickCountRef.current++;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 5) {
      setPetState('stunned');
      showMessage("Hey! Stop that! 😤", 2500);
      clickCountRef.current = 0;
      if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
      stunTimerRef.current = setTimeout(() => setPetState('idle'), 2500);
    } else if (clickCountRef.current === 1) {
      showMessage("Hi! ✨", 1500);
    }
  };

  // Handle hover - run animation
  const handleMouseEnter = () => {
    if (shouldDisable() || petState === 'stunned') return;
    resetIdleTimer();
    setPetState('running');
  };

  const handleMouseLeave = () => {
    if (shouldDisable()) return;
    if (petState === 'running') {
      setPetState('idle');
    }
  };

  // React to section changes
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;
    
    if (lastSectionRef.current !== currentSection) {
      lastSectionRef.current = currentSection;
      resetIdleTimer();

      const sectionReactions: Record<Section, string> = {
        hero: 'Nice to meet you!',
        education: '📚 Smart!',
        work: '💼 Impressive!',
        space: '✨ Wow...'
      };

      const message = sectionReactions[currentSection];
      if (message && petState !== 'stunned') {
        setPetState('running');
        showMessage(message, 2000);
        setTimeout(() => setPetState('idle'), 1500);
      }
    }
  }, [currentSection, isVisible, petState, resetIdleTimer, showMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
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

  const config = SPRITE_CONFIG[petState];

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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-2 animate-fade-in">
          <div className="relative bg-foreground text-background px-3 py-2 rounded-xl text-xs font-medium shadow-lg whitespace-nowrap">
            <span dangerouslySetInnerHTML={{ __html: message }} />
            <div className="absolute left-1/2 -translate-x-1/2 top-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Pet sprite */}
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-pointer group"
      >
        <div 
          className="overflow-hidden transition-transform group-hover:scale-110"
          style={{
            width: config.frameWidth * DISPLAY_SCALE,
            height: config.frameHeight * DISPLAY_SCALE,
            imageRendering: 'pixelated',
          }}
        >
          <div
            style={{
              backgroundImage: `url(${config.src})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `-${currentFrame * config.frameWidth * DISPLAY_SCALE}px 0`,
              backgroundSize: `${config.frameWidth * config.frames * DISPLAY_SCALE}px ${config.frameHeight * DISPLAY_SCALE}px`,
              width: config.frameWidth * DISPLAY_SCALE,
              height: config.frameHeight * DISPLAY_SCALE,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PixelPet;
