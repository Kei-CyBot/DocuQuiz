import { useState } from 'react';
import { Award, Bell, User, LogOut, Settings as SettingsIcon, BookOpen, LogIn } from 'lucide-react';
import { useScore } from '../app/context/ScoreContext'; 
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../app/context/AuthContext'; 

export function Header() {
  const { totalPoints } = useScore();
  const { user, token, logout, setLoginModalOpen } = useAuth(); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const handleLogout = () => {
    logout(); 
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between relative z-40">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          {token ? `Welcome back, ${firstName}!` : 'Welcome to DocuQuizAI!'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Ready to learn something new today?</p>
      </div>

      <div className="flex items-center gap-6">
        {/* 2. Conditional Rendering based on whether the user is logged in */}
        {token ? (
          <>
            <div className="flex items-center gap-2.5 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-full font-bold border border-indigo-100 shadow-sm transition-all">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Total Points Earned: {totalPoints}</span> 
            </div>

            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 cursor-pointer border-2 border-indigo-200 hover:border-indigo-300 transition-colors"
              >
                <User className="w-6 h-6" />
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 font-medium truncate">{user?.email}</p>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                      <Link 
                        to="/library" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        My Library
                      </Link>
                      <Link 
                        to="/settings" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="p-2 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* IF NOT LOGGED IN: Show Log In & Sign Up buttons */
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Log In
            </button>
            <Link 
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}