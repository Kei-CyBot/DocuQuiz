import { useState, useEffect, useRef } from 'react';
import { 
  FileText, Clock, Star, PlayCircle, MoreVertical, 
  Loader2, AlertCircle, Edit3, Trash2, Trophy 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router'; 
import { useScore } from './context/ScoreContext'; 
import { useAuth } from './context/AuthContext'; 

export function Library() {
  const { token } = useAuth(); 
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { quizScores } = useScore();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/quizzes', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch library');
        
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError('Could not load quizzes. Please make sure your Laravel backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchQuizzes();
    }
  }, [token]); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          setQuizzes((prev) => prev.filter(q => q.id !== id));
          setActiveMenuId(null);
        } else {
          alert("Failed to delete the quiz from the server.");
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server to delete.");
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
    setActiveMenuId(null);
  };

  const totalQuizzes = quizzes.length;

  const perfectScores = quizzes.reduce((count, quiz) => {
    const maxPoints = quiz.question_count * 10; 
    const userPoints = quizScores[quiz.id];
    
    if (userPoints !== undefined && userPoints === maxPoints) {
      return count + 1;
    }
    return count;
  }, 0);

  const estimatedMinutes = quizzes.reduce((total, quiz) => {
    if (quizScores[quiz.id] !== undefined) {
      return total + (quiz.question_count * 1.5);
    }
    return total;
  }, 0);
  const hoursStudied = (estimatedMinutes / 60).toFixed(1);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading your library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Connection Error</h2>
          <p className="text-red-600/80 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Library</h1>
          <p className="text-gray-500">Access all your generated quizzes and study materials.</p>
        </div>
        <Link to="/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm shadow-indigo-200">
          + Generate New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl"><FileText className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-500">Total Quizzes</p>
            <p className="text-2xl font-black text-gray-900">{totalQuizzes}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-emerald-50 opacity-50">
            <Star className="w-24 h-24" />
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl z-10"><Trophy className="w-6 h-6 text-emerald-600" /></div>
          <div className="z-10">
            <p className="text-sm font-bold text-gray-500">Perfect Scores</p>
            <p className="text-2xl font-black text-gray-900">{perfectScores}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-xl"><Clock className="w-6 h-6 text-orange-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-500">Hours Studied</p>
            <p className="text-2xl font-black text-gray-900">{hoursStudied} <span className="text-sm font-medium text-gray-400">est.</span></p>
          </div>
        </div>
      </div>

      {/* Removed overflow-hidden from this container so the dropdown can break out if necessary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200" ref={menuRef}>
        {/* Added rounded-t-2xl to the header to preserve top border radius */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold text-gray-800">All Materials</h3>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium rounded-b-2xl">
            No quizzes found in your library yet. Generate one to get started!
          </div>
        ) : (
          /* Added max-h-[600px] and overflow-y-auto to create the scrollbar, and pb-24 so the last item's dropdown isn't cut off by the scroll boundary */
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto pb-24 rounded-b-2xl">
            {quizzes.map((quiz) => {
              const userPoints = quizScores[quiz.id];
              const maxPoints = quiz.question_count * 10;
              let percentageScore = null;
              
              if (userPoints !== undefined && maxPoints > 0) {
                percentageScore = Math.round((userPoints / maxPoints) * 100);
              }

              return (
                <div key={quiz.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-indigo-100 p-2.5 rounded-lg text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center flex-wrap gap-2">
                        {quiz.title || 'Untitled Quiz'}
                        
                        {percentageScore === 100 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
                            <Trophy className="w-3 h-3 text-yellow-600" />
                            Perfect!
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-gray-500 flex-wrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{quiz.type}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{quiz.question_count} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(quiz.created_at)}</span>
                        
                        {percentageScore !== null && percentageScore !== 100 && (
                          <span className={`flex items-center gap-1 ${percentageScore >= 70 ? 'text-emerald-600' : 'text-orange-600'}`}>
                            • Best Score: {percentageScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link 
                      to={`/take/${quiz.id}`} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {percentageScore !== null ? 'Retake' : 'Start'}
                    </Link>

                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === quiz.id ? null : quiz.id)}
                        className={`p-2 rounded-lg transition-colors ${activeMenuId === quiz.id ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenuId === quiz.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => handleEdit(quiz.id)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" /> Edit Details
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button 
                            onClick={() => handleDelete(quiz.id)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Quiz
                          </button>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}