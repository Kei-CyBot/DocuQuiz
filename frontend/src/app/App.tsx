// src/app/App.tsx
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ScoreProvider } from './context/ScoreContext'; 
import { AuthProvider } from './context/AuthContext'; 

export default function App() {
  return (
    <AuthProvider>
      <ScoreProvider>
        <RouterProvider router={router} />
      </ScoreProvider>
    </AuthProvider>
  );
}