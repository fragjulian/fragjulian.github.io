import { Linkedin, Mail } from 'lucide-react';
import FluidCursor from '@/components/FluidCursor';
import ThemeToggle from '@/components/ThemeToggle';
import CustomCursor from '@/components/CustomCursor';
import profilePhoto from '@/assets/profile-photo.jpeg';

const Index = () => {
  return (
    <div className="relative h-dvh flex items-center justify-center overflow-hidden bg-background">
      <FluidCursor />
      <ThemeToggle />
      <CustomCursor />
      
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
    </div>
  );
};

export default Index;
