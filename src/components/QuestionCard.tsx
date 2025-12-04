import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onNext: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onSubmit,
  isLastQuestion,
}: QuestionCardProps) => {
  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  // Shuffle options consistently per question
  const shuffledOptions = [...options].sort(() => 0.5 - Math.random());

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      {/* Question Counter */}
      <div className="text-center mb-4 md:mb-6">
        <span className="font-orbitron text-xl md:text-2xl neon-text-cyan">
          Q {questionNumber.toString().padStart(2, '0')}/{totalQuestions.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Question Card */}
      <div className="card-glow rounded-xl p-4 md:p-6">
        {/* Question Text */}
        <div className="mb-4 md:mb-6">
          <p className="font-rajdhani text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4 md:mb-6">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => onSelectAnswer(option.key)}
              className={`option-btn p-3 md:p-4 rounded-lg text-left transition-all ${
                selectedAnswer === option.key ? 'selected' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`font-orbitron text-base md:text-lg font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border ${
                  selectedAnswer === option.key 
                    ? 'border-neon-green text-neon-green bg-neon-green/10' 
                    : 'border-neon-cyan/50 text-neon-cyan'
                }`}>
                  {option.key}
                </span>
                <span className="font-rajdhani text-base md:text-lg text-foreground/90 pt-0.5">
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              disabled={!selectedAnswer}
              className="btn-glow-green px-8 md:px-12 py-3 font-orbitron text-base md:text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUBMIT
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!selectedAnswer}
              className="btn-glow-green px-8 md:px-12 py-3 font-orbitron text-base md:text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
