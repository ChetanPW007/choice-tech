import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProgressCircle from '@/components/ProgressCircle';
import { useQuiz } from '@/contexts/QuizContext';
import { Trophy, XCircle } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const { teamName, score, questions, isCompleted, totalTimeSeconds } = useQuiz();

  useEffect(() => {
    if (!isCompleted) {
      navigate('/');
    }
  }, [isCompleted, navigate]);

  const totalQuestions = questions.length || 20;
  const correctAnswers = score;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = (correctAnswers / totalQuestions) * 100;
  const isPassing = correctAnswers > 12;

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      
      <main className="pt-24 md:pt-32 pb-16 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="card-glow rounded-2xl p-6 md:p-10 w-full max-w-lg text-center">
          {/* Result Icon */}
          {isPassing ? (
            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-neon-green mx-auto mb-4 animate-pulse" />
          ) : (
            <XCircle className="w-16 h-16 md:w-20 md:h-20 text-neon-yellow mx-auto mb-4" />
          )}

          {/* Result Title */}
          <h1 
            className={`font-orbitron text-2xl md:text-4xl font-bold mb-4 ${
              isPassing ? 'neon-text-green' : 'neon-text-yellow'
            }`}
          >
            {isPassing ? 'CONGRATULATIONS!' : 'BETTER LUCK NEXT TIME!'}
          </h1>

          {/* Team Name (only for passing) */}
          {isPassing && (
            <div className="mb-6">
              <h2 className="font-orbitron text-xl md:text-3xl neon-text-cyan">
                {teamName}
              </h2>
            </div>
          )}

          {/* Progress Circle */}
          <div className="flex justify-center mb-6">
            <ProgressCircle percentage={percentage} isPassing={isPassing} />
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neon-green/10 rounded-lg p-4 border border-neon-green/30">
              <p className="font-rajdhani text-sm text-muted-foreground mb-1">Correct Answers</p>
              <p className="font-orbitron text-2xl md:text-3xl text-neon-green">{correctAnswers}</p>
            </div>
            <div className="bg-neon-red/10 rounded-lg p-4 border border-neon-red/30">
              <p className="font-rajdhani text-sm text-muted-foreground mb-1">Wrong Answers</p>
              <p className="font-orbitron text-2xl md:text-3xl text-neon-red">{wrongAnswers}</p>
            </div>
          </div>

          {/* Time Taken */}
          <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border/30">
            <p className="font-rajdhani text-sm text-muted-foreground mb-1">Time Taken</p>
            <p className="font-orbitron text-xl md:text-2xl neon-text-cyan">
              {formatTime(totalTimeSeconds)}
            </p>
          </div>

          {/* Message */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
            {isPassing ? (
              <p className="font-rajdhani text-base md:text-lg text-foreground/90">
                🎉 Congratulations! You have passed the quiz.
                <br />
                <span className="text-neon-green font-semibold">
                  Show this score page to the Event Coordinator.
                </span>
              </p>
            ) : (
              <p className="font-rajdhani text-base md:text-lg text-foreground/90">
                Don't be discouraged! Every attempt is a learning opportunity.
                <br /><br />
                Your journey in tech is just beginning. Keep exploring, keep learning, and remember that even the greatest minds faced setbacks before achieving success.
                <br /><br />
                <span className="text-neon-cyan">
                  "Success is not final, failure is not fatal: it is the courage to continue that counts."
                </span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
