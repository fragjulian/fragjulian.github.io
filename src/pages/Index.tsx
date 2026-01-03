import { useState, useEffect, useRef } from 'react';
import { Linkedin, Mail } from 'lucide-react';
import FluidCursor from '@/components/FluidCursor';
import type { FluidColorMode } from '@/components/FluidCursor';
import ThemeToggle from '@/components/ThemeToggle';
import CustomCursor from '@/components/CustomCursor';
import FluidControls from '@/components/FluidControls';
import LiquidGlass from '@/components/LiquidGlass';
import profilePhoto from '@/assets/profile-photo.jpeg';
import rocket from '@/assets/rocket.png';

const educationItems = [
  { year: '2024', title: 'Master Informatics', institution: 'University of Klagenfurt' },
  { year: '2022', title: 'Bachelor Software Engineering', institution: ['University of Applied Sciences', 'Upper Austria'] },
  { year: '2019', title: 'Technical College', institution: ['for Informatics', 'Linzer Technikum'] },
];

const workExperienceItems = [
  { year: 'since 2019', title: 'Software Engineer', institution: 'Dynatrace' },
  { year: '2022-2024', title: 'Tutor', institution: ['Semistructured Data Models &', 'Advanced Software Engineering'] },
  { year: '2016-2019', title: 'Various Internships', institution: '' },
];

const Index = () => {
  const [fluidEnabled, setFluidEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const pageHeight = container.clientHeight;
      const newPage = Math.round(scrollTop / pageHeight);
      
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        setAnimationKey(prev => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

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
      {currentPage !== 3 && <ThemeToggle />}
      <CustomCursor />
      <FluidControls enabled={fluidEnabled} onToggle={() => setFluidEnabled(!fluidEnabled)} />
      
      {/* Page indicators */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 md:gap-3">
        {[0, 1, 2, 3].map((page) => (
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
          className="h-dvh flex items-center justify-center snap-start"
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
          className="h-dvh flex items-center justify-center snap-start py-8 md:py-0"
        >
          <div className="relative z-10 flex flex-col items-center px-4 md:px-6 max-h-full overflow-visible">
            <h2 
              key={`title-edu-${animationKey}`}
              className="text-2xl md:text-4xl font-bold text-foreground mb-6 md:mb-12 animate-fade-in shrink-0"
            >
              Education
            </h2>
            
            {/* Timeline - centered */}
            <div className="relative">
              <div className="flex flex-col gap-0">
                {educationItems.map((item, index) => (
                  <div 
                    key={`edu-${index}-${animationKey}`}
                    className="relative flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    {/* Year badge - liquid glass */}
                    <div className="relative z-10">
                      <LiquidGlass rounded="full" className="shadow-md">
                        <div className="px-4 py-1.5 md:px-5 md:py-2">
                          <span className="text-xs md:text-sm font-medium text-foreground/90">
                            {item.year}
                          </span>
                        </div>
                      </LiquidGlass>
                    </div>
                    
                    {/* Connecting line segment - between year and content box */}
                    <div className="w-px h-3 md:h-4 bg-foreground/20" />
                    
                    {/* Content - liquid glass */}
                    <div className="relative z-10">
                      <LiquidGlass rounded="lg" className="shadow-lg w-64 md:w-72">
                        <div className="text-center px-4 py-3 md:px-6 md:py-4">
                          <h3 className="text-base md:text-lg font-semibold text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            {Array.isArray(item.institution) ? (
                              <>
                                {item.institution[0]}
                                <br />
                                {item.institution[1]}
                              </>
                            ) : (
                              item.institution
                            )}
                          </p>
                        </div>
                      </LiquidGlass>
                    </div>
                    
                    {/* Connecting line to next item */}
                    {index < educationItems.length - 1 && (
                      <div className="w-px h-4 md:h-6 bg-foreground/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Page 3 - Work Experience */}
        <section 
          className="h-dvh flex items-center justify-center snap-start py-8 md:py-0"
        >
          <div className="relative z-10 flex flex-col items-center px-4 md:px-6 max-h-full overflow-visible">
            <h2 
              key={`title-work-${animationKey}`}
              className="text-2xl md:text-4xl font-bold text-foreground mb-6 md:mb-12 animate-fade-in shrink-0"
            >
              Work Experience
            </h2>
            
            {/* Timeline - centered */}
            <div className="relative">
              <div className="flex flex-col gap-0">
                {workExperienceItems.map((item, index) => (
                  <div 
                    key={`work-${index}-${animationKey}`}
                    className="relative flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    {/* Year badge - liquid glass */}
                    <div className="relative z-10">
                      <LiquidGlass rounded="full" className="shadow-md">
                        <div className="px-4 py-1.5 md:px-5 md:py-2">
                          <span className="text-xs md:text-sm font-medium text-foreground/90">
                            {item.year}
                          </span>
                        </div>
                      </LiquidGlass>
                    </div>
                    
                    {/* Connecting line segment - between year and content box */}
                    <div className="w-px h-3 md:h-4 bg-foreground/20" />
                    
                    {/* Content - liquid glass */}
                    <div className="relative z-10">
                      <LiquidGlass rounded="lg" className="shadow-lg w-64 md:w-72">
                        <div className="text-center px-4 py-3 md:px-6 md:py-4">
                          <h3 className="text-base md:text-lg font-semibold text-foreground">
                            {item.title}
                          </h3>
                          {item.institution && (
                            <p className="text-muted-foreground text-xs md:text-sm mt-1">
                              {Array.isArray(item.institution) ? (
                                <>
                                  {item.institution[0]}
                                  <br />
                                  {item.institution[1]}
                                </>
                              ) : (
                                item.institution
                              )}
                            </p>
                          )}
                        </div>
                      </LiquidGlass>
                    </div>
                    
                    {/* Connecting line to next item */}
                    {index < workExperienceItems.length - 1 && (
                      <div className="w-px h-4 md:h-6 bg-foreground/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Page 4 - Space Canvas */}
        <section 
          className="h-dvh flex flex-col snap-start relative overflow-hidden space-stars bg-[hsl(222.2,84%,4.9%)]"
        >
          {/* Quote in top left */}
          <div className="absolute top-8 left-8 md:top-16 md:left-16 z-20 max-w-xs md:max-w-sm">
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.3em] font-space leading-relaxed">
              Stay curious.<br />Never stop learning.
            </p>
          </div>
          
          {/* Rocket in center - rotated upward with floating animation */}
          <div className="flex-1 relative z-10 flex items-center justify-center">
            <img
              key={`rocket-${animationKey}`}
              src={rocket}
              alt="Rocket"
              className="h-16 md:h-24 rocket-animate"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
