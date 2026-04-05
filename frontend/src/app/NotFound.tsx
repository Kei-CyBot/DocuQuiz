import { Link } from "react-router";
import { MapPinOff } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center max-w-md mx-auto animate-fade-in-up">
      <div className="bg-indigo-50 p-5 rounded-full mb-6 border border-indigo-100 shadow-sm">
        <MapPinOff className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">404 - Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-lg">
        Oops! It looks like the page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm shadow-indigo-200 active:scale-95"
      >
        Take Me Home
      </Link>
    </div>
  );
}