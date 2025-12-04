import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WarningModalProps {
  warningCount: number;
  onClose: () => void;
}

const WarningModal = ({ warningCount, onClose }: WarningModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center warning-overlay">
      <div className="warning-box rounded-xl p-8 max-w-md mx-4 animate-shake">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-neon-yellow mb-4 animate-pulse" />
          
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold neon-text-yellow mb-4">
            WARNING {warningCount}/3
          </h2>
          
          <p className="font-rajdhani text-lg text-foreground/90 mb-6">
            Tab switching, minimizing, or any suspicious activity has been detected!
            <br /><br />
            <span className="text-neon-yellow font-semibold">
              {4 - warningCount} more violation{4 - warningCount !== 1 ? 's' : ''} will result in immediate disqualification.
            </span>
          </p>

          <Button 
            onClick={onClose}
            className="btn-glow-green px-8 py-3 font-orbitron text-lg rounded-lg"
          >
            I UNDERSTAND
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
