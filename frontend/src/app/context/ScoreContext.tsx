import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ScoreContextType {
  totalPoints: number;
  saveScore: (quizId: number, score: number) => void;
  quizScores: Record<number, number>;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(); 
  const user = auth?.user; 

  const [quizScores, setQuizScores] = useState<Record<number, number>>({});

  const storageKey = user?.id ? `quizScores_user_${user.id}` : null;

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      setQuizScores(saved ? JSON.parse(saved) : {});
    } else {
      setQuizScores({});
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && Object.keys(quizScores).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(quizScores));
    }
  }, [quizScores, storageKey]);

  const totalPoints = Object.values(quizScores).reduce((sum, score) => sum + score, 0);

  const saveScore = (quizId: number, score: number) => {
    if (!user) return; 
    
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

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};