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
  const [fluidColorMode, setFluidColorMode] = useState<FluidColorMode>('rainbow');
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const pageHeight = container.clientHeight;
      const newPage = Math.round(scrollTop / pageHeight);
      setCurrentPage(newPage);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
      <FluidCursor colorMode={fluidColorMode} />
      <ThemeToggle />
      <CustomCursor />
      <FluidControls colorMode={fluidColorMode} onColorModeChange={setFluidColorMode} />
      
      {/* Page indicators */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1].map((page) => (
          <button
            key={page}
            onClick={() => scrollToPage(page)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
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
        className="h-full overflow-y-auto snap-y snap-mandatory"
      >
        {/* Page 1 - Hero */}
        <section className="h-dvh flex items-center justify-center snap-start">
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
        <section className="h-dvh flex items-center justify-center snap-start">
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16">Education</h2>
            
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20 -translate-x-1/2" />
              
              <div className="flex flex-col gap-12">
                {educationItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="relative flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Year badge */}
                    <div className="bg-foreground text-background px-4 py-1 rounded-full text-sm font-semibold mb-3 z-10">
                      {item.year}
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {item.institution}
                      </p>
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
