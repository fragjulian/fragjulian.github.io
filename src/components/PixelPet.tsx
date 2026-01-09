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
  const [facingRight, setFacingRight] = useState(false);
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

  // Reset frame when state changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [petState]);

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

    idleTimerRef.current = setTimeout(() => {
      if (petState !== 'stunned') {
        showMessage("zzz...", 2000);
      }
    }, 15000);
  }, [petState, showMessage]);

  // Keep position in ref for animation loop
  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Handle cursor movement - occasionally follow when cursor is nearby
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    // Viewport bounds
    const maxX = 20;
    const minX = -(window.innerWidth - 180);
    const maxY = 20;
    const minY = -(window.innerHeight - 180);

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      
      // Calculate distance from pet to cursor
      const currentPos = positionRef.current;
      const petScreenX = window.innerWidth - 60 + currentPos.x;
      const petScreenY = window.innerHeight - 60 + currentPos.y;
      const distanceToCursor = Math.sqrt(
        Math.pow(e.clientX - petScreenX, 2) + Math.pow(e.clientY - petScreenY, 2)
      );
      
      const followRange = 300; // Only follow if cursor is within this range
      const boredChance = 0.3; // 30% chance to get bored and not follow
      
      // Occasionally follow cursor - only if in range and not bored
      if (Math.random() < 0.02 && petState === 'idle' && distanceToCursor < followRange) {
        // Check if bored
        if (Math.random() < boredChance) {
          if (Math.random() < 0.15) {
            showMessage("Hmm... 🥱", 1500);
          }
          return;
        }
        
        // Calculate target position (move toward cursor)
        const targetX = Math.max(minX, Math.min(maxX, (e.clientX - window.innerWidth + 80) * 0.5));
        const targetY = Math.max(minY, Math.min(maxY, (e.clientY - window.innerHeight + 80) * 0.5));
        
        // Set facing direction based on movement direction
        setFacingRight(targetX > currentPos.x);
        setPetState('running');
        targetPositionRef.current = { x: targetX, y: targetY };
        
        if (!animationFrameRef.current) {
          const animate = () => {
            const current = positionRef.current;
            const target = targetPositionRef.current;
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
              const newX = current.x + dx * 0.05;
              const newY = current.y + dy * 0.05;
              setPosition({
                x: Math.max(minX, Math.min(maxX, newX)),
                y: Math.max(minY, Math.min(maxY, newY))
              });
              animationFrameRef.current = requestAnimationFrame(animate);
            } else {
              animationFrameRef.current = null;
              setPetState('idle');
            }
          };
          animate();
        }
        
        // Fallback to idle after timeout
        setTimeout(() => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setPetState('idle');
        }, 2500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible, petState, resetIdleTimer, showMessage]);

  // Handle scrolling
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;

    const handleScroll = () => {
      resetIdleTimer();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isVisible, resetIdleTimer]);

  // Handle spam clicking - shows stunned animation
  const handleClick = () => {
    if (shouldDisable()) return;
    
    // Ignore clicks while stunned
    if (petState === 'stunned') return;
    
    resetIdleTimer();
    clickCountRef.current++;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 5) {
      setPetState('stunned');
      showMessage("Hey! Stop that! 😤", 1500);
      clickCountRef.current = 0;
      if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
      stunTimerRef.current = setTimeout(() => {
        setPetState('idle');
      }, 1500);
    } else if (clickCountRef.current === 1) {
      showMessage("Hi! ✨", 1500);
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-6 animate-fade-in">
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
        className="relative cursor-pointer group"
      >
        <div 
          className="overflow-hidden transition-transform group-hover:scale-110"
          style={{
            width: config.frameWidth * DISPLAY_SCALE,
            height: config.frameHeight * DISPLAY_SCALE,
            imageRendering: 'pixelated',
            transform: facingRight ? 'scaleX(-1)' : 'scaleX(1)',
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
