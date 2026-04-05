import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle, X, Loader2 } from 'lucide-react';
import { useScore } from './context/ScoreContext'; // 1. Imported the Context
import { useAuth } from './context/AuthContext';

export function TakeQuiz() {
  const { saveScore } = useScore(); // 2. Initialized the hook
  const { token } = useAuth(); // 3. Initialized the auth hook
  const { id } = useParams();
  
  // --- Dynamic State Variables ---
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState(''); // For Identification type
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Fetch the Quiz from Laravel ---
  useEffect(() => {
  const fetchQuiz = async () => {
    try {
      // Added headers to prove to Laravel who we are
      const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`, // The "Key"
          'Accept': 'application/json'         // Tells Laravel to send JSON, not HTML
        }
      });
      
      if (!response.ok) throw new Error('Failed to load quiz');
      
      const data = await response.json();
      setQuiz(data);
    } catch (err) {
      setError('Could not load the quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only run if we have an ID and a Token
  if (id && token) {
    fetchQuiz();
  }
}, [id, token]); // Add token as a dependency

  // --- Handle Moving to the Next Question or Submitting ---
  const handleNextOrSubmit = () => {
  const currentQ = quiz.questions[currentQuestionIndex];
  let isCorrect = false;

  // 1. Determine if the question is selection-based (Multiple Choice / True-False)
  // We check if 'options' exists and has items
  if (currentQ.options && currentQ.options.length > 0) {
    if (selectedOption === null) return; // Prevent submission if no option is picked

    const selectedText = currentQ.options[selectedOption];
    const selectedLetter = String.fromCharCode(65 + selectedOption); // A, B, C...
    
    // Normalize AI answers (it might send "A", "A.", or the full text)
    const normalizedAnswer = currentQ.answer.trim();

    if (
      normalizedAnswer === selectedText || 
      normalizedAnswer === selectedLetter || 
      normalizedAnswer.startsWith(`${selectedLetter}.`) ||
      normalizedAnswer.startsWith(`${selectedLetter}:`)
    ) {
      isCorrect = true;
    }
  } 
  // 2. Otherwise, treat it as text-based (Identification / Fill-in-the-Blanks)
  else {
    if (textAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim()) {
      isCorrect = true;
    }
  }

  // 3. Update score (Use a temporary variable for the "Last Question" logic)
  const newScore = isCorrect ? score + 1 : score;
  if (isCorrect) setScore(newScore);

  // 4. Navigation Logic
  if (currentQuestionIndex < quiz.questions.length - 1) {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setTextAnswer('');
  } else {
    // Save points using the most up-to-date score calculation
    const totalPointsForThisQuiz = newScore * 10; 
    saveScore(Number(id), totalPointsForThisQuiz);
    setIsModalOpen(true);
  }
};

  // --- Loading & Error States ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading your quiz...</p>
      </div>
    );
  }

  if (error || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'No questions found for this quiz.'}</p>
          <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Go Back</Link>
        </div>
      </div>
    );
  }

  // --- Setup Dynamic Variables for UI ---
  const currentQ = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const finalScorePercentage = Math.round((score / quiz.questions.length) * 100);
  const isPassing = finalScorePercentage >= 70; // Assuming 70% is passing

  // Calculate SVG stroke offset for the circular chart
  const circleCircumference = 452.39; // 2 * pi * r (where r=72)
  const strokeDashoffset = circleCircumference - (circleCircumference * (finalScorePercentage / 100));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Bar - Distraction Free */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Exit Quiz
        </Link>
        
        <div className="flex-1 max-w-xl mx-8 hidden sm:block">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>Progress</span>
            <span className="text-indigo-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full" 
              style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
        </div>

        <div className="w-[88px] hidden sm:block"></div> {/* Spacer to keep center balanced */}
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center">
        <div className="mb-12 text-center max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-full mb-6 border border-indigo-100">
            {quiz.type}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {currentQ.question}
          </h1>
        </div>

        {/* Conditionally Render Multiple Choice OR Identification */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 w-full">
            {currentQ.options && currentQ.options.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const letter = String.fromCharCode(65 + idx);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-5 group ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm shadow-indigo-100' 
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {letter}
                  </div>
                  <span className={`text-lg font-medium leading-relaxed pt-1.5 ${
                    isSelected ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="w-full max-w-2xl mb-12">
            <input 
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-6 py-5 text-xl rounded-2xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
            />
          </div>
        )}

        <div className="mt-8 flex justify-center w-full">
          <button 
            onClick={handleNextOrSubmit}
            disabled={currentQ.options && currentQ.options.length > 0 ? selectedOption === null : textAnswer.trim() === ''}
            className="w-full sm:w-auto bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-sm shadow-indigo-200"
          >
            {isLastQuestion ? 'Submit for Grading' : 'Next Question'}
          </button>
        </div>
      </div>

      {/* Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 relative animate-fade-in-up">
            <Link to="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </Link>

            <div className="flex flex-col items-center text-center mt-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Quiz Complete!</h2>
              
              {/* Circular Score Graphic */}
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle 
                    cx="80" cy="80" r="72" 
                    className="stroke-gray-100" 
                    strokeWidth="12" 
                    fill="none" 
                  />
                  {/* Progress circle */}
                  <circle 
                    cx="80" cy="80" r="72" 
                    className={`${isPassing ? 'stroke-emerald-500' : 'stroke-red-500'}`} 
                    strokeWidth="12" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference} 
                    strokeDashoffset={strokeDashoffset} 
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black tracking-tighter ${isPassing ? 'text-gray-900' : 'text-red-500'}`}>
                    {finalScorePercentage}
                  </span>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">/100</span>
                </div>
              </div>

              {/* Dynamic Pass/Fail Badge */}
              <div className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 mb-8 border ${
                isPassing 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {isPassing ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {isPassing ? 'Passed' : 'Needs Review'}
              </div>

              <div className="flex flex-col w-full gap-3">
                <p className="text-gray-500 font-medium mb-2">You got {score} out of {quiz.questions.length} correct.</p>
                <Link to="/" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-sm shadow-indigo-200">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}