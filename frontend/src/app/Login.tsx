import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { BookOpen, Mail, Lock, AlertTriangle } from 'lucide-react'; 
import { useAuth } from './context/AuthContext'; 

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, rememberMe); 
      navigate('/');
    } catch (error) {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-900 relative">
      
      {/* --- CUSTOM ERROR POP-UP (MATCHES MODAL STYLE) --- */}
      {showError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop to dim the entire page */}
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
          
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-indigo-600 p-2.5 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-gray-900">
            DocuQuiz<span className="text-indigo-600">AI</span>
          </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Please enter your details to sign in.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:rounded-2xl sm:px-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
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
              <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
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
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
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
            <Link to="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}