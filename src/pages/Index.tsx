import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import AdminLogin from '@/components/AdminLogin';
import { useQuiz } from '@/contexts/QuizContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { teamName, setTeamName, startQuiz } = useQuiz();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleStartQuiz = async () => {
    if (!teamName.trim()) {
      toast({
        title: 'Team Name Required',
        description: 'Please enter your team name to start the quiz',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const success = await startQuiz();
    setIsLoading(false);

    if (success) {
      navigate('/quiz');
    } else {
      toast({
        title: 'Error',
        description: 'Team name already exists or quiz could not be started. Please try a different name.',
        variant: 'destructive',
      });
    }
  };

  const handleAdminSuccess = () => {
    setShowAdminLogin(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      
      <main className="pt-24 md:pt-32 pb-16 px-4 flex flex-col items-center justify-center min-h-screen">
        {/* Level Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl lg:text-6xl font-bold neon-text-white mb-2">
            LEVEL 1
          </h2>
          <h3 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold neon-text-cyan">
            CHOICE TECH
          </h3>
        </div>

        {/* Team Input Card */}
        <div className="card-glow rounded-2xl p-6 md:p-10 w-full max-w-md">
          <h4 className="font-orbitron text-xl md:text-2xl font-bold neon-text-white text-center mb-6">
            TEAM NAME
          </h4>
          
          <Input
            type="text"
            placeholder="Enter your team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="bg-secondary/50 border-neon-cyan/30 text-foreground font-rajdhani text-lg h-14 mb-6 focus:border-neon-cyan focus:ring-neon-cyan/30"
            maxLength={50}
          />

          <Button
            onClick={handleStartQuiz}
            disabled={isLoading || !teamName.trim()}
            className="w-full btn-glow-green py-4 font-orbitron text-xl rounded-xl disabled:opacity-50 animate-glow-pulse"
          >
            {isLoading ? 'STARTING...' : 'START QUIZ'}
          </Button>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 max-w-lg text-center">
          <div className="flex items-start justify-center gap-2 text-neon-yellow">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-rajdhani text-sm md:text-base">
              Once you start, the timer begins. Tab switching, refreshing, or attempting to go back will result in warnings and potential disqualification.
            </p>
          </div>
        </div>

        {/* Footer with Admin Link */}
        <footer className="fixed bottom-4 left-0 right-0 text-center">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="font-rajdhani text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Engineer's Eye
          </button>
        </footer>
      </main>

      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onSuccess={handleAdminSuccess}
        />
      )}
    </div>
  );
};

export default Index;
