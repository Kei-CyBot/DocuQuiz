import { CheckCircle, XCircle, ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import { Link } from 'react-router'; 

interface QuizResultsProps {
  quiz: any;
  userAnswers: Record<number, string | number>;
  totalScore: number;
  onRetake: () => void;
}

export function QuizResults({ quiz, userAnswers, totalScore, onRetake }: QuizResultsProps) {
  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((totalScore / totalQuestions) * 100);
  const isPassing = percentage >= 70;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24">
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className={`absolute top-0 left-0 w-full h-2 ${isPassing ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
          
          {isPassing ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-orange-600" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPassing ? 'Great Job!' : 'Keep Practicing!'}
          </h2>
          <div className="flex items-end justify-center gap-2 mb-6">
            <span className={`text-6xl font-black ${isPassing ? 'text-emerald-600' : 'text-orange-600'}`}>
              {percentage}%
            </span>
          </div>
          <p className="text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-lg inline-block">
            You got <strong className="text-gray-900">{totalScore}</strong> out of <strong className="text-gray-900">{totalQuestions}</strong> correct
          </p>

          <button 
            onClick={onRetake}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-200"
          >
            Retake Quiz
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Review</h3>
        <div className="space-y-4">
          {quiz.questions.map((q: any, index: number) => {
            const userAnswer = userAnswers[index];
            const hasOptions = q.options && q.options.length > 0;
            
            let isCorrect = false;
            let userAnswerDisplay = 'Skipped';
            let correctAnswerDisplay = q.answer;

            if (hasOptions) {
              if (userAnswer !== null && userAnswer !== undefined) {
                const selectedIdx = Number(userAnswer);
                userAnswerDisplay = q.options[selectedIdx];
                const selectedLetter = String.fromCharCode(65 + selectedIdx);
                const normalizedAnswer = String(q.answer).trim();

                if (
                  normalizedAnswer === userAnswerDisplay || 
                  normalizedAnswer === selectedLetter || 
                  normalizedAnswer.startsWith(`${selectedLetter}.`) ||
                  normalizedAnswer.startsWith(`${selectedLetter}:`)
                ) {
                  isCorrect = true;
                }
              }
            } else {
              if (userAnswer) {
                userAnswerDisplay = String(userAnswer);
                if (String(userAnswer).toLowerCase().trim() === String(q.answer).toLowerCase().trim()) {
                  isCorrect = true;
                }
              }
            }

            return (
              <div 
                key={index} 
                className={`rounded-xl border-2 p-6 transition-colors ${
                  isCorrect 
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300' 
                    : 'bg-red-50/30 border-red-200 hover:border-red-300'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-gray-500">Question {index + 1}</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">{q.question}</h4>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-emerald-100/50 border-emerald-200' : 'bg-red-100/50 border-red-200'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Your Answer</p>
                        <p className={`font-medium ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                          {userAnswerDisplay}
                        </p>
                      </div>
                      
                      {!isCorrect && (
                        <div className="p-4 rounded-lg border bg-emerald-100/50 border-emerald-200">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/70 mb-1">Correct Answer</p>
                          <p className="font-medium text-emerald-800">
                            {correctAnswerDisplay}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}