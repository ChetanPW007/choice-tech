import { XCircle } from 'lucide-react';

const DisqualifiedScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center disqualified-bg">
      <div className="text-center p-8">
        <XCircle className="w-24 h-24 text-neon-red mx-auto mb-6 animate-pulse" />
        
        <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-neon-red mb-6"
            style={{
              textShadow: '0 0 10px hsl(0 100% 50% / 0.8), 0 0 20px hsl(0 100% 50% / 0.6), 0 0 40px hsl(0 100% 50% / 0.4)'
            }}>
          DISQUALIFIED
        </h1>
        
        <p className="font-rajdhani text-xl md:text-2xl text-foreground/80 max-w-lg mx-auto">
          You have been disqualified for violating quiz rules.
          <br /><br />
          Multiple instances of tab switching or suspicious activity were detected.
        </p>
        
        <div className="mt-8 p-4 border border-neon-red/30 rounded-lg bg-neon-red/5">
          <p className="font-rajdhani text-lg text-foreground/70">
            Please contact the Event Coordinator for further assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisqualifiedScreen;
