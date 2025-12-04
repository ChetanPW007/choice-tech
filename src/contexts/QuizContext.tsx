import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface Team {
  id: string;
  team_name: string;
  score: number;
  total_questions: number;
  current_question: number;
  answers: string[];
  start_time: string | null;
  end_time: string | null;
  total_time_seconds: number | null;
  warnings: number;
  is_disqualified: boolean;
  is_completed: boolean;
  question_order: string[];
}

interface QuizContextType {
  teamId: string | null;
  teamName: string;
  setTeamName: (name: string) => void;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  warnings: number;
  isDisqualified: boolean;
  isCompleted: boolean;
  score: number;
  startTime: Date | null;
  endTime: Date | null;
  totalTimeSeconds: number | null;
  startQuiz: () => Promise<boolean>;
  nextQuestion: () => void;
  submitQuiz: () => Promise<void>;
  addWarning: () => void;
  disqualify: () => void;
  answers: string[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [teamId, setTeamId] = useState<string | null>(() => {
    // Check if user was disqualified first
    const disqualifiedTeamId = localStorage.getItem('disqualifiedTeamId');
    if (disqualifiedTeamId) return disqualifiedTeamId;
    return sessionStorage.getItem('quizTeamId');
  });
  const [teamName, setTeamName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [warnings, setWarnings] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);

  // Restore state from session storage or localStorage (for disqualified users)
  useEffect(() => {
    const restoreState = async () => {
      // Check disqualified first
      const disqualifiedTeamId = localStorage.getItem('disqualifiedTeamId');
      const storedTeamId = disqualifiedTeamId || sessionStorage.getItem('quizTeamId');
      
      if (storedTeamId) {
        const { data: team } = await supabase
          .from('teams')
          .select('*')
          .eq('id', storedTeamId)
          .maybeSingle();

        if (team) {
          setTeamId(team.id);
          setTeamName(team.team_name);
          setCurrentQuestionIndex(team.current_question);
          setWarnings(team.warnings);
          setIsDisqualified(team.is_disqualified);
          setIsCompleted(team.is_completed);
          setScore(team.score);
          setAnswers((team.answers as string[]) || []);
          setQuestionOrder((team.question_order as string[]) || []);
          if (team.start_time) setStartTime(new Date(team.start_time));
          if (team.end_time) setEndTime(new Date(team.end_time));
          setTotalTimeSeconds(team.total_time_seconds);

          // Load questions in order
          if (team.question_order && (team.question_order as string[]).length > 0) {
            const { data: allQuestions } = await supabase
              .from('questions')
              .select('*');
            
            if (allQuestions) {
              const orderedQuestions = (team.question_order as string[]).map(id => 
                allQuestions.find(q => q.id === id)
              ).filter(Boolean) as Question[];
              setQuestions(orderedQuestions);
            }
          }
        }
      }
    };

    restoreState();
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = async (): Promise<boolean> => {
    if (!teamName.trim()) return false;

    // Check if team name already exists
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('team_name', teamName.trim())
      .maybeSingle();

    if (existingTeam) {
      return false;
    }

    // Load and shuffle questions
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('*');

    if (!allQuestions || allQuestions.length === 0) return false;

    const shuffledQuestions = shuffleArray(allQuestions).slice(0, 20);
    const order = shuffledQuestions.map(q => q.id);

    const now = new Date();
    
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({
        team_name: teamName.trim(),
        start_time: now.toISOString(),
        question_order: order,
        current_question: 0,
        score: 0,
        warnings: 0,
        is_disqualified: false,
        is_completed: false,
        answers: [],
      })
      .select()
      .single();

    if (error || !newTeam) return false;

    setTeamId(newTeam.id);
    sessionStorage.setItem('quizTeamId', newTeam.id);
    setQuestions(shuffledQuestions);
    setQuestionOrder(order);
    setStartTime(now);
    setCurrentQuestionIndex(0);
    setAnswers([]);

    return true;
  };

  const updateTeamInDB = async (updates: Partial<Team>) => {
    if (!teamId) return;
    await supabase.from('teams').update(updates).eq('id', teamId);
  };

  const nextQuestion = async () => {
    if (!selectedAnswer) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Calculate score
    const currentQuestion = questions[currentQuestionIndex];
    let newScore = score;
    if (currentQuestion && selectedAnswer === currentQuestion.correct_answer) {
      newScore = score + 1;
      setScore(newScore);
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(null);

    await updateTeamInDB({
      current_question: nextIndex,
      answers: newAnswers as unknown as string[],
      score: newScore,
    });
  };

  const submitQuiz = async () => {
    if (!selectedAnswer) return;

    const finalAnswers = [...answers, selectedAnswer];
    
    // Calculate final score
    const currentQuestion = questions[currentQuestionIndex];
    let finalScore = score;
    if (currentQuestion && selectedAnswer === currentQuestion.correct_answer) {
      finalScore = score + 1;
    }

    const now = new Date();
    const timeTaken = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : 0;

    setScore(finalScore);
    setAnswers(finalAnswers);
    setEndTime(now);
    setTotalTimeSeconds(timeTaken);
    setIsCompleted(true);

    await updateTeamInDB({
      score: finalScore,
      answers: finalAnswers as unknown as string[],
      end_time: now.toISOString(),
      total_time_seconds: timeTaken,
      is_completed: true,
    });

    sessionStorage.removeItem('quizTeamId');
  };

  const addWarning = async () => {
    const newWarnings = warnings + 1;
    setWarnings(newWarnings);

    if (newWarnings >= 4) {
      disqualify();
    } else {
      await updateTeamInDB({ warnings: newWarnings });
    }
  };

  const disqualify = async () => {
    setIsDisqualified(true);
    await updateTeamInDB({ is_disqualified: true, warnings: 4 });
    // Store in localStorage so disqualification persists even after refresh
    if (teamId) {
      localStorage.setItem('disqualifiedTeamId', teamId);
    }
    sessionStorage.removeItem('quizTeamId');
  };

  return (
    <QuizContext.Provider
      value={{
        teamId,
        teamName,
        setTeamName,
        questions,
        currentQuestionIndex,
        selectedAnswer,
        setSelectedAnswer,
        warnings,
        isDisqualified,
        isCompleted,
        score,
        startTime,
        endTime,
        totalTimeSeconds,
        startQuiz,
        nextQuestion,
        submitQuiz,
        addWarning,
        disqualify,
        answers,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
