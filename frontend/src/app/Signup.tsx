import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { BookOpen, Mail, Lock, User, Building2, AlertTriangle } from 'lucide-react';
import { useAuth } from './context/AuthContext'; 

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth(); 

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorConfig, setErrorConfig] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setErrorConfig({ show: true, message: "Please enter your full name." });
      return;
    }

    if (!validateEmail(email)) {
      setErrorConfig({ show: true, message: "Please enter a valid email address." });
      return;
    }

    if (institution.trim().length < 2) {
      setErrorConfig({ show: true, message: "Please enter a valid School/Institution name." });
      return;
    }

    if (password.length < 8) {
      setErrorConfig({ show: true, message: "Password must be at least 8 characters long." });
      return;
    }

    try {
      await signup(name, email, password, institution);
      navigate('/');
    } catch (error) {
      setErrorConfig({ 
        show: true, 
        message: "Signup failed. This email may already be in use." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-900 relative">
      
      {/* --- ERROR POP-UP --- */}
      {errorConfig.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
          
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 w-full max-w-[300px] text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your details</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {errorConfig.message}
            </p>
            
            <button 
              onClick={() => setErrorConfig({ ...errorConfig, show: false })}
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
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:rounded-2xl sm:px-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-semibold text-gray-900">Full Name</label>
              <div className="mt-2 relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 bg-gray-50 outline-none transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">School/Institution</label>
              <div className="mt-2 relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 bg-gray-50 outline-none transition-all"
                  placeholder="University of Example"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Email Address</label>
              <div className="mt-2 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 bg-gray-50 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Password</label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 bg-gray-50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}