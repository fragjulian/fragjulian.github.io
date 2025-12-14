import { Linkedin, Mail } from 'lucide-react';
import FluidCursor from '@/components/FluidCursor';

const Index = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a14]">
      <FluidCursor />
      
      <main className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Profile Photo */}
        <div className="mb-8 animate-fade-in">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl backdrop-blur-sm">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
              alt="John Doe"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-lg md:text-xl text-white/70 font-light tracking-wide">
            Hello! I'm
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            John Doe
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-md">
            A pragmatic software developer based in Austria
          </p>
          <p className="text-base md:text-lg text-white/60">
            Frontend software engineer @{' '}
            <span className="text-white/90 font-medium">Dynatrace</span>
          </p>
        </div>

        {/* Social Links */}
        <div className="mt-10 flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 group"
          >
            <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">LinkedIn</span>
          </a>
          <span className="text-white/30">/</span>
          <a
            href="mailto:john@example.com"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 group"
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
