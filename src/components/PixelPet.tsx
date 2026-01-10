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

  // Show message with auto-hide
  const showMessage = useCallback((msg: string, duration = 3500) => {
    setMessage(msg);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  // Initialize on any page
  useEffect(() => {
    if (shouldDisable()) return;
    if (isVisible) return; // Already visible

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
  }, [onAppear, isVisible, showMessage]);

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

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      
      // Pet is fixed at bottom-right: bottom-4 right-4 = 16px from edges
      // Pet size is roughly 120x96 (80*1.5 x 64*1.5)
      const petWidth = 120;
      const petHeight = 96;
      const baseRight = 16;
      const baseBottom = 16;
      
      // Calculate pet's current screen position
      const currentPos = positionRef.current;
      const petScreenX = window.innerWidth - baseRight - petWidth / 2 + currentPos.x;
      const petScreenY = window.innerHeight - baseBottom - petHeight / 2 + currentPos.y;
      
      // Follow cursor always, but occasionally lose interest
      if (Math.random() < 0.06 && petState === 'idle') {
        // Small chance to get bored and stop
        if (Math.random() < 0.12) {
          if (Math.random() < 0.4) {
            showMessage("Hmm... 🥱", 1500);
          }
          return;
        }
        
        // Helper to get current bounds (recalculated each frame for accuracy)
        const getBounds = () => {
          const padding = 20;
          // Pet's default position is at bottom-right corner
          // To reach left edge: need to move left by (defaultX - padding - petWidth/2)
          // To reach top edge: need to move up by (defaultY - padding - petHeight/2)
          const minX = padding + petWidth / 2 - (window.innerWidth - baseRight - petWidth / 2);
          const maxX = 0;
          const minY = padding + petHeight / 2 - (window.innerHeight - baseBottom - petHeight / 2);
          const maxY = 0;
          return { minX, maxX, minY, maxY };
        };
        
        const bounds = getBounds();
        
        // Target: follow cursor directly (stop 40px before it)
        const defaultPetX = window.innerWidth - baseRight - petWidth / 2;
        const defaultPetY = window.innerHeight - baseBottom - petHeight / 2;
        
        // Calculate target position relative to pet's default position
        const targetX = e.clientX - defaultPetX - 40; // offset so pet doesn't overlap cursor
        const targetY = e.clientY - defaultPetY - 40;
        
        // Clamp to bounds
        const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));
        const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, targetY));
        
        setFacingRight(e.clientX > petScreenX);
        setPetState('running');
        targetPositionRef.current = { x: clampedX, y: clampedY };
        
        if (!animationFrameRef.current) {
          const animate = () => {
            const current = positionRef.current;
            const target = targetPositionRef.current;
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Recalculate bounds each frame
            const currentBounds = getBounds();
            
            if (distance > 2) {
              // Constant speed movement (pixels per frame)
              const speed = 1.5;
              const newX = current.x + (dx / distance) * speed;
              const newY = current.y + (dy / distance) * speed;
              setPosition({
                x: Math.max(currentBounds.minX, Math.min(currentBounds.maxX, newX)),
                y: Math.max(currentBounds.minY, Math.min(currentBounds.maxY, newY))
              });
              animationFrameRef.current = requestAnimationFrame(animate);
            } else {
              setPosition(target);
              animationFrameRef.current = null;
              setPetState('idle');
            }
          };
          animate();
        }
        
        setTimeout(() => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setPetState('idle');
        }, 4000);
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


  // React to section changes - just show message, no running animation
  // Track if we've visited hero before to avoid repeating "Nice to meet you"
  const visitedSectionsRef = useRef<Set<Section>>(new Set());
  
  useEffect(() => {
    if (!isVisible || shouldDisable()) return;
    
    if (lastSectionRef.current !== currentSection) {
      lastSectionRef.current = currentSection;
      resetIdleTimer();

      // Only show message if we haven't visited this section before
      if (!visitedSectionsRef.current.has(currentSection)) {
        visitedSectionsRef.current.add(currentSection);
        
        const sectionReactions: Record<Section, string> = {
          hero: 'Nice to meet you!',
          education: '📚 Smart!',
          work: '💼 Impressive!',
          space: '✨ Wow...'
        };

        const message = sectionReactions[currentSection];
        if (message && petState !== 'stunned') {
          showMessage(message, 2000);
        }
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
        transform: `translate(${position.x}px, ${position.y}px)`
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
