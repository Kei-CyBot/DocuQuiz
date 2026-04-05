// src/app/context/ScoreContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ScoreContextType {
  totalPoints: number;
  saveScore: (quizId: number, score: number) => void;
  quizScores: Record<number, number>;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  // SAFELY get the auth context. If it's still loading, it won't crash.
  const auth = useAuth(); 
  const user = auth?.user; 

  const [quizScores, setQuizScores] = useState<Record<number, number>>({});

  // 1. Create a dynamic key based on the User ID
  const storageKey = user?.id ? `quizScores_user_${user.id}` : null;

  // 2. Load scores when the user changes (Login/Logout)
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      setQuizScores(saved ? JSON.parse(saved) : {});
    } else {
      // Clear scores from state if no one is logged in (Logout)
      setQuizScores({});
    }
  }, [storageKey]);

  // 3. Save scores to localStorage whenever they change
  useEffect(() => {
    if (storageKey && Object.keys(quizScores).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(quizScores));
    }
  }, [quizScores, storageKey]);

  // Calculate the total points dynamically
  const totalPoints = Object.values(quizScores).reduce((sum, score) => sum + score, 0);

  const saveScore = (quizId: number, score: number) => {
    if (!user) return; // Don't save if not logged in
    
    setQuizScores(prev => {
      const currentBest = prev[quizId] || 0;
      if (score > currentBest) {
        return { ...prev, [quizId]: score };
      }
      return prev; 
    });
  };

  return (
    <ScoreContext.Provider value={{ totalPoints, saveScore, quizScores }}>
      {children}
    </ScoreContext.Provider>
  );
}

// 4. THIS EXPORT IS REQUIRED FOR THE HEADER TO WORK!
export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};