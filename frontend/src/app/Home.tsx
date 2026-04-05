import { useState, useEffect } from "react";
import { Link } from "react-router"; 
import { QuizCard, type QuizCardProps } from '../components/QuizCard';
import { useAuth } from './context/AuthContext'; 

export function Home() {
  const { token } = useAuth(); 
  const [quizzes, setQuizzes] = useState<QuizCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/quizzes", {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch");
        return response.json();
      })
      .then((data) => {
        const formattedQuizzes = data.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          difficulty: quiz.difficulty,
          type: quiz.type,
          questionCount: quiz.question_count, 
        }));
        
        setQuizzes(formattedQuizzes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch quizzes:", error);
        setIsLoading(false);
      });
  }, [token]); 

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      } else {
        alert("Failed to delete quiz.");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("An error occurred while deleting.");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "All" || 
      (quiz.difficulty && quiz.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
      
    const matchesType = typeFilter === "All" || 
      (quiz.type && quiz.type.toLowerCase() === typeFilter.toLowerCase());
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Saved Quizzes</h2>
          <p className="text-gray-500 mt-2 text-base">Review, edit, and take the quizzes you've generated.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-bold transition-colors shadow-sm border ${showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
          <Link to="/create" className="bg-indigo-600 border border-transparent text-white px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            + New Quiz
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Quiz Type</label>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True/False">True/False</option>
              <option value="Fill in the Blank">Fill in the Blank</option>
              <option value="Identification">Identification</option>
              <option value="Mixture">Mixture</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setDifficultyFilter("All"); setTypeFilter("All"); setSearchQuery(""); }}
              className="text-sm text-gray-500 hover:text-gray-800 underline pb-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg font-medium animate-pulse">Loading from the vault...</p>
        </div>
      ) : (
        <>
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg font-medium">No quizzes found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
              {filteredQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id} 
                  {...quiz} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}