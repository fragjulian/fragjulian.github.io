import { useState, useEffect, useRef } from 'react';
import { Linkedin, Mail } from 'lucide-react';
import FluidCursor from '@/components/FluidCursor';
import type { FluidColorMode } from '@/components/FluidCursor';
import ThemeToggle from '@/components/ThemeToggle';
import CustomCursor from '@/components/CustomCursor';
import FluidControls from '@/components/FluidControls';
import profilePhoto from '@/assets/profile-photo.jpeg';

const educationItems = [
  { year: '2020', title: 'Master of Science', institution: 'University Name' },
  { year: '2018', title: 'Bachelor of Science', institution: 'University Name' },
  { year: '2015', title: 'High School Diploma', institution: 'School Name' },
];

const Index = () => {
  const [fluidEnabled, setFluidEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const pageHeight = container.clientHeight;
      const newPage = Math.round(scrollTop / pageHeight);
      
      // Calculate scroll progress (0 to 1 within each page transition)
      const progress = (scrollTop % pageHeight) / pageHeight;
      setScrollProgress(progress);
      
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        setAnimationKey(prev => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Calculate opacity for each page based on scroll
  const getPageOpacity = (pageIndex: number) => {
    if (pageIndex === currentPage) {
      // Fade out as we scroll away
      const fadeOut = scrollProgress < 0.5 
        ? 1 
        : 1 - (scrollProgress - 0.5) * 2;
      return Math.max(0.3, fadeOut);
    }
    if (pageIndex === currentPage + 1) {
      // Fade in as we scroll towards
      const fadeIn = scrollProgress > 0.5 
        ? (scrollProgress - 0.5) * 2 
        : 0;
      return Math.max(0.3, fadeIn);
    }
    return 1;
  };

  const scrollToPage = (page: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: page * container.clientHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-background">
      <FluidCursor colorMode={fluidEnabled ? 'enabled' : 'disabled'} />
      <ThemeToggle />
      <CustomCursor />
      <FluidControls enabled={fluidEnabled} onToggle={() => setFluidEnabled(!fluidEnabled)} />
      
      {/* Page indicators */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 md:gap-3">
        {[0, 1].map((page) => (
          <button
            key={page}
            onClick={() => scrollToPage(page)}
            className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
              currentPage === page 
                ? 'bg-foreground scale-100' 
                : 'bg-foreground/30 scale-75 hover:bg-foreground/50'
            }`}
            aria-label={`Go to page ${page + 1}`}
          />
        ))}
      </div>

      {/* Snap scroll container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto snap-smooth scrollbar-hide"
      >
        {/* Page 1 - Hero */}
        <section 
          className="h-dvh flex items-center justify-center snap-start transition-opacity duration-300"
          style={{ opacity: getPageOpacity(0) }}
        >
          <main className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Profile Photo */}
            <div className="mb-8 animate-fade-in">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-foreground/30 overflow-hidden shadow-2xl backdrop-blur-sm">
                <img
                  src={profilePhoto}
                  alt="Julian Fragner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
                Hello! I'm
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
                Julian Fragner
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-md">
                A pragmatic software developer based in Austria
              </p>
              <p className="text-base md:text-lg text-muted-foreground">
                Frontend software engineer @{' '}
                <a 
                  href="https://www.dynatrace.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/90 font-medium hover:text-foreground transition-colors"
                >
                  Dynatrace
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-10 flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <a
                href="https://www.linkedin.com/in/julian-fragner/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              <span className="text-muted-foreground/50">/</span>
              <a
                href="mailto:julian.fragner@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Mail</span>
              </a>
            </div>
          </main>
        </section>

        {/* Page 2 - Education */}
        <section 
          className="h-dvh flex items-center justify-center snap-start transition-opacity duration-300"
          style={{ opacity: getPageOpacity(1) }}
        >
          <div className="relative z-10 flex flex-col items-center px-6">
            <h2 
              key={`title-${animationKey}`}
              className="text-3xl md:text-4xl font-bold text-foreground mb-16 animate-fade-in"
            >
              Education
            </h2>
            
            {/* Timeline - centered */}
            <div className="relative">
              <div className="flex flex-col gap-12">
                {educationItems.map((item, index) => (
                  <div 
                    key={`${index}-${animationKey}`}
                    className="relative flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    {/* Connecting line to next item */}
                    {index < educationItems.length - 1 && (
                      <div className="absolute top-10 left-1/2 h-[calc(100%+1.5rem)] w-px bg-gradient-to-b from-foreground/20 to-foreground/10 -translate-x-1/2 -z-10" />
                    )}
                    
                    {/* Year badge - liquid glass */}
                    <div className="relative z-10 mb-3 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 via-transparent to-foreground/5 rounded-full blur-sm" />
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-background/80 via-background/60 to-background/40 border border-foreground/15 px-5 py-2 rounded-full shadow-lg shadow-foreground/5 overflow-hidden">
                        {/* Inner glass reflection */}
                        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-transparent rounded-full" />
                        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                        <span className="relative text-sm font-medium text-foreground/90">
                          {item.year}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content - liquid glass */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-foreground/10 via-transparent to-foreground/5 rounded-2xl blur-md" />
                      <div className="relative text-center max-w-xs backdrop-blur-xl bg-gradient-to-br from-background/70 via-background/50 to-background/30 px-6 py-4 rounded-2xl border border-foreground/10 shadow-xl shadow-foreground/5 overflow-hidden">
                        {/* Glass highlight */}
                        <div className="absolute inset-0 bg-gradient-to-b from-foreground/8 via-transparent to-transparent rounded-2xl" />
                        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                        <h3 className="relative text-lg md:text-xl font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="relative text-muted-foreground text-sm mt-1">
                          {item.institution}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
