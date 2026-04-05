import { useState } from 'react';
import { UploadCloud, Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'; 
import { useNavigate } from 'react-router'; 
import { useAuth } from './context/AuthContext';

export function CreateQuiz() {
  const navigate = useNavigate(); 
  const { token } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [type, setType] = useState('Multiple Choice');
  const [questionCount, setQuestionCount] = useState(10);
  const [instructions, setInstructions] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any[] | null>(null);
  
  const [showModal, setShowModal] = useState(false); 
  
  const [errorConfig, setErrorConfig] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const handleGenerateQuiz = async () => {
    if (!token) {
        setErrorConfig({ show: true, message: "Authentication Error: No token found. Please log out and log back in." });
        return;
    }
   
    if (!file && !title) {
      setErrorConfig({ show: true, message: "Please upload a source document and provide a quiz title to continue." });
      return;
    }

    if (!file) {
      setErrorConfig({ show: true, message: "Please upload a PDF, DOCX, or TXT file to generate questions from." });
      return;
    }

    if (!title) {
      setErrorConfig({ show: true, message: "Please give your quiz a title (e.g., Final Exam Review)." });
      return;
    }

    setIsGenerating(true);
    setSuccessMsg(''); 
    setQuizData(null); 
    setShowModal(false); 

    let strictPrompt = instructions;
    strictPrompt += `\n\nCRITICAL AI RULES - DO NOT IGNORE: 
    1. ZERO HALLUCINATION: ONLY use facts explicitly stated in the provided document.
    2. QUIZ TYPE: This is strictly a "${type}" quiz.`;

    if (type === "Fill in the Blank") {
      strictPrompt += `\n3. FORMATTING: You MUST replace the target word in the question with "_______" (underscores). The 'options' array MUST be completely empty []. The 'answer' must be the exact word that belongs in the blank.`;
    } else if (type === "True/False") {
      strictPrompt += `\n3. FORMATTING: Every question MUST be a statement that is either definitively True or definitively False based on the text. The 'options' array MUST be exactly ["True", "False"]. The 'answer' MUST be exactly "True" or "False".`;
    } else if (type === "Identification") {
      strictPrompt += `\n3. FORMATTING: DO NOT generate A/B/C/D options. The 'options' array MUST be empty []. The 'answer' must be a single exact word or short phrase.`;
    } else if (type === "Mixture") {
      strictPrompt += `\n3. FORMATTING: This is a MIXED format quiz. For each question, randomly assign one of the following formats and adhere STRICTLY to its rule:
      - Multiple Choice: Provide exactly 4 plausible options in the 'options' array.
      - True/False: Make a statement. The 'options' array MUST be exactly ["True", "False"].
      - Fill in the Blank: Replace the target word with "_______". The 'options' array MUST be empty [].
      - Identification: Ask a direct question. The 'options' array MUST be empty [].
      Ensure the 'answer' field perfectly matches the format you chose for that specific question.`;
    } else {
      strictPrompt += `\n3. FORMATTING: Provide exactly 4 plausible options in the 'options' array. The 'answer' must exactly match one of those options.`;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('difficulty', difficulty);
    formData.append('type', type);
    formData.append('question_count', questionCount.toString());
    formData.append('instructions', strictPrompt); 

    try {
      const response = await fetch("http://127.0.0.1:8000/api/quizzes/generate", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData, 
      });

      const data = await response.json(); 

      if (response.ok) {
        setSuccessMsg("AI Quiz Generated successfully!");
        setQuizData(data.quiz_data); 
        setShowModal(true); 
      } else {
        setErrorConfig({ show: true, message: "Failed to generate quiz. Please try again or check your file size." });
      }
    } catch (error) {
      setErrorConfig({ show: true, message: "Could not reach the server. Please check your internet connection." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMakeAnother = () => {
    setShowModal(false);
    setFile(null);
    setTitle('');
    setInstructions('');
    setQuizData(null);
    setSuccessMsg('');
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-16 relative">
      
      {/* --- CUSTOM ERROR POP-UP --- */}
      {errorConfig.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-[320px] text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Wait a moment</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {errorConfig.message}
            </p>
            <button 
              onClick={() => setErrorConfig({ ...errorConfig, show: false })}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.95] shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Quiz</h2>
        <p className="text-gray-500 mt-2 text-base">Upload your course materials and let AI generate the quiz for you.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left: Drag and Drop */}
        <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upload Source Document</h3>
            <p className="text-sm text-gray-500 mt-1">Provide the material you want to quiz on.</p>
          </div>
          
          <div className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer group relative ${file ? 'border-green-400 bg-green-50' : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            {file ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1 text-center break-all">{file.name}</p>
                <p className="text-sm text-green-600 font-medium">Ready to process!</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mb-6 text-center">PDF, DOCX, or TXT files up to 10MB</p>
                <span className="bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-lg font-semibold group-hover:bg-indigo-200 transition-colors">
                  Select File
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Settings Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quiz Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Configure how the AI should generate your questions.</p>
          </div>

          {successMsg && !showModal && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 transition-all duration-300">
              <span className="font-bold text-lg bg-green-200 w-6 h-6 flex items-center justify-center rounded-full">✓</span>
              <p className="font-medium">{successMsg}</p>
            </div>
          )}
          
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quiz Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cellular Biology 101" 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-shadow"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white font-medium appearance-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quiz Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white font-medium appearance-none"
                >
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Fill in the Blank">Fill in the Blank</option>
                  <option value="Identification">Identification</option>
                  <option value="Mixture">Mixture</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Count</label>
              <input 
                type="number" 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custom Prompts (Optional)</label>
              <textarea 
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any specific topics to focus on or ignore?"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow resize-none"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className={`w-full text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2 ${isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating AI Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Quiz Generated!</h2>
            <p className="text-gray-500 text-center mb-8">
              "{title}" has been successfully created and saved to your vault. What would you like to do next?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/')} 
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleMakeAnother}
                className="w-full bg-white text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Make Another Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {quizData && !showModal && (
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12 animate-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Preview: {title}
          </h2>
          
          <div className="space-y-6">
            {quizData.map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed">
                  <span className="text-indigo-600 mr-2 font-bold bg-indigo-100 w-8 h-8 inline-flex items-center justify-center rounded-full text-sm">
                    {index + 1}
                  </span> 
                  {item.question}
                </h3>
                
                {item.options && item.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pl-10">
                    {item.options.map((option: string, optIndex: number) => (
                      <div 
                        key={optIndex} 
                        className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700 hover:border-indigo-300 transition-colors"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 ml-10 inline-block bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                  ✓ Correct Answer: {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}