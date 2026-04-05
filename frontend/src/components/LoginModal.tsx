// src/app/components/LoginModal.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { BookOpen, Mail, Lock, X, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { useAuth } from '../app/context/AuthContext'; 

export function LoginModal() {
  const navigate = useNavigate();
  const { login, isLoginModalOpen, setLoginModalOpen } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false); // New state for custom pop-up

  // If state is false, render absolutely nothing
  if (!isLoginModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, rememberMe); 
      setLoginModalOpen(false); 
      navigate('/');
    } catch (error) {
      // Replaced alert with custom pop-up state
      setShowError(true); 
    }
  };

  const closeAndNavigate = () => {
    setLoginModalOpen(false);
    setShowError(false); // Reset error on close
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white py-8 px-4 sm:rounded-2xl sm:px-10 border border-gray-100 shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- CUSTOM ERROR POP-UP (MATCHES GENERATE QUIZ STYLE) --- */}
        {showError && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center p-6">
            {/* Inner Backdrop to dim the login form specifically */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] sm:rounded-2xl" />
            
            <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 w-full max-w-[300px] text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Login Failed</h3>
              <p className="text-sm text-gray-500 mb-6">
                Invalid credentials. Please check your email and password.
              </p>
              
              <button 
                onClick={() => setShowError(false)}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.95]"
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={closeAndNavigate}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4 mt-2">
            <div className="bg-indigo-600 p-2 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              DocuQuiz<span className="text-indigo-600">AI</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="modal-email" className="block text-sm font-semibold leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-password" className="block text-sm font-semibold leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="modal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="modal-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600"
              />
              <label htmlFor="modal-remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <div className="text-sm leading-6">
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98]"
            >
              Log In
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            onClick={closeAndNavigate} 
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}