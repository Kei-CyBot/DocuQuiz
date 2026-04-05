import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Plus, Trash2, Save, ArrowLeft, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorConfig, setErrorConfig] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
          }
        });
        
        if (!response.ok) {
           const errData = await response.json();
           throw new Error(errData.message || 'Failed to load quiz');
        }
        
        const rawData = await response.json();
        const quizData = rawData.data || rawData; 
        setTitle(quizData.title || '');
        
        const backendQuestions = quizData.questions || [];

        const formattedQuestions = backendQuestions.map((q: any) => {
          const type = q.type?.toLowerCase() || 'multiple_choice'; 
          
          let parsedOptions = ["", "", "", ""];
          if (q.options) {
            if (typeof q.options === 'string') {
              try { parsedOptions = JSON.parse(q.options); } catch (e) {}
            } else if (Array.isArray(q.options)) {
              parsedOptions = q.options;
            }
          }
          
          let correctIndex = 0;
          if (type === 'multiple_choice' && parsedOptions.length > 0) {
             correctIndex = parsedOptions.findIndex((opt: string) => opt === q.answer || q.answer?.startsWith(opt));
          }
          
          return {
            id: q.id,
            type: type,
            text: q.question || q.text || "", 
            options: parsedOptions,
            correct: correctIndex >= 0 ? correctIndex : 0,
            exactAnswer: q.answer || "", 
            points: q.points || 1 
          };
        });

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
       fetchQuiz();
    }
  }, [id, token]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: Date.now(), 
        type: 'multiple_choice', 
        text: "", 
        options: ["", "", "", ""], 
        correct: 0, 
        exactAnswer: "",
        points: 1 
      }
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const changeQuestionType = (id: number, type: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, type } : q));
  };

  const updateOptionText = (qId: number, optIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const setCorrectAnswer = (qId: number, optIndex: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correct: optIndex } : q));
  };

  const updateExactAnswer = (qId: number, text: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, exactAnswer: text } : q));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorConfig({ show: true, message: "Please provide a title for your quiz." });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;

      if (!q.text.trim()) {
        setErrorConfig({ show: true, message: `Question #${qNum} is missing its question text.` });
        return;
      }

      if (q.type === 'multiple_choice') {
        if (q.options.some((opt: string) => !opt.trim())) {
          setErrorConfig({ show: true, message: `Question #${qNum} has empty options. Please fill all multiple choice slots.` });
          return;
        }
      } else {
        if (!q.exactAnswer.trim()) {
          setErrorConfig({ show: true, message: `Question #${qNum} requires a correct answer. Please don't leave it blank.` });
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title,
        questions: questions.map(q => ({
          text: q.text,
          type: q.type, 
          options: q.type === 'multiple_choice' ? q.options : null, 
          answer: q.type === 'multiple_choice' ? q.options[q.correct] : q.exactAnswer 
        }))
      };

      const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        setErrorConfig({ show: true, message: "Failed to save the quiz to the server. Please try again." });
      }
    } catch (error) {
      setErrorConfig({ show: true, message: "Network error: Could not reach the server." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto w-full pb-24 relative px-4 sm:px-0">
      
      {errorConfig.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-[320px] text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your quiz</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {errorConfig.message}
            </p>
            <button 
              onClick={() => setErrorConfig({ ...errorConfig, show: false })}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.95] shadow-lg"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-[320px] text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Saved!</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your edits have been successfully saved to your dashboard.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-[0.95] shadow-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="pt-8 pb-2">
        <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors w-fit">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md pt-4 pb-4 mb-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex-1 mr-4">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-gray-900 tracking-tight bg-transparent border-b-2 border-transparent focus:border-indigo-600 outline-none w-full pb-1 transition-colors"
          />
          <p className="text-gray-500 text-sm mt-1">Review and modify AI-generated questions manually.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group flex flex-col gap-5 hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex gap-4 items-start pt-2">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                    </span>
                    <select 
                    value={q.type}
                    onChange={(e) => changeQuestionType(q.id, e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-48 p-2 outline-none"
                    >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="identification">Identification</option>
                    <option value="fill_in_the_blank">Fill in the Blank</option>
                    </select>
                </div>

                <textarea 
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  placeholder={q.type === 'fill_in_the_blank' ? "E.g., The capital of France is ______." : "Question Text"} 
                  rows={2}
                  className="w-full text-lg font-medium bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 mt-11">
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 bg-white" 
                  title="Delete Question Block"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 pl-2 border-t border-gray-100 pt-4">
              {q.type === 'multiple_choice' && q.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-4">
                  <input 
                    type="radio" 
                    name={`correct-${q.id}`} 
                    checked={q.correct === optIndex}
                    onChange={() => setCorrectAnswer(q.id, optIndex)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-600 cursor-pointer accent-indigo-600" 
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => updateOptionText(q.id, optIndex, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`} 
                    className="flex-1 px-4 py-2 border-b-2 border-transparent focus:border-indigo-600 hover:border-gray-200 outline-none transition-colors bg-transparent text-gray-700"
                  />
                </div>
              ))}

              {(q.type === 'identification' || q.type === 'fill_in_the_blank') && (
                <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                  <label className="block text-sm font-semibold text-green-800 mb-2">Exact Correct Answer:</label>
                  <input 
                    type="text" 
                    value={q.exactAnswer}
                    onChange={(e) => updateExactAnswer(q.id, e.target.value)}
                    placeholder="Type the required correct answer..." 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Students will need to type this exactly to receive the point.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addQuestion}
        className="mt-6 w-full border-2 border-dashed border-gray-300 rounded-xl bg-transparent flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group text-gray-500 hover:text-indigo-600 active:scale-[0.99]"
      >
        <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-lg">Add Manual Question Block</span>
      </button>
    </div>
  );
}