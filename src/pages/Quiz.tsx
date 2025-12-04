import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import WarningModal from '@/components/WarningModal';
import DisqualifiedScreen from '@/components/DisqualifiedScreen';
import { useQuiz } from '@/contexts/QuizContext';
import useAntiCheat from '@/hooks/useAntiCheat';

const Quiz = () => {
  const navigate = useNavigate();
  const {
    teamId,
    teamName,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    setSelectedAnswer,
    warnings,
    isDisqualified,
    isCompleted,
    startTime,
    nextQuestion,
    submitQuiz,
    addWarning,
  } = useQuiz();

  const [showWarning, setShowWarning] = useState(false);
  const [pendingWarning, setPendingWarning] = useState(false);

  // Redirect if no quiz started (but not if disqualified)
  useEffect(() => {
    const disqualifiedTeamId = localStorage.getItem('disqualifiedTeamId');
    if (!teamId && !sessionStorage.getItem('quizTeamId') && !disqualifiedTeamId) {
      navigate('/');
    }
  }, [teamId, navigate]);

  // Redirect on completion
  useEffect(() => {
    if (isCompleted) {
      navigate('/results');
    }
  }, [isCompleted, navigate]);

  // Handle warning
  const handleWarning = useCallback(() => {
    if (isDisqualified || isCompleted || showWarning) return;
    setPendingWarning(true);
  }, [isDisqualified, isCompleted, showWarning]);

  // Process pending warning
  useEffect(() => {
    if (pendingWarning && !showWarning) {
      addWarning();
      if (warnings < 3) {
        setShowWarning(true);
      }
      setPendingWarning(false);
    }
  }, [pendingWarning, showWarning, warnings, addWarning]);

  // Anti-cheat hook
  useAntiCheat({
    isActive: !!teamId && !isDisqualified && !isCompleted && !showWarning,
    onWarning: handleWarning,
    warningCount: warnings,
  });

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  const handleNext = () => {
    nextQuestion();
  };

  const handleSubmit = async () => {
    await submitQuiz();
  };

  if (isDisqualified) {
    return <DisqualifiedScreen />;
  }

  if (!questions.length || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-rajdhani text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      
      <main className="pt-20 md:pt-24 pb-8 px-4">
        {/* Top Bar with Timer and Team Name */}
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/30">
            <span className="font-rajdhani text-sm md:text-base text-muted-foreground">Team:</span>
            <span className="font-orbitron text-sm md:text-base text-neon-cyan">{teamName}</span>
          </div>
          <Timer startTime={startTime} isRunning={!isCompleted && !isDisqualified} />
        </div>

        {/* Warning Counter */}
        {warnings > 0 && (
          <div className="max-w-3xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30">
              <span className="font-rajdhani text-sm text-neon-yellow">
                Warnings: {warnings}/3
              </span>
            </div>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={setSelectedAnswer}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
          />
        )}
      </main>

      {/* Warning Modal */}
      {showWarning && (
        <WarningModal
          warningCount={warnings}
          onClose={handleCloseWarning}
        />
      )}
    </div>
  );
};

export default Quiz;
