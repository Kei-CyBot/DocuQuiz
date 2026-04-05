import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { LoginModal } from "../components/LoginModal";
import { useAuth } from "./context/AuthContext";

export function Root() {
  const { token, isLoading } = useAuth(); 

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {token && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          {token ? (
            <Outlet />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
               <p className="text-gray-500">Please log in using the button in the top right to view this page.</p>
            </div>
          )}
        </main>
      </div>

      <LoginModal />
    </div>
  );
}