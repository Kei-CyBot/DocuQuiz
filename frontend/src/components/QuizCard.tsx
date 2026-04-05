import { Play, Edit2, Trash2, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router';

export interface QuizCardProps {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Multiple Choice' | 'Identification';
  questionCount: number;
  // --- NEW: Add the onDelete prop type ---
  onDelete?: (id: number) => void; 
}

export function QuizCard({ id, title, difficulty, type, questionCount, onDelete }: QuizCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hard': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900 leading-tight pr-4 mb-4 line-clamp-2">{title}</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {type}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-6 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>{questionCount} Qs</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>~{questionCount * 2} mins</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
        <Link to={`/take/${id}`} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm hover:shadow-indigo-200 hover:shadow-lg">
          <Play className="w-4 h-4" />
          Take Quiz
        </Link>
        <Link to={`/edit/${id}`} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 flex items-center justify-center" title="Edit Quiz">
          <Edit2 className="w-5 h-5" />
        </Link>
        {/* --- NEW: Attach the onClick handler --- */}
        <button 
          onClick={() => onDelete && onDelete(id)}
          className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
          title="Delete Quiz"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}