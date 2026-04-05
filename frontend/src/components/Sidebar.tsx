// src/app/components/Sidebar.tsx
import { LayoutDashboard, Library, Settings, BookOpen, Lock } from 'lucide-react';
import { NavLink } from 'react-router';
import { useAuth } from '../app/context/AuthContext'; // 1. Import useAuth

export function Sidebar() {
  const { token } = useAuth(); // 2. Get the token

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">DocuQuiz AI</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
              isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>

        {/* 3. Wrap private links in a token check */}
        {token ? (
          <>
            <NavLink 
              to="/library" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Library className="w-5 h-5" />
              My Library
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </>
        ) : (
          /* Show a "Locked" placeholder for guests if you want them to see what they're missing */
          <div className="px-3 py-2.5 text-gray-400 flex items-center gap-3 italic text-sm">
            <Lock className="w-4 h-4" />
            Login to view Library
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-400 font-medium">
          <span>v1.2.0 • {token ? 'Pro Plan' : 'Free Guest'}</span>
        </div>
      </div>
    </div>
  );
}