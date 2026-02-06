import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check for existing session in localStorage or similar if needed
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;