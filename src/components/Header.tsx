import gmuLogo from '@/assets/gmu_logo.ico';
import saLogo from '@/assets/sa_logo.png';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center">
          <img 
            src={gmuLogo} 
            alt="GMU Logo" 
            className="h-12 w-auto md:h-16 object-contain"
          />
        </div>

        {/* Center Title */}
        <div className="flex flex-col items-center">
          <h1 className="font-orbitron text-2xl md:text-4xl font-bold neon-text-cyan tracking-wider">
            IGNITRON 2K25
          </h1>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent mt-1" />
        </div>

        {/* Right Logo */}
        <div className="flex items-center">
          <img 
            src={saLogo} 
            alt="Student Affairs Logo" 
            className="h-12 w-auto md:h-16 object-contain"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
