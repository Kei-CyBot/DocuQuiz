import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useScore } from './context/ScoreContext'; 
import { useAuth } from './context/AuthContext';
import { QuizResults } from './QuizResults'; 

export function TakeQuiz() {
  const { saveScore } = useScore(); 
  const { token } = useAuth(); 
  const { id } = useParams();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState(''); 
  const [score, setScore] = useState(0);
  
  
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | number>>({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json'         
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

    if (id && token) {
      fetchQuiz();
    }
  }, [id, token]); 

  const handleNextOrSubmit = () => {
    const currentQ = quiz.questions[currentQuestionIndex];
    let isCorrect = false;
    let answerToSave: string | number = '';

    if (currentQ.options && currentQ.options.length > 0) {
      if (selectedOption === null) return; 

      answerToSave = selectedOption; 
      const selectedText = currentQ.options[selectedOption];
      const selectedLetter = String.fromCharCode(65 + selectedOption); 
      
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
    else {
      answerToSave = textAnswer; 
      if (textAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim()) {
        isCorrect = true;
      }
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerToSave
    }));

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTextAnswer('');
    } else {
      const totalPointsForThisQuiz = newScore * 10; 
      saveScore(Number(id), totalPointsForThisQuiz);
      setIsFinished(true); 
    }
  };

  const handleRetake = () => {
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setTextAnswer('');
    setUserAnswers({});
  };

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

  if (isFinished) {
    return (
      <QuizResults 
        quiz={quiz} 
        userAnswers={userAnswers} 
        totalScore={score} 
        onRetake={handleRetake} 
      />
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
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

        <div className="w-[88px] hidden sm:block"></div> 
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center">
        <div className="mb-12 text-center max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-full mb-6 border border-indigo-100">
            {quiz.type}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {currentQ.question}
          </h1>
        </div>

        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 w-full">
            {currentQ.options.map((opt: string, idx: number) => {
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
    </div>
  );
}